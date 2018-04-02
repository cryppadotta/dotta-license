import _ from 'lodash';
import { createSelector } from 'reselect';
import dotProp from 'dot-prop-immutable';
import getRoot from './root';

// Actions
export const INITIALIZE_WEB3 = 'dotcheckout/web3/INITIALIZE_WEB3';
export function initializeWeb3() {
  return {
    type: INITIALIZE_WEB3
  };
}
export const WEB3_INITIALIZED = 'dotcheckout/web3/WEB3_INITIALIZED';
export function web3Initialized() {
  return {
    type: WEB3_INITIALIZED
  };
}

export const FETCH_WEB3 = 'dotcheckout/web3/FETCH_WEB3';
export function fetchWeb3() {
  return {
    type: FETCH_WEB3,
    payload: {
      loading: true
    }
  };
}

export const ENSURE_WEB3 = 'dotcheckout/web3/ENSURE_WEB3';
export function ensureWeb3() {
  return {
    type: ENSURE_WEB3
  };
}

export const WINDOW_LOADED = 'dotcheckout/web3/WINDOW_LOADED';
export function windowLoaded() {
  return {
    type: WINDOW_LOADED
  };
}

export const WEB3_LOADED = 'dotcheckout/web3/WEB3_LOADED';
export function web3Loaded(web3, providerWasFound) {
  return {
    type: WEB3_LOADED,
    payload: {
      loading: false,
      web3,
      providerFound: providerWasFound
    }
  };
}

export const SET_WEB3_PROVIDER_FOUND =
  'dotcheckout/web3/SET_WEB3_PROVIDER_FOUND';
export function setWeb3ProviderFound(wasFound) {
  return {
    type: SET_WEB3_PROVIDER_FOUND,
    payload: {
      providerFound: wasFound
    }
  };
}
export const SET_WEB3_NETWORK_VERSION =
  'dotcheckout/web3/SET_WEB3_NETWORK_VERSION';
export function setWeb3NetworkVersion(v) {
  return {
    type: SET_WEB3_NETWORK_VERSION,
    payload: {
      networkVersion: v
    }
  };
}

export const FETCH_NETWORK_VERSION = 'dotcheckout/web3/FETCH_NETWORK_VERSION';
export function fetchNetworkVersion() {
  return {
    type: FETCH_NETWORK_VERSION
  };
}

export const INCREMENT_NONCE = 'dotcheckout/web3/INCREMENT_NONCE';
export function incrementNonce() {
  return {
    type: INCREMENT_NONCE
  };
}

export const FETCH_ACCOUNTS = 'dotcheckout/web3/FETCH_ACCOUNTS';
export function fetchAccounts() {
  return {
    type: FETCH_ACCOUNTS
  };
}

export const SET_ACCOUNTS = 'dotcheckout/web3/SET_ACCOUNTS';
export function setAccounts(accounts) {
  return {
    type: SET_ACCOUNTS,
    payload: {
      accounts
    }
  };
}

export const POLL_FOR_UNLOCKED = 'dotcheckout/web3/POLL_FOR_UNLOCKED';
export function pollForUnlocked() {
  return {
    type: POLL_FOR_UNLOCKED
  };
}

export const WEB3_ERROR = 'dotcheckout/web3/WEB3_ERROR';
export function web3Error(message, error) {
  return {
    type: WEB3_ERROR,
    payload: {
      message,
      error
    }
  };
}

// Selectors
export const getWeb3State = createSelector(getRoot, state => state.web3);
export const getWeb3 = createSelector(getWeb3State, state => state.web3);
export const getWindowLoaded = createSelector(
  getWeb3State,
  state => state.windowLoaded
);
export const getProviderFound = createSelector(
  getWeb3State,
  state => state.providerFound
);
export const getNetworkVersion = createSelector(
  getWeb3State,
  state => state.networkVersion
);
export const getAccounts = createSelector(
  getWeb3State,
  state => state.accounts
);

// Reducer
const initialState = {
  windowLoaded: false,
  loading: true,
  web3: null,
  web3Initialized: false,
  providerFound: false,
  nonce: 0,
  networkVersion: null,
  accounts: []
};

export default function web3(state = initialState, action) {
  switch (action.type) {
    case FETCH_WEB3: {
      const { loading } = action.payload;
      return {
        ...state,
        loading
      };
    }
    case WEB3_INITIALIZED: {
      return {
        ...state,
        web3Initialized: true
      };
    }
    case WINDOW_LOADED: {
      return {
        ...state,
        windowLoaded: true
      };
    }
    case WEB3_LOADED: {
      const { loading, web3, providerFound } = action.payload;
      return {
        ...state,
        loading,
        web3,
        providerFound
      };
    }
    case SET_WEB3_PROVIDER_FOUND: {
      const { providerFound } = action.payload;
      return {
        ...state,
        providerFound
      };
    }
    case SET_WEB3_NETWORK_VERSION: {
      const { networkVersion } = action.payload;
      return {
        ...state,
        networkVersion
      };
    }
    case INCREMENT_NONCE: {
      return {
        ...state,
        nonce: state.nonce + 1
      };
    }
    case SET_ACCOUNTS: {
      let { accounts } = action.payload;
      return {
        ...state,
        accounts
      };
    }
    default:
      return state;
  }
}
