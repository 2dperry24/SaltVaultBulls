// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol"; 
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/Context.sol";


import "../libraries/LibSharedStruct.sol";
import "../interfaces/IERC721Facet.sol";



contract SaltVaultBulls is ERC721Enumerable, Ownable, ReentrancyGuard, IERC2981 {

    using SafeERC20 for IERC20;
    using Strings for uint256;
 
    IERC721Facet erc721Facet;

    address public usdcTokenContract;
    address public royaltiesWallet;
    address public procurementWallet;
    


    // IDiamondERC721Facet IERC721Facet;
    address public diamondAddress;

    constructor(address _diamondAddress)
        ERC721('Salt Valt Bulls','SVB')
        Ownable()
    {
            // Set the diamond address
        diamondAddress = _diamondAddress;

        // Initialize the erc721Facet with the diamond address
        erc721Facet = IERC721Facet(_diamondAddress);

        erc721Facet.erc721setCollection('Salt Vault Bulls', 'SVB', 'ipfs://startingData/',".json");

        erc721Facet.erc721setBullsContractAddress(address(this));

        // Retrieve the needed addresses from the erc721Facet
        (usdcTokenContract, royaltiesWallet, procurementWallet) = erc721Facet.erc721getWalletsForExternalContract();


    }


    function mint(uint256 _rarity, address _addressToMintTo) external nonReentrant {
    
        if (_rarity < 0 || _rarity > 6) {
            revert("Number not within rarity Range");
        }
      
        uint256 _mintCost = getCostAndMintEligibility(_rarity);

        // if _mintCost is zero, either minting is not live or rarity is sold out. 
        if (_mintCost == 0 ) {revert("Minting is not live or this rarity is sold out");}

        // Transfer usdc
        IERC20(usdcTokenContract).safeTransferFrom(_addressToMintTo, diamondAddress, _mintCost);


        erc721Facet.mintBull(_rarity, _addressToMintTo);

    }




    function mintOTC(uint256 _rarity, address _addressToMintTo) external nonReentrant {
    
        if (_rarity < 0 || _rarity > 6) {
            revert("Number not within rarity Range");
        }

        if(_msgSender() != procurementWallet) {revert("must be procurement wallet");}
      
        uint256 _mintCost = getCostAndMintEligibility(_rarity);

        // if _mintCost is zero, either minting is not live or rarity is sold out. 
        if (_mintCost == 0 ) {revert("Minting is not live or this rarity is sold out");}


        erc721Facet.mintBull(_rarity, _addressToMintTo);

    }








    // paper.xyz check for minting
    function checkClaimEligibility(uint256 _rarity, uint256 _quantity) external view returns (string memory) {
        uint256 result = getCostAndMintEligibility(_rarity);
        if (_quantity != 1) {
            return "Only 1 mint per tx";
        } else if (result == 0) {
            return "Mint is not Live or Rarity sold is out";
        }
        return "";
    }


   /**
     * @dev Return the total price for the mint transaction if still available and return 0 if not allowed.
     */
    function getCostAndMintEligibility(uint256 _rarity) public view returns (uint256) {
        return erc721Facet.getCostAndMintEligibilityOfBulls(_rarity);
    }



    function getAvailableFreeGemTokenMints() public view returns (uint256) {
        
        return erc721Facet.erc721getAvailableFreeGemTokenMints(_msgSender());
    }


    function name() public view override returns (string memory) {
        return erc721Facet.erc721name();
    }

    function symbol() public view override returns (string memory) {
        return erc721Facet.erc721symbol();
    }  


    function _baseURI() internal view override returns (string memory) {
        return erc721Facet.erc721baseURI();
    }


    function _getBaseExtension() internal view returns (string memory) {
        return erc721Facet.erc721baseExtension();
    }


    /**
     * @dev See {IERC721Enumerable-totalSupply}.
     */
    function totalSupply() public view override returns (uint256) {
        return erc721Facet.erc721totalSupply();
    }

    /**
     * @dev See {IERC721Enumerable-totalSupply}.
     */
    function walletOfOwner(address _owner) public view returns (uint256[] memory) {
        return erc721Facet.erc721walletOfOwner(_owner);
    }

    /**
    * @dev See {IERC721Enumerable-tokenOfOwnerByIndex}.
    */
    function tokenOfOwnerByIndex(address _owner, uint256 _index) public view override returns (uint256) {
        return erc721Facet.erc721tokenOfOwnerByIndex(_owner, _index);
    }


    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return erc721Facet.erc721tokenURI(tokenId);
    }


    function isContractApprovedToMint() external view returns (bool) {
        return erc721Facet.isExternalContractApprovedForERC721Minting();
    }


    /**
    * @dev See {IERC721Metadata-erc721symbol}.
    */
    function isMintingLive() external view returns (bool) {
        return erc721Facet.erc721mintingLive();
    }


    function supportsInterface(bytes4 interfaceId) public view override(ERC721Enumerable, IERC165) returns (bool) {
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
    }

        // IERC2981
    function royaltyInfo(uint256 _tokenId, uint256 _salePrice) external view override returns (address, uint256 royaltyAmount) {
        _tokenId; //silence solc warning
        royaltyAmount = (_salePrice * 5) / 100; // 5%

        return (royaltiesWallet, royaltyAmount);
    }







  /*
    IERC721 interface
  */

    function balanceOf(address _owner) public view override(ERC721,IERC721) returns (uint256) {
        return erc721Facet.erc721balanceOf(_owner);
    }

    function ownerOf(uint256 tokenId) public view override(ERC721,IERC721) returns (address) {
        return erc721Facet.erc721ownerOf(tokenId);
    }


    function approve(address to, uint256 tokenId) public override(ERC721,IERC721) {
        erc721Facet.erc721approve( _msgSender(), to, tokenId);
    }


    function setApprovalForAll(address operator, bool approved) public override(ERC721,IERC721)  {
        erc721Facet.erc721setApprovalForAll(_msgSender(), operator, approved);
    }

    function getApproved(uint256 tokenId) public override(ERC721,IERC721) view returns (address) {
        return erc721Facet.erc721getApproved(tokenId);
    }

    function isApprovedForAll(address _owner, address operator) public override(ERC721,IERC721) view returns (bool) {
         return erc721Facet.erc721isApprovedForAll(_owner, operator);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) public override(ERC721,IERC721) {
        erc721Facet.erc721safeTransferFrom(_msgSender(), from, to, tokenId);
    }


    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) public override(ERC721, IERC721) {
        erc721Facet.erc721safeTransferFrom(_msgSender(),from, to, tokenId, data);
    }


    function transferFrom(address from, address to, uint256 tokenId) public override(ERC721,IERC721) {
        erc721Facet.erc721transferFrom(_msgSender(),from, to, tokenId);
    }



    function getApprovalHistory() public view returns (LibSharedStructs.IndividualApprovalRecord[] memory individualApprovals, LibSharedStructs.OperatorApprovalRecord[] memory operatorApprovals) {
        return erc721Facet.erc721getApprovalHistory(_msgSender());
    }



    // ADMIN
    function setMintingLive(bool _bool) external onlyOwner {
        // Check if all required addresses are set
        if (usdcTokenContract == address(0) || diamondAddress == address(0) || procurementWallet == address(0) || royaltiesWallet == address(0)) {
            revert("All address must be set first");
        }

        if (erc721Facet.isExternalContractApprovedForERC721Minting() == false) {
            revert("not set to mint yet on the ERC721 facet yet");
        }

        erc721Facet.erc721setMintingLive(_bool);
    }

    function setContractAddresses(address _usdcContract, address _procurementWallet, address _royaltiesWallet)  external onlyOwner {
       
        usdcTokenContract = _usdcContract;
        procurementWallet = _procurementWallet;
        royaltiesWallet = _royaltiesWallet;

    }



    function setBaseURI(string memory _newBaseURI) external onlyOwner {
        erc721Facet.erc721setBaseUri(_newBaseURI);
    }

}
