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

contract('ERC721Token', (accounts: string[]) => {
  let token: any = null;
  const creator = accounts[0];
  const _creator = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  const ceo = accounts[4];
  const cfo = accounts[5];
  const coo = accounts[6];
  const _firstTokenId = 1;
  const _secondTokenId = 2;
  const _unknownTokenId = 312389234752;
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

    await token.purchase(firstProduct.id, user1, {
      from: user1,
      value: firstProduct.price
    });

    await token.purchase(firstProduct.id, user1, {
      from: coo,
      value: firstProduct.price
    });

    await token.purchase(secondProduct.id, user2, {
      from: coo,
      value: secondProduct.price
    });
  });

  describe('totalSupply', async () => {
    it('has a total supply equivalent to the inital supply', async () => {
      const totalSupply = await token.totalSupply();
      totalSupply.should.be.bignumber.equal(3);
    });
  });

  describe('balanceOf', async () => {
    describe('when the given address owns some tokens', async () => {
      it('returns the amount of tokens owned by the given address', async () => {
        const balance = await token.balanceOf(user1);
        balance.should.be.bignumber.equal(2);
      });
    });

    describe('when the given address does not own any tokens', async () => {
      it('returns 0', async () => {
        const balance = await token.balanceOf(user3);
        balance.should.be.bignumber.equal(0);
      });
    });
  });

  describe('ownerOf', async () => {
    describe('when the given token ID was tracked by this token', async () => {
      it('returns the owner of the given token ID', async () => {
        const owner = await token.ownerOf(_firstTokenId);
        owner.should.be.equal(user1);
      });
    });

    describe('when the given token ID was not tracked by this token', async () => {
      it('reverts', async () => {
        await assertRevert(token.ownerOf(_unknownTokenId));
      });
    });
  });

  /*
  describe('mint', () => {
    describe('when the given token ID was not tracked by this contract', () => {
      const tokenId = _unknownTokenId;

      describe('when the given address is not the zero address', () => {
        const to = accounts[1];

        it('mints the given token ID to the given address', async () => {
          const previousBalance = await token.balanceOf(to);

          await token.mint(to, tokenId);

          const owner = await token.ownerOf(tokenId);
          owner.should.be.equal(to);

          const balance = await token.balanceOf(to);
          balance.should.be.bignumber.equal(previousBalance + 1);
        });

        it('adds that token to the token list of the owner', async () => {
          await token.mint(to, tokenId);

          const tokens = await token.tokensOf(to);
          tokens.length.should.be.equal(1);
          tokens[0].should.be.bignumber.equal(tokenId);
        });

        it('emits a transfer event', async () => {
          const { logs } = await token.mint(to, tokenId);

          logs.length.should.be.equal(1);
          logs[0].event.should.be.eq('Transfer');
          logs[0].args._from.should.be.equal(ZERO_ADDRESS);
          logs[0].args._to.should.be.equal(to);
          logs[0].args._tokenId.should.be.bignumber.equal(tokenId);
        });
      });

      describe('when the given address is the zero address', () => {
        const to = ZERO_ADDRESS;

        it('reverts', async () => {
          await assertRevert(token.mint(to, tokenId));
        });
      });
    });
    */

  /*

    describe('when the given token ID was already tracked by this contract', () => {
      const tokenId = _firstTokenId;

      it('reverts', async () => {
        await assertRevert(token.mint(accounts[1], tokenId));
      });
    });
  });
  */

  /*
  describe('burn', () => {
    describe('when the given token ID was tracked by this contract', () => {
      const tokenId = _firstTokenId;

      describe('when the msg.sender owns given token', () => {
        const sender = _creator;

        it('burns the given token ID and adjusts the balance of the owner', async () => {
          const previousBalance = await token.balanceOf(sender);

          await token.burn(tokenId, { from: sender });

          await assertRevert(token.ownerOf(tokenId));
          const balance = await token.balanceOf(sender);
          balance.should.be.bignumber.equal(previousBalance - 1);
        });

        it('removes that token from the token list of the owner', async () => {
          await token.burn(tokenId, { from: sender });

          const tokens = await token.tokensOf(sender);
          tokens.length.should.be.equal(1);
          tokens[0].should.be.bignumber.equal(_secondTokenId);
        });

        it('emits a burn event', async () => {
          const { logs } = await token.burn(tokenId, { from: sender });

          logs.length.should.be.equal(1);
          logs[0].event.should.be.eq('Transfer');
          logs[0].args._from.should.be.equal(sender);
          logs[0].args._to.should.be.equal(ZERO_ADDRESS);
          logs[0].args._tokenId.should.be.bignumber.equal(tokenId);
        });

        describe('when there is an approval for the given token ID', () => {
          beforeEach(async () => {
            await token.approve(accounts[1], tokenId, { from: sender });
          });

          it('clears the approval', async () => {
            await token.burn(tokenId, { from: sender });
            const approvedAccount = await token.approvedFor(tokenId);
            approvedAccount.should.be.equal(ZERO_ADDRESS);
          });

          it('emits an approval event', async () => {
            const { logs } = await token.burn(tokenId, { from: sender });

            logs.length.should.be.equal(2);

            logs[0].event.should.be.eq('Approval');
            logs[0].args._owner.should.be.equal(sender);
            logs[0].args._approved.should.be.equal(ZERO_ADDRESS);
            logs[0].args._tokenId.should.be.bignumber.equal(tokenId);
          });
        });
      });

      describe('when the msg.sender does not own given token', () => {
        const sender = accounts[1];

        it('reverts', async () => {
          await assertRevert(token.burn(tokenId, { from: sender }));
        });
      });
    });

    describe('when the given token ID was not tracked by this contract', () => {
      const tokenID = _unknownTokenId;

      it('reverts', async () => {
        await assertRevert(token.burn(tokenID, { from: _creator }));
      });
    });
  });
  */

  describe('transfer', () => {
    describe('when the address to transfer the token to is not the zero address', () => {
      const to = user3;

      describe('when the given token ID was tracked by this token', () => {
        const tokenId = _firstTokenId;

        describe('when the msg.sender is the owner of the given token ID', () => {
          const sender = user1;

          it('transfers the ownership of the given token ID to the given address', async () => {
            await token.transfer(to, tokenId, { from: sender });

            const newOwner = await token.ownerOf(tokenId);
            newOwner.should.be.equal(to);
          });

          it('clears the approval for the token ID', async () => {
            await token.approve(user2, tokenId, { from: sender });
            (await token.approvedFor(tokenId)).should.be.equal(user2);

            await token.transfer(to, tokenId, { from: sender });
            const approvedAccount = await token.approvedFor(tokenId);
            approvedAccount.should.be.equal(ZERO_ADDRESS);
          });

          it('emits an approval and transfer events', async () => {
            const { logs } = await token.transfer(to, tokenId, {
              from: sender
            });

            logs.length.should.be.equal(2);

            logs[0].event.should.be.eq('Approval');
            logs[0].args._owner.should.be.equal(sender);
            logs[0].args._approved.should.be.equal(ZERO_ADDRESS);
            logs[0].args._tokenId.should.be.bignumber.equal(tokenId);

            logs[1].event.should.be.eq('Transfer');
            logs[1].args._from.should.be.equal(sender);
            logs[1].args._to.should.be.equal(to);
            logs[1].args._tokenId.should.be.bignumber.equal(tokenId);
          });

          it('adjusts owners balances', async () => {
            const previousBalance = await token.balanceOf(sender);
            await token.transfer(to, tokenId, { from: sender });

            const newOwnerBalance = await token.balanceOf(to);
            newOwnerBalance.should.be.bignumber.equal(1);

            const previousOwnerBalance = await token.balanceOf(_creator);
            previousOwnerBalance.should.be.bignumber.equal(previousBalance - 1);
          });

          it('adds the token to the tokens list of the new owner', async () => {
            await token.transfer(to, tokenId, { from: sender });

            const tokenIDs = await token.tokensOf(to);
            tokenIDs.length.should.be.equal(1);
            tokenIDs[0].should.be.bignumber.equal(tokenId);
          });
        });

        describe('when the msg.sender is not the owner of the given token ID', () => {
          const sender = accounts[2];

          it('reverts', async () => {
            await assertRevert(token.transfer(to, tokenId, { from: sender }));
          });
        });
      });

      describe('when the given token ID was not tracked by this token', () => {
        let tokenId = _unknownTokenId;

        it('reverts', async () => {
          await assertRevert(token.transfer(to, tokenId, { from: _creator }));
        });
      });
    });

    describe('when the address to transfer the token to is the zero address', () => {
      const to = ZERO_ADDRESS;

      it('reverts', async () => {
        await assertRevert(token.transfer(to, 0, { from: _creator }));
      });
    });
  });

  //
  // describe('approve', () => {
  //   describe('when the given token ID was already tracked by this contract', () => {
  //     const tokenId = _firstTokenId;
  //
  //     describe('when the sender owns the given token ID', () => {
  //       const sender = _creator;
  //
  //       describe('when the address that receives the approval is the 0 address', () => {
  //         const to = ZERO_ADDRESS;
  //
  //         describe('when there was no approval for the given token ID before', () => {
  //           it('clears the approval for that token', async () => {
  //             await token.approve(to, tokenId, { from: sender });
  //
  //             const approvedAccount = await token.approvedFor(tokenId);
  //             approvedAccount.should.be.equal(to);
  //           });
  //
  //           it('does not emit an approval event', async () => {
  //             const { logs } = await token.approve(to, tokenId, { from: sender });
  //
  //             logs.length.should.be.equal(0);
  //           });
  //         });
  //
  //         describe('when the given token ID was approved for another account', () => {
  //           beforeEach(async () => {
  //             await token.approve(accounts[2], tokenId, { from: sender });
  //           });
  //
  //           it('clears the approval for the token ID', async () => {
  //             await token.approve(to, tokenId, { from: sender });
  //
  //             const approvedAccount = await token.approvedFor(tokenId);
  //             approvedAccount.should.be.equal(to);
  //           });
  //
  //           it('emits an approval event', async () => {
  //             const { logs } = await token.approve(to, tokenId, { from: sender });
  //
  //             logs.length.should.be.equal(1);
  //             logs[0].event.should.be.eq('Approval');
  //             logs[0].args._owner.should.be.equal(sender);
  //             logs[0].args._approved.should.be.equal(to);
  //             logs[0].args._tokenId.should.be.bignumber.equal(tokenId);
  //           });
  //         });
  //       });
  //
  //       describe('when the address that receives the approval is not the 0 address', () => {
  //         describe('when the address that receives the approval is different than the owner', () => {
  //           const to = accounts[1];
  //
  //           describe('when there was no approval for the given token ID before', () => {
  //             it('approves the token ID to the given address', async () => {
  //               await token.approve(to, tokenId, { from: sender });
  //
  //               const approvedAccount = await token.approvedFor(tokenId);
  //               approvedAccount.should.be.equal(to);
  //             });
  //
  //             it('emits an approval event', async () => {
  //               const { logs } = await token.approve(to, tokenId, { from: sender });
  //
  //               logs.length.should.be.equal(1);
  //               logs[0].event.should.be.eq('Approval');
  //               logs[0].args._owner.should.be.equal(sender);
  //               logs[0].args._approved.should.be.equal(to);
  //               logs[0].args._tokenId.should.be.bignumber.equal(tokenId);
  //             });
  //           });
  //
  //           describe('when the given token ID was approved for the same account', () => {
  //             beforeEach(async () => {
  //               await token.approve(to, tokenId, { from: sender });
  //             });
  //
  //             it('keeps the approval to the given address', async () => {
  //               await token.approve(to, tokenId, { from: sender });
  //
  //               const approvedAccount = await token.approvedFor(tokenId);
  //               approvedAccount.should.be.equal(to);
  //             });
  //
  //             it('emits an approval event', async () => {
  //               const { logs } = await token.approve(to, tokenId, { from: sender });
  //
  //               logs.length.should.be.equal(1);
  //               logs[0].event.should.be.eq('Approval');
  //               logs[0].args._owner.should.be.equal(sender);
  //               logs[0].args._approved.should.be.equal(to);
  //               logs[0].args._tokenId.should.be.bignumber.equal(tokenId);
  //             });
  //           });
  //
  //           describe('when the given token ID was approved for another account', () => {
  //             beforeEach(async () => {
  //               await token.approve(accounts[2], tokenId, { from: sender });
  //             });
  //
  //             it('changes the approval to the given address', async () => {
  //               await token.approve(to, tokenId, { from: sender });
  //
  //               const approvedAccount = await token.approvedFor(tokenId);
  //               approvedAccount.should.be.equal(to);
  //             });
  //
  //             it('emits an approval event', async () => {
  //               const { logs } = await token.approve(to, tokenId, { from: sender });
  //
  //               logs.length.should.be.equal(1);
  //               logs[0].event.should.be.eq('Approval');
  //               logs[0].args._owner.should.be.equal(sender);
  //               logs[0].args._approved.should.be.equal(to);
  //               logs[0].args._tokenId.should.be.bignumber.equal(tokenId);
  //             });
  //           });
  //         });
  //
  //         describe('when the address that receives the approval is the owner', () => {
  //           const to = _creator;
  //
  //           describe('when there was no approval for the given token ID before', () => {
  //             it('reverts', async () => {
  //               await assertRevert(token.approve(to, tokenId, { from: sender }));
  //             });
  //           });
  //
  //           describe('when the given token ID was approved for another account', () => {
  //             beforeEach(async () => {
  //               await token.approve(accounts[2], tokenId, { from: sender });
  //             });
  //
  //             it('reverts', async () => {
  //               await assertRevert(token.approve(to, tokenId, { from: sender }));
  //             });
  //           });
  //         });
  //       });
  //     });
  //
  //     describe('when the sender does not own the given token ID', () => {
  //       const sender = accounts[1];
  //
  //       it('reverts', async () => {
  //         await assertRevert(token.approve(accounts[2], tokenId, { from: sender }));
  //       });
  //     });
  //   });
  //
  //   describe('when the given token ID was not tracked by the contract before', () => {
  //     const tokenId = _unknownTokenId;
  //
  //     it('reverts', async () => {
  //       await assertRevert(token.approve(accounts[1], tokenId, { from: _creator }));
  //     });
  //   });
  // });
  //
  // describe('takeOwnership', () => {
  //   describe('when the given token ID was already tracked by this contract', () => {
  //     const tokenId = _firstTokenId;
  //
  //     describe('when the sender has the approval for the token ID', () => {
  //       const sender = accounts[1];
  //
  //       beforeEach(async () => {
  //         await token.approve(sender, tokenId, { from: _creator });
  //       });
  //
  //       it('transfers the ownership of the given token ID to the given address', async () => {
  //         await token.takeOwnership(tokenId, { from: sender });
  //
  //         const newOwner = await token.ownerOf(tokenId);
  //         newOwner.should.be.equal(sender);
  //       });
  //
  //       it('clears the approval for the token ID', async () => {
  //         await token.takeOwnership(tokenId, { from: sender });
  //
  //         const approvedAccount = await token.approvedFor(tokenId);
  //         approvedAccount.should.be.equal(ZERO_ADDRESS);
  //       });
  //
  //       it('emits an approval and transfer events', async () => {
  //         const { logs } = await token.takeOwnership(tokenId, { from: sender });
  //
  //         logs.length.should.be.equal(2);
  //
  //         logs[0].event.should.be.eq('Approval');
  //         logs[0].args._owner.should.be.equal(_creator);
  //         logs[0].args._approved.should.be.equal(ZERO_ADDRESS);
  //         logs[0].args._tokenId.should.be.bignumber.equal(tokenId);
  //
  //         logs[1].event.should.be.eq('Transfer');
  //         logs[1].args._from.should.be.equal(_creator);
  //         logs[1].args._to.should.be.equal(sender);
  //         logs[1].args._tokenId.should.be.bignumber.equal(tokenId);
  //       });
  //
  //       it('adjusts owners balances', async () => {
  //         const previousBalance = await token.balanceOf(_creator);
  //
  //         await token.takeOwnership(tokenId, { from: sender });
  //
  //         const newOwnerBalance = await token.balanceOf(sender);
  //         newOwnerBalance.should.be.bignumber.equal(1);
  //
  //         const previousOwnerBalance = await token.balanceOf(_creator);
  //         previousOwnerBalance.should.be.bignumber.equal(previousBalance - 1);
  //       });
  //
  //       it('adds the token to the tokens list of the new owner', async () => {
  //         await token.takeOwnership(tokenId, { from: sender });
  //
  //         const tokenIDs = await token.tokensOf(sender);
  //         tokenIDs.length.should.be.equal(1);
  //         tokenIDs[0].should.be.bignumber.equal(tokenId);
  //       });
  //     });
  //
  //     describe('when the sender does not have an approval for the token ID', () => {
  //       const sender = accounts[1];
  //
  //       it('reverts', async () => {
  //         await assertRevert(token.takeOwnership(tokenId, { from: sender }));
  //       });
  //     });
  //
  //     describe('when the sender is already the owner of the token', () => {
  //       const sender = _creator;
  //
  //       it('reverts', async () => {
  //         await assertRevert(token.takeOwnership(tokenId, { from: sender }));
  //       });
  //     });
  //   });
  //
  //   describe('when the given token ID was not tracked by the contract before', () => {
  //     const tokenId = _unknownTokenId;
  //
  //     it('reverts', async () => {
  //       await assertRevert(token.takeOwnership(tokenId, { from: _creator }));
  //     });
  //   });
  // });
});
