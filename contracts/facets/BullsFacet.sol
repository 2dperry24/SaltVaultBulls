// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import {IERC721} from "../interfaces/IERC721.sol";
import {AppStorage, GemToken} from "../AppStorage.sol";
import {LibDiamond} from "../libraries/LibDiamond.sol";
import {LibSafeERC20, IERC20} from "../libraries/LibSafeERC20.sol";
import {LibERC721} from "../libraries/LibERC721.sol";
import {LibAppStorage} from "../libraries/LibAppStorage.sol";



import "hardhat/console.sol";


contract BullsFacet  {

    using LibSafeERC20 for IERC20;

    AppStorage internal s;


    /**
     * @dev Return the total price for the mint transaction if still available and return 0 if not allowed.
    */
    function getCostAndMintEligibilityOfBulls(uint256 _rarity) external view returns (uint256) {

        if (s.rarityProperties[_rarity].currentIndex > s.rarityProperties[_rarity].lastIndex) {
            return 0;
        }

        if (!s.erc721mintingLive[msg.sender]) {
            return 0;
        }

        uint256 transactionCost = s.rarityProperties[_rarity].mintCost;
        return transactionCost;
    }


    function setBullsContractAddress(address _contract) external {
        s.bullsExternalContractAddress = _contract;
    }





    function getRarityInformationForBullType(uint256 rarity) external view returns (uint256, uint256, uint256, uint256) {
        return (s.rarityProperties[rarity].mintCost, s.rarityProperties[rarity].rewardMultiplier, s.rarityProperties[rarity].currentIndex, s.rarityProperties[rarity].lastIndex );
    }



    function getBullInformation(uint256 _index) external view returns (uint256, uint256, uint256, uint256, uint256,uint256) {
        return (s.bulls[_index].rarity, s.bulls[_index].grains, s.bulls[_index].pillars, s.bulls[_index].sheets, s.bulls[_index].cubes, s.bulls[_index].totalVaultedSalt );
    }




    function getBullsMintCost(uint256 rarity) external view returns (uint256) {
        return s.rarityProperties[rarity].mintCost;
    }


}
