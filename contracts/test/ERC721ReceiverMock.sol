// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";


contract ERC721ReceiverMock is IERC721Receiver {
  bytes4 private _retval;
  event Received(
    address operator,
    address from,
    uint256 tokenId,
    bytes data,
    uint256 gas
  );

  error ERC721ReceiverMockRevert();

  constructor(bytes4 retval) {
    _retval = retval;

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
    if (tokenId == 51) {
      revert ERC721ReceiverMockRevert();
    }
    emit Received(operator, from, tokenId, data, gasleft());
    return _retval;
  }
}
