// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import {IERC721} from "../interfaces/IERC721.sol";
import {AppStorage, GemToken} from "../AppStorage.sol";
import "../libraries/LibDiamond.sol";
import {LibDiamond} from "../libraries/LibDiamond.sol";
import {LibSafeERC20} from "../libraries/LibSafeERC20.sol";
import {LibAppStorage} from "../libraries/LibAppStorage.sol";


contract BankFacet {

    AppStorage internal s;


    function getBankRewardsBalance() external view returns(uint256) {
        return s.bankRewardBalance[msg.sender];
    }

    
}



