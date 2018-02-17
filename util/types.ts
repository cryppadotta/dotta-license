import * as BigNumber from 'bignumber.js';
import * as Web3 from 'web3';

export interface BalancesByOwner {
  [ownerAddress: string]: {
    [tokenAddress: string]: BigNumber.BigNumber;
  };
}

export interface BatchFillOrders {
  orderAddresses: string[][];
  orderValues: BigNumber.BigNumber[][];
  fillTakerTokenAmounts: BigNumber.BigNumber[];
  shouldThrowOnInsufficientBalanceOrAllowance: boolean;
  v: number[];
  r: string[];
  s: string[];
}

export interface FillOrdersUpTo {
  orderAddresses: string[][];
  orderValues: BigNumber.BigNumber[][];
  fillTakerTokenAmount: BigNumber.BigNumber;
  shouldThrowOnInsufficientBalanceOrAllowance: boolean;
  v: number[];
  r: string[];
  s: string[];
}

export interface BatchCancelOrders {
  orderAddresses: string[][];
  orderValues: BigNumber.BigNumber[][];
  cancelTakerTokenAmounts: BigNumber.BigNumber[];
}

export interface DefaultOrderParams {
  exchangeContractAddress: string;
  maker: string;
  feeRecipient: string;
  makerToken: string;
  takerToken: string;
  makerTokenAmount: BigNumber.BigNumber;
  takerTokenAmount: BigNumber.BigNumber;
  makerFee: BigNumber.BigNumber;
  takerFee: BigNumber.BigNumber;
}

export interface OptionalOrderParams {
  exchangeContractAddress?: string;
  maker?: string;
  taker?: string;
  feeRecipient?: string;
  makerToken?: string;
  takerToken?: string;
  makerTokenAmount?: BigNumber.BigNumber;
  takerTokenAmount?: BigNumber.BigNumber;
  makerFee?: BigNumber.BigNumber;
  takerFee?: BigNumber.BigNumber;
  expirationTimestampInSec?: BigNumber.BigNumber;
}

export interface OrderParams {
  exchangeContractAddress: string;
  maker: string;
  taker: string;
  feeRecipient: string;
  makerToken: string;
  takerToken: string;
  makerTokenAmount: BigNumber.BigNumber;
  takerTokenAmount: BigNumber.BigNumber;
  makerFee: BigNumber.BigNumber;
  takerFee: BigNumber.BigNumber;
  expirationTimestampInSec: BigNumber.BigNumber;
  salt: BigNumber.BigNumber;
  orderHashHex?: string;
  v?: number;
  r?: string;
  s?: string;
}

export interface TransactionDataParams {
  name: string;
  abi: Web3.AbiDefinition[];
  args: any[];
}

export interface Token {
  address?: string;
  name: string;
  symbol: string;
  decimals: number;
  ipfsHash: string;
  swarmHash: string;
}

export interface MultiSigConfig {
  owners: string[];
  confirmationsRequired: number;
  secondsRequired: number;
}

export interface MultiSigConfigByNetwork {
  [networkName: string]: MultiSigConfig;
}

export interface TokenInfoByNetwork {
  development: Token[];
  live: Token[];
}

// Named type aliases to improve readability
export type ContractInstance = any;

export enum ExchangeContractErrs {
  ERROR_ORDER_EXPIRED,
  ERROR_ORDER_FULLY_FILLED_OR_CANCELLED,
  ERROR_ROUNDING_ERROR_TOO_LARGE,
  ERROR_INSUFFICIENT_BALANCE_OR_ALLOWANCE,
}
