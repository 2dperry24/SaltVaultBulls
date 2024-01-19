// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import {IERC721} from "../interfaces/IERC721.sol";
import {AppStorage, GemToken} from "../AppStorage.sol";
import "../libraries/LibDiamond.sol";
import {LibDiamond} from "../libraries/LibDiamond.sol";
import {LibSafeERC20} from "../libraries/LibSafeERC20.sol";
import {LibAppStorage} from "../libraries/LibAppStorage.sol";


contract AdminSetterFacet {

    AppStorage internal s;


    function setAddresses(address _usdcTokenContract, address _coreTeamWallet, address _royaltiesWallet, address _procurementWallet , address _gemTokenBurnWallet ) external  {

        LibDiamond.enforceIsContractOwner();

        s.usdcTokenContract = _usdcTokenContract;
        s.coreTeamWallet = _coreTeamWallet;
        s.royaltiesWallet = _royaltiesWallet;
        s.procurementWallet = _procurementWallet;
        s.gemTokenBurnWallet = _gemTokenBurnWallet;
   
    }


    // Function to authorize a External Contract
    function setAuthorizeExternalContractsForERC721Facet(address _externalContract, bool authorized) external {
        
        LibDiamond.enforceIsContractOwner();

        s.erc721authorizedExternalContracts[_externalContract] = authorized;
    }


      // Function to authorize a address to control Gem Token Game
    function setAuthorizeAdminForGemTokenFacet(address _address, bool authorized) external {
        
        LibDiamond.enforceIsContractOwner();

        s.authorizedAdminForGemTokenFacet[_address] = authorized;
    }






}



