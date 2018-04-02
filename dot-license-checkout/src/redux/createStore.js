import React, { Component } from 'react';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import createMemoryHistory from 'history/createMemoryHistory';
import createSagaMiddleware from 'redux-saga';

import * as ShopActions from './shop';
import reducers from './index';
import rootSaga from '../sagas';

export default function() {
  let middleware = [];
  let enhancers = [];

  // Create a history of your choosing (we're using a browser history in this case)
  const history = createMemoryHistory();

  // Build the middleware for intercepting and dispatching navigation actions
  const sagaMiddleware = createSagaMiddleware();
  middleware.push(sagaMiddleware);

  const actionCreators = {
    ...ShopActions
  };

  const composeEnhancers =
    typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
          // Options: http://zalmoxisus.github.io/redux-devtools-extension/API/Arguments.html
          actionCreators
        })
      : compose;

  enhancers.push(applyMiddleware(...middleware));
  const enhancer = composeEnhancers(...enhancers);

  const rootReducer = combineReducers({
    dotCheckout: combineReducers(reducers())
  });

  const initialState = {}; // load any cookies etc. here
  const store = createStore(rootReducer, initialState, enhancer);

  let theRootSaga = () => rootSaga();
  let sagaTask = sagaMiddleware.run(theRootSaga());

  return store;
}
