// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import {IERC721} from "../interfaces/IERC721.sol";
import {AppStorage, GemToken} from "../AppStorage.sol";
import {LibDiamond} from "../libraries/LibDiamond.sol";
import {LibSafeERC20, IERC20} from "../libraries/LibSafeERC20.sol";
import {LibERC721} from "../libraries/LibERC721.sol";
import {LibAppStorage} from "../libraries/LibAppStorage.sol";



import "hardhat/console.sol";


contract DefenseTokensFacet  {

    using LibSafeERC20 for IERC20;

    AppStorage internal s;



    function _walletOfOwnerForDefenseTokens(address _owner) public view returns (uint256[] memory) {
        uint256 ownerTokenCount = s.erc721balances[s.defenseTokensExternalContractAddress][_owner];
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);
        for (uint256 i; i < ownerTokenCount; i++) {
            tokenIds[i] =  s.erc721ownedTokens[s.gemTokensExternalContractAddress][_owner][i];       
        }
        return tokenIds;
    }


    function addShuffledIndexesBatchBattleStones(uint256[] calldata batch) external {

        LibDiamond.enforceIsContractOwner();

        for (uint256 i = 0; i < batch.length; i++) {
            s.shuffledBattleStoneIndices.push(batch[i]);
        }
    }


    function addShuffledIndexesBatchBattleShields(uint256[] calldata batch) external {

        LibDiamond.enforceIsContractOwner();

        for (uint256 i = 0; i < batch.length; i++) {
            s.shuffledBattleShieldIndices.push(batch[i]);
        }
    }



    function addShuffledIndexesBatchLuckTokens(uint256[] calldata batch) external {

        LibDiamond.enforceIsContractOwner();

        for (uint256 i = 0; i < batch.length; i++) {
            s.shuffledLuckTokenIndices.push(batch[i]);
        }
    }




    /**
     * @dev Return the total price for the mint transaction if still available and return 0 if not allowed.
    */
    function getCostAndMintEligibilityBattleStones(uint256 _quanity) external view returns (uint256) {

        if (s.battleStoneCurrentIndex + _quanity  > s.battleStoneTotalSupply) {
            return 0;
        }

        if (!s.erc721mintingLive[msg.sender]) {  
            return 0;
        }

        uint256 transactionCost = s.defenseTokenMintCost * _quanity;
        return transactionCost;
    }




    /**
     * @dev Return the total price for the mint transaction if still available and return 0 if not allowed.
    */
    function getCostAndMintEligibilityBattleShields(uint256 _quanity) external view returns (uint256) {

        if (s.battleShieldCurrentIndex + _quanity  > s.battleShieldTotalSupply) {
            return 0;
        }

        if (!s.erc721mintingLive[msg.sender]) {  
            return 0;
        }

        uint256 transactionCost = s.defenseTokenMintCost * _quanity;
        return transactionCost;
    }




    /**
     * @dev Return the total price for the mint transaction if still available and return 0 if not allowed.
    */
    function getCostAndMintEligibilityLuckTokens(uint256 _quanity) external view returns (uint256) {

        if (s.luckTokenCurrentIndex + _quanity  > s.luckTokenTotalSupply) {
            return 0;
        }

        if (!s.erc721mintingLive[msg.sender]) {  
            return 0;
        }

        uint256 transactionCost = s.defenseTokenMintCost * _quanity;
        return transactionCost;
    }




    function setDefenseTokensContractAddress(address _contract) external {
        s.defenseTokensExternalContractAddress = _contract;
    }




    function getShuffledBattleStonesCount() external view returns (uint256) {
        return s.shuffledBattleStoneIndices.length;
    } 

    function getShuffledBattleShieldsCount() external view returns (uint256) {
        return s.shuffledBattleShieldIndices.length;
    } 

    function getShuffledLuckTokensCount() external view returns (uint256) {
        return s.shuffledLuckTokenIndices.length;
    } 
}
