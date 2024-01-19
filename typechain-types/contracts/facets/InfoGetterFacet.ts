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
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedListener,
  TypedContractMethod,
} from "../../common";

export interface InfoGetterFacetInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "getBullInformation"
      | "getCoreTeamBalance"
      | "getCoreTeamWalletAddress"
      | "getGemTokenChallengeBalance"
      | "getMintCost"
      | "getProcurementWalletAddress"
      | "getRarityInformationForBull"
      | "getRoyaltiesWalletAddress"
      | "getSaltVaultTokenAddress"
      | "getTotalRewardBalance"
      | "getUsdcContractAddress"
      | "getVaultCouncilBalance"
      | "getVaultHoldingBalance"
      | "royaltyInfo"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "getBullInformation",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getCoreTeamBalance",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getCoreTeamWalletAddress",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getGemTokenChallengeBalance",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getMintCost",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getProcurementWalletAddress",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getRarityInformationForBull",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getRoyaltiesWalletAddress",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getSaltVaultTokenAddress",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getTotalRewardBalance",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getUsdcContractAddress",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getVaultCouncilBalance",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getVaultHoldingBalance",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "royaltyInfo",
    values: [BigNumberish, BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "getBullInformation",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getCoreTeamBalance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getCoreTeamWalletAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getGemTokenChallengeBalance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getMintCost",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getProcurementWalletAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getRarityInformationForBull",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getRoyaltiesWalletAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getSaltVaultTokenAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTotalRewardBalance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getUsdcContractAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getVaultCouncilBalance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getVaultHoldingBalance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "royaltyInfo",
    data: BytesLike
  ): Result;
}

export interface InfoGetterFacet extends BaseContract {
  connect(runner?: ContractRunner | null): InfoGetterFacet;
  waitForDeployment(): Promise<this>;

  interface: InfoGetterFacetInterface;

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

  getBullInformation: TypedContractMethod<
    [_index: BigNumberish],
    [[bigint, bigint, bigint, bigint, bigint, bigint]],
    "view"
  >;

  getCoreTeamBalance: TypedContractMethod<[], [bigint], "view">;

  getCoreTeamWalletAddress: TypedContractMethod<[], [string], "view">;

  getGemTokenChallengeBalance: TypedContractMethod<[], [bigint], "view">;

  getMintCost: TypedContractMethod<[rarity: BigNumberish], [bigint], "view">;

  getProcurementWalletAddress: TypedContractMethod<[], [string], "view">;

  getRarityInformationForBull: TypedContractMethod<
    [rarity: BigNumberish],
    [[bigint, bigint, bigint, bigint]],
    "view"
  >;

  getRoyaltiesWalletAddress: TypedContractMethod<[], [string], "view">;

  getSaltVaultTokenAddress: TypedContractMethod<[], [string], "view">;

  getTotalRewardBalance: TypedContractMethod<[], [bigint], "view">;

  getUsdcContractAddress: TypedContractMethod<[], [string], "view">;

  getVaultCouncilBalance: TypedContractMethod<[], [bigint], "view">;

  getVaultHoldingBalance: TypedContractMethod<[], [bigint], "view">;

  royaltyInfo: TypedContractMethod<
    [_tokenId: BigNumberish, _salePrice: BigNumberish],
    [[string, bigint] & { royaltyAmount: bigint }],
    "view"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "getBullInformation"
  ): TypedContractMethod<
    [_index: BigNumberish],
    [[bigint, bigint, bigint, bigint, bigint, bigint]],
    "view"
  >;
  getFunction(
    nameOrSignature: "getCoreTeamBalance"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getCoreTeamWalletAddress"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "getGemTokenChallengeBalance"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getMintCost"
  ): TypedContractMethod<[rarity: BigNumberish], [bigint], "view">;
  getFunction(
    nameOrSignature: "getProcurementWalletAddress"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "getRarityInformationForBull"
  ): TypedContractMethod<
    [rarity: BigNumberish],
    [[bigint, bigint, bigint, bigint]],
    "view"
  >;
  getFunction(
    nameOrSignature: "getRoyaltiesWalletAddress"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "getSaltVaultTokenAddress"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "getTotalRewardBalance"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getUsdcContractAddress"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "getVaultCouncilBalance"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getVaultHoldingBalance"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "royaltyInfo"
  ): TypedContractMethod<
    [_tokenId: BigNumberish, _salePrice: BigNumberish],
    [[string, bigint] & { royaltyAmount: bigint }],
    "view"
  >;

  filters: {};
}
