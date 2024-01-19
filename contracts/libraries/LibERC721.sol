// SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;

import {IERC20} from "../interfaces/IERC20.sol";
import {IERC20Permit} from "../interfaces/IERC20Permit.sol";
import {LibAddress} from "./LibAddress.sol";

import {AppStorage} from "../AppStorage.sol";

import {LibAppStorage} from "../libraries/LibAppStorage.sol";



library LibERC721 {

    /**
     * @dev Emitted when `owner` enables or disables (`approved`) `operator` to manage all of its assets.
     */
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);


    /**
     * @dev Emitted when `owner` enables `approved` to manage the `tokenId` token.
     */
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);

    /**
     * @dev Emitted when `tokenId` token is transferred from `from` to `to`.
     */
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    /**
     * @dev Emitted when a new token is deployed.
     */
    event ERC721NewCollection(address token);
    
    // Gem Token Events
    event GemTokensMintedWithCredits(address indexed account, uint256 totalMints);
    event GemTokensMintedWithUsdc(address indexed account, uint256 totalMints, uint256 totalCost);
    event USDCMint(address indexed minter, uint256 quantity, uint256 totalCost);
    event WinnerDeclared(address winner, uint256 totalValue);



        /**
     * @dev Transfers `tokenId` from `from` to `to`.
     *  As opposed to {transferFrom}, this imposes no restrictions on msg.sender.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - `tokenId` token must be owned by `from`.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address _contract, address from, address to, uint256 tokenId) internal {


        AppStorage storage s = LibAppStorage.diamondStorage();

        require(s.erc721owners[_contract][tokenId] == from, "ERC721: transfer from incorrect owner");
        require(to != address(0), "ERC721: transfer to the zero address");

        beforeTokenTransfer(_contract, from, to, tokenId, 1);

        // Check that tokenId was not transferred by `_erc721beforeTokenTransfer` hook
        require(s.erc721owners[_contract][tokenId] == from, "ERC721: transfer from incorrect owner");

        // Clear approvals from the previous owner
        delete s.erc721tokenApprovals[_contract][tokenId];

        // Clear individual approval for this token
        _clearIndividualApproval(_contract, tokenId);


        unchecked {
            // `s.erc721balances[_contract][from]` cannot overflow for the same reason as described in `_burn`:
            // `from`'s balance is the number of token held, which is at least one before the current
            // transfer.
            // `s.erc721balances[msg.sender][to]` could overflow in the conditions described in `_mint`. That would require
            // all 2**256 token ids to be minted, which in practice is impossible.
            s.erc721balances[_contract][from] -= 1;
            s.erc721balances[_contract][to] += 1;
        }
        s.erc721owners[_contract][tokenId] = to;

        emit Transfer(from, to, tokenId);

        afterTokenTransfer(_contract, from, to, tokenId, 1);
    }







    /**
     * @dev Transfers `tokenId` from `from` to `to` from a facet on the diamond
     *  an extra parameter allows the correct wallet to be the msg.sender since the call is coming from a facet and not the external erc721 contract
     *
     *  Emits a {Transfer} event.
     */
    function transferFromFacet(address _contract, address from, address to, uint256 tokenId) internal {


        AppStorage storage s = LibAppStorage.diamondStorage();

        require(s.erc721owners[_contract][tokenId] == from, "ERC721: transfer from incorrect owner");
        require(to != address(0), "ERC721: transfer to the zero address");

        beforeTokenTransfer(_contract, from, to, tokenId, 1);

        // Check that tokenId was not transferred by `beforeTokenTransfer` hook
        require(s.erc721owners[_contract][tokenId] == from, "ERC721: transfer from incorrect owner");

        // Clear approvals from the previous owner
        delete s.erc721tokenApprovals[_contract][tokenId];

        // Clear individual approval for this token
        _clearIndividualApproval(_contract,tokenId);


        unchecked {
            // `s.erc721balances[msg.sender][from]` cannot overflow for the same reason as described in `_burn`:
            // `from`'s balance is the number of token held, which is at least one before the current
            // transfer.
            // `s.erc721balances[msg.sender][to]` could overflow in the conditions described in `_mint`. That would require
            // all 2**256 token ids to be minted, which in practice is impossible.
            s.erc721balances[_contract][from] -= 1;
            s.erc721balances[_contract][to] += 1;
        }
        s.erc721owners[_contract][tokenId] = to;

        emit Transfer(from, to, tokenId);

        afterTokenTransfer(_contract, from, to, tokenId, 1);
    }






    /**
     * @dev See {ERC721-beforeTokenTransfer}.
     */
    function beforeTokenTransfer(
        address _contract,
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal  {
        
        if (batchSize > 1) {
            // Will only trigger during construction. Batch transferring (minting) is not available afterwards.
            revert("ERC721Enumerable: consecutive transfers not supported");
        }

        uint256 tokenId = firstTokenId;

        if (from == address(0)) {
            _addTokenToAllTokensEnumeration(_contract,tokenId);
        } else if (from != to) {
            _removeTokenFromOwnerEnumeration(_contract,from, tokenId);
        }
        if (to == address(0)) {
            _removeTokenFromAllTokensEnumeration(_contract,tokenId);
        } else if (to != from) {
            _addTokenToOwnerEnumeration(_contract,to, tokenId);
        }
    }

  

    /**
     * @dev Hook that is called after any token transfer. This includes minting and burning. If {ERC721Consecutive} is
     * used, the hook may be called as part of a consecutive (batch) mint, as indicated by `batchSize` greater than 1.
     *
     * Calling conditions:
     *
     * - When `from` and `to` are both non-zero, ``from``'s tokens were transferred to `to`.
     * - When `from` is zero, the tokens were minted for `to`.
     * - When `to` is zero, ``from``'s tokens were burned.
     * - `from` and `to` are never both zero.
     * - `batchSize` is non-zero.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function afterTokenTransfer(address _contract, address from, address to, uint256 firstTokenId, uint256 batchSize) internal {}




    /**
     * @dev Private function to add a token to this extension's ownership-tracking data structures.
     * @param to address representing the new owner of the given token ID
     * @param tokenId uint256 ID of the token to be added to the tokens list of the given address
     */
    function _addTokenToOwnerEnumeration(address _contract, address to, uint256 tokenId) internal {

        AppStorage storage s = LibAppStorage.diamondStorage();

        uint256 length = s.erc721balances[_contract][to];
        s.erc721ownedTokens[_contract][to][length] = tokenId;
        s.erc721ownedTokensIndex[_contract][tokenId] = length;
    }


    /**
     * @dev Private function to add a token to this extension's token tracking data structures.
     * @param tokenId uint256 ID of the token to be added to the tokens list
     */
    function _addTokenToAllTokensEnumeration(address _contract, uint256 tokenId) internal {

        AppStorage storage s = LibAppStorage.diamondStorage();

        s.erc721allTokensIndex[_contract][tokenId] = s.erc721allTokens[_contract].length;
        s.erc721allTokens[_contract].push(tokenId);
    }


    /**
     * @dev Private function to remove a token from this extension's ownership-tracking data structures. Note that
     * while the token is not assigned a new owner, the `_ownedTokensIndex` mapping is _not_ updated: this allows for
     * gas optimizations e.g. when performing a transfer operation (avoiding double writes).
     * This has O(1) time complexity, but alters the order of the _ownedTokens array.
     * @param from address representing the previous owner of the given token ID
     * @param tokenId uint256 ID of the token to be removed from the tokens list of the given address
     */
    function _removeTokenFromOwnerEnumeration(address _contract, address from, uint256 tokenId) internal {
        // To prevent a gap in from's tokens array, we store the last token in the index of the token to delete, and
        // then delete the last slot (swap and pop).

        AppStorage storage s = LibAppStorage.diamondStorage();

        uint256 lastTokenIndex = s.erc721balances[_contract][from] - 1;
        uint256 tokenIndex = s.erc721ownedTokensIndex[_contract][tokenId];

        // When the token to delete is the last token, the swap operation is unnecessary
        if (tokenIndex != lastTokenIndex) {
            uint256 lastTokenId = s.erc721ownedTokens[_contract][from][lastTokenIndex];

            s.erc721ownedTokens[_contract][from][tokenIndex] = lastTokenId; // Move the last token to the slot of the to-delete token
            s.erc721ownedTokensIndex[_contract][lastTokenId] = tokenIndex; // Update the moved token's index
        }

        // This also deletes the contents at the last position of the array
        delete s.erc721ownedTokensIndex[_contract][tokenId];
        delete s.erc721ownedTokens[_contract][from][lastTokenIndex];
    }


    /**
     * @dev Private function to remove a token from this extension's token tracking data structures.
     * This has O(1) time complexity, but alters the order of the _allTokens array.
     * @param tokenId uint256 ID of the token to be removed from the tokens list
     */
    function _removeTokenFromAllTokensEnumeration(address _contract, uint256 tokenId) internal {


        AppStorage storage s = LibAppStorage.diamondStorage();

        // To prevent a gap in the tokens array, we store the last token in the index of the token to delete, and
        // then delete the last slot (swap and pop).

        uint256 lastTokenIndex = s.erc721allTokens[_contract].length - 1;
        uint256 tokenIndex = s.erc721allTokensIndex[_contract][tokenId];

        // When the token to delete is the last token, the swap operation is unnecessary. However, since this occurs so
        // rarely (when the last minted token is burnt) that we still do the swap here to avoid the gas cost of adding
        // an 'if' statement (like in _removeTokenFromOwnerEnumeration)
        uint256 lastTokenId = s.erc721allTokens[_contract][lastTokenIndex];

        s.erc721allTokens[_contract][tokenIndex] = lastTokenId; // Move the last token to the slot of the to-delete token
        s.erc721allTokensIndex[_contract][lastTokenId] = tokenIndex; // Update the moved token's index

        // This also deletes the contents at the last position of the array
        delete s.erc721allTokensIndex[_contract][tokenId];
        s.erc721allTokens[_contract].pop();
    }




    function _clearIndividualApproval(address _contract, uint256 tokenId) internal {

        AppStorage storage s = LibAppStorage.diamondStorage();

        // Check if there are any approval records for this token and clear them
        if (s.erc721tokenIndividualApprovals[_contract][tokenId].length > 0) {
            delete s.erc721tokenIndividualApprovals[_contract][tokenId];
        }
    }




    /**
     * @dev Returns whether `spender` is allowed to manage `tokenId`.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function checkOwnership(address _contract, address spender, uint256 tokenId) internal view returns (bool) {
        AppStorage storage s = LibAppStorage.diamondStorage();

        address owner = s.erc721owners[_contract][tokenId];

        return (spender == owner);
    }


}



