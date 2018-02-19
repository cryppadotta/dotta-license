import * as chai from 'chai';
import BigNumber from 'bignumber.js';
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
    await token.setCEO(ceo);
    await token.setCFO(cfo);
    await token.setCOO(coo);
  });

  describe('when creating products', async () => {
    let p1Created: any;
    beforeEach(async () => {
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

    it('should create the first product', async () => {
      const [price, inventory] = await token.productInfo(firstProduct.id);
      price.toNumber().should.equal(firstProduct.price);
      inventory.toNumber().should.equal(firstProduct.initialInventory);
    });

    it('should create the second product', async () => {
      const [price, inventory] = await token.productInfo(secondProduct.id);
      price.toNumber().should.equal(secondProduct.price);
      inventory.toNumber().should.equal(secondProduct.initialInventory);
    });
    it('should emit a ProductCreated event', async () => {
      const { logs } = p1Created;
      logs.length.should.be.equal(1);
      logs[0].event.should.be.eq('ProductCreated');
      logs[0].args.product.should.be.bignumber.equal(firstProduct.id);
      logs[0].args.price.should.be.bignumber.equal(firstProduct.price);
      logs[0].args.quantity.should.be.bignumber.equal(
        firstProduct.initialInventory
      );
    });
    it('should be able to get all products that exist');
    it('should not be able to create a product with the same id');
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
    it('should set the inventory to a fixed amount');
    it('should increment the inventory');
    it('should decrement the inventory');
    it('should not decrement when the inventory is zero');
    it('should emit a ProductInventoryChanged event');
    describe('and minding permissions', async () => {
      it('should not allow a rando to create a product');
      it('should allow the CEO or COO to create a product');
    });
  });
  describe('when changing prices', async () => {
    it('should change the price');
    it('should emit a ProductPriceChanged event');
  });
});
