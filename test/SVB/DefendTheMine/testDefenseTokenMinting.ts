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
    let gemTokenChallengeFacet: any
    let defenseFacet: any

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
        gemTokenChallengeFacet = await ethers.getContractAt("GemTokenChallengeFacet", diamondAddress)
        defenseFacet = await ethers.getContractAt("DefenseFacet", diamondAddress)

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

        // ERC721 External  Salt Vault Bulls
        const SVB_DefenseTokens = await ethers.getContractFactory("SVB_DefenseTokens")
        svbDefenseTokens = await SVB_DefenseTokens.deploy(diamondAddress)
        await svbDefenseTokens.waitForDeployment()

        // Transfer tokens from signers[30] to signers[1] through signers[17]
        const amount = ethers.parseUnits("10000", 6) // Assuming MockedUSDC uses 6 decimal places

        for (let i = 10; i <= 20; i++) {
            await mockedUSDC.connect(signers[30]).transfer(signers[i].address, amount)
        }

        // gemTokenChallengeFacet

        let shuffledBattleStones = [1005, 525, 2705, 926, 2582, 2162, 1394, 1057, 2704, 1522, 491, 2885, 2107, 1179, 683, 2017, 230, 1285, 166, 1678]

        defenseFacet.connect(owner).addShuffledIndexesBatchBattleStones(shuffledBattleStones)

        let shuffledBattleShields = [5505, 3221, 5607, 4043, 3384, 3415, 3366, 4075, 4343, 4451, 3872, 5652, 4999, 5265, 3061, 3129, 4091, 3588, 5853, 5968]

        defenseFacet.connect(owner).addShuffledIndexesBatchBattleShields(shuffledBattleShields)

        let shuffledLuckTokens = [6929, 6538, 6014, 6814, 6292, 6276, 6255, 6513, 6611, 6897, 6720, 6171, 6301, 6505, 6688, 6447, 6594, 6585, 6266, 6193]

        defenseFacet.connect(owner).addShuffledIndexesBatchLuckTokens(shuffledLuckTokens)

        // let redTokenData = [
        //     [1, 225, 1], // 225 tokens
        //     [226, 445, 2], // 220 tokens
        //     [446, 660, 3], // 215 tokens
        //     [661, 870, 4], // 210 tokens
        //     [871, 1075, 5], // 205 tokens
        //     [1076, 1275, 10], // 200 tokens
        //     [1276, 1470, 50], // 195 tokens
        //     [1471, 1660, 100], // 190 tokens
        //     [1661, 1845, 500], //185 tokens
        //     [1846, 2025, 1000], // 180 tokens
        //     [2026, 2200, 5000], // 175 tokens
        //     [2201, 2370, 10000], // 170 tokens
        //     [2371, 2500, 50000], // 130 tokens
        // ]
    })

    it("should have seven facets -- call to facetAddresses function", async () => {
        for (const address of await diamondLoupeFacet.facetAddresses()) {
            addresses.push(address)
        }
        console.log({ addresses })
        assert.equal(addresses.length, 12)
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

    describe("Defense Token Checks", function () {
        describe("Defense Tokens", function () {
            it("Confirm Defense Token External Contract is set on the diamond", async function () {
                expect(await svbDefenseTokens.isContractApprovedToMint()).to.equal(false)

                await adminSetterFacet.setAuthorizedExternalContractsForERC721Facet(svbDefenseTokens.target, true)

                expect(await svbDefenseTokens.isContractApprovedToMint()).to.equal(true)
            })

            it("set mintingLive for GemTokens", async function () {
                expect(await svbDefenseTokens.isMintingLive()).to.equal(false)

                expect(await svbDefenseTokens.checkClaimEligibilityBattleStones(1)).to.equal("Mint is not Live or Battle Stones are sold out")
                expect(await svbDefenseTokens.checkClaimEligibilityBattleStones(3)).to.equal("Mint is not Live or Battle Stones are sold out")
                expect(await svbDefenseTokens.checkClaimEligibilityBattleStones(6)).to.equal("Mint is not Live or Battle Stones are sold out")
                expect(await svbDefenseTokens.checkClaimEligibilityBattleStones(9)).to.equal("Mint is not Live or Battle Stones are sold out")
                expect(await svbDefenseTokens.checkClaimEligibilityBattleStones(10)).to.equal("Mint is not Live or Battle Stones are sold out")

                expect(await svbDefenseTokens.checkClaimEligibilityBattleShields(1)).to.equal("Mint is not Live or Battle Shields are sold out")
                expect(await svbDefenseTokens.checkClaimEligibilityBattleShields(3)).to.equal("Mint is not Live or Battle Shields are sold out")
                expect(await svbDefenseTokens.checkClaimEligibilityBattleShields(6)).to.equal("Mint is not Live or Battle Shields are sold out")
                expect(await svbDefenseTokens.checkClaimEligibilityBattleShields(9)).to.equal("Mint is not Live or Battle Shields are sold out")
                expect(await svbDefenseTokens.checkClaimEligibilityBattleShields(10)).to.equal("Mint is not Live or Battle Shields are sold out")

                expect(await svbDefenseTokens.checkClaimEligibilityLuckTokens(1)).to.equal("Mint is not Live or Luck Tokens are sold out")
                expect(await svbDefenseTokens.checkClaimEligibilityLuckTokens(3)).to.equal("Mint is not Live or Luck Tokens are sold out")
                expect(await svbDefenseTokens.checkClaimEligibilityLuckTokens(6)).to.equal("Mint is not Live or Luck Tokens are sold out")
                expect(await svbDefenseTokens.checkClaimEligibilityLuckTokens(9)).to.equal("Mint is not Live or Luck Tokens are sold out")
                expect(await svbDefenseTokens.checkClaimEligibilityLuckTokens(10)).to.equal("Mint is not Live or Luck Tokens are sold out")

                expect(await svbDefenseTokens.getCostAndMintEligibilityBattleStones(1)).to.equal(0) // should return zero when set to false
                expect(await svbDefenseTokens.getCostAndMintEligibilityBattleShields(1)).to.equal(0) // should return zero when set to false
                expect(await svbDefenseTokens.getCostAndMintEligibilityLuckTokens(1)).to.equal(0) // should return zero when set to false

                await svbDefenseTokens.connect(owner).setMintingLive(true)

                expect(await svbDefenseTokens.getCostAndMintEligibilityBattleStones(1)).to.equal(15 * 10 ** 6) // should return zero when set to false

                expect(await svbDefenseTokens.checkClaimEligibilityBattleStones(1)).to.equal("")
                expect(await svbDefenseTokens.checkClaimEligibilityBattleStones(3)).to.equal("")
                expect(await svbDefenseTokens.checkClaimEligibilityBattleStones(6)).to.equal("")
                expect(await svbDefenseTokens.checkClaimEligibilityBattleStones(9)).to.equal("")
                expect(await svbDefenseTokens.checkClaimEligibilityBattleStones(10)).to.equal("")

                expect(await svbDefenseTokens.checkClaimEligibilityBattleShields(1)).to.equal("")
                expect(await svbDefenseTokens.checkClaimEligibilityBattleShields(3)).to.equal("")
                expect(await svbDefenseTokens.checkClaimEligibilityBattleShields(6)).to.equal("")
                expect(await svbDefenseTokens.checkClaimEligibilityBattleShields(9)).to.equal("")
                expect(await svbDefenseTokens.checkClaimEligibilityBattleShields(10)).to.equal("")

                expect(await svbDefenseTokens.checkClaimEligibilityLuckTokens(1)).to.equal("")
                expect(await svbDefenseTokens.checkClaimEligibilityLuckTokens(3)).to.equal("")
                expect(await svbDefenseTokens.checkClaimEligibilityLuckTokens(6)).to.equal("")
                expect(await svbDefenseTokens.checkClaimEligibilityLuckTokens(9)).to.equal("")
                expect(await svbDefenseTokens.checkClaimEligibilityLuckTokens(10)).to.equal("")

                expect(await svbDefenseTokens.isMintingLive()).to.equal(true)
            })

            it("Battle Stone Token Price is returned correctly", async function () {
                let returnedCost = await svbDefenseTokens.getCostAndMintEligibilityBattleStones(1)
                assert.equal(returnedCost, 15 * 10 ** 6)

                returnedCost = await svbDefenseTokens.getCostAndMintEligibilityBattleStones(2)
                assert.equal(returnedCost, 30 * 10 ** 6)

                returnedCost = await svbDefenseTokens.getCostAndMintEligibilityBattleStones(10)
                assert.equal(returnedCost, 150 * 10 ** 6)
            })

            it("Battle Shield Token Price is returned correctly", async function () {
                let returnedCost = await svbDefenseTokens.getCostAndMintEligibilityBattleShields(1)
                assert.equal(returnedCost, 15 * 10 ** 6)

                returnedCost = await svbDefenseTokens.getCostAndMintEligibilityBattleShields(2)
                assert.equal(returnedCost, 30 * 10 ** 6)

                returnedCost = await svbDefenseTokens.getCostAndMintEligibilityBattleShields(10)
                assert.equal(returnedCost, 150 * 10 ** 6)
            })

            it("Luck Token Price is returned correctly", async function () {
                let returnedCost = await svbDefenseTokens.getCostAndMintEligibilityLuckTokens(1)
                assert.equal(returnedCost, 15 * 10 ** 6)

                returnedCost = await svbDefenseTokens.getCostAndMintEligibilityLuckTokens(2)
                assert.equal(returnedCost, 30 * 10 ** 6)

                returnedCost = await svbDefenseTokens.getCostAndMintEligibilityLuckTokens(10)
                assert.equal(returnedCost, 150 * 10 ** 6)
            })

            it("Battle Stone Token price reverts when quantity is more than 20", async function () {
                await expect(svbDefenseTokens.getCostAndMintEligibilityBattleStones(11)).to.revertedWith("10 of less mints per tx only")
            })

            it("Battle Shield Token price reverts when quantity is more than 20", async function () {
                await expect(svbDefenseTokens.getCostAndMintEligibilityBattleShields(11)).to.revertedWith("10 of less mints per tx only")
            })

            it("Luck Token price reverts when quantity is more than 20", async function () {
                await expect(svbDefenseTokens.getCostAndMintEligibilityLuckTokens(11)).to.revertedWith("10 of less mints per tx only")
            })

            it("Battle Stone Token price reverts when quantity is zero", async function () {
                await expect(svbDefenseTokens.getCostAndMintEligibilityBattleStones(0)).to.revertedWith("quantity can't be zero")
            })

            it("Battle Shield Token price reverts when quantity is zero", async function () {
                await expect(svbDefenseTokens.getCostAndMintEligibilityBattleShields(0)).to.revertedWith("quantity can't be zero")
            })

            it("Luck Token price reverts when quantity is zero", async function () {
                await expect(svbDefenseTokens.getCostAndMintEligibilityLuckTokens(0)).to.revertedWith("quantity can't be zero")
            })
        })

        describe("Minting Defense Tokens", function () {
            let snapshotId: Network

            beforeEach(async function () {
                // Take a snapshot
                snapshotId = await network.provider.send("evm_snapshot")
            })

            afterEach(async function () {
                // Revert to the snapshot after each test
                await network.provider.send("evm_revert", [snapshotId])
            })
            it("Should allow minting 1 Battle Stone", async function () {
                let person = signers[10]
                let count = 1
                let costToMint = 15 * count * 10 ** 6
                let halfMintCost = 7.5 * count * 10 ** 6

                let startingDiamondBalance = await mockedUSDC.balanceOf(diamondAddress)

                let startingCoreTeamBalance = await infoGetterFacet.getCoreTeamBalance()

                // Amount to approve (make sure this is sufficient for the mint operation)
                const amountToApprove = await svbDefenseTokens.getCostAndMintEligibilityBattleStones(count)

                // assert paper.xyz call works
                expect(await amountToApprove).to.equal(costToMint)

                // Approve the proxySVB contract to spend tokens
                await mockedUSDC.connect(person).approve(svbDefenseTokens.target, costToMint)

                await expect(svbDefenseTokens.connect(person).mintBattleStones(count)).to.emit(erc721Facet, "BattleStonesMinted").withArgs(person, count, costToMint)

                expect(await mockedUSDC.balanceOf(diamondAddress)).to.equal(BigInt(startingDiamondBalance) + BigInt(costToMint))

                expect(await infoGetterFacet.getCoreTeamBalance()).to.equal(BigInt(startingCoreTeamBalance) + BigInt(halfMintCost))

                expect(await infoGetterFacet.getDefenseTokenSalesBalance()).to.equal(halfMintCost)

                let tokens = await svbDefenseTokens.walletOfOwner(person)

                // Convert BigNumber to BigInt
                let tokenIds = tokens.map((token) => BigInt(token.toString()))

                // Define the expected array
                let expectedTokens = [1005n]

                // Assert equality
                expect(tokenIds).to.have.members(expectedTokens)

                // adjusts owners balances
                expect(await svbDefenseTokens.balanceOf(person)).to.equal(count)

                // adjusts owners tokens by index
                expect(await svbDefenseTokens.tokenOfOwnerByIndex(person, 0n)).to.equal(1005)

                // console.log("wallet of person:", await svbDefenseTokens.walletOfOwner(person))

                // console.log("defense token sales balance:", BigInt(await infoGetterFacet.getDefenseTokenSalesBalance()) / BigInt(10 ** 6))
            })

            it("Should allow minting 2 Battle Stone", async function () {
                let person = signers[10]
                let count = 2
                let costToMint = 15 * count * 10 ** 6
                let halfMintCost = 7.5 * count * 10 ** 6

                let startingDiamondBalance = await mockedUSDC.balanceOf(diamondAddress)

                let startingCoreTeamBalance = await infoGetterFacet.getCoreTeamBalance()

                // Amount to approve (make sure this is sufficient for the mint operation)
                const amountToApprove = await svbDefenseTokens.getCostAndMintEligibilityBattleStones(count)

                // assert paper.xyz call works
                expect(await amountToApprove).to.equal(costToMint)

                // Approve the proxySVB contract to spend tokens
                await mockedUSDC.connect(person).approve(svbDefenseTokens.target, costToMint)

                await expect(svbDefenseTokens.connect(person).mintBattleStones(count)).to.emit(erc721Facet, "BattleStonesMinted").withArgs(person, count, costToMint)

                expect(await mockedUSDC.balanceOf(diamondAddress)).to.equal(BigInt(startingDiamondBalance) + BigInt(costToMint))

                expect(await infoGetterFacet.getCoreTeamBalance()).to.equal(BigInt(startingCoreTeamBalance) + BigInt(halfMintCost))

                expect(await infoGetterFacet.getDefenseTokenSalesBalance()).to.equal(halfMintCost)

                let tokens = await svbDefenseTokens.walletOfOwner(person)

                // Convert BigNumber to BigInt
                let tokenIds = tokens.map((token) => BigInt(token.toString()))

                // Define the expected array
                let expectedTokens = [1005n, 525n]

                // Assert equality
                expect(tokenIds).to.have.members(expectedTokens)

                // adjusts owners balances
                expect(await svbDefenseTokens.balanceOf(person)).to.equal(count)

                // adjusts owners tokens by index
                expect(await svbDefenseTokens.tokenOfOwnerByIndex(person, 0n)).to.equal(1005)

                // console.log("wallet of person:", await svbDefenseTokens.walletOfOwner(person))

                // console.log("defense token sales balance:", BigInt(await infoGetterFacet.getDefenseTokenSalesBalance()) / BigInt(10 ** 6))
            })

            it("Should allow minting 5 Battle Stone", async function () {
                let person = signers[10]
                let count = 5
                let costToMint = 15 * count * 10 ** 6
                let halfMintCost = 7.5 * count * 10 ** 6

                let startingDiamondBalance = await mockedUSDC.balanceOf(diamondAddress)

                let startingCoreTeamBalance = await infoGetterFacet.getCoreTeamBalance()

                // Amount to approve (make sure this is sufficient for the mint operation)
                const amountToApprove = await svbDefenseTokens.getCostAndMintEligibilityBattleStones(count)

                // assert paper.xyz call works
                expect(await amountToApprove).to.equal(costToMint)

                // Approve the proxySVB contract to spend tokens
                await mockedUSDC.connect(person).approve(svbDefenseTokens.target, costToMint)

                await expect(svbDefenseTokens.connect(person).mintBattleStones(count)).to.emit(erc721Facet, "BattleStonesMinted").withArgs(person, count, costToMint)

                expect(await mockedUSDC.balanceOf(diamondAddress)).to.equal(BigInt(startingDiamondBalance) + BigInt(costToMint))

                expect(await infoGetterFacet.getCoreTeamBalance()).to.equal(BigInt(startingCoreTeamBalance) + BigInt(halfMintCost))

                expect(await infoGetterFacet.getDefenseTokenSalesBalance()).to.equal(halfMintCost)

                let tokens = await svbDefenseTokens.walletOfOwner(person)

                // Convert BigNumber to BigInt
                let tokenIds = tokens.map((token) => BigInt(token.toString()))

                // Define the expected array
                let expectedTokens = [1005n, 525n, 2705n, 926n, 2582n]

                // Assert equality
                expect(tokenIds).to.have.members(expectedTokens)

                // adjusts owners balances
                expect(await svbDefenseTokens.balanceOf(person)).to.equal(count)

                // adjusts owners tokens by index
                expect(await svbDefenseTokens.tokenOfOwnerByIndex(person, 0n)).to.equal(1005)

                // console.log("wallet of person:", await svbDefenseTokens.walletOfOwner(person))

                // console.log("defense token sales balance:", BigInt(await infoGetterFacet.getDefenseTokenSalesBalance()) / BigInt(10 ** 6))
            })

            it("Should allow minting 10 Battle Stone", async function () {
                let person = signers[10]
                let count = 10
                let costToMint = 15 * count * 10 ** 6
                let halfMintCost = 7.5 * count * 10 ** 6

                let startingDiamondBalance = await mockedUSDC.balanceOf(diamondAddress)

                let startingCoreTeamBalance = await infoGetterFacet.getCoreTeamBalance()

                // Amount to approve (make sure this is sufficient for the mint operation)
                const amountToApprove = await svbDefenseTokens.getCostAndMintEligibilityBattleStones(count)

                // assert paper.xyz call works
                expect(await amountToApprove).to.equal(costToMint)

                // Approve the proxySVB contract to spend tokens
                await mockedUSDC.connect(person).approve(svbDefenseTokens.target, costToMint)

                await expect(svbDefenseTokens.connect(person).mintBattleStones(count)).to.emit(erc721Facet, "BattleStonesMinted").withArgs(person, count, costToMint)

                expect(await mockedUSDC.balanceOf(diamondAddress)).to.equal(BigInt(startingDiamondBalance) + BigInt(costToMint))

                expect(await infoGetterFacet.getCoreTeamBalance()).to.equal(BigInt(startingCoreTeamBalance) + BigInt(halfMintCost))

                expect(await infoGetterFacet.getDefenseTokenSalesBalance()).to.equal(halfMintCost)

                let tokens = await svbDefenseTokens.walletOfOwner(person)

                // Convert BigNumber to BigInt
                let tokenIds = tokens.map((token) => BigInt(token.toString()))

                // Define the expected array
                let expectedTokens = [1005n, 525n, 2705n, 926n, 2582n, 2162n, 1394n, 1057n, 2704n, 1522n]

                // Assert equality
                expect(tokenIds).to.have.members(expectedTokens)

                // adjusts owners balances
                expect(await svbDefenseTokens.balanceOf(person)).to.equal(count)

                // adjusts owners tokens by index
                expect(await svbDefenseTokens.tokenOfOwnerByIndex(person, 0n)).to.equal(1005)

                // console.log("wallet of person:", await svbDefenseTokens.walletOfOwner(person))

                // console.log("defense token sales balance:", BigInt(await infoGetterFacet.getDefenseTokenSalesBalance()) / BigInt(10 ** 6))
            })

            it("Should revert when minting 11 Battle Stone", async function () {
                await expect(svbDefenseTokens.connect(signers[10]).mintBattleStones(11)).to.revertedWith("10 of less mints per tx only")
            })

            it("Should allow minting 1 Battle Shields", async function () {
                let person = signers[10]
                let count = 1
                let costToMint = 15 * count * 10 ** 6
                let halfMintCost = 7.5 * count * 10 ** 6

                let startingDiamondBalance = await mockedUSDC.balanceOf(diamondAddress)

                let startingCoreTeamBalance = await infoGetterFacet.getCoreTeamBalance()

                // Amount to approve (make sure this is sufficient for the mint operation)
                const amountToApprove = await svbDefenseTokens.getCostAndMintEligibilityBattleShields(count)

                // assert paper.xyz call works
                expect(await amountToApprove).to.equal(costToMint)

                // Approve the proxySVB contract to spend tokens
                await mockedUSDC.connect(person).approve(svbDefenseTokens.target, costToMint)

                await expect(svbDefenseTokens.connect(person).mintBattleShields(count)).to.emit(erc721Facet, "BattleShieldsMinted").withArgs(person, count, costToMint)

                expect(await mockedUSDC.balanceOf(diamondAddress)).to.equal(BigInt(startingDiamondBalance) + BigInt(costToMint))

                expect(await infoGetterFacet.getCoreTeamBalance()).to.equal(BigInt(startingCoreTeamBalance) + BigInt(halfMintCost))

                expect(await infoGetterFacet.getDefenseTokenSalesBalance()).to.equal(halfMintCost)

                let tokens = await svbDefenseTokens.walletOfOwner(person)

                // Convert BigNumber to BigInt
                let tokenIds = tokens.map((token) => BigInt(token.toString()))

                // Define the expected array
                let expectedTokens = [5505n]

                // Assert equality
                expect(tokenIds).to.have.members(expectedTokens)

                // adjusts owners balances
                expect(await svbDefenseTokens.balanceOf(person)).to.equal(count)

                // adjusts owners tokens by index
                expect(await svbDefenseTokens.tokenOfOwnerByIndex(person, 0n)).to.equal(5505)

                // console.log("wallet of person:", await svbDefenseTokens.walletOfOwner(person))

                // console.log("defense token sales balance:", BigInt(await infoGetterFacet.getDefenseTokenSalesBalance()) / BigInt(10 ** 6))
            })

            it("Should allow minting 2 Battle Shields", async function () {
                let person = signers[10]
                let count = 2
                let costToMint = 15 * count * 10 ** 6
                let halfMintCost = 7.5 * count * 10 ** 6

                let startingDiamondBalance = await mockedUSDC.balanceOf(diamondAddress)

                let startingCoreTeamBalance = await infoGetterFacet.getCoreTeamBalance()

                // Amount to approve (make sure this is sufficient for the mint operation)
                const amountToApprove = await svbDefenseTokens.getCostAndMintEligibilityBattleShields(count)

                // assert paper.xyz call works
                expect(await amountToApprove).to.equal(costToMint)

                // Approve the proxySVB contract to spend tokens
                await mockedUSDC.connect(person).approve(svbDefenseTokens.target, costToMint)

                await expect(svbDefenseTokens.connect(person).mintBattleShields(count)).to.emit(erc721Facet, "BattleShieldsMinted").withArgs(person, count, costToMint)

                expect(await mockedUSDC.balanceOf(diamondAddress)).to.equal(BigInt(startingDiamondBalance) + BigInt(costToMint))

                expect(await infoGetterFacet.getCoreTeamBalance()).to.equal(BigInt(startingCoreTeamBalance) + BigInt(halfMintCost))

                expect(await infoGetterFacet.getDefenseTokenSalesBalance()).to.equal(halfMintCost)

                let tokens = await svbDefenseTokens.walletOfOwner(person)

                // Convert BigNumber to BigInt
                let tokenIds = tokens.map((token) => BigInt(token.toString()))

                // Define the expected array
                let expectedTokens = [5505n, 3221n]

                // Assert equality
                expect(tokenIds).to.have.members(expectedTokens)

                // adjusts owners balances
                expect(await svbDefenseTokens.balanceOf(person)).to.equal(count)

                // adjusts owners tokens by index
                expect(await svbDefenseTokens.tokenOfOwnerByIndex(person, 0n)).to.equal(5505)

                // console.log("wallet of person:", await svbDefenseTokens.walletOfOwner(person))

                // console.log("defense token sales balance:", BigInt(await infoGetterFacet.getDefenseTokenSalesBalance()) / BigInt(10 ** 6))
            })

            it("Should allow minting 5 Battle Shields", async function () {
                let person = signers[10]
                let count = 5
                let costToMint = 15 * count * 10 ** 6
                let halfMintCost = 7.5 * count * 10 ** 6

                let startingDiamondBalance = await mockedUSDC.balanceOf(diamondAddress)

                let startingCoreTeamBalance = await infoGetterFacet.getCoreTeamBalance()

                // Amount to approve (make sure this is sufficient for the mint operation)
                const amountToApprove = await svbDefenseTokens.getCostAndMintEligibilityBattleShields(count)

                // assert paper.xyz call works
                expect(await amountToApprove).to.equal(costToMint)

                // Approve the proxySVB contract to spend tokens
                await mockedUSDC.connect(person).approve(svbDefenseTokens.target, costToMint)

                await expect(svbDefenseTokens.connect(person).mintBattleShields(count)).to.emit(erc721Facet, "BattleShieldsMinted").withArgs(person, count, costToMint)

                expect(await mockedUSDC.balanceOf(diamondAddress)).to.equal(BigInt(startingDiamondBalance) + BigInt(costToMint))

                expect(await infoGetterFacet.getCoreTeamBalance()).to.equal(BigInt(startingCoreTeamBalance) + BigInt(halfMintCost))

                expect(await infoGetterFacet.getDefenseTokenSalesBalance()).to.equal(halfMintCost)

                let tokens = await svbDefenseTokens.walletOfOwner(person)

                // Convert BigNumber to BigInt
                let tokenIds = tokens.map((token) => BigInt(token.toString()))

                // Define the expected array
                let expectedTokens = [5505n, 3221n, 5607n, 4043n, 3384n]

                // Assert equality
                expect(tokenIds).to.have.members(expectedTokens)

                // adjusts owners balances
                expect(await svbDefenseTokens.balanceOf(person)).to.equal(count)

                // adjusts owners tokens by index
                expect(await svbDefenseTokens.tokenOfOwnerByIndex(person, 0n)).to.equal(5505)

                // console.log("wallet of person:", await svbDefenseTokens.walletOfOwner(person))

                // console.log("defense token sales balance:", BigInt(await infoGetterFacet.getDefenseTokenSalesBalance()) / BigInt(10 ** 6))
            })

            it("Should allow minting 10 Battle Shields", async function () {
                let person = signers[10]
                let count = 10
                let costToMint = 15 * count * 10 ** 6
                let halfMintCost = 7.5 * count * 10 ** 6

                let startingDiamondBalance = await mockedUSDC.balanceOf(diamondAddress)

                let startingCoreTeamBalance = await infoGetterFacet.getCoreTeamBalance()

                // Amount to approve (make sure this is sufficient for the mint operation)
                const amountToApprove = await svbDefenseTokens.getCostAndMintEligibilityBattleShields(count)

                // assert paper.xyz call works
                expect(await amountToApprove).to.equal(costToMint)

                // Approve the proxySVB contract to spend tokens
                await mockedUSDC.connect(person).approve(svbDefenseTokens.target, costToMint)

                await expect(svbDefenseTokens.connect(person).mintBattleShields(count)).to.emit(erc721Facet, "BattleShieldsMinted").withArgs(person, count, costToMint)

                expect(await mockedUSDC.balanceOf(diamondAddress)).to.equal(BigInt(startingDiamondBalance) + BigInt(costToMint))

                expect(await infoGetterFacet.getCoreTeamBalance()).to.equal(BigInt(startingCoreTeamBalance) + BigInt(halfMintCost))

                expect(await infoGetterFacet.getDefenseTokenSalesBalance()).to.equal(halfMintCost)

                let tokens = await svbDefenseTokens.walletOfOwner(person)

                // Convert BigNumber to BigInt
                let tokenIds = tokens.map((token) => BigInt(token.toString()))

                // Define the expected array
                let expectedTokens = [5505n, 3221n, 5607n, 4043n, 3384n, 3415n, 3366n, 4075n, 4343n, 4451n]

                // Assert equality
                expect(tokenIds).to.have.members(expectedTokens)

                // adjusts owners balances
                expect(await svbDefenseTokens.balanceOf(person)).to.equal(count)

                // adjusts owners tokens by index
                expect(await svbDefenseTokens.tokenOfOwnerByIndex(person, 0n)).to.equal(5505)

                // console.log("wallet of person:", await svbDefenseTokens.walletOfOwner(person))

                // console.log("defense token sales balance:", BigInt(await infoGetterFacet.getDefenseTokenSalesBalance()) / BigInt(10 ** 6))
            })

            it("Should revert when minting 11 Battle Shields", async function () {
                await expect(svbDefenseTokens.connect(signers[10]).mintBattleShields(11)).to.revertedWith("10 of less mints per tx only")
            })

            it("Should allow minting 1 Luck Token", async function () {
                let person = signers[10]
                let count = 1
                let costToMint = 15 * count * 10 ** 6
                let halfMintCost = 7.5 * count * 10 ** 6

                let startingDiamondBalance = await mockedUSDC.balanceOf(diamondAddress)

                let startingCoreTeamBalance = await infoGetterFacet.getCoreTeamBalance()

                // Amount to approve (make sure this is sufficient for the mint operation)
                const amountToApprove = await svbDefenseTokens.getCostAndMintEligibilityLuckTokens(count)

                // assert paper.xyz call works
                expect(await amountToApprove).to.equal(costToMint)

                // Approve the proxySVB contract to spend tokens
                await mockedUSDC.connect(person).approve(svbDefenseTokens.target, costToMint)

                await expect(svbDefenseTokens.connect(person).mintLuckTokens(count)).to.emit(erc721Facet, "LuckTokensMinted").withArgs(person, count, costToMint)

                expect(await mockedUSDC.balanceOf(diamondAddress)).to.equal(BigInt(startingDiamondBalance) + BigInt(costToMint))

                expect(await infoGetterFacet.getCoreTeamBalance()).to.equal(BigInt(startingCoreTeamBalance) + BigInt(halfMintCost))

                expect(await infoGetterFacet.getDefenseTokenSalesBalance()).to.equal(halfMintCost)

                let tokens = await svbDefenseTokens.walletOfOwner(person)

                // Convert BigNumber to BigInt
                let tokenIds = tokens.map((token) => BigInt(token.toString()))

                // Define the expected array
                let expectedTokens = [6929n]

                // Assert equality
                expect(tokenIds).to.have.members(expectedTokens)

                // adjusts owners balances
                expect(await svbDefenseTokens.balanceOf(person)).to.equal(count)

                // adjusts owners tokens by index
                expect(await svbDefenseTokens.tokenOfOwnerByIndex(person, 0n)).to.equal(6929)

                // console.log("wallet of person:", await svbDefenseTokens.walletOfOwner(person))

                // console.log("defense token sales balance:", BigInt(await infoGetterFacet.getDefenseTokenSalesBalance()) / BigInt(10 ** 6))
            })

            it("Should allow minting 2 Luck Tokens", async function () {
                let person = signers[10]
                let count = 2
                let costToMint = 15 * count * 10 ** 6
                let halfMintCost = 7.5 * count * 10 ** 6

                let startingDiamondBalance = await mockedUSDC.balanceOf(diamondAddress)

                let startingCoreTeamBalance = await infoGetterFacet.getCoreTeamBalance()

                // Amount to approve (make sure this is sufficient for the mint operation)
                const amountToApprove = await svbDefenseTokens.getCostAndMintEligibilityLuckTokens(count)

                // assert paper.xyz call works
                expect(await amountToApprove).to.equal(costToMint)

                // Approve the proxySVB contract to spend tokens
                await mockedUSDC.connect(person).approve(svbDefenseTokens.target, costToMint)

                await expect(svbDefenseTokens.connect(person).mintLuckTokens(count)).to.emit(erc721Facet, "LuckTokensMinted").withArgs(person, count, costToMint)

                expect(await mockedUSDC.balanceOf(diamondAddress)).to.equal(BigInt(startingDiamondBalance) + BigInt(costToMint))

                expect(await infoGetterFacet.getCoreTeamBalance()).to.equal(BigInt(startingCoreTeamBalance) + BigInt(halfMintCost))

                expect(await infoGetterFacet.getDefenseTokenSalesBalance()).to.equal(halfMintCost)

                let tokens = await svbDefenseTokens.walletOfOwner(person)

                // Convert BigNumber to BigInt
                let tokenIds = tokens.map((token) => BigInt(token.toString()))

                // Define the expected array
                let expectedTokens = [6929n, 6538n]

                // Assert equality
                expect(tokenIds).to.have.members(expectedTokens)

                // adjusts owners balances
                expect(await svbDefenseTokens.balanceOf(person)).to.equal(count)

                // adjusts owners tokens by index
                expect(await svbDefenseTokens.tokenOfOwnerByIndex(person, 0n)).to.equal(6929)

                // console.log("wallet of person:", await svbDefenseTokens.walletOfOwner(person))

                // console.log("defense token sales balance:", BigInt(await infoGetterFacet.getDefenseTokenSalesBalance()) / BigInt(10 ** 6))
            })

            it("Should allow minting 5 Luck Tokens", async function () {
                let person = signers[10]
                let count = 5
                let costToMint = 15 * count * 10 ** 6
                let halfMintCost = 7.5 * count * 10 ** 6

                let startingDiamondBalance = await mockedUSDC.balanceOf(diamondAddress)

                let startingCoreTeamBalance = await infoGetterFacet.getCoreTeamBalance()

                // Amount to approve (make sure this is sufficient for the mint operation)
                const amountToApprove = await svbDefenseTokens.getCostAndMintEligibilityLuckTokens(count)

                // assert paper.xyz call works
                expect(await amountToApprove).to.equal(costToMint)

                // Approve the proxySVB contract to spend tokens
                await mockedUSDC.connect(person).approve(svbDefenseTokens.target, costToMint)

                await expect(svbDefenseTokens.connect(person).mintLuckTokens(count)).to.emit(erc721Facet, "LuckTokensMinted").withArgs(person, count, costToMint)

                expect(await mockedUSDC.balanceOf(diamondAddress)).to.equal(BigInt(startingDiamondBalance) + BigInt(costToMint))

                expect(await infoGetterFacet.getCoreTeamBalance()).to.equal(BigInt(startingCoreTeamBalance) + BigInt(halfMintCost))

                expect(await infoGetterFacet.getDefenseTokenSalesBalance()).to.equal(halfMintCost)

                let tokens = await svbDefenseTokens.walletOfOwner(person)

                // Convert BigNumber to BigInt
                let tokenIds = tokens.map((token) => BigInt(token.toString()))

                // Define the expected array
                let expectedTokens = [6929n, 6538n, 6014n, 6814n, 6292n]

                // Assert equality
                expect(tokenIds).to.have.members(expectedTokens)

                // adjusts owners balances
                expect(await svbDefenseTokens.balanceOf(person)).to.equal(count)

                // adjusts owners tokens by index
                expect(await svbDefenseTokens.tokenOfOwnerByIndex(person, 0n)).to.equal(6929)

                // console.log("wallet of person:", await svbDefenseTokens.walletOfOwner(person))

                // console.log("defense token sales balance:", BigInt(await infoGetterFacet.getDefenseTokenSalesBalance()) / BigInt(10 ** 6))
            })

            it("Should allow minting 10 Luck Tokens", async function () {
                let person = signers[10]
                let count = 10
                let costToMint = 15 * count * 10 ** 6
                let halfMintCost = 7.5 * count * 10 ** 6

                let startingDiamondBalance = await mockedUSDC.balanceOf(diamondAddress)

                let startingCoreTeamBalance = await infoGetterFacet.getCoreTeamBalance()

                // Amount to approve (make sure this is sufficient for the mint operation)
                const amountToApprove = await svbDefenseTokens.getCostAndMintEligibilityLuckTokens(count)

                // assert paper.xyz call works
                expect(await amountToApprove).to.equal(costToMint)

                // Approve the proxySVB contract to spend tokens
                await mockedUSDC.connect(person).approve(svbDefenseTokens.target, costToMint)

                await expect(svbDefenseTokens.connect(person).mintLuckTokens(count)).to.emit(erc721Facet, "LuckTokensMinted").withArgs(person, count, costToMint)

                expect(await mockedUSDC.balanceOf(diamondAddress)).to.equal(BigInt(startingDiamondBalance) + BigInt(costToMint))

                expect(await infoGetterFacet.getCoreTeamBalance()).to.equal(BigInt(startingCoreTeamBalance) + BigInt(halfMintCost))

                expect(await infoGetterFacet.getDefenseTokenSalesBalance()).to.equal(halfMintCost)

                let tokens = await svbDefenseTokens.walletOfOwner(person)

                // Convert BigNumber to BigInt
                let tokenIds = tokens.map((token) => BigInt(token.toString()))

                // Define the expected array
                let expectedTokens = [6929n, 6538n, 6014n, 6814n, 6292n, 6276n, 6255n, 6513n, 6611n, 6897n]

                // Assert equality
                expect(tokenIds).to.have.members(expectedTokens)

                // adjusts owners balances
                expect(await svbDefenseTokens.balanceOf(person)).to.equal(count)

                // adjusts owners tokens by index
                expect(await svbDefenseTokens.tokenOfOwnerByIndex(person, 0n)).to.equal(6929)

                // console.log("wallet of person:", await svbDefenseTokens.walletOfOwner(person))

                // console.log("defense token sales balance:", BigInt(await infoGetterFacet.getDefenseTokenSalesBalance()) / BigInt(10 ** 6))
            })

            it("Should revert when minting 11 Luck Tokens", async function () {
                await expect(svbDefenseTokens.connect(signers[10]).mintLuckTokens(11)).to.revertedWith("10 of less mints per tx only")
            })

            it("Should allow mixed bag of battle stones, battle shields and luck tokens", async function () {
                let person = signers[10]
                let count = 2
                let costToMint = 15 * count * 10 ** 6
                let halfMintCost = 7.5 * count * 10 ** 6

                // Amount to approve (make sure this is sufficient for the mint operation)
                let amountToApprove = await svbDefenseTokens.getCostAndMintEligibilityLuckTokens(count)

                // assert paper.xyz call works
                expect(await amountToApprove).to.equal(costToMint)

                // Approve the proxySVB contract to spend tokens
                await mockedUSDC.connect(person).approve(svbDefenseTokens.target, costToMint)

                await expect(svbDefenseTokens.connect(person).mintBattleStones(count)).to.emit(erc721Facet, "BattleStonesMinted").withArgs(person, count, costToMint)

                // Amount to approve (make sure this is sufficient for the mint operation)
                amountToApprove = await svbDefenseTokens.getCostAndMintEligibilityLuckTokens(count)

                // assert paper.xyz call works
                expect(await amountToApprove).to.equal(costToMint)

                // Approve the proxySVB contract to spend tokens
                await mockedUSDC.connect(person).approve(svbDefenseTokens.target, costToMint)

                await expect(svbDefenseTokens.connect(person).mintBattleShields(count)).to.emit(erc721Facet, "BattleShieldsMinted").withArgs(person, count, costToMint)

                // Amount to approve (make sure this is sufficient for the mint operation)
                amountToApprove = await svbDefenseTokens.getCostAndMintEligibilityLuckTokens(count)

                // assert paper.xyz call works
                expect(await amountToApprove).to.equal(costToMint)

                // Approve the proxySVB contract to spend tokens
                await mockedUSDC.connect(person).approve(svbDefenseTokens.target, costToMint)

                await expect(svbDefenseTokens.connect(person).mintLuckTokens(count)).to.emit(erc721Facet, "LuckTokensMinted").withArgs(person, count, costToMint)

                let tokens = await svbDefenseTokens.walletOfOwner(person)

                // Convert BigNumber to BigInt
                let tokenIds = tokens.map((token) => BigInt(token.toString()))

                // Define the expected array
                let expectedTokens = [1005n, 525n, 5505n, 3221n, 6929n, 6538n]

                // Assert equality
                expect(tokenIds).to.have.members(expectedTokens)

                // adjusts owners balances
                expect(await svbDefenseTokens.balanceOf(person)).to.equal(6)

                // adjusts owners tokens by index
                expect(await svbDefenseTokens.tokenOfOwnerByIndex(person, 0n)).to.equal(1005)
                expect(await svbDefenseTokens.tokenOfOwnerByIndex(person, 1n)).to.equal(525)
                expect(await svbDefenseTokens.tokenOfOwnerByIndex(person, 2n)).to.equal(5505)
                expect(await svbDefenseTokens.tokenOfOwnerByIndex(person, 3n)).to.equal(3221)
                expect(await svbDefenseTokens.tokenOfOwnerByIndex(person, 4n)).to.equal(6929)
                expect(await svbDefenseTokens.tokenOfOwnerByIndex(person, 5n)).to.equal(6538n)

                console.log("wallet of person:", await svbDefenseTokens.walletOfOwner(person))

                console.log("defense token sales balance:", BigInt(await infoGetterFacet.getDefenseTokenSalesBalance()) / BigInt(10 ** 6))
            })
        })
    })
})
