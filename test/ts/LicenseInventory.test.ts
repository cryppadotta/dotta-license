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
    initialInventory: 2
  };

  const secondProduct = {
    id: 2,
    price: 2000,
    initialInventory: 3
  };

  beforeEach(async () => {
    token = await LicenseCore.new({ from: creator });
  });

  describe('when creating products', async () => {
    beforeEach(async () => {
      await token.createProduct(
        firstProduct.id,
        firstProduct.price,
        firstProduct.initialInventory
      );

      await token.createProduct(
        secondProduct.id,
        secondProduct.price,
        secondProduct.initialInventory
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
    it('should allow a free product');
    it('should emit a ProductCreated event');
    it('should be able to get all products that exist');
    describe('and minding permissions', async () => {
      it('should not allow a rando to create a product');
      it('should allow the CEO or COO to create a product');
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
