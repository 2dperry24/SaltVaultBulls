// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import {IERC721} from "../interfaces/IERC721.sol";
import {AppStorage, Bull, Vault, RarityProperties} from "../AppStorage.sol";
import {LibDiamond} from "../libraries/LibDiamond.sol";
import {LibSafeERC20, IERC20} from "../libraries/LibSafeERC20.sol";
import {LibERC721} from "../libraries/LibERC721.sol";
import {LibAppStorage} from "../libraries/LibAppStorage.sol";


contract VaultFacet {

    using LibSafeERC20 for IERC20;

    AppStorage internal s;



    event CompoundingRateUpdated(uint256 indexed tokenId, uint256 indexed vaultId, uint256 compoundingRate);

    event VaultRewardPointsCalculated(uint256 indexed vaultIndex, uint256 totalRewardPoints, uint256 profitAmount);

    event ProfitsDepositedToVault(uint256 indexed vaultIndex, uint256 startIndex, uint256 endIndex);

    // Send Salt to Vaults 
    function allocateSaltToVault(uint256 tokenId, uint256 vaultIndex, uint256 grains, uint256 pillars, uint256 sheets, uint256 cubes) public  {

        if(s.allocateSaltToVaultReentrancyFlag == 1) {revert("Reentrancy flag triggered");}
        
        // change flag
        s.allocateSaltToVaultReentrancyFlag = 1;

        // Ensure the caller owns the NFT
        if(s.erc721owners[s.bullsExternalContractAddress][tokenId] != msg.sender) {revert("You do not own this Bull");}
      
        // Access the Bull
        Bull storage bull = s.bulls[tokenId];

        // Access the Bull's balances
        if (bull.grains < grains && bull.pillars < pillars && bull.sheets < sheets && bull.cubes < cubes) { revert("Not enough salt in the bulls salt wallet");}

        // Deduct the salt grains from the NFT
        bull.grains -= grains;
        bull.pillars -= pillars;
        bull.sheets -= sheets;
        bull.cubes -= cubes;
    
        uint256 totalGrains;
        uint256 saltValue;

        // Combined calculation for total grains and their USDC value
        saltValue += (grains * s.grainCost);
        totalGrains += (grains * s.grainCount);

        saltValue += (pillars * s.pillarCost);
        totalGrains += (pillars * s.pillarCount);

        saltValue += (sheets * s.sheetCost);
        totalGrains += (sheets * s.sheetCount);

        saltValue += (cubes * s.cubeCost);
        totalGrains += (cubes * s.cubeCount);


        uint256 bonusGrains = _calculateBonusAmount(totalGrains); 
        totalGrains +=  bonusGrains;


        // Access the specified vault and update its total salt
        Vault storage vault = s.vaults[vaultIndex];
        vault.totalSalt += totalGrains;


        // Give a 10% bonus for 4+ months compounding
        if (vault.bonusEligibleForVaultDeposit[tokenId]) {
            uint256 compoundingBonusGrains = totalGrains * 10 / 100;
            totalGrains += compoundingBonusGrains;

            // Reset compounding history
            vault.continuousMonthsCompounding[tokenId] = 0;
            vault.bonusEligibleForVaultDeposit[tokenId] = false;
        }

        // Record the contribution of this NFT to the vault
        vault.depositedSaltAmount[tokenId] += totalGrains;

        // Add totalGrains into totalSalt allocated to vaults for the Bull
        bull.totalSaltContributions += totalGrains;
        
        // Check to see if we need to add this NFT into the Vault Council
        if (bull.totalSaltContributions >= 5000 && s.vaultCouncilCount < 100 && !s.indexInVaultCouncil[tokenId]) {
            s.vaultCouncil[s.vaultCouncilCount] = tokenId;
            s.vaultCouncilCount++; // Increment the count
            s.indexInVaultCouncil[tokenId] = true; // Mark as added to the Vault Council
        }

        // Update the vault salt count for this NFT
        vault.depositedSaltAmount[tokenId]+= totalGrains;
   
        // Logic to know how much USDC this vault is allowed to withdraw from the contract with tax accounted for
        vault.withdrawableAmount += saltValue * 90 / 100;

        // change flag
        s.allocateSaltToVaultReentrancyFlag = 0;
    }




    function _calculateBonusAmount(uint256 amount) internal view returns (uint256) {
        if (s.aum <= s.bonusDetails.bonusCapStage1) {
            return (amount * s.bonusDetails.stage1Bonus) / 100; 
        } else if (s.aum <= s.bonusDetails.bonusCapStage2) {
            return (amount * s.bonusDetails.stage2Bonus) / 100;
        } else if (s.aum <= s.bonusDetails.bonusCapStage3) {
            return (amount * s.bonusDetails.stage3Bonus) / 100;
        } else if (s.aum <= s.bonusDetails.bonusCapStage4) {
            return (amount * s.bonusDetails.stage4Bonus) / 100;
        } else if (s.aum <= s.bonusDetails.bonusCapStage5) {
            return (amount * s.bonusDetails.stage5Bonus) / 100;
        } else {
            return 0; // No bonus for post $1,000,000
        }
    }


    function depositProfitsAndcalculateVaultRewardPoints(uint256 vaultIndex, uint256 profitAmount) public {

        Vault storage vault = s.vaults[vaultIndex];

        if(msg.sender != vault.approvedControlWallet){revert("must be an approved wallet");}

        if (vaultIndex > s.vaults.length) { revert("Invalid Vault Number");}

        // Transfer the profit amount into the contract
        IERC20(s.usdcTokenContract).safeTransferFrom(msg.sender, address(this), profitAmount);

        vault.disperableProfitAmount += profitAmount;
        vault.lifetimeRewardAmount += profitAmount; 
        s.globalPayoutAmount += profitAmount; 

        uint256 totalRewardPoints;
        for (uint256 i = 1; i <= s.erc721allTokens[s.bullsExternalContractAddress].length; i++) {
            
            uint256 tokenId = s.erc721allTokens[s.bullsExternalContractAddress][i];
            Bull storage bull = s.bulls[tokenId]; 
            uint256 nftSaltCount = vault.depositedSaltAmount[tokenId];
            if (nftSaltCount > 0) {
                uint256 nftPoints = nftSaltCount * s.rarityProperties[bull.rarity].rewardMultiplier;
                vault.nftRewardPoints[tokenId] = nftPoints;
                totalRewardPoints += nftPoints;
            }
        }

        vault.totalRewardPoints = totalRewardPoints;

        // Emit the event with the profit amount
        emit VaultRewardPointsCalculated(vaultIndex, totalRewardPoints, profitAmount);
    }



    function rewardVaultIndex(uint256 vaultIndex, uint256 startIndex, uint256 endIndex) public {

        Vault storage vault = s.vaults[vaultIndex];

        if(msg.sender != vault.approvedControlWallet){revert("must be an approved wallet");}


        if (endIndex <= startIndex) { revert("start is larger than end");}
        if (endIndex > s.erc721allTokens[s.bullsExternalContractAddress].length) { 
            endIndex = s.erc721allTokens[s.bullsExternalContractAddress].length;
        }

        if(msg.sender != vault.approvedControlWallet){revert("must be an approved wallet");}

        // Ensure that calculateVaultRewardPoints has been called for this vault
        if (vault.totalRewardPoints == 0) { revert("totalRewardPoints is not set yet");}


        uint256 disperableProfitAmount = vault.disperableProfitAmount; 

        for (uint256 tokenId = startIndex; tokenId <= endIndex; tokenId++) {  
            if (vault.depositedSaltAmount[tokenId] > 0) {
                uint256 nftProfitShare = (vault.disperableProfitAmount * vault.nftRewardPoints[tokenId]) / vault.totalRewardPoints;
                
                // Calculate the amount to compound and the amount to reward
                uint256 compoundingRate = vault.nftVaultCompoundingRate[tokenId];
                uint256 amountToCompound = (nftProfitShare * compoundingRate) / 100;
                uint256 amountToReward = nftProfitShare - amountToCompound;

                if (compoundingRate == 100) {
                    vault.continuousMonthsCompounding[tokenId]++;
                    if (vault.continuousMonthsCompounding[tokenId] > 4) {
                        vault.bonusEligibleForVaultDeposit[tokenId] = true;
                    }
                }

                // Compounding: Buy salt grains and add to the vault
                if (amountToCompound > 0) {
                    uint256 saltGrainsToBuy = amountToCompound / (80 * 10 ** 6); // Assuming price per grain
                    uint256 saltGrainsWithBonus = saltGrainsToBuy + _calculateBonusAmount(saltGrainsToBuy);
                    vault.totalSalt += saltGrainsWithBonus;
                    vault.depositedSaltAmount[tokenId] += saltGrainsWithBonus;
                    disperableProfitAmount -= amountToCompound;
                }

                // Reward: Credit the owner's balance
                if (amountToReward > 0) {
                    s.bankRewardBalance[s.erc721owners[s.bullsExternalContractAddress][tokenId]] += amountToReward;
                    disperableProfitAmount -= amountToReward;
                    s.totalRewardBalance += amountToReward;
                }
            }
        }

        
        // Handle any residual 'dust' amount
        if (disperableProfitAmount > 0) {
            s.coreTeamBalance += disperableProfitAmount;
            s.totalRewardBalance += disperableProfitAmount;
        }


        // After distributing profits, reset the nftRewardPoints for the vault
        for (uint256 tokenId = 1; tokenId <= s.erc721allTokens[s.bullsExternalContractAddress].length; tokenId++) {
            if (vault.depositedSaltAmount[tokenId] > 0) {
                vault.nftRewardPoints[tokenId] = 0;
            }
        }

        // Final reset of dispersible profits for this vault
        vault.disperableProfitAmount = 0;

        // Emit the event with the details
        emit ProfitsDepositedToVault(vaultIndex, startIndex, endIndex);
    }


    function addNewVault(string memory vaultName, address walletAddress, address approvedControlWallet) public  {

        LibDiamond.enforceIsContractOwner();

        // Creates a new Vault directly in storage
        Vault storage newVault = s.vaults.push(); 

        newVault.name = vaultName;
        newVault.walletAddress = walletAddress;
        newVault.approvedControlWallet = approvedControlWallet;

    }


    function setCompoundingRate(uint256 tokenId, uint256 vaultId, uint256 compoundingRate) external {

        // Ensure the caller owns the NFT
        if(s.erc721owners[s.bullsExternalContractAddress][tokenId] != msg.sender) {revert("You do not own this Bull");}
    
        // Check if the provided rate is allowed
        if (s.allowedCompoundingRates[compoundingRate] ) { revert("Must be an approved Compounding Rate, e.g Divisible by 10");}

        // Fetch the Vault struct for the given vaultId
        Vault storage vault = s.vaults[vaultId];

        // Update the NFT's compounding rate in the vault
        vault.nftVaultCompoundingRate[tokenId] = compoundingRate;

        // Emit an event (optional, but good practice)
        emit CompoundingRateUpdated(tokenId, vaultId, compoundingRate);
    }


    function getCompoundingRateForIndex(uint256 tokenId, uint256 vaultId) public view returns (uint256) {
        Vault storage vault = s.vaults[vaultId];
        return vault.nftVaultCompoundingRate[tokenId];
    }


    function getDepositedSaltForIndex(uint256 tokenId, uint256 vaultId) public view returns (uint256) {
        Vault storage vault = s.vaults[vaultId];
        return vault.depositedSaltAmount[tokenId];
    }


    function getContinousMonthsCompoundingForIndex(uint256 tokenId, uint256 vaultId) public view returns (uint256) {
        Vault storage vault = s.vaults[vaultId];
        return vault.continuousMonthsCompounding[tokenId];
    }

    function getIsIndexEligibleForBonusDuringSaltDeposit(uint256 tokenId, uint256 vaultId) public view returns (bool) {
        Vault storage vault = s.vaults[vaultId];
        return vault.bonusEligibleForVaultDeposit[tokenId];
    }





}