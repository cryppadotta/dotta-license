import * as chai from 'chai';
import BigNumber from 'bignumber.js';
import * as Web3 from 'web3';
import ethUtil = require('ethereumjs-util');
import { chaiSetup } from './utils/chai_setup';
import { Artifacts } from '../../util/artifacts';
import assertRevert from '../helpers/assertRevert';
import expectThrow from '../helpers/expectThrow';
import eventByName from '../helpers/eventByName';
import latestTime from '../helpers/latestTime';
import increaseTime from '../helpers/increaseTime';
import { advanceBlock } from '../helpers/advanceToBlock';
import * as Bluebird from 'bluebird';
import includes = require('lodash/includes');
import find = require('lodash/find');
import { duration } from '../helpers/increaseTime';

chaiSetup.configure();
const expect = chai.expect;
const { LicenseCoreTest, AffiliateProgram } = new Artifacts(artifacts);
const LicenseCore = LicenseCoreTest;
chai.should();

const web3: Web3 = (global as any).web3;
const web3Eth: any = Bluebird.promisifyAll(web3.eth);

contract('AffiliateProgram', (accounts: string[]) => {
  let token: any = null;
  let affiliate: any = null;
  const creator = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  const user4 = accounts[4];
  const user5 = accounts[5];
  const affiliate1 = accounts[6];
  const affiliate2 = accounts[7];
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

  const firstProduct = {
    id: 1,
    price: 1000,
    initialInventory: 2,
    supply: 2,
    interval: 0
  };

  const secondProduct = {
    id: 2,
    price: 2000,
    initialInventory: 3,
    supply: 5,
    interval: duration.weeks(4)
  };

  const thirdProduct = {
    id: 3,
    price: 3000,
    initialInventory: 5,
    supply: 10,
    interval: duration.weeks(4)
  };

  beforeEach(async () => {
    token = await LicenseCore.new({ from: creator });
    await token.setCEO(creator, { from: creator });
    await token.setCFO(creator, { from: creator });
    await token.setCOO(creator, { from: creator });

    await token.createProduct(
      firstProduct.id,
      firstProduct.price,
      firstProduct.initialInventory,
      firstProduct.supply,
      firstProduct.interval,
      { from: creator }
    );

    await token.createProduct(
      secondProduct.id,
      secondProduct.price,
      secondProduct.initialInventory,
      secondProduct.supply,
      secondProduct.interval,
      { from: creator }
    );

    await token.unpause({ from: creator });

    affiliate = await AffiliateProgram.new(token.address, { from: creator });
    await token.setAffiliateProgramAddress(affiliate.address, {
      from: creator
    });
    await affiliate.unpause({ from: creator });
  });

  describe('in AffiliateProgram', async () => {
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
      const purchaseId = 1;
      const valueAmount = 12345;
      describe('in a valid way', async () => {
        let logs;

        beforeEach(async () => {
          const result = await affiliate.credit(affiliate1, purchaseId, {
            from: creator,
            value: valueAmount
          });
          logs = result.logs;
        });
        it('should add to the balance of that affiliate', async () => {
          (await affiliate.balances(affiliate1)).should.be.bignumber.equal(
            valueAmount
          );
          await affiliate.credit(affiliate1, purchaseId, {
            from: creator,
            value: valueAmount
          });
          (await affiliate.balances(affiliate1)).should.be.bignumber.equal(
            valueAmount * 2
          );
        });
        it('should record the lastDeposit for that affiliate', async () => {
          const block = await web3Eth.getBlockAsync('latest');
          const lastDepositTime = await affiliate.lastDepositTimes(affiliate1);
          lastDepositTime.should.be.bignumber.equal(block.timestamp);
        });
        it('should record the lastDeposit for the contract overall', async () => {
          const block = await web3Eth.getBlockAsync('latest');
          const lastDepositTime = await affiliate.lastDepositTime();
          lastDepositTime.should.be.bignumber.equal(block.timestamp);
        });
        it('emit an AffiliateCredit');
      });

      it('should not allow deposits when paused', async () => {
        await affiliate.pause({ from: creator });
        await assertRevert(
          affiliate.credit(affiliate1, purchaseId, {
            from: creator,
            value: valueAmount
          })
        );
      });
      it('should not allow deposits from a rando', async () => {
        await assertRevert(
          affiliate.credit(affiliate1, purchaseId, {
            from: user1,
            value: valueAmount
          })
        );
      });
      it('should not allow deposits without a value', async () => {
        await assertRevert(
          affiliate.credit(affiliate1, purchaseId, {
            from: creator,
            value: 0
          })
        );
      });
      it('should not allow deposits to an affiliate with a zero address', async () => {
        await assertRevert(
          affiliate.credit(ZERO_ADDRESS, purchaseId, {
            from: creator,
            value: valueAmount
          })
        );
      });
    });

    describe('when withdrawing', async () => {
      describe('and the affiliate has a balance', async () => {
        const valueAf1 = 10000;
        const valueAf2 = 30000;
        const purchaseId1 = 1;
        const purchaseId2 = 2;
        let affiliateContractBalance: any;
        let originalAccountBalance1: any;
        let originalAccountBalance2: any;
        beforeEach(async () => {
          await affiliate.credit(affiliate1, purchaseId1, {
            from: creator,
            value: valueAf1
          });

          await affiliate.credit(affiliate2, purchaseId2, {
            from: creator,
            value: valueAf2
          });

          // the affiliate balances are credited
          (await affiliate.balances(affiliate1)).should.be.bignumber.equal(
            valueAf1
          );
          (await affiliate.balances(affiliate2)).should.be.bignumber.equal(
            valueAf2
          );

          // and the contract actually holds the ETH balance
          affiliateContractBalance = await web3Eth.getBalanceAsync(
            affiliate.address
          );

          affiliateContractBalance.should.be.bignumber.equal(
            valueAf1 + valueAf2
          );

          originalAccountBalance1 = await web3Eth.getBalanceAsync(affiliate1);
          originalAccountBalance2 = await web3Eth.getBalanceAsync(affiliate2);
        });
        describe('and the affiliate withdraws', async () => {
          beforeEach(async () => {
            await affiliate.withdraw({
              from: affiliate1,
              gasPrice: 0
            });
          });
          it('should clear the balance', async () => {
            (await affiliate.balances(affiliate1)).should.be.bignumber.equal(0);
          });
          it('should give the affiliate ETH', async () => {
            const newBalance = await web3Eth.getBalanceAsync(affiliate1);
            newBalance.should.be.bignumber.equal(
              originalAccountBalance1.plus(valueAf1)
            );
          });
          it('should deduct the amount from the affiliate contract balance', async () => {
            const newAffiliateContractBalance = await web3Eth.getBalanceAsync(
              affiliate.address
            );

            newAffiliateContractBalance.should.be.bignumber.equal(
              affiliateContractBalance.minus(valueAf1)
            );
          });
          it('should not affect another account', async () => {
            (await affiliate.balances(affiliate2)).should.be.bignumber.equal(
              valueAf2
            );

            (await web3Eth.getBalanceAsync(
              affiliate2
            )).should.be.bignumber.equal(originalAccountBalance2);
          });
          it('should not allow a withdraw when there is a zero balance', async () => {
            await assertRevert(
              affiliate.withdraw({
                from: affiliate1
              })
            );
          });
        });

        describe('and it is paused', async () => {
          beforeEach(async () => {
            await affiliate.pause({ from: creator });
          });
          it('should not work', async () => {
            await assertRevert(
              affiliate.withdraw({
                from: affiliate1
              })
            );
          });
        });

        describe('when the owner is withdrawing', async () => {
          it('should not be allowed before the expiry time', async () => {
            await assertRevert(
              affiliate.withdrawFrom(affiliate1, creator, { from: creator })
            );
          });

          describe('and the expiry time has passed', async () => {
            beforeEach(async () => {
              await increaseTime(60 * 60 * 24 * 31);
            });

            describe('and the creator withdraws', async () => {
              let creatorBalance: any;
              beforeEach(async () => {
                creatorBalance = await web3Eth.getBalanceAsync(creator);
                await affiliate.withdrawFrom(affiliate1, creator, {
                  from: creator,
                  gasPrice: 0
                });
              });

              it('should clear the balance', async () => {
                (await affiliate.balances(
                  affiliate1
                )).should.be.bignumber.equal(0);
              });
              it('should give the creator ETH', async () => {
                const newBalance = await web3Eth.getBalanceAsync(creator);
                newBalance.should.be.bignumber.equal(
                  creatorBalance.plus(valueAf1)
                );
              });
              it('should deduct the amount from the affiliate contract balance', async () => {
                const newAffiliateContractBalance = await web3Eth.getBalanceAsync(
                  affiliate.address
                );

                newAffiliateContractBalance.should.be.bignumber.equal(
                  affiliateContractBalance.minus(valueAf1)
                );
              });
            });
          });
        });

        describe('when a rando is withdrawing', async () => {
          it('should not work to withdraw', async () => {
            await assertRevert(affiliate.withdraw({ from: user1 }));
          });
          it('should not work to withdrawFrom', async () => {
            await assertRevert(
              affiliate.withdrawFrom(affiliate1, user1, { from: user1 })
            );
          });
        });
      });
    });
  });

  describe('when shutting down', async () => {
    describe('and it is before the expiry time', async () => {
      it('should not allow the creator to retire', async () => {
        await assertRevert(affiliate.retire(creator, { from: creator }));
      });
      it('should not allow the a rando to retire', async () => {
        await assertRevert(affiliate.retire(user1, { from: user1 }));
      });
    });
    describe('and it is after the expiry time', async () => {
      beforeEach(async () => {
        await increaseTime(60 * 60 * 24 * 31);
      });

      it('should allow the creator to retire', async () => {
        const creatorBalance = await web3Eth.getBalanceAsync(creator);
        const affiliateBalance = await web3Eth.getBalanceAsync(
          affiliate.address
        );
        await affiliate.pause({ from: creator, gasPrice: 0 });
        await affiliate.retire(creator, { from: creator, gasPrice: 0 });
        const newCreatorBalance = await web3Eth.getBalanceAsync(creator);
        newCreatorBalance.should.be.bignumber.equal(
          creatorBalance.plus(affiliateBalance)
        );
        await assertRevert(affiliate.unpause({ from: creator }));
      });
      it('should not allow the a rando to retire', async () => {
        await assertRevert(affiliate.retire(user1, { from: user1 }));
      });
    });
  });

  const productsOwnedBy = async (ownerAddress: string) => {
    const tokenIds = await token.tokensOf(ownerAddress);
    let tokenProductIds = [];
    for (let i = 0; i < tokenIds.length; i++) {
      tokenProductIds.push(await token.licenseProductId(tokenIds[i]));
    }
    return tokenProductIds;
  };

  const assertOwns = async (ownerAddress: string, productId: number) => {
    const products = await productsOwnedBy(ownerAddress);
    const matchingId = find(products, id => id.equals(productId));
    (matchingId || false).should.be.bignumber.equal(productId);
  };

  const assertDoesNotOwn = async (ownerAddress: string, productId: number) => {
    const products = await productsOwnedBy(ownerAddress);
    const matchingId = find(products, id => id.equals(productId));
    (matchingId || false).should.be.false();
  };

  describe('when making a sale', async () => {
    const assertPurchaseWorks = async () => {
      const originalLicenseBalance = await web3Eth.getBalanceAsync(
        token.address
      );
      await assertDoesNotOwn(user3, secondProduct.id);

      await token.purchase(secondProduct.id, 1, user3, affiliate1, {
        from: user3,
        value: secondProduct.price,
        gasPrice: 0
      });
      const newLicenseBalance = await web3Eth.getBalanceAsync(token.address);
      newLicenseBalance.should.be.bignumber.equal(
        originalLicenseBalance.add(secondProduct.price)
      );
      await assertOwns(user3, secondProduct.id);
    };
    describe('and the affiliate program is inoperational because', async () => {
      describe('and the affiliate program was retired', async () => {
        beforeEach(async () => {
          await increaseTime(60 * 60 * 24 * 31);
          await affiliate.pause({ from: creator, gasPrice: 0 });
          await affiliate.retire(creator, { from: creator });
        });
        it('should work just fine', assertPurchaseWorks);
      });
      describe('and the affiliate program is paused', async () => {
        beforeEach(async () => {
          await affiliate.pause({ from: creator, gasPrice: 0 });
        });
        it('should work just fine', assertPurchaseWorks);
      });
    });
    describe('and the affiliate program is operational', async () => {
      beforeEach(async () => {
        await token.setPrice(
          secondProduct.id,
          web3.toWei(new BigNumber(1), 'ether'),
          {
            from: creator
          }
        );
        secondProduct.price = web3.toWei(new BigNumber(1), 'ether').toNumber();
      });
      describe('and the product is free', async () => {
        beforeEach(async () => {
          await token.setPrice(secondProduct.id, 0, {
            from: creator
          });
          secondProduct.price = 0;
        });
        it('should work just fine', async () => {
          await assertDoesNotOwn(user3, secondProduct.id);

          // make a purchase
          await token.purchase(secondProduct.id, 1, user3, affiliate1, {
            from: user3,
            value: secondProduct.price,
            gasPrice: 0
          });

          // check the new balances
          await assertOwns(user3, secondProduct.id);
        });
      });
      describe('and the affiliate is missing', async () => {
        it('should work just fine', async () => {
          await assertDoesNotOwn(user3, secondProduct.id);

          // make a purchase
          await token.purchase(secondProduct.id, 1, user3, ZERO_ADDRESS, {
            from: user3,
            value: secondProduct.price,
            gasPrice: 0
          });

          // check the new balances
          await assertOwns(user3, secondProduct.id);
        });
      });
      describe('and the affiliate is unknown', async () => {
        let expectedComission: any;
        beforeEach(async () => {
          await affiliate.setBaselineRate(100, { from: creator });
          expectedComission = web3.toWei(new BigNumber(0.01), 'ether');
        });
        it('should give the affiliate his credit', async () => {
          // check original balances
          const originalLicenseBalance = await web3Eth.getBalanceAsync(
            token.address
          );
          const originalAffiliateBalance = await web3Eth.getBalanceAsync(
            affiliate.address
          );
          await assertDoesNotOwn(user3, secondProduct.id);

          // make a purchase
          await token.purchase(secondProduct.id, 1, user3, affiliate1, {
            from: user3,
            value: secondProduct.price,
            gasPrice: 0
          });

          // check the new balances
          await assertOwns(user3, secondProduct.id);

          const newLicenseBalance = await web3Eth.getBalanceAsync(
            token.address
          );

          newLicenseBalance.should.be.bignumber.equal(
            originalLicenseBalance
              .add(secondProduct.price)
              .sub(expectedComission)
          );

          const newAffiliateBalance = await web3Eth.getBalanceAsync(
            affiliate.address
          );
          newAffiliateBalance.should.be.bignumber.equal(
            originalAffiliateBalance.add(expectedComission)
          );
        });
      });
      describe('and the affiliate is whitelisted', async () => {
        let expectedComission: any;
        beforeEach(async () => {
          await affiliate.whitelist(affiliate1, 2000, { from: creator });
          expectedComission = web3.toWei(new BigNumber(0.2), 'ether');
        });
        it('should give the affiliate her credit', async () => {
          // check original balances
          const originalLicenseBalance = await web3Eth.getBalanceAsync(
            token.address
          );
          const originalAffiliateBalance = await web3Eth.getBalanceAsync(
            affiliate.address
          );
          await assertDoesNotOwn(user3, secondProduct.id);

          // make a purchase
          await token.purchase(secondProduct.id, 1, user3, affiliate1, {
            from: user3,
            value: secondProduct.price,
            gasPrice: 0
          });

          // check the new balances
          await assertOwns(user3, secondProduct.id);

          const newLicenseBalance = await web3Eth.getBalanceAsync(
            token.address
          );

          newLicenseBalance.should.be.bignumber.equal(
            originalLicenseBalance
              .add(secondProduct.price)
              .sub(expectedComission)
          );

          const newAffiliateBalance = await web3Eth.getBalanceAsync(
            affiliate.address
          );
          newAffiliateBalance.should.be.bignumber.equal(
            originalAffiliateBalance.add(expectedComission)
          );
        });
      });
    });
  });
});
