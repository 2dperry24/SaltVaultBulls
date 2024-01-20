/* global describe it before ethers */

import { getSelectors, FacetCutAction, removeSelectors, findAddressPositionInFacets } from "../../../scripts/diamond"
import { deploy } from "../../../scripts/deploy"
import { assert, expect } from "chai"
import { ethers, network } from "hardhat"
import { Contract } from "ethers"
import { Network } from "@ethersproject/providers"

describe("InitializationTest", async function () {
    this.timeout(60000) // Set timeout to 60 seconds

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

    let snapshotId: Network

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
    let vaultFacet: any

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
    let dcaWallet: any
    let dcaApprovedControlWallet: any
    let qauntWallet: any
    let quantApprovedControlWallet: any

    let signers: any

    let totalMintedUSDCamount: any

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
        vaultFacet = await ethers.getContractAt("VaultFacet", diamondAddress)

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

        dcaWallet = signers[31]
        qauntWallet = signers[32]
        dcaApprovedControlWallet = signers[33]
        quantApprovedControlWallet = signers[34]

        // SaltVaultToken
        const SaltVaultToken = await ethers.getContractFactory("SaltVaultToken")
        saltVaultToken = await SaltVaultToken.deploy()
        await saltVaultToken.waitForDeployment()

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
        const SVB_GemTokens = await ethers.getContractFactory("SVB_GemTokens")
        svbGemTokens = await SVB_GemTokens.deploy(diamondAddress)
        await svbGemTokens.waitForDeployment()

        // Transfer tokens from signers[30] to signers[1] through signers[17]
        const amount = ethers.parseUnits("100000", 6) // Assuming MockedUSDC uses 6 decimal places

        for (let i = 10; i <= 20; i++) {
            await mockedUSDC.connect(signers[30]).transfer(signers[i].address, amount)
        }

        await mockedUSDC.connect(signers[30]).transfer(owner.address, amount)
    })

    it("should have seven facets -- call to facetAddresses function", async () => {
        for (const address of await diamondLoupeFacet.facetAddresses()) {
            addresses.push(address)
        }
        console.log({ addresses })
        assert.equal(addresses.length, 11)
    })

    it("Test p10 has 10,000 mocked USDC and contracts have zero", async function () {
        expect(await mockedUSDC.balanceOf(signers[10])).to.equal(100_000 * 10 ** 6)

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

    let totalMintingCost = 0

    let p10_spentAmount: number = 0

    it("Mint Diamond Bull for p10 to p14", async function () {
        const tier = 0 // Diamond
        const mintsPerSigner = 1 // Adjust this number based on your requirements
        const costToMintEachNFT = 2500 * 10 ** 6

        // Loop over signers[10] to signers[19]
        for (let i = 10; i <= 14; i++) {
            for (let j = 0; j < mintsPerSigner; j++) {
                // Amount to approve (make sure this is sufficient for the mint operation)
                const amountToApprove = await saltVaultBulls.getCostAndMintEligibility(tier)

                totalMintingCost += Number(amountToApprove)

                if (i == 10) {
                    p10_spentAmount += Number(amountToApprove)
                }

                // assert paper.xyz call works
                expect(await saltVaultBulls.checkClaimEligibility(tier, 1)).to.equal("")

                // assert paper.xyz call works
                expect(await amountToApprove).to.equal(costToMintEachNFT)

                // Approve the proxySVB contract to spend tokens
                await mockedUSDC.connect(signers[i]).approve(saltVaultBulls.target, costToMintEachNFT)

                await saltVaultBulls.connect(signers[i]).mint(tier, signers[i].address)
            }
        }

        expect(await saltVaultBulls.totalSupply()).to.equal(5)
    })

    it("Mint Ruby Bull for p15 to p19 Person", async function () {
        const tier = 1 // Ruby
        const mintsPerSigner = 1 // Adjust this number based on your requirements
        const costToMintEachNFT = 1000 * 10 ** 6

        // Loop over signers[10] to signers[19]
        for (let i = 15; i <= 19; i++) {
            for (let j = 0; j < mintsPerSigner; j++) {
                // Amount to approve (make sure this is sufficient for the mint operation)
                const amountToApprove = await saltVaultBulls.getCostAndMintEligibility(tier)

                totalMintingCost += Number(amountToApprove)

                if (i == 10) {
                    p10_spentAmount += Number(amountToApprove)
                }

                // assert paper.xyz call works
                expect(await saltVaultBulls.checkClaimEligibility(tier, 1)).to.equal("")

                // assert paper.xyz call works
                expect(await amountToApprove).to.equal(costToMintEachNFT)

                // Approve the proxySVB contract to spend tokens
                await mockedUSDC.connect(signers[i]).approve(saltVaultBulls.target, costToMintEachNFT)

                await saltVaultBulls.connect(signers[i]).mint(tier, signers[i].address)
            }
        }

        expect(await saltVaultBulls.totalSupply()).to.equal(10)
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

        expect(Number(coreTeamBalance) + Number(vaultHoldingBalance)).to.equal(totalMintingCost)

        expect(Number(coreTeamBalance)).to.equal(totalMintingCost * 0.1)
        expect(Number(vaultHoldingBalance)).to.equal(totalMintingCost * 0.9)
    })

    describe("Salt Check", function () {
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
    })

    describe("create DCA Vault", function () {
        it("confirm there are no vaults yet", async function () {
            let count = await vaultFacet.getVaultCount()
            assert.equal(count, 0)
        })

        it("add DCA Vault", async function () {
            await vaultFacet.addNewVault("DCA Vault", dcaWallet.address, dcaApprovedControlWallet.address)

            let vaultInfo = await vaultFacet.getVault(0)
            expect(vaultInfo[0]).to.equal("DCA Vault") // name
            expect(Number(vaultInfo[1])).to.equal(0) // totalSalt
            expect(Number(vaultInfo[2])).to.equal(0) // totalRewardPoints
            expect(Number(vaultInfo[3])).to.equal(0) // withdrawableAmount
            expect(Number(vaultInfo[4])).to.equal(0) // dispersableProfitAmount
            expect(Number(vaultInfo[5])).to.equal(0) // lifetimeRewardAmount
            expect(vaultInfo[6]).to.equal(dcaWallet.address) // walletAddress
            expect(vaultInfo[7]).to.equal(dcaApprovedControlWallet.address) // approvedControlWallet
        })

        it("confirm we now have 1 vault", async function () {
            let count = await vaultFacet.getVaultCount()
            assert.equal(count, 1)
        })

        it("add Quant Vault", async function () {
            await vaultFacet.addNewVault("Quant Vault", qauntWallet.address, quantApprovedControlWallet.address)

            let vaultInfo = await vaultFacet.getVault(1)
            expect(vaultInfo[0]).to.equal("Quant Vault") // name
            expect(Number(vaultInfo[1])).to.equal(0) // totalSalt
            expect(Number(vaultInfo[2])).to.equal(0) // totalRewardPoints
            expect(Number(vaultInfo[3])).to.equal(0) // withdrawableAmount
            expect(Number(vaultInfo[4])).to.equal(0) // dispersableProfitAmount
            expect(Number(vaultInfo[5])).to.equal(0) // lifetimeRewardAmount
            expect(vaultInfo[6]).to.equal(qauntWallet.address) // walletAddress
            expect(vaultInfo[7]).to.equal(quantApprovedControlWallet.address) // approvedControlWallet
        })

        it("confirm we now have 2 vaults", async function () {
            let count = await vaultFacet.getVaultCount()
            assert.equal(count, 2)
        })
    })

    let totalSaltInDCAVault: number = 0
    let totalWithdrawableAmountForDCAVault: number = 0
    describe("p10 - 14 depsit there salt into the DCA Vault", function () {
        it("each person deposits salt", async function () {
            // Calculate expected values using integer arithmetic
            let expectedTotalSalt = 3116 + Math.floor((3116 * 1) / 10) // Use Math.floor to simulate integer division
            // let expectedSaltValue = Math.floor(2500 * 10 ** 6 * 9) / 10

            let expectedSaltValue = 2500 * 10 ** 6

            let index = 1
            let vault = 0
            for (let i = 10; i <= 14; i++) {
                let bullInfo = await infoGetterFacet.getBullInformation(index)

                console.log("walletOfOwner", await saltVaultBulls.walletOfOwner(signers[i]))
                console.log("bullInfo", bullInfo)

                expect(Number(bullInfo[0])).to.equal(0) // rarity
                expect(Number(bullInfo[1])).to.equal(6) // grains
                expect(Number(bullInfo[2])).to.equal(1) // pillars
                expect(Number(bullInfo[3])).to.equal(1) // sheets
                expect(Number(bullInfo[4])).to.equal(3) // cubes
                expect(Number(bullInfo[5])).to.equal(0) // totalVaultedSalt

                // add salt to the vault
                await expect(vaultFacet.connect(signers[i]).allocateSaltToVault(index, vault, 6, 1, 1, 3))
                    .to.emit(vaultFacet, "SaltAllocatedToVault")
                    .withArgs(index, vault, expectedTotalSalt, expectedSaltValue, 6, 1, 1, 3)

                bullInfo = await infoGetterFacet.getBullInformation(index)
                expect(Number(bullInfo[0])).to.equal(0) // rarity
                expect(Number(bullInfo[1])).to.equal(0) // grains
                expect(Number(bullInfo[2])).to.equal(0) // pillars
                expect(Number(bullInfo[3])).to.equal(0) // sheets
                expect(Number(bullInfo[4])).to.equal(0) // cubes
                expect(Number(bullInfo[5])).to.equal(expectedTotalSalt) // totalVaultedSalt

                totalSaltInDCAVault += Number(expectedTotalSalt)
                totalWithdrawableAmountForDCAVault += (Number(expectedSaltValue) * 9) / 10

                index++
            }
        })

        it("Confirm DCA Vault Information after salt deposits", async function () {
            let vaultInfo = await vaultFacet.getVault(0)
            expect(vaultInfo[0]).to.equal("DCA Vault") // name
            expect(Number(vaultInfo[1])).to.equal(totalSaltInDCAVault) // totalSalt
            expect(Number(vaultInfo[2])).to.equal(0) // totalRewardPoints
            expect(Number(vaultInfo[3])).to.equal(totalWithdrawableAmountForDCAVault) // withdrawableAmount
            expect(Number(vaultInfo[4])).to.equal(0) // dispersableProfitAmount
            expect(Number(vaultInfo[5])).to.equal(0) // lifetimeRewardAmount
            expect(vaultInfo[6]).to.equal(dcaWallet.address) // walletAddress
            expect(vaultInfo[7]).to.equal(dcaApprovedControlWallet.address) // approvedControlWallet
        })

        it("Confirm Quant Vault is still zero", async function () {
            await vaultFacet.addNewVault("Quant Vault", qauntWallet.address, quantApprovedControlWallet.address)

            let vaultInfo = await vaultFacet.getVault(1)
            expect(vaultInfo[0]).to.equal("Quant Vault") // name
            expect(Number(vaultInfo[1])).to.equal(0) // totalSalt
            expect(Number(vaultInfo[2])).to.equal(0) // totalRewardPoints
            expect(Number(vaultInfo[3])).to.equal(0) // withdrawableAmount
            expect(Number(vaultInfo[4])).to.equal(0) // dispersableProfitAmount
            expect(Number(vaultInfo[5])).to.equal(0) // lifetimeRewardAmount
            expect(vaultInfo[6]).to.equal(qauntWallet.address) // walletAddress
            expect(vaultInfo[7]).to.equal(quantApprovedControlWallet.address) // approvedControlWallet
        })
    })

    let totalSaltInQuantAVault: number = 0
    let totalWithdrawableAmountForQuantVault: number = 0
    describe("p15 - 19 depsit there salt into the Quant Vault", function () {
        it("each person deposits salt", async function () {
            // Calculate expected values using integer arithmetic
            let expectedTotalSalt = 1233 + Math.floor((1233 * 1) / 10) // Use Math.floor to simulate integer division
            let expectedSaltValue = 1000 * 10 ** 6

            let index = 51
            let vault = 1
            for (let i = 15; i <= 19; i++) {
                let bullInfo = await infoGetterFacet.getBullInformation(index)

                console.log("walletOfOwner", await saltVaultBulls.walletOfOwner(signers[i]))
                console.log("bullInfo", bullInfo)

                expect(Number(bullInfo[0])).to.equal(1) // rarity
                expect(Number(bullInfo[1])).to.equal(3) // grains
                expect(Number(bullInfo[2])).to.equal(3) // pillars
                expect(Number(bullInfo[3])).to.equal(2) // sheets
                expect(Number(bullInfo[4])).to.equal(1) // cubes
                expect(Number(bullInfo[5])).to.equal(0) // totalVaultedSalt

                // add salt to the vault
                await expect(vaultFacet.connect(signers[i]).allocateSaltToVault(index, vault, 3, 3, 2, 1))
                    .to.emit(vaultFacet, "SaltAllocatedToVault")
                    .withArgs(index, vault, expectedTotalSalt, expectedSaltValue, 3, 3, 2, 1)

                bullInfo = await infoGetterFacet.getBullInformation(index)
                expect(Number(bullInfo[0])).to.equal(1) // rarity
                expect(Number(bullInfo[1])).to.equal(0) // grains
                expect(Number(bullInfo[2])).to.equal(0) // pillars
                expect(Number(bullInfo[3])).to.equal(0) // sheets
                expect(Number(bullInfo[4])).to.equal(0) // cubes
                expect(Number(bullInfo[5])).to.equal(expectedTotalSalt) // totalVaultedSalt

                totalSaltInQuantAVault += Number(expectedTotalSalt)
                totalWithdrawableAmountForQuantVault += (Number(expectedSaltValue) * 9) / 10

                index++
            }
        })

        it("Confirm DCA Vault Information after salt deposits", async function () {
            let vaultInfo = await vaultFacet.getVault(0)
            expect(vaultInfo[0]).to.equal("DCA Vault") // name
            expect(Number(vaultInfo[1])).to.equal(totalSaltInDCAVault) // totalSalt
            expect(Number(vaultInfo[2])).to.equal(0) // totalRewardPoints
            expect(Number(vaultInfo[3])).to.equal(totalWithdrawableAmountForDCAVault) // withdrawableAmount
            expect(Number(vaultInfo[4])).to.equal(0) // dispersableProfitAmount
            expect(Number(vaultInfo[5])).to.equal(0) // lifetimeRewardAmount
            expect(vaultInfo[6]).to.equal(dcaWallet.address) // walletAddress
            expect(vaultInfo[7]).to.equal(dcaApprovedControlWallet.address) // approvedControlWallet
        })

        it("Confirm Quant Vault is still zero", async function () {
            await vaultFacet.addNewVault("Quant Vault", qauntWallet.address, quantApprovedControlWallet.address)

            let vaultInfo = await vaultFacet.getVault(1)
            expect(vaultInfo[0]).to.equal("Quant Vault") // name
            expect(Number(vaultInfo[1])).to.equal(totalSaltInQuantAVault) // totalSalt
            expect(Number(vaultInfo[2])).to.equal(0) // totalRewardPoints
            expect(Number(vaultInfo[3])).to.equal(totalWithdrawableAmountForQuantVault) // withdrawableAmount
            expect(Number(vaultInfo[4])).to.equal(0) // dispersableProfitAmount
            expect(Number(vaultInfo[5])).to.equal(0) // lifetimeRewardAmount
            expect(vaultInfo[6]).to.equal(qauntWallet.address) // walletAddress
            expect(vaultInfo[7]).to.equal(quantApprovedControlWallet.address) // approvedControlWallet
        })
    })
})
