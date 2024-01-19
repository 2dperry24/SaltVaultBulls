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
  GemTokenChallengeFacet,
  GemTokenChallengeFacetInterface,
} from "../../../contracts/facets/GemTokenChallengeFacet";

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
        internalType: "address",
        name: "depositor",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "RewardsDeposited",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
    ],
    name: "_walletOfOwnerForGemTokens",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256[]",
        name: "batch",
        type: "uint256[]",
      },
    ],
    name: "addShuffledIndexesBatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "start",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "end",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "color",
        type: "string",
      },
    ],
    name: "bulkPopulateTokens",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "burnAndClaimSpot",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "checkIfWinner",
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
    inputs: [],
    name: "checkTokenScoreForWallet",
    outputs: [
      {
        internalType: "uint256",
        name: "primaryColorPoints",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "pointsAllColors",
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
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "depositRewardsForGame",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getCurrentGameDetails",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
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
    inputs: [],
    name: "getCurrentGemTokenRewardBalance",
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
        name: "tokenIndex",
        type: "uint256",
      },
    ],
    name: "getGemToken",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getGtcWinners",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getWalletTokenValues",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "index",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "color",
            type: "string",
          },
        ],
        internalType: "struct GemToken[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_winningValue",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_primaryColor",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_numberOfWinningSpots",
        type: "uint256",
      },
      {
        internalType: "uint256[]",
        name: "_payoutDistribution",
        type: "uint256[]",
      },
    ],
    name: "setGameParameters",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b506124c4806100206000396000f3fe608060405234801561001057600080fd5b50600436106100cf5760003560e01c8063a6b371a91161008c578063b844007c11610066578063b844007c146101ba578063cb78a3c1146101d2578063da4bd360146101e5578063ecc2cda4146101f857600080fd5b8063a6b371a91461016a578063ad37ff311461017b578063ae93f49d1461019d57600080fd5b80630a0e0194146100d45780632748a1de146100fd57806335a5cff2146101125780635bbec7f61461012d5780636d5d07fa146101425780639a2dc07a14610155575b600080fd5b6100e76100e2366004611cfa565b610200565b6040516100f49190611d5e565b60405180910390f35b6101056102e8565b6040516100f49190611dc1565b61011a6103f9565b6040516100f49796959493929190611e40565b61014061013b366004611e96565b610523565b005b610140610150366004611f66565b610642565b61015d6108fd565b6040516100f49190612044565b600c546040519081526020016100f4565b61018e610189366004611e96565b610962565b6040516100f493929190612091565b6101a5610a4b565b604080519283526020830191909152016100f4565b6101c2610b40565b60405190151581526020016100f4565b6101406101e03660046120b9565b610c6a565b6101406101f336600461212e565b610cca565b610140610df1565b6021546001600160a01b0390811660009081526059602090815260408083209385168352929052908120546060918167ffffffffffffffff81111561024757610247611eaf565b604051908082528060200260200182016040528015610270578160200160208202803683370190505b50905060005b828110156102e0576021546001600160a01b039081166000908152605c6020908152604080832093891683529281528282208483529052205482518390839081106102c3576102c3612188565b6020908102919091010152806102d8816121b4565b915050610276565b509392505050565b606060006102f533610200565b90506000815167ffffffffffffffff81111561031357610313611eaf565b60405190808252806020026020018201604052801561036857816020015b61035560405180606001604052806000815260200160008152602001606081525090565b8152602001906001900390816103315790505b50905060005b82518110156103f257600080600061039e86858151811061039157610391612188565b6020026020010151610962565b9250925092506040518060600160405280848152602001838152602001828152508585815181106103d1576103d1612188565b602002602001018190525050505080806103ea906121b4565b91505061036e565b5092915050565b602954602c54602f54602b54602a805460009560609587958695869589958795949193919260ff8084169361010090041691602e9190869061043a906121cd565b80601f0160208091040260200160405190810160405280929190818152602001828054610466906121cd565b80156104b35780601f10610488576101008083540402835291602001916104b3565b820191906000526020600020905b81548152906001019060200180831161049657829003601f168201915b505050505095508180548060200260200160405190810160405280929190818152602001828054801561050557602002820191906000526020600020905b8154815260200190600101908083116104f1575b50505050509150965096509650965096509650965090919293949596565b3360009081526031602052604090205460ff166105805760405162461bcd60e51b8152602060048201526016602482015275139bdd08185b88185c1c1c9bdd9959081dd85b1b195d60521b60448201526064015b60405180910390fd5b6001546001600160a01b03166105d85760405162461bcd60e51b815260206004820152601e60248201527f4d75737420736574202453565420636f6e7472616374206164647265737300006044820152606401610577565b6001546105f0906001600160a01b031633308461112b565b806000600c0160008282546106059190612207565b909155505060405181815233907fb8b27d0db504fa5d914f1fd330347096e88d5ff94b6c612d32797e7c12a8f66f9060200160405180910390a250565b3360009081526031602052604090205460ff1661069a5760405162461bcd60e51b8152602060048201526016602482015275139bdd08185b88185c1c1c9bdd9959081dd85b1b195d60521b6044820152606401610577565b6040516026906106ab90859061221a565b9081526040519081900360200190205460ff166106fa5760405162461bcd60e51b815260206004820152600d60248201526c24b73b30b634b21021b7b637b960991b6044820152606401610577565b600c546107555760405162461bcd60e51b8152602060048201526024808201527f4d757374206465706f7369742053565420696e746f20636f6e747261637420666044820152631a5c9cdd60e21b6064820152608401610577565b602e54602c54146107a85760405162461bcd60e51b815260206004820152601b60248201527f7061796f757420737472756374757265206d757374206d6174636800000000006044820152606401610577565b602f54610100900460ff16156107f75760405162461bcd60e51b815260206004820152601460248201527347616d65206973207374696c6c2061637469766560601b6044820152606401610577565b6000805b825181101561083d5782818151811061081657610816612188565b6020026020010151826108299190612207565b915080610835816121b4565b9150506107fb565b508060641461089f5760405162461bcd60e51b815260206004820152602860248201527f546f74616c207061796f757420646973747269627574696f6e206d757374206560448201526707175616c203130360c41b6064820152608401610577565b602f805461ff00191661010017905581516108c190602e906020850190611c1f565b506029859055602a6108d3858261227c565b50602c83905542602b556108e9602d6000611c6a565b5050602f805460ff19166001179055505050565b60606000602d0180548060200260200160405190810160405280929190818152602001828054801561095857602002820191906000526020600020905b81546001600160a01b0316815260019091019060200180831161093a575b5050505050905090565b6000806060600080602201600086815260200190815260200160002060405180606001604052908160008201548152602001600182015481526020016002820180546109ad906121cd565b80601f01602080910402602001604051908101604052809291908181526020018280546109d9906121cd565b8015610a265780601f106109fb57610100808354040283529160200191610a26565b820191906000526020600020905b815481529060010190602001808311610a0957829003601f168201915b5050509190925250508151602083015160409093015190989297509550909350505050565b6000806000610a5933610200565b603054909150600090610a6f906201518061233c565b602b54610a7c9042612353565b1180159150610b275760005b8251811015610b2557600080610aa985848151811061039157610391612188565b6040519194509250610ac19150602a90602001612366565b6040516020818303038152906040528051906020012081604051602001610ae8919061221a565b6040516020818303038152906040528051906020012003610b1057610b0d8288612207565b96505b50508080610b1d906121b4565b915050610a88565b505b610b38610b3333610200565b61118b565b925050509091565b60008080610b4d33610200565b603054909150600090610b63906201518061233c565b602b54610b709042612353565b1115905060008115610c3f5760005b8351811015610c1c57600080610ba086848151811061039157610391612188565b6040519194509250610bb89150602a90602001612366565b6040516020818303038152906040528051906020012081604051602001610bdf919061221a565b6040516020818303038152906040528051906020012003610c0757610c048288612207565b96505b50508080610c14906121b4565b915050610b7f565b5060295484148015610c385750610c35610b3333610200565b84145b9050610c52565b610c4b610b3333610200565b6029541490505b808015610c615750602f5460ff165b94505050505090565b610c726111d5565b60005b81811015610cc5576028838383818110610c9157610c91612188565b8354600181018555600094855260209485902091909402929092013591909201555080610cbd816121b4565b915050610c75565b505050565b610cd26111d5565b82841115610d125760405162461bcd60e51b815260206004820152600d60248201526c496e76616c69642072616e676560981b6044820152606401610577565b604051602690610d2390839061221a565b9081526040519081900360200190205460ff16610d725760405162461bcd60e51b815260206004820152600d60248201526c24b73b30b634b21021b7b637b960991b6044820152606401610577565b835b838111158015610d8657506023548111155b15610dea576040805160608101825282815260208082018681528284018681526000868152602290935293909120825181559051600182015591519091906002820190610dd3908261227c565b509050508080610de2906121b4565b915050610d74565b5050505050565b602f5460ff16610e345760405162461bcd60e51b815260206004820152600e60248201526d11d85b59481a5cc818db1bdcd95960921b6044820152606401610577565b601054600103610e865760405162461bcd60e51b815260206004820152601960248201527f5265656e7472616e637920666c616720747269676765726564000000000000006044820152606401610577565b6001601055610e93610b40565b15611124576021546001600160a01b03166000908152605b60209081526040808320338452825280832030845290915290205460ff16610f265760405162461bcd60e51b815260206004820152602860248201527f436f6e7472616374206e6f7420617070726f76656420746f207472616e7366656044820152677220746f6b656e7360c01b6064820152608401610577565b600080610f3233610200565b603054909150600090610f48906201518061233c565b602b54610f559042612353565b1115905060005b825181101561101057600080610f7d85848151811061039157610391612188565b92509250508315610fee57604051610f9a90602a90602001612366565b6040516020818303038152906040528051906020012081604051602001610fc1919061221a565b6040516020818303038152906040528051906020012003610fe957610fe68287612207565b95505b610ffb565b610ff88287612207565b95505b50508080611008906121b4565b915050610f5c565b5060295483146110595760405162461bcd60e51b8152602060048201526014602482015273139bdd0818481dda5b9b9a5b99c81dd85b1b195d60621b6044820152606401610577565b60005b82518110156110b35760215460055484516110a1926001600160a01b0390811692339291169087908690811061109457611094612188565b602002602001015161125e565b806110ab816121b4565b91505061105c565b50602c54602d54101561110357602d80546001810182556000919091527f4a2cc91ee622da3bc833a54c37ffcb6f3ec23b7793efc5eaf5e71b7b406c5c060180546001600160a01b031916331790555b602c54602d540361112057602f805460ff19169055611120611430565b5050505b6000601055565b604080516001600160a01b0385811660248301528416604482015260648082018490528251808303909101815260849091019091526020810180516001600160e01b03166323b872dd60e01b1790526111859085906115de565b50505050565b600080805b83518110156103f25760006111b085838151811061039157610391612188565b5091506111bf90508184612207565b92505080806111cd906121b4565b915050611190565b7fc8fcad8db84d3cc18b4c41d551ea0ee66dd599cde068d998e57d5e09332c131c600401546001600160a01b0316331461125c5760405162461bcd60e51b815260206004820152602260248201527f4c69624469616d6f6e643a204d75737420626520636f6e7472616374206f776e60448201526132b960f11b6064820152608401610577565b565b6001600160a01b03848116600090815260586020908152604080832085845290915281205490918581169116146112a75760405162461bcd60e51b8152600401610577906123dc565b6001600160a01b0383166113095760405162461bcd60e51b8152602060048201526024808201527f4552433732313a207472616e7366657220746f20746865207a65726f206164646044820152637265737360e01b6064820152608401610577565b611317858585856001611641565b6001600160a01b03858116600090815260588301602090815260408083208684529091529020548116908516146113605760405162461bcd60e51b8152600401610577906123dc565b6001600160a01b0385166000908152605a820160209081526040808320858452909152902080546001600160a01b031916905561139d85836117c1565b6001600160a01b038581166000818152605984016020908152604080832089861680855290835281842080546000190190559488168084528184208054600101905593835260588601825280832087845290915280822080546001600160a01b03191684179055518593917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef91a4610dea565b602f5460ff16156114785760405162461bcd60e51b815260206004820152601260248201527123b0b6b29034b99039ba34b6361037b832b760711b6044820152606401610577565b602f54610100900460ff166114cf5760405162461bcd60e51b815260206004820152601960248201527f47616d65206d757374207374696c6c20626520616374697665000000000000006044820152606401610577565b600c548060005b602c5481101561159357600060646000602e0183815481106114fa576114fa612188565b906000526020600020015485611510919061233c565b61151a9190612421565b9050806000600701600080602d01858154811061153957611539612188565b60009182526020808320909101546001600160a01b031683528201929092526040018120805490919061156d908490612207565b9091555061157d90508184612353565b925050808061158b906121b4565b9150506114d6565b5080156115ca576002546001600160a01b0316600090815260076020526040812080548392906115c4908490612207565b90915550505b5050602f805461ff00191690556000600c55565b60006115f36001600160a01b03841683611818565b905080516000141580156116185750808060200190518101906116169190612443565b155b15610cc557604051635274afe760e01b81526001600160a01b0384166004820152602401610577565b60018111156116b05760405162461bcd60e51b815260206004820152603560248201527f455243373231456e756d657261626c653a20636f6e7365637574697665207472604482015274185b9cd9995c9cc81b9bdd081cdd5c1c1bdc9d1959605a1b6064820152608401610577565b816001600160a01b038516611706576001600160a01b0386166000908152605e602081815260408084208054605f845282862087875284529185208290559282526001810183559183529091200181905561172a565b836001600160a01b0316856001600160a01b03161461172a5761172a868683611863565b6001600160a01b03841661174757611742868261196d565b6117b9565b846001600160a01b0316846001600160a01b0316146117b9576001600160a01b03808716600081815260596020908152604080832094891680845294825280832054848452605c83528184209584529482528083208584528252808320869055928252605d8152828220858352905220555b505050505050565b6001600160a01b038216600090815260606020908152604080832084845290915281205415610cc5576001600160a01b038316600090815260608201602090815260408083208584529091528120610cc591611c8b565b606061185a83836040518060400160405280601e81526020017f416464726573733a206c6f772d6c6576656c2063616c6c206661696c65640000815250611a9c565b90505b92915050565b6001600160a01b038381166000908152605960209081526040808320938616835292905290812054819061189990600190612353565b6001600160a01b0386166000908152605d84016020908152604080832087845290915290205490915080821461191c576001600160a01b038681166000818152605c860160209081526040808320948a168352938152838220868352815283822054858352848320819055928252605d8701815283822092825291909152208190555b506001600160a01b039485166000818152605d840160209081526040808320968352958152858220829055918152605c90930181528383209490951682529284528181209281529190925290812055565b6001600160a01b0382166000908152605e6020526040812054819061199490600190612353565b6001600160a01b0385166000818152605f850160209081526040808320888452825280832054938352605e8701909152812080549394509192909190849081106119e0576119e0612188565b906000526020600020015490508084605e016000886001600160a01b03166001600160a01b031681526020019081526020016000208381548110611a2657611a26612188565b6000918252602080832091909101929092556001600160a01b038816808252605f8701835260408083208584528452808320869055888352808320839055908252605e870190925220805480611a7e57611a7e612465565b60019003818190600052602060002001600090559055505050505050565b6060611aab8484600085611ab5565b90505b9392505050565b606082471015611b165760405162461bcd60e51b815260206004820152602660248201527f416464726573733a20696e73756666696369656e742062616c616e636520666f6044820152651c8818d85b1b60d21b6064820152608401610577565b6001600160a01b0385163b611b6d5760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e74726163740000006044820152606401610577565b600080866001600160a01b03168587604051611b89919061221a565b60006040518083038185875af1925050503d8060008114611bc6576040519150601f19603f3d011682016040523d82523d6000602084013e611bcb565b606091505b5091509150611bdb828286611be6565b979650505050505050565b60608315611bf5575081611aae565b825115611c055782518084602001fd5b8160405162461bcd60e51b8152600401610577919061247b565b828054828255906000526020600020908101928215611c5a579160200282015b82811115611c5a578251825591602001919060010190611c3f565b50611c66929150611cac565b5090565b5080546000825590600052602060002090810190611c889190611cac565b50565b5080546000825560040290600052602060002090810190611c889190611cc1565b5b80821115611c665760008155600101611cad565b5b80821115611c665760008082556001820180546001600160a01b0319169055600282015560038101805460ff19169055600401611cc2565b600060208284031215611d0c57600080fd5b81356001600160a01b0381168114611aae57600080fd5b600081518084526020808501945080840160005b83811015611d5357815187529582019590820190600101611d37565b509495945050505050565b60208152600061185a6020830184611d23565b60005b83811015611d8c578181015183820152602001611d74565b50506000910152565b60008151808452611dad816020860160208601611d71565b601f01601f19169290920160200192915050565b60006020808301818452808551808352604092508286019150828160051b87010184880160005b83811015611e3257888303603f1901855281518051845287810151888501528601516060878501819052611e1e81860183611d95565b968901969450505090860190600101611de8565b509098975050505050505050565b87815260e060208201526000611e5960e0830189611d95565b8760408401528615156060840152851515608084015282810360a0840152611e818186611d23565b9150508260c083015298975050505050505050565b600060208284031215611ea857600080fd5b5035919050565b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f1916810167ffffffffffffffff81118282101715611eee57611eee611eaf565b604052919050565b600082601f830112611f0757600080fd5b813567ffffffffffffffff811115611f2157611f21611eaf565b611f34601f8201601f1916602001611ec5565b818152846020838601011115611f4957600080fd5b816020850160208301376000918101602001919091529392505050565b60008060008060808587031215611f7c57600080fd5b8435935060208086013567ffffffffffffffff80821115611f9c57600080fd5b611fa889838a01611ef6565b9550604088013594506060880135915080821115611fc557600080fd5b818801915088601f830112611fd957600080fd5b813581811115611feb57611feb611eaf565b8060051b9150611ffc848301611ec5565b818152918301840191848101908b84111561201657600080fd5b938501935b838510156120345784358252938501939085019061201b565b989b979a50959850505050505050565b6020808252825182820181905260009190848201906040850190845b818110156120855783516001600160a01b031683529284019291840191600101612060565b50909695505050505050565b8381528260208201526060604082015260006120b06060830184611d95565b95945050505050565b600080602083850312156120cc57600080fd5b823567ffffffffffffffff808211156120e457600080fd5b818501915085601f8301126120f857600080fd5b81358181111561210757600080fd5b8660208260051b850101111561211c57600080fd5b60209290920196919550909350505050565b6000806000806080858703121561214457600080fd5b843593506020850135925060408501359150606085013567ffffffffffffffff81111561217057600080fd5b61217c87828801611ef6565b91505092959194509250565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b6000600182016121c6576121c661219e565b5060010190565b600181811c908216806121e157607f821691505b60208210810361220157634e487b7160e01b600052602260045260246000fd5b50919050565b8082018082111561185d5761185d61219e565b6000825161222c818460208701611d71565b9190910192915050565b601f821115610cc557600081815260208120601f850160051c8101602086101561225d5750805b601f850160051c820191505b818110156117b957828155600101612269565b815167ffffffffffffffff81111561229657612296611eaf565b6122aa816122a484546121cd565b84612236565b602080601f8311600181146122df57600084156122c75750858301515b600019600386901b1c1916600185901b1785556117b9565b600085815260208120601f198616915b8281101561230e578886015182559484019460019091019084016122ef565b508582101561232c5787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b808202811582820484141761185d5761185d61219e565b8181038181111561185d5761185d61219e565b6000808354612374816121cd565b6001828116801561238c57600181146123a1576123d0565b60ff19841687528215158302870194506123d0565b8760005260208060002060005b858110156123c75781548a8201529084019082016123ae565b50505082870194505b50929695505050505050565b60208082526025908201527f4552433732313a207472616e736665722066726f6d20696e636f72726563742060408201526437bbb732b960d91b606082015260800190565b60008261243e57634e487b7160e01b600052601260045260246000fd5b500490565b60006020828403121561245557600080fd5b81518015158114611aae57600080fd5b634e487b7160e01b600052603160045260246000fd5b60208152600061185a6020830184611d9556fea2646970667358221220a7140f8797ed9d3cc710c36da45401b0f74759a6336a77fc45b99429c3e43a5264736f6c63430008140033";

type GemTokenChallengeFacetConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: GemTokenChallengeFacetConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class GemTokenChallengeFacet__factory extends ContractFactory {
  constructor(...args: GemTokenChallengeFacetConstructorParams) {
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
      GemTokenChallengeFacet & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(
    runner: ContractRunner | null
  ): GemTokenChallengeFacet__factory {
    return super.connect(runner) as GemTokenChallengeFacet__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): GemTokenChallengeFacetInterface {
    return new Interface(_abi) as GemTokenChallengeFacetInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): GemTokenChallengeFacet {
    return new Contract(
      address,
      _abi,
      runner
    ) as unknown as GemTokenChallengeFacet;
  }
}
