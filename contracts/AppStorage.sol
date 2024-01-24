// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./interfaces/IDiamondCut.sol";

import "./libraries/LibSharedStruct.sol";


////////////////
//// Vaults ////
////////////////
struct Vault {
    string name;
    uint256 totalSalt;
    uint256 totalRewardPoints;
    uint256 withdrawableAmount;
    uint256 disperableProfitAmount;
    uint256 lifetimeRewardAmount; // total rewards over life of vault
    address walletAddress;
    address approvedControlWallet;  // this wallet is the wallet that is allowed to deposit and withdraw from this vault
    mapping(uint256 => uint256) depositedSaltAmount; // NFT ID => salt grain count deposited into this vault
    mapping(uint256 => uint256) nftVaultCompoundingRate; // NFT ID -> Compounding Rate
    mapping(uint256 => uint256) nftRewardPoints; // NFT ID -> Reward Points   This gets deleted every rewarding session
    mapping(uint256 => uint256) continuousMonthsCompounding; //  Token ID => Number of continuous months 100% compounding
    mapping(uint256 => bool) bonusEligibleForVaultDeposit; // Token ID => Bonus Eligibility Flag
}


///////////////////
//// Bull Info ////
///////////////////

struct RarityProperties {
    uint256 rarity;
    uint256 mintCost;
    uint256 rewardMultiplier; // Multiplier scaled by 100 to avoid decimals
    uint256 currentIndex;
    uint256 lastIndex;
}

struct Bull {
    uint256 rarity;
    uint256 grains;
    uint256 pillars;
    uint256 sheets;
    uint256 cubes;
    uint256 totalVaultedSalt; // Total salt contributions across all vaults
}




////////////////////////
//// Gem Stone Info ////
//////////////////////// 


struct GemToken {
    uint256 index;
    uint256 value;
    string color;
}



//////// AUM ///////
struct StartupBonus {
    uint256 bonusCapStage1;
    uint256 bonusCapStage2;
    uint256 bonusCapStage3;
    uint256 bonusCapStage4;
    uint256 bonusCapStage5;
    uint256 stage1Bonus;
    uint256 stage2Bonus;
    uint256 stage3Bonus;
    uint256 stage4Bonus;
    uint256 stage5Bonus;
}




struct AppStorage {


    // ====== wallets ===== //
    address usdcTokenContract;
    address saltVaultTokenContract;
    address coreTeamWallet;
    address royaltiesWallet;
    address procurementWallet;
    address gemTokenBurnWallet;
    address cloudWallet;   // wallet allowed to withdraw from contract and talk to binance account via API's


    // ============= Bank ================== // 

    mapping(address => uint256) bankRewardBalance;  // all rewards and profits are held here for NFT holders for vaults and games 

    uint256 coreTeamBalance;
    uint256 vaultHoldingBalance;
    uint256 totalRewardBalance;
    uint256 vaultCouncilBalance;
    uint256 gemTokenChallangeBalance; // amount that will be dispersed to winners of the Gem Token Challenge Game
    uint256 gemTokenSalesBalance;     // amount of USDC when gemTokens are bought with USDC and not with credits after minting bulls




  
    // ====== ReentrancyGuard Flag ===== //

    uint256 mintBullReentrancyFlag;
    uint256 buySaltReentrancyFlag;
    uint256 burnAndClaimSpotForGemTokenChallengeFlag;
    uint256 allocateSaltToVaultReentrancyFlag;
    uint256 reservedFlag3;
    uint256 reservedFlag4;
    uint256 reservedFlag5;
    uint256 reservedFlag6;
    uint256 reservedFlag7;
    uint256 reservedFlag8;
    uint256 reservedFlag9;
    uint256 reservedFlag10;
    uint256 reservedFlag11;
    uint256 reservedFlag12;
    uint256 reservedFlag13;
    uint256 reservedFlag14;


    // ========== Bulls  ========== //

    address bullsExternalContractAddress;
    mapping(uint256 => RarityProperties) rarityProperties;
    mapping(uint256 => Bull) bulls;
    

   // ========== Gem Tokens  ========== //

    address gemTokensExternalContractAddress;
    mapping(uint256 => GemToken) gemTokens;
    uint256 gemTokenTotalSupply;
    uint256 gemTokenCurrentIndex;
    uint256 gemTokenMintCost; 

    mapping(string => bool) gemTokenValidColors;     // list of valid color for each Gem Stone Token
    
    mapping(address => uint256) gemTokenMintCredits;  // address => free mints lefts

    uint256[] shuffledGemTokenIndices;

    // Game Info 
    uint256  gemTokenWinningValue;
    string  gemTokenePrimaryColor;
    uint256  gemTokenGameStartDate;
    uint256  gemTokeneNumberOfWinningSpots;
    address[] gemTokenChallengeWinners;     // address of winners of the current game
    uint256[] gemTokenPayoutPerPosition;    // payouts per position, 1st, 2nd, 3rd
    bool  isGemTokenGameOpen;
    bool  isGemTokenGameStillActive;
    uint256  gemTokenPrimaryColorWindow;  // Days of how long the primary window only before all tokens are allowed to win

    mapping(address => bool) authorizedAdminForGemTokenFacet;

    // ========== Salt  ========== //


    // price for the salt type in USDC
    uint256 grainCost;
    uint256 pillarCost;
    uint256 sheetCost;
    uint256 cubeCost;
    // number of grains in each type, IE. a pillar == 10 grains, cubes == 1000 grains
    uint256 grainCount;
    uint256 pillarCount;
    uint256 sheetCount;
    uint256 cubeCount;


    // ========== Vaults ========== //


    Vault[] vaults;
    mapping(uint256 => bool) allowedCompoundingRates;

    mapping(uint256 => uint256[]) totalVaultRewardPointsForCycle;  // Keeps track of total reward points for each cycle as a receipt   

    mapping(uint256 => uint256[]) totalVaultProfitForCycle;  // Keeps track of profits deposited in the vault over time as a receipt   
    
    // ========== Vault Council ========== //
    uint256 vaultCouncilCount;
    uint256[] vaultCouncil;
    mapping(uint256 => bool) indexInVaultCouncil;


    // ========== Counters ========== //
    uint256 aum;
    uint256 globalPayoutAmount;
    
    // ========== AUM Bonuses ========== //

    StartupBonus bonusDetails;

    // ======== ERC721 NFT information ===========

    // has the contract been initialized
    mapping(address => bool) erc721init;

    // is external ERC721 contract allowed? 
    mapping(address => bool) erc721authorizedExternalContracts;

    // Is mintingLive from external contract? 
    mapping(address => bool) erc721mintingLive;

    // baseURI
    mapping(address => string) erc721baseURI;
    
    // base Extension 
    mapping(address => string) erc721baseExtension;
    
    // Token name 
    mapping(address => string) erc721name;
    
    // Token symbol
    mapping(address => string) erc721symbol;
    
    // Mapping from token ID to owner address
    mapping(address => mapping(uint256 => address)) erc721owners;
    
    // Mapping owner address to token count
    mapping(address => mapping(address => uint256)) erc721balances;
    
    // Mapping from token ID to approved address
    mapping(address => mapping(uint256 => address)) erc721tokenApprovals;
    
    // Mapping from owner to operator approvals
    mapping(address => mapping(address => mapping(address => bool))) erc721operatorApprovals;
   

    // ======== ERC721 Enumeration extentsion ===========

    // Mapping from owner to list of owned token IDs
    mapping(address => mapping(address => mapping(uint256 => uint256))) erc721ownedTokens;  
    // Mapping from token ID to index of the owner tokens list
    mapping(address => mapping(uint256 => uint256)) erc721ownedTokensIndex;
    // Array with all token ids, used for enumeration
    mapping(address => uint256[]) erc721allTokens;
    // Mapping from token id to position in the allTokens array
    mapping(address => mapping(uint256 => uint256)) erc721allTokensIndex;
    
    // custom approval mapping 
    // Mapping from token ID to a list of individual approvals
    mapping(address => mapping(uint256 => LibSharedStructs.IndividualApprovalRecord[])) erc721tokenIndividualApprovals;

    // Mapping from owner address to a list of operator approvals
    mapping(address => mapping(address => LibSharedStructs.OperatorApprovalRecord[]))  erc721ownerOperatorApprovals;

 


    // ======== Salt Vault Token Information ===========




}

// contract Modifiers {

//      modifier onlyProcurementWallet() {
//         require(s.procurementWallet == msg.sender, "Caller is not the owner");
//         _;
//     }
// }
