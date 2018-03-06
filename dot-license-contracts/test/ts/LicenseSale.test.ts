import * as chai from 'chai';
import BigNumber from 'bignumber.js';
import * as Web3 from 'web3';
import ethUtil = require('ethereumjs-util');
import { chaiSetup } from './utils/chai_setup';
import { Artifacts } from '../../util/artifacts';
import assertRevert from '../helpers/assertRevert';
import expectThrow from '../helpers/expectThrow';
import eventByName from '../helpers/eventByName';
import { duration } from '../helpers/increaseTime';
import * as Bluebird from 'bluebird';

import increaseTime from '../helpers/increaseTime';

chaiSetup.configure();
const expect = chai.expect;
const { LicenseCoreTest } = new Artifacts(artifacts);
const LicenseCore = LicenseCoreTest;
chai.should();

const web3: Web3 = (global as any).web3;
const web3Eth: any = Bluebird.promisifyAll(web3.eth);

const latestTime = async () => {
  const block = await web3Eth.getBlockAsync('latest');
  return block.timestamp;
};

contract('LicenseSale', (accounts: string[]) => {
  let token: any = null;
  const creator = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  const ceo = accounts[4];
  const cfo = accounts[5];
  const coo = accounts[6];
  let p1Created: any;
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
    await token.setCEO(ceo, { from: creator });
    await token.setCFO(cfo, { from: ceo });
    await token.setCOO(coo, { from: ceo });

    p1Created = await token.createProduct(
      firstProduct.id,
      firstProduct.price,
      firstProduct.initialInventory,
      firstProduct.supply,
      firstProduct.interval,
      { from: ceo }
    );

    await token.createProduct(
      secondProduct.id,
      secondProduct.price,
      secondProduct.initialInventory,
      secondProduct.supply,
      secondProduct.interval,
      { from: ceo }
    );

    await token.createProduct(
      thirdProduct.id,
      thirdProduct.price,
      thirdProduct.initialInventory,
      thirdProduct.supply,
      thirdProduct.interval,
      { from: ceo }
    );

    await token.unpause({ from: ceo });
  });

  describe('when purchasing', async () => {
    describe('it should fail because it', async () => {
      it('should not sell a product that has no inventory', async () => {
        await token.clearInventory(firstProduct.id, { from: ceo });
        await assertRevert(
          token.purchase(firstProduct.id, 1, user1, ZERO_ADDRESS, {
            from: user1,
            value: firstProduct.price
          })
        );
      });
      it('should not sell a product that was sold out', async () => {
        await token.purchase(firstProduct.id, 1, user1, ZERO_ADDRESS, {
          from: user1,
          value: firstProduct.price
        });
        await token.purchase(firstProduct.id, 1, user2, ZERO_ADDRESS, {
          from: user2,
          value: firstProduct.price
        });
        await assertRevert(
          token.purchase(firstProduct.id, 1, user3, ZERO_ADDRESS, {
            from: user3,
            value: firstProduct.price
          })
        );
        (await token.totalSold(firstProduct.id)).should.be.bignumber.equal(2);
        (await token.availableInventoryOf(
          firstProduct.id
        )).should.be.bignumber.equal(0);
      });
      it('should not sell at a price too low', async () => {
        await assertRevert(
          token.purchase(firstProduct.id, 1, user1, ZERO_ADDRESS, {
            from: user1,
            value: firstProduct.price - 1
          })
        );
        await assertRevert(
          token.purchase(firstProduct.id, 1, user1, ZERO_ADDRESS, {
            from: user1,
            value: 0
          })
        );
      });
      it('should not sell at a price too high', async () => {
        await assertRevert(
          token.purchase(firstProduct.id, 1, user1, ZERO_ADDRESS, {
            from: user1,
            value: firstProduct.price + 1
          })
        );
      });
      it('should not sell if the contract is paused', async () => {
        await token.pause({ from: ceo });
        await assertRevert(
          token.purchase(firstProduct.id, 1, user1, ZERO_ADDRESS, {
            from: user1,
            value: firstProduct.price + 1
          })
        );
      });

      it('should not sell any product for 0 cycles', async () => {
        await assertRevert(
          token.purchase(firstProduct.id, 0, user1, ZERO_ADDRESS, {
            from: user1,
            value: firstProduct.price
          })
        );
      });
      it('should not sell a non-subscription product for more cycles than 1', async () => {
        await assertRevert(
          token.purchase(firstProduct.id, 2, user1, ZERO_ADDRESS, {
            from: user1,
            value: firstProduct.price
          })
        );
      });
      it('should not sell a subscription for a value less than the number of cycles requires', async () => {
        await assertRevert(
          token.purchase(secondProduct.id, 2, user1, ZERO_ADDRESS, {
            from: user1,
            value: secondProduct.price
          })
        );
      });
      it('should not sell a subscription for a value more than the number of cycles requires', async () => {
        await assertRevert(
          token.purchase(secondProduct.id, 2, user1, ZERO_ADDRESS, {
            from: user1,
            value: secondProduct.price * 2 + 1
          })
        );
      });
    });

    describe('and it succeeds as a non-subscription', async () => {
      let tokenId: any;
      let issuedEvent: any;
      beforeEach(async () => {
        const { logs } = await token.purchase(
          firstProduct.id,
          1,
          user1,
          ZERO_ADDRESS,
          {
            value: firstProduct.price
          }
        );
        issuedEvent = eventByName(logs, 'LicenseIssued');
        tokenId = issuedEvent.args.licenseId;
      });
      it('should decrement the inventory', async () => {
        (await token.availableInventoryOf(
          firstProduct.id
        )).should.be.bignumber.equal(1);
      });
      it('should track the number sold', async () => {
        (await token.totalSold(firstProduct.id)).should.be.bignumber.equal(1);
      });
      describe('the resulting License', async () => {
        it('should keep track of the license id', async () => {
          const owner = await token.ownerOf(tokenId);
          owner.should.be.equal(user1);
        });
        it('should fetch licenseInfo', async () => {
          const [
            productId,
            attributes,
            issuedTime,
            expirationTime,
            affiliate
          ] = await token.licenseInfo(tokenId);
          productId.should.be.bignumber.equal(firstProduct.id);
          attributes.should.not.be.bignumber.equal(0);
          issuedTime.should.not.be.bignumber.equal(0);
          expirationTime.should.be.bignumber.equal(0);
          affiliate.should.be.bignumber.equal(0);
        });
        it('should emit an Issued event', async () => {
          issuedEvent.args.owner.should.be.eq(user1);
          issuedEvent.args.licenseId.should.be.bignumber.equal(tokenId);
          issuedEvent.args.productId.should.be.bignumber.equal(firstProduct.id);
        });
        it('should have an issued time', async () => {
          const issuedTime = await token.licenseIssuedTime(tokenId);
          issuedTime.should.not.be.bignumber.equal(0);
        });
        it('should have attributes', async () => {
          const attributes = await token.licenseAttributes(tokenId);
          attributes.should.not.be.bignumber.equal(0);
        });
        it('should be able to find the product id', async () => {
          const productId = await token.licenseProductId(tokenId);
          productId.should.be.bignumber.equal(firstProduct.id);
        });
        it('should not have an expiration time', async () => {
          const productId = await token.licenseExpirationTime(tokenId);
          productId.should.be.bignumber.equal(0);
        });
        it('should not have an affiliate', async () => {
          const productId = await token.licenseAffiliate(tokenId);
          productId.should.be.bignumber.equal(ZERO_ADDRESS);
        });
        it('should transfer the license to the new owner', async () => {
          const originalOwner = await token.ownerOf(tokenId);
          originalOwner.should.be.equal(user1);

          await token.transfer(user3, tokenId, { from: user1 });
          const newOwner = await token.ownerOf(tokenId);
          newOwner.should.be.equal(user3);

          const productId = await token.licenseProductId(tokenId);
          productId.should.be.bignumber.equal(firstProduct.id);
        });
        it('should set an expiration time of 0', async () => {
          const expirationTime = await token.licenseExpirationTime(tokenId);
          expirationTime.should.be.bignumber.equal(0);
        });
      });
    });
    describe('and it succeeds as a subscription', async () => {
      let tokenId: any;
      let issuedEvent: any;
      beforeEach(async () => {
        const { logs } = await token.purchase(
          secondProduct.id,
          1,
          user1,
          ZERO_ADDRESS,
          {
            value: secondProduct.price
          }
        );
        issuedEvent = eventByName(logs, 'LicenseIssued');
        tokenId = issuedEvent.args.licenseId;
      });

      it('should set an appropriate expiration time', async () => {
        let now = await latestTime();
        let expectedTime = now + secondProduct.interval;
        let actualTime = await token.licenseExpirationTime(tokenId);
        actualTime.should.be.bignumber.equal(expectedTime);
      });
      it('should allow buying for multiple cycles', async () => {
        const { logs } = await token.purchase(
          thirdProduct.id,
          3,
          user1,
          ZERO_ADDRESS,
          {
            value: thirdProduct.price * 3
          }
        );
        issuedEvent = eventByName(logs, 'LicenseIssued');
        tokenId = issuedEvent.args.licenseId;

        let now = await latestTime();
        let expectedTime = now + thirdProduct.interval * 3;
        let actualTime = await token.licenseExpirationTime(tokenId);
        actualTime.should.be.bignumber.equal(expectedTime);
      });
    });
  });

  describe('when creating a promotional purchase', async () => {
    describe('if a rando is trying it', async () => {
      it('should not be allowed', async () => {
        await assertRevert(
          token.createPromotionalPurchase(firstProduct.id, 1, user3, 0, {
            from: user3
          })
        );
      });
    });
    describe('if the COO is creating it', async () => {
      it('should not allow violation of the total inventory', async () => {
        await token.purchase(firstProduct.id, 1, user3, ZERO_ADDRESS, {
          from: user3,
          value: firstProduct.price
        });
        await token.createPromotionalPurchase(firstProduct.id, 1, user3, 0, {
          from: coo
        });
        await assertRevert(
          token.createPromotionalPurchase(firstProduct.id, 1, user3, 0, {
            from: coo
          })
        );
      });
      it('should not allow violation of the total supply', async () => {
        await token.purchase(firstProduct.id, 1, user3, ZERO_ADDRESS, {
          from: user3,
          value: firstProduct.price
        });
        await token.createPromotionalPurchase(firstProduct.id, 1, user3, 0, {
          from: coo
        });
        await assertRevert(
          token.incrementInventory(firstProduct.id, 1, {
            from: coo
          })
        );
      });
      it('should decrement the inventory', async () => {
        (await token.availableInventoryOf(
          firstProduct.id
        )).should.be.bignumber.equal(2);
        await token.createPromotionalPurchase(firstProduct.id, 1, user3, 0, {
          from: coo
        });
        (await token.availableInventoryOf(
          firstProduct.id
        )).should.be.bignumber.equal(1);
      });
      it('should count the amount sold', async () => {
        (await token.totalSold(firstProduct.id)).should.be.bignumber.equal(0);
        await token.createPromotionalPurchase(firstProduct.id, 1, user3, 0, {
          from: coo
        });
        (await token.totalSold(firstProduct.id)).should.be.bignumber.equal(1);
      });
    });
  });

  describe('when renewing a subscription', async () => {
    let tokenId: any;
    let issuedEvent: any;
    beforeEach(async () => {
      const { logs } = await token.purchase(
        secondProduct.id,
        1,
        user1,
        ZERO_ADDRESS,
        {
          value: secondProduct.price
        }
      );
      issuedEvent = eventByName(logs, 'LicenseIssued');
      tokenId = issuedEvent.args.licenseId;
    });

    describe('it fails because', async () => {
      it('should not allow zero cycles', async () => {
        await assertRevert(
          token.renew(tokenId, 0, {
            value: secondProduct.price
          })
        );
      });

      it('should require that the token has an owner', async () => {
        await assertRevert(
          token.renew(100, 1, {
            value: secondProduct.price
          })
        );
      });
      it('should not allow renewing a non-subscription product', async () => {
        const { logs } = await token.purchase(
          firstProduct.id,
          1,
          user1,
          ZERO_ADDRESS,
          {
            value: firstProduct.price
          }
        );
        const issuedEvent = eventByName(logs, 'LicenseIssued');
        const tokenId = issuedEvent.args.licenseId;

        await assertRevert(
          token.renew(tokenId, 1, {
            value: firstProduct.price
          })
        );
      });
      describe('and the admins set a product to be unrenewable', async () => {
        beforeEach(async () => {
          let isRenewable = await token.renewableOf(secondProduct.id);
          isRenewable.should.be.true();
          await token.setRenewable(secondProduct.id, false, { from: ceo });
          isRenewable = await token.renewableOf(secondProduct.id);
          isRenewable.should.be.false();
        });

        it('should not allow renewing a non-renewable product', async () => {
          await assertRevert(
            token.renew(tokenId, 1, {
              value: secondProduct.price
            })
          );
        });
      });
      it('should not allow an underpaid value', async () => {
        await assertRevert(
          token.renew(tokenId, 2, {
            value: secondProduct.price * 2 - 1
          })
        );
      });
      it('should not allow an overpaid value', async () => {
        await assertRevert(
          token.renew(tokenId, 2, {
            value: secondProduct.price * 2 + 1
          })
        );
      });
      describe('and the contract is paused it', async () => {
        beforeEach(async () => {
          await token.pause({ from: ceo });
        });
        it('should not work', async () => {
          await assertRevert(
            token.renew(tokenId, 2, {
              value: secondProduct.price * 2
            })
          );
        });
      });
    });
    describe('and succeeds', async () => {
      describe('when the renewal time is in the past', async () => {
        beforeEach(async () => {
          const originalExpirationTime = await token.licenseExpirationTime(
            tokenId
          );
          await increaseTime(secondProduct.interval + 1);
          originalExpirationTime.should.be.bignumber.greaterThan(0);
          let now = await latestTime();
          now.should.be.bignumber.greaterThan(originalExpirationTime);
        });

        it('should renew from now forward', async () => {
          let now = await latestTime();
          await token.renew(tokenId, 2, {
            value: secondProduct.price * 2
          });
          const expectedExpirationTime = new BigNumber(now).add(
            secondProduct.interval * 2
          );
          const actualExpirationTime = await token.licenseExpirationTime(
            tokenId
          );
          actualExpirationTime.should.be.bignumber.equal(
            expectedExpirationTime
          );
        });
      });

      describe('when the renewal time is in the future', async () => {
        let originalExpirationTime: any;
        beforeEach(async () => {
          originalExpirationTime = await token.licenseExpirationTime(tokenId);
          originalExpirationTime.should.be.bignumber.greaterThan(0);
          await token.renew(tokenId, 2, {
            value: secondProduct.price * 2
          });
        });

        it('should add time to the existing renewal time', async () => {
          let expectedTime = originalExpirationTime.add(
            secondProduct.interval * 2
          );
          let actualTime = await token.licenseExpirationTime(tokenId);
          actualTime.should.be.bignumber.equal(expectedTime);
        });
      });

      it('should emit a LicenseRenewal event', async () => {
        const originalExpirationTime = await token.licenseExpirationTime(
          tokenId
        );
        const expectedExpirationTime = originalExpirationTime.add(
          secondProduct.interval * 2
        );

        const { logs } = await token.renew(tokenId, 2, {
          value: secondProduct.price * 2
        });

        const renewalEvent = eventByName(logs, 'LicenseRenewal');
        renewalEvent.args.licenseId.should.be.bignumber.equal(tokenId);
        renewalEvent.args.productId.should.be.bignumber.equal(secondProduct.id);
        renewalEvent.args.expirationTime.should.be.bignumber.equal(
          expectedExpirationTime
        );
      });
    });
  });

  describe('when renewing a promotional subscription', async () => {
    describe('and an admin is sending', async () => {
      it('should not allow renewing a non-subscription product', async () => {
        const { logs } = await token.purchase(
          firstProduct.id,
          1,
          user1,
          ZERO_ADDRESS,
          {
            value: firstProduct.price
          }
        );
        const issuedEvent = eventByName(logs, 'LicenseIssued');
        const tokenId = issuedEvent.args.licenseId;
        await assertRevert(
          token.createPromotionalRenewal(tokenId, 1, { from: ceo })
        );
      });
      describe('and the product is a subscription product', async () => {
        let tokenId: any;
        beforeEach(async () => {
          const { logs } = await token.purchase(
            secondProduct.id,
            1,
            user1,
            ZERO_ADDRESS,
            {
              value: secondProduct.price
            }
          );
          const issuedEvent = eventByName(logs, 'LicenseIssued');
          tokenId = issuedEvent.args.licenseId;
        });

        describe('if the admins have set a product to be unrenewable', async () => {
          beforeEach(async () => {
            let isRenewable = await token.renewableOf(secondProduct.id);
            isRenewable.should.be.true();
            await token.setRenewable(secondProduct.id, false, { from: ceo });
            isRenewable = await token.renewableOf(secondProduct.id);
            isRenewable.should.be.false();
          });

          it('should not allow renewing a non-renewable product', async () => {
            await assertRevert(
              token.createPromotionalRenewal(tokenId, 1, { from: ceo })
            );
          });
        });
        describe('and the contract is paused', async () => {
          beforeEach(async () => {
            await token.pause({ from: ceo });
          });
          it('should not work', async () => {
            await assertRevert(
              token.createPromotionalRenewal(tokenId, 1, { from: ceo })
            );
          });
        });
        it('should renew according to the product time', async () => {
          const originalExpirationTime = await token.licenseExpirationTime(
            tokenId
          );
          originalExpirationTime.should.be.bignumber.greaterThan(0);
          token.createPromotionalRenewal(tokenId, 1, { from: ceo });

          let expectedTime = originalExpirationTime.add(secondProduct.interval);
          let actualTime = await token.licenseExpirationTime(tokenId);
          actualTime.should.be.bignumber.equal(expectedTime);
        });
      });
    });

    describe('and a rando is sending', async () => {
      let tokenId: any;
      beforeEach(async () => {
        const { logs } = await token.purchase(
          secondProduct.id,
          1,
          user1,
          ZERO_ADDRESS,
          {
            value: secondProduct.price
          }
        );
        const issuedEvent = eventByName(logs, 'LicenseIssued');
        tokenId = issuedEvent.args.licenseId;
      });

      it('should not be allowed', async () => {
        await assertRevert(
          token.createPromotionalRenewal(tokenId, 1, { from: user1 })
        );
      });
    });
  });
});

///
