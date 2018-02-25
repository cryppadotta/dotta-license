const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const Bluebird = require('bluebird');
const configure = require('../config');

exports.command = 'info';
exports.desc = 'Describe contract info';
exports.builder = function(yargs) {
  return yargs;
};
exports.handler = async function(argv) {
  const { web3 } = await configure(argv);
  console.log('Info');

  // TODO -- we do this a lot, abstract out
  const combinedAbiFle = path.join(__dirname, '..', 'Dotlicense.abi.json');
  const combined = JSON.parse(fs.readFileSync(combinedAbiFle));
  let contracts = _.reduce(
    combined.contracts,
    (acc, attributes, rawName) => {
      if (attributes.abi) {
        let name = rawName.split(':')[1];
        acc[name] = {
          abi: JSON.parse(attributes.abi),
          devdoc: JSON.parse(attributes.devdoc),
          userdoc: JSON.parse(attributes.userdoc)
        };
      }
      return acc;
    },
    {}
  );

  const license = new web3.eth.Contract(
    contracts.LicenseCore.abi,
    argv.licenseCoreAddress
  );

  const getters = [
    // LicenseAccessControl
    'ceoAddress',
    'cfoAddress',
    'cooAddress',
    'withdrawalAddress',
    'paused',

    // LicenseInventory
    'getAllProductIds',
    // 'products'

    // LicenseOwnership
    'name',
    'symbol',
    'totalSupply',

    // LicenseSale
    'affiliateProgram'
  ];

  // const cfoAddress = await license.methods.cfoAddress().call();
  // console.log('cfoAddress', cfoAddress);

  let info = await Bluebird.reduce(
    getters,
    async (acc, name) => {
      acc[name] = await license.methods[name]().call();
      return acc;
    },
    {}
  );
  console.log(info);
};
