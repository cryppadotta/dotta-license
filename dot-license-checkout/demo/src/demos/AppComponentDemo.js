import React, { Component } from 'react';
import { render } from 'react-dom';
import Helmet from 'react-helmet';
import styled from 'styled-components';
import '../../css/style.css';

import { DotCheckoutAppButton } from '../../../src';
import config from '../config';

import logo from '../../img/dottabot-cart-circle.png';
import logo2x from '../../img/dottabot-cart-circle@2x.png';

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
        <h1>DotLicenseCheckoutAppButton Demo</h1>

        <DotCheckoutAppButton
          productName={productName}
          productSubheading={productSubheading}
          offerLabel={offerLabel}
          offers={offers}
          logo={logo}
          logo2x={logo2x}
          httpProviderURL={config.httpProviderURL}
          licenseCoreAddress={config.licenseCoreAddress}
        />
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
