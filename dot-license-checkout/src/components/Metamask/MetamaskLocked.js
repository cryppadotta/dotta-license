import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';
import classnames from 'classnames';

import * as Config from '../../redux/config';
import * as Web3 from '../../redux/web3';
import MetamaskBase from './MetamaskBase';

class MetamaskLocked extends Component {
  componentDidMount() {
    this.props.pollForUnlocked();
  }
  render() {
    let { productName } = this.props;
    return (
      <MetamaskBase title="Unlock Metamask to Pay">
        <p className="required">
          Your Metamask is currently <b>locked</b>
        </p>

        <p>Please unlock Metamask to continue.</p>

        <p className="not-sure">
          Still not sure what to do?<br />{' '}
          <a href={props.helpURL} target="_blank" rel="external">
            Read the FAQ
          </a>
        </p>
      </MetamaskBase>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ...Web3 }, dispatch);
}

MetamaskLocked = connect(mapStateToProps, mapDispatchToProps)(MetamaskLocked);

export default styled(MetamaskLocked)``;
