const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const Bluebird = require('bluebird');
const web3Util = require('web3-utils');
const chalk = require('chalk');
const debug = require('debug')('dotcli');
const stringify = require('fast-safe-stringify');

const configureWeb3 = require('dot-abi-cli').configureWeb3;

exports.command = 'sync-products';
exports.desc = `Create or update products described in a file`;
exports.builder = function(yargs) {
  yargs
    .option('products', {
      type: 'string',
    })
    .demandOption(
      'products',
      'Please provide a path to the file that describes your products'
    )
    .coerce('products', function(arg) {
      return require(arg);
    });
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
          userdoc: JSON.parse(attributes.userdoc),
        };
      }
      return acc;
    },
    {}
  );

  const contract = new web3.eth.Contract(
    contracts.LicenseCore.abi,
    argv.contractAddress
  );

  const products = argv.products(argv, require);

  console.log(`Syncing ${products.length} products...`);

  const haveProduct = productInfo => {
    const p = productInfo;
    return (
      p['0'] !== '0' ||
      p['1'] !== '0' ||
      p['2'] !== '0' ||
      p['3'] !== '0' ||
      p['4'] !== false
    );
  };

  const handleResponse = response => {
    return new Promise(function(resolve, reject) {
      return response
        .once('transactionHash', function(hash) {
          console.log(`Transaction: ${chalk.yellow(hash)}`);
        })
        .once('receipt', function(receipt) {
          console.log('Receipt:', chalk.green(stringify(receipt, null, 2)));
          return resolve(receipt);
        })
        .once('error', function(error) {
          console.log(chalk.red('Error:'), error);
          return reject(error);
        });
    });
  };

  const handleWrite = async (functionName, transactionArguments) => {
    const accounts = await web3.eth.getAccountsAsync();
    const from = argv.from || accounts[0];

    // build sendOpts
    const sendOpts = {
      from,
    };

    if (argv.gasPrice) sendOpts.gasPrice = argv.gasPrice;
    if (argv.gasLimit) sendOpts.gas = argv.gasLimit;
    if (argv.value) sendOpts.value = argv.value;

    if (argv.ledger) {
      console.log(
        chalk.yellow('Please confirm transaction on device:'),
        stringify(
          _.merge(
            {
              method: functionName,
              args: transactionArguments,
            },
            sendOpts
          ),
          null,
          2
        )
      );
    }
    // debug(`${functionName}: ${JSON.stringify(transactionArguments, null, 2)}`);
    const response = contract.methods[functionName](
      ...transactionArguments
    ).send(sendOpts);
    return handleResponse(response);
  };

  const createProduct = async product => {
    console.log(chalk.blue('Creating'), product);
    const transactionArguments = [
      product.productId,
      product.price,
      product.initialInventoryQuantity,
      product.supply,
      product.interval,
    ];
    handleWrite('createProduct', transactionArguments);
  };

  const updateProduct = async (product, existingProductInfo) => {
    // The two things that can be changed are: 1) price and 2) renewable
    let neededUpdate = false;

    // Check price
    if (product.price.toString() !== existingProductInfo['0'].toString()) {
      neededUpdate = true;

      console.log(chalk.blue('Updating price for'), product);
      const transactionArguments = [product.productId, product.price];
      await handleWrite('setPrice', transactionArguments);
    }

    // Check renewable
    if (product.renewable !== existingProductInfo['4']) {
      neededUpdate = true;

      console.log(chalk.blue('Updating renewable for'), product);
      const transactionArguments = [product.productId, product.renewable];
      handleWrite('setRenewable', transactionArguments);
    }

    if (!neededUpdate) {
      console.log(
        chalk.green(
          `Product ${product.productId} ${product.name} is up-to-date`
        )
      );
    }
  };

  const syncProduct = async product => {
    const existingProductInfo = await contract.methods
      .productInfo(product.productId)
      .call();

    if (haveProduct(existingProductInfo)) {
      await updateProduct(product, existingProductInfo);
    } else {
      await createProduct(product);
    }
  };

  await Bluebird.map(products.slice(0, 1), product => syncProduct(product));
};
