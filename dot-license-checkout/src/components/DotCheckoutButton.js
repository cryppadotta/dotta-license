import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';
import classnames from 'classnames';
import queryString from 'query-string';
import _ from 'lodash';

import * as Config from '../redux/config';
import * as Shop from '../redux/shop';
import ModalMain from './ModalMain';
import { FormStyles } from '../styles/forms';

import MetamaskDetection from './Metamask/MetamaskDetection';
import Checkout from './Checkout/Checkout';
import browserShim from '../util/browser';

const MetamaskWrappedCheckout = props => (
  <MetamaskDetection {...props}>
    <Checkout {...props} />
  </MetamaskDetection>
);

class DotCheckoutButton extends Component {
  constructor(props) {
    super(props);
    this.state = { showModal: false };
    this.buyButtonClicked = this.buyButtonClicked.bind(this);
  }

  showModal() {
    this.setState((prevState, props) => ({
      ...prevState,
      showModal: true
    }));
    this.modal.show();
  }

  componentDidMount() {
    let { show } = this.props;

    // TODO -- something else should read from qs and then
    // dispatch to redux
    const buttonId = this.props.buttonId || '1';
    const qs = queryString.parse(browserShim.getLocation().search);
    const showId = _.get(qs, 'dcshow');
    if (showId == buttonId || show) {
      this.showModal();
    }
  }

  configureModal() {
    let {
      productName,
      productSubheading,
      offerLabel,
      offers,
      logo,
      logo2x,
      tosURL,
      helpURL,
      modalProps,
      licenseCoreAddress,
      httpProviderURL,
      defaultOffer
    } = this.props;

    if (defaultOffer) {
      this.props.setSelectedOfferId(defaultOffer);
    }

    let checkoutConfig = _.pickBy({
      productName,
      productSubheading,
      offerLabel,
      offers,
      logo,
      logo2x,
      tosURL,
      helpURL,
      modalProps,
      licenseCoreAddress,
      httpProviderURL,
      defaultOffer
    });

    // TODO -- this api is dumb because it doesn't respect the DotCheckoutProvider settings
    this.props.setCheckoutConfig(checkoutConfig);
  }

  buyButtonClicked(evt) {
    evt.preventDefault();
    this.configureModal();
    this.showModal();
  }

  render() {
    const { showModal } = this.state;
    let { label } = this.props;
    label = label || this.props.children || 'Buy now';
    return (
      <div className={classnames(this.props.className)}>
        <ModalMain visible={showModal} onRef={ref => (this.modal = ref)}>
          <MetamaskWrappedCheckout {...this.props} />
        </ModalMain>
        <button className="buy-button" onClick={this.buyButtonClicked}>
          {label}
        </button>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ...Shop, ...Config }, dispatch);
}

DotCheckoutButton = connect(mapStateToProps, mapDispatchToProps)(
  DotCheckoutButton
);

export default styled(DotCheckoutButton)`
  ${FormStyles};
`;
