const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const Bluebird = require('bluebird');
const web3Util = require('web3-utils');

const configureWeb3 = require('dot-abi-cli').configureWeb3;

exports.command = 'info';
exports.desc = 'Describe affiliate contract info';
exports.builder = function(yargs) {
  return yargs;
};
exports.handler = async function(argv) {
  const { web3 } = await configureWeb3(argv);

  // TODO -- we do this a lot, abstract out
  const combinedAbiFle = path.join(
    __dirname,
    '..',
    '..',
    'dot-license.abi.json'
  );
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

  const affiliate = new web3.eth.Contract(
    contracts.AffiliateProgram.abi,
    argv.contractAddress
  );

  const getters = [
    'storeAddress',
    'lastDepositTime',
    'maximumRate',
    'baselineRate',
    'owner',
    'paused',
    'retired'
  ];

  // const cfoAddress = await license.methods.cfoAddress().call();
  // console.log('cfoAddress', cfoAddress);

  let info = await Bluebird.reduce(
    getters,
    async (acc, name) => {
      acc[name] = await affiliate.methods[name]().call();
      return acc;
    },
    {}
  );

  info['balance'] = await web3.eth.getBalance(argv.contractAddress);
  info['balance (eth)'] = web3Util.fromWei(info['balance'], 'ether');

  console.log(info);
};
