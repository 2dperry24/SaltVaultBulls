// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import {IERC20} from "../interfaces/IERC20.sol";
import {IERC721} from "../interfaces/IERC721.sol";
import {AppStorage} from "../AppStorage.sol";
import {LibDiamond} from "../libraries/LibDiamond.sol";
import {LibSafeERC20} from "../libraries/LibSafeERC20.sol";
import {LibAppStorage} from "../libraries/LibAppStorage.sol";



contract SaltRepositoryFacet {
    using LibSafeERC20 for IERC20;


    AppStorage internal s;

    event SaltGrainsPurchased(
    uint256 indexed nftTokenId,
    uint256 grains,
    uint256 pillars,
    uint256 sheets,
    uint256 cubes,
    uint256 totalCost
    );





    function getSaltGrainPurchasePrice(
        uint256[4] memory amounts // An array with four elements
    ) public view returns (uint256) {
       
        uint256 totalCost = 0;

        totalCost += amounts[0] * s.grainCost;
        totalCost += amounts[1] * s.pillarCost;
        totalCost += amounts[2] * s.sheetCost;
        totalCost += amounts[3] * s.cubeCost;

        return totalCost;
    }










    function purchaseSaltGrains(
        uint256 nftTokenId,
        uint256[4] memory amounts // An array with four elements
    ) public {

        // Ensure the caller owns the NFT
        if(s.buySaltReentrancyFlag == 1) {revert("Reentrancy flag triggered");}
        
        // change flag
        s.buySaltReentrancyFlag = 1;

        // Ensure the caller owns the NFT
        if(s.erc721owners[s.bullsExternalContractAddress][nftTokenId] != msg.sender) {revert("You do not own this Bull");}

         // Check if the total price for the salt grain purchase is zero
        if(getSaltGrainPurchasePrice(amounts) == 0) {
            revert("Salt count to purchase can't be zero");
        }

        uint256 totalCost;

        // Extract individual amounts from the array
        uint256 _grains = amounts[0];
        uint256 _pillars = amounts[1];
        uint256 _sheets = amounts[2];
        uint256 _cubes = amounts[3];

        totalCost += _grains * s.grainCost;
        totalCost += _pillars * s.pillarCost;
        totalCost += _sheets * s.sheetCost;
        totalCost += _cubes * s.cubeCost;

        //Perform the USDC transfer from the payer to this contract
        IERC20(s.usdcTokenContract).safeTransferFrom(msg.sender, address(this), totalCost);

        // Update the Bull's properties based on the passed parameters
        s.bulls[nftTokenId].grains += _grains;
        s.bulls[nftTokenId].pillars += _pillars;
        s.bulls[nftTokenId].sheets += _sheets;
        s.bulls[nftTokenId].cubes += _cubes;

        // Update contract balances
        s.coreTeamBalance += (totalCost * 10) / 100;
        s.vaultHoldingBalance = (totalCost * 90) / 100;
        s.aum += (totalCost * 90) / 100;

        // Emit the event after the purchase is made
        emit SaltGrainsPurchased(
            nftTokenId,
            _grains,
            _pillars,
            _sheets,
            _cubes,
            totalCost
        );

        // reset flag 
        s.buySaltReentrancyFlag = 0;

    }
}
