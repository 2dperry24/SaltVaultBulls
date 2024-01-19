/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "../../../common";

export interface GemTokenChallengeFacetInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "_walletOfOwnerForGemTokens"
      | "addShuffledIndexesBatch"
      | "bulkPopulateTokens"
      | "burnAndClaimSpot"
      | "checkIfWinner"
      | "checkTokenScoreForWallet"
      | "depositRewardsForGame"
      | "getCurrentGameDetails"
      | "getCurrentGemTokenRewardBalance"
      | "getGemToken"
      | "getGtcWinners"
      | "setGameParameters"
      | "setSingleToken"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic: "RewardsDeposited" | "Transfer"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "_walletOfOwnerForGemTokens",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "addShuffledIndexesBatch",
    values: [BigNumberish[]]
  ): string;
  encodeFunctionData(
    functionFragment: "bulkPopulateTokens",
    values: [BigNumberish, BigNumberish, BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "burnAndClaimSpot",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "checkIfWinner",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "checkTokenScoreForWallet",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "depositRewardsForGame",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getCurrentGameDetails",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getCurrentGemTokenRewardBalance",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getGemToken",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getGtcWinners",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setGameParameters",
    values: [BigNumberish, string, BigNumberish, BigNumberish[]]
  ): string;
  encodeFunctionData(
    functionFragment: "setSingleToken",
    values?: undefined
  ): string;

  decodeFunctionResult(
    functionFragment: "_walletOfOwnerForGemTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "addShuffledIndexesBatch",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "bulkPopulateTokens",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "burnAndClaimSpot",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "checkIfWinner",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "checkTokenScoreForWallet",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "depositRewardsForGame",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getCurrentGameDetails",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getCurrentGemTokenRewardBalance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getGemToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getGtcWinners",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setGameParameters",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setSingleToken",
    data: BytesLike
  ): Result;
}

export namespace RewardsDepositedEvent {
  export type InputTuple = [depositor: AddressLike, amount: BigNumberish];
  export type OutputTuple = [depositor: string, amount: bigint];
  export interface OutputObject {
    depositor: string;
    amount: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace TransferEvent {
  export type InputTuple = [
    from: AddressLike,
    to: AddressLike,
    tokenId: BigNumberish
  ];
  export type OutputTuple = [from: string, to: string, tokenId: bigint];
  export interface OutputObject {
    from: string;
    to: string;
    tokenId: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface GemTokenChallengeFacet extends BaseContract {
  connect(runner?: ContractRunner | null): GemTokenChallengeFacet;
  waitForDeployment(): Promise<this>;

  interface: GemTokenChallengeFacetInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  _walletOfOwnerForGemTokens: TypedContractMethod<
    [_owner: AddressLike],
    [bigint[]],
    "view"
  >;

  addShuffledIndexesBatch: TypedContractMethod<
    [batch: BigNumberish[]],
    [void],
    "nonpayable"
  >;

  bulkPopulateTokens: TypedContractMethod<
    [
      start: BigNumberish,
      end: BigNumberish,
      value: BigNumberish,
      color: string
    ],
    [void],
    "nonpayable"
  >;

  burnAndClaimSpot: TypedContractMethod<[], [void], "nonpayable">;

  checkIfWinner: TypedContractMethod<[], [boolean], "view">;

  checkTokenScoreForWallet: TypedContractMethod<
    [],
    [
      [bigint, bigint] & { primaryColorPoints: bigint; pointsAllColors: bigint }
    ],
    "view"
  >;

  depositRewardsForGame: TypedContractMethod<
    [_amount: BigNumberish],
    [void],
    "nonpayable"
  >;

  getCurrentGameDetails: TypedContractMethod<
    [],
    [[bigint, string, bigint, boolean, boolean, bigint[], bigint]],
    "view"
  >;

  getCurrentGemTokenRewardBalance: TypedContractMethod<[], [bigint], "view">;

  getGemToken: TypedContractMethod<
    [tokenIndex: BigNumberish],
    [[bigint, bigint, string]],
    "view"
  >;

  getGtcWinners: TypedContractMethod<[], [string[]], "view">;

  setGameParameters: TypedContractMethod<
    [
      _winningValue: BigNumberish,
      _primaryColor: string,
      _numberOfWinningSpots: BigNumberish,
      _payoutDistribution: BigNumberish[]
    ],
    [void],
    "nonpayable"
  >;

  setSingleToken: TypedContractMethod<[], [void], "nonpayable">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "_walletOfOwnerForGemTokens"
  ): TypedContractMethod<[_owner: AddressLike], [bigint[]], "view">;
  getFunction(
    nameOrSignature: "addShuffledIndexesBatch"
  ): TypedContractMethod<[batch: BigNumberish[]], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "bulkPopulateTokens"
  ): TypedContractMethod<
    [
      start: BigNumberish,
      end: BigNumberish,
      value: BigNumberish,
      color: string
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "burnAndClaimSpot"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "checkIfWinner"
  ): TypedContractMethod<[], [boolean], "view">;
  getFunction(
    nameOrSignature: "checkTokenScoreForWallet"
  ): TypedContractMethod<
    [],
    [
      [bigint, bigint] & { primaryColorPoints: bigint; pointsAllColors: bigint }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "depositRewardsForGame"
  ): TypedContractMethod<[_amount: BigNumberish], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "getCurrentGameDetails"
  ): TypedContractMethod<
    [],
    [[bigint, string, bigint, boolean, boolean, bigint[], bigint]],
    "view"
  >;
  getFunction(
    nameOrSignature: "getCurrentGemTokenRewardBalance"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getGemToken"
  ): TypedContractMethod<
    [tokenIndex: BigNumberish],
    [[bigint, bigint, string]],
    "view"
  >;
  getFunction(
    nameOrSignature: "getGtcWinners"
  ): TypedContractMethod<[], [string[]], "view">;
  getFunction(
    nameOrSignature: "setGameParameters"
  ): TypedContractMethod<
    [
      _winningValue: BigNumberish,
      _primaryColor: string,
      _numberOfWinningSpots: BigNumberish,
      _payoutDistribution: BigNumberish[]
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setSingleToken"
  ): TypedContractMethod<[], [void], "nonpayable">;

  getEvent(
    key: "RewardsDeposited"
  ): TypedContractEvent<
    RewardsDepositedEvent.InputTuple,
    RewardsDepositedEvent.OutputTuple,
    RewardsDepositedEvent.OutputObject
  >;
  getEvent(
    key: "Transfer"
  ): TypedContractEvent<
    TransferEvent.InputTuple,
    TransferEvent.OutputTuple,
    TransferEvent.OutputObject
  >;

  filters: {
    "RewardsDeposited(address,uint256)": TypedContractEvent<
      RewardsDepositedEvent.InputTuple,
      RewardsDepositedEvent.OutputTuple,
      RewardsDepositedEvent.OutputObject
    >;
    RewardsDeposited: TypedContractEvent<
      RewardsDepositedEvent.InputTuple,
      RewardsDepositedEvent.OutputTuple,
      RewardsDepositedEvent.OutputObject
    >;

    "Transfer(address,address,uint256)": TypedContractEvent<
      TransferEvent.InputTuple,
      TransferEvent.OutputTuple,
      TransferEvent.OutputObject
    >;
    Transfer: TypedContractEvent<
      TransferEvent.InputTuple,
      TransferEvent.OutputTuple,
      TransferEvent.OutputObject
    >;
  };
}
