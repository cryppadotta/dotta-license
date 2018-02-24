const Bluebird = require('bluebird');
const getConfig = require('../config');

exports.command = 'info';
exports.desc = 'Describe contract info';
exports.builder = function(yargs) {
  return yargs;
};
exports.handler = async function(argv) {
  const { web3, abis } = getConfig(argv);
  // console.log('Info', abis);

  const license = new web3.eth.Contract(
    abis.LicenseCore,
    process.env.LICENSE_CORE_ADDRESS
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
