// SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;

/**
 * @dev erc721 diamond facet interface.
 */

interface IBulls {

  function getCostAndMintEligibilityOfBulls(uint256 _rarity) external view returns (uint256);

  function setBullsContractAddress(address _contract) external;

  function getAvailableFreeGemTokenMints(address _owner) external view returns (uint256);

}


