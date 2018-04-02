// Use this file for SSR shims
export default {
  getLocation: () => {
    return typeof location !== 'undefined' ? location : {};
  }
};
