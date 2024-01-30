// SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;

/**
 * @dev erc721 diamond facet interface.
 */


interface IGemTokens {

  function setGemTokenContractAddress(address _contract) external;
  
  function getCostAndMintEligibilityOfGemTokens(uint256 _quantity) external view returns (uint256);

  function getAvailableFreeGemTokenMints(address _owner) external view returns (uint256);

  function getShuffledGemTokenCount() external view returns (uint256); 
}


