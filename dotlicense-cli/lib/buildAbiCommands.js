const fs = require('fs');
const Bluebird = require('bluebird');
const _ = require('lodash');
const Web3 = require('web3');
const web3 = new Web3();
const debug = require('debug')('dotcli');

const configureLedger = async argv => {
  console.log('configuring ledger');
  const ProviderEngine = require('web3-provider-engine');
  const RpcSubprovider = require('web3-provider-engine/subproviders/rpc');
  const LedgerWalletSubproviderFactory = require('ledger-wallet-provider')
    .default;
  const Web3SubProvider = require('web3-provider-engine/subproviders/web3');
  console.log(Web3SubProvider);

  const engine = new ProviderEngine();
  // web3 = new Web3(engine);
  web3.setProvider(engine);

  const ledgerWalletSubProvider = await LedgerWalletSubproviderFactory();
  const httpProvider = new web3.providers.HttpProvider(argv.web3);

  ledgerWalletSubProvider.setEngine = () => true;
  engine.addProvider(ledgerWalletSubProvider);

  const httpSubprovider = new Web3SubProvider(httpProvider);

  // shim until web3-provider-engine supports the new API
  httpSubprovider.handleRequest = function(payload, next, end) {
    this.provider.send(payload, function(err, response) {
      if (err != null) return end(err);
      if (response.error != null) return end(new Error(response.error.message));
      end(null, response.result);
    });
  };

  engine.addProvider(httpSubprovider);
  engine.start();

  let accounts = await web3.eth.getAccounts();
  console.log('accounts are:', accounts);
};

const initialize = async (argv, abi, functionAbi) => {
  console.log('argv', argv);
  if (argv.ledger) {
    await configureLedger(argv);
  } else {
    web3.setProvider(new web3.providers.HttpProvider(argv.web3));
  }
};

const handleResponse = (response, argv, abi, functionAbi) => {
  response
    .once('transactionHash', function(hash) {
      console.log('transactionHash', hash);
    })
    .once('receipt', function(receipt) {
      console.log('receipt once', receipt);
    })
    .once('confirmation', function(confNumber, receipt) {
      console.log('confirmation', confNumber, receipt);
    })
    .on('error', function(error) {
      console.log('error', error);
    });
};

const handleRead = async (argv, abi, functionAbi) => {
  const contract = new web3.eth.Contract(abi, argv.contractAddress);
  const response = await contract.methods[functionAbi.name]().call();
  console.log(response);
};

const buildAbiCommands = (yargs, pathToFile, opts, handler) => {
  let combined = JSON.parse(fs.readFileSync(pathToFile));

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

  const sanitizeParam = p => p.replace(/^_/, '');
  const sp = sanitizeParam;

  const docName = iface => {
    const argumentTypes = iface.inputs.map(i => i.type);
    return iface.name + '(' + argumentTypes.join(',') + ')';
  };

  const buildCommands = contract => {
    let abiFunctions = contract.abi
      .filter(iface => iface.type === 'function')
      .filter(iface => !_.get(opts, ['methods', docName(iface), 'skip']));

    abiFunctions.forEach(iface => {
      const userdoc =
        _.get(contract.userdoc, ['methods', docName(iface)]) ||
        _.get(opts, ['methods', docName(iface), 'userdoc']);
      const devdoc = _.get(contract.devdoc, ['methods', docName(iface)], {});

      // doc required
      if (!userdoc) {
        debug('no userdoc for' + iface.name);
        return;
      }

      let positionalArgumentsString = _.keys(devdoc.params)
        .map(p => `<${sp(p)}>`)
        .join(' ');
      let commandString = _.compact([
        iface.name,
        positionalArgumentsString
      ]).join(' ');

      yargs.command(
        commandString,
        userdoc.notice,
        yargs => {
          iface.inputs.forEach(input => {
            const description = _.get(devdoc, ['params', sp(input.name)]);
            yargs.positional(sp(input.name), {
              describe: description
            });
            yargs.demand(sp(input.name));
          });
        },
        async argv => {
          console.log('running command');
          await initialize(argv, contract.abi, iface);
          console.log(iface);
          if (iface.constant) {
            await handleRead(argv, contract.abi, iface);
          } else {
            // handleWrite
          }
        }
      );
    });
  };

  const buildCommandsFor = opts.contracts
    ? _.values(_.pick(contracts, opts.contracts))
    : _.values(contracts);
  buildCommandsFor.forEach(c => buildCommands(c));
};

module.exports = buildAbiCommands;
