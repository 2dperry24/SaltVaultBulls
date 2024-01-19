
// SPDX-License-Identifier: MIT
// Converted from OpenZeppelin Contracts (last updated v5.0.1) (utils/Context.sol) to a library

pragma solidity ^0.8.0;


library LibSharedStructs {

    struct IndividualApprovalRecord {
        uint256 tokenId;
        address approved;
        uint256 timestamp;
        bool isApprovalActive;
    }


    struct OperatorApprovalRecord {
        address operator;
        uint256 timestamp;
        bool isApprovalActive;
    }
}