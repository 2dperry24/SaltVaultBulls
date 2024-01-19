/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type {
  Signer,
  AddressLike,
  ContractDeployTransaction,
  ContractRunner,
} from "ethers";
import type { NonPayableOverrides } from "../../../common";
import type {
  SaltVaultBulls,
  SaltVaultBullsInterface,
} from "../../../contracts/ExternalContracts/SaltVaultBulls";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_diamondAddress",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "approved",
        type: "address",
      },
      {
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "ApprovalForAll",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
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
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
    ],
    name: "balanceOf",
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
        name: "_rarity",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_quantity",
        type: "uint256",
      },
    ],
    name: "checkClaimEligibility",
    outputs: [
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
    name: "diamondAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getApprovalHistory",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "approved",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "isApprovalActive",
            type: "bool",
          },
        ],
        internalType: "struct LibSharedStructs.IndividualApprovalRecord[]",
        name: "individualApprovals",
        type: "tuple[]",
      },
      {
        components: [
          {
            internalType: "address",
            name: "operator",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "isApprovalActive",
            type: "bool",
          },
        ],
        internalType: "struct LibSharedStructs.OperatorApprovalRecord[]",
        name: "operatorApprovals",
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
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getApproved",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAvailableFreeGemTokenMints",
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
        name: "_rarity",
        type: "uint256",
      },
    ],
    name: "getCostAndMintEligibility",
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
        internalType: "address",
        name: "_owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
    ],
    name: "isApprovedForAll",
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
    name: "isContractApprovedToMint",
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
    name: "isMintingLive",
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
        name: "_rarity",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_addressToMintTo",
        type: "address",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_rarity",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_addressToMintTo",
        type: "address",
      },
    ],
    name: "mintOTC",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
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
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
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
    ],
    name: "ownerOf",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "procurementWallet",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "royaltiesWallet",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_tokenId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_salePrice",
        type: "uint256",
      },
    ],
    name: "royaltyInfo",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "royaltyAmount",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "safeTransferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "operator",
        type: "address",
      },
      {
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "setApprovalForAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_newBaseURI",
        type: "string",
      },
    ],
    name: "setBaseURI",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_usdcContract",
        type: "address",
      },
      {
        internalType: "address",
        name: "_procurementWallet",
        type: "address",
      },
      {
        internalType: "address",
        name: "_royaltiesWallet",
        type: "address",
      },
    ],
    name: "setContractAddresses",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bool",
        name: "_bool",
        type: "bool",
      },
    ],
    name: "setMintingLive",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
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
    name: "symbol",
    outputs: [
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
    inputs: [
      {
        internalType: "uint256",
        name: "index",
        type: "uint256",
      },
    ],
    name: "tokenByIndex",
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
        internalType: "address",
        name: "_owner",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_index",
        type: "uint256",
      },
    ],
    name: "tokenOfOwnerByIndex",
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
    ],
    name: "tokenURI",
    outputs: [
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
    name: "totalSupply",
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
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "usdcTokenContract",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
    ],
    name: "walletOfOwner",
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
] as const;

const _bytecode =
  "0x60806040523480156200001157600080fd5b506040516200265338038062002653833981016040819052620000349162000359565b6040518060400160405280600f81526020016e53616c742056616c742042756c6c7360881b8152506040518060400160405280600381526020016229ab2160e91b815250816000908162000089919062000423565b50600162000098828262000423565b505050620000b5620000af620002e660201b60201c565b620002ea565b6001600b55601080546001600160a01b0383166001600160a01b031991821681178355600c8054909216811790915560405163188ca9df60e21b81526080600482015260848101929092526f53616c74205661756c742042756c6c7360801b60a483015260c06024830152600360c48301526229ab2160e91b60e4830152610100604483015260146101048301527f697066733a2f2f7374617274696e67446174612f0000000000000000000000006101248301526101406064830152600561014483015264173539b7b760d91b61016483015290636232a77c9061018401600060405180830381600087803b158015620001af57600080fd5b505af1158015620001c4573d6000803e3d6000fd5b5050600c546040516376ca729d60e11b81523060048201526001600160a01b03909116925063ed94e53a9150602401600060405180830381600087803b1580156200020e57600080fd5b505af115801562000223573d6000803e3d6000fd5b50505050600c60009054906101000a90046001600160a01b03166001600160a01b0316634863c1306040518163ffffffff1660e01b8152600401606060405180830381865afa1580156200027b573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190620002a19190620004ef565b600f80546001600160a01b03199081166001600160a01b0393841617909155600e8054821693831693909317909255600d805490921692169190911790555062000539565b3390565b600a80546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b80516001600160a01b03811681146200035457600080fd5b919050565b6000602082840312156200036c57600080fd5b62000377826200033c565b9392505050565b634e487b7160e01b600052604160045260246000fd5b600181811c90821680620003a957607f821691505b602082108103620003ca57634e487b7160e01b600052602260045260246000fd5b50919050565b601f8211156200041e57600081815260208120601f850160051c81016020861015620003f95750805b601f850160051c820191505b818110156200041a5782815560010162000405565b5050505b505050565b81516001600160401b038111156200043f576200043f6200037e565b620004578162000450845462000394565b84620003d0565b602080601f8311600181146200048f5760008415620004765750858301515b600019600386901b1c1916600185901b1785556200041a565b600085815260208120601f198616915b82811015620004c0578886015182559484019460019091019084016200049f565b5085821015620004df5787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b6000806000606084860312156200050557600080fd5b62000510846200033c565b925062000520602085016200033c565b915062000530604085016200033c565b90509250925092565b61210a80620005496000396000f3fe608060405234801561001057600080fd5b506004361061021c5760003560e01c80636a60c3b71161012557806395d89b41116100ad578063c0bc47021161007c578063c0bc470214610498578063c87b56dd146104ab578063db848d49146104be578063e985e9c5146104d1578063f2fde38b146104e457600080fd5b806395d89b4114610462578063a22cb4651461046a578063adf09b851461047d578063b88d4fde1461048557600080fd5b806385f80ae5116100f457806385f80ae51461041b57806388b50929146104235780638ab633801461042b5780638da5cb5b1461043e57806394bf804d1461044f57600080fd5b80636a60c3b7146103da57806370a08231146103ed578063715018a61461040057806374697ce31461040857600080fd5b80632f745c59116101a85780634f6ccce7116101775780634f6ccce71461037b5780635297639c1461038e57806355f804b3146103a15780636352211e146103b457806367aaea00146103c757600080fd5b80632f745c591461031f5780632fe0c9ed1461033257806342842e0e14610348578063438b63001461035b57600080fd5b80630c0a72b9116101ef5780630c0a72b91461029e57806318160ddd146102b157806323b872dd146102c757806324d8dd4a146102da5780632a55205a146102ed57600080fd5b806301ffc9a71461022157806306fdde0314610249578063081812fc1461025e578063095ea7b314610289575b600080fd5b61023461022f36600461174a565b6104f7565b60405190151581526020015b60405180910390f35b610251610522565b60405161024091906117c4565b61027161026c3660046117d7565b610599565b6040516001600160a01b039091168152602001610240565b61029c610297366004611805565b610608565b005b61029c6102ac366004611831565b610679565b6102b96107dc565b604051908152602001610240565b61029c6102d5366004611861565b61084a565b6102b96102e83660046117d7565b6108d2565b6103006102fb3660046118a2565b610941565b604080516001600160a01b039093168352602083019190915201610240565b6102b961032d366004611805565b610971565b61033a6109ee565b604051610240929190611920565b61029c610356366004611861565b610a79565b61036e610369366004611995565b610a90565b60405161024091906119b2565b6102b96103893660046117d7565b610b03565b600f54610271906001600160a01b031681565b61029c6103af366004611aef565b610b96565b6102716103c23660046117d7565b610c03565b6102516103d53660046118a2565b610c35565b601054610271906001600160a01b031681565b6102b96103fb366004611995565b610cbc565b61029c610cef565b61029c610416366004611b46565b610d03565b6102b9610eaf565b610234610f08565b61029c610439366004611b63565b610f76565b600a546001600160a01b0316610271565b61029c61045d366004611831565b610fbd565b610251611062565b61029c610478366004611bae565b6110ac565b6102346110ec565b61029c610493366004611bdc565b611136565b600e54610271906001600160a01b031681565b6102516104b93660046117d7565b6111a4565b600d54610271906001600160a01b031681565b6102346104df366004611c5c565b611216565b61029c6104f2366004611995565b61128d565b60006001600160e01b0319821663152a902d60e11b148061051c575061051c82611306565b92915050565b600c5460408051630ed64f4360e21b815290516060926001600160a01b031691633b593d0c9160048083019260009291908290030181865afa15801561056c573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526105949190810190611c8a565b905090565b600c54604051636e1e3cdd60e01b8152600481018390526000916001600160a01b031690636e1e3cdd906024015b602060405180830381865afa1580156105e4573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061051c9190611d01565b600c54604051637126309160e01b81523360048201526001600160a01b03848116602483015260448201849052909116906371263091906064015b600060405180830381600087803b15801561065d57600080fd5b505af1158015610671573d6000803e3d6000fd5b505050505050565b61068161132b565b60068211156106d75760405162461bcd60e51b815260206004820152601e60248201527f4e756d626572206e6f742077697468696e207261726974792052616e6765000060448201526064015b60405180910390fd5b600f546001600160a01b0316336001600160a01b03161461073a5760405162461bcd60e51b815260206004820152601a60248201527f6d7573742062652070726f637572656d656e742077616c6c657400000000000060448201526064016106ce565b6000610745836108d2565b9050806000036107675760405162461bcd60e51b81526004016106ce90611d1e565b600c5460405163e5f8bf3760e01b8152600481018590526001600160a01b0384811660248301529091169063e5f8bf3790604401600060405180830381600087803b1580156107b557600080fd5b505af11580156107c9573d6000803e3d6000fd5b50505050506107d86001600b55565b5050565b600c54604080516316443cbf60e11b815290516000926001600160a01b031691632c88797e9160048083019260209291908290030181865afa158015610826573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105949190611d6c565b600c546001600160a01b03166381623dd2335b6040516001600160e01b031960e084901b1681526001600160a01b0391821660048201528187166024820152908516604482015260648101849052608401600060405180830381600087803b1580156108b557600080fd5b505af11580156108c9573d6000803e3d6000fd5b50505050505050565b600c54604051632647a5bd60e21b8152600481018390526000916001600160a01b03169063991e96f4906024015b602060405180830381865afa15801561091d573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061051c9190611d6c565b6000806064610951846005611d85565b61095b9190611daa565b600e546001600160a01b03169590945092505050565b600c5460405163c077a57f60e01b81526001600160a01b03848116600483015260248201849052600092169063c077a57f90604401602060405180830381865afa1580156109c3573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109e79190611d6c565b9392505050565b600c5460609081906001600160a01b031663edc924a4336040516001600160e01b031960e084901b1681526001600160a01b039091166004820152602401600060405180830381865afa158015610a49573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610a719190810190611e96565b915091509091565b600c546001600160a01b031663f709b9063361085d565b600c546040516350ccdb0960e11b81526001600160a01b038381166004830152606092169063a199b61290602401600060405180830381865afa158015610adb573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261051c9190810190611f9e565b6000610b0e60085490565b8210610b715760405162461bcd60e51b815260206004820152602c60248201527f455243373231456e756d657261626c653a20676c6f62616c20696e646578206f60448201526b7574206f6620626f756e647360a01b60648201526084016106ce565b60088281548110610b8457610b84612024565b90600052602060002001549050919050565b610b9e611384565b600c54604051630df4ed5f60e31b81526001600160a01b0390911690636fa76af890610bce9084906004016117c4565b600060405180830381600087803b158015610be857600080fd5b505af1158015610bfc573d6000803e3d6000fd5b5050505050565b600c54604051636dc2410d60e01b8152600481018390526000916001600160a01b031690636dc2410d906024016105c7565b60606000610c42846108d2565b905082600114610c7c57505060408051808201909152601281527109edcd8f2406240dad2dce840e0cae440e8f60731b602082015261051c565b80600003610ca5576040518060600160405280602681526020016120af6026913991505061051c565b505060408051602081019091526000815292915050565b600c54604051630484dd2d60e51b81526001600160a01b038381166004830152600092169063909ba5a090602401610900565b610cf7611384565b610d0160006113de565b565b610d0b611384565b600d546001600160a01b03161580610d2c57506010546001600160a01b0316155b80610d405750600f546001600160a01b0316155b80610d545750600e546001600160a01b0316155b15610da15760405162461bcd60e51b815260206004820152601d60248201527f416c6c2061646472657373206d7573742062652073657420666972737400000060448201526064016106ce565b600c60009054906101000a90046001600160a01b03166001600160a01b0316630560a0576040518163ffffffff1660e01b8152600401602060405180830381865afa158015610df4573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e18919061203a565b1515600003610e7d5760405162461bcd60e51b815260206004820152602b60248201527f6e6f742073657420746f206d696e7420796574206f6e2074686520455243373260448201526a0c48199858d95d081e595d60aa1b60648201526084016106ce565b600c54604051635b1905b960e11b815282151560048201526001600160a01b039091169063b6320b7290602401610bce565b600c546000906001600160a01b03166305ec0d87336040516001600160e01b031960e084901b1681526001600160a01b039091166004820152602401602060405180830381865afa158015610826573d6000803e3d6000fd5b600c5460408051630560a05760e01b815290516000926001600160a01b031691630560a0579160048083019260209291908290030181865afa158015610f52573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610594919061203a565b610f7e611384565b600d80546001600160a01b039485166001600160a01b031991821617909155600f805493851693821693909317909255600e8054919093169116179055565b610fc561132b565b60068211156110165760405162461bcd60e51b815260206004820152601e60248201527f4e756d626572206e6f742077697468696e207261726974792052616e6765000060448201526064016106ce565b6000611021836108d2565b9050806000036110435760405162461bcd60e51b81526004016106ce90611d1e565b601054600d54610767916001600160a01b039182169185911684611430565b600c5460408051630b4f6fc360e21b815290516060926001600160a01b031691632d3dbf0c9160048083019260009291908290030181865afa15801561056c573d6000803e3d6000fd5b600c546040516336ea1ad360e01b81523360048201526001600160a01b0384811660248301528315156044830152909116906336ea1ad390606401610643565b600c546040805163f030474b60e01b815290516000926001600160a01b03169163f030474b9160048083019260209291908290030181865afa158015610f52573d6000803e3d6000fd5b600c546001600160a01b03166325fba11f33868686866040518663ffffffff1660e01b815260040161116c959493929190612057565b600060405180830381600087803b15801561118657600080fd5b505af115801561119a573d6000803e3d6000fd5b5050505050505050565b600c54604051632a5ccb4d60e01b8152600481018390526060916001600160a01b031690632a5ccb4d90602401600060405180830381865afa1580156111ee573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261051c9190810190611c8a565b600c546040516305abebd960e31b81526001600160a01b03848116600483015283811660248301526000921690632d5f5ec890604401602060405180830381865afa158015611269573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109e7919061203a565b611295611384565b6001600160a01b0381166112fa5760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b60648201526084016106ce565b611303816113de565b50565b60006001600160e01b0319821663780e9d6360e01b148061051c575061051c82611490565b6002600b540361137d5760405162461bcd60e51b815260206004820152601f60248201527f5265656e7472616e637947756172643a207265656e7472616e742063616c6c0060448201526064016106ce565b6002600b55565b600a546001600160a01b03163314610d015760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016106ce565b600a80546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b604080516001600160a01b0385811660248301528416604482015260648082018490528251808303909101815260849091019091526020810180516001600160e01b03166323b872dd60e01b17905261148a9085906114e0565b50505050565b60006001600160e01b031982166380ac58cd60e01b14806114c157506001600160e01b03198216635b5e139f60e01b145b8061051c57506301ffc9a760e01b6001600160e01b031983161461051c565b6000611535826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c6564815250856001600160a01b03166115ba9092919063ffffffff16565b9050805160001480611556575080806020019051810190611556919061203a565b6115b55760405162461bcd60e51b815260206004820152602a60248201527f5361666545524332303a204552433230206f7065726174696f6e20646964206e6044820152691bdd081cdd58d8d9595960b21b60648201526084016106ce565b505050565b60606115c984846000856115d1565b949350505050565b6060824710156116325760405162461bcd60e51b815260206004820152602660248201527f416464726573733a20696e73756666696369656e742062616c616e636520666f6044820152651c8818d85b1b60d21b60648201526084016106ce565b600080866001600160a01b0316858760405161164e9190612092565b60006040518083038185875af1925050503d806000811461168b576040519150601f19603f3d011682016040523d82523d6000602084013e611690565b606091505b50915091506116a1878383876116ac565b979650505050505050565b6060831561171b578251600003611714576001600160a01b0385163b6117145760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e747261637400000060448201526064016106ce565b50816115c9565b6115c983838151156117305781518083602001fd5b8060405162461bcd60e51b81526004016106ce91906117c4565b60006020828403121561175c57600080fd5b81356001600160e01b0319811681146109e757600080fd5b60005b8381101561178f578181015183820152602001611777565b50506000910152565b600081518084526117b0816020860160208601611774565b601f01601f19169290920160200192915050565b6020815260006109e76020830184611798565b6000602082840312156117e957600080fd5b5035919050565b6001600160a01b038116811461130357600080fd5b6000806040838503121561181857600080fd5b8235611823816117f0565b946020939093013593505050565b6000806040838503121561184457600080fd5b823591506020830135611856816117f0565b809150509250929050565b60008060006060848603121561187657600080fd5b8335611881816117f0565b92506020840135611891816117f0565b929592945050506040919091013590565b600080604083850312156118b557600080fd5b50508035926020909101359150565b600081518084526020808501945080840160005b8381101561191557815180516001600160a01b031688528381015184890152604090810151151590880152606090960195908201906001016118d8565b509495945050505050565b6040808252835182820181905260009190606090818501906020808901865b8381101561198157815180518652838101516001600160a01b03168487015287810151888701528601511515868601526080909401939082019060010161193f565b505086830390870152506116a181876118c4565b6000602082840312156119a757600080fd5b81356109e7816117f0565b6020808252825182820181905260009190848201906040850190845b818110156119ea578351835292840192918401916001016119ce565b50909695505050505050565b634e487b7160e01b600052604160045260246000fd5b6040516060810167ffffffffffffffff81118282101715611a2f57611a2f6119f6565b60405290565b6040516080810167ffffffffffffffff81118282101715611a2f57611a2f6119f6565b604051601f8201601f1916810167ffffffffffffffff81118282101715611a8157611a816119f6565b604052919050565b600067ffffffffffffffff821115611aa357611aa36119f6565b50601f01601f191660200190565b6000611ac4611abf84611a89565b611a58565b9050828152838383011115611ad857600080fd5b828260208301376000602084830101529392505050565b600060208284031215611b0157600080fd5b813567ffffffffffffffff811115611b1857600080fd5b8201601f81018413611b2957600080fd5b6115c984823560208401611ab1565b801515811461130357600080fd5b600060208284031215611b5857600080fd5b81356109e781611b38565b600080600060608486031215611b7857600080fd5b8335611b83816117f0565b92506020840135611b93816117f0565b91506040840135611ba3816117f0565b809150509250925092565b60008060408385031215611bc157600080fd5b8235611bcc816117f0565b9150602083013561185681611b38565b60008060008060808587031215611bf257600080fd5b8435611bfd816117f0565b93506020850135611c0d816117f0565b925060408501359150606085013567ffffffffffffffff811115611c3057600080fd5b8501601f81018713611c4157600080fd5b611c5087823560208401611ab1565b91505092959194509250565b60008060408385031215611c6f57600080fd5b8235611c7a816117f0565b91506020830135611856816117f0565b600060208284031215611c9c57600080fd5b815167ffffffffffffffff811115611cb357600080fd5b8201601f81018413611cc457600080fd5b8051611cd2611abf82611a89565b818152856020838501011115611ce757600080fd5b611cf8826020830160208601611774565b95945050505050565b600060208284031215611d1357600080fd5b81516109e7816117f0565b6020808252602e908201527f4d696e74696e67206973206e6f74206c697665206f722074686973207261726960408201526d1d1e481a5cc81cdbdb19081bdd5d60921b606082015260800190565b600060208284031215611d7e57600080fd5b5051919050565b808202811582820484141761051c57634e487b7160e01b600052601160045260246000fd5b600082611dc757634e487b7160e01b600052601260045260246000fd5b500490565b600067ffffffffffffffff821115611de657611de66119f6565b5060051b60200190565b600082601f830112611e0157600080fd5b81516020611e11611abf83611dcc565b82815260609283028501820192828201919087851115611e3057600080fd5b8387015b85811015611e895781818a031215611e4c5760008081fd5b611e54611a0c565b8151611e5f816117f0565b81528186015186820152604080830151611e7881611b38565b908201528452928401928101611e34565b5090979650505050505050565b6000806040808486031215611eaa57600080fd5b835167ffffffffffffffff80821115611ec257600080fd5b818601915086601f830112611ed657600080fd5b81516020611ee6611abf83611dcc565b82815260079290921b8401810191818101908a841115611f0557600080fd5b948201945b83861015611f6d576080868c031215611f235760008081fd5b611f2b611a35565b8651815283870151611f3c816117f0565b818501528688015188820152606080880151611f5781611b38565b9082015282526080959095019490820190611f0a565b91890151919750909450505080831115611f8657600080fd5b5050611f9485828601611df0565b9150509250929050565b60006020808385031215611fb157600080fd5b825167ffffffffffffffff811115611fc857600080fd5b8301601f81018513611fd957600080fd5b8051611fe7611abf82611dcc565b81815260059190911b8201830190838101908783111561200657600080fd5b928401925b828410156116a15783518252928401929084019061200b565b634e487b7160e01b600052603260045260246000fd5b60006020828403121561204c57600080fd5b81516109e781611b38565b6001600160a01b0386811682528581166020830152841660408201526060810183905260a0608082018190526000906116a190830184611798565b600082516120a4818460208701611774565b919091019291505056fe4d696e74206973206e6f74204c697665206f722052617269747920736f6c64206973206f7574a26469706673582212204aa748e2f86e3e7aea20fe32e9053477ac5f1a1db9dcb1d93452ab9cf1dafcda64736f6c63430008140033";

type SaltVaultBullsConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: SaltVaultBullsConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class SaltVaultBulls__factory extends ContractFactory {
  constructor(...args: SaltVaultBullsConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    _diamondAddress: AddressLike,
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(_diamondAddress, overrides || {});
  }
  override deploy(
    _diamondAddress: AddressLike,
    overrides?: NonPayableOverrides & { from?: string }
  ) {
    return super.deploy(_diamondAddress, overrides || {}) as Promise<
      SaltVaultBulls & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): SaltVaultBulls__factory {
    return super.connect(runner) as SaltVaultBulls__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): SaltVaultBullsInterface {
    return new Interface(_abi) as SaltVaultBullsInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): SaltVaultBulls {
    return new Contract(address, _abi, runner) as unknown as SaltVaultBulls;
  }
}