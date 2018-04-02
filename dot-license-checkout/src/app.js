import React, { Component } from 'react';
import { Provider } from 'react-redux';
import createStore from './redux/createStore';

import DotCheckoutProvider from './DotCheckoutProvider';
import DotCheckoutButton from './components/DotCheckoutButton';
import ModalMain from './components/ModalMain';

class App extends Component {
  constructor(props) {
    super(props);
    this.store = createStore();
  }
  render() {
    return (
      <Provider store={this.store}>
        <DotCheckoutProvider {...this.props}>
          <DotCheckoutButton {...this.props} />
        </DotCheckoutProvider>
      </Provider>
    );
  }
}

export default App;
