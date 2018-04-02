import React, { Component } from 'react';
import { render } from 'react-dom';
import DotCheckoutAppButton from './app';
import _ from 'lodash';

export const configure = configurations => {
  configurations = _.isArray(configurations)
    ? configurations
    : [configurations];

  window.addEventListener('load', () => {
    configurations.forEach(configuration => {
      const selectorValue = configuration.id ? `=${configuration.id}` : '';
      const selector = `button[data-checkout-button${selectorValue}]`;
      const targets = document.querySelectorAll(selector);
      let i = 0;

      targets.forEach(target => {
        let props = {
          productName: configuration.productName,
          productSubheading: configuration.productSubheading,
          offerLabel: configuration.offerLabel,
          offers: configuration.offers,
          logo: configuration.logo,
          logo2x: configuration.logo2x,
          httpProviderURL: configuration.httpProviderURL,
          licenseCoreAddress: configuration.licenseCoreAddress
        };
        props.defaultOffer = _.get(target, ['dataset', 'checkoutOffer']);
        props.label = target.textContent;
        props.buttonId = `${i}`;

        const Checkout = <DotCheckoutAppButton {...props} />;

        const span = document.createElement('span');
        target.parentNode.replaceChild(span, target);
        render(Checkout, span);
        i += 1;
      });
    });
  });
};

export { default as DotCheckoutAppButton } from './app';
export { dotCheckoutReducer } from './redux';
export { default as dotCheckoutSagas } from './sagas';
export { default as DotCheckoutProvider } from './DotCheckoutProvider';
export { default as DotCheckoutButton } from './components/DotCheckoutButton';

export default { configure }; // for UMD
