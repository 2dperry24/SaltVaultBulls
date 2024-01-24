// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import {IERC721} from "../interfaces/IERC721.sol";
import {AppStorage, Bull, Vault, RarityProperties} from "../AppStorage.sol";
import {LibDiamond} from "../libraries/LibDiamond.sol";
import {LibSafeERC20, IERC20} from "../libraries/LibSafeERC20.sol";
import {LibERC721} from "../libraries/LibERC721.sol";
import {LibAppStorage} from "../libraries/LibAppStorage.sol";


import "hardhat/console.sol";


contract VaultFacet {

    using LibSafeERC20 for IERC20;

    AppStorage internal s;



    event CompoundingRateUpdated(uint256 indexed tokenId, uint256 indexed vaultId, uint256 compoundingRate);

    event VaultRewardPointsCalculated(uint256 indexed vaultIndex, uint256 totalRewardPoints, uint256 coreTeamAmount, uint256 profitAmount);

    event ProfitsDispersedToHolders(uint256 indexed vaultIndex, uint256 startIndex, uint256 endIndex);

    event SaltAllocatedToVault(uint256 indexed tokenId, uint256 indexed vaultIndex, uint256 totalGrains, uint256 saltValue, uint256 grains, uint256 pillars, uint256 sheets, uint256 cubes);

    event FundsWithdrawn(uint256 indexed vaultIndex, address indexed controlWallet, uint256 amount);
    event UnauthorizedAccessAttempt(address indexed sender, uint256 indexed vaultIndex);

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
        bull.totalVaultedSalt += totalGrains;
        
        // Check to see if we need to add this NFT into the Vault Council
        if (bull.totalVaultedSalt >= 5000 && s.vaultCouncilCount < 100 && !s.indexInVaultCouncil[tokenId]) {
            s.vaultCouncil[s.vaultCouncilCount] = tokenId;
            s.vaultCouncilCount++; // Increment the count
            s.indexInVaultCouncil[tokenId] = true; // Mark as added to the Vault Council
        }


        // Logic to know how much USDC this vault is allowed to withdraw from the contract with tax accounted for
        uint256 withdrawableAmount = saltValue * 90 / 100;
        vault.withdrawableAmount += withdrawableAmount;

        // Deduct the amount added from the vaultHoldingBalance
        s.vaultHoldingBalance -= withdrawableAmount;


        // change flag
        s.allocateSaltToVaultReentrancyFlag = 0;


        // Emit the event after the salt has been allocated
        emit SaltAllocatedToVault(tokenId, vaultIndex, totalGrains, saltValue, grains, pillars, sheets, cubes);

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

        if(msg.sender != vault.approvedControlWallet){revert("must be the approved vault wallet");}

        if (vaultIndex > s.vaults.length) { revert("Invalid Vault Number");}

        // Transfer the profit amount into the contract
        IERC20(s.usdcTokenContract).safeTransferFrom(msg.sender, address(this), profitAmount);


        // take 10% for salary updates for coreteam
        uint256 coreTeamAmount = profitAmount * 1 / 10;
        uint256 profitToDistributeAmount = profitAmount - coreTeamAmount;

        // udpate coreteam balance 
        s.coreTeamBalance += coreTeamAmount;

        vault.disperableProfitAmount += profitToDistributeAmount;
        vault.lifetimeRewardAmount += profitToDistributeAmount; 
        s.globalPayoutAmount += profitToDistributeAmount; 

        uint256 totalRewardPoints;
        for (uint256 i = 0; i < s.erc721allTokens[s.bullsExternalContractAddress].length; i++) {

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
        emit VaultRewardPointsCalculated(vaultIndex, totalRewardPoints, coreTeamAmount, profitToDistributeAmount);
    }




    function rewardVaultIndex(uint256 vaultIndex, uint256 startIndex, uint256 endIndex) external {

        Vault storage vault = s.vaults[vaultIndex];

        if(msg.sender != vault.approvedControlWallet){revert("must be the approved vault wallet");}

        bool resetVaultFlag = false; 

        if (endIndex <= startIndex) { revert("start is larger than end");}
        if (endIndex > s.erc721allTokens[s.bullsExternalContractAddress].length) { 
            endIndex = s.erc721allTokens[s.bullsExternalContractAddress].length;
            resetVaultFlag = true;
        }

        if(msg.sender != vault.approvedControlWallet){revert("must be an approved wallet");}

        // Ensure that calculateVaultRewardPoints has been called for this vault
        if (vault.totalRewardPoints == 0) { revert("totalRewardPoints is not set yet");}


        uint256 disperableProfitAmount = vault.disperableProfitAmount;


        // console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
        // console.log("^^^^^^^^^^ disperableProfitAmount: ^^^^^^^^^^^^", disperableProfitAmount); 
        // console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");

        for (uint256 tokenId = startIndex; tokenId <= endIndex; tokenId++) {  
            if (vault.depositedSaltAmount[tokenId] > 0) {
                uint256 nftProfitShare = (vault.disperableProfitAmount * vault.nftRewardPoints[tokenId]) / vault.totalRewardPoints;
                
                // Calculate the amount to compound and the amount to reward
                uint256 compoundingRate = vault.nftVaultCompoundingRate[tokenId];
                uint256 amountToCompound = (nftProfitShare * compoundingRate) / 100;
                uint256 amountToReward = nftProfitShare - amountToCompound;


                // console.log("^^^^^^^^^^ index: ^^^^^^^^^^^^", tokenId);
                // console.log("^^^^^^^^^^ nftRewardPoints: ^^^^^^^^^^^^", vault.nftRewardPoints[tokenId]); 
                // console.log("^^^^^^^^^^ nftProfitShare: ^^^^^^^^^^^^", nftProfitShare); 
                // console.log("^^^^^^^^^^ amountToReward: ^^^^^^^^^^^^", amountToReward);

 
                if (compoundingRate == 100) {

                    // s.continuousMonthsCompounding[vaultIndex][tokenId]++;
                    vault.continuousMonthsCompounding[tokenId]++;

                    if (vault.continuousMonthsCompounding[tokenId] > 4) {
                        vault.bonusEligibleForVaultDeposit[tokenId] = true;
                    }
                }


                // Compounding: Buy salt grains and add to the vault
                if (amountToCompound > 0) {
    
                    uint256 saltGrainsToBuy = amountToCompound / 800000; // 800000 represents the cost of one salt grain, $0.80, in the smallest units
                    uint256 saltGrainsWithBonus = saltGrainsToBuy + _calculateBonusAmount(saltGrainsToBuy);

                    vault.totalSalt += saltGrainsWithBonus;
                    vault.depositedSaltAmount[tokenId] += saltGrainsWithBonus;
                    disperableProfitAmount -= amountToCompound;

                    // add amountToCompound back to the vaults withdrawableAmount 
                    vault.withdrawableAmount += amountToCompound;

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



        // reset the vaults information and store data when targeting the last index via 99999 as the last index
        if (resetVaultFlag){

            // reset and snapshot the totalPoints for this vault
            s.totalVaultRewardPointsForCycle[vaultIndex].push(vault.totalRewardPoints);
            vault.totalRewardPoints = 0;

            // reset and snapshot the deposited Amount that has been dispersed
            s.totalVaultProfitForCycle[vaultIndex].push(vault.disperableProfitAmount);
            vault.disperableProfitAmount = 0;


        }
     

        // Emit the event with the details
        emit ProfitsDispersedToHolders(vaultIndex, startIndex, endIndex);
    }


    function addNewVault(string memory vaultName, address walletAddress, address approvedControlWallet) public  {

        LibDiamond.enforceIsContractOwner();

        // Creates a new Vault directly in storage
        Vault storage newVault = s.vaults.push(); 

        newVault.name = vaultName;
        newVault.walletAddress = walletAddress;
        newVault.approvedControlWallet = approvedControlWallet;

    }


    function getVaultCount() public view returns (uint256){
        return s.vaults.length;
    }


    function checkVaultCompoundingRate(uint256 _rate) public view returns (bool){
        return s.allowedCompoundingRates[_rate];
    }


    function getVaultWithdrawableAmount(uint256 vaultId) public view returns (uint256) {
        return s.vaults[vaultId].withdrawableAmount;
    }


    // Getter for the basic properties of a Vault
    function getVaultInformation(uint256 vaultId) public view returns (string memory, uint256, uint256, uint256, uint256, uint256, address, address) {
        Vault storage vault = s.vaults[vaultId];
        return (
            vault.name,
            vault.totalSalt,
            vault.totalRewardPoints,
            vault.withdrawableAmount,
            vault.disperableProfitAmount,
            vault.lifetimeRewardAmount,
            vault.walletAddress,
            vault.approvedControlWallet
        );
    }

    // Separate getters for each mapping in the Vault
    function getDepositedSaltAmount(uint256 vaultId, uint256 nftId) public view returns (uint256) {
        return s.vaults[vaultId].depositedSaltAmount[nftId];
    }

    function getNftVaultCompoundingRate(uint256 vaultId, uint256 nftId) public view returns (uint256) {
        return s.vaults[vaultId].nftVaultCompoundingRate[nftId];
    }

    function getNftRewardPoints(uint256 vaultId, uint256 nftId) public view returns (uint256) {
        return s.vaults[vaultId].nftRewardPoints[nftId];
    }

    function getContinuousMonthsCompounding(uint256 vaultId, uint256 nftId) public view returns (uint256) {
        return s.vaults[vaultId].continuousMonthsCompounding[nftId];

        // return s.continuousMonthsCompounding[vaultId][nftId];
    }

    function getBonusEligibilityForVaultDeposit(uint256 vaultId, uint256 nftId) public view returns (bool) {
        return s.vaults[vaultId].bonusEligibleForVaultDeposit[nftId];
    }


    // Getter function to retrieve a specific reward point value 
    function getRewardPointsArrayForVault(uint256 vaultIndex) public view returns (uint256[] memory ) {

        return s.totalVaultRewardPointsForCycle[vaultIndex];
    }

    // Optionally, a function to get the total number of reward points recorded for a specific vaultIndex
    function getTotalRewardPointsLength(uint256 vaultIndex) public view returns (uint256) {
        return s.totalVaultRewardPointsForCycle[vaultIndex].length;
    }


    // Getter function to retrieve a specific reward point value 
    function getDepositedProfitArrayForVault(uint256 vaultIndex) public view returns (uint256[] memory ) {

        return s.totalVaultProfitForCycle[vaultIndex];
    }

    // Optionally, a function to get the total number of reward points recorded for a specific vaultIndex
    function getDepositedProfitArrayLength(uint256 vaultIndex) public view returns (uint256) {
        return s.totalVaultProfitForCycle[vaultIndex].length;
    }

    


    function setVaultCompoundingRate(uint256 vaultId, uint256 tokenId, uint256 compoundingRate) external {
      
         // Ensure the caller owns the NFT
        if(s.erc721owners[s.bullsExternalContractAddress][tokenId] != msg.sender) {revert("You do not own this Bull");}
      
        // Check if the provided rate is allowed
        if (!s.allowedCompoundingRates[compoundingRate]) { revert("Must be an allowed compounding Rate");}

        // Update the NFT's compounding rate in the vault
        s.vaults[vaultId].nftVaultCompoundingRate[tokenId] = compoundingRate;

        // Emit an event (optional, but good practice)
        emit CompoundingRateUpdated(tokenId, vaultId, compoundingRate);
    }



    function withdrawVaultFunds(uint256 vaultIndex) external {

        Vault storage vault = s.vaults[vaultIndex];

        if(msg.sender != vault.approvedControlWallet){
            emit UnauthorizedAccessAttempt(msg.sender, vaultIndex);
            revert("must be the approved Control Wallet for this vault");
        }

        uint256 balanceToWithdraw = s.vaults[vaultIndex].withdrawableAmount;
    
        IERC20(s.usdcTokenContract).safeTransfer(vault.approvedControlWallet, balanceToWithdraw);

        // Emit an event after successful withdrawal
        emit FundsWithdrawn(vaultIndex, vault.approvedControlWallet, balanceToWithdraw);

        // reset the vaults withdrawableAmount 
        s.vaults[vaultIndex].withdrawableAmount = 0; 
    }


}
