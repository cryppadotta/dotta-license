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
const { LicenseCoreTest } = new Artifacts(artifacts);
const LicenseCore = LicenseCoreTest;
chai.should();

const web3: Web3 = (global as any).web3;
const ETH_STRING = web3.toWei(1, 'ether');
const FINNEY_STRING = web3.toWei(1, 'finney');
const ETH_BN = new BigNumber(ETH_STRING);
const FINNEY_BN = new BigNumber(FINNEY_STRING);

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

    p1Created = await token.createProduct(
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
  });

  describe('when purchasing', async () => {
    describe('it should fail because it', async () => {
      it('should not sell a product that has no inventory', async () => {
        await token.clearInventory(firstProduct.id, { from: ceo });
        await assertRevert(
          token.purchase(firstProduct.id, user1, {
            from: user1,
            value: firstProduct.price
          })
        );
      });
      it('should not sell a product that was sold out', async () => {
        await token.purchase(firstProduct.id, user1, {
          from: user1,
          value: firstProduct.price
        });
        await token.purchase(firstProduct.id, user2, {
          from: user2,
          value: firstProduct.price
        });
        await assertRevert(
          token.purchase(firstProduct.id, user3, {
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
          token.purchase(firstProduct.id, user1, {
            from: user1,
            value: firstProduct.price - 1
          })
        );
        await assertRevert(
          token.purchase(firstProduct.id, user1, {
            from: user1,
            value: 0
          })
        );
      });
      it('should not sell at a price too high', async () => {
        await assertRevert(
          token.purchase(firstProduct.id, user1, {
            from: user1,
            value: firstProduct.price + 1
          })
        );
      });
      it('should not sell if the contract is paused', async () => {
        await token.pause({ from: ceo });
        await assertRevert(
          token.purchase(firstProduct.id, user1, {
            from: user1,
            value: firstProduct.price + 1
          })
        );
      });
    });

    describe('and it succeeds', async () => {
      let tokenId: any;
      let issuedEvent: any;
      beforeEach(async () => {
        const { logs } = await token.purchase(firstProduct.id, user1, {
          value: firstProduct.price
        });
        issuedEvent = eventByName(logs, 'Issued');
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
          const [productId, attributes, issuedTime] = await token.licenseInfo(
            tokenId
          );
          productId.should.be.bignumber.equal(firstProduct.id);
          attributes.should.not.be.bignumber.equal(0);
          issuedTime.should.not.be.bignumber.equal(0);
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
        it('should transfer the license to the new owner', async () => {
          const originalOwner = await token.ownerOf(tokenId);
          originalOwner.should.be.equal(user1);

          await token.transfer(user3, tokenId, { from: user1 });
          const newOwner = await token.ownerOf(tokenId);
          newOwner.should.be.equal(user3);

          const productId = await token.licenseProductId(tokenId);
          productId.should.be.bignumber.equal(firstProduct.id);
        });
      });
    });
  });

  describe('when creating a promotional purchase', async () => {
    describe('if a rando is trying it', async () => {
      it('should not be allowed', async () => {
        await assertRevert(
          token.createPromotionalPurchase(firstProduct.id, user3, 0, {
            from: user3
          })
        );
      });
    });
    describe('if the COO is creating it', async () => {
      it('should not allow violation of the total inventory', async () => {
        await token.purchase(firstProduct.id, user3, {
          from: user3,
          value: firstProduct.price
        });
        await token.createPromotionalPurchase(firstProduct.id, user3, 0, {
          from: coo
        });
        await assertRevert(
          token.createPromotionalPurchase(firstProduct.id, user3, 0, {
            from: coo
          })
        );
      });
      it('should not allow violation of the total supply', async () => {
        await token.purchase(firstProduct.id, user3, {
          from: user3,
          value: firstProduct.price
        });
        await token.createPromotionalPurchase(firstProduct.id, user3, 0, {
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
        await token.createPromotionalPurchase(firstProduct.id, user3, 0, {
          from: coo
        });
        (await token.availableInventoryOf(
          firstProduct.id
        )).should.be.bignumber.equal(1);
      });
      it('should count the amount sold', async () => {
        (await token.totalSold(firstProduct.id)).should.be.bignumber.equal(0);
        await token.createPromotionalPurchase(firstProduct.id, user3, 0, {
          from: coo
        });
        (await token.totalSold(firstProduct.id)).should.be.bignumber.equal(1);
      });
    });
  });
});

///
