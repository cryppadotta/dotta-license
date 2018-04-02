import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router';
import { push } from 'react-router-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';
import classnames from 'classnames';
import _ from 'lodash';

import * as Shop from '../../redux/shop';
import * as Config from '../../redux/config';
import * as Web3 from '../../redux/web3';
import networkToName from '../../util/networkToName';

import ModalLoading from '../ModalLoading';
import MetamaskLocked from './MetamaskLocked';
import MetamaskBase from './MetamaskBase';

export const MetamaskRequired = props => {
  let { productName } = props;
  return (
    <MetamaskBase title="Metamask Required">
      <p className="required">Metamask is required to buy {productName}.</p>

      <a
        className="btn install"
        href="https://metamask.io/"
        target="_blank"
        rel="external"
      >
        Install Metamask
      </a>

      <button className="install">Install Metamask</button>
      <p className="not-sure">
        Still not sure what to do?<br />{' '}
        <a href={props.helpURL} target="_blank" rel="external">
          Read the FAQ
        </a>
      </p>
    </MetamaskBase>
  );
};

export const MetamaskWrongNetwork = props => {
  let { networkName } = props;
  return (
    <MetamaskBase title="Main Network Required">
      <p className="required">Your Metamask is on the {networkName} network</p>

      <p>Please switch to the "Main Ethereum Network"</p>
    </MetamaskBase>
  );
};

class MetamaskDetection extends Component {
  render() {
    const {
      accounts,
      shopInitialized,
      productName,
      networkName,
      providerFound
    } = this.props;

    const needInitialized = !shopInitialized;
    const needMetamask = !providerFound;
    const needUnlocked = _.isEmpty(accounts);
    const allowedNetworks = ['mainnet', 'rinkeby'];
    const onTheRightNetwork = _.includes(allowedNetworks, networkName);
    const needToChangeNetworks = !onTheRightNetwork;

    return needInitialized ? (
      <ModalLoading />
    ) : needMetamask ? (
      <MetamaskRequired {...this.props} />
    ) : needToChangeNetworks ? (
      <MetamaskWrongNetwork {...this.props} />
    ) : needUnlocked ? (
      <MetamaskLocked {...this.props} />
    ) : (
      this.props.children
    );
  }
}

function mapStateToProps(state) {
  return {
    shopInitialized: Shop.getInitialized(state),
    accounts: Web3.getAccounts(state),
    productName: Config.getProductName(state),
    providerFound: Web3.getProviderFound(state),
    networkVersion: Web3.getNetworkVersion(state),
    networkName: networkToName(Web3.getNetworkVersion(state))
  };
}

function mapDispatchToProps(dispatch) {
  return {};
}

MetamaskDetection = connect(mapStateToProps, mapDispatchToProps)(
  MetamaskDetection
);

export default styled(MetamaskDetection)``;
