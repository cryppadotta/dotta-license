import React, { Component } from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Helmet from 'react-helmet';
import styled from 'styled-components';
import '../css/style.css';
import AppComponentDemo from './demos/AppComponentDemo';
import ReduxAppDemo from './demos/ReduxAppDemo';

class Demo extends Component {
  render() {
    return (
      <div className={this.props.className}>
        <Helmet>
          <link
            href="https://fonts.googleapis.com/css?family=Roboto:400,700|Roboto+Mono:400,700"
            rel="stylesheet"
          />
        </Helmet>
        <Router>
          <div>
            <h1>DotLicenseCheckout Demo</h1>
            <ul>
              <li>
                <Link to="/app">App Button Component Demo</Link>
              </li>
              <li>
                <Link to="/redux">Redux Component Demo</Link>
              </li>
            </ul>
            <Route path="/app" component={AppComponentDemo} />
            <Route path="/redux" component={ReduxAppDemo} />
          </div>
        </Router>
      </div>
    );
  }
}

Demo = styled(Demo)`
  padding: 1em;
  font-family: 'Roboto', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif,
    'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';

  > h1 {
    color: rgba(0, 0, 0, 0.5);
    text-align: center;
  }
`;

render(<Demo />, document.querySelector('#demo'));
