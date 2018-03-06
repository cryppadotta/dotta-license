import * as chai from 'chai';
import * as BigNumber from 'bignumber.js';
import * as Web3 from 'web3';
import ethUtil = require('ethereumjs-util');
import { chaiSetup } from './utils/chai_setup';
import { Artifacts } from '../../util/artifacts';
import assertRevert from '../helpers/assertRevert';

chaiSetup.configure();
const expect = chai.expect;
const { LicenseCoreTest } = new Artifacts(artifacts);
const LicenseCore = LicenseCoreTest;
chai.should();

const web3: Web3 = (global as any).web3;

contract('LicenseCore', (accounts: string[]) => {
  let token: any = null;
  const _creator = accounts[0];

  beforeEach(async () => {
    token = await LicenseCore.new({ from: _creator });
  });

  it('should run now', async () => {
    // await LicenseCoreTest.deployed();
    expect(true).to.be.true();
  });

  it('should not accept a value in the fallback function');
  describe('when upgrading the contract', async () => {
    it('should set a new address');
    it('should not allow an unpause');
  });
});
