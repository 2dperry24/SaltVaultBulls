// SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;

/**
 * @dev erc721 diamond facet interface.
 */


import "../libraries/LibSharedStruct.sol";

interface IERC721Facet {

  /**
   * @dev Deploy new token.
   * 
   */
  function erc721setCollection(string memory name, string memory symbol, string memory baseURI, string memory baseExtension) external;

  /**
   * @dev Returns the name of the token.
   */
  function erc721name() external view returns (string memory);

  /**
   * @dev Returns the symbol of the token.
   */
  function erc721symbol() external view returns (string memory);


  // /**
  //  * @dev Mints a new bull NFT on the ERC721Facet.
  //  * 
  //  */
  // function mintBull(uint256 rarity, address minter) external;


  /**
   * @dev Get the total supply.
   */
  function erc721totalSupply() external view returns (uint256);

  /**
   * @dev Get the total supply.
   */
  function erc721ownerOf(uint256 tokenId) external view returns (address);

  /**
   * @dev Get the balance of the given wallet.
   *
   * @param account The account address.
   */
  function erc721balanceOf(address account) external view returns (uint256);

 
  /**
   * @dev Safely transfers `tokenId` token from `from` to `to`.
   *
   * Requirements:
   *
   * - `from` cannot be the zero address.
   * - `to` cannot be the zero address.
   * - `tokenId` token must exist and be owned by `from`.
   * - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.
   * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
   *
   * Emits a {Transfer} event.
   */
  function erc721safeTransferFrom(address auth, address from, address to, uint256 tokenId, bytes calldata data) external;

  /**
   * @dev Safely transfers `tokenId` token from `from` to `to`, checking first that contract recipients
   * are aware of the ERC721 protocol to prevent tokens from being forever locked.
   *
   * Requirements:
   *
   * - `from` cannot be the zero address.
   * - `to` cannot be the zero address.
   * - `tokenId` token must exist and be owned by `from`.
   * - If the caller is not `from`, it must have been allowed to move this token by either {approve} or {setApprovalForAll}.
   * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
   *
   * Emits a {Transfer} event.
   */
  function erc721safeTransferFrom(address auth, address from, address to, uint256 tokenId) external;

  /**
   * @dev Transfers `tokenId` token from `from` to `to`.
   *
   * WARNING: Note that the caller is responsible to confirm that the recipient is capable of receiving ERC721
   * or else they may be permanently lost. Usage of {safeTransferFrom} prevents loss, though the caller must
   * understand this adds an external call which potentially creates a reentrancy vulnerability.
   *
   * Requirements:
   *
   * - `from` cannot be the zero address.
   * - `to` cannot be the zero address.
   * - `tokenId` token must be owned by `from`.
   * - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.
   *
   * Emits a {Transfer} event.
   */

  function erc721transferFrom(address auth, address from, address to, uint256 tokenId) external;


  /**
   * @dev Gives permission to `to` to transfer `tokenId` token to another account.
   * The approval is cleared when the token is transferred.
   *
   * Only a single account can be approved at a time, so approving the zero address clears previous approvals.
   *
   * Requirements:
   *
   * - The caller must own the token or be an approved operator.
   * - `tokenId` must exist.
   *
   * Emits an {Approval} event.
   */
  function erc721approve(address auth, address to, uint256 tokenId) external;

  /**
   * @dev Approve or remove `operator` as an operator for the caller.
   * Operators can call {transferFrom} or {safeTransferFrom} for any token owned by the caller.
   *
   * Requirements:
   *
   * - The `operator` cannot be the caller.
   *
   * Emits an {ApprovalForAll} event.
   */
  function erc721setApprovalForAll(address owner, address operator, bool approved) external;
  
  /**
   * @dev Returns the account approved for `tokenId` token.
   *
   * Requirements:
   *
   * - `tokenId` must exist.
   */
  function erc721getApproved(uint256 tokenId) external view returns (address operator);

  /**
   * @dev Returns if the `operator` is allowed to manage all of the assets of `owner`.
   *
   * See {setApprovalForAll}
   */
  function erc721isApprovedForAll(address owner, address operator) external view returns (bool);



  // function erc721getApprovalHistory(address auth, uint256 tokenId) external view returns (LibSharedStructs.ApprovalRecord[] memory);


  function mintBull(uint256 rarity, address minter) external;

  function getCostAndMintEligibilityOfBulls(uint256 _rarity) external view returns (uint256);

  function erc721baseURI() external view returns (string memory);
  function erc721baseExtension() external view returns (string memory);
  function erc721tokenURI(uint256 tokenId) external view  returns (string memory);

  function erc721walletOfOwner(address _owner) external view returns (uint256[] memory);
  function erc721tokenOfOwnerByIndex(address _owner, uint256 _index) external view returns (uint256); 

  function isExternalContractApprovedForERC721Minting() external view returns (bool);
  function erc721mintingLive() external view returns (bool);
  function erc721setMintingLive(bool _bool) external; 

  function erc721getApprovalHistory(address owner) external view returns (LibSharedStructs.IndividualApprovalRecord[] memory individualApprovals, LibSharedStructs.OperatorApprovalRecord[] memory operatorApprovals); 

  function erc721setBaseUri(string memory _newBaseURI) external;

  function erc721setBullsContractAddress(address _contract) external;

  function erc721setGemTokenContractAddress(address _contract) external;

  function getCostAndMintEligibilityOfGemTokens(uint256 _quantity) external view returns (uint256);

  function erc721getWalletsForExternalContract() external view returns (address, address, address);

  function erc721getAvailableFreeGemTokenMints(address _owner) external view returns (uint256);

  function erc721mintGemTokens(address _addressToMintTo, uint256 _numberOfCreditsToUse, uint256 _totalMintCost) external;

  
  function erc721mintBattleStones(address _addressToMintTo, uint256 _quantity, uint256 _totalMintCost) external;
  function getCostAndMintEligibilityBattleStones(uint256 _quantity) external view returns (uint256);

  function erc721mintBattleShields(address _addressToMintTo, uint256 _quantity, uint256 _totalMintCost) external;
  function getCostAndMintEligibilityBattleShields(uint256 _quantity) external view returns (uint256);

  function erc721mintLuckTokens(address _addressToMintTo, uint256 _quantity, uint256 _totalMintCost) external;
  function getCostAndMintEligibilityLuckTokens(uint256 _quantity) external view returns (uint256);
}


