import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Rodal from 'rodal';
import 'rodal/lib/rodal.css';
import styled from 'styled-components';
import classnames from 'classnames';

class ModalMain extends Component {
  constructor(props) {
    super(props);
    this.state = { visible: props.visible ? props.visible : false };
  }

  componentDidMount() {
    this.props.onRef(this);
  }
  componentWillUnmount() {
    this.props.onRef(undefined);
  }

  show() {
    this.setState({ visible: true });
  }

  hide() {
    this.setState({ visible: false });
  }

  render() {
    let { modalProps } = this.context;

    const modalStyle = {
      height: 'auto',
      bottom: 'auto',
      top: '50%',
      transform: 'translateY(-50%)',
      borderRadius: '6px',
      backgroundColor: '#f5f5f6',
      boxShadow:
        '0 12px 30px 0 rgba(0,0,0,.5), inset 0 1px 0 0 hsla(0,0%,100%,.65)',
      backfaceVisibility: 'hidden'
    };

    return (
      <Rodal
        className={classnames(this.props.className)}
        visible={this.state.visible}
        onClose={this.hide.bind(this)}
        closeMaskOnClick={false}
        width={270}
        customStyles={modalStyle}
        {...modalProps}
      >
        {this.props.children}
      </Rodal>
    );
  }
}

ModalMain.contextTypes = {
  modalProps: PropTypes.any
};

export default styled(ModalMain)`
  .rodal-dialog {
    padding: 0;
  }
`;
