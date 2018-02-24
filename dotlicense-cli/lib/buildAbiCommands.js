const fs = require('fs');
const Bluebird = require('bluebird');
const _ = require('lodash');
const getConfig = require('./config');

const buildAbiCommands = (yargs, pathToFile, opts) => {
  let combined = JSON.parse(fs.readFileSync(pathToFile));

  let contracts = _.reduce(combined.contracts, (acc, attributes, rawName) => {
    let name = rawName.split(':')[1];
    acc[name] = {
      abi: JSON.parse(attributes.abi),
      devdoc: JSON.parse(attributes.devdoc),
      userdoc: JSON.parse(attributes.userdoc)
    };
    return acc;
  });

  const buildCommands = contract => {
    let abiFunctions = contract.abi.filter(iface => iface.type === 'function');

    abiFunctions.forEach(iface => {
      const argumentTypes = iface.inputs.map(i => i.type);
      const devdocName = iface.name + '(' + argumentTypes.join(',') + ')';
      const doc = _.get(contract.devdoc, ['methods', devdocName]);
      if (!doc) {
        // doc required
        return;
      }

      let positionalArgumentsString = _.keys(doc.params)
        .map(p => `<${p}>`)
        .join(' ');
      let commandString = [iface.name, positionalArgumentsString].join(' ');

      let builder = yargs.command(commandString, doc.details);
      iface.inputs.forEach(input => {
        builder.demand(input.name);
      });
    });

    // let devdocToAbi = contract.abi
    //   .filter(iface => iface.type === 'function')
    //   .reduce((acc, iface) => {
    //     const argumentTypes = iface.inputs.map(i => i.type);
    //     const devdocName = iface.name + '(' + argumentTypes.join(',') + ')';
    //     acc[devdocName] = iface;
    //     return acc;
    //   }, {});
    //
    // console.log(JSON.stringify(contract.abi, null, 2));
    // console.log(JSON.stringify(contract.devdoc, null, 2));
    //
    // console.log(devdocToAbi);
  };

  buildCommands(contracts.LicenseBase);
};

module.exports = buildAbiCommands;
