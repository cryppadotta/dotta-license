// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';

import app from './app';
import web3 from './web3';
import config from './config';
import shop from './shop';

export default function getRootReducer() {
  let reducers = {
    app,
    web3,
    config,
    shop,
    router
  };

  return reducers;
}

export const dotCheckoutReducer = combineReducers(getRootReducer());
