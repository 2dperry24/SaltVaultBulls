/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  ISaltVaultBulls,
  ISaltVaultBullsInterface,
} from "../../../../contracts/ExternalContracts/SaltVaultToken.sol/ISaltVaultBulls";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
    ],
    name: "vaultedSaltCountOfOwner",
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
] as const;

export class ISaltVaultBulls__factory {
  static readonly abi = _abi;
  static createInterface(): ISaltVaultBullsInterface {
    return new Interface(_abi) as ISaltVaultBullsInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): ISaltVaultBulls {
    return new Contract(address, _abi, runner) as unknown as ISaltVaultBulls;
  }
}