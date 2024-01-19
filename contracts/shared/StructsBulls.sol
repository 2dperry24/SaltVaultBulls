// SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;



struct RarityProperties {
    uint256 mintCost;
    uint256 multiplier; // Multiplier scaled by 100 to avoid decimals
    uint256 mintCurrentIndex;
    uint256 mintStoppingPoint;
}

///////////////////
//// Bull Info ////
///////////////////
struct Bull {
    uint256 rarity;
    uint256 grains;
    uint256 pillars;
    uint256 sheets;
    uint256 cubes;
    uint256 totalSaltContributions; // Total salt contributions across all vaults
}

