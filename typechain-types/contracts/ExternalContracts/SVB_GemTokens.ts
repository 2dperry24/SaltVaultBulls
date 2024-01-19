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
} from "../../common";

export declare namespace LibSharedStructs {
  export type IndividualApprovalRecordStruct = {
    tokenId: BigNumberish;
    approved: AddressLike;
    timestamp: BigNumberish;
    isApprovalActive: boolean;
  };

  export type IndividualApprovalRecordStructOutput = [
    tokenId: bigint,
    approved: string,
    timestamp: bigint,
    isApprovalActive: boolean
  ] & {
    tokenId: bigint;
    approved: string;
    timestamp: bigint;
    isApprovalActive: boolean;
  };

  export type OperatorApprovalRecordStruct = {
    operator: AddressLike;
    timestamp: BigNumberish;
    isApprovalActive: boolean;
  };

  export type OperatorApprovalRecordStructOutput = [
    operator: string,
    timestamp: bigint,
    isApprovalActive: boolean
  ] & { operator: string; timestamp: bigint; isApprovalActive: boolean };
}

export interface SVB_GemTokensInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "approve"
      | "balanceOf"
      | "checkClaimEligibility"
      | "diamondAddress"
      | "getApprovalHistory"
      | "getApproved"
      | "getAvailableFreeGemTokenMints"
      | "getCostAndMintEligibility"
      | "isApprovedForAll"
      | "isContractApprovedToMint"
      | "isMintingLive"
      | "mintWithCredits"
      | "mintWithUsdc"
      | "name"
      | "owner"
      | "ownerOf"
      | "procurementWallet"
      | "renounceOwnership"
      | "royaltiesWallet"
      | "royaltyInfo"
      | "safeTransferFrom(address,address,uint256)"
      | "safeTransferFrom(address,address,uint256,bytes)"
      | "saltVaultBulls"
      | "setApprovalForAll"
      | "setBaseURI"
      | "setContractAddresses"
      | "setMintingLive"
      | "supportsInterface"
      | "symbol"
      | "tokenByIndex"
      | "tokenOfOwnerByIndex"
      | "tokenURI"
      | "totalSupply"
      | "transferFrom"
      | "transferOwnership"
      | "usdcTokenContract"
      | "walletOfOwner"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "Approval"
      | "ApprovalForAll"
      | "OwnershipTransferred"
      | "Transfer"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "approve",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "balanceOf",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "checkClaimEligibility",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "diamondAddress",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getApprovalHistory",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getApproved",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getAvailableFreeGemTokenMints",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getCostAndMintEligibility",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "isApprovedForAll",
    values: [AddressLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "isContractApprovedToMint",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "isMintingLive",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "mintWithCredits",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "mintWithUsdc",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "name", values?: undefined): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "ownerOf",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "procurementWallet",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "royaltiesWallet",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "royaltyInfo",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "safeTransferFrom(address,address,uint256)",
    values: [AddressLike, AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "safeTransferFrom(address,address,uint256,bytes)",
    values: [AddressLike, AddressLike, BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "saltVaultBulls",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setApprovalForAll",
    values: [AddressLike, boolean]
  ): string;
  encodeFunctionData(functionFragment: "setBaseURI", values: [string]): string;
  encodeFunctionData(
    functionFragment: "setContractAddresses",
    values: [AddressLike, AddressLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "setMintingLive",
    values: [boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "supportsInterface",
    values: [BytesLike]
  ): string;
  encodeFunctionData(functionFragment: "symbol", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "tokenByIndex",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "tokenOfOwnerByIndex",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "tokenURI",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "totalSupply",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "transferFrom",
    values: [AddressLike, AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "usdcTokenContract",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "walletOfOwner",
    values: [AddressLike]
  ): string;

  decodeFunctionResult(functionFragment: "approve", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "checkClaimEligibility",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "diamondAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getApprovalHistory",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getApproved",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAvailableFreeGemTokenMints",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getCostAndMintEligibility",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isApprovedForAll",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isContractApprovedToMint",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isMintingLive",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "mintWithCredits",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "mintWithUsdc",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "name", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "ownerOf", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "procurementWallet",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "royaltiesWallet",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "royaltyInfo",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "safeTransferFrom(address,address,uint256)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "safeTransferFrom(address,address,uint256,bytes)",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "saltVaultBulls",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setApprovalForAll",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setBaseURI", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setContractAddresses",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setMintingLive",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "supportsInterface",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "symbol", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "tokenByIndex",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "tokenOfOwnerByIndex",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "tokenURI", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "totalSupply",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferFrom",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "usdcTokenContract",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "walletOfOwner",
    data: BytesLike
  ): Result;
}

export namespace ApprovalEvent {
  export type InputTuple = [
    owner: AddressLike,
    approved: AddressLike,
    tokenId: BigNumberish
  ];
  export type OutputTuple = [owner: string, approved: string, tokenId: bigint];
  export interface OutputObject {
    owner: string;
    approved: string;
    tokenId: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace ApprovalForAllEvent {
  export type InputTuple = [
    owner: AddressLike,
    operator: AddressLike,
    approved: boolean
  ];
  export type OutputTuple = [
    owner: string,
    operator: string,
    approved: boolean
  ];
  export interface OutputObject {
    owner: string;
    operator: string;
    approved: boolean;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace OwnershipTransferredEvent {
  export type InputTuple = [previousOwner: AddressLike, newOwner: AddressLike];
  export type OutputTuple = [previousOwner: string, newOwner: string];
  export interface OutputObject {
    previousOwner: string;
    newOwner: string;
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

export interface SVB_GemTokens extends BaseContract {
  connect(runner?: ContractRunner | null): SVB_GemTokens;
  waitForDeployment(): Promise<this>;

  interface: SVB_GemTokensInterface;

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

  approve: TypedContractMethod<
    [to: AddressLike, tokenId: BigNumberish],
    [void],
    "nonpayable"
  >;

  balanceOf: TypedContractMethod<[_owner: AddressLike], [bigint], "view">;

  checkClaimEligibility: TypedContractMethod<
    [_quantity: BigNumberish],
    [string],
    "view"
  >;

  diamondAddress: TypedContractMethod<[], [string], "view">;

  getApprovalHistory: TypedContractMethod<
    [],
    [
      [
        LibSharedStructs.IndividualApprovalRecordStructOutput[],
        LibSharedStructs.OperatorApprovalRecordStructOutput[]
      ] & {
        individualApprovals: LibSharedStructs.IndividualApprovalRecordStructOutput[];
        operatorApprovals: LibSharedStructs.OperatorApprovalRecordStructOutput[];
      }
    ],
    "view"
  >;

  getApproved: TypedContractMethod<[tokenId: BigNumberish], [string], "view">;

  getAvailableFreeGemTokenMints: TypedContractMethod<[], [bigint], "view">;

  getCostAndMintEligibility: TypedContractMethod<
    [_quantity: BigNumberish],
    [bigint],
    "view"
  >;

  isApprovedForAll: TypedContractMethod<
    [_owner: AddressLike, operator: AddressLike],
    [boolean],
    "view"
  >;

  isContractApprovedToMint: TypedContractMethod<[], [boolean], "view">;

  isMintingLive: TypedContractMethod<[], [boolean], "view">;

  mintWithCredits: TypedContractMethod<
    [_numberOfCreditsToUse: BigNumberish],
    [void],
    "nonpayable"
  >;

  mintWithUsdc: TypedContractMethod<
    [_quantity: BigNumberish],
    [void],
    "nonpayable"
  >;

  name: TypedContractMethod<[], [string], "view">;

  owner: TypedContractMethod<[], [string], "view">;

  ownerOf: TypedContractMethod<[tokenId: BigNumberish], [string], "view">;

  procurementWallet: TypedContractMethod<[], [string], "view">;

  renounceOwnership: TypedContractMethod<[], [void], "nonpayable">;

  royaltiesWallet: TypedContractMethod<[], [string], "view">;

  royaltyInfo: TypedContractMethod<
    [_tokenId: BigNumberish, _salePrice: BigNumberish],
    [[string, bigint] & { royaltyAmount: bigint }],
    "view"
  >;

  "safeTransferFrom(address,address,uint256)": TypedContractMethod<
    [from: AddressLike, to: AddressLike, tokenId: BigNumberish],
    [void],
    "nonpayable"
  >;

  "safeTransferFrom(address,address,uint256,bytes)": TypedContractMethod<
    [
      from: AddressLike,
      to: AddressLike,
      tokenId: BigNumberish,
      data: BytesLike
    ],
    [void],
    "nonpayable"
  >;

  saltVaultBulls: TypedContractMethod<[], [string], "view">;

  setApprovalForAll: TypedContractMethod<
    [operator: AddressLike, approved: boolean],
    [void],
    "nonpayable"
  >;

  setBaseURI: TypedContractMethod<[_newBaseURI: string], [void], "nonpayable">;

  setContractAddresses: TypedContractMethod<
    [
      _usdcContract: AddressLike,
      _procurementWallet: AddressLike,
      _royaltiesWallet: AddressLike
    ],
    [void],
    "nonpayable"
  >;

  setMintingLive: TypedContractMethod<[_bool: boolean], [void], "nonpayable">;

  supportsInterface: TypedContractMethod<
    [interfaceId: BytesLike],
    [boolean],
    "view"
  >;

  symbol: TypedContractMethod<[], [string], "view">;

  tokenByIndex: TypedContractMethod<[index: BigNumberish], [bigint], "view">;

  tokenOfOwnerByIndex: TypedContractMethod<
    [_owner: AddressLike, _index: BigNumberish],
    [bigint],
    "view"
  >;

  tokenURI: TypedContractMethod<[tokenId: BigNumberish], [string], "view">;

  totalSupply: TypedContractMethod<[], [bigint], "view">;

  transferFrom: TypedContractMethod<
    [from: AddressLike, to: AddressLike, tokenId: BigNumberish],
    [void],
    "nonpayable"
  >;

  transferOwnership: TypedContractMethod<
    [newOwner: AddressLike],
    [void],
    "nonpayable"
  >;

  usdcTokenContract: TypedContractMethod<[], [string], "view">;

  walletOfOwner: TypedContractMethod<[_owner: AddressLike], [bigint[]], "view">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "approve"
  ): TypedContractMethod<
    [to: AddressLike, tokenId: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "balanceOf"
  ): TypedContractMethod<[_owner: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "checkClaimEligibility"
  ): TypedContractMethod<[_quantity: BigNumberish], [string], "view">;
  getFunction(
    nameOrSignature: "diamondAddress"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "getApprovalHistory"
  ): TypedContractMethod<
    [],
    [
      [
        LibSharedStructs.IndividualApprovalRecordStructOutput[],
        LibSharedStructs.OperatorApprovalRecordStructOutput[]
      ] & {
        individualApprovals: LibSharedStructs.IndividualApprovalRecordStructOutput[];
        operatorApprovals: LibSharedStructs.OperatorApprovalRecordStructOutput[];
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "getApproved"
  ): TypedContractMethod<[tokenId: BigNumberish], [string], "view">;
  getFunction(
    nameOrSignature: "getAvailableFreeGemTokenMints"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getCostAndMintEligibility"
  ): TypedContractMethod<[_quantity: BigNumberish], [bigint], "view">;
  getFunction(
    nameOrSignature: "isApprovedForAll"
  ): TypedContractMethod<
    [_owner: AddressLike, operator: AddressLike],
    [boolean],
    "view"
  >;
  getFunction(
    nameOrSignature: "isContractApprovedToMint"
  ): TypedContractMethod<[], [boolean], "view">;
  getFunction(
    nameOrSignature: "isMintingLive"
  ): TypedContractMethod<[], [boolean], "view">;
  getFunction(
    nameOrSignature: "mintWithCredits"
  ): TypedContractMethod<
    [_numberOfCreditsToUse: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "mintWithUsdc"
  ): TypedContractMethod<[_quantity: BigNumberish], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "name"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "owner"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "ownerOf"
  ): TypedContractMethod<[tokenId: BigNumberish], [string], "view">;
  getFunction(
    nameOrSignature: "procurementWallet"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "renounceOwnership"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "royaltiesWallet"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "royaltyInfo"
  ): TypedContractMethod<
    [_tokenId: BigNumberish, _salePrice: BigNumberish],
    [[string, bigint] & { royaltyAmount: bigint }],
    "view"
  >;
  getFunction(
    nameOrSignature: "safeTransferFrom(address,address,uint256)"
  ): TypedContractMethod<
    [from: AddressLike, to: AddressLike, tokenId: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "safeTransferFrom(address,address,uint256,bytes)"
  ): TypedContractMethod<
    [
      from: AddressLike,
      to: AddressLike,
      tokenId: BigNumberish,
      data: BytesLike
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "saltVaultBulls"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "setApprovalForAll"
  ): TypedContractMethod<
    [operator: AddressLike, approved: boolean],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setBaseURI"
  ): TypedContractMethod<[_newBaseURI: string], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "setContractAddresses"
  ): TypedContractMethod<
    [
      _usdcContract: AddressLike,
      _procurementWallet: AddressLike,
      _royaltiesWallet: AddressLike
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setMintingLive"
  ): TypedContractMethod<[_bool: boolean], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "supportsInterface"
  ): TypedContractMethod<[interfaceId: BytesLike], [boolean], "view">;
  getFunction(
    nameOrSignature: "symbol"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "tokenByIndex"
  ): TypedContractMethod<[index: BigNumberish], [bigint], "view">;
  getFunction(
    nameOrSignature: "tokenOfOwnerByIndex"
  ): TypedContractMethod<
    [_owner: AddressLike, _index: BigNumberish],
    [bigint],
    "view"
  >;
  getFunction(
    nameOrSignature: "tokenURI"
  ): TypedContractMethod<[tokenId: BigNumberish], [string], "view">;
  getFunction(
    nameOrSignature: "totalSupply"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "transferFrom"
  ): TypedContractMethod<
    [from: AddressLike, to: AddressLike, tokenId: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "transferOwnership"
  ): TypedContractMethod<[newOwner: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "usdcTokenContract"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "walletOfOwner"
  ): TypedContractMethod<[_owner: AddressLike], [bigint[]], "view">;

  getEvent(
    key: "Approval"
  ): TypedContractEvent<
    ApprovalEvent.InputTuple,
    ApprovalEvent.OutputTuple,
    ApprovalEvent.OutputObject
  >;
  getEvent(
    key: "ApprovalForAll"
  ): TypedContractEvent<
    ApprovalForAllEvent.InputTuple,
    ApprovalForAllEvent.OutputTuple,
    ApprovalForAllEvent.OutputObject
  >;
  getEvent(
    key: "OwnershipTransferred"
  ): TypedContractEvent<
    OwnershipTransferredEvent.InputTuple,
    OwnershipTransferredEvent.OutputTuple,
    OwnershipTransferredEvent.OutputObject
  >;
  getEvent(
    key: "Transfer"
  ): TypedContractEvent<
    TransferEvent.InputTuple,
    TransferEvent.OutputTuple,
    TransferEvent.OutputObject
  >;

  filters: {
    "Approval(address,address,uint256)": TypedContractEvent<
      ApprovalEvent.InputTuple,
      ApprovalEvent.OutputTuple,
      ApprovalEvent.OutputObject
    >;
    Approval: TypedContractEvent<
      ApprovalEvent.InputTuple,
      ApprovalEvent.OutputTuple,
      ApprovalEvent.OutputObject
    >;

    "ApprovalForAll(address,address,bool)": TypedContractEvent<
      ApprovalForAllEvent.InputTuple,
      ApprovalForAllEvent.OutputTuple,
      ApprovalForAllEvent.OutputObject
    >;
    ApprovalForAll: TypedContractEvent<
      ApprovalForAllEvent.InputTuple,
      ApprovalForAllEvent.OutputTuple,
      ApprovalForAllEvent.OutputObject
    >;

    "OwnershipTransferred(address,address)": TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;
    OwnershipTransferred: TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
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