import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import classnames from 'classnames';

class Home extends Component {
  render() {
    return (
      <div className={classnames(this.props.className)}>
        <h2>Welcome to the Home</h2>
        <Link to="/">Home 1</Link>
        <Link to="/offers">Offers</Link>
        <Link to="/metamask">Metamask</Link>
      </div>
    );
  }
}

export default styled(Home)``;
