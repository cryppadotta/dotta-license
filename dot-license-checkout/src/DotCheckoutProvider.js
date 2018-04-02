import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
// import Web3 from 'web3';
import Web3 from './util/web3';
import Web3Utils from 'web3-utils';
import _ from 'lodash';
import Cookies from 'universal-cookie';
import queryString from 'query-string';

import * as Web3Actions from './redux/web3';
import * as ConfigActions from './redux/config';
import builtinRawCombinedABI from './dot-license.abi.json';
import browserShim from './util/browser';

class DotCheckoutProvider extends Component {
  constructor(props) {
    super(props);
    this.cookies = new Cookies();
  }
  componentDidMount() {
    let {
      productName,
      productSubheading,
      offerLabel,
      offers,
      logo,
      logo2x,
      tosURL,
      helpURL,
      vanityAddressPrefix,
      modalProps,
      licenseCoreAddress,
      httpProviderURL,
      defaultOffer
    } = this.props;

    const abis = _.reduce(
      builtinRawCombinedABI.contracts,
      (acc, attributes, rawName) => {
        if (attributes.abi) {
          let name = rawName.split(':')[1];
          acc[name] = {
            abi: JSON.parse(attributes.abi),
            devdoc: JSON.parse(attributes.devdoc),
            userdoc: JSON.parse(attributes.userdoc)
          };
        }
        return acc;
      },
      {}
    );

    this.props.setCheckoutConfig({
      productName,
      productSubheading,
      offerLabel,
      offers,
      logo,
      logo2x,
      tosURL,
      helpURL,
      vanityAddressPrefix,
      modalProps,
      licenseCoreAddress,
      httpProviderURL,
      defaultOffer,
      abis
    });

    if (document.readyState == 'complete') {
      this.props.initializeWeb3();
    } else {
      window.addEventListener('load', () => {
        this.props.initializeWeb3();
      });
    }
  }

  componentWillMount() {
    this.setExternalAssignee();
    this.setExternalAffiliate();
  }

  /*
   * Sets the value to be used for an assignee in context.
   *
   * Assignee's should prioritize the query string over the cookie. (See
   * affiliate for differences.) However, if there is no query string, then just
   * use the cookie. The idea here is that someone might visit once and then
   * come back later to buy, and so we want to make that as easy as possible.
   */
  setExternalAssignee() {
    const qs = queryString.parse(browserShim.getLocation().search);
    const assignee = _.get(qs, 'assignee');

    const ASSIGNEE = 'assignee';

    // if we have an assignee in the querystring, then set it
    if (assignee && Web3Utils.isAddress(assignee)) {
      this.cookies.set(ASSIGNEE, assignee, { path: '/' });
      this.assignee = assignee;
      return;
    }

    const assigneeInCookie = this.cookies.get(ASSIGNEE);

    if (assigneeInCookie && Web3Utils.isAddress(assigneeInCookie)) {
      this.assignee = assigneeInCookie;
      return;
    }
  }

  /*
   * Sets the value to be usd for an affiliate in context.
   *
   * The affiliate should prioritize any previous cookie! This is different from assignee, which takes the most recent query string.
   *
   * Instead here, we give the *earliest* affiliate credit for this sale, regardless of if there is a new query string parameter.
   *
   */
  setExternalAffiliate() {
    const AFFILIATE = 'affiliate';

    const affiliateInCookie = this.cookies.get(AFFILIATE);
    if (affiliateInCookie && Web3Utils.isAddress(affiliateInCookie)) {
      this.affiliate = affiliateInCookie;
      return;
    }

    const qs = queryString.parse(browserShim.getLocation().search);
    const affiliateInQS = _.get(qs, 'affiliate');

    // if we have an assignee in the querystring, then set it
    if (affiliateInQS && Web3Utils.isAddress(affiliateInQS)) {
      this.cookies.set(AFFILIATE, affiliateInQS, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });
      this.affiliate = affiliateInQS;
      return;
    }
  }

  getChildContext() {
    let { modalProps } = this.props;

    return {
      modalProps,
      cookies: this.cookies,
      affiliate: this.affiliate,
      assignee: this.assignee
    };
  }

  render() {
    return <div>{this.props.children}</div>;
  }
}

DotCheckoutProvider.childContextTypes = {
  modalProps: PropTypes.any,
  cookies: PropTypes.any,
  affiliate: PropTypes.string,
  assignee: PropTypes.string
};

function mapStateToProps(state) {
  return {};
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ ...Web3Actions, ...ConfigActions }, dispatch);
}

DotCheckoutProvider = connect(mapStateToProps, mapDispatchToProps)(
  DotCheckoutProvider
);

export default DotCheckoutProvider;
