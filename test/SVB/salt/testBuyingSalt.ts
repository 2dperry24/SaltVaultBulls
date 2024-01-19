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
    let mockedERC721Enumerable: Contract
    let mockedUSDC: Contract
    let saltVaultToken: any

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

        // Get a list of available signers
        signers = await ethers.getSigners()

        owner = signers[0]
        newOwner = signers[1]
        approved = signers[2]
        operator = signers[3]

        coreTeamWallet = signers[5]
        royaltiesWallet = signers[6]
        procurementWallet = signers[7]
        mockedExchange = signers[30]
        saltVaultToken = signers[29]

        // MockedUSDC
        const MockedUSDC = await ethers.getContractFactory("MockedUSDC", signers[30])
        mockedUSDC = await MockedUSDC.deploy(100000000 * 10 ** 6)
        await mockedUSDC.waitForDeployment()

        // set contract address on the diamond
        await adminSetterFacet.connect(signers[0]).setAddresses(mockedUSDC.target, saltVaultToken.address, coreTeamWallet.address, royaltiesWallet.address, procurementWallet.address)

        // ERC721 Facade  Salt Vault Bulls
        const SaltVaultBulls = await ethers.getContractFactory("SaltVaultBulls")
        saltVaultBulls = await SaltVaultBulls.deploy(diamondAddress)
        await saltVaultBulls.waitForDeployment()

        // ERC721 Facade  Salt Vault Bulls
        const MockedERC721Enumerable = await ethers.getContractFactory("MockedERC721Enumerable")
        mockedERC721Enumerable = await MockedERC721Enumerable.deploy()
        await mockedERC721Enumerable.waitForDeployment()

        // Transfer tokens from signers[30] to signers[1] through signers[17]
        const amount = ethers.parseUnits("10000", 6) // Assuming MockedUSDC uses 6 decimal places

        for (let i = 10; i <= 20; i++) {
            await mockedUSDC.connect(signers[30]).transfer(signers[i].address, amount)
        }
    })

    it("should have seven facets -- call to facetAddresses function", async () => {
        for (const address of await diamondLoupeFacet.facetAddresses()) {
            addresses.push(address)
        }
        console.log({ addresses })
        assert.equal(addresses.length, 7)
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
        expect(await saltVaultBulls.usdcTokenContract()).to.equal(mockedUSDC.target)
        expect(await saltVaultBulls.diamondAddress()).to.equal(diamondAddress)
        expect(await saltVaultBulls.procurementWallet()).to.equal(procurementWallet.address)
        expect(await saltVaultBulls.royaltiesWallet()).to.equal(royaltiesWallet.address)
    })

    it("Confirm Salt Vault Bulls External Contract is set on the diamond", async function () {
        expect(await saltVaultBulls.isContractApprovedToMint()).to.equal(false)

        await adminSetterFacet.seteAuthorizeExternalContractsForERC721Facet(saltVaultBulls.target, true)

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

    describe("Salt Repository Checks", function () {
        describe("salt Wallets", function () {
            it("salt prices are correct for salt repo", async function () {
                let saltPrice = await saltRepositoryFacet.getSaltGrainPurchasePrice([1, 0, 0, 0])
                assert.equal(saltPrice, 1 * 10 ** 6)

                saltPrice = await saltRepositoryFacet.getSaltGrainPurchasePrice([0, 1, 0, 0])
                assert.equal(saltPrice, 9 * 10 ** 6)

                saltPrice = await saltRepositoryFacet.getSaltGrainPurchasePrice([0, 0, 1, 0])
                assert.equal(saltPrice, 85 * 10 ** 6)

                saltPrice = await saltRepositoryFacet.getSaltGrainPurchasePrice([0, 0, 0, 1])
                assert.equal(saltPrice, 800 * 10 ** 6)

                saltPrice = await saltRepositoryFacet.getSaltGrainPurchasePrice([5, 2, 3, 4])
                let cubes = 800 * 4 * 10 ** 6
                let sheets = 85 * 3 * 10 ** 6
                let pillars = 9 * 2 * 10 ** 6
                let grains = 5 * 1 * 10 ** 6
                assert.equal(saltPrice, cubes + sheets + pillars + grains)
            })

            it("salt Wallets for Bulls are correct", async function () {
                let bullInfo = await infoGetterFacet.getBullInformation(1)
                expect(Number(bullInfo[0])).to.equal(0) // rarity
                expect(Number(bullInfo[1])).to.equal(6) // grains
                expect(Number(bullInfo[2])).to.equal(1) // pillars
                expect(Number(bullInfo[3])).to.equal(1) // sheets
                expect(Number(bullInfo[4])).to.equal(3) // cubes
                expect(Number(bullInfo[5])).to.equal(0) // salt contribution total

                bullInfo = await infoGetterFacet.getBullInformation(2)
                expect(Number(bullInfo[0])).to.equal(0) // rarity
                expect(Number(bullInfo[1])).to.equal(0) // grains
                expect(Number(bullInfo[2])).to.equal(0) // pillars
                expect(Number(bullInfo[3])).to.equal(0) // sheets
                expect(Number(bullInfo[4])).to.equal(0) // cubes
                expect(Number(bullInfo[5])).to.equal(0) // salt contribution total
            })

            it("p10 buys salt for index 1", async function () {
                console.log("mockedUSDC balance of p10:", await mockedUSDC.balanceOf(signers[10]))
                console.log("mockedUSDC balance of saltVaultBulls:", await mockedUSDC.balanceOf(saltVaultBulls.target))
                console.log("mockedUSDC balance of dimaond:", await mockedUSDC.balanceOf(diamondAddress))
                console.log("mockedUSDC balance of saltRepositoryFacet:", await mockedUSDC.balanceOf(saltRepositoryFacet))
                console.log("mockedUSDC balance of saltVaultBulls:", await mockedUSDC.balanceOf(saltVaultBulls.target))

                let saltPackage = [1, 1, 1, 1]

                let bullInfo = await infoGetterFacet.getBullInformation(1)
                expect(await saltVaultBulls.ownerOf(1)).to.equal(signers[10])

                let balanceBefore = await mockedUSDC.balanceOf(signers[10])
                let saltPrice = await saltRepositoryFacet.getSaltGrainPurchasePrice(saltPackage)

                await mockedUSDC.connect(signers[10]).approve(saltRepositoryFacet.target, saltPrice)

                console.log("p10 mockedUSDC before:", Number(balanceBefore) / 10 ** 6)
                console.log("saltPrice:", Number(saltPrice) / 10 ** 6)

                await expect(saltRepositoryFacet.connect(signers[10]).purchaseSaltGrains(1, saltPackage)).to.emit(saltRepositoryFacet, "SaltGrainsPurchased").withArgs(1n, 1n, 1n, 1n, 1n, saltPrice)

                let balanceAfter = await mockedUSDC.balanceOf(signers[10])

                console.log("p10 mockedUSDC after:", Number(balanceAfter) / 10 ** 6)

                console.log("mockedUSDC balance of p10:", await mockedUSDC.balanceOf(signers[10]))
                console.log("mockedUSDC balance of saltVaultBulls:", await mockedUSDC.balanceOf(saltVaultBulls.target))
                console.log("mockedUSDC balance of dimaond:", await mockedUSDC.balanceOf(diamondAddress))
                console.log("mockedUSDC balance of saltRepositoryFacet:", await mockedUSDC.balanceOf(saltRepositoryFacet))
                console.log("mockedUSDC balance of saltVaultBulls:", await mockedUSDC.balanceOf(saltVaultBulls.target))

                assert.equal(balanceAfter, balanceBefore - saltPrice)
            })

            it("salt Wallets updated correctly for Bull 1 after salt purchase", async function () {
                let bullInfo = await infoGetterFacet.getBullInformation(1)
                expect(Number(bullInfo[0])).to.equal(0) // rarity
                expect(Number(bullInfo[1])).to.equal(7) // grains
                expect(Number(bullInfo[2])).to.equal(2) // pillars
                expect(Number(bullInfo[3])).to.equal(2) // sheets     // updated by 1
                expect(Number(bullInfo[4])).to.equal(4) // cubes
                expect(Number(bullInfo[5])).to.equal(0) // salt contribution total

                bullInfo = await infoGetterFacet.getBullInformation(2)
                expect(Number(bullInfo[0])).to.equal(0) // rarity
                expect(Number(bullInfo[1])).to.equal(0) // grains
                expect(Number(bullInfo[2])).to.equal(0) // pillars
                expect(Number(bullInfo[3])).to.equal(0) // sheets
                expect(Number(bullInfo[4])).to.equal(0) // cubes
                expect(Number(bullInfo[5])).to.equal(0) // salt contribution total
            })

            it("should revert with buying zero salt", async function () {
                await expect(saltRepositoryFacet.connect(signers[10]).purchaseSaltGrains(1, [0, 0, 0, 0])).to.revertedWith("Salt count to purchase can't be zero")
            })

            it("should revert when trying to buy salt for a bull you don't own", async function () {
                await expect(saltRepositoryFacet.connect(signers[7]).purchaseSaltGrains(1, [0, 0, 0, 0])).to.revertedWith("You do not own this Bull")
            })
        })
    })
})
