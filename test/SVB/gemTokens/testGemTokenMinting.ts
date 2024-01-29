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
        gemTokenChallengeFacet = await ethers.getContractAt("GemTokenChallengeFacet", diamondAddress)

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

        // ERC721 External  Salt Vault Bulls
        const SaltVaultBulls = await ethers.getContractFactory("SaltVaultBulls")
        saltVaultBulls = await SaltVaultBulls.deploy(diamondAddress)
        await saltVaultBulls.waitForDeployment()

        // ERC721 External  Salt Vault Bulls
        const SVB_GemTokens = await ethers.getContractFactory("SVB_GemTokens")
        svbGemTokens = await SVB_GemTokens.deploy(diamondAddress)
        await svbGemTokens.waitForDeployment()

        // Transfer tokens from signers[30] to signers[1] through signers[17]
        const amount = ethers.parseUnits("10000", 6) // Assuming MockedUSDC uses 6 decimal places

        for (let i = 10; i <= 20; i++) {
            await mockedUSDC.connect(signers[30]).transfer(signers[i].address, amount)
        }

        // gemTokenChallengeFacet

        let shuffledIndices = [14, 300, 500, 800, 1000, 1100, 5, 5820, 4219, 7752, 1251, 420, 8398, 3176, 3110, 9253, 5379, 9140, 8585, 4503]

        gemTokenChallengeFacet.connect(owner).addShuffledIndexesBatch(shuffledIndices)

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

        let redTokenData = [[1, 225, 1]]

        gemTokenChallengeFacet.connect(signers[5]).bulkPopulateTokens(redTokenData, "Reed")
    })

    it("should have seven facets -- call to facetAddresses function", async () => {
        for (const address of await diamondLoupeFacet.facetAddresses()) {
            addresses.push(address)
        }
        console.log({ addresses })
        assert.equal(addresses.length, 8)
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

    describe("Gem Token Checks", function () {
        describe("Gem Tokens", function () {
            it("Confirm Gem Token External Contract is set on the diamond", async function () {
                expect(await svbGemTokens.isContractApprovedToMint()).to.equal(false)

                await adminSetterFacet.seteAuthorizeExternalContractsForERC721Facet(svbGemTokens.target, true)

                expect(await svbGemTokens.isContractApprovedToMint()).to.equal(true)
            })

            it("set mintingLive for GemTokens", async function () {
                expect(await svbGemTokens.isMintingLive()).to.equal(false)

                expect(await svbGemTokens.checkClaimEligibility(1)).to.equal("Mint is not Live or Gem Tokens are sold out")
                expect(await svbGemTokens.checkClaimEligibility(3)).to.equal("Mint is not Live or Gem Tokens are sold out")
                expect(await svbGemTokens.checkClaimEligibility(6)).to.equal("Mint is not Live or Gem Tokens are sold out")
                expect(await svbGemTokens.checkClaimEligibility(9)).to.equal("Mint is not Live or Gem Tokens are sold out")
                expect(await svbGemTokens.checkClaimEligibility(12)).to.equal("Mint is not Live or Gem Tokens are sold out")
                expect(await svbGemTokens.checkClaimEligibility(15)).to.equal("Mint is not Live or Gem Tokens are sold out")

                expect(await svbGemTokens.getCostAndMintEligibility(1)).to.equal(0) // should return zero when set to false

                await svbGemTokens.connect(owner).setMintingLive(true)

                expect(await svbGemTokens.getCostAndMintEligibility(1)).to.equal(15 * 10 ** 6) // should return zero when set to false

                expect(await svbGemTokens.checkClaimEligibility(1)).to.equal("")
                expect(await svbGemTokens.checkClaimEligibility(3)).to.equal("")
                expect(await svbGemTokens.checkClaimEligibility(6)).to.equal("")
                expect(await svbGemTokens.checkClaimEligibility(9)).to.equal("")
                expect(await svbGemTokens.checkClaimEligibility(12)).to.equal("")
                expect(await svbGemTokens.checkClaimEligibility(15)).to.equal("")

                expect(await svbGemTokens.isMintingLive()).to.equal(true)
            })

            it("gem Token Price is returned correctly", async function () {
                let returnedCost = await svbGemTokens.getCostAndMintEligibility(1)
                assert.equal(returnedCost, 15 * 10 ** 6)

                returnedCost = await svbGemTokens.getCostAndMintEligibility(2)
                assert.equal(returnedCost, 30 * 10 ** 6)

                returnedCost = await svbGemTokens.getCostAndMintEligibility(10)
                assert.equal(returnedCost, 150 * 10 ** 6)

                returnedCost = await svbGemTokens.getCostAndMintEligibility(15)
                assert.equal(returnedCost, 15 * 15 * 10 ** 6)

                returnedCost = await svbGemTokens.getCostAndMintEligibility(20)
                assert.equal(returnedCost, 20 * 15 * 10 ** 6)
            })

            it("gem Token price reverts when quantity is more than 10", async function () {
                await expect(svbGemTokens.getCostAndMintEligibility(21)).to.revertedWith("20 of less mints per tx only")
            })

            it("gem Token price reverts when quantity is zero", async function () {
                await expect(svbGemTokens.getCostAndMintEligibility(0)).to.revertedWith("quantity can't be zero")
            })

            it("confirm freeMints for the owner are correct", async function () {
                let totalFreeMintForPerson = await svbGemTokens.connect(signers[10]).getAvailableFreeGemStoneMints()
                console.log("total Free mints:", totalFreeMintForPerson)
            })
        })
    })

    describe("using credits to mint gem tokens", function () {
        let snapshotId: Network

        beforeEach(async function () {
            // Take a snapshot
            snapshotId = await network.provider.send("evm_snapshot")
        })

        afterEach(async function () {
            // Revert to the snapshot after each test
            await network.provider.send("evm_revert", [snapshotId])
        })

        it("person10 mints all 7 credits to mint free gem token NFTs", async function () {
            expect(await svbGemTokens.connect(signers[10]).getAvailableFreeGemStoneMints()).to.equal(7n)

            await expect(svbGemTokens.connect(signers[10]).mintWithCredits(7)).to.emit(erc721Facet, "GemTokensMintedWithCredits").withArgs(signers[10], 7)

            // console.log("balance of p10", await svbGemTokens.balanceOf(signers[10]))

            // console.log("walletOfOwner(p10)", await svbGemTokens.walletOfOwner(signers[10]))

            // console.log("credit left:", await svbGemTokens.connect(signers[10]).getAvailableFreeGemStoneMints())

            // [14, 300, 500, 800, 1000, 1100, 5, 5820, 4219, 7752, 1251, 420, 8398, 3176, 3110, 9253, 5379, 9140, 8585, 4503]

            // assert credits left are correct
            expect(await svbGemTokens.connect(signers[10]).getAvailableFreeGemStoneMints()).to.equal(0n)

            // confirm balance of tokens
            expect(await svbGemTokens.balanceOf(signers[10])).to.equal(7n)

            // transfers the ownership of the given token ID to the given address
            expect(await svbGemTokens.ownerOf(14)).to.equal(signers[10])
            expect(await svbGemTokens.ownerOf(300)).to.equal(signers[10])
            expect(await svbGemTokens.ownerOf(500)).to.equal(signers[10])
            expect(await svbGemTokens.ownerOf(800)).to.equal(signers[10])

            let tokens = await svbGemTokens.walletOfOwner(signers[10])

            // Convert BigNumber to BigInt
            let tokenIds = tokens.map((token) => BigInt(token.toString()))

            // Define the expected array
            let expectedTokens = [14n, 300n, 500n, 800n, 1000n, 1100n, 5n]

            // Assert equality
            expect(tokenIds).to.have.members(expectedTokens)

            // approval for the token is zero Addr
            expect(await svbGemTokens.getApproved(14)).to.equal(ethers.ZeroAddress)

            // adjusts owners tokens by index
            expect(await svbGemTokens.tokenOfOwnerByIndex(signers[10], 0n)).to.equal(14)
            expect(await svbGemTokens.tokenOfOwnerByIndex(signers[10], 1n)).to.equal(300)
        })

        it("person10 mints 4 of 7 credits to mint free gem token NFTs", async function () {
            expect(await svbGemTokens.connect(signers[10]).getAvailableFreeGemStoneMints()).to.equal(7n)

            await expect(svbGemTokens.connect(signers[10]).mintWithCredits(4)).to.emit(erc721Facet, "GemTokensMintedWithCredits").withArgs(signers[10], 4)

            // [14, 300, 500, 800, 1000, 1100, 5, 5820, 4219, 7752, 1251, 420, 8398, 3176, 3110, 9253, 5379, 9140, 8585, 4503]

            // assert credits left are correct
            expect(await svbGemTokens.connect(signers[10]).getAvailableFreeGemStoneMints()).to.equal(3n)

            // confirm balance of tokens
            expect(await svbGemTokens.balanceOf(signers[10])).to.equal(4n)

            // transfers the ownership of the given token ID to the given address
            expect(await svbGemTokens.ownerOf(14)).to.equal(signers[10])
            expect(await svbGemTokens.ownerOf(300)).to.equal(signers[10])
            expect(await svbGemTokens.ownerOf(500)).to.equal(signers[10])
            expect(await svbGemTokens.ownerOf(800)).to.equal(signers[10])

            let tokens = await svbGemTokens.walletOfOwner(signers[10])

            // Convert BigNumber to BigInt
            let tokenIds = tokens.map((token) => BigInt(token.toString()))

            // Define the expected array
            let expectedTokens = [14n, 300n, 500n, 800n]

            // Assert equality
            expect(tokenIds).to.have.members(expectedTokens)

            // approval for the token is zero Addr
            expect(await svbGemTokens.getApproved(14)).to.equal(ethers.ZeroAddress)

            // adjusts owners tokens by index
            expect(await svbGemTokens.tokenOfOwnerByIndex(signers[10], 0n)).to.equal(14)
            expect(await svbGemTokens.tokenOfOwnerByIndex(signers[10], 1n)).to.equal(300)
        })

        it("person10 mints 4 of 7  then the last 3 credits to mint free gem token NFTs", async function () {
            expect(await svbGemTokens.connect(signers[10]).getAvailableFreeGemStoneMints()).to.equal(7n)

            await expect(svbGemTokens.connect(signers[10]).mintWithCredits(4)).to.emit(erc721Facet, "GemTokensMintedWithCredits").withArgs(signers[10], 4)

            // [14, 300, 500, 800, 1000, 1100, 5, 5820, 4219, 7752, 1251, 420, 8398, 3176, 3110, 9253, 5379, 9140, 8585, 4503]

            // assert credits left are correct
            expect(await svbGemTokens.connect(signers[10]).getAvailableFreeGemStoneMints()).to.equal(3n)

            // confirm balance of tokens
            expect(await svbGemTokens.balanceOf(signers[10])).to.equal(4n)

            // transfers the ownership of the given token ID to the given address
            expect(await svbGemTokens.ownerOf(14)).to.equal(signers[10])
            expect(await svbGemTokens.ownerOf(300)).to.equal(signers[10])
            expect(await svbGemTokens.ownerOf(500)).to.equal(signers[10])
            expect(await svbGemTokens.ownerOf(800)).to.equal(signers[10])

            let tokens = await svbGemTokens.walletOfOwner(signers[10])

            // Convert BigNumber to BigInt
            let tokenIds = tokens.map((token) => BigInt(token.toString()))

            // Define the expected array
            let expectedTokens = [14n, 300n, 500n, 800n]

            // Assert equality
            expect(tokenIds).to.have.members(expectedTokens)

            // approval for the token is zero Addr
            expect(await svbGemTokens.getApproved(14)).to.equal(ethers.ZeroAddress)

            // adjusts owners tokens by index
            expect(await svbGemTokens.tokenOfOwnerByIndex(signers[10], 0n)).to.equal(14)
            expect(await svbGemTokens.tokenOfOwnerByIndex(signers[10], 1n)).to.equal(300)

            await expect(svbGemTokens.connect(signers[10]).mintWithCredits(3)).to.emit(erc721Facet, "GemTokensMintedWithCredits").withArgs(signers[10], 3)

            // [14, 300, 500, 800, 1000, 1100, 5, 5820, 4219, 7752, 1251, 420, 8398, 3176, 3110, 9253, 5379, 9140, 8585, 4503]

            // assert credits left are correct
            expect(await svbGemTokens.connect(signers[10]).getAvailableFreeGemStoneMints()).to.equal(0n)

            // confirm balance of tokens
            expect(await svbGemTokens.balanceOf(signers[10])).to.equal(7n)

            // transfers the ownership of the given token ID to the given address
            expect(await svbGemTokens.ownerOf(14)).to.equal(signers[10])
            expect(await svbGemTokens.ownerOf(300)).to.equal(signers[10])
            expect(await svbGemTokens.ownerOf(500)).to.equal(signers[10])
            expect(await svbGemTokens.ownerOf(800)).to.equal(signers[10])

            tokens = await svbGemTokens.walletOfOwner(signers[10])

            // Convert BigNumber to BigInt
            tokenIds = tokens.map((token) => BigInt(token.toString()))

            // Define the expected array
            expectedTokens = [14n, 300n, 500n, 800n, 1000n, 1100n, 5n]

            // Assert equality
            expect(tokenIds).to.have.members(expectedTokens)

            // approval for the token is zero Addr
            expect(await svbGemTokens.getApproved(14)).to.equal(ethers.ZeroAddress)

            // adjusts owners tokens by index
            expect(await svbGemTokens.tokenOfOwnerByIndex(signers[10], 0n)).to.equal(14)
            expect(await svbGemTokens.tokenOfOwnerByIndex(signers[10], 1n)).to.equal(300)
        })

        it("reverts when trying to mint more than 20 using credits", async function () {
            expect(await svbGemTokens.connect(signers[10]).getAvailableFreeGemStoneMints()).to.equal(7n)

            await expect(svbGemTokens.connect(signers[10]).mintWithCredits(21)).to.revertedWith("20 of less mints per tx only")

            // assert credits left are correct
            expect(await svbGemTokens.connect(signers[10]).getAvailableFreeGemStoneMints()).to.equal(7n) // shouldn't move

            // confirm balance of tokens
            expect(await svbGemTokens.balanceOf(signers[10])).to.equal(0n)
        })

        it("reverts when trying to mint with more credits than they have", async function () {
            expect(await svbGemTokens.connect(signers[10]).getAvailableFreeGemStoneMints()).to.equal(7n)

            await expect(svbGemTokens.connect(signers[10]).mintWithCredits(10)).to.revertedWith("Exceeds the credits for this address")

            // assert credits left are correct
            expect(await svbGemTokens.connect(signers[10]).getAvailableFreeGemStoneMints()).to.equal(7n) // shouldn't move

            // confirm balance of tokens
            expect(await svbGemTokens.balanceOf(signers[10])).to.equal(0n)
        })
    })
    describe("buying Gem Token using USDC", function () {
        let snapshotId: Network

        beforeEach(async function () {
            // Take a snapshot
            snapshotId = await network.provider.send("evm_snapshot")
        })

        afterEach(async function () {
            // Revert to the snapshot after each test
            await network.provider.send("evm_revert", [snapshotId])
        })

        it("person10 mints all 1 Gem token NFTs using USDC", async function () {
            let costToMintGemTokens = await svbGemTokens.getCostAndMintEligibility(1)
            assert.equal(costToMintGemTokens, 15 * 10 ** 6)

            let beforeMockedUsdcBalanceSigner10 = await mockedUSDC.balanceOf(signers[10])

            let beforeMockedUsdcBalanceDiamond = await mockedUSDC.balanceOf(diamondAddress)

            // console.log("beforeMockedUsdcBalanceSigner10", Number(beforeMockedUsdcBalanceSigner10) / 10 ** 6)

            // console.log("balance of p10 before", await svbGemTokens.balanceOf(signers[10]))

            // Approve the proxySVB contract to spend tokens
            await mockedUSDC.connect(signers[10]).approve(svbGemTokens.target, costToMintGemTokens)

            expect(await svbGemTokens.connect(signers[10]).getAvailableFreeGemStoneMints()).to.equal(7n)

            await expect(svbGemTokens.connect(signers[10]).mintWithUsdc(1)).to.emit(erc721Facet, "GemTokensMintedWithUsdc").withArgs(signers[10], 1, costToMintGemTokens)

            // console.log("balance of p10 after", await svbGemTokens.balanceOf(signers[10]))

            // console.log("walletOfOwner(p10)", await svbGemTokens.walletOfOwner(signers[10]))

            // console.log("credit left:", await svbGemTokens.connect(signers[10]).getAvailableFreeGemStoneMints())

            // console.log("totalSupply():", await svbGemTokens.totalSupply())

            // [14, 300, 500, 800, 1000, 1100, 5, 5820, 4219, 7752, 1251, 420, 8398, 3176, 3110, 9253, 5379, 9140, 8585, 4503]

            // assert credits left are correct
            expect(await svbGemTokens.connect(signers[10]).getAvailableFreeGemStoneMints()).to.equal(7n) // shouldn't move

            // assert balance of Gem Tokens Minted
            expect(await svbGemTokens.balanceOf(signers[10])).to.equal(1n)

            // assert mocked balance is correct for signer[10]
            let afterMockedUsdcBalanceSigner10 = await mockedUSDC.balanceOf(signers[10])

            expect(Number(beforeMockedUsdcBalanceSigner10) - Number(afterMockedUsdcBalanceSigner10)).to.equal(Number(costToMintGemTokens))

            // assert mocked balance is diamond increased
            let afterMockedUsdcBalanceDiamond = await mockedUSDC.balanceOf(diamondAddress)
            expect(Number(beforeMockedUsdcBalanceDiamond) + Number(costToMintGemTokens)).to.equal(Number(afterMockedUsdcBalanceDiamond))

            // transfers the ownership of the given token ID to the given address
            expect(await svbGemTokens.ownerOf(14)).to.equal(signers[10])

            let tokens = await svbGemTokens.walletOfOwner(signers[10])

            // Convert BigNumber to BigInt
            let tokenIds = tokens.map((token) => BigInt(token.toString()))

            // Define the expected array
            let expectedTokens = [14n]

            // Assert equality
            expect(tokenIds).to.have.members(expectedTokens)

            // approval for the token is zero Addr
            expect(await svbGemTokens.getApproved(14)).to.equal(ethers.ZeroAddress)

            // adjusts owners tokens by index
            expect(await svbGemTokens.tokenOfOwnerByIndex(signers[10], 0n)).to.equal(14)
        })

        it("person10 mints all 7 Gem token NFTs using USDC", async function () {
            let costToMintGemTokens = await svbGemTokens.getCostAndMintEligibility(7)
            assert.equal(costToMintGemTokens, 7 * 15 * 10 ** 6)

            let beforeMockedUsdcBalanceSigner10 = await mockedUSDC.balanceOf(signers[10])

            let beforeMockedUsdcBalanceDiamond = await mockedUSDC.balanceOf(diamondAddress)

            // Approve the proxySVB contract to spend tokens
            await mockedUSDC.connect(signers[10]).approve(svbGemTokens.target, costToMintGemTokens)

            expect(await svbGemTokens.connect(signers[10]).getAvailableFreeGemStoneMints()).to.equal(7n)

            await expect(svbGemTokens.connect(signers[10]).mintWithUsdc(7)).to.emit(erc721Facet, "GemTokensMintedWithUsdc").withArgs(signers[10], 7, costToMintGemTokens)

            // [14, 300, 500, 800, 1000, 1100, 5, 5820, 4219, 7752, 1251, 420, 8398, 3176, 3110, 9253, 5379, 9140, 8585, 4503]

            // assert credits left are correct
            expect(await svbGemTokens.connect(signers[10]).getAvailableFreeGemStoneMints()).to.equal(7n) // shouldn't move

            // assert balance of Gem Tokens Minted
            expect(await svbGemTokens.balanceOf(signers[10])).to.equal(7n)

            // assert mocked balance is correct for signer[10]
            let afterMockedUsdcBalanceSigner10 = await mockedUSDC.balanceOf(signers[10])

            expect(Number(beforeMockedUsdcBalanceSigner10) - Number(afterMockedUsdcBalanceSigner10)).to.equal(Number(costToMintGemTokens))

            // assert mocked balance is diamond increased
            let afterMockedUsdcBalanceDiamond = await mockedUSDC.balanceOf(diamondAddress)
            expect(Number(beforeMockedUsdcBalanceDiamond) + Number(costToMintGemTokens)).to.equal(Number(afterMockedUsdcBalanceDiamond))

            // transfers the ownership of the given token ID to the given address
            expect(await svbGemTokens.ownerOf(14)).to.equal(signers[10])

            let tokens = await svbGemTokens.walletOfOwner(signers[10])

            // Convert BigNumber to BigInt
            let tokenIds = tokens.map((token) => BigInt(token.toString()))

            // Define the expected array
            let expectedTokens = [14n, 300n, 500n, 800n, 1000n, 1100n, 5n]

            // Assert equality
            expect(tokenIds).to.have.members(expectedTokens)

            // approval for the token is zero Addr
            expect(await svbGemTokens.getApproved(14)).to.equal(ethers.ZeroAddress)

            // adjusts owners tokens by index
            expect(await svbGemTokens.tokenOfOwnerByIndex(signers[10], 0n)).to.equal(14)
        })

        it("reverts when trying to buy more than 20 using USDC", async function () {
            let beforeMockedUsdcBalanceSigner10 = await mockedUSDC.balanceOf(signers[10])

            let beforeMockedUsdcBalanceDiamond = await mockedUSDC.balanceOf(diamondAddress)

            // Approve the proxySVB contract to spend tokens
            await mockedUSDC.connect(signers[10]).approve(svbGemTokens.target, 21 * 10 ** 6)

            expect(await svbGemTokens.connect(signers[10]).getAvailableFreeGemStoneMints()).to.equal(7n)

            await expect(svbGemTokens.connect(signers[10]).mintWithUsdc(21)).to.revertedWith("20 of less mints per tx only")

            // assert credits left are correct
            expect(await svbGemTokens.connect(signers[10]).getAvailableFreeGemStoneMints()).to.equal(7n) // shouldn't move

            // assert balance of Gem Tokens Minted
            expect(await svbGemTokens.balanceOf(signers[10])).to.equal(0n)

            // assert mocked balance is correct for signer[10]
            let afterMockedUsdcBalanceSigner10 = await mockedUSDC.balanceOf(signers[10])

            expect(Number(beforeMockedUsdcBalanceSigner10) - Number(afterMockedUsdcBalanceSigner10)).to.equal(0)

            // assert mocked balance is diamond increased
            let afterMockedUsdcBalanceDiamond = await mockedUSDC.balanceOf(diamondAddress)
            expect(Number(beforeMockedUsdcBalanceDiamond)).to.equal(Number(afterMockedUsdcBalanceDiamond))
        })

        it("Bulls and Gemtokens are seperated in the storage", async function () {
            let costToMintGemTokens = await svbGemTokens.getCostAndMintEligibility(7)
            assert.equal(costToMintGemTokens, 7 * 15 * 10 ** 6)

            let beforeMockedUsdcBalanceSigner10 = await mockedUSDC.balanceOf(signers[10])

            let beforeMockedUsdcBalanceDiamond = await mockedUSDC.balanceOf(diamondAddress)

            // Approve the proxySVB contract to spend tokens
            await mockedUSDC.connect(signers[10]).approve(svbGemTokens.target, costToMintGemTokens)

            expect(await svbGemTokens.connect(signers[10]).getAvailableFreeGemStoneMints()).to.equal(7n)

            await expect(svbGemTokens.connect(signers[10]).mintWithUsdc(7)).to.emit(erc721Facet, "GemTokensMintedWithUsdc").withArgs(signers[10], 7, costToMintGemTokens)

            // [14, 300, 500, 800, 1000, 1100, 5, 5820, 4219, 7752, 1251, 420, 8398, 3176, 3110, 9253, 5379, 9140, 8585, 4503]

            // assert credits left are correct
            expect(await svbGemTokens.connect(signers[10]).getAvailableFreeGemStoneMints()).to.equal(7n) // shouldn't move

            // assert balance of Gem Tokens Minted
            expect(await svbGemTokens.balanceOf(signers[10])).to.equal(7n)

            // assert mocked balance is correct for signer[10]
            let afterMockedUsdcBalanceSigner10 = await mockedUSDC.balanceOf(signers[10])

            expect(Number(beforeMockedUsdcBalanceSigner10) - Number(afterMockedUsdcBalanceSigner10)).to.equal(Number(costToMintGemTokens))

            // assert mocked balance is diamond increased
            let afterMockedUsdcBalanceDiamond = await mockedUSDC.balanceOf(diamondAddress)
            expect(Number(beforeMockedUsdcBalanceDiamond) + Number(costToMintGemTokens)).to.equal(Number(afterMockedUsdcBalanceDiamond))

            // transfers the ownership of the given token ID to the given address
            expect(await svbGemTokens.ownerOf(14)).to.equal(signers[10])

            let tokens = await svbGemTokens.walletOfOwner(signers[10])

            // Convert BigNumber to BigInt
            let tokenIds = tokens.map((token) => BigInt(token.toString()))

            // Define the expected array
            let expectedTokens = [14n, 300n, 500n, 800n, 1000n, 1100n, 5n]

            // Assert equality
            expect(tokenIds).to.have.members(expectedTokens)

            // approval for the token is zero Addr
            expect(await svbGemTokens.getApproved(14)).to.equal(ethers.ZeroAddress)

            // adjusts owners tokens by index
            expect(await svbGemTokens.tokenOfOwnerByIndex(signers[10], 0n)).to.equal(14)

            ////
            //// confirm bulls
            ////
            expect(await saltVaultBulls.balanceOf(signers[10])).to.equal(1n)
            expect(await saltVaultBulls.tokenOfOwnerByIndex(signers[10], 0n)).to.equal(1)
            expect(await saltVaultBulls.totalSupply()).to.equal(1)

            //
            // confirm diamond balance
            //

            let expectedAmountSpent = 2605 * 10 ** 6

            expect(await mockedUSDC.balanceOf(signers[10])).to.equal(7_395 * 10 ** 6)

            // console.log("mockedUSDC balance of p10:", await mockedUSDC.balanceOf(signers[10]))
            // console.log("mockedUSDC balance of saltVaultBulls:", await mockedUSDC.balanceOf(saltVaultBulls.target))
            // console.log("mockedUSDC balance of dimaond:", await mockedUSDC.balanceOf(diamondAddress))
            // console.log("mockedUSDC balance of saltVaultBulls:", await mockedUSDC.balanceOf(saltVaultBulls.target))

            // assert saltVaultBulls contract USDC balance is zero
            expect(await mockedUSDC.balanceOf(saltVaultBulls.target)).to.equal(0)

            // assert diamondAddress contract USDC balance is zero
            expect(await mockedUSDC.balanceOf(diamondAddress)).to.equal(expectedAmountSpent)

            let coreTeamBalance = await infoGetterFacet.getCoreTeamBalance()
            let vaultHoldingBalance = await infoGetterFacet.getVaultHoldingBalance()
            let totalRewardBalance = await infoGetterFacet.getTotalRewardBalance()
            let vaultCouncilBalance = await infoGetterFacet.getVaultCouncilBalance()
            let gemTokenChallangeBalance = await infoGetterFacet.getGemTokenChallengeBalance()

            // console.log("CoreTeamBalance:", Number(coreTeamBalance) / 10 ** 6)
            // console.log("vaultHoldingBalance:", Number(vaultHoldingBalance) / 10 ** 6)
            // console.log("totalRewardBalance:", totalRewardBalance)
            // console.log("vaultCouncilBalance:", vaultCouncilBalance)
            // console.log("gemTokenChallangeBalance:", Number(gemTokenChallangeBalance) / 10 ** 6)

            let expectedCoreTeamBalance = 2500 * 10 ** 6 * 0.1 + 52.5 * 10 ** 6

            // console.log("expectedCoreTeamBalance:", Number(expectedCoreTeamBalance) / 10 ** 6)

            expect(Number(coreTeamBalance)).to.equal(expectedCoreTeamBalance)
            expect(Number(vaultHoldingBalance)).to.equal(2500 * 10 ** 6 * 0.9)
        })
    })
})
