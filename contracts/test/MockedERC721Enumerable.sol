// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/Context.sol";

import "../interfaces/IERC721Errors.sol";

contract MockedERC721Enumerable is ERC721Enumerable, Ownable, ReentrancyGuard, IERC2981, IERC721Errors {

    using SafeERC20 for IERC20;
    using Strings for uint256;
 

    //////////////////
    //// NFT INFO ////
    //////////////////
    string private baseURI;
    string private baseExtension;

    /////////////////////
    ////  Addresses /////
    /////////////////////
    address public usdcTokenContract;
    address public saltVaultToken;
    address public coreTeamWallet;
    address public royaltiesWallet;
    address public procurementWallet;


    // Flags

    bool mintLive;


    struct RarityProperties {
        uint256 mintCost;
        uint256 multiplier; // Multiplier scaled by 100 to avoid decimals
        uint256 currentIndex;
        uint256 lastIndex;
    }

    mapping(uint256 => RarityProperties) public rarityProperties;

    ///////////////////
    //// Bull Info ////
    ///////////////////
    struct Bull {
        uint256 rarity;
        uint256 grains;
        uint256 pillars;
        uint256 sheets;
        uint256 cubes;
        uint256 bonusGrains;
        uint256 totalSaltContributions; // Total salt contributions across all vaults
    }

    mapping(uint256 => Bull) public bulls; // Token ID to Bull

    ///////////////////////


    constructor()
        ERC721('Salt Vault Bulls', 'SVB')
    {
      
        baseExtension = ".json";
        baseURI = "ipfs://startingData/";

        rarityProperties[0].currentIndex = 1;
        rarityProperties[1].currentIndex = 51;
        rarityProperties[2].currentIndex = 501;
        rarityProperties[3].currentIndex = 2001;
        rarityProperties[4].currentIndex = 4001;
        rarityProperties[5].currentIndex = 6001;
        rarityProperties[6].currentIndex = 8001;

        rarityProperties[0].lastIndex = 50;
        rarityProperties[1].lastIndex = 500;
        rarityProperties[2].lastIndex = 2000;
        rarityProperties[3].lastIndex = 4000;
        rarityProperties[4].lastIndex = 6000;
        rarityProperties[5].lastIndex = 8000;
        rarityProperties[6].lastIndex = 10000;

        rarityProperties[0].mintCost = 2500 * 10 ** 6;
        rarityProperties[1].mintCost = 1000 * 10 ** 6;
        rarityProperties[2].mintCost = 750 * 10 ** 6;
        rarityProperties[3].mintCost = 500 * 10 ** 6;
        rarityProperties[4].mintCost = 350 * 10 ** 6;
        rarityProperties[5].mintCost = 200 * 10 ** 6;
        rarityProperties[6].mintCost = 100 * 10 ** 6;


        rarityProperties[0].multiplier = 300;
        rarityProperties[1].multiplier = 200;
        rarityProperties[2].multiplier = 175;
        rarityProperties[3].multiplier = 150;
        rarityProperties[4].multiplier = 130;
        rarityProperties[5].multiplier = 115;
        rarityProperties[6].multiplier = 100;

    }



    /////////////////////////////////////////////////////////
    /////////////////////// Minting /////////////////////////
    /////////////////////////////////////////////////////////
    function mint(uint256 rarity, address _addressToMintTo) external {

        // get current index
        uint256 indexToMint = rarityProperties[rarity].currentIndex;

        require(indexToMint <= rarityProperties[rarity].lastIndex, "Tier is now minted out");

        require(!_exists(indexToMint), "ERC721: token already minted");
        require(_addressToMintTo != address(0), "ERC721: mint to the zero address");
        

        // update minting counter         
    
        uint256 tokenId = rarityProperties[rarity].currentIndex;
        if (tokenId > rarityProperties[rarity].lastIndex) { revert("No more tokens of this rarity");}
        _safeMint(_addressToMintTo, tokenId);
        rarityProperties[rarity].currentIndex++;


        // update salt wallt information for bull
        if (rarity == 0){
            bulls[indexToMint].rarity = 0;
            bulls[indexToMint].cubes = 3;
            bulls[indexToMint].sheets = 1;
            bulls[indexToMint].pillars = 1;
            bulls[indexToMint].grains = 6;
        } else if (rarity == 1) {
            bulls[indexToMint].rarity = 1;
            bulls[indexToMint].cubes = 1;
            bulls[indexToMint].sheets = 2;
            bulls[indexToMint].pillars = 2;
            bulls[indexToMint].grains = 3;
        } else if (rarity == 2) {
            bulls[indexToMint].rarity = 2;
            bulls[indexToMint].sheets = 8;
            bulls[indexToMint].pillars = 7;
            bulls[indexToMint].grains = 7;
        } else if (rarity == 3) {
            bulls[indexToMint].rarity = 3;
            bulls[indexToMint].sheets = 5;
            bulls[indexToMint].pillars = 8;
            bulls[indexToMint].grains = 3;
        } else if (rarity == 4) {
            bulls[indexToMint].rarity = 4;
            bulls[indexToMint].sheets = 4;
            bulls[indexToMint].pillars = 1;
            bulls[indexToMint].grains = 1;
        } else if (rarity == 5) {
            bulls[indexToMint].rarity = 5;
            bulls[indexToMint].sheets = 2;
            bulls[indexToMint].pillars = 3;
            bulls[indexToMint].grains = 3;
        } else if (rarity == 6) {
            bulls[indexToMint].rarity = 6;
            bulls[indexToMint].sheets = 1;
            bulls[indexToMint].pillars = 1;
            bulls[indexToMint].grains = 6;
        }

    }









   // METADATA
    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }




    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }



    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId),"ERC721Metadata: URI query for nonexistent token");
        string memory currentBaseURI = _baseURI();
        return bytes(currentBaseURI).length > 0 ? string(abi.encodePacked(currentBaseURI, tokenId.toString(), ".json")) : "";
    }


    // IERC2981
    function royaltyInfo(uint256 _tokenId, uint256 _salePrice) external view override returns (address, uint256 royaltyAmount) {
        _tokenId; //silence solc warning
        royaltyAmount = (_salePrice * 5) / 100; // 5%
        return (royaltiesWallet, royaltyAmount);
    }



    function setContractAddresses(address _usdcContract, address _procurementWallet, address _royaltiesWallet)  external onlyOwner {
       
        usdcTokenContract = _usdcContract;
        procurementWallet = _procurementWallet;
        royaltiesWallet = _royaltiesWallet;

    }



    /**
    * @dev Return the total price for the mint transaction if still available and return 0 if not allowed.  
    */
    function getCostAndMintEligibility(uint256 _rarity) public view returns (uint256) {
        if (rarityProperties[_rarity].currentIndex > rarityProperties[_rarity].lastIndex || !mintLive) {
            return 0;
        }

        uint256 transactionCost = rarityProperties[_rarity].mintCost;
        return transactionCost;
    }



    function setMintingLive(bool _mintLive) external onlyOwner{
        mintLive = _mintLive ;
    }


    /**
    * @dev See {IERC721Metadata-erc721symbol}.
    */
    function isMintingLive() external view returns (bool) {
        return mintLive;
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



    function getRarityInformationForBull(uint256 rarity) external view returns (uint256, uint256, uint256, uint256) {
        return (rarityProperties[rarity].mintCost, rarityProperties[rarity].multiplier, rarityProperties[rarity].currentIndex, rarityProperties[rarity].lastIndex );
    }



    function getBullInformation(uint256 _index) external view returns (uint256, uint256, uint256, uint256, uint256,uint256) {
        return (bulls[_index].rarity, bulls[_index].grains, bulls[_index].pillars, bulls[_index].sheets, bulls[_index].cubes, bulls[_index].totalSaltContributions );
    }



}
