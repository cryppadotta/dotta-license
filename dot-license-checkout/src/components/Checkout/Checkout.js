import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';
import classnames from 'classnames';
import queryString from 'query-string';
import _ from 'lodash';
import Web3Utils from 'web3-utils';
import LaddaButton, { XL, EXPAND_RIGHT } from 'react-ladda';
const BN = Web3Utils.BN;
import 'ladda/dist/ladda-themeless.min.css';

import * as Web3 from '../../redux/web3';
import * as Config from '../../redux/config';
import * as Shop from '../../redux/shop';
import theme from '../../styles/theme';
import { FormStyles } from '../../styles/forms';
import Offers from './Offers';
import Confirmation from './Confirmation';

class Checkout extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let {
      productName,
      productSubheading,
      logo,
      logo2x,
      orderTxReceipt
    } = this.props;

    let haveReceipt = orderTxReceipt ? true : false;
    // let haveReceipt = true;
    return (
      <div className={classnames(this.props.className)}>
        <div className="header">
          <div className="logo-container">
            <img src={logo} />
          </div>
          <h2>{productName}</h2>
          <h3>{productSubheading}</h3>
        </div>
        {haveReceipt ? (
          <Confirmation {...this.props} />
        ) : (
          <Offers {...this.props} />
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { productName, productSubheading, logo, logo2x } = Config.getConfig(
    state
  );

  const networkId = Web3.getNetworkVersion(state);
  const orderTxHash = Shop.getOrderTxHash(state);
  const orderTxReceipt = Shop.getOrderTxReceipt(state);

  return {
    networkId,
    productName,
    productSubheading,
    logo,
    logo2x,
    orderTxHash,
    orderTxReceipt
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ...Shop }, dispatch);
}

Checkout = connect(mapStateToProps, mapDispatchToProps)(Checkout);

export default styled(Checkout)`
  .header {
    color: white;
    background-image: linear-gradient(163deg, #5d4092, #2d096d);
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
    text-align: center;

    h2 {
      margin-top: 0;
      margin-bottom: 0;
      padding-top: 84px;
      padding-bottom: 2px;
    }

    h3 {
      font-weight: normal;
      margin: 0;
      padding-top: 0;
      padding-bottom: 18px;
    }
  }

  .logo-container {
    margin: 0 auto;
    position: relative;
    img {
      position: absolute;
      top: -75px;
      margin: 0 auto;
      left: 62px;
    }
  }
`;
