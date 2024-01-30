// SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;

/**
 * @dev erc721 diamond facet interface.
 */


interface IDefenseTokens {

  function setDefenseTokensContractAddress(address _contract) external;

  
  function getCostAndMintEligibilityBattleStones(uint256 _quantity) external view returns (uint256);

  
  function getCostAndMintEligibilityBattleShields(uint256 _quantity) external view returns (uint256);

  
  function getCostAndMintEligibilityLuckTokens(uint256 _quantity) external view returns (uint256);


  function getShuffledBattleStonesCount() external view returns (uint256); 
  function getShuffledBattleShieldsCount() external view returns (uint256); 
  function getShuffledLuckTokensCount() external view returns (uint256); 


}

