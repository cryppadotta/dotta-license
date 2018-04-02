import { delay } from 'redux-saga';
import { call, put, takeEvery } from 'redux-saga/effects';
import shopSagas from './shopSagas';
import web3Sagas from './web3Sagas';

function* rootSaga() {
  yield [...shopSagas(), ...web3Sagas()];
}

export default function init() {
  return rootSaga;
}
