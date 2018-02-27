import { Artifacts } from '../util/artifacts';
const { LicenseCore, LicenseCoreTest, AffiliateProgram } = new Artifacts(
  artifacts
);

module.exports = (deployer: any, network: string) => {
  const licenseContract = network === 'test' ? LicenseCoreTest : LicenseCore;
  licenseContract.deployed().then((licenseContractInstance: any) => {
    deployer.deploy(AffiliateProgram, licenseContractInstance.address);
  });
};
