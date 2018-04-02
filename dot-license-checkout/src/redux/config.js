import _ from 'lodash';
import { createSelector } from 'reselect';
import dotProp from 'dot-prop-immutable';
import getRoot from './root';

// Actions
export const SET_CHECKOUT_CONFIG = 'dotcheckout/config/SET_CHECKOUT_CONFIG';
export function setCheckoutConfig(config) {
  return {
    type: SET_CHECKOUT_CONFIG,
    payload: config
  };
}
// Selectors
export const getConfig = createSelector(getRoot, state => state.config);
export const getProductName = createSelector(
  getConfig,
  config => config.productName
);
export const getProductSubheading = createSelector(
  getConfig,
  config => config.productSubheading
);
export const getOfferLabel = createSelector(
  getConfig,
  config => config.offerLabel
);
export const getOffers = createSelector(getConfig, config => config.offers);
export const getLogo = createSelector(getConfig, config => config.logo);
export const getLogo2x = createSelector(getConfig, config => config.logo2x);
export const getTosURL = createSelector(getConfig, config => config.tosURL);
export const getHelpURL = createSelector(getConfig, config => config.helpURL);
export const getVanityAddressPrefix = createSelector(
  getConfig,
  config => config.vanityAddressPrefix
);
export const getModalProps = createSelector(
  getConfig,
  config => config.modalProps
);
export const getLicenseCoreAddress = createSelector(
  getConfig,
  config => config.licenseCoreAddress
);
export const getHttpProviderURL = createSelector(
  getConfig,
  config => config.httpProviderURL
);
export const getABIs = createSelector(getConfig, config => config.abis);

// Reducer
const initialState = {
  productName: null,
  productSubheading: null,
  offerLabel: null,
  offers: [],
  logo: null,
  logo2x: null,
  tosURL: null,
  helpURL: null,
  modalProps: {},
  vanityAddressPrefix: null,
  licenseCoreAddress: null,
  httpProviderURL: null,
  abis: {}
};

export default function config(state = initialState, action) {
  switch (action.type) {
    case SET_CHECKOUT_CONFIG: {
      const config = action.payload;
      return {
        ...state,
        ...config
      };
    }
    default:
      return state;
  }
}
