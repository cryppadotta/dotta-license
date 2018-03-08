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

chaiSetup.configure();
const expect = chai.expect;
const { LicenseCoreTest, MockTokenReceiver } = new Artifacts(artifacts);
const LicenseCore = LicenseCoreTest;
chai.should();

const web3: Web3 = (global as any).web3;

contract('LicenseOwnership (ERC721)', (accounts: string[]) => {
  let token: any = null;
  const creator = accounts[0];
  const _creator = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  const ceo = accounts[4];
  const cfo = accounts[5];
  const coo = accounts[6];
  const user4 = accounts[7];
  const user5 = accounts[8];
  const operator = accounts[9];
  const _zeroethTokenId = 0;
  const _firstTokenId = 1;
  const _secondTokenId = 2;
  const _unknownTokenId = 312389234752;
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

    await token.setTokenMetadataBaseURI('http://localhost/', { from: ceo });

    await token.unpause({ from: ceo });

    await token.purchase(firstProduct.id, 1, user1, ZERO_ADDRESS, {
      from: user1,
      value: firstProduct.price
    });

    await token.purchase(firstProduct.id, 1, user1, ZERO_ADDRESS, {
      from: coo,
      value: firstProduct.price
    });

    await token.purchase(secondProduct.id, 1, user2, ZERO_ADDRESS, {
      from: coo,
      value: secondProduct.price
    });
  });

  describe('name', async () => {
    it('it has a name', async () => {
      const name = await token.name();
      name.should.be.eq('Dottabot');
    });
  });

  describe('symbol', async () => {
    it('it has a symbol', async () => {
      const symbol = await token.symbol();
      symbol.should.be.eq('DOTTA');
    });
  });

  describe('when detecting implementations', async () => {
    it('it implementsERC721', async () => {
      (await token.implementsERC721()).should.be.true();
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

  describe('tokenMetadataBaseURI', async () => {
    it('should return the base URL', async () => {
      const baseUrl = await token.tokenMetadataBaseURI();
      baseUrl.should.be.equal('http://localhost/');
    });
  });

  describe('minting', () => {
    describe('when the given token ID was not tracked by this contract', () => {
      describe('when the given address is not the zero address', () => {
        const to = user1;

        it('mints the given token ID to the given address', async () => {
          const previousBalance = await token.balanceOf(to);

          const { logs } = await token.purchase(
            secondProduct.id,
            1,
            to,
            ZERO_ADDRESS,
            {
              from: to,
              value: secondProduct.price
            }
          );
          const transferEvent = eventByName(logs, 'Transfer');
          const tokenId = transferEvent.args._tokenId;

          const owner = await token.ownerOf(tokenId);

          owner.should.be.equal(to);
          const balance = await token.balanceOf(to);
          balance.should.be.bignumber.equal(previousBalance.toNumber() + 1);
        });

        it('adds that token to the token list of the owner', async () => {
          const { logs } = await token.purchase(
            secondProduct.id,
            1,
            user3,
            ZERO_ADDRESS,
            {
              from: user1,
              value: secondProduct.price
            }
          );
          const transferEvent = eventByName(logs, 'Transfer');
          const tokenId = transferEvent.args._tokenId;

          const tokens = await token.tokensOf(user3);
          tokens.length.should.be.equal(1);
          tokens[0].should.be.bignumber.equal(tokenId);
        });

        it('emits a transfer event', async () => {
          const { logs } = await token.purchase(
            secondProduct.id,
            1,
            to,
            ZERO_ADDRESS,
            {
              from: user1,
              value: secondProduct.price
            }
          );

          logs.length.should.be.equal(2);
          logs[1].event.should.be.eq('Transfer');
          logs[1].args._from.should.be.equal(ZERO_ADDRESS);
          logs[1].args._to.should.be.equal(to);
          // logs[0].args._tokenId.should.be.bignumber.equal(tokenId);
        });
      });

      describe('when the given address is the zero address', () => {
        const to = ZERO_ADDRESS;

        it('reverts', async () => {
          await assertRevert(
            token.purchase(secondProduct.id, 1, to, ZERO_ADDRESS, {
              from: user1,
              value: secondProduct.price
            })
          );
        });
      });
    });
  });

  describe('transfer', () => {
    describe('when the address to transfer the token to is not the zero address', () => {
      const to = user3;

      describe('when the given token ID was tracked by this token', () => {
        const tokenId = _firstTokenId;

        describe('when the msg.sender is the owner of the given token ID', () => {
          const sender = user1;
          beforeEach(async () => {
            const originalOwner = await token.ownerOf(tokenId);
            originalOwner.should.be.equal(sender);
          });

          it('transfers the ownership of the given token ID to the given address', async () => {
            await token.transfer(to, tokenId, { from: sender });

            const newOwner = await token.ownerOf(tokenId);
            newOwner.should.be.equal(to);
          });

          it('clears the approval for the token ID', async () => {
            await token.approve(user2, tokenId, { from: sender });
            (await token.getApproved(tokenId)).should.be.equal(user2);

            await token.transfer(to, tokenId, { from: sender });
            const approvedAccount = await token.getApproved(tokenId);
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

            const previousOwnerBalance = await token.balanceOf(sender);
            previousOwnerBalance.should.be.bignumber.equal(previousBalance - 1);
          });

          it('adds the token to the tokens list of the new owner', async () => {
            await token.transfer(to, tokenId, { from: sender });

            const tokenIDs = await token.tokensOf(to);
            tokenIDs.length.should.be.equal(1);
            tokenIDs[0].should.be.bignumber.equal(tokenId);
          });

          describe('when it is paused', async () => {
            beforeEach(async () => {
              await token.pause({ from: ceo });
            });
            it('reverts', async () => {
              await assertRevert(token.transfer(to, tokenId, { from: sender }));
            });
          });
        });

        describe('when the msg.sender is not the owner of the given token ID', () => {
          const sender = user2;

          it('reverts when trying to send to someone else', async () => {
            await assertRevert(token.transfer(to, tokenId, { from: sender }));
          });

          it('reverts when trying to send to itself', async () => {
            await assertRevert(
              token.transfer(sender, tokenId, { from: sender })
            );
          });
        });
      });

      describe('when the given token ID was not tracked by this token', () => {
        const tokenId = _unknownTokenId;

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

  describe('approve', () => {
    describe('when the given token ID was already tracked by this contract', () => {
      const tokenId = _firstTokenId;

      describe('when the sender owns the given token ID', () => {
        const sender = user1;

        describe('when the address that receives the approval is the 0 address', () => {
          const to = ZERO_ADDRESS;

          describe('when there was no approval for the given token ID before', () => {
            it('clears the approval for that token', async () => {
              await token.approve(to, tokenId, { from: sender });

              const approvedAccount = await token.getApproved(tokenId);
              approvedAccount.should.be.equal(to);
            });

            it('does not emit an approval event', async () => {
              const { logs } = await token.approve(to, tokenId, {
                from: sender
              });

              logs.length.should.be.equal(0);
            });
          });

          describe('when the given token ID was approved for another account', () => {
            beforeEach(async () => {
              await token.approve(user4, tokenId, { from: sender });
            });

            it('clears the approval for the token ID', async () => {
              await token.approve(to, tokenId, { from: sender });

              const approvedAccount = await token.getApproved(tokenId);
              approvedAccount.should.be.equal(to);
            });

            it('emits an approval event', async () => {
              const { logs } = await token.approve(to, tokenId, {
                from: sender
              });

              logs.length.should.be.equal(1);
              logs[0].event.should.be.eq('Approval');
              logs[0].args._owner.should.be.equal(sender);
              logs[0].args._approved.should.be.equal(to);
              logs[0].args._tokenId.should.be.bignumber.equal(tokenId);
            });
          });
        });

        describe('when the address that receives the approval is not the 0 address', () => {
          describe('when the address that receives the approval is different than the owner', () => {
            const to = user3;

            describe('when there was no approval for the given token ID before', () => {
              it('approves the token ID to the given address', async () => {
                await token.approve(to, tokenId, { from: sender });

                const approvedAccount = await token.getApproved(tokenId);
                approvedAccount.should.be.equal(to);
              });

              it('emits an approval event', async () => {
                const { logs } = await token.approve(to, tokenId, {
                  from: sender
                });

                logs.length.should.be.equal(1);
                logs[0].event.should.be.eq('Approval');
                logs[0].args._owner.should.be.equal(sender);
                logs[0].args._approved.should.be.equal(to);
                logs[0].args._tokenId.should.be.bignumber.equal(tokenId);
              });
            });

            describe('when the given token ID was approved for the same account', () => {
              beforeEach(async () => {
                await token.approve(to, tokenId, { from: sender });
              });

              it('keeps the approval to the given address', async () => {
                await token.approve(to, tokenId, { from: sender });

                const approvedAccount = await token.getApproved(tokenId);
                approvedAccount.should.be.equal(to);
              });

              it('emits an approval event', async () => {
                const { logs } = await token.approve(to, tokenId, {
                  from: sender
                });

                logs.length.should.be.equal(1);
                logs[0].event.should.be.eq('Approval');
                logs[0].args._owner.should.be.equal(sender);
                logs[0].args._approved.should.be.equal(to);
                logs[0].args._tokenId.should.be.bignumber.equal(tokenId);
              });
            });

            describe('when the given token ID was approved for another account', () => {
              beforeEach(async () => {
                await token.approve(user4, tokenId, { from: sender });
              });

              it('changes the approval to the given address', async () => {
                await token.approve(to, tokenId, { from: sender });

                const approvedAccount = await token.getApproved(tokenId);
                approvedAccount.should.be.equal(to);
              });

              it('emits an approval event', async () => {
                const { logs } = await token.approve(to, tokenId, {
                  from: sender
                });

                logs.length.should.be.equal(1);
                logs[0].event.should.be.eq('Approval');
                logs[0].args._owner.should.be.equal(sender);
                logs[0].args._approved.should.be.equal(to);
                logs[0].args._tokenId.should.be.bignumber.equal(tokenId);
              });
            });
          });

          describe('when the address that receives the approval is the owner', () => {
            const to = user1;

            describe('when there was no approval for the given token ID before', () => {
              it('reverts', async () => {
                await assertRevert(
                  token.approve(to, tokenId, { from: sender })
                );
              });
            });

            describe('when the given token ID was approved for another account', () => {
              beforeEach(async () => {
                await token.approve(user2, tokenId, { from: sender });
              });

              it('reverts', async () => {
                await assertRevert(
                  token.approve(to, tokenId, { from: sender })
                );
              });
            });
          });
        });
      });

      describe('when the sender does not own the given token ID', () => {
        const sender = user2;

        it('reverts', async () => {
          await assertRevert(token.approve(user3, tokenId, { from: sender }));
        });
      });
    });

    describe('when the given token ID was not tracked by the contract before', () => {
      const tokenId = _unknownTokenId;

      it('reverts', async () => {
        await assertRevert(token.approve(user2, tokenId, { from: _creator }));
      });
    });
  });

  describe('approveAll', async () => {
    describe('when the sender approves an operator', async () => {
      const tokenId = _firstTokenId; // owned by user1
      let approvalEvent: any;
      beforeEach(async () => {
        const { logs } = await token.approveAll(operator, { from: user1 });
        approvalEvent = eventByName(logs, 'ApprovalForAll');
      });
      it('should emit an ApprovalForAll event', async () => {
        approvalEvent.args._owner.should.be.equal(user1);
        approvalEvent.args._operator.should.be.equal(operator);
        approvalEvent.args._approved.should.be.true();
      });
      describe('and the operator is the sender', async () => {
        const sender = operator;
        it('should allow the operator to take ownership of a token with takeOwnership', async () => {
          const originalOwner = await token.ownerOf(tokenId);
          originalOwner.should.be.equal(user1);

          await token.takeOwnership(tokenId, { from: operator });

          const newOwner = await token.ownerOf(tokenId);
          newOwner.should.be.equal(operator);
        });
        it('should allow the operator to transfer ownership to someone else with transferFrom', async () => {
          const originalOwner = await token.ownerOf(tokenId);
          originalOwner.should.be.equal(user1);

          await token.transferFrom(user1, user3, tokenId, { from: operator });

          const newOwner = await token.ownerOf(tokenId);
          newOwner.should.be.equal(user3);
        });

        it('should read that the operator is approved', async () => {
          const isApproved = await token.isApprovedForAll(user1, operator, {
            from: operator
          });
          isApproved.should.be.true();
        });

        describe('and the user has subsequently disapproved the operator', async () => {
          beforeEach(async () => {
            const { logs } = await token.disapproveAll(operator, {
              from: user1
            });
            approvalEvent = eventByName(logs, 'ApprovalForAll');
          });
          it('should emit an ApprovalForAll event', async () => {
            approvalEvent.args._owner.should.be.equal(user1);
            approvalEvent.args._operator.should.be.equal(operator);
            approvalEvent.args._approved.should.be.false();
          });
          it('should not allow the operator to takeOwnership', async () => {
            await assertRevert(
              token.takeOwnership(tokenId, { from: operator })
            );
          });
          it('should not allow the operator to use transferFrom', async () => {
            await assertRevert(
              token.transferFrom(user1, user3, tokenId, { from: operator })
            );
          });

          it('should read that the operator is not approved', async () => {
            const isApproved = await token.isApprovedForAll(user1, operator, {
              from: operator
            });
            isApproved.should.be.false();
          });
          describe('and a rando tries to send too', async () => {
            it('should not allow a rando to takeOwnership', async () => {
              await assertRevert(token.takeOwnership(tokenId, { from: user2 }));
            });

            it('should not allow a rando to transferFrom', async () => {
              await assertRevert(
                token.transferFrom(user1, user3, tokenId, { from: user2 })
              );
            });
          });
        });
      });
      describe('and a rando is the sender', async () => {
        it('should not allow a rando to takeOwnership', async () => {
          await assertRevert(token.takeOwnership(tokenId, { from: user2 }));
        });

        it('should not allow a rando to transferFrom', async () => {
          await assertRevert(
            token.transferFrom(user1, user3, tokenId, { from: user2 })
          );
        });
      });
    });
  });

  describe('setApprovalForAll', async () => {
    describe('when approving and disapproving', async () => {
      it('should set approval appropriately', async () => {
        (await token.isApprovedForAll(user1, operator, {
          from: operator
        })).should.be.false();
        await token.setApprovalForAll(operator, true, { from: user1 });
        (await token.isApprovedForAll(user1, operator, {
          from: operator
        })).should.be.true();
        await token.setApprovalForAll(operator, false, { from: user1 });
        (await token.isApprovedForAll(user1, operator, {
          from: operator
        })).should.be.false();
      });
    });
  });

  describe('takeOwnership', () => {
    describe('when the given token ID was already tracked by this contract', () => {
      const tokenId = _firstTokenId;

      describe('when the sender has the approval for the token ID', () => {
        const sender = user3;
        const approver = user1;

        beforeEach(async () => {
          await token.approve(sender, tokenId, { from: approver });
        });

        it('transfers the ownership of the given token ID to the given address', async () => {
          await token.takeOwnership(tokenId, { from: sender });

          const newOwner = await token.ownerOf(tokenId);
          newOwner.should.be.equal(sender);
        });

        it('clears the approval for the token ID', async () => {
          await token.takeOwnership(tokenId, { from: sender });

          const approvedAccount = await token.getApproved(tokenId);
          approvedAccount.should.be.equal(ZERO_ADDRESS);
        });

        it('emits an approval and transfer events', async () => {
          const { logs } = await token.takeOwnership(tokenId, { from: sender });

          logs.length.should.be.equal(2);

          logs[0].event.should.be.eq('Approval');
          logs[0].args._owner.should.be.equal(approver);
          logs[0].args._approved.should.be.equal(ZERO_ADDRESS);
          logs[0].args._tokenId.should.be.bignumber.equal(tokenId);

          logs[1].event.should.be.eq('Transfer');
          logs[1].args._from.should.be.equal(approver);
          logs[1].args._to.should.be.equal(sender);
          logs[1].args._tokenId.should.be.bignumber.equal(tokenId);
        });

        it('adjusts owners balances', async () => {
          const previousBalance = await token.balanceOf(approver);

          await token.takeOwnership(tokenId, { from: sender });

          const newOwnerBalance = await token.balanceOf(sender);
          newOwnerBalance.should.be.bignumber.equal(1);

          const previousOwnerBalance = await token.balanceOf(approver);
          previousOwnerBalance.should.be.bignumber.equal(previousBalance - 1);
        });

        it('adds the token to the tokens list of the new owner', async () => {
          await token.takeOwnership(tokenId, { from: sender });

          const tokenIDs = await token.tokensOf(sender);
          tokenIDs.length.should.be.equal(1);
          tokenIDs[0].should.be.bignumber.equal(tokenId);
        });

        describe('when the token is being transferred to a third party', async () => {
          it('should transfer the token');
        });
      });

      describe('when the sender does not have an approval for the token ID', () => {
        const sender = user2;

        it('reverts', async () => {
          await assertRevert(token.takeOwnership(tokenId, { from: sender }));
        });

        describe('and the token is being transferred to a third party', async () => {
          it('reverts', async () => {
            await assertRevert(
              token.transferFrom(user1, user2, tokenId, { from: sender })
            );
          });
        });
      });

      describe('when the sender is already the owner of the token', () => {
        const sender = user1;

        it('reverts', async () => {
          await assertRevert(token.takeOwnership(tokenId, { from: sender }));
        });
      });
    });

    describe('when the given token ID was not tracked by the contract before', () => {
      const tokenId = _unknownTokenId;

      it('reverts', async () => {
        await assertRevert(token.takeOwnership(tokenId, { from: user1 }));
      });
    });
  });

  describe('when checking token metadata', async () => {
    beforeEach(async () => {
      await token.purchase(secondProduct.id, 1, user1, ZERO_ADDRESS, {
        from: user1,
        value: secondProduct.price
      });
    });
    it('should have a metadata URL', async () => {
      const tokenId = _firstTokenId;
      let url = await token.tokenURI(tokenId);
      url.should.be.equal('http://localhost/1');
    });
  });

  describe('tokenByIndex', async () => {
    it('should return the tokenId', async () => {
      (await token.tokenByIndex(0)).should.be.bignumber.equal(0);
      (await token.tokenByIndex(1)).should.be.bignumber.equal(1);
      (await token.tokenByIndex(2)).should.be.bignumber.equal(2);
    });
    it('should revert if requesting greater than the supply', async () => {
      await assertRevert(token.tokenByIndex(3));
    });
  });
  describe('tokenOfOwnerByIndex', async () => {
    it('should return the tokenId', async () => {
      (await token.tokenOfOwnerByIndex(user1, 0)).should.be.bignumber.equal(0);
      (await token.tokenOfOwnerByIndex(user1, 1)).should.be.bignumber.equal(1);

      (await token.tokenOfOwnerByIndex(user2, 0)).should.be.bignumber.equal(2);
    });
    it('should revert if the index greater than this users balance', async () => {
      await assertRevert(token.tokenOfOwnerByIndex(user1, 2));
      await assertRevert(token.tokenOfOwnerByIndex(user2, 1));
      await assertRevert(token.tokenOfOwnerByIndex(operator, 0));
    });
  });
  describe.only('safeTransferFrom', async () => {
    describe('when the sender is the owner', async () => {
      const sender = user1;
      const tokenId = _firstTokenId;

      beforeEach(async () => {
        const originalOwner = await token.ownerOf(tokenId);
        originalOwner.should.be.equal(sender);
      });
      describe('and the receiver is a normal address', async () => {
        it('should work');
      });
      describe("and the receiver is a contract that doesn't support onTokenReceived", async () => {
        it('should not work');
      });
      describe('and the receiver supports receiving tokens', async () => {
        let tokenReceiver: any;
        beforeEach(async () => {
          tokenReceiver = await MockTokenReceiver.new({ from: creator });
        });
        it('should transfer the tokens', async () => {
          await token.safeTransferFrom(user1, tokenReceiver.address, tokenId, {
            from: user1
          });
          const newOwner = await token.ownerOf(tokenId);
          newOwner.should.be.equal(tokenReceiver.address);
        });
        describe('and the contract is paused', async () => {
          it('should not work');
        });
      });
    });
    describe('when the sender is the operator', async () => {
      it('should transfer the tokens');
    });
    describe('when the sender is specifically approved', async () => {
      it('should transfer the tokens');
    });
    describe('when the sender is a rando', async () => {
      it('should not be allowed');
    });
  });
});
