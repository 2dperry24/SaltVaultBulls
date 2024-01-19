// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import {IERC721} from "../interfaces/IERC721.sol";
import {AppStorage, Bull, Vault, RarityProperties} from "../AppStorage.sol";
import {LibDiamond} from "../libraries/LibDiamond.sol";
import {LibSafeERC20, IERC20} from "../libraries/LibSafeERC20.sol";
import {LibERC721} from "../libraries/LibERC721.sol";
import {LibAppStorage} from "../libraries/LibAppStorage.sol";


contract VaultCouncilFacet {

    using LibSafeERC20 for IERC20;

    AppStorage internal s;



    function depositRewardsForVaultCouncil(uint256 profitAmount) public {

        
        // Transfer the profit amount into the contract
        IERC20(s.usdcTokenContract).safeTransferFrom(msg.sender, address(this), profitAmount);

        s.vaultCouncilBalance += profitAmount;
        s.globalPayoutAmount += profitAmount; 

    }



    function distributeProfitsToCouncil(uint256 amount) public {

        LibDiamond.enforceIsContractOwner();
     
        uint256 profitPerNFT = amount / s.vaultCouncil.length;

        for (uint i = 0; i < s.vaultCouncil.length; i++) {
            uint256 tokenId = s.vaultCouncil[i];
            address nftOwner = s.erc721owners[s.bullsExternalContractAddress][tokenId];
            
            // Update the reward balance for each NFT owner
            s.bankRewardBalance[nftOwner] += profitPerNFT;
            amount -= profitPerNFT;
        }


        // Handle any residual 'dust' amount
        if (amount > 0) {
            s.coreTeamBalance += amount;
            s.globalPayoutAmount += amount;
        }
        // Reset award amount for the Council 
        s.vaultCouncilBalance = 0; 
    }

}
