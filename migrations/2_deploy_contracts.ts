var ConvertLib = artifacts.require('./ConvertLib.sol');
var MetaCoin = artifacts.require('./MetaCoin.sol');

import { Artifacts } from '../util/artifacts';
const {
  LicenseCore,
  LicenseCoreTest,
  LicenseSale,
  LicenseOwnership,
  LicenseInventory,
  LicenseBase,
  LicenseAccessControl,
  ERC721,
  SafeMath
} = new Artifacts(artifacts);

module.exports = function(deployer: any, network: string) {
  deployer.deploy(ConvertLib);
  deployer.link(ConvertLib, MetaCoin);
  deployer.deploy(MetaCoin);

  if (network === 'test') {
    deployer.deploy(LicenseCoreTest);
  } else {
    deployer.deploy(LicenseCore);
  }
};
