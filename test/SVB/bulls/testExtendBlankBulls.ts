/* global describe it before ethers */

import { getSelectors, FacetCutAction, removeSelectors, findAddressPositionInFacets } from "../../../scripts/diamond"
import { deploy } from "../../../scripts/deploy"
import { assert, expect } from "chai"
import { ethers, network } from "hardhat"
import { Contract } from "ethers"
import { Network } from "@ethersproject/providers"

describe("InitializationTest", async function () {
    let diamondAddress: string
    let diamondCutFacet: Contract
    let diamondLoupeFacet: Contract
    let ownershipFacet: Contract
    let tx
    let receipt
    let result
    const addresses: string[] = []
    const expectedSymbol: string = "SVB"
    const expectedName: string = "Salt Vault Bulls"
    const data = "0x42"

    let erc721Facet: Contract
    let saltRepositoryFacet: Contract
    let infoGetterFacet: Contract
    let adminSetterFacet: Contract
    let saltVaultBulls: Contract
    let svbGemTokens: Contract
    let svbDefenseTokens: Contract
    let mockedERC721Enumerable: Contract
    let mockedUSDC: Contract
    let saltVaultToken: any
    let bullsFacet: any
    let gemTokensFacet: any
    let defenseTokensFacet: any

    let owner: any
    let newOwner: any
    let approved: any
    let operator: any
    let coreTeamWallet: any
    let royaltiesWallet: any
    let procurementWallet: any
    let badActorWallet: any
    let mockedExchange: any
    let signers: any

    let gemTokenBurnWallet: any

    before(async function () {
        diamondAddress = await deploy()
        console.log({ diamondAddress })
        diamondCutFacet = await ethers.getContractAt("DiamondCutFacet", diamondAddress)
        diamondLoupeFacet = await ethers.getContractAt("DiamondLoupeFacet", diamondAddress)
        ownershipFacet = await ethers.getContractAt("OwnershipFacet", diamondAddress)
        erc721Facet = await ethers.getContractAt("ERC721Facet", diamondAddress)
        saltRepositoryFacet = await ethers.getContractAt("SaltRepositoryFacet", diamondAddress)
        infoGetterFacet = await ethers.getContractAt("InfoGetterFacet", diamondAddress)
        adminSetterFacet = await ethers.getContractAt("AdminSetterFacet", diamondAddress)
        bullsFacet = await ethers.getContractAt("BullsFacet", diamondAddress)
        gemTokensFacet = await ethers.getContractAt("GemTokensFacet", diamondAddress)
        defenseTokensFacet = await ethers.getContractAt("DefenseTokensFacet", diamondAddress)

        // Get a list of available signers
        signers = await ethers.getSigners()

        owner = signers[0]
        newOwner = signers[1]
        approved = signers[2]
        operator = signers[3]

        coreTeamWallet = signers[5]
        royaltiesWallet = signers[6]
        procurementWallet = signers[7]
        gemTokenBurnWallet = signers[8]
        mockedExchange = signers[30]
        saltVaultToken = signers[29]

        // MockedUSDC
        const MockedUSDC = await ethers.getContractFactory("MockedUSDC", signers[30])
        mockedUSDC = await MockedUSDC.deploy(100000000 * 10 ** 6)
        await mockedUSDC.waitForDeployment()

        // set contract address on the diamond
        await adminSetterFacet.connect(signers[0]).setAddresses(mockedUSDC.target, coreTeamWallet.address, royaltiesWallet.address, procurementWallet.address, gemTokenBurnWallet.address)

        // ERC721 External  Salt Vault Bulls
        const SaltVaultBulls = await ethers.getContractFactory("SaltVaultBulls")
        saltVaultBulls = await SaltVaultBulls.deploy(diamondAddress)
        await saltVaultBulls.waitForDeployment()

        // ERC721 External  Defense Tokens
        const SVB_DefenseTokens = await ethers.getContractFactory("SVB_DefenseTokens")
        svbDefenseTokens = await SVB_DefenseTokens.deploy(diamondAddress)
        await svbDefenseTokens.waitForDeployment()

        // ERC721 External  Gem Tokens
        const SVB_GemTokens = await ethers.getContractFactory("SVB_GemTokens")
        svbGemTokens = await SVB_GemTokens.deploy(diamondAddress)
        await svbGemTokens.waitForDeployment()

        // Transfer tokens from signers[30] to signers[1] through signers[17]
        const amount = ethers.parseUnits("10000", 6) // Assuming MockedUSDC uses 6 decimal places

        for (let i = 10; i <= 20; i++) {
            await mockedUSDC.connect(signers[30]).transfer(signers[i].address, amount)
        }

        // gemTokenChallengeFacet

        let shuffledBattleStones = [1005, 525, 2705, 926, 2582, 2162, 1394, 1057, 2704, 1522, 491, 2885, 2107, 1179, 683, 2017, 230, 1285, 166, 1678]

        defenseTokensFacet.connect(owner).addShuffledIndexesBatchBattleStones(shuffledBattleStones)

        let shuffledBattleShields = [5505, 3221, 5607, 4043, 3384, 3415, 3366, 4075, 4343, 4451, 3872, 5652, 4999, 5265, 3061, 3129, 4091, 3588, 5853, 5968]

        defenseTokensFacet.connect(owner).addShuffledIndexesBatchBattleShields(shuffledBattleShields)

        let shuffledLuckTokens = [6929, 6538, 6014, 6814, 6292, 6276, 6255, 6513, 6611, 6897, 6720, 6171, 6301, 6505, 6688, 6447, 6594, 6585, 6266, 6193]

        defenseTokensFacet.connect(owner).addShuffledIndexesBatchLuckTokens(shuffledLuckTokens)
    })

    it("should have seven facets -- call to facetAddresses function", async () => {
        for (const address of await diamondLoupeFacet.facetAddresses()) {
            addresses.push(address)
        }
        console.log({ addresses })
        assert.equal(addresses.length, 13)
    })

    it("Test p10 has 10,000 mocked USDC and contracts have zero", async function () {
        expect(await mockedUSDC.balanceOf(signers[10])).to.equal(10_000 * 10 ** 6)

        // assert saltVaultBulls contract USDC balance is zero
        expect(await mockedUSDC.balanceOf(mockedUSDC.target)).to.equal(0)

        // assert diamondAddress contract USDC balance is zero
        expect(await mockedUSDC.balanceOf(diamondAddress)).to.equal(0)

        // assert erc721Facet contract USDC balance is zero
        expect(await mockedUSDC.balanceOf(saltVaultBulls.target)).to.equal(0)
    })

    it("Confirm Contract addresses", async function () {
        // console.log("diamondAddress:", diamondAddress)
        // console.log("procurementWallet:", procurementWallet.address)
        // console.log("royaltiesWallet:", royaltiesWallet.address)
        // console.log("coreTeamWallet:", coreTeamWallet.address)
        // console.log("mockedUSDC:", mockedUSDC.target)
        // console.log("mockedExchange:", mockedExchange.address)
        // console.log("saltVaultToken:", saltVaultToken.address)

        saltVaultToken

        expect(await infoGetterFacet.getUsdcContractAddress()).to.equal(mockedUSDC.target)
        expect(await infoGetterFacet.getCoreTeamWalletAddress()).to.equal(coreTeamWallet)
        expect(await infoGetterFacet.getRoyaltiesWalletAddress()).to.equal(royaltiesWallet.address)
        expect(await infoGetterFacet.getProcurementWalletAddress()).to.equal(procurementWallet.address)
    })

    it("Confirm Contract addresses", async function () {
        console.log("diamondAddress:", diamondAddress)
        console.log("procurementWallet:", procurementWallet.address)
        console.log("royaltiesWallet:", royaltiesWallet.address)
        console.log("coreTeamWallet:", coreTeamWallet.address)
        console.log("mockedUSDC:", mockedUSDC.target)

        expect(await saltVaultBulls.usdcTokenContract()).to.equal(mockedUSDC.target)
        expect(await saltVaultBulls.diamondAddress()).to.equal(diamondAddress)
        expect(await saltVaultBulls.procurementWallet()).to.equal(procurementWallet.address)
        // expect(await saltVaultBulls.royaltiesWallet()).to.equal(royaltiesWallet.address)
    })

    it("Confirm Salt Vault Bulls External Contract is set on the diamond", async function () {
        expect(await saltVaultBulls.isContractApprovedToMint()).to.equal(false)

        await adminSetterFacet.setAuthorizedExternalContractsForERC721Facet(saltVaultBulls.target, true)

        expect(await saltVaultBulls.isContractApprovedToMint()).to.equal(true)
    })

    it("Set external ERC721 contract to mint Bulls on the ERC721Facet", async function () {
        expect(await saltVaultBulls.name()).to.equal("Salt Vault Bulls")
        expect(await saltVaultBulls.symbol()).to.equal("SVB")
    })

    it("Confirm minting is not allowed while flag is false", async function () {
        await expect(saltVaultBulls.connect(signers[10]).mint(0, signers[10].address)).to.revertedWith("Minting is not live or this rarity is sold out")
    })

    it("Change minting Status to live", async function () {
        expect(await saltVaultBulls.getCostAndMintEligibility(0)).to.equal(0) // should return zero when set to false
        expect(await saltVaultBulls.isMintingLive()).to.equal(false)
        expect(await saltVaultBulls.checkClaimEligibility(0, 1)).to.equal("Mint is not Live or Rarity sold is out")
        expect(await saltVaultBulls.checkClaimEligibility(1, 1)).to.equal("Mint is not Live or Rarity sold is out")
        expect(await saltVaultBulls.checkClaimEligibility(2, 1)).to.equal("Mint is not Live or Rarity sold is out")
        expect(await saltVaultBulls.checkClaimEligibility(3, 1)).to.equal("Mint is not Live or Rarity sold is out")
        expect(await saltVaultBulls.checkClaimEligibility(4, 1)).to.equal("Mint is not Live or Rarity sold is out")
        expect(await saltVaultBulls.checkClaimEligibility(5, 1)).to.equal("Mint is not Live or Rarity sold is out")
        expect(await saltVaultBulls.checkClaimEligibility(6, 1)).to.equal("Mint is not Live or Rarity sold is out")
        expect(await saltVaultBulls.checkClaimEligibility(0, 2)).to.equal("Only 1 mint per tx")
        expect(await saltVaultBulls.checkClaimEligibility(1, 2)).to.equal("Only 1 mint per tx")
        expect(await saltVaultBulls.checkClaimEligibility(2, 2)).to.equal("Only 1 mint per tx")
        expect(await saltVaultBulls.checkClaimEligibility(3, 2)).to.equal("Only 1 mint per tx")
        expect(await saltVaultBulls.checkClaimEligibility(4, 2)).to.equal("Only 1 mint per tx")
        expect(await saltVaultBulls.checkClaimEligibility(5, 2)).to.equal("Only 1 mint per tx")
        expect(await saltVaultBulls.checkClaimEligibility(6, 2)).to.equal("Only 1 mint per tx")

        await saltVaultBulls.connect(owner).setMintingLive(true)

        expect(await saltVaultBulls.getCostAndMintEligibility(0)).to.equal(2500 * 10 ** 6) // should return zero when set to false
        expect(await saltVaultBulls.getCostAndMintEligibility(1)).to.equal(1000 * 10 ** 6) // should return zero when set to false
        expect(await saltVaultBulls.getCostAndMintEligibility(2)).to.equal(750 * 10 ** 6) // should return zero when set to false
        expect(await saltVaultBulls.getCostAndMintEligibility(3)).to.equal(500 * 10 ** 6) // should return zero when set to false
        expect(await saltVaultBulls.getCostAndMintEligibility(4)).to.equal(350 * 10 ** 6) // should return zero when set to false
        expect(await saltVaultBulls.getCostAndMintEligibility(5)).to.equal(200 * 10 ** 6) // should return zero when set to false
        expect(await saltVaultBulls.getCostAndMintEligibility(6)).to.equal(100 * 10 ** 6) // should return zero when set to false

        expect(await saltVaultBulls.isMintingLive()).to.equal(true)
        expect(await saltVaultBulls.checkClaimEligibility(0, 1)).to.equal("")
        expect(await saltVaultBulls.checkClaimEligibility(1, 1)).to.equal("")
        expect(await saltVaultBulls.checkClaimEligibility(2, 1)).to.equal("")
        expect(await saltVaultBulls.checkClaimEligibility(3, 1)).to.equal("")
        expect(await saltVaultBulls.checkClaimEligibility(4, 1)).to.equal("")
        expect(await saltVaultBulls.checkClaimEligibility(5, 1)).to.equal("")
        expect(await saltVaultBulls.checkClaimEligibility(6, 1)).to.equal("")
    })

    let costToMintEachNFT = 2500 * 10 ** 6

    it("Test p10 minting a Diamond Bull", async function () {
        let tier = 0 //

        let person = signers[10]

        // Amount to approve (make sure this is sufficient for the mint operation)
        const amountToApprove = await saltVaultBulls.getCostAndMintEligibility(tier)

        // assert paper.xyz call works
        expect(await amountToApprove).to.equal(costToMintEachNFT)

        // Approve the proxySVB contract to spend tokens
        await mockedUSDC.connect(person).approve(saltVaultBulls.target, costToMintEachNFT)

        await saltVaultBulls.connect(person).mint(tier, person.address)
    })

    it("Test balances after mint", async function () {
        expect(await mockedUSDC.balanceOf(signers[10])).to.equal(7_500 * 10 ** 6)

        console.log("mockedUSDC balance of p10:", await mockedUSDC.balanceOf(signers[10]))
        console.log("mockedUSDC balance of saltVaultBulls:", await mockedUSDC.balanceOf(saltVaultBulls.target))
        console.log("mockedUSDC balance of dimaond:", await mockedUSDC.balanceOf(diamondAddress))
        console.log("mockedUSDC balance of saltVaultBulls:", await mockedUSDC.balanceOf(saltVaultBulls.target))

        // assert saltVaultBulls contract USDC balance is zero
        expect(await mockedUSDC.balanceOf(saltVaultBulls.target)).to.equal(0)

        // assert diamondAddress contract USDC balance is zero
        expect(await mockedUSDC.balanceOf(diamondAddress)).to.equal(costToMintEachNFT)
    })

    it("Test Contract balances after this mint", async function () {
        let coreTeamBalance = await infoGetterFacet.getCoreTeamBalance()
        let vaultHoldingBalance = await infoGetterFacet.getVaultHoldingBalance()
        let totalRewardBalance = await infoGetterFacet.getTotalRewardBalance()
        let VaultCouncilBalance = await infoGetterFacet.getVaultCouncilBalance()

        console.log("CoreTeamBalance:", coreTeamBalance)
        console.log("vaultHoldingBalance:", vaultHoldingBalance)
        console.log("totalRewardBalance:", totalRewardBalance)
        console.log("VaultCouncilBalance:", VaultCouncilBalance)

        expect(Number(coreTeamBalance) + Number(vaultHoldingBalance)).to.equal(2500 * 10 ** 6)

        expect(Number(coreTeamBalance)).to.equal(2500 * 10 ** 6 * 0.1)
        expect(Number(vaultHoldingBalance)).to.equal(2500 * 10 ** 6 * 0.9)
    })

    it("Test Extension of Blank Bulls Last Index", async function () {
        let bullsRarityInfo = await bullsFacet.getRarityInformationForBullType(0)

        expect(Number(bullsRarityInfo[0])).to.equal(2500 * 10 ** 6)
        expect(Number(bullsRarityInfo[1])).to.equal(300)
        expect(Number(bullsRarityInfo[2])).to.equal(2) // already minted 1
        expect(Number(bullsRarityInfo[3])).to.equal(50)

        bullsRarityInfo = await bullsFacet.getRarityInformationForBullType(1)

        expect(Number(bullsRarityInfo[0])).to.equal(1000 * 10 ** 6)
        expect(Number(bullsRarityInfo[1])).to.equal(200)
        expect(Number(bullsRarityInfo[2])).to.equal(51)
        expect(Number(bullsRarityInfo[3])).to.equal(500)

        bullsRarityInfo = await bullsFacet.getRarityInformationForBullType(2)

        expect(Number(bullsRarityInfo[0])).to.equal(750 * 10 ** 6)
        expect(Number(bullsRarityInfo[1])).to.equal(175)
        expect(Number(bullsRarityInfo[2])).to.equal(501)
        expect(Number(bullsRarityInfo[3])).to.equal(2000)

        bullsRarityInfo = await bullsFacet.getRarityInformationForBullType(3)

        expect(Number(bullsRarityInfo[0])).to.equal(500 * 10 ** 6)
        expect(Number(bullsRarityInfo[1])).to.equal(150)
        expect(Number(bullsRarityInfo[2])).to.equal(2001)
        expect(Number(bullsRarityInfo[3])).to.equal(4000)

        bullsRarityInfo = await bullsFacet.getRarityInformationForBullType(4)

        expect(Number(bullsRarityInfo[0])).to.equal(350 * 10 ** 6)
        expect(Number(bullsRarityInfo[1])).to.equal(130)
        expect(Number(bullsRarityInfo[2])).to.equal(4001)
        expect(Number(bullsRarityInfo[3])).to.equal(6000)

        bullsRarityInfo = await bullsFacet.getRarityInformationForBullType(5)

        expect(Number(bullsRarityInfo[0])).to.equal(200 * 10 ** 6)
        expect(Number(bullsRarityInfo[1])).to.equal(115)
        expect(Number(bullsRarityInfo[2])).to.equal(6001)
        expect(Number(bullsRarityInfo[3])).to.equal(8000)

        bullsRarityInfo = await bullsFacet.getRarityInformationForBullType(6)

        expect(Number(bullsRarityInfo[0])).to.equal(100 * 10 ** 6)
        expect(Number(bullsRarityInfo[1])).to.equal(100)
        expect(Number(bullsRarityInfo[2])).to.equal(8001)
        expect(Number(bullsRarityInfo[3])).to.equal(10000)

        console.log("bullsRarityInfo:", bullsRarityInfo)
    })

    it(" Extension should fail if its lower than the current amount ", async function () {
        await expect(adminSetterFacet.connect(owner).extendBlankBullsLastIndex(990)).to.revertedWith("must be more than current lastIndex")
    })

    it(" Extension should fail if called by wrong person ", async function () {
        await expect(adminSetterFacet.connect(signers[10]).extendBlankBullsLastIndex(990)).to.revertedWith("LibDiamond: Must be contract owner")
    })

    it(" Extension works by correct person to 11750 fail if called by wrong person ", async function () {
        await adminSetterFacet.connect(owner).extendBlankBullsLastIndex(11750)
    })

    it("Test information after extensions", async function () {
        let bullsRarityInfo = await bullsFacet.getRarityInformationForBullType(0)

        expect(Number(bullsRarityInfo[0])).to.equal(2500 * 10 ** 6)
        expect(Number(bullsRarityInfo[1])).to.equal(300)
        expect(Number(bullsRarityInfo[2])).to.equal(2) // already minted 1
        expect(Number(bullsRarityInfo[3])).to.equal(50)

        bullsRarityInfo = await bullsFacet.getRarityInformationForBullType(1)

        expect(Number(bullsRarityInfo[0])).to.equal(1000 * 10 ** 6)
        expect(Number(bullsRarityInfo[1])).to.equal(200)
        expect(Number(bullsRarityInfo[2])).to.equal(51)
        expect(Number(bullsRarityInfo[3])).to.equal(500)

        bullsRarityInfo = await bullsFacet.getRarityInformationForBullType(2)

        expect(Number(bullsRarityInfo[0])).to.equal(750 * 10 ** 6)
        expect(Number(bullsRarityInfo[1])).to.equal(175)
        expect(Number(bullsRarityInfo[2])).to.equal(501)
        expect(Number(bullsRarityInfo[3])).to.equal(2000)

        bullsRarityInfo = await bullsFacet.getRarityInformationForBullType(3)

        expect(Number(bullsRarityInfo[0])).to.equal(500 * 10 ** 6)
        expect(Number(bullsRarityInfo[1])).to.equal(150)
        expect(Number(bullsRarityInfo[2])).to.equal(2001)
        expect(Number(bullsRarityInfo[3])).to.equal(4000)

        bullsRarityInfo = await bullsFacet.getRarityInformationForBullType(4)

        expect(Number(bullsRarityInfo[0])).to.equal(350 * 10 ** 6)
        expect(Number(bullsRarityInfo[1])).to.equal(130)
        expect(Number(bullsRarityInfo[2])).to.equal(4001)
        expect(Number(bullsRarityInfo[3])).to.equal(6000)

        bullsRarityInfo = await bullsFacet.getRarityInformationForBullType(5)

        expect(Number(bullsRarityInfo[0])).to.equal(200 * 10 ** 6)
        expect(Number(bullsRarityInfo[1])).to.equal(115)
        expect(Number(bullsRarityInfo[2])).to.equal(6001)
        expect(Number(bullsRarityInfo[3])).to.equal(8000)

        bullsRarityInfo = await bullsFacet.getRarityInformationForBullType(6)

        expect(Number(bullsRarityInfo[0])).to.equal(100 * 10 ** 6)
        expect(Number(bullsRarityInfo[1])).to.equal(100)
        expect(Number(bullsRarityInfo[2])).to.equal(8001)
        expect(Number(bullsRarityInfo[3])).to.equal(11750)

        console.log("bullsRarityInfo:", bullsRarityInfo)
    })
})
