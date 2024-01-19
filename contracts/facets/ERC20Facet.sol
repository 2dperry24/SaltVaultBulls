// SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;

import { IERC20Facet } from "../interfaces/IERC20Facet.sol";
import { ERC20Token, ERC20TokenConfig } from "../shared/Structs.sol";
import { LibERC20 } from "../libraries/LibERC20.sol";
// import { AccessControl } from "../shared/AccessControl.sol";
// import { LibAppStorage } from "../libs/LibAppStorage.sol";
import { LibStrings } from "../libraries/LibStrings.sol";


import {AppStorage } from "../AppStorage.sol";


error ERC20InvalidInput();
error ERC20InvalidReceiver(address receiver);
error ERC20NotEnoughAllowance(address owner, address spender);


/**
 * This is a complex example facet that shows how to use the ERC20 facade to launch multiple ERC20 tokens backed by a single diamond proxy.
 */
contract ERC20Facet is IERC20Facet {  

    AppStorage internal s;

    /**
     * @dev Emitted when a new token is deployed.
     */
    event ERC20NewToken(address token);
    /**
     * @dev Emitted when a token is approved for a spender.
     */
    event ERC20Approval(address token, address owner, address spender, uint256 value);

    /*
    IERC20Facet interface implementation
    */

    function erc20DeployToken(string memory name, string memory symbol, uint8 decimals) external {
    if (LibStrings.len(name) == 0 || LibStrings.len(symbol) == 0 || decimals == 0) {
        revert ERC20InvalidInput();
    }
    address token = msg.sender;

    s.erc20name[token] = name;
    s.erc20symbol[token] = symbol;
    s.erc20decimals[token] = decimals;

    // LibERC20.mint(token, msg.sender, 100);

    emit ERC20NewToken(token);
    }

    function erc20Name() external view returns (string memory) {
    return s.erc20name[msg.sender]; 
    }

    function erc20Symbol() external view returns (string memory) {
    return s.erc20symbol[msg.sender];    
    }

    function erc20Decimals() external view returns (uint8) {
    return s.erc20decimals[msg.sender];
    }

    function erc20TotalSupply() external view returns (uint256) {
    return s.erc20totalSupply[msg.sender];
    }

    function erc20BalanceOf(address account) external view returns (uint256) {
    return s.erc20balance[msg.sender][account];
    }

    function erc20Allowance(address account, address spender) external view returns (uint256) {
    return s.erc20allowances[msg.sender][account][spender];
    }

    function erc20Approve(address account, address spender, uint256 amount) external {
    address token = msg.sender;
    s.erc20allowances[token][account][spender] = amount;
    emit ERC20Approval(token, account, spender, amount);
    }

    function erc20Transfer(address caller, address from, address to, uint256 amount) external {
    address token = msg.sender;

    if (to == address(0)) {
        revert ERC20InvalidReceiver(to);
    }

    if (caller != from) {
        if (s.erc20allowances[token][from][caller] < amount) {
        revert ERC20NotEnoughAllowance(from, caller);
        }

        s.erc20allowances[token][from][caller] -= amount;
    }

    LibERC20.transfer(token, from, to, amount);
    }


    function mintToken(address token, address from, uint256 amount) external {

        LibERC20.mint(token, from, amount);
    }










    
      
}


