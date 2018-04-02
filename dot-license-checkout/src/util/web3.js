// Support SSR by mocking web3
let web3Module = {};
if (typeof window !== `undefined`) {
  web3Module = require('../vendor/web3');
}

export default web3Module;
