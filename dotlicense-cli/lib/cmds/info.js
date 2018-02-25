const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const Bluebird = require('bluebird');

const configureWeb3 = require('dot-abi-cli').configureWeb3;

exports.command = 'info';
exports.desc = 'Describe contract info';
exports.builder = function(yargs) {
  yargs.option('inventory', {
    type: 'boolean'
  });
  return yargs;
};
exports.handler = async function(argv) {
  const { web3 } = await configureWeb3(argv);
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
    argv.contractAddress
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

  if (
    argv.inventory &&
    info.getAllProductIds &&
    info.getAllProductIds.length > 0
  ) {
    info.productInfo = await Bluebird.map(
      info.getAllProductIds,
      async productId => {
        // let [price, inventory, totalSupply] = await license.methods
        let results = await license.methods.productInfo(productId).call();
        return {
          productId,
          price: results['0'],
          inventory: results['1'],
          totalSupply: results['2']
        };
      }
    );
  }

  console.log(info);
};
