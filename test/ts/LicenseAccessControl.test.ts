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

contract('LicenseAccessControl', (accounts: string[]) => {
  let token: any = null;
  const creator = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  const ceo = accounts[4];
  const cfo = accounts[5];
  const coo = accounts[6];

  beforeEach(async () => {
    token = await LicenseCore.new({ from: creator });
  });

  describe.only('when setting addresses', async () => {
    it('should setCEO', async () => {
      (await token.ceoAddress()).should.be.equal(creator);
      await token.setCEO(ceo);
      (await token.ceoAddress()).should.be.equal(ceo);
    });

    describe('when a CEO is set', async () => {
      beforeEach(async () => {
        await token.setCEO(ceo);
      });

      it('should setCFO', async () => {
        (await token.cfoAddress()).should.be.equal(creator);
        await token.setCFO(cfo, { from: ceo });
        (await token.cfoAddress()).should.be.equal(cfo);
      });

      it('should setCOO', async () => {
        (await token.cooAddress()).should.be.equal(creator);
        await token.setCOO(coo, { from: ceo });
        (await token.cooAddress()).should.be.equal(coo);
      });

      it('should setWithdrawalAddress', async () => {
        (await token.withdrawalAddress()).should.be.equal(creator);
        await token.setWithdrawalAddress(cfo, { from: ceo });
        (await token.withdrawalAddress()).should.be.equal(cfo);
      });
    });

    describe('when a rando is sending', async () => {
      const sender = user1;
      beforeEach(async () => {
        await token.setCEO(ceo);
      });

      it('should not setCEO', async () => {
        await assertRevert(token.setCEO(ceo, { from: sender }));
      });

      it('should not setCFO', async () => {
        await assertRevert(token.setCFO(cfo, { from: sender }));
      });

      it('should not setCOO', async () => {
        await assertRevert(token.setCOO(coo, { from: sender }));
      });

      it('should not setWithdrawalAddress', async () => {
        await assertRevert(
          token.setWithdrawalAddress(sender, { from: sender })
        );
      });
    });
  });

  describe('when setting the withdrawal address', async () => {
    it('should not allow a rando', async () => {
      await assertRevert(token.setWithdrawalAddress(user1, { from: user1 }));
    });
    it('should not allow the CFO', async () => {
      (await token.cfoAddress()).should.be.equal(creator);
      await token.setCFO(cfo);
      await assertRevert(token.setWithdrawalAddress(cfo, { from: cfo }));
    });
  });

  describe('when withdrawing the balance', async () => {
    beforeEach(async () => {
      await token.setCFO(cfo);
    });
    it('should not allow the CEO', async () => {
      await assertRevert(token.setWithdrawalAddress(ceo, { from: ceo }));
    });
    it('should not allow the COO', async () => {
      await assertRevert(token.setWithdrawalAddress(coo, { from: coo }));
    });
    it('should not allow a rando', async () => {
      await assertRevert(token.setWithdrawalAddress(user1, { from: user1 }));
    });
  });

  describe('when pausing and unpausing', async () => {
    beforeEach(async () => {
      await token.setCEO(ceo);
    });
    it('should not allow a random person to pause', async () => {
      await assertRevert(token.pause({ from: user1 }));
    });
    it('should not allow a random person to unpause', async () => {
      await assertRevert(token.unpause({ from: user1 }));
    });
    it('should allow the CEO', async () => {
      (await token.paused()).should.be.true();
      await token.unpause({ from: ceo });

      (await token.paused()).should.be.false();
      await token.pause({ from: ceo });
      (await token.paused()).should.be.true();
    });
  });
});
