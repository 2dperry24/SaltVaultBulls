// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import {IERC721} from "../interfaces/IERC721.sol";
import {AppStorage, GemToken} from "../AppStorage.sol";
import {LibDiamond} from "../libraries/LibDiamond.sol";
import {LibSafeERC20, IERC20} from "../libraries/LibSafeERC20.sol";
import {LibERC721} from "../libraries/LibERC721.sol";
import {LibAppStorage} from "../libraries/LibAppStorage.sol";



import "hardhat/console.sol";


contract GemTokensFacet  {

    using LibSafeERC20 for IERC20;

    AppStorage internal s;


    event RewardsDeposited(address indexed depositor, uint256 amount);



    ////////////////////////////////////???/////////////////////
    /////////////////////// Game Info ////////?/////////////////
    ///////////////////////////////////////???//////////////////


    

    function getCurrentGameDetails() public view returns (uint256, string memory, uint256, bool, bool, uint256[] memory, uint256 ) {
        return( s.gemTokenWinningValue, s.gemTokenePrimaryColor, s.gemTokeneNumberOfWinningSpots, s.isGemTokenGameOpen, s.isGemTokenGameStillActive, s.gemTokenPayoutPerPosition, s.gemTokenGameStartDate );
    }


    function getCurrentGemTokenRewardBalance() public view returns (uint256 ) {
        return s.gemTokenChallangeBalance;
    }



    function _walletOfOwnerForGemTokens(address _owner) public view returns (uint256[] memory) {
        uint256 ownerTokenCount = s.erc721balances[s.gemTokensExternalContractAddress][_owner];
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);
        for (uint256 i; i < ownerTokenCount; i++) {
            tokenIds[i] =  s.erc721ownedTokens[s.gemTokensExternalContractAddress][_owner][i];       
        }
        return tokenIds;
    }

    function getGtcWinners() public view returns (address[] memory) {
        return s.gemTokenChallengeWinners;
    }


    // Function for participants to check their token score
    function checkTokenScoreForWallet() public view returns (uint256 primaryColorPoints, uint256 pointsAllColors) {
        uint256[] memory tokenIndexes = _walletOfOwnerForGemTokens(msg.sender);
        bool isWithinPrimaryColorWindow = (block.timestamp - s.gemTokenGameStartDate) <= (s.gemTokenPrimaryColorWindow * 1 days);

        if (isWithinPrimaryColorWindow) {
            for (uint256 i = 0; i < tokenIndexes.length; i++) {
            (,uint256 value, string memory color) = getGemToken(tokenIndexes[i]);
                if (keccak256(abi.encodePacked(color)) == keccak256(abi.encodePacked(s.gemTokenePrimaryColor))) {
                    primaryColorPoints += value;
                }
            }
        }

        pointsAllColors = _sumAllTokenValues(_walletOfOwnerForGemTokens(msg.sender));

        return (primaryColorPoints, pointsAllColors);
    }

    // Function for participants to check if they have won
    function checkIfWinner() public view returns (bool) {
        uint256 totalPointsFromWallet = 0;
        uint256[] memory tokenIndexes = _walletOfOwnerForGemTokens(msg.sender);
        bool isWithinPrimaryColorWindow = (block.timestamp - s.gemTokenGameStartDate) <= (s.gemTokenPrimaryColorWindow * 1 days);


        bool hasExactValue;
        
        
        if (isWithinPrimaryColorWindow) {
            for (uint256 i = 0; i < tokenIndexes.length; i++) {
            (,uint256 value, string memory color) = getGemToken(tokenIndexes[i]);
                if (keccak256(abi.encodePacked(color)) == keccak256(abi.encodePacked(s.gemTokenePrimaryColor))) {
                    totalPointsFromWallet += value;
                }
            }

            hasExactValue = totalPointsFromWallet == s.gemTokenWinningValue && totalPointsFromWallet == _sumAllTokenValues( _walletOfOwnerForGemTokens(msg.sender));

        } else {
            hasExactValue =  s.gemTokenWinningValue == _sumAllTokenValues( _walletOfOwnerForGemTokens(msg.sender));
        }
        
        return hasExactValue && s.isGemTokenGameOpen;
    }




    // Helper function to sum all token values in a wallet
    function _sumAllTokenValues(uint256[] memory tokenIndexes) internal view returns (uint256) {
        uint256 totalValue = 0;
        for (uint256 i = 0; i < tokenIndexes.length; i++) {
            (,uint256 value, ) = getGemToken(tokenIndexes[i]);
            totalValue += value;
        }
        return totalValue;
    }









    // Function for participants to win the game
    function burnAndClaimSpot() public {
        
        // Ensure the game is still open
        require(s.isGemTokenGameOpen, "Game is closed");

        // check for Reentrancy attack
        if(s.burnAndClaimSpotForGemTokenChallengeFlag == 1) {revert("Reentrancy flag triggered");}

        // change flag
        s.burnAndClaimSpotForGemTokenChallengeFlag = 1;



        if (checkIfWinner()) {

            // Ensure the contract is approved to transfer the token
            require(s.erc721operatorApprovals[s.gemTokensExternalContractAddress][msg.sender][address(this)], "Contract not approved to transfer tokens");

            uint256 totalPointsFromWallet = 0;
            uint256[] memory tokenIndexes = _walletOfOwnerForGemTokens(msg.sender);
            bool isWithinPrimaryColorWindow = (block.timestamp - s.gemTokenGameStartDate) <= (s.gemTokenPrimaryColorWindow * 1 days);
  
            for (uint256 i = 0; i < tokenIndexes.length; i++) {
                (, uint256 value, string memory color) = getGemToken(tokenIndexes[i]);

                if (isWithinPrimaryColorWindow) {
                    if (keccak256(abi.encodePacked(color)) == keccak256(abi.encodePacked(s.gemTokenePrimaryColor))) {
                        totalPointsFromWallet += value;
                    }
                } else {
                    // Sum values for all colors
                    totalPointsFromWallet += value;
                }
            }

            require(totalPointsFromWallet == s.gemTokenWinningValue, "Not a winning wallet"); 

            for (uint i = 0; i < tokenIndexes.length; i++) {

                LibERC721.transferFromFacet(s.gemTokensExternalContractAddress, msg.sender, s.gemTokenBurnWallet, tokenIndexes[i]);

            }
            
            // Check if the game should be closed
            if (s.gemTokenChallengeWinners.length < s.gemTokeneNumberOfWinningSpots) {
                s.gemTokenChallengeWinners.push(msg.sender); // Record the winner
            }

            if (s.gemTokenChallengeWinners.length == s.gemTokeneNumberOfWinningSpots){
                s.isGemTokenGameOpen = false; // Close the game
                _rewardGameWinners(); // Payout winners 
                
            }

            // emit WinnerDeclared(msg.sender, totalPointsFromWallet);
        }

         // change flag
        s.burnAndClaimSpotForGemTokenChallengeFlag = 0;
       
    }





    // Function to retrieve details of all tokens in a wallet
    function getWalletTokenValues() public view returns (GemToken[] memory) {
        uint256[] memory tokenIndexes = _walletOfOwnerForGemTokens(msg.sender);
        GemToken[] memory tokensDetails = new GemToken[](tokenIndexes.length);

        for (uint256 i = 0; i < tokenIndexes.length; i++) {
            (uint256 index, uint256 value, string memory color) = getGemToken(tokenIndexes[i]);
            tokensDetails[i] = GemToken(index, value, color);
        }

        return tokensDetails;
    }




    // Steps to reward
    // 1. Deposit SVT into contract via depositRewardsForGame()
    // 2. setGameParameters, 


    function depositRewardsForGame(uint256 _amount) public {

        require(s.authorizedAdminForGemTokenFacet[msg.sender], "Not an approved wallet");
        require(s.saltVaultTokenContract != address(0), "Must set $SVT contract address");

        // Transfer the profit amount into the contract
        IERC20(s.saltVaultTokenContract).safeTransferFrom(msg.sender, address(this), _amount);

        s.gemTokenChallangeBalance += _amount;

        // Emit the event
        emit RewardsDeposited(msg.sender, _amount);

    }



     // Function to set the game parameters and start the game
    function setGameParameters(uint256 _winningValue, string memory _primaryColor, uint256 _numberOfWinningSpots, uint256[] memory _payoutDistribution) public {

        require(s.authorizedAdminForGemTokenFacet[msg.sender], "Not an approved wallet");

        require(s.gemTokenValidColors[_primaryColor], "Invalid Color");
        require(s.gemTokenChallangeBalance > 0, "Must deposit SVT into contract first");
        require(s.gemTokeneNumberOfWinningSpots == s.gemTokenPayoutPerPosition.length, "payout structure must match");
        require(!s.isGemTokenGameStillActive, "Game is still active");

        uint256 distributionTotal = 0;

        // Sum up the elements of the array
        for (uint i = 0; i < _payoutDistribution.length; i++) {
            distributionTotal += _payoutDistribution[i];
        }

        // Require that the total sum is exactly 100
        require(distributionTotal == 100, "Total payout distribution must equal 100");

        s.isGemTokenGameStillActive = true;
        s.gemTokenPayoutPerPosition = _payoutDistribution;
        s.gemTokenWinningValue = _winningValue;
        s.gemTokenePrimaryColor = _primaryColor;
        s.gemTokeneNumberOfWinningSpots = _numberOfWinningSpots;
        s.gemTokenGameStartDate = block.timestamp;
        delete s.gemTokenChallengeWinners; // Reset winners for the new game period
        s.isGemTokenGameOpen = true; // Open the game
    }










    function _rewardGameWinners() internal {
        
        require(!s.isGemTokenGameOpen,"Game is still open");
        require(s.isGemTokenGameStillActive,"Game must still be active");

        uint256 totalRewardBalanceToStart = s.gemTokenChallangeBalance;
        uint256 rewardsLeftToDistribute = totalRewardBalanceToStart;

        for (uint i = 0; i < s.gemTokeneNumberOfWinningSpots; i++) {
            // uint256 payout = totalRewardBalanceToStart * (s.gemTokenPayoutPerPosition[i] / 100);
            uint256 payout = (totalRewardBalanceToStart * s.gemTokenPayoutPerPosition[i]) / 100;


            //deposit rewards into the bank for this address
            s.bankRewardBalance[s.gemTokenChallengeWinners[i]] += payout;
  
            // deduct this amount from totalRewardBalance
            rewardsLeftToDistribute -= payout;
  
        }

    
        // handle any dust left over
        if (rewardsLeftToDistribute > 0){
             s.bankRewardBalance[s.coreTeamWallet] += rewardsLeftToDistribute;
        }
       
        // set the game to inactive, serves to only allow this function to be called once.
        s.isGemTokenGameStillActive = false;

        // reset 
        s.gemTokenChallangeBalance = 0;

    }











    function addShuffledIndexesBatch(uint256[] calldata batch) external  {

        LibDiamond.enforceIsContractOwner();

        for (uint256 i = 0; i < batch.length; i++) {
            s.shuffledGemTokenIndices.push(batch[i]);
        }
    }



    // Function to bulk populate tokens for a single color in batches
    function bulkPopulateTokens(uint256 start, uint256 end, uint256 value, string memory color) external {
        LibDiamond.enforceIsContractOwner();

        require(start <= end, "Invalid range");
        require(s.gemTokenValidColors[color], "Invalid Color");

        for (uint256 j = start; j <= end && j <= s.gemTokenTotalSupply; j++) {
            s.gemTokens[j] = GemToken(j, value, color);
        }
    }


    // Function to retrieve details of a gem token
    function getGemToken(uint256 tokenIndex) public view returns (uint256, uint256, string memory) {
        GemToken memory token = s.gemTokens[tokenIndex];
        return (token.index, token.value, token.color);
    }



    function getAvailableFreeGemTokenMints(address _owner) public view returns (uint256) {
        return s.gemTokenMintCredits[_owner];
    }




    /**
     * @dev Return the total price for the mint transaction if still available and return 0 if not allowed.
    */
    function getCostAndMintEligibilityOfGemTokens(uint256 _quanity) external view returns (uint256) {

        if (s.gemTokenCurrentIndex + _quanity  > s.gemTokenTotalSupply) {
            return 0;
        }

        if (!s.erc721mintingLive[msg.sender]) {
            return 0;
        }

        uint256 transactionCost = s.gemTokenMintCost * _quanity;
        return transactionCost;
    }


   function setGemTokenContractAddress(address _contract) external {
        s.gemTokensExternalContractAddress = _contract;
    }


}
