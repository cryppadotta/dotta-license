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
import etherscanLink from '../../vendor/etherscan-link';
import LaddaButton, { XL, EXPAND_RIGHT } from 'react-ladda';
const BN = Web3Utils.BN;
import 'ladda/dist/ladda-themeless.min.css';

import * as Web3 from '../../redux/web3';
import * as Config from '../../redux/config';
import * as Shop from '../../redux/shop';
import theme from '../../styles/theme';
import { FormStyles } from '../../styles/forms';

class Confirmation extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let {
      orderTxHash,
      orderTxReceipt,
      networkId,
      transactionError,
      productName
    } = this.props;

    const txHash = orderTxHash || orderTxReceipt.transactionHash;

    const transactionUrl = etherscanLink.createExplorerLink(txHash, networkId);

    const errorView = (
      <div className="errorView">
        <h2>There was a problem</h2>{' '}
        <p>Unfortunately, it appears that your transaction did not succeed.</p>
        <p>
          View the transaction{' '}
          <a href={transactionUrl} target="_blank" rel="external">
            by clicking here
          </a>. <b>Save this URL.</b>
        </p>
        <p className="not-sure">
          Still not sure what to do?<br /> Read the FAQ
        </p>
      </div>
    );

    const successView = (
      <div className="successView">
        <h2>Success!</h2> <p>Your order number is:</p>
        <div className="orderNumber">
          <a href={transactionUrl} target="_blank" rel="external">
            {txHash}
          </a>.
        </div>
        <p>
          <b>Save this order number.</b>
        </p>
        <p>
          Now <b>open {productName}</b> and the purchase should be automatically
          activated.
        </p>
        <p className="not-sure">
          Still not sure what to do?<br /> Read the FAQ
        </p>
      </div>
    );

    return (
      <div
        className={classnames(
          this.props.className,
          transactionError ? 'error' : null
        )}
      >
        {transactionError ? errorView : successView}
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { productName } = Config.getConfig(state);
  const networkId = Web3.getNetworkVersion(state);
  const orderTxHash = Shop.getOrderTxHash(state);
  const orderTxReceipt = Shop.getOrderTxReceipt(state);

  const status = orderTxReceipt.status;

  const transactionError = status === '0x0' || status === 0 ? true : false;

  return {
    productName,
    networkId,
    orderTxHash,
    orderTxReceipt,
    transactionError
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ...Shop }, dispatch);
}

Confirmation = connect(mapStateToProps, mapDispatchToProps)(Confirmation);

export default styled(Confirmation)`
  padding: 1em;
  h2 {
    font-size: 2.5em;
    margin: 0;
    text-align: center;
  }
  &.error {
    background-color: #ffcccc;
    .errorView {
      background-color: white;
      border-radius: 5px;
      padding: 0.1em 0.5em;
    }
  }

  .orderNumber {
    background-color: #d8d8d8;
    padding: 0.4em;
    a {
      font-family: monospace;
      overflow-wrap: break-word;
      text-decoration: none;
      color: #381774;

      &:hover {
        text-decoration: underline;
      }
    }
  }
`;
