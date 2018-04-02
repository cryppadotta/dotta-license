import _ from 'lodash';
import { createSelector } from 'reselect';
import dotProp from 'dot-prop-immutable';
import getRoot from './root';

// Actions

// Selectors
export const getAppState = createSelector(getRoot, state => state.app);

// Reducer
const initialState = {
  bootTime: new Date()
};

export default function app(state = initialState, action) {
  switch (action.type) {
    default:
      return state;
  }
}
