// SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;

import { ERC20Token } from "../shared/Structs.sol";


import {AppStorage } from "../AppStorage.sol";
import {LibAppStorage} from "../libraries/LibAppStorage.sol";


error ERC20NotEnoughBalance(address sender);

library LibERC20 {


    /**
     * @dev Emitted when a token is minted.
     */
    event ERC20Minted(address token, address to, uint256 amount);
    /**
     * @dev Emitted when a token is burned.
     */
    event ERC20Burned(address token, address from, uint256 amount);
    /**
     * @dev Emitted when a token is transferred.
     */
    event ERC20Transferred(address token, address from, address to, uint256 value);

    /**
        * @dev Transfer a token.
        *
        * @param token The token to transfer.
        * @param from The address to transfer the token from.
        * @param to The address to transfer the token to.
        * @param amount The amount to transfer.
        */
    function transfer(address token, address from, address to, uint256 amount) internal {

        AppStorage storage s = LibAppStorage.diamondStorage();


        if (amount > s.erc20balance[token][from]) {
        revert ERC20NotEnoughBalance(from);
        }

        s.erc20balance[token][from] -= amount;
        s.erc20balance[token][to] += amount;

        emit ERC20Transferred(token, from, to, amount);
    }

    /**
        * @dev Mint a token.
        *
        * @param token The token to mint.
        * @param to The address to mint the token to.
        * @param amount The amount to mint.
        */
    function mint(address token, address to, uint256 amount) internal {

        AppStorage storage s = LibAppStorage.diamondStorage();
    
        s.erc20totalSupply[token] += amount;
        s.erc20balance[token][to] += amount;

        emit ERC20Minted(token, to, amount);
    }  



    /**
        * @dev Burn a token.
        *
        * @param token The token to burn.
        * @param from The address to burn the token from.
        * @param amount The amount to burn.
        */
    function burn(address token, address from, uint256 amount) internal {

        AppStorage storage s = LibAppStorage.diamondStorage();

 
        if (s.erc20balance[token][from] < amount) {
        revert ERC20NotEnoughBalance(from);
        }
        s.erc20totalSupply[token] -= amount;
        s.erc20balance[token][from] -= amount;

        emit ERC20Burned(token, from, amount);
    }  


}


