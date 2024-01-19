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
    let mockedERC721Enumerable: Contract
    let mockedUSDC: Contract
    let saltVaultToken: any
    let gemTokenChallengeFacet: any
    let bankFacet: any

    let owner: any
    let newOwner: any
    let approved: any
    let operator: any
    let coreTeamWallet: any
    let royaltiesWallet: any
    let procurementWallet: any
    let badActorWallet: any
    let mockedExchange: any
    let fee_receiver_wallet: any
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
        gemTokenChallengeFacet = await ethers.getContractAt("GemTokenChallengeFacet", diamondAddress)
        bankFacet = await ethers.getContractAt("BankFacet", diamondAddress)

        // Get a list of available signers
        signers = await ethers.getSigners()

        owner = signers[0]
        newOwner = signers[1]
        approved = signers[2]
        operator = signers[3]

        coreTeamWallet = signers[5]
        royaltiesWallet = signers[6]
        procurementWallet = signers[7]
        fee_receiver_wallet = signers[8]
        mockedExchange = signers[30]

        // SaltVaultToken
        const SaltVaultToken = await ethers.getContractFactory("SaltVaultToken")
        saltVaultToken = await SaltVaultToken.deploy()
        await saltVaultToken.waitForDeployment()

        // MockedUSDC
        const MockedUSDC = await ethers.getContractFactory("MockedUSDC", signers[30])
        mockedUSDC = await MockedUSDC.deploy(100000000 * 10 ** 6)
        await mockedUSDC.waitForDeployment()

        // set contract address on the diamond
        await adminSetterFacet.connect(signers[0]).setAddresses(mockedUSDC.target, saltVaultToken.target, coreTeamWallet.address, royaltiesWallet.address, procurementWallet.address)

        // ERC721 External  Salt Vault Bulls
        const SaltVaultBulls = await ethers.getContractFactory("SaltVaultBulls")
        saltVaultBulls = await SaltVaultBulls.deploy(diamondAddress)
        await saltVaultBulls.waitForDeployment()

        // ERC721 mocked contract for Salt Vault Bulls to test against
        const MockedERC721Enumerable = await ethers.getContractFactory("MockedERC721Enumerable")
        mockedERC721Enumerable = await MockedERC721Enumerable.deploy()
        await mockedERC721Enumerable.waitForDeployment()

        // Transfer tokens from signers[30] to signers[1] through signers[17]
        const amount = ethers.parseUnits("10000", 6) // Assuming MockedUSDC uses 6 decimal places

        await adminSetterFacet.setAuthorizeExternalContractsForERC721Facet(saltVaultBulls.target, true)

        for (let i = 10; i <= 20; i++) {
            await mockedUSDC.connect(signers[30]).transfer(signers[i].address, amount)
        }
    })

    it("should have seven facets -- call to facetAddresses function", async () => {
        for (const address of await diamondLoupeFacet.facetAddresses()) {
            addresses.push(address)
        }
        console.log({ addresses })
        assert.equal(addresses.length, 9)
    })

    it("rarity from Diamond is correct", async function () {
        let rarity = await infoGetterFacet.getRarityInformationForBull(0)
        expect(Number(rarity[0])).to.equal(2500 * 10 ** 6)
        expect(Number(rarity[1])).to.equal(300)
        expect(Number(rarity[2])).to.equal(1)
        expect(Number(rarity[3])).to.equal(50)

        rarity = await infoGetterFacet.getRarityInformationForBull(1)

        expect(Number(rarity[0])).to.equal(1000 * 10 ** 6)
        expect(Number(rarity[1])).to.equal(200)
        expect(Number(rarity[2])).to.equal(51)
        expect(Number(rarity[3])).to.equal(500)

        rarity = await infoGetterFacet.getRarityInformationForBull(2)

        expect(Number(rarity[0])).to.equal(750 * 10 ** 6)
        expect(Number(rarity[1])).to.equal(175)
        expect(Number(rarity[2])).to.equal(501)
        expect(Number(rarity[3])).to.equal(2000)

        rarity = await infoGetterFacet.getRarityInformationForBull(3)

        expect(Number(rarity[0])).to.equal(500 * 10 ** 6)
        expect(Number(rarity[1])).to.equal(150)
        expect(Number(rarity[2])).to.equal(2001)
        expect(Number(rarity[3])).to.equal(4000)

        rarity = await infoGetterFacet.getRarityInformationForBull(4)

        expect(Number(rarity[0])).to.equal(350 * 10 ** 6)
        expect(Number(rarity[1])).to.equal(130)
        expect(Number(rarity[2])).to.equal(4001)
        expect(Number(rarity[3])).to.equal(6000)

        rarity = await infoGetterFacet.getRarityInformationForBull(5)

        expect(Number(rarity[0])).to.equal(200 * 10 ** 6)
        expect(Number(rarity[1])).to.equal(115)
        expect(Number(rarity[2])).to.equal(6001)
        expect(Number(rarity[3])).to.equal(8000)

        rarity = await infoGetterFacet.getRarityInformationForBull(6)

        expect(Number(rarity[0])).to.equal(100 * 10 ** 6)
        expect(Number(rarity[1])).to.equal(100)
        expect(Number(rarity[2])).to.equal(8001)
        expect(Number(rarity[3])).to.equal(10000)
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

    it("Confirm Contract Addresses", async function () {
        expect(await saltVaultBulls.usdcTokenContract()).to.equal(mockedUSDC.target)
        expect(await saltVaultBulls.diamondAddress()).to.equal(diamondAddress)
        expect(await saltVaultBulls.procurementWallet()).to.equal(procurementWallet.address)
        expect(await saltVaultBulls.royaltiesWallet()).to.equal(royaltiesWallet.address)
    })

    it("Confirm Salt Vault Bulls External Contract is set on the diamond", async function () {
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
})
