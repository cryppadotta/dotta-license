import * as chai from 'chai';
import BigNumber from 'bignumber.js';
import * as Web3 from 'web3';
import ethUtil = require('ethereumjs-util');
import { chaiSetup } from './utils/chai_setup';
import { Artifacts } from '../../util/artifacts';
import assertRevert from '../helpers/assertRevert';
import expectThrow from '../helpers/expectThrow';
import eventByName from '../helpers/eventByName';

chaiSetup.configure();
const expect = chai.expect;
const { LicenseCoreTest, AffiliateProgram } = new Artifacts(artifacts);
const LicenseCore = LicenseCoreTest;
chai.should();

const web3: Web3 = (global as any).web3;
const ETH_STRING = web3.toWei(1, 'ether');
const FINNEY_STRING = web3.toWei(1, 'finney');
const ETH_BN = new BigNumber(ETH_STRING);
const FINNEY_BN = new BigNumber(FINNEY_STRING);

contract('AffiliateProgram', (accounts: string[]) => {
  let token: any = null;
  let affiliate: any = null;
  const creator = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  const ceo = accounts[4];
  const cfo = accounts[5];
  const coo = accounts[6];
  const user4 = accounts[7];
  const user5 = accounts[8];
  const affiliate1 = accounts[9];
  const affiliate2 = accounts[10];
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

  const firstProduct = {
    id: 1,
    price: 1000,
    initialInventory: 2,
    supply: 2
  };

  const secondProduct = {
    id: 2,
    price: 2000,
    initialInventory: 3,
    supply: 5
  };

  const thirdProduct = {
    id: 3,
    price: 3000,
    initialInventory: 5,
    supply: 10
  };

  beforeEach(async () => {
    token = await LicenseCore.new({ from: creator });
    await token.setCEO(ceo, { from: creator });
    await token.setCFO(cfo, { from: ceo });
    await token.setCOO(coo, { from: ceo });

    await token.createProduct(
      firstProduct.id,
      firstProduct.price,
      firstProduct.initialInventory,
      firstProduct.supply,
      { from: ceo }
    );

    await token.createProduct(
      secondProduct.id,
      secondProduct.price,
      secondProduct.initialInventory,
      secondProduct.supply,
      { from: ceo }
    );

    await token.unpause({ from: ceo });

    affiliate = await AffiliateProgram.new(token.address, { from: creator });
    await affiliate.unpause({ from: creator });
  });

  describe.only('in AffiliateProgram', async () => {
    it('should have a storeAddress', async () => {
      (await affiliate.storeAddress()).should.be.eq(token.address);
    });
    it('should report that it isAffiliateProgram', async () => {
      (await affiliate.isAffiliateProgram()).should.be.true();
    });
    describe('when setting the baselineRate', async () => {
      it('the owner should set a new rate', async () => {
        (await affiliate.baselineRate()).should.be.bignumber.equal(0);
        await affiliate.setBaselineRate(1000, { from: creator });
        (await affiliate.baselineRate()).should.be.bignumber.equal(1000);
      });
      it('the owner should not be able to set it too high', async () => {
        await assertRevert(affiliate.setBaselineRate(5100, { from: creator }));
      });
      it('a random user should not be able to change the rate', async () => {
        await assertRevert(affiliate.setBaselineRate(1000, { from: user1 }));
      });
      it('should emit a RateChanged event');
    });
    describe('when setting the maximumRate', async () => {
      it('should allow the owner to set a new rate', async () => {
        (await affiliate.maximumRate()).should.be.bignumber.equal(5000);
        await affiliate.setMaximumRate(1000, { from: creator });
        (await affiliate.maximumRate()).should.be.bignumber.equal(1000);
      });
      it('should not allow the owner to set a new rate too high', async () => {
        await assertRevert(affiliate.setMaximumRate(5100, { from: creator }));
      });
      it('should not allow a rando to change the maximumRate', async () => {
        await assertRevert(affiliate.setMaximumRate(1000, { from: user1 }));
      });
      it('should emit a RateChanged event');
    });
    describe('when whitelisting affiliates', async () => {
      it('should allow the owner to whitelist affiliates', async () => {
        (await affiliate.whitelistRates(affiliate1)).should.be.bignumber.equal(
          0
        );
        await affiliate.whitelist(affiliate1, 2500, { from: creator });
        (await affiliate.whitelistRates(affiliate1)).should.be.bignumber.equal(
          2500
        );
      });
      it('should not allow the owner to whitelist with too high of a rate', async () => {
        await assertRevert(
          affiliate.whitelist(affiliate1, 5100, { from: creator })
        );
      });
      it('should not allow a rando to whitelist', async () => {
        await assertRevert(
          affiliate.whitelist(affiliate1, 1000, { from: user1 })
        );
      });
      it('should emit a whitelisted event');
    });

    describe('when using rateFor', async () => {
      describe('when affiliates are whitelisted', async () => {
        it('should return the correct rate for affiliates', async () => {
          (await affiliate.rateFor(
            affiliate1,
            0,
            0,
            0
          )).should.be.bignumber.equal(0);
          await affiliate.whitelist(affiliate1, 2500, { from: creator });
          (await affiliate.rateFor(
            affiliate1,
            0,
            0,
            0
          )).should.be.bignumber.equal(2500);
        });
        describe('if the maximumRate is lower than the whitelisted rate', async () => {
          beforeEach(async () => {
            await affiliate.whitelist(affiliate1, 2500, { from: creator });
            await affiliate.setMaximumRate(1000, { from: creator });
          });
          it('should return the maximumRate', async () => {
            (await affiliate.rateFor(
              affiliate1,
              0,
              0,
              0
            )).should.be.bignumber.equal(1000);
          });
        });
        describe('when an affiliate is blacklisted', async () => {
          beforeEach(async () => {
            await affiliate.whitelist(affiliate1, 1, { from: creator });
          });
          it('should return zero for that affiliate', async () => {
            (await affiliate.rateFor(
              affiliate1,
              0,
              0,
              0
            )).should.be.bignumber.equal(0);
          });
        });
      });
    });

    describe('when calculating cuts for an affiliate', async () => {
      const priceTests = [
        {
          price: web3.toWei(1, 'ether'),
          rate: 1000,
          actual: web3.toWei(0.1, 'ether')
        },
        {
          price: web3.toWei(0.5, 'ether'),
          rate: 2500,
          actual: web3.toWei(0.125, 'ether')
        },
        {
          price: 1000,
          rate: 2,
          actual: 0
        },
        {
          price: 1234,
          rate: 123,
          actual: 15
        },
        {
          price: 1234,
          rate: 129,
          actual: 15
        }
      ];

      priceTests.forEach(test => {
        it(`should calculate the correct cut for price ${
          test.price
        } at rate ${test.rate / 100}%`, async () => {
          await affiliate.whitelist(affiliate1, test.rate, { from: creator });
          const givenCut = await affiliate.cutFor(
            affiliate1,
            0,
            0,
            test.price,
            {
              from: creator
            }
          );
          givenCut.should.be.bignumber.equal(new BigNumber(test.actual));
        });
      });
    });

    describe('when making deposits for affiliates', async () => {
      describe('in a valid way', async () => {
        const purchaseId = 1;
        const valueAmount = 12345;
        let logs;

        beforeEach(async () => {
          const result = await affiliate.depositFor(affiliate1, purchaseId, {
            from: creator,
            value: valueAmount
          });
          logs = result.logs;
        });
        it('should add to the balance of that affiliate', async () => {
          (await affiliate.balances(affiliate1)).should.be.bignumber.equal(
            valueAmount
          );
          await affiliate.depositFor(affiliate1, purchaseId, {
            from: creator,
            value: valueAmount
          });
          (await affiliate.balances(affiliate1)).should.be.bignumber.equal(
            valueAmount * 2
          );
        });
        it('should record the lastDeposit for that affiliate');
        it('should record the lastDeposit for the contract overall');
        it('record an AffiliateSale');
      });

      it('should not allow deposits when paused');
      it('should not allow deposits from a rando');
      it('should not allow deposits without a value');
      it('should not allow deposits to an affiliate with a zero address');
    });

    describe('when withdrawing', async () => {
      it('should not allow the owner to withdraw before the expiry time');
      it(
        'should not allow the owner to shutdown the contract before the expiry time'
      );
      it(
        'should allow the owner to withdraw from a particular affiliate contract after the expiry time'
      );
    });

    describe('when shutting down', async () => {
      it(
        'should allow the owner to shutdown the contract after the expiry time'
      );
    });
  });

  describe('when making a sale', async () => {
    it('should ...');
  });
});
