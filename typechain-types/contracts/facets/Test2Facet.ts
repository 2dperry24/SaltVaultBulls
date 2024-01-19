/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
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

export interface Test2FacetInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "test2Func1"
      | "test2Func10"
      | "test2Func11"
      | "test2Func12"
      | "test2Func13"
      | "test2Func14"
      | "test2Func15"
      | "test2Func16"
      | "test2Func17"
      | "test2Func18"
      | "test2Func19"
      | "test2Func2"
      | "test2Func20"
      | "test2Func3"
      | "test2Func4"
      | "test2Func5"
      | "test2Func6"
      | "test2Func7"
      | "test2Func8"
      | "test2Func9"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "test2Func1",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "test2Func10",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "test2Func11",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "test2Func12",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "test2Func13",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "test2Func14",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "test2Func15",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "test2Func16",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "test2Func17",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "test2Func18",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "test2Func19",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "test2Func2",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "test2Func20",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "test2Func3",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "test2Func4",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "test2Func5",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "test2Func6",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "test2Func7",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "test2Func8",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "test2Func9",
    values?: undefined
  ): string;

  decodeFunctionResult(functionFragment: "test2Func1", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "test2Func10",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "test2Func11",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "test2Func12",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "test2Func13",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "test2Func14",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "test2Func15",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "test2Func16",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "test2Func17",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "test2Func18",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "test2Func19",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "test2Func2", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "test2Func20",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "test2Func3", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "test2Func4", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "test2Func5", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "test2Func6", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "test2Func7", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "test2Func8", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "test2Func9", data: BytesLike): Result;
}

export interface Test2Facet extends BaseContract {
  connect(runner?: ContractRunner | null): Test2Facet;
  waitForDeployment(): Promise<this>;

  interface: Test2FacetInterface;

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

  test2Func1: TypedContractMethod<[], [void], "nonpayable">;

  test2Func10: TypedContractMethod<[], [void], "nonpayable">;

  test2Func11: TypedContractMethod<[], [void], "nonpayable">;

  test2Func12: TypedContractMethod<[], [void], "nonpayable">;

  test2Func13: TypedContractMethod<[], [void], "nonpayable">;

  test2Func14: TypedContractMethod<[], [void], "nonpayable">;

  test2Func15: TypedContractMethod<[], [void], "nonpayable">;

  test2Func16: TypedContractMethod<[], [void], "nonpayable">;

  test2Func17: TypedContractMethod<[], [void], "nonpayable">;

  test2Func18: TypedContractMethod<[], [void], "nonpayable">;

  test2Func19: TypedContractMethod<[], [void], "nonpayable">;

  test2Func2: TypedContractMethod<[], [void], "nonpayable">;

  test2Func20: TypedContractMethod<[], [void], "nonpayable">;

  test2Func3: TypedContractMethod<[], [void], "nonpayable">;

  test2Func4: TypedContractMethod<[], [void], "nonpayable">;

  test2Func5: TypedContractMethod<[], [bigint], "view">;

  test2Func6: TypedContractMethod<[], [void], "nonpayable">;

  test2Func7: TypedContractMethod<[], [void], "nonpayable">;

  test2Func8: TypedContractMethod<[], [void], "nonpayable">;

  test2Func9: TypedContractMethod<[], [void], "nonpayable">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "test2Func1"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "test2Func10"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "test2Func11"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "test2Func12"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "test2Func13"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "test2Func14"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "test2Func15"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "test2Func16"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "test2Func17"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "test2Func18"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "test2Func19"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "test2Func2"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "test2Func20"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "test2Func3"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "test2Func4"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "test2Func5"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "test2Func6"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "test2Func7"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "test2Func8"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "test2Func9"
  ): TypedContractMethod<[], [void], "nonpayable">;

  filters: {};
}
