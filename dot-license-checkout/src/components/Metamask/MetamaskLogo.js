import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import classnames from 'classnames';
import ModelViewer from 'metamask-logo';

class MetamaskLogo extends Component {
  componentDidMount() {
    this.viewer = ModelViewer({
      pxNotRatio: true,
      width: 200,
      height: 200,
      followMouse: false
    });
    this.el.appendChild(this.viewer.container);
  }

  componentWillUnmount() {
    this.viewer.stopAnimation();
  }

  render() {
    return (
      <div
        className={classnames(this.props.className)}
        ref={el => (this.el = el)}
      />
    );
  }
}

export default styled(MetamaskLogo)``;
