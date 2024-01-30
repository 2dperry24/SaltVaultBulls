// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import {IERC721} from "../interfaces/IERC721.sol";
import {AppStorage} from "../AppStorage.sol";
import {LibDiamond} from "../libraries/LibDiamond.sol";
import {LibSafeERC20} from "../libraries/LibSafeERC20.sol";
import {LibAppStorage} from "../libraries/LibAppStorage.sol";


contract InfoGetterFacet  {


    AppStorage internal s;


    // global reward total 

    function getGlobalRewardTotal() external view returns (uint256) {
        return s.globalPayoutAmount;
    }


    // Balances

    function getCoreTeamBalance() external view returns (uint256) {
        return s.coreTeamBalance;
    }

    function getVaultHoldingBalance() external view returns (uint256) {
        return s.vaultHoldingBalance;
    }

    function getTotalRewardBalance() external view returns (uint256) {
        return s.totalRewardBalance;
    }

    function getVaultCouncilBalance() external view returns (uint256) {
        return s.vaultCouncilBalance;
    }

    function getGemTokenChallengeBalance() external view returns (uint256) {
        return s.gemTokenChallangeBalance;
    }

    function getGemTokenSalesBalance() external view returns (uint256) {
        return s.gemTokenSalesBalance;
    }

    function getDefenseTokenSalesBalance() external view returns (uint256) {
        return s.defenseTokenSalesBalance;
    }





    function getUsdcContractAddress() external view returns (address) {
        return s.usdcTokenContract;
    }



    function getSaltVaultTokenAddress() external view returns (address) {
        return s.saltVaultTokenContract;
    }


    function getCoreTeamWalletAddress() external view returns (address) {
        return s.coreTeamWallet;
    }


    function getRoyaltiesWalletAddress() external view returns (address) {
        return s.royaltiesWallet;
    }


    function getProcurementWalletAddress() external view returns (address) {
        return s.procurementWallet;
    }


    // IERC2981
    function royaltyInfo(uint256 _tokenId, uint256 _salePrice) external view returns (address, uint256 royaltyAmount) {
        _tokenId; //silence solc warning
        royaltyAmount = (_salePrice * 5) / 100; // 5%
        return (s.royaltiesWallet, royaltyAmount);
    }



}
