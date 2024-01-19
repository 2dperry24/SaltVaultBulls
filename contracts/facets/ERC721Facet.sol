// SPDX-License-Identifier: MIT
pragma solidity >=0.8.13;

import { IERC721Facet } from "../interfaces/IERC721Facet.sol";
import { IERC721Receiver } from "../interfaces/IERC721Receiver.sol";
import { IERC721Metadata } from "../interfaces/IERC721Metadata.sol";
// import { LibERC20 } from "../libraries/LibERC20.sol";
import { LibERC721 } from "../libraries/LibERC721.sol";
import { LibAddress } from "../libraries/LibAddress.sol";
import { LibStrings } from "../libraries/LibStrings.sol";
import { LibContext } from "../libraries/LibContext.sol";

import "@openzeppelin/contracts/utils/Context.sol";
import "../libraries/LibSharedStruct.sol";
import {AppStorage } from "../AppStorage.sol";


contract ERC721Facet is IERC721Facet {
    using LibAddress for address;
    using LibStrings for uint256;

    AppStorage internal s;


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


    /*
    IERC721Facet interface implementation
    */

    function erc721setCollection(string memory name, string memory symbol, string memory baseURI , string memory baseExtension) external {
    if (LibStrings.len(name) == 0 || LibStrings.len(symbol) == 0) {
        revert("must supply information about collection");
    }

    if(s.erc721init[msg.sender]) {revert("Already Initialized");}


    address token = msg.sender;

    s.erc721name[token] = name;
    s.erc721symbol[token] = symbol;
    s.erc721baseURI[token] = baseURI;
    s.erc721baseExtension[token] = baseExtension;



    emit ERC721NewCollection(token);

    s.erc721init[msg.sender] = true;

    }


    /**
     * @dev See {IERC721-erc721balanceOf}.
     */
    function erc721balanceOf(address owner) public view virtual  returns (uint256) {
        require(owner != address(0), "ERC721: address zero is not a valid owner");
        return s.erc721balances[msg.sender][owner];
    }

    /**
     * @dev See {IERC721-erc721ownerOf}.
     */
    function erc721ownerOf(uint256 tokenId) external view  returns (address) {
        address owner = _erc721ownerOf(tokenId);
        require(owner != address(0), "ERC721: invalid token ID");
        return owner;
    }



    /**
     * @dev See {IERC721Metadata-erc721name}.
     */
    function erc721name() external view returns (string memory) {
        return s.erc721name[msg.sender];
    }

    /**
     * @dev See {IERC721Metadata-erc721symbol}.
     */
    function erc721symbol() external view returns (string memory) {
        return s.erc721symbol[msg.sender];
    }



    /**
     * @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
     * token will be the concatenation of the `baseURI` and the `tokenId`. Empty
     * by default, can be overridden in child contracts.
     */
    function erc721baseURI() public view returns (string memory) {
        return s.erc721baseURI[msg.sender];
    }

    /**
     * @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
     * token will be the concatenation of the `baseURI` and the `tokenId`. Empty
     * by default, can be overridden in child contracts.
     */
    function erc721baseExtension() public view returns (string memory) {
        return s.erc721baseExtension[msg.sender];
    }


    /**
     * @dev See {IERC721Metadata-erc721tokenURI}.
     */
    function erc721tokenURI(uint256 tokenId) external view  returns (string memory) {
        _erc721requireMinted(tokenId);

        string memory baseURI = erc721baseURI();
        string memory baseExtension = erc721baseExtension();
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString(), baseExtension)) : "";
    }


    /**
     * @dev See {IERC721-isApprovedForAll}.
     */
    function isApprovedForAll(address owner, address operator) public view returns (bool) {
        return s.erc721operatorApprovals[msg.sender][owner][operator];
    }


    /**
     * @dev See {IERC721-approve}.
     */
    function erc721approve(address auth, address to, uint256 tokenId) external {

        address owner = s.erc721owners[msg.sender][tokenId];
        require(to != owner, "ERC721: approval to current owner");

        require(
            auth == owner || isApprovedForAll(owner, auth),
            "ERC721: approve caller is not token owner or approved for all"
        );
        
        _approve(auth, to, tokenId);
    }



    /**
     * @dev Approve `to` to operate on `tokenId`
     *
     * Emits an {Approval} event.
     */
    function _approve(address auth, address to, uint256 tokenId) internal virtual {
       
        // Record the individual token approval change
        LibSharedStructs.IndividualApprovalRecord memory record = LibSharedStructs.IndividualApprovalRecord({
            tokenId: tokenId,
            approved: to,
            timestamp: block.timestamp,
            isApprovalActive: to != address(0)
        });
        s.erc721tokenIndividualApprovals[msg.sender][tokenId].push(record);

        // Update the token approval state
        s.erc721tokenApprovals[msg.sender][tokenId] = to;

        emit Approval(auth, to, tokenId);
    }






    /**
     * @dev See {IERC721-erc721getApproved}.
     */
    function erc721getApproved(uint256 tokenId) public view virtual  returns (address) {
        _erc721requireMinted(tokenId);

        return s.erc721tokenApprovals[msg.sender][tokenId];
    }

    /**
     * @dev See {IERC721-erc721setApprovalForAll}.
     */
    function erc721setApprovalForAll(address auth, address operator, bool approved) external {
        _erc721setApprovalForAll(msg.sender, auth, operator, approved);
    }

    /**
     * @dev See {IERC721-erc721isApprovedForAll}.
     */
    function erc721isApprovedForAll(address owner, address operator) public view virtual  returns (bool) {
        return s.erc721operatorApprovals[msg.sender][owner][operator];
    }

    /**
     * @dev See {IERC721-erc721transferFrom}.
     */
    function erc721transferFrom(address auth, address from, address to, uint256 tokenId) public virtual  {
        //solhint-disable-next-line max-line-length
        require(_erc721isApprovedOrOwner(auth, tokenId), "ERC721: caller is not token owner or approved");

        LibERC721.transfer(msg.sender, from, to, tokenId);
    }

    /**
     * @dev See {IERC721-safeerc721transferFrom}.
     */
    function erc721safeTransferFrom(address auth, address from, address to, uint256 tokenId) public virtual  {
        erc721safeTransferFrom(auth, from, to, tokenId, "");
    }



    /**
     * @dev See {IERC721-erc721safeTransferFrom}.
     */
    function erc721safeTransferFrom(address auth, address from, address to, uint256 tokenId, bytes memory data) public virtual  {
        require(_erc721isApprovedOrOwner(auth, tokenId), "ERC721: caller is not token owner or approved");
        _erc721safeTransfer(auth, from, to, tokenId, data);
    }



    /**
     * @dev Safely transfers `tokenId` token from `from` to `to`, checking first that contract recipients
     * are aware of the ERC721 protocol to prevent tokens from being forever locked.
     *
     * `data` is additional data, it has no specified format and it is sent in call to `to`.
     *
     * This internal function is equivalent to {erc721safeTransferFrom}, and can be used to e.g.
     * implement alternative mechanisms to perform token transfer, such as signature-based.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `tokenId` token must exist and be owned by `from`.
     * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
     *
     * Emits a {Transfer} event.
     */
    function _erc721safeTransfer(address auth, address from, address to, uint256 tokenId, bytes memory data) internal virtual {
        LibERC721.transfer(msg.sender, from, to, tokenId);
        require(_checkOnERC721Received(auth, from, to, tokenId, data), "ERC721: transfer to non ERC721Receiver implementer");
    }




    /**
     * @dev Returns the owner of the `tokenId`. Does NOT revert if token doesn't exist
     */
    function _erc721ownerOf(uint256 tokenId) internal view virtual returns (address) {
        return s.erc721owners[msg.sender][tokenId];
    }

    /**
     * @dev Returns whether `tokenId` exists.
     *
     * Tokens can be managed by their owner or approved accounts via {approve} or {erc721setApprovalForAll}.
     *
     * Tokens start existing when they are minted (`_mint`),
     * and stop existing when they are burned (`_burn`).
     */
    function erc721exists(uint256 tokenId) external view returns (bool) {
        return _erc721ownerOf(tokenId) != address(0);
    }


    /**
     * @dev Returns whether `tokenId` exists.
     *
     * Tokens can be managed by their owner or approved accounts via {approve} or {erc721setApprovalForAll}.
     *
     * Tokens start existing when they are minted (`_mint`),
     * and stop existing when they are burned (`_burn`).
     */
    function _erc721exists(uint256 tokenId) internal view virtual returns (bool) {
        return _erc721ownerOf(tokenId) != address(0);
    }


    /**
     * @dev Returns whether `spender` is allowed to manage `tokenId`.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function _erc721isApprovedOrOwner(address spender, uint256 tokenId) internal view virtual returns (bool) {
        address owner = s.erc721owners[msg.sender][tokenId];
        return (spender == owner || erc721isApprovedForAll(owner, spender) || erc721getApproved(tokenId) == spender);
    }


    // /**
    //  * @dev Transfers `tokenId` from `from` to `to`.
    //  *  As opposed to {transferFrom}, this imposes no restrictions on msg.sender.
    //  *
    //  * Requirements:
    //  *
    //  * - `to` cannot be the zero address.
    //  * - `tokenId` token must be owned by `from`.
    //  *
    //  * Emits a {Transfer} event.
    //  */
    // function _erc721transfer(address from, address to, uint256 tokenId) internal virtual {
    //     require(s.erc721owners[msg.sender][tokenId] == from, "ERC721: transfer from incorrect owner");
    //     require(to != address(0), "ERC721: transfer to the zero address");

    //     _erc721beforeTokenTransfer(from, to, tokenId, 1);

    //     // Check that tokenId was not transferred by `_erc721beforeTokenTransfer` hook
    //     require(s.erc721owners[msg.sender][tokenId] == from, "ERC721: transfer from incorrect owner");

    //     // Clear approvals from the previous owner
    //     delete s.erc721tokenApprovals[msg.sender][tokenId];

    //     // Clear individual approval for this token
    //     _clearIndividualApproval(tokenId);


    //     unchecked {
    //         // `s.erc721balances[msg.sender][from]` cannot overflow for the same reason as described in `_burn`:
    //         // `from`'s balance is the number of token held, which is at least one before the current
    //         // transfer.
    //         // `s.erc721balances[msg.sender][to]` could overflow in the conditions described in `_mint`. That would require
    //         // all 2**256 token ids to be minted, which in practice is impossible.
    //         s.erc721balances[msg.sender][from] -= 1;
    //         s.erc721balances[msg.sender][to] += 1;
    //     }
    //     s.erc721owners[msg.sender][tokenId] = to;

    //     emit Transfer(from, to, tokenId);

    //     _erc721afterTokenTransfer(from, to, tokenId, 1);
    // }




    function _erc721setApprovalForAll(address _contract, address auth, address operator, bool approved) internal virtual {
        require(auth != operator, "ERC721: approve to caller");

        bool found = false;
        for (uint i = 0; i < s.erc721ownerOperatorApprovals[_contract][auth].length; i++) {
            if (s.erc721ownerOperatorApprovals[_contract][auth][i].operator == operator) {
                found = true;
                if (approved) {
                    // Update the existing record with the new timestamp
                    s.erc721ownerOperatorApprovals[_contract][auth][i].timestamp = block.timestamp;
                    s.erc721ownerOperatorApprovals[_contract][auth][i].isApprovalActive = true;
                } else {
                    // Remove the record by shifting the remaining elements left
                    for (uint j = i; j < s.erc721ownerOperatorApprovals[_contract][auth].length - 1; j++) {
                        s.erc721ownerOperatorApprovals[_contract][auth][j] = s.erc721ownerOperatorApprovals[_contract][auth][j + 1];
                    }
                    s.erc721ownerOperatorApprovals[_contract][auth].pop();
                }
                break;
            }
        }

        if (!found && approved) {
            // If no existing record and approval is being granted, add a new record
            LibSharedStructs.OperatorApprovalRecord memory record = LibSharedStructs.OperatorApprovalRecord({
                operator: operator,
                timestamp: block.timestamp,
                isApprovalActive: true
            });
            s.erc721ownerOperatorApprovals[_contract][auth].push(record);
        }

        // Update the operator approval state
        s.erc721operatorApprovals[_contract][auth][operator] = approved;

        emit ApprovalForAll(auth, operator, approved);
    }




    // function _clearIndividualApproval(uint256 tokenId) private {
    //     // Check if there are any approval records for this token and clear them
    //     if (s.erc721tokenIndividualApprovals[tokenId].length > 0) {
    //         delete s.erc721tokenIndividualApprovals[tokenId];
    //     }
    // }



    /**
     * @dev Reverts if the `tokenId` has not been minted yet.
     */
    function _erc721requireMinted(uint256 tokenId) internal view virtual {
        require(_erc721exists(tokenId), "ERC721: invalid token ID");
    }

    /**
     * @dev Internal function to invoke {IERC721Receiver-onERC721Received} on a target address.
     * The call is not executed if the target address is not a contract.
     *
     * @param from address representing the previous owner of the given token ID
     * @param to target address that will receive the tokens
     * @param tokenId uint256 ID of the token to be transferred
     * @param data bytes optional data to send along with the call
     * @return bool whether the call correctly returned the expected magic value
     */
    function _checkOnERC721Received(
        address auth,
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) private returns (bool) {
        if (LibAddress.isContract(to)) {
            try IERC721Receiver(to).onERC721Received(auth, from, tokenId, data) returns (bytes4 retval) {
                return retval == IERC721Receiver.onERC721Received.selector;
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    revert("ERC721: transfer to non ERC721Receiver implementer");
                } else {
                    /// @solidity memory-safe-assembly
                    assembly {
                        revert(add(32, reason), mload(reason))
                    }
                }
            }
        } else {
            return true;
        }
    }

  

    // /**
    //  * @dev Hook that is called after any token transfer. This includes minting and burning. If {ERC721Consecutive} is
    //  * used, the hook may be called as part of a consecutive (batch) mint, as indicated by `batchSize` greater than 1.
    //  *
    //  * Calling conditions:
    //  *
    //  * - When `from` and `to` are both non-zero, ``from``'s tokens were transferred to `to`.
    //  * - When `from` is zero, the tokens were minted for `to`.
    //  * - When `to` is zero, ``from``'s tokens were burned.
    //  * - `from` and `to` are never both zero.
    //  * - `batchSize` is non-zero.
    //  *
    //  * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
    //  */
    // function _erc721afterTokenTransfer(address from, address to, uint256 firstTokenId, uint256 batchSize) internal virtual {}





    /**
     * @dev See {IERC721Enumerable-tokenOfOwnerByIndex}.
     */
    function erc721tokenOfOwnerByIndex(address owner, uint256 index) public view virtual  returns (uint256) {
        require(index < s.erc721balances[msg.sender][owner], "ERC721Enumerable: owner index out of bounds");
        return s.erc721ownedTokens[msg.sender][owner][index];
    }

    /**
     * @dev See {IERC721Enumerable-totalSupply}.
     */
    function erc721totalSupply() external view returns (uint256) {
        return s.erc721allTokens[msg.sender].length;
    }

    /**
     * @dev See {IERC721Enumerable-erc721tokenByIndex}.
     */
    function erc721tokenByIndex(uint256 index) public view virtual  returns (uint256) {
        require(index < s.erc721allTokens[msg.sender].length, "ERC721Enumerable: global index out of bounds");
        return s.erc721allTokens[msg.sender][index];
    }




    // /**
    //  * @dev See {ERC721-_erc721beforeTokenTransfer}.
    //  */
    // function _erc721beforeTokenTransfer(
    //     address from,
    //     address to,
    //     uint256 firstTokenId,
    //     uint256 batchSize
    // ) internal virtual  {
        
    //     if (batchSize > 1) {
    //         // Will only trigger during construction. Batch transferring (minting) is not available afterwards.
    //         revert("ERC721Enumerable: consecutive transfers not supported");
    //     }

    //     uint256 tokenId = firstTokenId;

    //     if (from == address(0)) {
    //         _addTokenToAllTokensEnumeration(tokenId);
    //     } else if (from != to) {
    //         _removeTokenFromOwnerEnumeration(from, tokenId);
    //     }
    //     if (to == address(0)) {
    //         _removeTokenFromAllTokensEnumeration(tokenId);
    //     } else if (to != from) {
    //         _addTokenToOwnerEnumeration(to, tokenId);
    //     }
    // }



    // /**
    //  * @dev Private function to add a token to this extension's ownership-tracking data structures.
    //  * @param to address representing the new owner of the given token ID
    //  * @param tokenId uint256 ID of the token to be added to the tokens list of the given address
    //  */
    // function _addTokenToOwnerEnumeration(address to, uint256 tokenId) private {
    //     uint256 length = s.erc721balances[msg.sender][to];
    //     s.erc721ownedTokens[msg.sender][to][length] = tokenId;
    //     s.erc721ownedTokensIndex[msg.sender][tokenId] = length;
    // }

    // /**
    //  * @dev Private function to add a token to this extension's token tracking data structures.
    //  * @param tokenId uint256 ID of the token to be added to the tokens list
    //  */
    // function _addTokenToAllTokensEnumeration(uint256 tokenId) private {
    //     s.erc721allTokensIndex[msg.sender][tokenId] = s.erc721allTokens[msg.sender].length;
    //     s.erc721allTokens[msg.sender].push(tokenId);
    // }

    // /**
    //  * @dev Private function to remove a token from this extension's ownership-tracking data structures. Note that
    //  * while the token is not assigned a new owner, the `_ownedTokensIndex` mapping is _not_ updated: this allows for
    //  * gas optimizations e.g. when performing a transfer operation (avoiding double writes).
    //  * This has O(1) time complexity, but alters the order of the _ownedTokens array.
    //  * @param from address representing the previous owner of the given token ID
    //  * @param tokenId uint256 ID of the token to be removed from the tokens list of the given address
    //  */
    // function _removeTokenFromOwnerEnumeration(address from, uint256 tokenId) private {
    //     // To prevent a gap in from's tokens array, we store the last token in the index of the token to delete, and
    //     // then delete the last slot (swap and pop).

    //     uint256 lastTokenIndex = s.erc721balances[msg.sender][from] - 1;
    //     uint256 tokenIndex = s.erc721ownedTokensIndex[msg.sender][tokenId];

    //     // When the token to delete is the last token, the swap operation is unnecessary
    //     if (tokenIndex != lastTokenIndex) {
    //         uint256 lastTokenId = s.erc721ownedTokens[msg.sender][from][lastTokenIndex];

    //         s.erc721ownedTokens[msg.sender][from][tokenIndex] = lastTokenId; // Move the last token to the slot of the to-delete token
    //         s.erc721ownedTokensIndex[msg.sender][lastTokenId] = tokenIndex; // Update the moved token's index
    //     }

    //     // This also deletes the contents at the last position of the array
    //     delete s.erc721ownedTokensIndex[msg.sender][tokenId];
    //     delete s.erc721ownedTokens[msg.sender][from][lastTokenIndex];
    // }

    // /**
    //  * @dev Private function to remove a token from this extension's token tracking data structures.
    //  * This has O(1) time complexity, but alters the order of the _allTokens array.
    //  * @param tokenId uint256 ID of the token to be removed from the tokens list
    //  */
    // function _removeTokenFromAllTokensEnumeration(uint256 tokenId) private {
    //     // To prevent a gap in the tokens array, we store the last token in the index of the token to delete, and
    //     // then delete the last slot (swap and pop).

    //     uint256 lastTokenIndex = s.erc721allTokens[msg.sender].length - 1;
    //     uint256 tokenIndex = s.erc721allTokensIndex[msg.sender][tokenId];

    //     // When the token to delete is the last token, the swap operation is unnecessary. However, since this occurs so
    //     // rarely (when the last minted token is burnt) that we still do the swap here to avoid the gas cost of adding
    //     // an 'if' statement (like in _removeTokenFromOwnerEnumeration)
    //     uint256 lastTokenId = s.erc721allTokens[msg.sender][lastTokenIndex];

    //     s.erc721allTokens[msg.sender][tokenIndex] = lastTokenId; // Move the last token to the slot of the to-delete token
    //     s.erc721allTokensIndex[msg.sender][lastTokenId] = tokenIndex; // Update the moved token's index

    //     // This also deletes the contents at the last position of the array
    //     delete s.erc721allTokensIndex[msg.sender][tokenId];
    //     s.erc721allTokens[msg.sender].pop();
    // }


   function erc721walletOfOwner(address _owner) public view returns (uint256[] memory) {
        uint256 ownerTokenCount = s.erc721balances[msg.sender][_owner];
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);
        for (uint256 i; i < ownerTokenCount; i++) {
            tokenIds[i] = erc721tokenOfOwnerByIndex(_owner, i);
        }
        return tokenIds;
    }




    function erc721mintingLive() external view returns (bool) {
        return s.erc721mintingLive[msg.sender];
    }



    function erc721setMintingLive(bool _bool) external {
        s.erc721mintingLive[msg.sender] = _bool;
    }


 
    function erc721setBaseUri(string memory _newBaseUri) external {
        s.erc721baseURI[msg.sender] = _newBaseUri;
    }


    function erc721setBullsContractAddress(address _contract) external {
        s.bullsExternalContractAddress = _contract;
    }


    function erc721setGemTokenContractAddress(address _contract) external {
        s.gemTokensExternalContractAddress = _contract;
    }


    ///////// Approval Tracking ///////////


    function erc721getApprovalHistory(address owner) 
    public 
    view 
    returns (LibSharedStructs.IndividualApprovalRecord[] memory individualApprovals, LibSharedStructs.OperatorApprovalRecord[] memory operatorApprovals) 
{
    uint256[] memory ownedTokens = erc721walletOfOwner(owner);
    uint256 validApprovalCount = 0;

    // First, count valid individual approvals
    for (uint256 i = 0; i < ownedTokens.length; i++) {
        uint256 tokenId = ownedTokens[i];
        LibSharedStructs.IndividualApprovalRecord[] memory approvals = s.erc721tokenIndividualApprovals[msg.sender][tokenId];
        if (approvals.length > 0 && approvals[approvals.length - 1].approved != address(0)) {
            validApprovalCount++;
        }
    }

    // Allocate memory for valid individual approvals
    individualApprovals = new LibSharedStructs.IndividualApprovalRecord[](validApprovalCount);
    uint256 index = 0;

    // Populate individual approvals
    for (uint256 i = 0; i < ownedTokens.length; i++) {
        uint256 tokenId = ownedTokens[i];
        LibSharedStructs.IndividualApprovalRecord[] memory approvals = s.erc721tokenIndividualApprovals[msg.sender][tokenId];
        if (approvals.length > 0 && approvals[approvals.length - 1].approved != address(0)) {
            individualApprovals[index++] = approvals[approvals.length - 1];
        }
    }

    // Retrieve operator approvals
    operatorApprovals = s.erc721ownerOperatorApprovals[msg.sender][owner];
    return (individualApprovals, operatorApprovals);
}


    ///////////// MINTING /////////////




    /**
     * @dev Return the total price for the mint transaction if still available and return 0 if not allowed.
    */
    function getCostAndMintEligibilityOfBulls(uint256 _rarity) external view returns (uint256) {

        if (s.rarityProperties[_rarity].currentIndex > s.rarityProperties[_rarity].lastIndex) {
            return 0;
        }

        if (!s.erc721mintingLive[msg.sender]) {
            return 0;
        }

        uint256 transactionCost = s.rarityProperties[_rarity].mintCost;
        return transactionCost;
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



    /**
     * @dev Return the wallets needed on the external ERC721 contract
    */
    function erc721getWalletsForExternalContract() external view returns (address, address, address) {
        
        if (s.usdcTokenContract == address(0) || s.coreTeamWallet == address(0) || s.procurementWallet == address(0) || s.royaltiesWallet == address(0)) {revert("Address must be set first");}

        return (s.usdcTokenContract, s.royaltiesWallet, s.procurementWallet);
    }





    /**
     * @dev Return bool to see if external contract is allowed to call Minting Bulls
    */
    function isExternalContractApprovedForERC721Minting() external view returns (bool) {
        return s.erc721authorizedExternalContracts[msg.sender];
    }




    function mintBull(uint256 rarity, address _addressToMintTo) external {

        require(s.erc721authorizedExternalContracts[msg.sender], "Not an approved external contract");

        // get current index
        uint256 indexToMint = s.rarityProperties[rarity].currentIndex;

        require(indexToMint <= s.rarityProperties[rarity].lastIndex, "Tier is now minted out");

        require(!_erc721exists(indexToMint), "ERC721: token already minted");
        require(_addressToMintTo != address(0), "ERC721: mint to the zero address");
        
        // update enumerable information


        LibERC721.beforeTokenTransfer(msg.sender, address(0), _addressToMintTo, indexToMint, 1);

        // mint to the _addressToMintTo in the msg.sender collection
        s.erc721balances[msg.sender][_addressToMintTo] += 1; 
        s.erc721owners[msg.sender][indexToMint] = _addressToMintTo; 

        // update minting counter         
        s.rarityProperties[rarity].currentIndex++;


        // update salt wallt information for bull
        if (rarity == 0){
            s.bulls[indexToMint].rarity = 0;
            s.bulls[indexToMint].cubes = 3;
            s.bulls[indexToMint].sheets = 1;
            s.bulls[indexToMint].pillars = 1;
            s.bulls[indexToMint].grains = 6;
            s.gemTokenMintCredits[_addressToMintTo] = 7;
        } else if (rarity == 1) {
            s.bulls[indexToMint].rarity = 1;
            s.bulls[indexToMint].cubes = 1;
            s.bulls[indexToMint].sheets = 2;
            s.bulls[indexToMint].pillars = 2;
            s.bulls[indexToMint].grains = 3;
            s.gemTokenMintCredits[_addressToMintTo] = 6;
        } else if (rarity == 2) {
            s.bulls[indexToMint].rarity = 2;
            s.bulls[indexToMint].sheets = 8;
            s.bulls[indexToMint].pillars = 7;
            s.bulls[indexToMint].grains = 7;
            s.gemTokenMintCredits[_addressToMintTo] = 5;
        } else if (rarity == 3) {
            s.bulls[indexToMint].rarity = 3;
            s.bulls[indexToMint].sheets = 5;
            s.bulls[indexToMint].pillars = 8;
            s.bulls[indexToMint].grains = 3;
            s.gemTokenMintCredits[_addressToMintTo] = 4;
        } else if (rarity == 4) {
            s.bulls[indexToMint].rarity = 4;
            s.bulls[indexToMint].sheets = 4;
            s.bulls[indexToMint].pillars = 1;
            s.bulls[indexToMint].grains = 1;
            s.gemTokenMintCredits[_addressToMintTo] = 3;
        } else if (rarity == 5) {
            s.bulls[indexToMint].rarity = 5;
            s.bulls[indexToMint].sheets = 2;
            s.bulls[indexToMint].pillars = 3;
            s.bulls[indexToMint].grains = 3;
            s.gemTokenMintCredits[_addressToMintTo] = 2;
        } else if (rarity == 6) {
            s.bulls[indexToMint].rarity = 6;
            s.bulls[indexToMint].sheets = 1;
            s.bulls[indexToMint].pillars = 1;
            s.bulls[indexToMint].grains = 6;
            s.gemTokenMintCredits[_addressToMintTo] = 1;
        }
    
        // Update contract balances
        uint256 aumAmount = (s.rarityProperties[rarity].mintCost * 90) / 100;

        s.aum += aumAmount;
        s.vaultHoldingBalance += aumAmount;
        s.coreTeamBalance += (s.rarityProperties[rarity].mintCost - aumAmount);
 
        emit Transfer(address(0), _addressToMintTo, indexToMint);

    }



    // Gem tokens 

    function erc721getAvailableFreeGemTokenMints(address _owner) public view returns (uint256) {
        return s.gemTokenMintCredits[_owner];
    }



    function erc721mintGemTokens(address _addressToMintTo, uint256 _quantity, uint256 _totalCost) external {

        require(s.erc721authorizedExternalContracts[msg.sender], "Not an approved external contract");

        uint256 gemTokenMintCreditBefore = s.gemTokenMintCredits[_addressToMintTo];

        // get current index
        uint256 currentCount = s.gemTokenCurrentIndex;

        require(currentCount <= s.gemTokenTotalSupply, "No more Gem Tokens to Mint");

        // if(s.shuffledGemTokenIndices.length != 10000){revert("gemTokenShuffledIndices not set yet");}


        require(_addressToMintTo != address(0), "ERC721: mint to the zero address");
        
        for (uint256 i = 0; i < _quantity; i++) {

            uint256 indexToMint = s.shuffledGemTokenIndices[s.gemTokenCurrentIndex];
            if(_erc721exists(indexToMint)) {revert("ERC721: token already minted");}

            // update enumerable information
            LibERC721.beforeTokenTransfer(msg.sender, address(0), _addressToMintTo, indexToMint, 1);
            
            // mint to the _addressToMintTo in the msg.sender collection
            s.erc721balances[msg.sender][_addressToMintTo] += 1; 
            s.erc721owners[msg.sender][indexToMint] = _addressToMintTo; 
            s.gemTokenCurrentIndex++;
        }

     
        // determine which event to emit
        // if _totalCost == 0, they used credits
        if (_totalCost < 1) {

            // deduct credits from account
            s.gemTokenMintCredits[_addressToMintTo] = gemTokenMintCreditBefore - _quantity;
            emit GemTokensMintedWithCredits(_addressToMintTo, _quantity);
        } else {
            
            // Update contract balances
            uint256 splitCost = _totalCost / 2;

            s.coreTeamBalance += splitCost; 
            s.gemTokenSalesBalance += _totalCost - splitCost;

            emit GemTokensMintedWithUsdc(_addressToMintTo, _quantity, _totalCost);
    
        }
    }
}
