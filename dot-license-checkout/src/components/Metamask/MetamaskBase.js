import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';
import classnames from 'classnames';

import * as Config from '../../redux/config';
import theme from '../../styles/theme';
import { FormStyles } from '../../styles/forms';
import MetamaskImg from './img/metamask.png';

class MetamaskBase extends Component {
  render() {
    let { title } = this.props;
    return (
      <div className={classnames(this.props.className)}>
        <div className="header">
          <div className="logo-container">
            <img src={MetamaskImg} />
          </div>
          <h2>{title}</h2>
          <h3 />
        </div>
        <div className="body">{this.props.children}</div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch);
}

MetamaskBase = connect(mapStateToProps, mapDispatchToProps)(MetamaskBase);

export default styled(MetamaskBase)`
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
      padding-left: 0.5em;
      padding-right: 0.5em;
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

  .body {
    padding: 1em;

    ${FormStyles};

    .required {
      text-align: center;
      padding-top: 0;
      font-size: 1.4rem;
      line-height: 1.8rem;
    }

    button.install {
      padding: 0.3em 0em;
      width: 100%;
      height: 42px;
      font-size: 1.2rem;
    }

    p.not-sure {
      line-height: 1.5rem;
      margin-bottom: 0;
    }
  }
`;
