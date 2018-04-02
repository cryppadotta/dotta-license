import { delay, buffers, eventChannel, END } from 'redux-saga';
import {
  call,
  put,
  select,
  take,
  takeEvery,
  all,
  actionChannel
} from 'redux-saga/effects';
import _ from 'lodash';
import * as Config from '../redux/config';
import * as Shop from '../redux/shop';
import * as Web3 from '../redux/web3';
import * as Web3Sagas from './web3Sagas';
import Web3Utils from 'web3-utils';
const BN = Web3Utils.BN;

function* fetchProductInfos(productIds) {
  const fetchProductInfoSagas = _.map(productIds, id => fetchProductInfo(id));
  const allInfos = yield all(fetchProductInfoSagas);
  return allInfos;
}

function* fetchProductInfo(productId) {
  const contract = yield* Web3Sagas.licenseCore();
  let results = yield call(contract.methods.productInfo(productId).call);
  let productInfo = {
    id: productId,
    price: results[0],
    inventory: results[1],
    supply: results[2],
    interval: results[3],
    renewable: results[4]
  };
  yield put(Shop.setProductInfo(productInfo));
  return results;
}

function* web3Initialized() {
  const offers = yield select(Config.getOffers);
  const productIds = _.uniq(_.map(offers, offer => offer.productId));
  yield fetchProductInfos(productIds);
  yield put(Shop.shopInitialized());
}

export function* watchForWeb3Initialized() {
  yield takeEvery(Web3.WEB3_INITIALIZED, web3Initialized);
}

// see: https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#methods-mymethod-send
// and: https://github.com/redux-saga/redux-saga/blob/master/docs/advanced/Channels.md#using-the-eventchannel-factory-to-connect-to-external-events

// This function creates an event channel for sending a method
function createWeb3SendChannel(sendMethod, sendArgs) {
  // `eventChannel` takes a subscriber function
  // the subscriber function takes an `emit` argument to put messages onto the channel
  return eventChannel(emit => {
    const transactionHashHandler = txHash => {
      console.log('transactionhash', txHash);
      emit({ event: 'transactionHash', payload: { txHash } });
    };

    const receiptHandler = receipt => {
      console.log('receipt', receipt);
      emit({ event: 'receipt', payload: { receipt } });
    };

    const confirmationHandler = (confirmations, receipt) => {
      console.log('confirmation', confirmations, receipt);
      emit({ event: 'confirmation', payload: { confirmations, receipt } });
    };

    const errorHandler = error => {
      console.log('error', error);
      emit({ event: 'error', payload: { error } });
    };

    const promiEvent = sendMethod(sendArgs);
    promiEvent.on('transactionHash', transactionHashHandler);
    promiEvent.on('receipt', receiptHandler);
    promiEvent.on('confirmation', confirmationHandler);
    promiEvent.on('error', confirmationHandler);

    // the subscriber must return an unsubscribe function
    // this will be invoked when the saga calls `channel.close` method
    const unsubscribe = () => {
      promiEvent.off('transactionHash', transactionHashHandler);
      promiEvent.off('receipt', receiptHandler);
      promiEvent.off('confirmation', confirmationHandler);
      promiEvent.off('error', confirmationHandler);
    };

    return unsubscribe;
  });
}

function* placeOrder(action) {
  let { productId, numCycles, assignee, affiliate, wei } = action.payload;
  try {
    const contract = yield* Web3Sagas.licenseCore();
    const accounts = yield* Web3Sagas.fetchAccounts();
    const account = accounts[0];

    const affiliateIsAddress = Web3Utils.isAddress(affiliate);
    affiliate = affiliateIsAddress ? affiliate : 0;

    yield put(
      Shop.setPlacingOrderMessage('Please confirm the transaction in Metamask')
    );

    const sendChannel = yield call(
      createWeb3SendChannel,
      contract.methods.purchase(productId, numCycles, assignee, affiliate).send,
      {
        value: wei,
        from: account,
        gasLimit: 400000
      }
    );

    let continueProcessing = true;
    let _receipt;
    let _txHash;

    while (continueProcessing) {
      const event = yield take(sendChannel);
      switch (event.event) {
        // Generally we receive a transaction hash right away. We want to update
        // the user that we are processing the order, as well as expose this
        // txHash so that it can be tracked on e.g. etherscan
        case 'transactionHash': {
          const { txHash } = event.payload;
          yield put(
            Shop.setPlacingOrderMessage(
              'Placing order. This can take a few minutes, please wait.'
            )
          );
          yield put(Shop.receivedOrderTxHash(txHash));
          break;
        }

        // If we receive a receipt, great! Our transaction was mined and we can
        // deal with whatever the outcome was
        case 'receipt': {
          const { receipt } = event.payload;
          _receipt = receipt;
          yield put(Shop.receivedOrderTxReceipt(receipt));
          break;
        }

        // If we receive a 'confirmation' event, this is the most complicated,
        // becuase for whatever reason, errors can come through on this event,
        // so we need to deal with those too
        case 'confirmation': {
          const { confirmations, receipt } = event.payload;

          // I'm not sure why, but rejecting the transaction in Metamask
          // emits a "confirmation" event
          if (_.isError(confirmations)) {
            // If we haven't mined the block fast enough, this is a special case
            // where we want to actually poll the txHash instead of throwing an
            // error
            if (
              confirmations.message.match(
                'Transaction was not mined within 50 blocks,'
              )
            ) {
              let txHash = yield select(Shop.getOrderTxHash);
              if (txHash) {
                yield put(
                  Shop.setPlacingOrderMessage(
                    'Order still processing. Hang on and do not close this browser window. This can take a few minutes, please wait.'
                  )
                );
                yield put(Shop.pollForTxProcessing(txHash));

                // close that we're not going to watch this channel any longer
                sendChannel.close();
                continueProcessing = false;
              } else {
                // if we don't have a txHash yet, we're simply in trouble
                throw confirmations;
              }
            } else {
              // that is, "confirmations" is actually an error object, and we just want to throw it
              throw confirmations;
            }
          } else {
            _receipt = receipt;
            yield put(Shop.receivedOrderTxReceipt(receipt));
            yield put(Shop.receivedOrderTxConfirmation(confirmations, receipt));
            if (confirmations > 0) {
              // kill the sendChannel
              sendChannel.close();
              continueProcessing = false;
            }
          }
          break;
        }
        case 'error': {
          console.log('got a channel error', event);
          sendChannel.close();
          continueProcessing = false;
          throw event;
          break;
        }
      }

      // timeout here?
    }

    if (_receipt) {
      yield put(Shop.placingOrderResults(_receipt, null));
    }
  } catch (err) {
    console.log(err);
    yield put(Web3.web3Error(err.message, err));
    yield put(Shop.placingOrderResults(null, err));
  }
}

export function* watchForPlaceOrder() {
  yield takeEvery(Shop.PLACE_ORDER, placeOrder);
}

function* pollForTxProcessing(action) {
  let { txHash } = action.payload;
  const receipt = yield* Web3Sagas.pollForTxReceipt(txHash);
  yield put(Shop.receivedOrderTxReceipt(receipt));
}

export function* watchForPollForTxProcessing() {
  yield takeEvery(Shop.POLL_FOR_TX_PROCESSING, pollForTxProcessing);
}

export const sagas = [
  watchForWeb3Initialized(),
  watchForPlaceOrder(),
  watchForPollForTxProcessing()
];

export default () => sagas;
