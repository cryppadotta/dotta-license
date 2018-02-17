import * as BigNumber from 'bignumber.js';
import * as _ from 'lodash';
import {formatters} from './formatters';
import {Order} from './order';
import {ContractInstance} from './types';

export class ExchangeWrapper {
  private exchange: ContractInstance;
  constructor(exchangeContractInstance: ContractInstance) {
    this.exchange = exchangeContractInstance;
  }
  public async fillOrderAsync(order: Order, from: string,
                              opts: {
                                  fillTakerTokenAmount?: BigNumber.BigNumber,
                                  shouldThrowOnInsufficientBalanceOrAllowance?: boolean,
                              } = {}) {
    const shouldThrowOnInsufficientBalanceOrAllowance = !!opts.shouldThrowOnInsufficientBalanceOrAllowance;
    const params = order.createFill(shouldThrowOnInsufficientBalanceOrAllowance, opts.fillTakerTokenAmount);
    const tx = await this.exchange.fillOrder(
      params.orderAddresses,
      params.orderValues,
      params.fillTakerTokenAmount,
      params.shouldThrowOnInsufficientBalanceOrAllowance,
      params.v,
      params.r,
      params.s,
      {from},
    );
    _.each(tx.logs, log => this.wrapLogBigNumbers(log));
    return tx;
  }
  public async cancelOrderAsync(order: Order, from: string,
                                opts: {cancelTakerTokenAmount?: BigNumber.BigNumber} = {}) {
    const params = order.createCancel(opts.cancelTakerTokenAmount);
    const tx = await this.exchange.cancelOrder(
      params.orderAddresses,
      params.orderValues,
      params.cancelTakerTokenAmount,
      {from},
    );
    _.each(tx.logs, log => this.wrapLogBigNumbers(log));
    return tx;
  }
  public async fillOrKillOrderAsync(order: Order, from: string,
                                    opts: {fillTakerTokenAmount?: BigNumber.BigNumber} = {}) {
    const shouldThrowOnInsufficientBalanceOrAllowance = true;
    const params = order.createFill(shouldThrowOnInsufficientBalanceOrAllowance, opts.fillTakerTokenAmount);
    const tx = await this.exchange.fillOrKillOrder(
      params.orderAddresses,
      params.orderValues,
      params.fillTakerTokenAmount,
      params.v,
      params.r,
      params.s,
      {from},
    );
    _.each(tx.logs, log => this.wrapLogBigNumbers(log));
    return tx;
  }
  public async batchFillOrdersAsync(orders: Order[], from: string,
                                    opts: {
                                        fillTakerTokenAmounts?: BigNumber.BigNumber[],
                                        shouldThrowOnInsufficientBalanceOrAllowance?: boolean,
                                    } = {}) {
    const shouldThrowOnInsufficientBalanceOrAllowance = !!opts.shouldThrowOnInsufficientBalanceOrAllowance;
    const params = formatters.createBatchFill(
        orders, shouldThrowOnInsufficientBalanceOrAllowance, opts.fillTakerTokenAmounts);
    const tx = await this.exchange.batchFillOrders(
      params.orderAddresses,
      params.orderValues,
      params.fillTakerTokenAmounts,
      params.shouldThrowOnInsufficientBalanceOrAllowance,
      params.v,
      params.r,
      params.s,
      {from},
    );
    _.each(tx.logs, log => this.wrapLogBigNumbers(log));
    return tx;
  }
  public async batchFillOrKillOrdersAsync(orders: Order[], from: string,
                                          opts: {
                                              fillTakerTokenAmounts?: BigNumber.BigNumber[],
                                          } = {}) {
    const params = formatters.createBatchFill(orders, undefined, opts.fillTakerTokenAmounts);
    const tx = await this.exchange.batchFillOrKillOrders(
      params.orderAddresses,
      params.orderValues,
      params.fillTakerTokenAmounts,
      params.v,
      params.r,
      params.s,
      {from},
    );
    _.each(tx.logs, log => this.wrapLogBigNumbers(log));
    return tx;
  }
  public async fillOrdersUpToAsync(orders: Order[], from: string,
                                   opts: {fillTakerTokenAmount?: BigNumber.BigNumber,
                                          shouldThrowOnInsufficientBalanceOrAllowance?: boolean} = {}) {
    const shouldThrowOnInsufficientBalanceOrAllowance = !!opts.shouldThrowOnInsufficientBalanceOrAllowance;
    const params = formatters.createFillUpTo(orders,
                                             shouldThrowOnInsufficientBalanceOrAllowance,
                                             opts.fillTakerTokenAmount);
    const tx = await this.exchange.fillOrdersUpTo(
      params.orderAddresses,
      params.orderValues,
      params.fillTakerTokenAmount,
      params.shouldThrowOnInsufficientBalanceOrAllowance,
      params.v,
      params.r,
      params.s,
      {from},
    );
    _.each(tx.logs, log => this.wrapLogBigNumbers(log));
    return tx;
  }
  public async batchCancelOrdersAsync(orders: Order[], from: string,
                                      opts: {cancelTakerTokenAmounts?: BigNumber.BigNumber[]} = {}) {
    const params = formatters.createBatchCancel(orders, opts.cancelTakerTokenAmounts);
    const tx = await this.exchange.batchCancelOrders(
      params.orderAddresses,
      params.orderValues,
      params.cancelTakerTokenAmounts,
      {from},
    );
    _.each(tx.logs, log => this.wrapLogBigNumbers(log));
    return tx;
  }
  public async getOrderHashAsync(order: Order): Promise<string> {
    const shouldThrowOnInsufficientBalanceOrAllowance = false;
    const params = order.createFill(shouldThrowOnInsufficientBalanceOrAllowance);
    const orderHash = await this.exchange.getOrderHash(params.orderAddresses, params.orderValues);
    return orderHash;
  }
  public async isValidSignatureAsync(order: Order): Promise<boolean> {
    const isValidSignature = await this.exchange.isValidSignature(
      order.params.maker,
      order.params.orderHashHex,
      order.params.v,
      order.params.r,
      order.params.s,
    );
    return isValidSignature;
  }
  public async isRoundingErrorAsync(numerator: BigNumber.BigNumber, denominator: BigNumber.BigNumber,
                                    target: BigNumber.BigNumber): Promise<boolean> {
    const isRoundingError = await this.exchange.isRoundingError(numerator, denominator, target);
    return isRoundingError;
  }
  public async getPartialAmountAsync(numerator: BigNumber.BigNumber, denominator: BigNumber.BigNumber,
                                     target: BigNumber.BigNumber): Promise<BigNumber.BigNumber> {
    const partialAmount = new BigNumber(await this.exchange.getPartialAmount(numerator, denominator, target));
    return partialAmount;
  }
  private wrapLogBigNumbers(log: any): any {
    const argNames = _.keys(log.args);
    for (const argName of argNames) {
        const isWeb3BigNumber = _.startsWith(log.args[argName].constructor.toString(), 'function BigNumber(');
        if (isWeb3BigNumber) {
            log.args[argName] = new BigNumber(log.args[argName]);
        }
    }
  }
}
