// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "../../openzeppelin-contracts/contracts/token/ERC721/IERC721Receiver.sol";

contract ERC721ReceiverMockWithMessage is IERC721Receiver {
  bytes4 private _retval;
  bool private _reverts;

  event Received(
    address operator,
    address from,
    uint256 tokenId,
    bytes data,
    uint256 gas
  );


  constructor(bytes4 retval, bool reverts) {
    _retval = retval;
    _reverts = reverts;
  }

  function onERC721Received(
    address operator,
    address from,
    uint256 tokenId,
    bytes memory data
  )
    public
    returns(bytes4)
  {
    if (_reverts) {
      revert("ERC721ReceiverMock: reverting");
    }
    emit Received(operator, from, tokenId, data, gasleft());
    return _retval;
  }
}
