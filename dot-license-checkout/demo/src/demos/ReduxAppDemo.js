// npm dependencies
import React, { Component } from 'react';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import { render } from 'react-dom';
import createSagaMiddleware from 'redux-saga';
import Helmet from 'react-helmet';
import styled from 'styled-components';

// local demo-specific dependencies
import '../../css/style.css';
import config from '../config';
import logo from '../../img/dottabot-cart-circle.png';
import logo2x from '../../img/dottabot-cart-circle@2x.png';

// DotLicense imports
import {
  dotCheckoutReducer as dotCheckout,
  dotCheckoutSagas,
  DotCheckoutProvider,
  DotCheckoutButton
} from '../../../src';

function createReduxStore() {
  // e.g. your reducers
  const counter = (state = 0, action) => {
    switch (action.type) {
      case 'INCREMENT':
        return state + 1;
      default:
        return state;
    }
  };

  // This adds sagas with redux devtools
  const composeEnhancers =
    typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
      : compose;
  const sagaMiddleware = createSagaMiddleware();

  const store = createStore(
    combineReducers({
      counter,
      dotCheckout
    }),
    composeEnhancers(applyMiddleware(sagaMiddleware))
  );

  // run our sagas
  sagaMiddleware.run(dotCheckoutSagas());
  return store;
}

const store = createReduxStore();

// Now configure the store properties
const ONE_DAY = 60 * 60 * 24;
const ONE_MONTH = ONE_DAY * 30;
const ONE_YEAR = ONE_MONTH * 12;

let offers = [
  {
    id: '1', // client-side id for e.g. forms
    productId: '3',
    duration: ONE_MONTH,
    name: '1 month'
  },
  {
    id: '3', // client-side id for e.g. forms
    productId: '3',
    duration: ONE_MONTH * 3,
    name: '3 months'
  },
  {
    id: '12',
    productId: '3',
    duration: ONE_YEAR,
    name: '12 months'
  },
  {
    id: '24',
    productId: '4',
    duration: ONE_YEAR * 2,
    name: '24 months'
  }
];

let productName = 'Dottabot';
let productSubheading = 'Unlimited License';
let offerLabel = 'Subscription length';

class Demo extends Component {
  render() {
    return (
      <div className={this.props.className}>
        <Helmet>
          <link
            href="https://fonts.googleapis.com/css?family=Roboto:400,700|Roboto+Mono:400,700"
            rel="stylesheet"
          />
        </Helmet>
        <h1>DotLicenseCheckout with Redux Demo</h1>
        <Provider store={store}>
          <DotCheckoutProvider
            productName={productName}
            offerLabel={offerLabel}
            offers={offers}
            logo={logo}
            logo2x={logo2x}
            vanityAddressPrefix={'db'}
            httpProviderURL={config.httpProviderURL}
            licenseCoreAddress={config.licenseCoreAddress}
            tosURL="/tos"
            helpURL="/what-is-a-dottabot-address"
          >
            <DotCheckoutButton
              productSubheading={productSubheading}
              defaultOffer="1"
            >
              Buy 1 month
            </DotCheckoutButton>
            <br />
            <DotCheckoutButton
              productSubheading="Ultimate Dottabot Package"
              defaultOffer="12"
            >
              Buy 12 months
            </DotCheckoutButton>
          </DotCheckoutProvider>
        </Provider>
      </div>
    );
  }
}

Demo = styled(Demo)`
  padding: 1em;
  font-family: 'Roboto', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif,
    'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';

  > h1 {
    color: rgba(0, 0, 0, 0.5);
    text-align: center;
  }
`;

export default Demo;
