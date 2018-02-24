const path = require('path');
const suffix =
  process.env.NODE_ENV === 'production'
    ? '.production'
    : process.env.NODE_ENV === 'staging' ? '.staging' : '';
require('dotenv').config({
  path: path.resolve(process.cwd(), `.env${suffix}`)
});

const fs = require('fs');
const _ = require('lodash');

// TODO -- get rid of this
function getConfig(argv) {
  const Web3 = require('web3');
  const web3 = new Web3();

  const abiNames = [
    'AffiliateProgram',
    'ERC721',
    'LicenseAccessControl',
    'LicenseBase',
    'LicenseCore',
    'LicenseCoreTest',
    'LicenseInventory',
    'LicenseOwnership',
    'LicenseSale',
    'Math',
    'Migrations',
    'Ownable',
    'Pausable',
    'SafeMath'
  ];

  // TODO, this section is temporary. For release, we'll copy these over during a build process
  const contractsDir = path.join(__dirname, '..', '..', 'dotlicense-contracts');
  const abisDir = path.join(contractsDir, 'build', 'contracts');
  const abis = abiNames.reduce((acc, name) => {
    const abiPath = path.join(abisDir, `${name}.json`);
    const asJson = JSON.parse(fs.readFileSync(abiPath));
    acc[name] = _.get(asJson, 'abi');
    return acc;
  }, {});

  let web3URL = argv.web3 || process.env.WEB3_PROVIDER_URL;

  web3.setProvider(new web3.providers.HttpProvider(web3URL));
  return { web3, abis };
}

module.exports = getConfig;
