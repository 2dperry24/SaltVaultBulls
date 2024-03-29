// SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;

struct MetaTxContextStorage {
  address trustedForwarder;
}

struct ERC20Token {
  string name;
  string symbol;
  uint8 decimals;
  mapping(address => uint256) balances;
  mapping(address => mapping(address => uint256)) allowances;
  uint256 totalSupply;
}

struct ERC20TokenConfig {
  string name;
  string symbol;
  uint8 decimals;
}




