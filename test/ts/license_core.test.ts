import * as chai from 'chai';
import * as Web3 from 'web3';
import ethUtil = require('ethereumjs-util');
import * as BigNumber from 'bignumber.js';
import { chaiSetup } from './utils/chai_setup';
import { Artifacts } from '../../util/artifacts';

chaiSetup.configure();
const expect = chai.expect;
const { LicenseCoreTest } = new Artifacts(artifacts);

const web3: Web3 = (global as any).web3;

contract('LicenseCore', function(accounts: string[]) {
  it('should run now', async () => {
    await LicenseCoreTest.deployed();
    expect(true).to.be.true();
  });
});
