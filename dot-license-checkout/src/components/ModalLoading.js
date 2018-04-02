import React, { Component } from 'react';
import styled from 'styled-components';
import classnames from 'classnames';

const ModalLoading = props => {
  return (
    <div className={classnames(props.className)}>
      <div className="header">
        <div className="logo-container" />
        <h2>Loading...</h2>
        <h3 />
      </div>
      <div className="body">{}</div>
    </div>
  );
};

export default styled(ModalLoading)`
  text-align: center;
`;
