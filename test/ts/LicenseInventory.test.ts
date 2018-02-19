import * as chai from 'chai';
import BigNumber from 'bignumber.js';
import * as Web3 from 'web3';
import ethUtil = require('ethereumjs-util');
import { chaiSetup } from './utils/chai_setup';
import { Artifacts } from '../../util/artifacts';
import assertRevert from '../helpers/assertRevert';
import expectThrow from '../helpers/expectThrow';

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

contract('LicenseInventory', (accounts: string[]) => {
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
  });

  describe('when creating products', async () => {
    beforeEach(async () => {});

    it('should create the first product', async () => {
      const [price, inventory, supply] = await token.productInfo(
        firstProduct.id
      );
      price.toNumber().should.equal(firstProduct.price);
      inventory.toNumber().should.equal(firstProduct.initialInventory);
      supply.toNumber().should.equal(firstProduct.supply);
    });

    it('should create the second product', async () => {
      const [price, inventory, supply] = await token.productInfo(
        secondProduct.id
      );
      price.toNumber().should.equal(secondProduct.price);
      inventory.toNumber().should.equal(secondProduct.initialInventory);
      supply.toNumber().should.equal(secondProduct.supply);
    });

    it('should emit a ProductCreated event', async () => {
      const { logs } = p1Created;
      logs.length.should.be.equal(1);
      logs[0].event.should.be.eq('ProductCreated');
      logs[0].args.productId.should.be.bignumber.equal(firstProduct.id);
      logs[0].args.price.should.be.bignumber.equal(firstProduct.price);
      logs[0].args.available.should.be.bignumber.equal(
        firstProduct.initialInventory
      );
      logs[0].args.supply.should.be.bignumber.equal(firstProduct.supply);
    });

    it('should be able to get all products that exist', async () => {
      const productIds = await token.getAllProductIds();
      productIds[0].should.be.bignumber.equal(firstProduct.id);
      productIds[1].should.be.bignumber.equal(secondProduct.id);
    });

    it('should not be able to create a product with the same id', async () => {
      await assertRevert(
        token.createProduct(
          firstProduct.id,
          firstProduct.price,
          firstProduct.initialInventory,
          firstProduct.supply,
          { from: ceo }
        )
      );
    });
    it('should not be able to create a product with more inventory than the total supply', async () => {
      await assertRevert(
        token.createProduct(
          thirdProduct.id,
          thirdProduct.price,
          thirdProduct.supply + 1,
          thirdProduct.supply,
          { from: ceo }
        )
      );
    });
    describe('and minding permissions', async () => {
      it('should not allow a rando to create a product', async () => {
        await assertRevert(
          token.createProduct(
            thirdProduct.id,
            thirdProduct.price,
            thirdProduct.initialInventory,
            thirdProduct.supply,
            { from: user1 }
          )
        );
      });
      it('should not allow the CFO to create a product', async () => {
        await assertRevert(
          token.createProduct(
            thirdProduct.id,
            thirdProduct.price,
            thirdProduct.initialInventory,
            thirdProduct.supply,
            { from: cfo }
          )
        );
      });
    });
  });
  describe('when changing inventories', async () => {
    it('should increment the inventory', async () => {
      (await token.availableInventoryOf(
        secondProduct.id
      )).should.be.bignumber.equal(3);
      await token.incrementInventory(secondProduct.id, 2, { from: ceo });
      (await token.availableInventoryOf(
        secondProduct.id
      )).should.be.bignumber.equal(5);
    });
    it('should decrement the inventory', async () => {
      (await token.availableInventoryOf(
        secondProduct.id
      )).should.be.bignumber.equal(3);
      await token.decrementInventory(secondProduct.id, 3, { from: ceo });
      (await token.availableInventoryOf(
        secondProduct.id
      )).should.be.bignumber.equal(0);
    });

    describe('if the product does not exist', async () => {
      it('should not increment the inventory', async () => {
        await assertRevert(
          token.incrementInventory(1298120398, 2, { from: ceo })
        );
      });

      it('should not decrement the inventory', async () => {
        await assertRevert(
          token.decrementInventory(1298120398, 2, { from: ceo })
        );
      });
    });

    it('should not decrement below zero', async () => {
      await expectThrow(
        token.decrementInventory(
          secondProduct.id,
          secondProduct.initialInventory + 1,
          { from: ceo }
        )
      );
    });
    it('allow clearing inventory to zero', async () => {
      (await token.availableInventoryOf(
        secondProduct.id
      )).should.be.bignumber.equal(3);
      await token.clearInventory(secondProduct.id, { from: ceo });
      (await token.availableInventoryOf(
        secondProduct.id
      )).should.be.bignumber.equal(0);
    });
    it('should not allow setting the inventory greater than the total supply', async () => {
      await assertRevert(
        token.incrementInventory(secondProduct.id, 3, { from: ceo })
      );
    });
    it('should emit a ProductInventoryAdjusted event', async () => {
      const { logs } = await token.incrementInventory(secondProduct.id, 2, {
        from: ceo
      });
      logs.length.should.be.equal(1);
      logs[0].event.should.be.eq('ProductInventoryAdjusted');
      logs[0].args.productId.should.be.bignumber.equal(firstProduct.id);
      logs[0].args.available.should.be.bignumber.equal(
        secondProduct.initialInventory + 2
      );
    });
    describe('and minding permissions', async () => {
      it('should not allow a rando to change inventory', async () => {
        await assertRevert(
          token.incrementInventory(secondProduct.id, 1, { from: user1 })
        );
      });
    });
  });
  describe('when changing prices', async () => {
    it('should change the price', async () => {
      (await token.priceOf(secondProduct.id)).should.be.bignumber.equal(
        secondProduct.price
      );
      token.setPrice(secondProduct.id, 1234567, { from: ceo });
      (await token.priceOf(secondProduct.id)).should.be.bignumber.equal(
        1234567
      );
    });
    it('should not allow a rando to change the price', async () => {
      await assertRevert(token.setPrice(secondProduct.id, 1, { from: user1 }));
    });
    it('should emit a ProductPriceChanged event', async () => {
      const { logs } = token.setPrice(secondProduct.id, 1234567, { from: ceo });
      logs.length.should.be.equal(1);
      logs[0].event.should.be.eq('ProductPriceChanged');
      logs[0].args.productId.should.be.bignumber.equal(firstProduct.id);
      logs[0].args.price.should.be.bignumber.equal(1234567);
    });
  });
});

///
