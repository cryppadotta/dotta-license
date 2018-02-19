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
      it('should not sell a product that has no inventory');
      it('should not sell at a price too low');
      it('should not sell at a price too high');
      it('should not sell if the contract is paused');
    });

    describe('and it succeeds', async () => {
      beforeEach(async () => {
        await token.purchase(firstProduct.id, user1, {
          value: firstProduct.price
        });
      });
      it('should create a purchase');
      it('should decrement the inventory', async () => {
        (await token.availableInventoryOf(
          firstProduct.id
        )).should.be.bignumber.equal(1);
      });
      it('should track the number sold');
      describe('the resulting License', async () => {
        it('should keep track of the license id');
        it('should store a new License');
        it('should emit an Issued event');
        it('should have an issued time');
        it('should have attributes');
        it('should transfer the license to the new owner');
      });
    });
  });

  describe('when creating a promotional purchase', async () => {
    it('should not allow a rando');
    it('should allow the COO');
    it('should not allow violation of the total supply');
    it('should require appropriate inventory');
    it('should decrement the inventory');
    it('should count the amount sold');
  });
});

///
