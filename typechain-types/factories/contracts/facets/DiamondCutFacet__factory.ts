/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../common";
import type {
  DiamondCutFacet,
  DiamondCutFacetInterface,
} from "../../../contracts/facets/DiamondCutFacet";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_initializationContractAddress",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "_calldata",
        type: "bytes",
      },
    ],
    name: "InitializationFunctionReverted",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "facetAddress",
            type: "address",
          },
          {
            internalType: "enum IDiamondCut.FacetCutAction",
            name: "action",
            type: "uint8",
          },
          {
            internalType: "bytes4[]",
            name: "functionSelectors",
            type: "bytes4[]",
          },
        ],
        indexed: false,
        internalType: "struct IDiamondCut.FacetCut[]",
        name: "_diamondCut",
        type: "tuple[]",
      },
      {
        indexed: false,
        internalType: "address",
        name: "_init",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "_calldata",
        type: "bytes",
      },
    ],
    name: "DiamondCut",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "facetAddress",
            type: "address",
          },
          {
            internalType: "enum IDiamondCut.FacetCutAction",
            name: "action",
            type: "uint8",
          },
          {
            internalType: "bytes4[]",
            name: "functionSelectors",
            type: "bytes4[]",
          },
        ],
        indexed: false,
        internalType: "struct IDiamondCut.FacetCut[]",
        name: "_diamondCut",
        type: "tuple[]",
      },
      {
        indexed: false,
        internalType: "address",
        name: "_init",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "_calldata",
        type: "bytes",
      },
    ],
    name: "DiamondCut",
    type: "event",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "facetAddress",
            type: "address",
          },
          {
            internalType: "enum IDiamondCut.FacetCutAction",
            name: "action",
            type: "uint8",
          },
          {
            internalType: "bytes4[]",
            name: "functionSelectors",
            type: "bytes4[]",
          },
        ],
        internalType: "struct IDiamondCut.FacetCut[]",
        name: "_diamondCut",
        type: "tuple[]",
      },
      {
        internalType: "address",
        name: "_init",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "_calldata",
        type: "bytes",
      },
    ],
    name: "diamondCut",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b50611150806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c80631f931c1c14610030575b600080fd5b61004361003e366004610bc8565b610045565b005b61004d61009e565b61009761005a8587610d0e565b8484848080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525061012c92505050565b5050505050565b7fc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131c600401546001600160a01b0316331461012a5760405162461bcd60e51b815260206004820152602260248201527f4c69624469616d6f6e643a204d75737420626520636f6e7472616374206f776e60448201526132b960f11b60648201526084015b60405180910390fd5b565b7fc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131e547fc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131c9061ffff81169081906000906007161561019b5750600381901c60009081526001840160205260409020545b60005b87518110156102185761020b83838a84815181106101be576101be610e52565b6020026020010151600001518b85815181106101dc576101dc610e52565b6020026020010151602001518c86815181106101fa576101fa610e52565b6020026020010151604001516102a4565b909350915060010161019e565b508282146102345760028401805461ffff191661ffff84161790555b600782161561025657600382901c600090815260018501602052604090208190555b7f8faa70878671ccd212d20771b795c50af8fd3ff6cf27f4bde57e5d4de0aeb67387878760405161028993929190610ece565b60405180910390a161029b8686610a76565b50505050505050565b600080807fc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131c905060008451116103305760405162461bcd60e51b815260206004820152602b60248201527f4c69624469616d6f6e644375743a204e6f2073656c6563746f727320696e206660448201526a1858d95d081d1bc818dd5d60aa1b6064820152608401610121565b600085600281111561034457610344610e68565b036104aa5761036b866040518060600160405280602481526020016110a760249139610b42565b60005b84518110156104a457600085828151811061038b5761038b610e52565b6020908102919091018101516001600160e01b03198116600090815291859052604090912054909150606081901c156104245760405162461bcd60e51b815260206004820152603560248201527f4c69624469616d6f6e644375743a2043616e2774206164642066756e6374696f6044820152746e207468617420616c72656164792065786973747360581b6064820152608401610121565b6001600160e01b031980831660008181526020879052604090206001600160601b031960608d901b168e17905560e060058e901b811692831c199c909c1690821c179a8190036104885760038c901c600090815260018601602052604081209b909b555b8b61049281610fe4565b9c50506001909301925061036e915050565b50610a6a565b60018560028111156104be576104be610e68565b036106e3576104e5866040518060600160405280602881526020016110f360289139610b42565b60005b84518110156104a457600085828151811061050557610505610e52565b6020908102919091018101516001600160e01b03198116600090815291859052604090912054909150606081901c30810361059a5760405162461bcd60e51b815260206004820152602f60248201527f4c69624469616d6f6e644375743a2043616e2774207265706c61636520696d6d60448201526e3aba30b1363290333ab731ba34b7b760891b6064820152608401610121565b896001600160a01b0316816001600160a01b0316036106215760405162461bcd60e51b815260206004820152603860248201527f4c69624469616d6f6e644375743a2043616e2774207265706c6163652066756e60448201527f6374696f6e20776974682073616d652066756e6374696f6e00000000000000006064820152608401610121565b6001600160a01b03811661069d5760405162461bcd60e51b815260206004820152603860248201527f4c69624469616d6f6e644375743a2043616e2774207265706c6163652066756e60448201527f6374696f6e207468617420646f65736e277420657869737400000000000000006064820152608401610121565b506001600160e01b031990911660009081526020849052604090206bffffffffffffffffffffffff919091166001600160601b031960608a901b161790556001016104e8565b60028560028111156106f7576106f7610e68565b03610a12576001600160a01b038616156107725760405162461bcd60e51b815260206004820152603660248201527f4c69624469616d6f6e644375743a2052656d6f76652066616365742061646472604482015275657373206d757374206265206164647265737328302960501b6064820152608401610121565b600388901c6007891660005b86518110156109f25760008a90036107ba578261079a81610ffd565b60008181526001870160205260409020549b509350600792506107c89050565b816107c481610ffd565b9250505b6000806000808a85815181106107e0576107e0610e52565b6020908102919091018101516001600160e01b031981166000908152918a9052604090912054909150606081901c6108805760405162461bcd60e51b815260206004820152603760248201527f4c69624469616d6f6e644375743a2043616e27742072656d6f76652066756e6360448201527f74696f6e207468617420646f65736e27742065786973740000000000000000006064820152608401610121565b30606082901c036108ea5760405162461bcd60e51b815260206004820152602e60248201527f4c69624469616d6f6e644375743a2043616e27742072656d6f766520696d6d7560448201526d3a30b1363290333ab731ba34b7b760911b6064820152608401610121565b600587901b8f901b94506001600160e01b031980861690831614610940576001600160e01b03198516600090815260208a90526040902080546001600160601b0319166bffffffffffffffffffffffff83161790555b6001600160e01b031991909116600090815260208990526040812055600381901c611fff16925060051b60e01690508582146109a5576000828152600188016020526040902080546001600160e01b031980841c19909116908516831c1790556109c9565b80836001600160e01b031916901c816001600160e01b031960001b901c198e16179c505b846000036109e757600086815260018801602052604081208190559c505b50505060010161077e565b50806109ff836008611014565b610a099190611031565b99505050610a6a565b60405162461bcd60e51b815260206004820152602760248201527f4c69624469616d6f6e644375743a20496e636f727265637420466163657443756044820152663a20b1ba34b7b760c91b6064820152608401610121565b50959694955050505050565b6001600160a01b038216610a88575050565b610aaa826040518060600160405280602881526020016110cb60289139610b42565b600080836001600160a01b031683604051610ac59190611044565b600060405180830381855af49150503d8060008114610b00576040519150601f19603f3d011682016040523d82523d6000602084013e610b05565b606091505b509150915081610b3c57805115610b1f5780518082602001fd5b838360405163192105d760e01b8152600401610121929190611060565b50505050565b813b8181610b3c5760405162461bcd60e51b8152600401610121919061108c565b80356001600160a01b0381168114610b7a57600080fd5b919050565b60008083601f840112610b9157600080fd5b50813567ffffffffffffffff811115610ba957600080fd5b602083019150836020828501011115610bc157600080fd5b9250929050565b600080600080600060608688031215610be057600080fd5b853567ffffffffffffffff80821115610bf857600080fd5b818801915088601f830112610c0c57600080fd5b813581811115610c1b57600080fd5b8960208260051b8501011115610c3057600080fd5b60208301975080965050610c4660208901610b63565b94506040880135915080821115610c5c57600080fd5b50610c6988828901610b7f565b969995985093965092949392505050565b634e487b7160e01b600052604160045260246000fd5b6040516060810167ffffffffffffffff81118282101715610cb357610cb3610c7a565b60405290565b604051601f8201601f1916810167ffffffffffffffff81118282101715610ce257610ce2610c7a565b604052919050565b600067ffffffffffffffff821115610d0457610d04610c7a565b5060051b60200190565b6000610d21610d1c84610cea565b610cb9565b83815260208082019190600586811b860136811115610d3f57600080fd5b865b81811015610e4557803567ffffffffffffffff80821115610d625760008081fd5b818a01915060608236031215610d785760008081fd5b610d80610c90565b610d8983610b63565b81528683013560038110610d9d5760008081fd5b8188015260408381013583811115610db55760008081fd5b939093019236601f850112610dcc57600092508283fd5b83359250610ddc610d1c84610cea565b83815292871b84018801928881019036851115610df95760008081fd5b948901945b84861015610e2e5785356001600160e01b031981168114610e1f5760008081fd5b82529489019490890190610dfe565b918301919091525088525050948301948301610d41565b5092979650505050505050565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052602160045260246000fd5b60005b83811015610e99578181015183820152602001610e81565b50506000910152565b60008151808452610eba816020860160208601610e7e565b601f01601f19169290920160200192915050565b60006060808301818452808751808352608092508286019150828160051b8701016020808b0160005b84811015610f9e57898403607f19018652815180516001600160a01b03168552838101518986019060038110610f3d57634e487b7160e01b600052602160045260246000fd5b868601526040918201519186018a905281519081905290840190600090898701905b80831015610f895783516001600160e01b0319168252928601926001929092019190860190610f5f565b50978501979550505090820190600101610ef7565b50506001600160a01b038a16908801528681036040880152610fc08189610ea2565b9a9950505050505050505050565b634e487b7160e01b600052601160045260246000fd5b600060018201610ff657610ff6610fce565b5060010190565b60008161100c5761100c610fce565b506000190190565b808202811582820484141761102b5761102b610fce565b92915050565b8082018082111561102b5761102b610fce565b60008251611056818460208701610e7e565b9190910192915050565b6001600160a01b038316815260406020820181905260009061108490830184610ea2565b949350505050565b60208152600061109f6020830184610ea2565b939250505056fe4c69624469616d6f6e644375743a2041646420666163657420686173206e6f20636f64654c69624469616d6f6e644375743a205f696e6974206164647265737320686173206e6f20636f64654c69624469616d6f6e644375743a205265706c61636520666163657420686173206e6f20636f6465a2646970667358221220eacaf28d67bd0bf7e1a709622d9ff3c68b8933f8623d30bf349ec6f5a09aef7864736f6c63430008140033";

type DiamondCutFacetConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: DiamondCutFacetConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class DiamondCutFacet__factory extends ContractFactory {
  constructor(...args: DiamondCutFacetConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(overrides || {});
  }
  override deploy(overrides?: NonPayableOverrides & { from?: string }) {
    return super.deploy(overrides || {}) as Promise<
      DiamondCutFacet & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): DiamondCutFacet__factory {
    return super.connect(runner) as DiamondCutFacet__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): DiamondCutFacetInterface {
    return new Interface(_abi) as DiamondCutFacetInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): DiamondCutFacet {
    return new Contract(address, _abi, runner) as unknown as DiamondCutFacet;
  }
}
