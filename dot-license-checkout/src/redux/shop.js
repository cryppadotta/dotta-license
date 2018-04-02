import _ from 'lodash';
import { createSelector } from 'reselect';
import dotProp from 'dot-prop-immutable';
import getRoot from './root';

// Actions
export const FETCH_PRODUCTS = 'dotcheckout/shop/FETCH_PRODUCTS';
export function fetchProducts() {
  return {
    type: FETCH_PRODUCTS
  };
}

export const SHOP_INITIALIZED = 'dotcheckout/shop/SHOP_INITIALIZED';
export function shopInitialized() {
  return {
    type: SHOP_INITIALIZED
  };
}

export const SET_PRODUCT_INFO = 'dotcheckout/shop/SET_PRODUCT_INFO';
export function setProductInfo(productInfo) {
  return {
    type: SET_PRODUCT_INFO,
    payload: {
      productInfo
    }
  };
}

export const PLACE_ORDER = 'dotcheckout/shop/PLACE_ORDER';
export function placeOrder(productId, numCycles, assignee, affiliate, wei) {
  return {
    type: PLACE_ORDER,
    payload: {
      productId,
      numCycles,
      assignee,
      affiliate,
      wei
    }
  };
}

export const PLACING_ORDER_RESULTS = 'dotcheckout/shop/PLACING_ORDER_RESULTS';
export function placingOrderResults(placedOrder, error) {
  return {
    type: PLACING_ORDER_RESULTS,
    payload: {
      placedOrder,
      error
    }
  };
}

export const SET_PLACING_ORDER_MESSAGE =
  'dotcheckout/shop/SET_PLACING_ORDER_MESSAGE';
export function setPlacingOrderMessage(placingOrderMessage) {
  return {
    type: SET_PLACING_ORDER_MESSAGE,
    payload: {
      placingOrderMessage
    }
  };
}

export const RECEIVED_ORDER_TX_HASH = 'dotcheckout/shop/RECEIVED_ORDER_TX_HASH';
export function receivedOrderTxHash(orderTxHash) {
  return {
    type: RECEIVED_ORDER_TX_HASH,
    payload: {
      orderTxHash
    }
  };
}

export const RECEIVED_ORDER_TX_RECEIPT =
  'dotcheckout/shop/RECEIVED_ORDER_TX_RECEIPT';
export function receivedOrderTxReceipt(orderTxReceipt) {
  return {
    type: RECEIVED_ORDER_TX_RECEIPT,
    payload: {
      orderTxReceipt
    }
  };
}

export const RECEIVED_ORDER_TX_CONFIRMATION =
  'dotcheckout/shop/RECEIVED_ORDER_TX_CONFIRMATION';
export function receivedOrderTxConfirmation(
  confirmationNumber,
  orderTxReceipt
) {
  return {
    type: RECEIVED_ORDER_TX_CONFIRMATION,
    payload: {
      confirmationNumber,
      orderTxReceipt
    }
  };
}

export const POLL_FOR_TX_PROCESSING = 'dotcheckout/shop/POLL_FOR_TX_PROCESSING';
export function pollForTxProcessing(txHash) {
  return {
    type: POLL_FOR_TX_PROCESSING,
    payload: {
      txHash
    }
  };
}

export const SET_SELECTED_OFFER_ID = 'dotcheckout/shop/SET_SELECTED_OFFER_ID';
export function setSelectedOfferId(selectedOfferId) {
  return {
    type: SET_SELECTED_OFFER_ID,
    payload: {
      selectedOfferId
    }
  };
}

// Selectors
export const getStore = createSelector(getRoot, state => state.shop);
export const getProducts = createSelector(getStore, state => state.products);
export const getInitialized = createSelector(
  getStore,
  state => state.initialized
);
export const getPlacingOrder = createSelector(
  getStore,
  state => state.placingOrder
);
export const getPlacedOrder = createSelector(
  getStore,
  state => state.placedOrder
);
export const getPlacingOrderError = createSelector(
  getStore,
  state => state.placingOrderError
);
export const getPlacingOrderMessage = createSelector(
  getStore,
  state => state.placingOrderMessage
);
export const getOrderTxHash = createSelector(
  getStore,
  state => state.orderTxHash
);
export const getOrderTxReceipt = createSelector(
  getStore,
  state => state.orderTxReceipt
);
export const getSelectedOfferId = createSelector(
  getStore,
  state => state.selectedOfferId
);

// Reducer
const initialState = {
  initialized: false,
  products: {},
  placingOrder: false,
  placedOrder: {},
  placingOrderError: null,
  placingOrderMessage: null,
  orderTxHash: null,
  orderTxReceipt: null,
  selectedOfferId: null
};

export default function shop(state = initialState, action) {
  switch (action.type) {
    case SHOP_INITIALIZED: {
      return {
        ...state,
        initialized: true
      };
    }
    case SET_PRODUCT_INFO: {
      const { productInfo } = action.payload;
      return {
        ...state,
        products: {
          ...state.products,
          [productInfo.id]: productInfo
        }
      };
    }
    case PLACE_ORDER: {
      return {
        ...state,
        placingOrder: true,

        // clear any existing errors/messages
        placingOrderError: null,
        placingOrderMessage: null
      };
    }
    case SET_PLACING_ORDER_MESSAGE: {
      const { placingOrderMessage } = action.payload;
      return {
        ...state,
        placingOrderMessage
      };
    }
    case PLACING_ORDER_RESULTS: {
      const { placedOrder, error } = action.payload;
      return {
        ...state,
        placedOrder,
        placingOrderMessage: null,
        placingOrderError: error,
        placingOrder: false
      };
    }
    case RECEIVED_ORDER_TX_HASH: {
      const { orderTxHash } = action.payload;
      return {
        ...state,
        orderTxHash
      };
    }
    case RECEIVED_ORDER_TX_RECEIPT: {
      const { orderTxReceipt } = action.payload;
      return {
        ...state,
        orderTxReceipt
      };
    }
    case SET_SELECTED_OFFER_ID: {
      const { selectedOfferId } = action.payload;
      return {
        ...state,
        selectedOfferId
      };
    }
    default:
      return state;
  }
}
