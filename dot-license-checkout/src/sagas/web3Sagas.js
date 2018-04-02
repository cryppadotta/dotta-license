import { delay, buffers } from 'redux-saga';
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
// import Web3 from 'web3';
import Web3 from '../util/web3';

import * as Shop from '../redux/shop';
import * as Config from '../redux/config';
import * as Web3Actions from '../redux/web3';
import * as Web3Selectors from '../redux/web3';

// let _web3;

function* fetchWeb3() {
  let newWeb3 = new Web3();
  let existingProviderFound;
  let provider;

  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    // Use Mist/MetaMask's provider
    existingProviderFound = true;
    provider = web3.currentProvider;
  } else {
    // Fall back to Infura:
    existingProviderFound = false;
    let httpProviderURL = yield select(Config.getHttpProviderURL);
    provider = new Web3.providers.HttpProvider(httpProviderURL);
  }

  newWeb3.setProvider(provider);

  yield put(Web3Actions.web3Loaded(newWeb3, existingProviderFound));
  return newWeb3;
}

export function* ensureWeb3() {
  // We have to wait for the window "load" event in able to
  // read a provider from metamask etc. Ensure that has
  // happened. This happens in DockCheckoutProvider
  const windowLoaded = yield select(Web3Selectors.getWindowLoaded);
  if (!windowLoaded) {
    yield take(Web3Actions.WINDOW_LOADED);
  }

  const web3 = yield* fetchWeb3();
  return web3;
}

export function* licenseCore() {
  const web3 = yield* ensureWeb3();
  const abis = yield select(Config.getABIs);
  const licenseCoreAddress = yield select(Config.getLicenseCoreAddress);

  const contract = new web3.eth.Contract(
    abis.LicenseCore.abi,
    licenseCoreAddress
  );
  return contract;
}

export function* watchForFetchWeb3() {
  yield takeEvery(Web3Actions.ENSURE_WEB3, ensureWeb3);
}

function* fetchNetworkVersion() {
  const web3 = yield* ensureWeb3();
  const networkVersion = yield call(web3.eth.net.getId);
  yield put(Web3Actions.setWeb3NetworkVersion(networkVersion));
  return networkVersion;
}

function* watchForFetchNetworkVersion() {
  yield takeEvery(Web3Actions.FETCH_NETWORK_VERSION, fetchNetworkVersion);
}

export function* fetchAccounts() {
  const web3 = yield* ensureWeb3();
  const accounts = yield call(web3.eth.getAccounts);
  yield put(Web3Actions.setAccounts(accounts));
  return accounts;
}

export function* watchForFetchAccounts() {
  yield takeEvery(Web3Actions.FETCH_ACCOUNTS, fetchAccounts);
}

function* initializeWeb3() {
  yield put(Web3Actions.windowLoaded());
  yield* ensureWeb3();
  yield all([call(fetchNetworkVersion), call(fetchAccounts)]);
  yield put(Web3Actions.web3Initialized());
}

function* watchForInitializeWeb3() {
  yield takeEvery(Web3Actions.INITIALIZE_WEB3, initializeWeb3);
}

function* pollForUnlocked() {
  let accounts;
  do {
    accounts = yield* fetchAccounts();
    yield delay(1000);
  } while (_.isEmpty(accounts));
}

function* watchForPollForUnlocked() {
  yield takeEvery(Web3Actions.POLL_FOR_UNLOCKED, pollForUnlocked);
}

export function* pollForTxReceipt(txHash) {
  console.log('Polling for txReceipt', txHash);
  let receipt;
  do {
    // you're polling because it isn't ready, so just start by waiting
    yield delay(3000);
    const web3 = yield* ensureWeb3();
    receipt = yield call(web3.eth.getTransactionReceipt, txHash);
  } while (!receipt);
  return receipt;
}

export const sagas = [
  watchForInitializeWeb3(),
  watchForPollForUnlocked()
  // watchForFetchWeb3(),
  // watchForFetchNetworkVersion(),
  // watchForFetchAccounts()
];

export default () => sagas;
