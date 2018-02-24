const fs = require('fs');
const Bluebird = require('bluebird');
const _ = require('lodash');
const Web3 = require('web3');
const web3 = new Web3();

const initialize = (argv, abi, functionAbi) => {
  let web3URL = argv.web3;
  web3.setProvider(new web3.providers.HttpProvider(web3URL));
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
  // console.log(argv);
  const contract = new web3.eth.Contract(abi, argv.contractAddress);
  const response = await contract.methods[functionAbi.name]().call();
  console.log(response);
  // handleResponse(response);
};

const buildAbiCommands = (yargs, pathToFile, opts, handler) => {
  let combined = JSON.parse(fs.readFileSync(pathToFile));
  let skips = opts.skip || [];

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

  const buildCommands = contract => {
    let abiFunctions = contract.abi
      .filter(iface => iface.type === 'function')
      .filter(iface => !_.includes(skips, iface.name));

    abiFunctions.forEach(iface => {
      const argumentTypes = iface.inputs.map(i => i.type);
      const docName = iface.name + '(' + argumentTypes.join(',') + ')';
      const userdoc = _.get(contract.userdoc, ['methods', docName]);
      const devdoc = _.get(contract.devdoc, ['methods', docName], {});

      // doc required
      if (!userdoc) {
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
