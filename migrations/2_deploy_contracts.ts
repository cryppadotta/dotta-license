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
  SafeMath,
  AffiliateProgram
} = new Artifacts(artifacts);

module.exports = (deployer: any, network: string) => {
  const licenseContract = network === 'test' ? LicenseCoreTest : LicenseCore;

  deployer.deploy(licenseContract).then(() => {
    deployer.deploy(AffiliateProgram, licenseContract.address);
  });
};
