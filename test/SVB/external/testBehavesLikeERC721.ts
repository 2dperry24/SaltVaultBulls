/* global describe it before ethers */

import { getSelectors, FacetCutAction, removeSelectors, findAddressPositionInFacets } from "../../../scripts/diamond"
import { deploy } from "../../../scripts/deploy"
import { assert, expect } from "chai"
import { ethers, network } from "hardhat"
import { Contract } from "ethers"
import { Network } from "@ethersproject/providers"

describe("Behaves Like ERC721", async function () {
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

    let gemTokenBurnWallet: any
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
        gemTokenBurnWallet = signers[9]
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
        await adminSetterFacet
            .connect(signers[0])
            .setAddresses(mockedUSDC.target, saltVaultToken.target, coreTeamWallet.address, royaltiesWallet.address, procurementWallet.address, gemTokenBurnWallet.address)

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

        await mockedUSDC.connect(signers[30]).transfer(owner.address, amount)
        await mockedUSDC.connect(signers[30]).transfer(newOwner.address, amount)

        await adminSetterFacet.setAuthorizeExternalContractsForERC721Facet(saltVaultBulls.target, true)
    })

    it("should have seven facets -- call to facetAddresses function", async () => {
        for (const address of await diamondLoupeFacet.facetAddresses()) {
            addresses.push(address)
        }
        console.log({ addresses })
        assert.equal(addresses.length, 9)
    })

    it("Contract addresses should be set", async function () {
        expect(await mockedERC721Enumerable.usdcTokenContract()).to.equal(ethers.ZeroAddress)
        expect(await mockedERC721Enumerable.procurementWallet()).to.equal(ethers.ZeroAddress)
        expect(await mockedERC721Enumerable.royaltiesWallet()).to.equal(ethers.ZeroAddress)

        await mockedERC721Enumerable.connect(owner).setContractAddresses(mockedUSDC.target, procurementWallet.address, royaltiesWallet.address)

        expect(await saltVaultBulls.usdcTokenContract()).to.equal(mockedUSDC.target)
        expect(await saltVaultBulls.procurementWallet()).to.equal(procurementWallet.address)
        expect(await saltVaultBulls.royaltiesWallet()).to.equal(royaltiesWallet.address)
        expect(await mockedERC721Enumerable.usdcTokenContract()).to.equal(mockedUSDC.target)
        expect(await mockedERC721Enumerable.procurementWallet()).to.equal(procurementWallet.address)
        expect(await mockedERC721Enumerable.royaltiesWallet()).to.equal(royaltiesWallet.address)
    })

    it("has have a name", async function () {
        expect(await saltVaultBulls.name()).to.equal(expectedName)
        expect(await mockedERC721Enumerable.name()).to.equal(expectedName)
    })

    it("has a symbol", async function () {
        expect(await saltVaultBulls.symbol()).to.equal(expectedSymbol)
        expect(await mockedERC721Enumerable.symbol()).to.equal(expectedSymbol)
    })

    it("Confirm minting is not allowed while flag is false", async function () {
        await expect(saltVaultBulls.connect(owner).mint(0, owner.address)).to.revertedWith("Minting is not live or this rarity is sold out")
    })

    it("Change minting Status to live", async function () {
        expect(await saltVaultBulls.getCostAndMintEligibility(0)).to.equal(0) // should return zero when set to false
        expect(await saltVaultBulls.isMintingLive()).to.equal(false)

        expect(await mockedERC721Enumerable.getCostAndMintEligibility(0)).to.equal(0) // should return zero when set to false
        expect(await mockedERC721Enumerable.isMintingLive()).to.equal(false)

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

        expect(await mockedERC721Enumerable.checkClaimEligibility(0, 1)).to.equal("Mint is not Live or Rarity sold is out")
        expect(await mockedERC721Enumerable.checkClaimEligibility(1, 1)).to.equal("Mint is not Live or Rarity sold is out")
        expect(await mockedERC721Enumerable.checkClaimEligibility(2, 1)).to.equal("Mint is not Live or Rarity sold is out")
        expect(await mockedERC721Enumerable.checkClaimEligibility(3, 1)).to.equal("Mint is not Live or Rarity sold is out")
        expect(await mockedERC721Enumerable.checkClaimEligibility(4, 1)).to.equal("Mint is not Live or Rarity sold is out")
        expect(await mockedERC721Enumerable.checkClaimEligibility(5, 1)).to.equal("Mint is not Live or Rarity sold is out")
        expect(await mockedERC721Enumerable.checkClaimEligibility(6, 1)).to.equal("Mint is not Live or Rarity sold is out")
        expect(await mockedERC721Enumerable.checkClaimEligibility(0, 2)).to.equal("Only 1 mint per tx")
        expect(await mockedERC721Enumerable.checkClaimEligibility(1, 2)).to.equal("Only 1 mint per tx")
        expect(await mockedERC721Enumerable.checkClaimEligibility(2, 2)).to.equal("Only 1 mint per tx")
        expect(await mockedERC721Enumerable.checkClaimEligibility(3, 2)).to.equal("Only 1 mint per tx")
        expect(await mockedERC721Enumerable.checkClaimEligibility(4, 2)).to.equal("Only 1 mint per tx")
        expect(await mockedERC721Enumerable.checkClaimEligibility(5, 2)).to.equal("Only 1 mint per tx")
        expect(await mockedERC721Enumerable.checkClaimEligibility(6, 2)).to.equal("Only 1 mint per tx")

        await saltVaultBulls.connect(owner).setMintingLive(true)
        await mockedERC721Enumerable.connect(owner).setMintingLive(true)

        expect(await saltVaultBulls.isMintingLive()).to.equal(true)
        expect(await mockedERC721Enumerable.isMintingLive()).to.equal(true)

        expect(await saltVaultBulls.getCostAndMintEligibility(0)).to.equal(2500 * 10 ** 6) // should return zero when set to false
        expect(await saltVaultBulls.getCostAndMintEligibility(1)).to.equal(1000 * 10 ** 6) // should return zero when set to false
        expect(await saltVaultBulls.getCostAndMintEligibility(2)).to.equal(750 * 10 ** 6) // should return zero when set to false
        expect(await saltVaultBulls.getCostAndMintEligibility(3)).to.equal(500 * 10 ** 6) // should return zero when set to false
        expect(await saltVaultBulls.getCostAndMintEligibility(4)).to.equal(350 * 10 ** 6) // should return zero when set to false
        expect(await saltVaultBulls.getCostAndMintEligibility(5)).to.equal(200 * 10 ** 6) // should return zero when set to false
        expect(await saltVaultBulls.getCostAndMintEligibility(6)).to.equal(100 * 10 ** 6) // should return zero when set to false

        expect(await saltVaultBulls.checkClaimEligibility(0, 1)).to.equal("")
        expect(await saltVaultBulls.checkClaimEligibility(1, 1)).to.equal("")
        expect(await saltVaultBulls.checkClaimEligibility(2, 1)).to.equal("")
        expect(await saltVaultBulls.checkClaimEligibility(3, 1)).to.equal("")
        expect(await saltVaultBulls.checkClaimEligibility(4, 1)).to.equal("")
        expect(await saltVaultBulls.checkClaimEligibility(5, 1)).to.equal("")
        expect(await saltVaultBulls.checkClaimEligibility(6, 1)).to.equal("")

        expect(await mockedERC721Enumerable.getCostAndMintEligibility(0)).to.equal(2500 * 10 ** 6) // should return zero when set to false
        expect(await mockedERC721Enumerable.getCostAndMintEligibility(1)).to.equal(1000 * 10 ** 6) // should return zero when set to false
        expect(await mockedERC721Enumerable.getCostAndMintEligibility(2)).to.equal(750 * 10 ** 6) // should return zero when set to false
        expect(await mockedERC721Enumerable.getCostAndMintEligibility(3)).to.equal(500 * 10 ** 6) // should return zero when set to false
        expect(await mockedERC721Enumerable.getCostAndMintEligibility(4)).to.equal(350 * 10 ** 6) // should return zero when set to false
        expect(await mockedERC721Enumerable.getCostAndMintEligibility(5)).to.equal(200 * 10 ** 6) // should return zero when set to false
        expect(await mockedERC721Enumerable.getCostAndMintEligibility(6)).to.equal(100 * 10 ** 6) // should return zero when set to false

        expect(await mockedERC721Enumerable.isMintingLive()).to.equal(true)
        expect(await mockedERC721Enumerable.checkClaimEligibility(0, 1)).to.equal("")
        expect(await mockedERC721Enumerable.checkClaimEligibility(1, 1)).to.equal("")
        expect(await mockedERC721Enumerable.checkClaimEligibility(2, 1)).to.equal("")
        expect(await mockedERC721Enumerable.checkClaimEligibility(3, 1)).to.equal("")
        expect(await mockedERC721Enumerable.checkClaimEligibility(4, 1)).to.equal("")
        expect(await mockedERC721Enumerable.checkClaimEligibility(5, 1)).to.equal("")
        expect(await mockedERC721Enumerable.checkClaimEligibility(6, 1)).to.equal("")
    })

    it("owner Mints a Diamond and Ruby Bull", async function () {
        // Approve the proxySVB contract to spend tokens
        await mockedUSDC.connect(owner).approve(saltVaultBulls.target, 7000 * 10 ** 6)

        await saltVaultBulls.connect(owner).mint(0, owner.address)
        await saltVaultBulls.connect(owner).mint(1, owner.address)

        await mockedERC721Enumerable.connect(owner).mint(0, owner.address)
        await mockedERC721Enumerable.connect(owner).mint(1, owner.address)
    })

    it("Indexes have the correct tokenURI when launching the contract", async function () {
        expect(await saltVaultBulls.tokenURI(1)).to.equal("ipfs://startingData/1.json")
        expect(await saltVaultBulls.tokenURI(51)).to.equal("ipfs://startingData/51.json")

        expect(await mockedERC721Enumerable.tokenURI(1)).to.equal("ipfs://startingData/1.json")
        expect(await mockedERC721Enumerable.tokenURI(51)).to.equal("ipfs://startingData/51.json")
    })

    it("expect revert for nonexistent token URI", async function () {
        await expect(saltVaultBulls.tokenURI(5)).to.revertedWith("ERC721: invalid token ID")
        await expect(mockedERC721Enumerable.tokenURI(5)).to.revertedWith("ERC721Metadata: URI query for nonexistent token")
    })

    it("token URI can be changed by changing the base URI", async function () {
        await saltVaultBulls.setBaseURI("ipfs://changeV2/")
        expect(await saltVaultBulls.tokenURI(1)).to.equal("ipfs://changeV2/1.json")
        expect(await saltVaultBulls.tokenURI(51)).to.equal("ipfs://changeV2/51.json")

        await mockedERC721Enumerable.setBaseURI("ipfs://changeV2/")
        expect(await mockedERC721Enumerable.tokenURI(1)).to.equal("ipfs://changeV2/1.json")
        expect(await mockedERC721Enumerable.tokenURI(51)).to.equal("ipfs://changeV2/51.json")
    })

    it("returns the amount of tokens owned by the given address", async function () {
        expect(await saltVaultBulls.balanceOf(owner)).to.equal(2n)
        expect(await saltVaultBulls.balanceOf(newOwner)).to.equal(0n)

        expect(await mockedERC721Enumerable.balanceOf(owner)).to.equal(2n)
        expect(await mockedERC721Enumerable.balanceOf(newOwner)).to.equal(0n)
    })

    it("returns the totalSupply", async function () {
        expect(await mockedERC721Enumerable.totalSupply()).to.equal(2n)
        expect(await saltVaultBulls.totalSupply()).to.equal(2n)
    })

    it("throws error when asking for balanceOf address(0)", async function () {
        await expect(saltVaultBulls.balanceOf(ethers.ZeroAddress)).to.revertedWith("ERC721: address zero is not a valid owner")
        await expect(mockedERC721Enumerable.balanceOf(ethers.ZeroAddress)).to.revertedWith("ERC721: address zero is not a valid owner")
    })

    it("returns the owner of the given token ID", async function () {
        expect(await saltVaultBulls.ownerOf(1)).to.equal(owner)
        expect(await saltVaultBulls.ownerOf(51)).to.equal(owner)
        expect(await saltVaultBulls.ownerOf(51)).to.not.equal(newOwner)

        expect(await mockedERC721Enumerable.ownerOf(1)).to.equal(owner)
        expect(await mockedERC721Enumerable.ownerOf(51)).to.equal(owner)
        expect(await mockedERC721Enumerable.ownerOf(51)).to.not.equal(newOwner)
    })

    it("reverts when looking for nonExistent token ID", async function () {
        await expect(saltVaultBulls.ownerOf(100)).to.revertedWith("ERC721: invalid token ID")
        await expect(mockedERC721Enumerable.ownerOf(100)).to.revertedWith("ERC721: invalid token ID")
    })

    it("save state of newtwork here before Transfers", async function () {
        await mockedERC721Enumerable.connect(owner).approve(approved, 51)
        await mockedERC721Enumerable.connect(owner).setApprovalForAll(operator, true)

        await saltVaultBulls.connect(owner).approve(approved, 51)
        await saltVaultBulls.connect(owner).setApprovalForAll(operator, true)
    })

    describe("Transfer tests", function () {
        let snapshotId: Network

        beforeEach(async function () {
            // Take a snapshot
            snapshotId = await network.provider.send("evm_snapshot")

            expect(await saltVaultBulls.isApprovedForAll(owner, operator)).to.equal(true)
            expect(await saltVaultBulls.getApproved(51)).to.equal(approved.address)
            expect(await saltVaultBulls.balanceOf(owner)).to.equal(2)
            expect(await saltVaultBulls.ownerOf(51)).to.equal(owner)
        })

        afterEach(async function () {
            // Revert to the snapshot after each test
            await network.provider.send("evm_revert", [snapshotId])
        })

        it("owner transfer token 51 to newOwner with Emit Event", async function () {
            await expect(mockedERC721Enumerable.connect(owner).transferFrom(owner.address, newOwner.address, 51))
                .to.emit(mockedERC721Enumerable, "Transfer")
                .withArgs(owner.address, newOwner.address, 51)

            await expect(saltVaultBulls.connect(owner).transferFrom(owner.address, newOwner.address, 51))
                .to.emit(erc721Facet, "Transfer")
                .withArgs(owner.address, newOwner.address, 51)

            // transfers the ownership of the given token ID to the given address
            expect(await saltVaultBulls.ownerOf(51)).to.equal(newOwner)
            expect(await mockedERC721Enumerable.ownerOf(51)).to.equal(newOwner)

            // clears the approval for the token ID
            expect(await saltVaultBulls.getApproved(51)).to.equal(ethers.ZeroAddress)
            expect(await mockedERC721Enumerable.getApproved(51)).to.equal(ethers.ZeroAddress)

            // adjusts owners balances
            expect(await saltVaultBulls.balanceOf(owner)).to.equal(1n)
            expect(await mockedERC721Enumerable.balanceOf(owner)).to.equal(1n)

            // adjusts owners tokens by index
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(newOwner, 0n)).to.equal(51)
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)

            expect(await saltVaultBulls.tokenOfOwnerByIndex(newOwner, 0n)).to.equal(51)
            expect(await saltVaultBulls.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)
        })

        it("approved transfers token 51 to newOwner with Emit Event", async function () {
            await expect(mockedERC721Enumerable.connect(approved).transferFrom(owner.address, newOwner.address, 51))
                .to.emit(mockedERC721Enumerable, "Transfer")
                .withArgs(owner.address, newOwner.address, 51)

            await expect(saltVaultBulls.connect(owner).transferFrom(owner.address, newOwner.address, 51))
                .to.emit(erc721Facet, "Transfer")
                .withArgs(owner.address, newOwner.address, 51)

            // transfers the ownership of the given token ID to the given address
            expect(await saltVaultBulls.ownerOf(51)).to.equal(newOwner)
            expect(await mockedERC721Enumerable.ownerOf(51)).to.equal(newOwner)

            // clears the approval for the token ID
            expect(await saltVaultBulls.getApproved(51)).to.equal(ethers.ZeroAddress)
            expect(await mockedERC721Enumerable.getApproved(51)).to.equal(ethers.ZeroAddress)

            // adjusts owners balances
            expect(await saltVaultBulls.balanceOf(owner)).to.equal(1n)
            expect(await mockedERC721Enumerable.balanceOf(owner)).to.equal(1n)

            // adjusts owners tokens by index
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(newOwner, 0n)).to.equal(51)
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)

            expect(await saltVaultBulls.tokenOfOwnerByIndex(newOwner, 0n)).to.equal(51)
            expect(await saltVaultBulls.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)
        })

        it("operator transfers token 51 to newOwner with Emit Event", async function () {
            await expect(mockedERC721Enumerable.connect(operator).transferFrom(owner.address, newOwner.address, 51))
                .to.emit(mockedERC721Enumerable, "Transfer")
                .withArgs(owner.address, newOwner.address, 51)

            await expect(saltVaultBulls.connect(owner).transferFrom(owner.address, newOwner.address, 51))
                .to.emit(erc721Facet, "Transfer")
                .withArgs(owner.address, newOwner.address, 51)

            // transfers the ownership of the given token ID to the given address
            expect(await saltVaultBulls.ownerOf(51)).to.equal(newOwner)
            expect(await mockedERC721Enumerable.ownerOf(51)).to.equal(newOwner)

            // clears the approval for the token ID
            expect(await saltVaultBulls.getApproved(51)).to.equal(ethers.ZeroAddress)
            expect(await mockedERC721Enumerable.getApproved(51)).to.equal(ethers.ZeroAddress)

            // adjusts owners balances
            expect(await saltVaultBulls.balanceOf(owner)).to.equal(1n)
            expect(await mockedERC721Enumerable.balanceOf(owner)).to.equal(1n)

            // adjusts owners tokens by index
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(newOwner, 0n)).to.equal(51)
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)

            expect(await saltVaultBulls.tokenOfOwnerByIndex(newOwner, 0n)).to.equal(51)
            expect(await saltVaultBulls.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)
        })

        it("when called by approved without approval", async function () {
            await saltVaultBulls.connect(owner).approve(ethers.ZeroAddress, 51)
            await mockedERC721Enumerable.connect(owner).approve(ethers.ZeroAddress, 51)
            expect(await saltVaultBulls.getApproved(51)).to.equal(ethers.ZeroAddress)
            expect(await mockedERC721Enumerable.getApproved(51)).to.equal(ethers.ZeroAddress)

            await expect(saltVaultBulls.connect(approved).transferFrom(owner.address, newOwner.address, 51)).to.revertedWith("ERC721: caller is not token owner or approved")
            await expect(mockedERC721Enumerable.connect(approved).transferFrom(owner.address, newOwner.address, 51)).to.revertedWith("ERC721: caller is not token owner or approved")

            // transfers the ownership of the given token ID to the given address
            expect(await saltVaultBulls.ownerOf(51)).to.equal(owner)
            expect(await mockedERC721Enumerable.ownerOf(51)).to.equal(owner)

            // approval for the token ID
            expect(await saltVaultBulls.getApproved(51)).to.equal(ethers.ZeroAddress)
            expect(await mockedERC721Enumerable.getApproved(51)).to.equal(ethers.ZeroAddress)

            // adjusts owners balances
            expect(await saltVaultBulls.balanceOf(owner)).to.equal(2n)
            expect(await mockedERC721Enumerable.balanceOf(owner)).to.equal(2n)

            // adjusts owners tokens by index
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(owner, 1n)).to.equal(51)

            expect(await saltVaultBulls.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)
            expect(await saltVaultBulls.tokenOfOwnerByIndex(owner, 1n)).to.equal(51)
        })

        it("when called by operator without being set to true", async function () {
            await saltVaultBulls.connect(owner).setApprovalForAll(operator, false)
            await mockedERC721Enumerable.connect(owner).setApprovalForAll(operator, false)

            expect(await saltVaultBulls.isApprovedForAll(owner, operator)).to.equal(false)
            expect(await mockedERC721Enumerable.isApprovedForAll(owner, operator)).to.equal(false)

            await expect(saltVaultBulls.connect(operator).transferFrom(owner.address, newOwner.address, 51)).to.revertedWith("ERC721: caller is not token owner or approved")
            await expect(mockedERC721Enumerable.connect(operator).transferFrom(owner.address, newOwner.address, 51)).to.revertedWith("ERC721: caller is not token owner or approved")

            // transfers the ownership of the given token ID to the given address
            expect(await saltVaultBulls.ownerOf(51)).to.equal(owner)
            expect(await mockedERC721Enumerable.ownerOf(51)).to.equal(owner)

            // approval for the token ID
            expect(await saltVaultBulls.getApproved(51)).to.equal(approved)
            expect(await mockedERC721Enumerable.getApproved(51)).to.equal(approved)

            // adjusts owners balances
            expect(await saltVaultBulls.balanceOf(owner)).to.equal(2n)
            expect(await mockedERC721Enumerable.balanceOf(owner)).to.equal(2n)

            // adjusts owners tokens by index
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(owner, 1n)).to.equal(51)

            expect(await saltVaultBulls.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)
            expect(await saltVaultBulls.tokenOfOwnerByIndex(owner, 1n)).to.equal(51)
        })

        it("when sent to owners own wallet by owner", async function () {
            await expect(mockedERC721Enumerable.connect(owner).transferFrom(owner.address, owner.address, 51))
                .to.emit(mockedERC721Enumerable, "Transfer")
                .withArgs(owner.address, owner.address, 51)

            await expect(saltVaultBulls.connect(owner).transferFrom(owner.address, owner.address, 51))
                .to.emit(erc721Facet, "Transfer")
                .withArgs(owner.address, owner.address, 51)

            // keeps the ownership of the given token ID
            expect(await saltVaultBulls.ownerOf(51)).to.equal(owner)
            expect(await mockedERC721Enumerable.ownerOf(51)).to.equal(owner)

            // clears approval for the token ID
            expect(await saltVaultBulls.getApproved(51)).to.equal(ethers.ZeroAddress)
            expect(await mockedERC721Enumerable.getApproved(51)).to.equal(ethers.ZeroAddress)

            // keeps owners balances the same
            expect(await saltVaultBulls.balanceOf(owner)).to.equal(2n)
            expect(await mockedERC721Enumerable.balanceOf(owner)).to.equal(2n)

            // keeps tokenbyIndex the same
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(owner, 1n)).to.equal(51)

            expect(await saltVaultBulls.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)
            expect(await saltVaultBulls.tokenOfOwnerByIndex(owner, 1n)).to.equal(51)
        })

        it("when the address of the previous owner is incorrect", async function () {
            await expect(saltVaultBulls.connect(owner).transferFrom(newOwner.address, newOwner.address, 51)).to.revertedWith("ERC721: transfer from incorrect owner")
            await expect(mockedERC721Enumerable.connect(owner).transferFrom(newOwner.address, newOwner.address, 51)).to.revertedWith("ERC721: transfer from incorrect owner")

            // keeps the ownership of the given token ID
            expect(await saltVaultBulls.ownerOf(51)).to.equal(owner)
            expect(await mockedERC721Enumerable.ownerOf(51)).to.equal(owner)

            // clears approval for the token ID
            expect(await saltVaultBulls.getApproved(51)).to.equal(approved)
            expect(await mockedERC721Enumerable.getApproved(51)).to.equal(approved)

            // keeps owners balances the same
            expect(await saltVaultBulls.balanceOf(owner)).to.equal(2n)
            expect(await mockedERC721Enumerable.balanceOf(owner)).to.equal(2n)

            // keeps tokenbyIndex the same
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(owner, 1n)).to.equal(51)

            expect(await saltVaultBulls.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)
            expect(await saltVaultBulls.tokenOfOwnerByIndex(owner, 1n)).to.equal(51)
        })

        it("when the sender is not authorized ", async function () {
            await expect(saltVaultBulls.connect(newOwner).transferFrom(owner.address, newOwner.address, 51)).to.revertedWith("ERC721: caller is not token owner or approved")
            await expect(mockedERC721Enumerable.connect(newOwner).transferFrom(owner.address, newOwner.address, 51)).to.revertedWith("ERC721: caller is not token owner or approved")

            // keeps the ownership of the given token ID
            expect(await saltVaultBulls.ownerOf(51)).to.equal(owner)
            expect(await mockedERC721Enumerable.ownerOf(51)).to.equal(owner)

            // clears approval for the token ID
            expect(await saltVaultBulls.getApproved(51)).to.equal(approved)
            expect(await mockedERC721Enumerable.getApproved(51)).to.equal(approved)

            // keeps owners balances the same
            expect(await saltVaultBulls.balanceOf(owner)).to.equal(2n)
            expect(await mockedERC721Enumerable.balanceOf(owner)).to.equal(2n)

            // keeps tokenbyIndex the same
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(owner, 1n)).to.equal(51)

            expect(await saltVaultBulls.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)
            expect(await saltVaultBulls.tokenOfOwnerByIndex(owner, 1n)).to.equal(51)
        })

        it("when the given token ID does not exist", async function () {
            await expect(saltVaultBulls.connect(owner).transferFrom(owner.address, newOwner.address, 100)).to.revertedWith("ERC721: invalid token ID")
            await expect(mockedERC721Enumerable.connect(owner).transferFrom(owner.address, newOwner.address, 100)).to.revertedWith("ERC721: invalid token ID")

            // keeps the ownership of the given token ID
            expect(await saltVaultBulls.ownerOf(51)).to.equal(owner)
            expect(await mockedERC721Enumerable.ownerOf(51)).to.equal(owner)

            // clears approval for the token ID
            expect(await saltVaultBulls.getApproved(51)).to.equal(approved)
            expect(await mockedERC721Enumerable.getApproved(51)).to.equal(approved)

            // keeps owners balances the same
            expect(await saltVaultBulls.balanceOf(owner)).to.equal(2n)
            expect(await mockedERC721Enumerable.balanceOf(owner)).to.equal(2n)

            // keeps tokenbyIndex the same
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(owner, 1n)).to.equal(51)

            expect(await saltVaultBulls.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)
            expect(await saltVaultBulls.tokenOfOwnerByIndex(owner, 1n)).to.equal(51)
        })

        it("when the address to transfer the token to is the zero address", async function () {
            await expect(saltVaultBulls.connect(owner).transferFrom(owner.address, ethers.ZeroAddress, 51)).to.revertedWith("ERC721: transfer to the zero address")
            await expect(mockedERC721Enumerable.connect(owner).transferFrom(owner.address, ethers.ZeroAddress, 51)).to.revertedWith("ERC721: transfer to the zero address")

            // keeps the ownership of the given token ID
            expect(await saltVaultBulls.ownerOf(51)).to.equal(owner)
            expect(await mockedERC721Enumerable.ownerOf(51)).to.equal(owner)

            // clears approval for the token ID
            expect(await saltVaultBulls.getApproved(51)).to.equal(approved)
            expect(await mockedERC721Enumerable.getApproved(51)).to.equal(approved)

            // keeps owners balances the same
            expect(await saltVaultBulls.balanceOf(owner)).to.equal(2n)
            expect(await mockedERC721Enumerable.balanceOf(owner)).to.equal(2n)

            // keeps tokenbyIndex the same
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(owner, 1n)).to.equal(51)

            expect(await saltVaultBulls.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)
            expect(await saltVaultBulls.tokenOfOwnerByIndex(owner, 1n)).to.equal(51)
        })

        // it("transfers token to MockedReceiver Contract", async function () {
        //     // deploy mocked ERC721Receiver contract
        //     const ERC721ReceiverMock = await ethers.getContractFactory("ERC721ReceiverMock")
        //     let erc721ReceiverMock = await ERC721ReceiverMock.deploy("0xdeadbeef", false)
        //     await erc721ReceiverMock.waitForDeployment()

        //     await mockedERC721Enumerable.connect(owner).transferFrom(owner, erc721ReceiverMock, 51)
        //     await saltVaultBulls.connect(owner).transferFrom(owner, erc721ReceiverMock, 51)

        //     expect(await mockedERC721Enumerable.ownerOf(51)).to.equal(erc721ReceiverMock.target)
        //     expect(await saltVaultBulls.ownerOf(51)).to.equal(erc721ReceiverMock.target)
        // })

        // Doesn't work right now
        // it("transfers token to MockedReceiver Contract reverts with custom error", async function () {
        //     // deploy mocked ERC721Receiver contract
        //     const ERC721ReceiverMock = await ethers.getContractFactory("ERC721ReceiverMockCustomError")
        //     let erc721ReceiverMock = await ERC721ReceiverMock.deploy("0xdeadbeef", true)
        //     await erc721ReceiverMock.waitForDeployment()

        //     await mockedERC721Enumerable.connect(owner).transferFrom(owner, erc721ReceiverMock, 51)
        //     await saltVaultBulls.connect(owner).transferFrom(owner, erc721ReceiverMock, 51)

        //     expect(await mockedERC721Enumerable.ownerOf(51)).to.equal(erc721ReceiverMock.target)
        //     expect(await saltVaultBulls.ownerOf(51)).to.equal(erc721ReceiverMock.target)
        // })
    })

    describe("safeTransferFrom tests", function () {
        let snapshotId: Network

        beforeEach(async function () {
            // Take a snapshot
            snapshotId = await network.provider.send("evm_snapshot")

            expect(await saltVaultBulls.isApprovedForAll(owner, operator)).to.equal(true)
            expect(await saltVaultBulls.getApproved(51)).to.equal(approved.address)
            expect(await saltVaultBulls.balanceOf(owner)).to.equal(2)
            expect(await saltVaultBulls.ownerOf(51)).to.equal(owner)
        })

        afterEach(async function () {
            // Revert to the snapshot after each test
            await network.provider.send("evm_revert", [snapshotId])
        })

        it("owner transfer token 51 to newOwner with Emit Event", async function () {
            await expect(mockedERC721Enumerable.connect(owner).safeTransferFrom(owner.address, newOwner.address, 51))
                .to.emit(mockedERC721Enumerable, "Transfer")
                .withArgs(owner.address, newOwner.address, 51)

            await expect(saltVaultBulls.connect(owner).safeTransferFrom(owner.address, newOwner.address, 51))
                .to.emit(erc721Facet, "Transfer")
                .withArgs(owner.address, newOwner.address, 51)

            // transfers the ownership of the given token ID to the given address
            expect(await saltVaultBulls.ownerOf(51)).to.equal(newOwner)
            expect(await mockedERC721Enumerable.ownerOf(51)).to.equal(newOwner)

            // clears the approval for the token ID
            expect(await saltVaultBulls.getApproved(51)).to.equal(ethers.ZeroAddress)
            expect(await mockedERC721Enumerable.getApproved(51)).to.equal(ethers.ZeroAddress)

            // adjusts owners balances
            expect(await saltVaultBulls.balanceOf(owner)).to.equal(1n)
            expect(await mockedERC721Enumerable.balanceOf(owner)).to.equal(1n)

            // adjusts owners tokens by index
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(newOwner, 0n)).to.equal(51)
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)

            expect(await saltVaultBulls.tokenOfOwnerByIndex(newOwner, 0n)).to.equal(51)
            expect(await saltVaultBulls.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)
        })

        it("approved transfers token 51 to newOwner with Emit Event", async function () {
            await expect(mockedERC721Enumerable.connect(approved).safeTransferFrom(owner.address, newOwner.address, 51))
                .to.emit(mockedERC721Enumerable, "Transfer")
                .withArgs(owner.address, newOwner.address, 51)

            await expect(saltVaultBulls.connect(owner).safeTransferFrom(owner.address, newOwner.address, 51))
                .to.emit(erc721Facet, "Transfer")
                .withArgs(owner.address, newOwner.address, 51)

            // transfers the ownership of the given token ID to the given address
            expect(await saltVaultBulls.ownerOf(51)).to.equal(newOwner)
            expect(await mockedERC721Enumerable.ownerOf(51)).to.equal(newOwner)

            // clears the approval for the token ID
            expect(await saltVaultBulls.getApproved(51)).to.equal(ethers.ZeroAddress)
            expect(await mockedERC721Enumerable.getApproved(51)).to.equal(ethers.ZeroAddress)

            // adjusts owners balances
            expect(await saltVaultBulls.balanceOf(owner)).to.equal(1n)
            expect(await mockedERC721Enumerable.balanceOf(owner)).to.equal(1n)

            // adjusts owners tokens by index
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(newOwner, 0n)).to.equal(51)
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)

            expect(await saltVaultBulls.tokenOfOwnerByIndex(newOwner, 0n)).to.equal(51)
            expect(await saltVaultBulls.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)
        })

        it("operator transfers token 51 to newOwner with Emit Event", async function () {
            await expect(mockedERC721Enumerable.connect(operator).safeTransferFrom(owner.address, newOwner.address, 51))
                .to.emit(mockedERC721Enumerable, "Transfer")
                .withArgs(owner.address, newOwner.address, 51)

            await expect(saltVaultBulls.connect(owner).safeTransferFrom(owner.address, newOwner.address, 51))
                .to.emit(erc721Facet, "Transfer")
                .withArgs(owner.address, newOwner.address, 51)

            // transfers the ownership of the given token ID to the given address
            expect(await saltVaultBulls.ownerOf(51)).to.equal(newOwner)
            expect(await mockedERC721Enumerable.ownerOf(51)).to.equal(newOwner)

            // clears the approval for the token ID
            expect(await saltVaultBulls.getApproved(51)).to.equal(ethers.ZeroAddress)
            expect(await mockedERC721Enumerable.getApproved(51)).to.equal(ethers.ZeroAddress)

            // adjusts owners balances
            expect(await saltVaultBulls.balanceOf(owner)).to.equal(1n)
            expect(await mockedERC721Enumerable.balanceOf(owner)).to.equal(1n)

            // adjusts owners tokens by index
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(newOwner, 0n)).to.equal(51)
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)

            expect(await saltVaultBulls.tokenOfOwnerByIndex(newOwner, 0n)).to.equal(51)
            expect(await saltVaultBulls.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)
        })

        it("when called by approved without approval", async function () {
            await saltVaultBulls.connect(owner).approve(ethers.ZeroAddress, 51)
            await mockedERC721Enumerable.connect(owner).approve(ethers.ZeroAddress, 51)
            expect(await saltVaultBulls.getApproved(51)).to.equal(ethers.ZeroAddress)
            expect(await mockedERC721Enumerable.getApproved(51)).to.equal(ethers.ZeroAddress)

            await expect(saltVaultBulls.connect(approved).safeTransferFrom(owner.address, newOwner.address, 51)).to.revertedWith("ERC721: caller is not token owner or approved")
            await expect(mockedERC721Enumerable.connect(approved).safeTransferFrom(owner.address, newOwner.address, 51)).to.revertedWith("ERC721: caller is not token owner or approved")

            // transfers the ownership of the given token ID to the given address
            expect(await saltVaultBulls.ownerOf(51)).to.equal(owner)
            expect(await mockedERC721Enumerable.ownerOf(51)).to.equal(owner)

            // approval for the token ID
            expect(await saltVaultBulls.getApproved(51)).to.equal(ethers.ZeroAddress)
            expect(await mockedERC721Enumerable.getApproved(51)).to.equal(ethers.ZeroAddress)

            // adjusts owners balances
            expect(await saltVaultBulls.balanceOf(owner)).to.equal(2n)
            expect(await mockedERC721Enumerable.balanceOf(owner)).to.equal(2n)

            // adjusts owners tokens by index
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(owner, 1n)).to.equal(51)

            expect(await saltVaultBulls.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)
            expect(await saltVaultBulls.tokenOfOwnerByIndex(owner, 1n)).to.equal(51)
        })

        it("when called by operator without being set to true", async function () {
            await saltVaultBulls.connect(owner).setApprovalForAll(operator, false)
            await mockedERC721Enumerable.connect(owner).setApprovalForAll(operator, false)

            expect(await saltVaultBulls.isApprovedForAll(owner, operator)).to.equal(false)
            expect(await mockedERC721Enumerable.isApprovedForAll(owner, operator)).to.equal(false)

            await expect(saltVaultBulls.connect(operator).safeTransferFrom(owner.address, newOwner.address, 51)).to.revertedWith("ERC721: caller is not token owner or approved")
            await expect(mockedERC721Enumerable.connect(operator).safeTransferFrom(owner.address, newOwner.address, 51)).to.revertedWith("ERC721: caller is not token owner or approved")

            // transfers the ownership of the given token ID to the given address
            expect(await saltVaultBulls.ownerOf(51)).to.equal(owner)
            expect(await mockedERC721Enumerable.ownerOf(51)).to.equal(owner)

            // approval for the token ID
            expect(await saltVaultBulls.getApproved(51)).to.equal(approved)
            expect(await mockedERC721Enumerable.getApproved(51)).to.equal(approved)

            // adjusts owners balances
            expect(await saltVaultBulls.balanceOf(owner)).to.equal(2n)
            expect(await mockedERC721Enumerable.balanceOf(owner)).to.equal(2n)

            // adjusts owners tokens by index
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(owner, 1n)).to.equal(51)

            expect(await saltVaultBulls.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)
            expect(await saltVaultBulls.tokenOfOwnerByIndex(owner, 1n)).to.equal(51)
        })

        it("when sent to owners own wallet by owner", async function () {
            await expect(mockedERC721Enumerable.connect(owner).safeTransferFrom(owner.address, owner.address, 51))
                .to.emit(mockedERC721Enumerable, "Transfer")
                .withArgs(owner.address, owner.address, 51)

            await expect(saltVaultBulls.connect(owner).safeTransferFrom(owner.address, owner.address, 51))
                .to.emit(erc721Facet, "Transfer")
                .withArgs(owner.address, owner.address, 51)

            // keeps the ownership of the given token ID
            expect(await saltVaultBulls.ownerOf(51)).to.equal(owner)
            expect(await mockedERC721Enumerable.ownerOf(51)).to.equal(owner)

            // clears approval for the token ID
            expect(await saltVaultBulls.getApproved(51)).to.equal(ethers.ZeroAddress)
            expect(await mockedERC721Enumerable.getApproved(51)).to.equal(ethers.ZeroAddress)

            // keeps owners balances the same
            expect(await saltVaultBulls.balanceOf(owner)).to.equal(2n)
            expect(await mockedERC721Enumerable.balanceOf(owner)).to.equal(2n)

            // keeps tokenbyIndex the same
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(owner, 1n)).to.equal(51)

            expect(await saltVaultBulls.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)
            expect(await saltVaultBulls.tokenOfOwnerByIndex(owner, 1n)).to.equal(51)
        })

        it("when the address of the previous owner is incorrect", async function () {
            await expect(saltVaultBulls.connect(owner).safeTransferFrom(newOwner.address, newOwner.address, 51)).to.revertedWith("ERC721: transfer from incorrect owner")
            await expect(mockedERC721Enumerable.connect(owner).safeTransferFrom(newOwner.address, newOwner.address, 51)).to.revertedWith("ERC721: transfer from incorrect owner")

            // keeps the ownership of the given token ID
            expect(await saltVaultBulls.ownerOf(51)).to.equal(owner)
            expect(await mockedERC721Enumerable.ownerOf(51)).to.equal(owner)

            // clears approval for the token ID
            expect(await saltVaultBulls.getApproved(51)).to.equal(approved)
            expect(await mockedERC721Enumerable.getApproved(51)).to.equal(approved)

            // keeps owners balances the same
            expect(await saltVaultBulls.balanceOf(owner)).to.equal(2n)
            expect(await mockedERC721Enumerable.balanceOf(owner)).to.equal(2n)

            // keeps tokenbyIndex the same
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(owner, 1n)).to.equal(51)

            expect(await saltVaultBulls.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)
            expect(await saltVaultBulls.tokenOfOwnerByIndex(owner, 1n)).to.equal(51)
        })

        it("when the sender is not authorized ", async function () {
            await expect(saltVaultBulls.connect(newOwner).safeTransferFrom(owner.address, newOwner.address, 51)).to.revertedWith("ERC721: caller is not token owner or approved")
            await expect(mockedERC721Enumerable.connect(newOwner).safeTransferFrom(owner.address, newOwner.address, 51)).to.revertedWith("ERC721: caller is not token owner or approved")

            // keeps the ownership of the given token ID
            expect(await saltVaultBulls.ownerOf(51)).to.equal(owner)
            expect(await mockedERC721Enumerable.ownerOf(51)).to.equal(owner)

            // clears approval for the token ID
            expect(await saltVaultBulls.getApproved(51)).to.equal(approved)
            expect(await mockedERC721Enumerable.getApproved(51)).to.equal(approved)

            // keeps owners balances the same
            expect(await saltVaultBulls.balanceOf(owner)).to.equal(2n)
            expect(await mockedERC721Enumerable.balanceOf(owner)).to.equal(2n)

            // keeps tokenbyIndex the same
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(owner, 1n)).to.equal(51)

            expect(await saltVaultBulls.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)
            expect(await saltVaultBulls.tokenOfOwnerByIndex(owner, 1n)).to.equal(51)
        })

        it("when the given token ID does not exist", async function () {
            await expect(saltVaultBulls.connect(owner).safeTransferFrom(owner.address, newOwner.address, 100)).to.revertedWith("ERC721: invalid token ID")
            await expect(mockedERC721Enumerable.connect(owner).safeTransferFrom(owner.address, newOwner.address, 100)).to.revertedWith("ERC721: invalid token ID")

            // keeps the ownership of the given token ID
            expect(await saltVaultBulls.ownerOf(51)).to.equal(owner)
            expect(await mockedERC721Enumerable.ownerOf(51)).to.equal(owner)

            // clears approval for the token ID
            expect(await saltVaultBulls.getApproved(51)).to.equal(approved)
            expect(await mockedERC721Enumerable.getApproved(51)).to.equal(approved)

            // keeps owners balances the same
            expect(await saltVaultBulls.balanceOf(owner)).to.equal(2n)
            expect(await mockedERC721Enumerable.balanceOf(owner)).to.equal(2n)

            // keeps tokenbyIndex the same
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(owner, 1n)).to.equal(51)

            expect(await saltVaultBulls.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)
            expect(await saltVaultBulls.tokenOfOwnerByIndex(owner, 1n)).to.equal(51)
        })

        it("when the address to transfer the token to is the zero address", async function () {
            await expect(saltVaultBulls.connect(owner).safeTransferFrom(owner.address, ethers.ZeroAddress, 51)).to.revertedWith("ERC721: transfer to the zero address")
            await expect(mockedERC721Enumerable.connect(owner).safeTransferFrom(owner.address, ethers.ZeroAddress, 51)).to.revertedWith("ERC721: transfer to the zero address")

            // keeps the ownership of the given token ID
            expect(await saltVaultBulls.ownerOf(51)).to.equal(owner)
            expect(await mockedERC721Enumerable.ownerOf(51)).to.equal(owner)

            // clears approval for the token ID
            expect(await saltVaultBulls.getApproved(51)).to.equal(approved)
            expect(await mockedERC721Enumerable.getApproved(51)).to.equal(approved)

            // keeps owners balances the same
            expect(await saltVaultBulls.balanceOf(owner)).to.equal(2n)
            expect(await mockedERC721Enumerable.balanceOf(owner)).to.equal(2n)

            // keeps tokenbyIndex the same
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)
            expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(owner, 1n)).to.equal(51)

            expect(await saltVaultBulls.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)
            expect(await saltVaultBulls.tokenOfOwnerByIndex(owner, 1n)).to.equal(51)
        })

        // it("transfers token to MockedReceiver Contract", async function () {
        //     // deploy mocked ERC721Receiver contract
        //     const ERC721ReceiverMock = await ethers.getContractFactory("ERC721ReceiverMock")
        //     let erc721ReceiverMock = await ERC721ReceiverMock.deploy("0xdeadbeef", false)
        //     await erc721ReceiverMock.waitForDeployment()

        //     await mockedERC721Enumerable.connect(owner).safeTransferFrom(owner, erc721ReceiverMock, 51)
        //     await saltVaultBulls.connect(owner).safeTransferFrom(owner, erc721ReceiverMock, 51)

        //     expect(await mockedERC721Enumerable.ownerOf(51)).to.equal(erc721ReceiverMock.target)
        //     expect(await saltVaultBulls.ownerOf(51)).to.equal(erc721ReceiverMock.target)
        // })

        // Doesn't work right now
        // it("transfers token to MockedReceiver Contract reverts with custom error", async function () {
        //     // deploy mocked ERC721Receiver contract
        //     const ERC721ReceiverMock = await ethers.getContractFactory("ERC721ReceiverMockCustomError")
        //     let erc721ReceiverMock = await ERC721ReceiverMock.deploy("0xdeadbeef", true)
        //     await erc721ReceiverMock.waitForDeployment()

        //     await mockedERC721Enumerable.connect(owner).safeTransferFrom(owner, erc721ReceiverMock, 51)
        //     await saltVaultBulls.connect(owner).safeTransferFrom(owner, erc721ReceiverMock, 51)

        //     expect(await mockedERC721Enumerable.ownerOf(51)).to.equal(erc721ReceiverMock.target)
        //     expect(await saltVaultBulls.ownerOf(51)).to.equal(erc721ReceiverMock.target)
        // })
    })

    // describe("should transfer safely to Mocked contract", function () {})

    // describe("to a receiver contract that reverts with message", function () {
    //     it("reverts", async function () {
    //         const revertingReceiver = await ethers.deployContract("ERC721ReceiverMockWithMessage", [RECEIVER_MAGIC_VALUE, RevertType.RevertWithMessage])

    //         await expect(this.token.connect(this.owner)[fnName](this.owner, revertingReceiver, tokenId)).to.be.revertedWith("ERC721ReceiverMock: reverting")
    //     })
    // })

    describe("mint(rarity, addressToMint)", function () {
        it("reverts with a null destination address", async function () {
            await expect(mockedERC721Enumerable.connect(owner).mint(5, ethers.ZeroAddress)).to.revertedWith("ERC721: mint to the zero address")
            await expect(saltVaultBulls.connect(owner).mint(5, ethers.ZeroAddress)).to.revertedWith("ERC20: insufficient allowance") // tries to withdraw USDC from zeroAddress
        })
    })

    describe("ERC721Enumerable ", function () {
        describe("totalSupply", function () {
            it("returns total token supply", async function () {
                expect(await mockedERC721Enumerable.totalSupply()).to.equal(2n)
                expect(await saltVaultBulls.totalSupply()).to.equal(2n)
            })
        })

        describe("tokenOfOwnerByIndex", function () {
            describe("when the given index is lower than the amount of tokens owned by the given address", function () {
                it("returns the token ID placed at the given index", async function () {
                    expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)
                    expect(await saltVaultBulls.tokenOfOwnerByIndex(owner, 0n)).to.equal(1)
                })
            })

            describe("when the index is greater than or equal to the total tokens owned by the given address", function () {
                it("reverts", async function () {
                    await expect(mockedERC721Enumerable.tokenOfOwnerByIndex(owner, 2n)).to.revertedWith("ERC721Enumerable: owner index out of bounds")
                    await expect(saltVaultBulls.tokenOfOwnerByIndex(owner, 2n)).to.revertedWith("ERC721Enumerable: owner index out of bounds")
                })
            })

            describe("when the given address does not own any token", function () {
                it("reverts", async function () {
                    await expect(mockedERC721Enumerable.tokenOfOwnerByIndex(newOwner, 0n)).to.revertedWith("ERC721Enumerable: owner index out of bounds")
                })
            })

            describe("after transferring all tokens to another user", function () {
                it("returns correct token IDs for target", async function () {
                    await mockedERC721Enumerable.connect(owner).safeTransferFrom(owner, newOwner, 1)
                    await mockedERC721Enumerable.connect(owner).safeTransferFrom(owner, newOwner, 51)
                    expect(await mockedERC721Enumerable.balanceOf(newOwner)).to.equal(2n)
                    expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(newOwner, 0)).to.equal(1n)
                    expect(await mockedERC721Enumerable.tokenOfOwnerByIndex(newOwner, 1)).to.equal(51n)
                })
            })
        })
    })
})
