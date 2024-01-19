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
  VaultFacet,
  VaultFacetInterface,
} from "../../../contracts/facets/VaultFacet";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "SafeERC20FailedOperation",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "vaultId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "compoundingRate",
        type: "uint256",
      },
    ],
    name: "CompoundingRateUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "vaultIndex",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "startIndex",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "endIndex",
        type: "uint256",
      },
    ],
    name: "ProfitsDepositedToVault",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "vaultIndex",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalRewardPoints",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "profitAmount",
        type: "uint256",
      },
    ],
    name: "VaultRewardPointsCalculated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "vaultName",
        type: "string",
      },
      {
        internalType: "address",
        name: "walletAddress",
        type: "address",
      },
      {
        internalType: "address",
        name: "approvedControlWallet",
        type: "address",
      },
    ],
    name: "addNewVault",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "vaultIndex",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "grains",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "pillars",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "sheets",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "cubes",
        type: "uint256",
      },
    ],
    name: "allocateSaltToVault",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "vaultIndex",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "profitAmount",
        type: "uint256",
      },
    ],
    name: "depositProfitsAndcalculateVaultRewardPoints",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "vaultId",
        type: "uint256",
      },
    ],
    name: "getCompoundingRateForIndex",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "vaultId",
        type: "uint256",
      },
    ],
    name: "getContinousMonthsCompoundingForIndex",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "vaultId",
        type: "uint256",
      },
    ],
    name: "getDepositedSaltForIndex",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "vaultId",
        type: "uint256",
      },
    ],
    name: "getIsIndexEligibleForBonusDuringSaltDeposit",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "vaultIndex",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "startIndex",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "endIndex",
        type: "uint256",
      },
    ],
    name: "rewardVaultIndex",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "vaultId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "compoundingRate",
        type: "uint256",
      },
    ],
    name: "setCompoundingRate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b506117af806100206000396000f3fe608060405234801561001057600080fd5b50600436106100935760003560e01c806396240876116100665780639624087614610109578063a6e1034d1461011c578063d7b8788a1461012f578063dd5d0b0014610142578063f82b94d81461015557600080fd5b80630888357b146100985780630fbcdcbf146100ad5780633f36237e146100d5578063572ddb4c146100f6575b600080fd5b6100ab6100a6366004611331565b610168565b005b6100c06100bb366004611331565b610397565b60405190151581526020015b60405180910390f35b6100e86100e3366004611331565b6103dd565b6040519081526020016100cc565b6100e8610104366004611331565b61041f565b6100ab610117366004611380565b610461565b6100ab61012a366004611452565b6104de565b6100e861013d366004611331565b610978565b6100ab610150366004611495565b6109ba565b6100ab610163366004611495565b610dfc565b600080603a01838154811061017f5761017f6114c1565b60009182526020909120600d9091020160078101549091506001600160a01b031633146101c75760405162461bcd60e51b81526004016101be906114d7565b60405180910390fd5b603a548311156102105760405162461bcd60e51b815260206004820152601460248201527324b73b30b634b2102b30bab63a10273ab6b132b960611b60448201526064016101be565b600054610228906001600160a01b0316333085610f75565b8181600401600082825461023c9190611524565b92505081905550818160050160008282546102579190611524565b909155505060408054839190600090610271908490611524565b909155506000905060015b601e546001600160a01b03166000908152605e6020526040902054811161034e57601e546001600160a01b03166000908152605e602052604081208054839081106102c9576102c96114c1565b6000918252602080832090910154808352818052604080842060088901909352909220549192509080156103385781546000908152601f60205260408120600201546103159083611537565b6000858152600a89016020526040902081905590506103348187611524565b9550505b50505080806103469061154e565b91505061027c565b5060028201819055604080518281526020810185905285917f4a7c32ca92b6741752bafb1173da5c7b3dd1ea73bef90cad6ff03bc405b08677910160405180910390a250505050565b6000806000603a0183815481106103b0576103b06114c1565b60009182526020808320878452600c600d90930201919091019052604090205460ff169150505b92915050565b6000806000603a0183815481106103f6576103f66114c1565b600091825260208083208784526009600d90930201919091019052604090205491505092915050565b6000806000603a018381548110610438576104386114c1565b60009182526020808320878452600b600d90930201919091019052604090205491505092915050565b610469610fd5565b603a8054600181018255600091909152600d027fa2999d817b6757290b50e8ecf3fa939673403dd35c97de392fdb343b4015ce9e01806104a985826115ef565b506006810180546001600160a01b039485166001600160a01b0319918216179091556007909101805492909316911617905550565b6011546001036105305760405162461bcd60e51b815260206004820152601960248201527f5265656e7472616e637920666c6167207472696767657265640000000000000060448201526064016101be565b6001601155601e546001600160a01b0390811660009081526058602090815260408083208a84529091529020541633146105a75760405162461bcd60e51b8152602060048201526018602482015277165bdd48191bc81b9bdd081bdddb881d1a1a5cc8109d5b1b60421b60448201526064016101be565b600086815260208052604090206001810154851180156105ca5750838160020154105b80156105d95750828160030154105b80156105e85750818160040154105b156106465760405162461bcd60e51b815260206004820152602860248201527f4e6f7420656e6f7567682073616c7420696e207468652062756c6c732073616c6044820152671d081dd85b1b195d60c21b60648201526084016101be565b8481600101600082825461065a91906116af565b925050819055508381600201600082825461067591906116af565b925050819055508281600301600082825461069091906116af565b92505081905550818160040160008282546106ab91906116af565b909155505060325460009081906106c29088611537565b6106cc9082611524565b6036549091506106dc9088611537565b6106e69083611524565b6033549092506106f69087611537565b6107009082611524565b6037549091506107109087611537565b61071a9083611524565b60345490925061072a9086611537565b6107349082611524565b6038549091506107449086611537565b61074e9083611524565b60355490925061075e9085611537565b6107689082611524565b6039549091506107789085611537565b6107829083611524565b9150600061078f8361105e565b905061079b8184611524565b9250600080603a018a815481106107b4576107b46114c1565b90600052602060002090600d02019050838160010160008282546107d89190611524565b909155505060008b8152600c8201602052604090205460ff1615610846576000606461080586600a611537565b61080f91906116c2565b905061081b8186611524565b60008d8152600b840160209081526040808320839055600c86019091529020805460ff191690559450505b60008b815260088201602052604081208054869290610866908490611524565b92505081905550838560050160008282546108819190611524565b909155505060058501546113881180159061089e5750603c546064115b80156108b9575060008b8152603e602052604090205460ff16155b1561091157603c54603d80548d929081106108d6576108d66114c1565b6000918252602082200191909155603c8054916108f28361154e565b909155505060008b8152603e60205260409020805460ff191660011790555b60008b815260088201602052604081208054869290610931908490611524565b909155506064905061094484605a611537565b61094e91906116c2565b8160030160008282546109619190611524565b909155505060006011555050505050505050505050565b6000806000603a018381548110610991576109916114c1565b600091825260208083208784526008600d90930201919091019052604090205491505092915050565b600080603a0184815481106109d1576109d16114c1565b60009182526020909120600d9091020160078101549091506001600160a01b03163314610a105760405162461bcd60e51b81526004016101be906114d7565b828211610a5f5760405162461bcd60e51b815260206004820152601860248201527f7374617274206973206c6172676572207468616e20656e64000000000000000060448201526064016101be565b601e546001600160a01b03166000908152605e6020526040902054821115610a9f57601e546001600160a01b03166000908152605e602052604090205491505b60078101546001600160a01b03163314610acb5760405162461bcd60e51b81526004016101be906114d7565b8060020154600003610b1f5760405162461bcd60e51b815260206004820181905260248201527f746f74616c526577617264506f696e7473206973206e6f74207365742079657460448201526064016101be565b6004810154835b838111610d1857600081815260088401602052604090205415610d065760028301546000828152600a850160205260408120546004860154919291610b6b9190611537565b610b7591906116c2565b60008381526009860160205260408120549192506064610b958385611537565b610b9f91906116c2565b90506000610bad82856116af565b905082606403610c0d576000858152600b880160205260408120805491610bd38361154e565b90915550506000858152600b8801602052604090205460041015610c0d576000858152600c880160205260409020805460ff191660011790555b8115610c8a576000610c236304c4b400846116c2565b90506000610c308261105e565b610c3a9083611524565b905080896001016000828254610c509190611524565b9091555050600087815260088a01602052604081208054839290610c75908490611524565b90915550610c85905084896116af565b975050505b8015610d0157601e546001600160a01b0390811660009081526058602090815260408083208984528252808320549093168252600790529081208054839290610cd4908490611524565b90915550610ce4905081876116af565b9550806000600a016000828254610cfb9190611524565b90915550505b505050505b80610d108161154e565b915050610b26565b508015610d54578060006008016000828254610d349190611524565b9091555050600a8054829190600090610d4e908490611524565b90915550505b60015b601e546001600160a01b03166000908152605e60205260409020548111610db257600081815260088401602052604090205415610da0576000818152600a840160205260408120555b80610daa8161154e565b915050610d57565b5060006004830155604080518581526020810185905286917f955dbe96be2a4761fc3d581ffbd13c26516a8646b84af033986a73af11693b4a910160405180910390a25050505050565b601e546001600160a01b039081166000908152605860209081526040808320878452909152902054163314610e6e5760405162461bcd60e51b8152602060048201526018602482015277165bdd48191bc81b9bdd081bdddb881d1a1a5cc8109d5b1b60421b60448201526064016101be565b6000818152603b602052604090205460ff1615610ef35760405162461bcd60e51b815260206004820152603960248201527f4d75737420626520616e20617070726f76656420436f6d706f756e64696e672060448201527f526174652c20652e6720446976697369626c652062792031300000000000000060648201526084016101be565b600080603a018381548110610f0a57610f0a6114c1565b90600052602060002090600d02019050818160090160008681526020019081526020016000208190555082847fac8b46cf760e1b26e4a382b3883026833ffebb4c395347373bc7357a437d28cd84604051610f6791815260200190565b60405180910390a350505050565b604080516001600160a01b0385811660248301528416604482015260648082018490528251808303909101815260849091019091526020810180516001600160e01b03166323b872dd60e01b179052610fcf9085906110ff565b50505050565b7fc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131c600401546001600160a01b0316331461105c5760405162461bcd60e51b815260206004820152602260248201527f4c69624469616d6f6e643a204d75737420626520636f6e7472616374206f776e60448201526132b960f11b60648201526084016101be565b565b604154603f54600091106110865760465460649061107c9084611537565b6103d791906116c2565b604254603f54116110a15760475460649061107c9084611537565b604354603f54116110bc5760485460649061107c9084611537565b604454603f54116110d75760495460649061107c9084611537565b604554603f54116110f257604a5460649061107c9084611537565b506000919050565b919050565b60006111146001600160a01b03841683611167565b9050805160001415801561113957508080602001905181019061113791906116e4565b155b1561116257604051635274afe760e01b81526001600160a01b03841660048201526024016101be565b505050565b60606111a983836040518060400160405280601e81526020017f416464726573733a206c6f772d6c6576656c2063616c6c206661696c656400008152506111b0565b9392505050565b60606111bf84846000856111c7565b949350505050565b6060824710156112285760405162461bcd60e51b815260206004820152602660248201527f416464726573733a20696e73756666696369656e742062616c616e636520666f6044820152651c8818d85b1b60d21b60648201526084016101be565b6001600160a01b0385163b61127f5760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e747261637400000060448201526064016101be565b600080866001600160a01b0316858760405161129b919061172a565b60006040518083038185875af1925050503d80600081146112d8576040519150601f19603f3d011682016040523d82523d6000602084013e6112dd565b606091505b50915091506112ed8282866112f8565b979650505050505050565b606083156113075750816111a9565b8251156113175782518084602001fd5b8160405162461bcd60e51b81526004016101be9190611746565b6000806040838503121561134457600080fd5b50508035926020909101359150565b634e487b7160e01b600052604160045260246000fd5b80356001600160a01b03811681146110fa57600080fd5b60008060006060848603121561139557600080fd5b833567ffffffffffffffff808211156113ad57600080fd5b818601915086601f8301126113c157600080fd5b8135818111156113d3576113d3611353565b604051601f8201601f19908116603f011681019083821181831017156113fb576113fb611353565b8160405282815289602084870101111561141457600080fd5b82602086016020830137600060208483010152809750505050505061143b60208501611369565b915061144960408501611369565b90509250925092565b60008060008060008060c0878903121561146b57600080fd5b505084359660208601359650604086013595606081013595506080810135945060a0013592509050565b6000806000606084860312156114aa57600080fd5b505081359360208301359350604090920135919050565b634e487b7160e01b600052603260045260246000fd5b6020808252601a908201527f6d75737420626520616e20617070726f7665642077616c6c6574000000000000604082015260600190565b634e487b7160e01b600052601160045260246000fd5b808201808211156103d7576103d761150e565b80820281158282048414176103d7576103d761150e565b6000600182016115605761156061150e565b5060010190565b600181811c9082168061157b57607f821691505b60208210810361159b57634e487b7160e01b600052602260045260246000fd5b50919050565b601f82111561116257600081815260208120601f850160051c810160208610156115c85750805b601f850160051c820191505b818110156115e7578281556001016115d4565b505050505050565b815167ffffffffffffffff81111561160957611609611353565b61161d816116178454611567565b846115a1565b602080601f831160018114611652576000841561163a5750858301515b600019600386901b1c1916600185901b1785556115e7565b600085815260208120601f198616915b8281101561168157888601518255948401946001909101908401611662565b508582101561169f5787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b818103818111156103d7576103d761150e565b6000826116df57634e487b7160e01b600052601260045260246000fd5b500490565b6000602082840312156116f657600080fd5b815180151581146111a957600080fd5b60005b83811015611721578181015183820152602001611709565b50506000910152565b6000825161173c818460208701611706565b9190910192915050565b6020815260008251806020840152611765816040850160208701611706565b601f01601f1916919091016040019291505056fea264697066735822122097822a679bcee06a49c27c96c68fe85e4a5a166731d1b2424c2043be3431837f64736f6c63430008140033";

type VaultFacetConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: VaultFacetConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class VaultFacet__factory extends ContractFactory {
  constructor(...args: VaultFacetConstructorParams) {
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
      VaultFacet & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): VaultFacet__factory {
    return super.connect(runner) as VaultFacet__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): VaultFacetInterface {
    return new Interface(_abi) as VaultFacetInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): VaultFacet {
    return new Contract(address, _abi, runner) as unknown as VaultFacet;
  }
}
