const fs = require('fs');
const Bluebird = require('bluebird');
const _ = require('lodash');
const getConfig = require('./config');

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
      let commandString = [iface.name, positionalArgumentsString].join(' ');

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
        argv => {
          handler(argv, { contract, abi: iface });
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
