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
    let mockedBinanceAccount: any

    let signers: any

    let totalMintedUSDCamount: any

    let expectedRewardEachMonth: any
    let expectedSaltIncrease: any

    let expectedSaltForEachDiamondBull: any

    let expectedTotalRewardPointsForCycle: any
    let round2ExpectedRewardEachMonth = 17744218
    let round3ExpectedRewardEachMonth: any
    let round4ExpectedRewardEachMonth: any

    let expectedDiamondContractBalance: number = 0 // start here at 0

    let compoundedAmountForIndex3: any

    let totalSaltInDCAVaultbeforeRewarding: number = 0
    let totalSaltDepositedForIndex1BeforeRewarding: number = 0
    let totalSaltDepositedForIndex2BeforeRewarding: number = 0
    let totalSaltDepositedForIndex3BeforeRewarding: number = 0
    let totalSaltDepositedForIndex4BeforeRewarding: number = 0
    let totalSaltDepositedForIndex5BeforeRewarding: number = 0
    let totalSaltDepositedForIndex6BeforeRewarding: number = 0
    let totalSaltDepositedForIndex51BeforeRewarding: number = 0
    let totalSaltDepositedForIndex52BeforeRewarding: number = 0
    let totalSaltDepositedForIndex53BeforeRewarding: number = 0
    let totalSaltDepositedForIndex54BeforeRewarding: number = 0
    let totalSaltDepositedForIndex55BeforeRewarding: number = 0
    let totalSaltDepositedForIndex56BeforeRewarding: number = 0

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
        mockedBinanceAccount = signers[35]

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

                expectedDiamondContractBalance += Number(amountToApprove)

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

    it("Assert expectedDiamondContractBalance == 12500 * 10 ** 6 ", async function () {
        assert.equal(expectedDiamondContractBalance, 12500 * 10 ** 6)
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

                expectedDiamondContractBalance += Number(amountToApprove)

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

    it("Assert expectedDiamondContractBalance == 17500 * 10 ** 6 ", async function () {
        assert.equal(expectedDiamondContractBalance, 17500 * 10 ** 6)
    })

    it("confirm balances on contract match the expected total", async function () {
        let coreTeamBalance = await infoGetterFacet.getCoreTeamBalance()
        let vaultHoldingBalance = await infoGetterFacet.getVaultHoldingBalance()
        let totalRewardBalance = await infoGetterFacet.getTotalRewardBalance()
        let VaultCouncilBalance = await infoGetterFacet.getVaultCouncilBalance()

        expect(Number(coreTeamBalance) + Number(vaultHoldingBalance) + Number(totalRewardBalance) + Number(VaultCouncilBalance)).to.equal(totalMintingCost)
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

            let vaultInfo = await vaultFacet.getVaultInformation(0)
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

            let vaultInfo = await vaultFacet.getVaultInformation(1)
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

        it("confirm balances on contract match the expected total", async function () {
            let coreTeamBalance = await infoGetterFacet.getCoreTeamBalance()
            let vaultHoldingBalance = await infoGetterFacet.getVaultHoldingBalance()
            let totalRewardBalance = await infoGetterFacet.getTotalRewardBalance()
            let VaultCouncilBalance = await infoGetterFacet.getVaultCouncilBalance()
            let dcaVaultWithdrawableBalance = await vaultFacet.getVaultWithdrawableAmount(0)
            let quantVaultWithdrawableBalance = await vaultFacet.getVaultWithdrawableAmount(1)

            expect(
                Number(coreTeamBalance) +
                    Number(vaultHoldingBalance) +
                    Number(totalRewardBalance) +
                    Number(VaultCouncilBalance) +
                    Number(dcaVaultWithdrawableBalance) +
                    Number(quantVaultWithdrawableBalance),
            ).to.equal(totalMintingCost)
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

                // console.log("walletOfOwner", await saltVaultBulls.walletOfOwner(signers[i]))
                // console.log("bullInfo", bullInfo)

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

                if (i != 12) {
                    totalSaltInDCAVault += Number(expectedTotalSalt)
                }

                totalWithdrawableAmountForDCAVault += (Number(expectedSaltValue) * 9) / 10

                index++
            }
        })

        it("Confirm DCA Vault Information after salt deposits", async function () {
            let vaultInfo = await vaultFacet.getVaultInformation(0)
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

            let vaultInfo = await vaultFacet.getVaultInformation(1)
            expect(vaultInfo[0]).to.equal("Quant Vault") // name
            expect(Number(vaultInfo[1])).to.equal(0) // totalSalt
            expect(Number(vaultInfo[2])).to.equal(0) // totalRewardPoints
            expect(Number(vaultInfo[3])).to.equal(0) // withdrawableAmount
            expect(Number(vaultInfo[4])).to.equal(0) // dispersableProfitAmount
            expect(Number(vaultInfo[5])).to.equal(0) // lifetimeRewardAmount
            expect(vaultInfo[6]).to.equal(qauntWallet.address) // walletAddress
            expect(vaultInfo[7]).to.equal(quantApprovedControlWallet.address) // approvedControlWallet
        })

        it("confirm balances on contract match the expected total", async function () {
            let diamondContractBalance = await mockedUSDC.balanceOf(diamondAddress)
            let coreTeamBalance = await infoGetterFacet.getCoreTeamBalance()
            let vaultHoldingBalance = await infoGetterFacet.getVaultHoldingBalance()
            let totalRewardBalance = await infoGetterFacet.getTotalRewardBalance()
            let VaultCouncilBalance = await infoGetterFacet.getVaultCouncilBalance()
            let dcaVaultWithdrawableBalance = await vaultFacet.getVaultWithdrawableAmount(0)
            let quantVaultWithdrawableBalance = await vaultFacet.getVaultWithdrawableAmount(1)

            let dcaVaultInfo = await vaultFacet.getVaultInformation(0)
            let dispersableAmountForDCAVault = dcaVaultInfo[4]

            let quantVaultInfo = await vaultFacet.getVaultInformation(1)
            let dispersableAmountForQuantVault = quantVaultInfo[4]

            // console.log("CoreTeamBalance:", coreTeamBalance)
            // console.log("vaultHoldingBalance:", vaultHoldingBalance)
            // console.log("totalRewardBalance:", totalRewardBalance)
            // console.log("VaultCouncilBalance:", VaultCouncilBalance)
            // console.log("dcaVaultWithdrawableBalance:", dcaVaultWithdrawableBalance)
            // console.log("quantVaultWithdrawableBalance:", quantVaultWithdrawableBalance)
            // console.log("dispersableAmountForDCAVault:", Number(dispersableAmountForDCAVault) / 10 ** 6)
            // console.log("dispersableAmountForQuantVault:", Number(dispersableAmountForQuantVault) / 10 ** 6)
            // console.log("diamondContractBalance:", Number(diamondContractBalance) / 10 ** 6)

            expect(
                Number(coreTeamBalance) +
                    Number(vaultHoldingBalance) +
                    Number(totalRewardBalance) +
                    Number(VaultCouncilBalance) +
                    Number(dcaVaultWithdrawableBalance) +
                    Number(quantVaultWithdrawableBalance) +
                    Number(dispersableAmountForDCAVault) +
                    Number(dispersableAmountForQuantVault),
            ).to.equal(Number(diamondContractBalance))
        })

        it("Assert diamondContractBalance to equals expectedDiamondContractBalance", async function () {
            let diamondContractBalance = await mockedUSDC.balanceOf(diamondAddress)
            assert.equal(diamondContractBalance, expectedDiamondContractBalance)
        })

        it("Assert expectedDiamondContractBalance == 17500 * 10 ** 6 ", async function () {
            assert.equal(expectedDiamondContractBalance, 17500 * 10 ** 6)
        })

        it("Assert vault holding balance equals value from p15-19 now", async function () {
            let vaultHoldingBalance = await infoGetterFacet.getVaultHoldingBalance()

            assert.equal(vaultHoldingBalance, 900 * 10 ** 6 * 5)
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
            let vaultInfo = await vaultFacet.getVaultInformation(0)
            expect(vaultInfo[0]).to.equal("DCA Vault") // name
            expect(Number(vaultInfo[1])).to.equal(totalSaltInDCAVault) // totalSalt
            expect(Number(vaultInfo[2])).to.equal(0) // totalRewardPoints
            expect(Number(vaultInfo[3])).to.equal(totalWithdrawableAmountForDCAVault) // withdrawableAmount
            expect(Number(vaultInfo[4])).to.equal(0) // dispersableProfitAmount
            expect(Number(vaultInfo[5])).to.equal(0) // lifetimeRewardAmount
            expect(vaultInfo[6]).to.equal(dcaWallet.address) // walletAddress
            expect(vaultInfo[7]).to.equal(dcaApprovedControlWallet.address) // approvedControlWallet
        })

        it("Confirm Quant Vault Information after salt Deposits", async function () {
            await vaultFacet.addNewVault("Quant Vault", qauntWallet.address, quantApprovedControlWallet.address)

            let vaultInfo = await vaultFacet.getVaultInformation(1)
            expect(vaultInfo[0]).to.equal("Quant Vault") // name
            expect(Number(vaultInfo[1])).to.equal(totalSaltInQuantAVault) // totalSalt
            expect(Number(vaultInfo[2])).to.equal(0) // totalRewardPoints
            expect(Number(vaultInfo[3])).to.equal(totalWithdrawableAmountForQuantVault) // withdrawableAmount
            expect(Number(vaultInfo[4])).to.equal(0) // dispersableProfitAmount
            expect(Number(vaultInfo[5])).to.equal(0) // lifetimeRewardAmount
            expect(vaultInfo[6]).to.equal(qauntWallet.address) // walletAddress
            expect(vaultInfo[7]).to.equal(quantApprovedControlWallet.address) // approvedControlWallet
        })

        it("confirm balances on contract match the expected total", async function () {
            let diamondContractBalance = await mockedUSDC.balanceOf(diamondAddress)
            let coreTeamBalance = await infoGetterFacet.getCoreTeamBalance()
            let vaultHoldingBalance = await infoGetterFacet.getVaultHoldingBalance()
            let totalRewardBalance = await infoGetterFacet.getTotalRewardBalance()
            let VaultCouncilBalance = await infoGetterFacet.getVaultCouncilBalance()
            let dcaVaultWithdrawableBalance = await vaultFacet.getVaultWithdrawableAmount(0)
            let quantVaultWithdrawableBalance = await vaultFacet.getVaultWithdrawableAmount(1)

            let dcaVaultInfo = await vaultFacet.getVaultInformation(0)
            let dispersableAmountForDCAVault = dcaVaultInfo[4]

            let quantVaultInfo = await vaultFacet.getVaultInformation(1)
            let dispersableAmountForQuantVault = quantVaultInfo[4]

            // console.log("CoreTeamBalance:", coreTeamBalance)
            // console.log("vaultHoldingBalance:", vaultHoldingBalance)
            // console.log("totalRewardBalance:", totalRewardBalance)
            // console.log("VaultCouncilBalance:", VaultCouncilBalance)
            // console.log("dcaVaultWithdrawableBalance:", dcaVaultWithdrawableBalance)
            // console.log("quantVaultWithdrawableBalance:", quantVaultWithdrawableBalance)
            // console.log("dispersableAmountForDCAVault:", Number(dispersableAmountForDCAVault) / 10 ** 6)
            // console.log("dispersableAmountForQuantVault:", Number(dispersableAmountForQuantVault) / 10 ** 6)
            // console.log("diamondContractBalance:", Number(diamondContractBalance) / 10 ** 6)

            expect(
                Number(coreTeamBalance) +
                    Number(vaultHoldingBalance) +
                    Number(totalRewardBalance) +
                    Number(VaultCouncilBalance) +
                    Number(dcaVaultWithdrawableBalance) +
                    Number(quantVaultWithdrawableBalance) +
                    Number(dispersableAmountForDCAVault) +
                    Number(dispersableAmountForQuantVault),
            ).to.equal(Number(diamondContractBalance))
        })

        it("Assert diamondContractBalance to equals expectedDiamondContractBalance", async function () {
            let diamondContractBalance = await mockedUSDC.balanceOf(diamondAddress)
            assert.equal(diamondContractBalance, expectedDiamondContractBalance)
        })
    })

    describe("Confirm Vault Salt Deposits for each person", function () {
        it("only p10 - p14 should have DCA salt deposits ", async function () {
            let dcaVault = 0

            expectedSaltForEachDiamondBull = Math.floor(3116 + 3116 * 0.1)
            expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 1)).to.equal(expectedSaltForEachDiamondBull)
            expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 2)).to.equal(expectedSaltForEachDiamondBull)
            expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 3)).to.equal(expectedSaltForEachDiamondBull)
            expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 4)).to.equal(expectedSaltForEachDiamondBull)
            expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 5)).to.equal(expectedSaltForEachDiamondBull)
            expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 6)).to.equal(0)
            expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 51)).to.equal(0)
            expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 52)).to.equal(0)
            expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 53)).to.equal(0)
            expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 54)).to.equal(0)
            expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 55)).to.equal(0)
        })

        it("only p15 - p19 should have Quant salt deposits ", async function () {
            let quantVault = 1

            expect(await vaultFacet.getDepositedSaltAmount(quantVault, 1)).to.equal(0)
            expect(await vaultFacet.getDepositedSaltAmount(quantVault, 2)).to.equal(0)
            expect(await vaultFacet.getDepositedSaltAmount(quantVault, 3)).to.equal(0)
            expect(await vaultFacet.getDepositedSaltAmount(quantVault, 4)).to.equal(0)
            expect(await vaultFacet.getDepositedSaltAmount(quantVault, 5)).to.equal(0)
            expect(await vaultFacet.getDepositedSaltAmount(quantVault, 6)).to.equal(0)
            expect(await vaultFacet.getDepositedSaltAmount(quantVault, 51)).to.equal(1356)
            expect(await vaultFacet.getDepositedSaltAmount(quantVault, 52)).to.equal(1356)
            expect(await vaultFacet.getDepositedSaltAmount(quantVault, 53)).to.equal(1356)
            expect(await vaultFacet.getDepositedSaltAmount(quantVault, 54)).to.equal(1356)
            expect(await vaultFacet.getDepositedSaltAmount(quantVault, 55)).to.equal(1356)
            expect(await vaultFacet.getDepositedSaltAmount(quantVault, 56)).to.equal(0)
        })

        it("Assert expectedDiamondContractBalance == 17500 * 10 ** 6 ", async function () {
            assert.equal(expectedDiamondContractBalance, 17500 * 10 ** 6)
        })
    })

    let CoreTeamBalance: number = 0
    let VaultHoldingBalance: number = 0
    let TotalRewardBalance: number = 0
    let VaultCouncilBalance: number = 0
    let GemTokenChallangeBalance: number = 0
    let GemTokenSalesBalance: number = 0

    let DcaApprovedControlWalletBalance: number = 0
    let QuantApprovedControlWalletBalance: number = 0

    let DcaVaultBalance: number = 0
    let QuantVaultBalance: number = 0

    let DiamondContractBalance: number = 0
    let SaltVaultTokenContractBalance: number = 0
    let CoreTeamWalletBalance: number = 0
    let RoyaltiesWalletBalance: number = 0
    let ProcurementWalletBalance: number = 0
    let GemTokenBurnWalletBalance: number = 0

    let bankRewardsBalance_P10: number = 0
    let bankRewardsBalance_P11: number = 0
    let bankRewardsBalance_P12: number = 0
    let bankRewardsBalance_P13: number = 0
    let bankRewardsBalance_P14: number = 0
    let bankRewardsBalance_P15: number = 0
    let bankRewardsBalance_P16: number = 0
    let bankRewardsBalance_P17: number = 0
    let bankRewardsBalance_P18: number = 0
    let bankRewardsBalance_P19: number = 0
    let bankRewardsBalance_P20: number = 0
    let bankRewardsBalance_coreTeam: number = 0

    describe("Reward Cycle Month 1", function () {
        describe("Withdraw USDC from the DCA Vault", function () {
            it("confirm balances before withdrawing DCA Vault", async function () {
                // console.log("mockedUSDC balance of saltVaultBulls:", await mockedUSDC.balanceOf(saltVaultBulls.target))
                // console.log("mockedUSDC balance of dimaond:", await mockedUSDC.balanceOf(diamondAddress))
                // console.log("mockedUSDC balance of ERC721Facet:", await mockedUSDC.balanceOf(erc721Facet.target))
                // console.log("mockedUSDC balance of DCA Vault:", await vaultFacet.getVaultWithdrawableAmount(0))
                // console.log("mockedUSDC balance of Quant Vault:", await vaultFacet.getVaultWithdrawableAmount(1))

                CoreTeamBalance = await infoGetterFacet.getCoreTeamBalance()
                VaultHoldingBalance = await infoGetterFacet.getVaultHoldingBalance()
                TotalRewardBalance = await infoGetterFacet.getTotalRewardBalance()
                VaultCouncilBalance = await infoGetterFacet.getVaultCouncilBalance()
                GemTokenChallangeBalance = await infoGetterFacet.getGemTokenChallengeBalance()
                GemTokenSalesBalance = await infoGetterFacet.getGemTokenSalesBalance()

                DcaVaultBalance = await vaultFacet.getVaultWithdrawableAmount(0)
                QuantVaultBalance = await vaultFacet.getVaultWithdrawableAmount(1)

                DcaApprovedControlWalletBalance = await mockedUSDC.balanceOf(dcaApprovedControlWallet.address)
                QuantApprovedControlWalletBalance = await mockedUSDC.balanceOf(quantApprovedControlWallet.address)

                DiamondContractBalance = await mockedUSDC.balanceOf(diamondAddress)
                SaltVaultTokenContractBalance = await mockedUSDC.balanceOf(saltVaultBulls.target)
                CoreTeamWalletBalance = await mockedUSDC.balanceOf(coreTeamWallet.address)
                RoyaltiesWalletBalance = await mockedUSDC.balanceOf(royaltiesWallet.address)
                ProcurementWalletBalance = await mockedUSDC.balanceOf(procurementWallet.address)
                GemTokenBurnWalletBalance = await mockedUSDC.balanceOf(gemTokenBurnWallet.address)

                bankRewardsBalance_P10 = await bankFacet.connect(signers[10]).getBankRewardsBalance()
                bankRewardsBalance_P11 = await bankFacet.connect(signers[11]).getBankRewardsBalance()
                bankRewardsBalance_P12 = await bankFacet.connect(signers[12]).getBankRewardsBalance()
                bankRewardsBalance_P13 = await bankFacet.connect(signers[13]).getBankRewardsBalance()
                bankRewardsBalance_P14 = await bankFacet.connect(signers[14]).getBankRewardsBalance()
                bankRewardsBalance_P15 = await bankFacet.connect(signers[15]).getBankRewardsBalance()
                bankRewardsBalance_P16 = await bankFacet.connect(signers[16]).getBankRewardsBalance()
                bankRewardsBalance_P17 = await bankFacet.connect(signers[17]).getBankRewardsBalance()
                bankRewardsBalance_P18 = await bankFacet.connect(signers[18]).getBankRewardsBalance()
                bankRewardsBalance_P19 = await bankFacet.connect(signers[19]).getBankRewardsBalance()
                bankRewardsBalance_P20 = await bankFacet.connect(signers[20]).getBankRewardsBalance()
                bankRewardsBalance_coreTeam = await bankFacet.connect(coreTeamWallet).getBankRewardsBalance()

                assert.equal(totalMintingCost, 2500 * 10 ** 6 * 5 + 1000 * 10 ** 6 * 5)
                assert.equal(totalWithdrawableAmountForDCAVault, 2500 * 10 ** 6 * 5 * 0.9)
                assert.equal(totalWithdrawableAmountForQuantVault, 1000 * 10 ** 6 * 5 * 0.9)

                assert.equal(CoreTeamBalance, totalMintingCost * 0.1)
                assert.equal(VaultHoldingBalance, 0) // went to zero when salt was deposited by each person into the DCA and Quant Vault
                assert.equal(TotalRewardBalance, 0)
                assert.equal(VaultCouncilBalance, 0)
                assert.equal(GemTokenChallangeBalance, 0)
                assert.equal(GemTokenSalesBalance, 0)

                assert.equal(DcaVaultBalance, totalWithdrawableAmountForDCAVault)
                assert.equal(QuantVaultBalance, totalWithdrawableAmountForQuantVault)

                assert.equal(DcaApprovedControlWalletBalance, 0)
                assert.equal(QuantApprovedControlWalletBalance, 0)

                assert.equal(DiamondContractBalance, totalMintingCost)
                assert.equal(SaltVaultTokenContractBalance, 0)
                assert.equal(CoreTeamWalletBalance, 0)
                assert.equal(RoyaltiesWalletBalance, 0)
                assert.equal(ProcurementWalletBalance, 0)
                assert.equal(GemTokenBurnWalletBalance, 0)

                assert.equal(bankRewardsBalance_P10, 0)
                assert.equal(bankRewardsBalance_P11, 0)
                assert.equal(bankRewardsBalance_P12, 0)
                assert.equal(bankRewardsBalance_P13, 0)
                assert.equal(bankRewardsBalance_P14, 0)
                assert.equal(bankRewardsBalance_P15, 0)
                assert.equal(bankRewardsBalance_P16, 0)
                assert.equal(bankRewardsBalance_P17, 0)
                assert.equal(bankRewardsBalance_P18, 0)
                assert.equal(bankRewardsBalance_P19, 0)
                assert.equal(bankRewardsBalance_P20, 0)
                assert.equal(bankRewardsBalance_coreTeam, 0)
            })
            it("revert when wrong wallet tries to withdraw the DCA vault", async function () {
                let dcaVaultIndex = 0
                await expect(vaultFacet.connect(signers[10]).withdrawVaultFunds(dcaVaultIndex)).to.revertedWith("must be the approved Control Wallet for this vault")
            })

            it("allow correct wallet to withdraw the DCA vault", async function () {
                let dcaVaultIndex = 0

                let expectedWithawAmount = 11250 * 10 ** 6 // 12500 * .9       10% is taxes for core team
                await expect(vaultFacet.connect(dcaApprovedControlWallet).withdrawVaultFunds(dcaVaultIndex))
                    .to.emit(vaultFacet, "FundsWithdrawn")
                    .withArgs(0, dcaApprovedControlWallet, expectedWithawAmount)

                expectedDiamondContractBalance -= Number(expectedWithawAmount)
            })

            it("Assert expectedDiamondContractBalance == 6250 * 10 ** 6 ", async function () {
                assert.equal(expectedDiamondContractBalance, 6250 * 10 ** 6)
            })

            it("confirm balances after withdrawing DCA Vault", async function () {
                // console.log("mockedUSDC balance of saltVaultBulls:", await mockedUSDC.balanceOf(saltVaultBulls.target))
                // console.log("mockedUSDC balance of dimaond:", await mockedUSDC.balanceOf(diamondAddress))
                // console.log("mockedUSDC balance of ERC721Facet:", await mockedUSDC.balanceOf(erc721Facet.target))
                // console.log("mockedUSDC balance of DCA Vault:", await vaultFacet.getVaultWithdrawableAmount(0))
                // console.log("mockedUSDC balance of Quant Vault:", await vaultFacet.getVaultWithdrawableAmount(1))

                CoreTeamBalance = await infoGetterFacet.getCoreTeamBalance()
                VaultHoldingBalance = await infoGetterFacet.getVaultHoldingBalance()
                TotalRewardBalance = await infoGetterFacet.getTotalRewardBalance()
                VaultCouncilBalance = await infoGetterFacet.getVaultCouncilBalance()
                GemTokenChallangeBalance = await infoGetterFacet.getGemTokenChallengeBalance()
                GemTokenSalesBalance = await infoGetterFacet.getGemTokenSalesBalance()

                DcaVaultBalance = await vaultFacet.getVaultWithdrawableAmount(0)
                QuantVaultBalance = await vaultFacet.getVaultWithdrawableAmount(1)

                DcaApprovedControlWalletBalance = await mockedUSDC.balanceOf(dcaApprovedControlWallet.address)
                QuantApprovedControlWalletBalance = await mockedUSDC.balanceOf(quantApprovedControlWallet.address)

                DiamondContractBalance = await mockedUSDC.balanceOf(diamondAddress)
                SaltVaultTokenContractBalance = await mockedUSDC.balanceOf(saltVaultBulls.target)
                CoreTeamWalletBalance = await mockedUSDC.balanceOf(coreTeamWallet.address)
                RoyaltiesWalletBalance = await mockedUSDC.balanceOf(royaltiesWallet.address)
                ProcurementWalletBalance = await mockedUSDC.balanceOf(procurementWallet.address)
                GemTokenBurnWalletBalance = await mockedUSDC.balanceOf(gemTokenBurnWallet.address)

                bankRewardsBalance_P10 = await bankFacet.connect(signers[10]).getBankRewardsBalance()
                bankRewardsBalance_P11 = await bankFacet.connect(signers[11]).getBankRewardsBalance()
                bankRewardsBalance_P12 = await bankFacet.connect(signers[12]).getBankRewardsBalance()
                bankRewardsBalance_P13 = await bankFacet.connect(signers[13]).getBankRewardsBalance()
                bankRewardsBalance_P14 = await bankFacet.connect(signers[14]).getBankRewardsBalance()
                bankRewardsBalance_P15 = await bankFacet.connect(signers[15]).getBankRewardsBalance()
                bankRewardsBalance_P16 = await bankFacet.connect(signers[16]).getBankRewardsBalance()
                bankRewardsBalance_P17 = await bankFacet.connect(signers[17]).getBankRewardsBalance()
                bankRewardsBalance_P18 = await bankFacet.connect(signers[18]).getBankRewardsBalance()
                bankRewardsBalance_P19 = await bankFacet.connect(signers[19]).getBankRewardsBalance()
                bankRewardsBalance_P20 = await bankFacet.connect(signers[20]).getBankRewardsBalance()
                bankRewardsBalance_coreTeam = await bankFacet.connect(coreTeamWallet).getBankRewardsBalance()

                assert.equal(totalMintingCost, 2500 * 10 ** 6 * 5 + 1000 * 10 ** 6 * 5)
                assert.equal(totalWithdrawableAmountForDCAVault, 2500 * 10 ** 6 * 5 * 0.9)
                assert.equal(totalWithdrawableAmountForQuantVault, 1000 * 10 ** 6 * 5 * 0.9)

                assert.equal(CoreTeamBalance, totalMintingCost * 0.1)
                assert.equal(VaultHoldingBalance, 0) // went to zero when salt was deposited by each person into the DCA and Quant Vault
                assert.equal(TotalRewardBalance, 0)
                assert.equal(VaultCouncilBalance, 0)
                assert.equal(GemTokenChallangeBalance, 0)
                assert.equal(GemTokenSalesBalance, 0)

                assert.equal(DcaVaultBalance, 0)
                assert.equal(QuantVaultBalance, totalWithdrawableAmountForQuantVault)

                assert.equal(DcaApprovedControlWalletBalance, totalWithdrawableAmountForDCAVault)
                assert.equal(QuantApprovedControlWalletBalance, 0)

                assert.equal(DiamondContractBalance, totalMintingCost - totalWithdrawableAmountForDCAVault)
                assert.equal(SaltVaultTokenContractBalance, 0)
                assert.equal(CoreTeamWalletBalance, 0)
                assert.equal(RoyaltiesWalletBalance, 0)
                assert.equal(ProcurementWalletBalance, 0)
                assert.equal(GemTokenBurnWalletBalance, 0)

                assert.equal(bankRewardsBalance_P10, 0)
                assert.equal(bankRewardsBalance_P11, 0)
                assert.equal(bankRewardsBalance_P12, 0)
                assert.equal(bankRewardsBalance_P13, 0)
                assert.equal(bankRewardsBalance_P14, 0)
                assert.equal(bankRewardsBalance_P15, 0)
                assert.equal(bankRewardsBalance_P16, 0)
                assert.equal(bankRewardsBalance_P17, 0)
                assert.equal(bankRewardsBalance_P18, 0)
                assert.equal(bankRewardsBalance_P19, 0)
                assert.equal(bankRewardsBalance_P20, 0)
                assert.equal(bankRewardsBalance_coreTeam, 0)
            })

            it("confirm balances on contract match the expected total", async function () {
                let diamondContractBalance = await mockedUSDC.balanceOf(diamondAddress)
                let coreTeamBalance = await infoGetterFacet.getCoreTeamBalance()
                let vaultHoldingBalance = await infoGetterFacet.getVaultHoldingBalance()
                let totalRewardBalance = await infoGetterFacet.getTotalRewardBalance()
                let VaultCouncilBalance = await infoGetterFacet.getVaultCouncilBalance()
                let dcaVaultWithdrawableBalance = await vaultFacet.getVaultWithdrawableAmount(0)
                let quantVaultWithdrawableBalance = await vaultFacet.getVaultWithdrawableAmount(1)

                let dcaVaultInfo = await vaultFacet.getVaultInformation(0)
                let dispersableAmountForDCAVault = dcaVaultInfo[4]

                let quantVaultInfo = await vaultFacet.getVaultInformation(1)
                let dispersableAmountForQuantVault = quantVaultInfo[4]

                // console.log("CoreTeamBalance:", coreTeamBalance)
                // console.log("vaultHoldingBalance:", vaultHoldingBalance)
                // console.log("totalRewardBalance:", totalRewardBalance)
                // console.log("VaultCouncilBalance:", VaultCouncilBalance)
                // console.log("dcaVaultWithdrawableBalance:", dcaVaultWithdrawableBalance)
                // console.log("quantVaultWithdrawableBalance:", quantVaultWithdrawableBalance)
                // console.log("dispersableAmountForDCAVault:", Number(dispersableAmountForDCAVault) / 10 ** 6)
                // console.log("dispersableAmountForQuantVault:", Number(dispersableAmountForQuantVault) / 10 ** 6)
                // console.log("diamondContractBalance:", Number(diamondContractBalance) / 10 ** 6)

                expect(
                    Number(coreTeamBalance) +
                        Number(vaultHoldingBalance) +
                        Number(totalRewardBalance) +
                        Number(VaultCouncilBalance) +
                        Number(dcaVaultWithdrawableBalance) +
                        Number(quantVaultWithdrawableBalance) +
                        Number(dispersableAmountForDCAVault) +
                        Number(dispersableAmountForQuantVault),
                ).to.equal(Number(diamondContractBalance))
            })

            it("Assert expectedDiamondContractBalance == 6250 * 10 ** 6 ", async function () {
                assert.equal(expectedDiamondContractBalance, 6250 * 10 ** 6)
            })
        })

        describe("Mocked sending funds to binance account and getting $1000 back", function () {
            it("send all funds from wallet to mockedBinance account and get 1K back", async function () {
                let balanceToSend = await mockedUSDC.balanceOf(dcaApprovedControlWallet)

                await mockedUSDC.connect(dcaApprovedControlWallet).transfer(mockedBinanceAccount, balanceToSend)

                expect(await mockedUSDC.balanceOf(dcaApprovedControlWallet)).to.equal(0)

                await mockedUSDC.connect(mockedBinanceAccount).transfer(dcaApprovedControlWallet, 1000 * 10 ** 6)

                expect(await mockedUSDC.balanceOf(dcaApprovedControlWallet)).to.equal(1000 * 10 ** 6)
            })
        })

        describe("Set p12 to compound all of their DCA vault rewards", function () {
            it("confirm all compounding rates for DCA vault are set to zero by default", async function () {
                let dcaVaultIndex = 0
                expect(await vaultFacet.getNftVaultCompoundingRate(dcaVaultIndex, 1)).to.equal(0)
                expect(await vaultFacet.getNftVaultCompoundingRate(dcaVaultIndex, 2)).to.equal(0)
                expect(await vaultFacet.getNftVaultCompoundingRate(dcaVaultIndex, 3)).to.equal(0)
                expect(await vaultFacet.getNftVaultCompoundingRate(dcaVaultIndex, 4)).to.equal(0)
                expect(await vaultFacet.getNftVaultCompoundingRate(dcaVaultIndex, 5)).to.equal(0)
            })

            it("let owner of infdex 3 set compounding rate for DCA vault to 100%", async function () {
                expect(await saltVaultBulls.ownerOf(3)).to.equal(signers[12].address)

                let dcaVaultIndex = 0
                await vaultFacet.connect(signers[12]).setVaultCompoundingRate(dcaVaultIndex, 3, 100)
            })

            it("confirm compounding rates are correct now after index 3 is set to 100", async function () {
                let dcaVaultIndex = 0
                expect(await vaultFacet.getNftVaultCompoundingRate(dcaVaultIndex, 1)).to.equal(0)
                expect(await vaultFacet.getNftVaultCompoundingRate(dcaVaultIndex, 2)).to.equal(0)
                expect(await vaultFacet.getNftVaultCompoundingRate(dcaVaultIndex, 3)).to.equal(100)
                expect(await vaultFacet.getNftVaultCompoundingRate(dcaVaultIndex, 4)).to.equal(0)
                expect(await vaultFacet.getNftVaultCompoundingRate(dcaVaultIndex, 5)).to.equal(0)
            })
        })

        describe(" Confirm Vault information is correct before rewarding", function () {
            let dcaVault = 0

            it("confirm compounding rates are correct now after index 3 is set to 100", async function () {
                expect(await vaultFacet.getNftVaultCompoundingRate(dcaVault, 1)).to.equal(0)
                expect(await vaultFacet.getNftVaultCompoundingRate(dcaVault, 2)).to.equal(0)
                expect(await vaultFacet.getNftVaultCompoundingRate(dcaVault, 3)).to.equal(100)
                expect(await vaultFacet.getNftVaultCompoundingRate(dcaVault, 4)).to.equal(0)
                expect(await vaultFacet.getNftVaultCompoundingRate(dcaVault, 5)).to.equal(0)
                expect(await vaultFacet.getNftVaultCompoundingRate(dcaVault, 6)).to.equal(0)
                expect(await vaultFacet.getNftVaultCompoundingRate(dcaVault, 51)).to.equal(0)
                expect(await vaultFacet.getNftVaultCompoundingRate(dcaVault, 52)).to.equal(0)
                expect(await vaultFacet.getNftVaultCompoundingRate(dcaVault, 53)).to.equal(0)
                expect(await vaultFacet.getNftVaultCompoundingRate(dcaVault, 54)).to.equal(0)
                expect(await vaultFacet.getNftVaultCompoundingRate(dcaVault, 55)).to.equal(0)
                expect(await vaultFacet.getNftVaultCompoundingRate(dcaVault, 56)).to.equal(0)
            })
            it("confirm salt deposit amounts", async function () {
                expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 1)).to.equal(3427)
                expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 2)).to.equal(3427)
                expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 3)).to.equal(3427)
                expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 4)).to.equal(3427)
                expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 5)).to.equal(3427)
                expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 6)).to.equal(0)
                expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 51)).to.equal(0)
                expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 52)).to.equal(0)
                expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 53)).to.equal(0)
                expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 54)).to.equal(0)
                expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 55)).to.equal(0)
            })

            it("confirm salt deposit amounts", async function () {
                expect(await vaultFacet.getNftRewardPoints(dcaVault, 1)).to.equal(0)
                expect(await vaultFacet.getNftRewardPoints(dcaVault, 2)).to.equal(0)
                expect(await vaultFacet.getNftRewardPoints(dcaVault, 3)).to.equal(0)
                expect(await vaultFacet.getNftRewardPoints(dcaVault, 4)).to.equal(0)
                expect(await vaultFacet.getNftRewardPoints(dcaVault, 5)).to.equal(0)
                expect(await vaultFacet.getNftRewardPoints(dcaVault, 6)).to.equal(0)
                expect(await vaultFacet.getNftRewardPoints(dcaVault, 51)).to.equal(0)
                expect(await vaultFacet.getNftRewardPoints(dcaVault, 52)).to.equal(0)
                expect(await vaultFacet.getNftRewardPoints(dcaVault, 53)).to.equal(0)
                expect(await vaultFacet.getNftRewardPoints(dcaVault, 54)).to.equal(0)
                expect(await vaultFacet.getNftRewardPoints(dcaVault, 55)).to.equal(0)
            })

            it("confirm getContinuousMonthsCompounding", async function () {
                expect(await vaultFacet.getContinuousMonthsCompounding(dcaVault, 1)).to.equal(0)
                expect(await vaultFacet.getContinuousMonthsCompounding(dcaVault, 2)).to.equal(0)
                expect(await vaultFacet.getContinuousMonthsCompounding(dcaVault, 3)).to.equal(0)
                expect(await vaultFacet.getContinuousMonthsCompounding(dcaVault, 4)).to.equal(0)
                expect(await vaultFacet.getContinuousMonthsCompounding(dcaVault, 5)).to.equal(0)
                expect(await vaultFacet.getContinuousMonthsCompounding(dcaVault, 6)).to.equal(0)
                expect(await vaultFacet.getContinuousMonthsCompounding(dcaVault, 51)).to.equal(0)
                expect(await vaultFacet.getContinuousMonthsCompounding(dcaVault, 52)).to.equal(0)
                expect(await vaultFacet.getContinuousMonthsCompounding(dcaVault, 53)).to.equal(0)
                expect(await vaultFacet.getContinuousMonthsCompounding(dcaVault, 54)).to.equal(0)
                expect(await vaultFacet.getContinuousMonthsCompounding(dcaVault, 55)).to.equal(0)
            })

            it("confirm getBonusEligibilityForVaultDeposit", async function () {
                expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVault, 1)).to.equal(false)
                expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVault, 2)).to.equal(false)
                expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVault, 3)).to.equal(false)
                expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVault, 4)).to.equal(false)
                expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVault, 5)).to.equal(false)
                expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVault, 6)).to.equal(false)
                expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVault, 51)).to.equal(false)
                expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVault, 52)).to.equal(false)
                expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVault, 53)).to.equal(false)
                expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVault, 54)).to.equal(false)
                expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVault, 55)).to.equal(false)
            })

            it("Confirm DCA Vault Information", async function () {
                let vaultInfo = await vaultFacet.getVaultInformation(0)
                expect(vaultInfo[0]).to.equal("DCA Vault") // name
                expect(Number(vaultInfo[1])).to.equal(totalSaltInDCAVault) // totalSalt
                expect(Number(vaultInfo[2])).to.equal(0) // totalRewardPoints
                expect(Number(vaultInfo[3])).to.equal(0) // withdrawableAmount
                expect(Number(vaultInfo[4])).to.equal(0) // dispersableProfitAmount
                expect(Number(vaultInfo[5])).to.equal(0) // lifetimeRewardAmount
                expect(vaultInfo[6]).to.equal(dcaWallet.address) // walletAddress
                expect(vaultInfo[7]).to.equal(dcaApprovedControlWallet.address) // approvedControlWallet
            })

            it("Assert expectedDiamondContractBalance == 6250 * 10 ** 6 ", async function () {
                assert.equal(expectedDiamondContractBalance, 6250 * 10 ** 6)
            })
        })

        let totalSaltInDCAVaultbeforeRewarding: number = 0
        let totalSaltDepositedForIndex1BeforeRewarding: number = 0
        let totalSaltDepositedForIndex2BeforeRewarding: number = 0
        let totalSaltDepositedForIndex3BeforeRewarding: number = 0
        let totalSaltDepositedForIndex4BeforeRewarding: number = 0
        let totalSaltDepositedForIndex5BeforeRewarding: number = 0
        let totalSaltDepositedForIndex6BeforeRewarding: number = 0
        let totalSaltDepositedForIndex51BeforeRewarding: number = 0
        let totalSaltDepositedForIndex52BeforeRewarding: number = 0
        let totalSaltDepositedForIndex53BeforeRewarding: number = 0
        let totalSaltDepositedForIndex54BeforeRewarding: number = 0
        let totalSaltDepositedForIndex55BeforeRewarding: number = 0
        let totalSaltDepositedForIndex56BeforeRewarding: number = 0

        describe("Reward DCA Vault with $1000 USDC", function () {
            let dcaVaultIndex = 0

            it("snapshot salt amount for the vault and each person before rewardin the vault", async function () {
                let dcaVaultInfo = await vaultFacet.getVaultInformation(dcaVaultIndex)
                totalSaltInDCAVaultbeforeRewarding = dcaVaultInfo[1]

                totalSaltDepositedForIndex1BeforeRewarding = await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 1)
                totalSaltDepositedForIndex2BeforeRewarding = await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 2)
                totalSaltDepositedForIndex3BeforeRewarding = await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 3)
                totalSaltDepositedForIndex4BeforeRewarding = await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 4)
                totalSaltDepositedForIndex5BeforeRewarding = await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 5)
                totalSaltDepositedForIndex6BeforeRewarding = await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 6)
                totalSaltDepositedForIndex51BeforeRewarding = await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 51)
                totalSaltDepositedForIndex52BeforeRewarding = await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 52)
                totalSaltDepositedForIndex53BeforeRewarding = await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 53)
                totalSaltDepositedForIndex54BeforeRewarding = await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 54)
                totalSaltDepositedForIndex55BeforeRewarding = await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 55)
                totalSaltDepositedForIndex56BeforeRewarding = await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 56)
            })
            it("confirm it reverts if the wrong wallet deposits into the vault", async function () {
                await expect(vaultFacet.connect(quantApprovedControlWallet).depositProfitsAndcalculateVaultRewardPoints(dcaVaultIndex, 1000 * 10 ** 6)).to.revertedWith(
                    "must be the approved vault wallet",
                )
            })

            let beforeDiamondBalance: number = 0
            expectedTotalRewardPointsForCycle = 3427 * 300 * 5

            it("deposit $1000 from the correct wallet and calculate points for DCA vault", async function () {
                expect(await mockedUSDC.balanceOf(dcaApprovedControlWallet)).to.equal(1000 * 10 ** 6)

                beforeDiamondBalance = await mockedUSDC.balanceOf(diamondAddress)

                await mockedUSDC.connect(dcaApprovedControlWallet).approve(diamondAddress, 1000 * 10 ** 6)

                await expect(vaultFacet.connect(dcaApprovedControlWallet).depositProfitsAndcalculateVaultRewardPoints(dcaVaultIndex, 1000 * 10 ** 6))
                    .to.emit(vaultFacet, "VaultRewardPointsCalculated")
                    .withArgs(dcaVaultIndex, expectedTotalRewardPointsForCycle, 100 * 10 ** 6, 900 * 10 ** 6)

                expectedDiamondContractBalance += Number(1000 * 10 ** 6)

                let afterDepsoitBalance = await mockedUSDC.balanceOf(diamondAddress)

                assert.equal(afterDepsoitBalance, BigInt(beforeDiamondBalance) + BigInt(1000 * 10 ** 6))

                expect(await mockedUSDC.balanceOf(dcaApprovedControlWallet)).to.equal(0)
            })

            it("confirm coreTeam Balance increased after deposit", async function () {
                let coreTeamBalance = await infoGetterFacet.getCoreTeamBalance()

                expect(Number(coreTeamBalance)).to.equal(BigInt(totalMintingCost * 0.1) + BigInt(100 * 10 ** 6))
            })

            it("confirm vault information is correct after depsoit", async function () {
                let vaultInfo = await vaultFacet.getVaultInformation(0)
                expect(vaultInfo[0]).to.equal("DCA Vault") // name
                expect(Number(vaultInfo[1])).to.equal(totalSaltInDCAVault) // totalSalt
                expect(Number(vaultInfo[2])).to.equal(expectedTotalRewardPointsForCycle) // totalRewardPoints
                expect(Number(vaultInfo[3])).to.equal(0) // withdrawableAmount
                expect(Number(vaultInfo[4])).to.equal(900 * 10 ** 6) // dispersableProfitAmount
                expect(Number(vaultInfo[5])).to.equal(900 * 10 ** 6) // lifetimeRewardAmount
                expect(vaultInfo[6]).to.equal(dcaWallet.address) // walletAddress
                expect(vaultInfo[7]).to.equal(dcaApprovedControlWallet.address) // approvedControlWallet
            })

            it("confirm global reward total increased to $1000 after deposit", async function () {
                let globalRewardTotal = await infoGetterFacet.getGlobalRewardTotal()
                expect(globalRewardTotal).to.equal(900 * 10 ** 6)
            })

            it("confirm points are correct for each index", async function () {
                expect(await vaultFacet.getNftRewardPoints(dcaVaultIndex, 1)).to.equal(1028100)
                expect(await vaultFacet.getNftRewardPoints(dcaVaultIndex, 2)).to.equal(1028100)
                expect(await vaultFacet.getNftRewardPoints(dcaVaultIndex, 3)).to.equal(1028100)
                expect(await vaultFacet.getNftRewardPoints(dcaVaultIndex, 4)).to.equal(1028100)
                expect(await vaultFacet.getNftRewardPoints(dcaVaultIndex, 5)).to.equal(1028100)
                expect(await vaultFacet.getNftRewardPoints(dcaVaultIndex, 51)).to.equal(0)
            })

            it("confirm Qaunt Vault information hasn't changed", async function () {
                let vaultInfo = await vaultFacet.getVaultInformation(1)
                expect(vaultInfo[0]).to.equal("Quant Vault") // name
                expect(Number(vaultInfo[1])).to.equal(totalSaltInQuantAVault) // totalSalt
                expect(Number(vaultInfo[2])).to.equal(0) // totalRewardPoints
                expect(Number(vaultInfo[3])).to.equal(totalWithdrawableAmountForQuantVault) // withdrawableAmount
                expect(Number(vaultInfo[4])).to.equal(0) // dispersableProfitAmount
                expect(Number(vaultInfo[5])).to.equal(0) // lifetimeRewardAmount
                expect(vaultInfo[6]).to.equal(qauntWallet.address) // walletAddress
                expect(vaultInfo[7]).to.equal(quantApprovedControlWallet.address) // approvedControlWallet
            })

            it("confirm balances on contract match the expected total", async function () {
                let diamondContractBalance = await mockedUSDC.balanceOf(diamondAddress)
                let coreTeamBalance = await infoGetterFacet.getCoreTeamBalance()
                let vaultHoldingBalance = await infoGetterFacet.getVaultHoldingBalance()
                let totalRewardBalance = await infoGetterFacet.getTotalRewardBalance()
                let VaultCouncilBalance = await infoGetterFacet.getVaultCouncilBalance()
                let dcaVaultWithdrawableBalance = await vaultFacet.getVaultWithdrawableAmount(0)
                let quantVaultWithdrawableBalance = await vaultFacet.getVaultWithdrawableAmount(1)

                let dcaVaultInfo = await vaultFacet.getVaultInformation(0)
                let dispersableAmountForDCAVault = dcaVaultInfo[4]

                let quantVaultInfo = await vaultFacet.getVaultInformation(1)
                let dispersableAmountForQuantVault = quantVaultInfo[4]

                // console.log("CoreTeamBalance:", coreTeamBalance)
                // console.log("vaultHoldingBalance:", vaultHoldingBalance)
                // console.log("totalRewardBalance:", totalRewardBalance)
                // console.log("VaultCouncilBalance:", VaultCouncilBalance)
                // console.log("dcaVaultWithdrawableBalance:", dcaVaultWithdrawableBalance)
                // console.log("quantVaultWithdrawableBalance:", quantVaultWithdrawableBalance)
                // console.log("dispersableAmountForDCAVault:", Number(dispersableAmountForDCAVault) / 10 ** 6)
                // console.log("dispersableAmountForQuantVault:", Number(dispersableAmountForQuantVault) / 10 ** 6)
                // console.log("diamondContractBalance:", Number(diamondContractBalance) / 10 ** 6)

                expect(
                    Number(coreTeamBalance) +
                        Number(vaultHoldingBalance) +
                        Number(totalRewardBalance) +
                        Number(VaultCouncilBalance) +
                        Number(dcaVaultWithdrawableBalance) +
                        Number(quantVaultWithdrawableBalance) +
                        Number(dispersableAmountForDCAVault) +
                        Number(dispersableAmountForQuantVault),
                ).to.equal(Number(diamondContractBalance))
            })

            it("Assert diamondContractBalance to equals expectedDiamondContractBalance", async function () {
                let diamondContractBalance = await mockedUSDC.balanceOf(diamondAddress)
                assert.equal(diamondContractBalance, expectedDiamondContractBalance)
            })

            it("Assert expectedDiamondContractBalance == 7250 * 10 ** 6 ", async function () {
                assert.equal(expectedDiamondContractBalance, 7250 * 10 ** 6)
            })
        })

        describe("Disperse profits to NFTs", function () {
            let dcaVaultIndex = 0
            it("confirm only approved wallet can call the function", async function () {
                await expect(vaultFacet.connect(quantApprovedControlWallet).rewardVaultIndex(dcaVaultIndex, 1, 99999)).to.revertedWith("must be the approved vault wallet")
            })
            it("allow approved wallet to call the reward function", async function () {
                await expect(vaultFacet.connect(dcaApprovedControlWallet).rewardVaultIndex(dcaVaultIndex, 1, 99999))
                    .to.emit(vaultFacet, "ProfitsDispersedToHolders")
                    .withArgs(dcaVaultIndex, 1, 10)
            })

            it("confirm all the reward points are set back to zero for each NFT", async function () {
                expect(await vaultFacet.getNftRewardPoints(dcaVaultIndex, 1)).to.equal(0)
                expect(await vaultFacet.getNftRewardPoints(dcaVaultIndex, 2)).to.equal(0)
                expect(await vaultFacet.getNftRewardPoints(dcaVaultIndex, 3)).to.equal(0)
                expect(await vaultFacet.getNftRewardPoints(dcaVaultIndex, 4)).to.equal(0)
                expect(await vaultFacet.getNftRewardPoints(dcaVaultIndex, 5)).to.equal(0)
                expect(await vaultFacet.getNftRewardPoints(dcaVaultIndex, 51)).to.equal(0)
            })

            expectedRewardEachMonth = (900 * 10 ** 6) / 5
            it("confirm the bankRewardsBalance each person", async function () {
                console.log("bankbalanceForSigner10:", await bankFacet.connect(signers[10]).getBankRewardsBalance())
                console.log("bankbalanceForSigner11:", await bankFacet.connect(signers[11]).getBankRewardsBalance())
                console.log("bankbalanceForSigner12:", await bankFacet.connect(signers[12]).getBankRewardsBalance())
                console.log("bankbalanceForSigner13:", await bankFacet.connect(signers[13]).getBankRewardsBalance())
                console.log("bankbalanceForSigner14:", await bankFacet.connect(signers[14]).getBankRewardsBalance())
                console.log("bankbalanceForSigner15:", await bankFacet.connect(signers[15]).getBankRewardsBalance())
                console.log("bankbalanceForSigner16:", await bankFacet.connect(signers[16]).getBankRewardsBalance())
                console.log("bankbalanceForSigner17:", await bankFacet.connect(signers[17]).getBankRewardsBalance())
                console.log("bankbalanceForSigner18:", await bankFacet.connect(signers[18]).getBankRewardsBalance())
                console.log("bankbalanceForSigner19:", await bankFacet.connect(signers[19]).getBankRewardsBalance())
                console.log("bankbalanceForSigner20:", await bankFacet.connect(signers[20]).getBankRewardsBalance())
                console.log("bankbalanceForCoreTeamWallet:", await bankFacet.connect(coreTeamWallet).getBankRewardsBalance())

                expect(await bankFacet.connect(signers[10]).getBankRewardsBalance()).to.equal(expectedRewardEachMonth)
                expect(await bankFacet.connect(signers[11]).getBankRewardsBalance()).to.equal(expectedRewardEachMonth)
                expect(await bankFacet.connect(signers[12]).getBankRewardsBalance()).to.equal(0)
                expect(await bankFacet.connect(signers[13]).getBankRewardsBalance()).to.equal(expectedRewardEachMonth)
                expect(await bankFacet.connect(signers[14]).getBankRewardsBalance()).to.equal(expectedRewardEachMonth)
                expect(await bankFacet.connect(signers[15]).getBankRewardsBalance()).to.equal(0)
                expect(await bankFacet.connect(signers[16]).getBankRewardsBalance()).to.equal(0)
                expect(await bankFacet.connect(signers[17]).getBankRewardsBalance()).to.equal(0)
                expect(await bankFacet.connect(signers[18]).getBankRewardsBalance()).to.equal(0)
                expect(await bankFacet.connect(signers[19]).getBankRewardsBalance()).to.equal(0)
                expect(await bankFacet.connect(signers[20]).getBankRewardsBalance()).to.equal(0)
                expect(await bankFacet.connect(coreTeamWallet).getBankRewardsBalance()).to.equal(0)
            })

            it("confirm the totalRewardBalance variable has increased correctly", async function () {
                expect(await infoGetterFacet.getTotalRewardBalance()).to.equal(expectedRewardEachMonth * 4)
            })

            it("confirm balances on contract match the expected total", async function () {
                let diamondContractBalance = await mockedUSDC.balanceOf(diamondAddress)
                let coreTeamBalance = await infoGetterFacet.getCoreTeamBalance()
                let vaultHoldingBalance = await infoGetterFacet.getVaultHoldingBalance()
                let totalRewardBalance = await infoGetterFacet.getTotalRewardBalance()
                let VaultCouncilBalance = await infoGetterFacet.getVaultCouncilBalance()
                let dcaVaultWithdrawableBalance = await vaultFacet.getVaultWithdrawableAmount(0)
                let quantVaultWithdrawableBalance = await vaultFacet.getVaultWithdrawableAmount(1)

                let dcaVaultInfo = await vaultFacet.getVaultInformation(0)
                let dispersableAmountForDCAVault = dcaVaultInfo[4]

                let quantVaultInfo = await vaultFacet.getVaultInformation(1)
                let dispersableAmountForQuantVault = quantVaultInfo[4]

                // console.log("CoreTeamBalance:", coreTeamBalance)
                // console.log("vaultHoldingBalance:", vaultHoldingBalance)
                // console.log("totalRewardBalance:", totalRewardBalance)
                // console.log("VaultCouncilBalance:", VaultCouncilBalance)
                // console.log("dcaVaultWithdrawableBalance:", dcaVaultWithdrawableBalance)
                // console.log("quantVaultWithdrawableBalance:", quantVaultWithdrawableBalance)
                // console.log("dispersableAmountForDCAVault:", Number(dispersableAmountForDCAVault) / 10 ** 6)
                // console.log("dispersableAmountForQuantVault:", Number(dispersableAmountForQuantVault) / 10 ** 6)
                // console.log("diamondContractBalance:", Number(diamondContractBalance) / 10 ** 6)

                expect(
                    Number(coreTeamBalance) +
                        Number(vaultHoldingBalance) +
                        Number(totalRewardBalance) +
                        Number(VaultCouncilBalance) +
                        Number(dcaVaultWithdrawableBalance) +
                        Number(quantVaultWithdrawableBalance) +
                        Number(dispersableAmountForDCAVault) +
                        Number(dispersableAmountForQuantVault),
                ).to.equal(Number(diamondContractBalance))
            })

            expectedSaltIncrease = Math.floor((expectedRewardEachMonth + expectedRewardEachMonth * 0.1) / (0.8 * 10 ** 6)) // 247 grains

            it("confirm salt in the vault increased based on compounding of p12", async function () {
                let dcaVaultInfo = await vaultFacet.getVaultInformation(dcaVaultIndex)
                let totalSaltInDCAVaultAfterRewarding = dcaVaultInfo[1]

                expect(BigInt(totalSaltInDCAVaultbeforeRewarding) + BigInt(expectedSaltIncrease)).to.equal(totalSaltInDCAVaultAfterRewarding)
            })

            it("confirm salt in increased only for index 3", async function () {
                expect(await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 1)).to.equal(totalSaltDepositedForIndex1BeforeRewarding)
                expect(await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 2)).to.equal(totalSaltDepositedForIndex2BeforeRewarding)
                expect(await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 3)).to.equal(BigInt(totalSaltDepositedForIndex3BeforeRewarding) + BigInt(expectedSaltIncrease))
                expect(await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 4)).to.equal(totalSaltDepositedForIndex4BeforeRewarding)
                expect(await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 5)).to.equal(totalSaltDepositedForIndex5BeforeRewarding)
                expect(await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 6)).to.equal(totalSaltDepositedForIndex6BeforeRewarding)
                expect(await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 51)).to.equal(totalSaltDepositedForIndex51BeforeRewarding)
                expect(await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 52)).to.equal(totalSaltDepositedForIndex52BeforeRewarding)
                expect(await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 53)).to.equal(totalSaltDepositedForIndex53BeforeRewarding)
                expect(await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 54)).to.equal(totalSaltDepositedForIndex54BeforeRewarding)
                expect(await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 55)).to.equal(totalSaltDepositedForIndex55BeforeRewarding)
                expect(await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 56)).to.equal(totalSaltDepositedForIndex56BeforeRewarding)
            })

            it("confirm continous compounding count only increased for index 3", async function () {
                expect(await vaultFacet.getContinuousMonthsCompounding(dcaVaultIndex, 10)).to.equal(0)
                expect(await vaultFacet.getContinuousMonthsCompounding(dcaVaultIndex, 2)).to.equal(0)
                expect(await vaultFacet.getContinuousMonthsCompounding(dcaVaultIndex, 3)).to.equal(1)
                expect(await vaultFacet.getContinuousMonthsCompounding(dcaVaultIndex, 4)).to.equal(0)
                expect(await vaultFacet.getContinuousMonthsCompounding(dcaVaultIndex, 5)).to.equal(0)
                expect(await vaultFacet.getContinuousMonthsCompounding(dcaVaultIndex, 6)).to.equal(0)
                expect(await vaultFacet.getContinuousMonthsCompounding(dcaVaultIndex, 51)).to.equal(0)
                expect(await vaultFacet.getContinuousMonthsCompounding(dcaVaultIndex, 52)).to.equal(0)
                expect(await vaultFacet.getContinuousMonthsCompounding(dcaVaultIndex, 53)).to.equal(0)
                expect(await vaultFacet.getContinuousMonthsCompounding(dcaVaultIndex, 54)).to.equal(0)
                expect(await vaultFacet.getContinuousMonthsCompounding(dcaVaultIndex, 55)).to.equal(0)
                expect(await vaultFacet.getContinuousMonthsCompounding(dcaVaultIndex, 56)).to.equal(0)
            })

            it("confirm no one has a bonus for deposits yet", async function () {
                expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVaultIndex, 1)).to.equal(false)
                expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVaultIndex, 2)).to.equal(false)
                expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVaultIndex, 3)).to.equal(false)
                expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVaultIndex, 4)).to.equal(false)
                expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVaultIndex, 5)).to.equal(false)
                expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVaultIndex, 6)).to.equal(false)
                expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVaultIndex, 51)).to.equal(false)
                expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVaultIndex, 52)).to.equal(false)
                expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVaultIndex, 53)).to.equal(false)
                expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVaultIndex, 54)).to.equal(false)
                expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVaultIndex, 55)).to.equal(false)
                expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVaultIndex, 56)).to.equal(false)
            })

            it("Assert diamondContractBalance to equals expectedDiamondContractBalance", async function () {
                let diamondContractBalance = await mockedUSDC.balanceOf(diamondAddress)
                assert.equal(diamondContractBalance, expectedDiamondContractBalance)
            })

            it("Assert expectedDiamondContractBalance == 7250 * 10 ** 6 ", async function () {
                assert.equal(expectedDiamondContractBalance, 7250 * 10 ** 6)
            })
        })
    })

    describe("Reward Cycle Month 2", function () {
        describe("Withdraw USDC from the DCA Vault", function () {
            it("confirm balances before withdrawing DCA Vault", async function () {
                // console.log("mockedUSDC balance of saltVaultBulls:", await mockedUSDC.balanceOf(saltVaultBulls.target))
                // console.log("mockedUSDC balance of dimaond:", await mockedUSDC.balanceOf(diamondAddress))
                // console.log("mockedUSDC balance of ERC721Facet:", await mockedUSDC.balanceOf(erc721Facet.target))
                // console.log("mockedUSDC balance of DCA Vault:", await vaultFacet.getVaultWithdrawableAmount(0))
                // console.log("mockedUSDC balance of Quant Vault:", await vaultFacet.getVaultWithdrawableAmount(1))

                CoreTeamBalance = await infoGetterFacet.getCoreTeamBalance()
                VaultHoldingBalance = await infoGetterFacet.getVaultHoldingBalance()
                TotalRewardBalance = await infoGetterFacet.getTotalRewardBalance()
                VaultCouncilBalance = await infoGetterFacet.getVaultCouncilBalance()
                GemTokenChallangeBalance = await infoGetterFacet.getGemTokenChallengeBalance()
                GemTokenSalesBalance = await infoGetterFacet.getGemTokenSalesBalance()

                DcaVaultBalance = await vaultFacet.getVaultWithdrawableAmount(0)
                QuantVaultBalance = await vaultFacet.getVaultWithdrawableAmount(1)

                DcaApprovedControlWalletBalance = await mockedUSDC.balanceOf(dcaApprovedControlWallet.address)
                QuantApprovedControlWalletBalance = await mockedUSDC.balanceOf(quantApprovedControlWallet.address)

                DiamondContractBalance = await mockedUSDC.balanceOf(diamondAddress)
                SaltVaultTokenContractBalance = await mockedUSDC.balanceOf(saltVaultBulls.target)
                CoreTeamWalletBalance = await mockedUSDC.balanceOf(coreTeamWallet.address)
                RoyaltiesWalletBalance = await mockedUSDC.balanceOf(royaltiesWallet.address)
                ProcurementWalletBalance = await mockedUSDC.balanceOf(procurementWallet.address)
                GemTokenBurnWalletBalance = await mockedUSDC.balanceOf(gemTokenBurnWallet.address)

                bankRewardsBalance_P10 = await bankFacet.connect(signers[10]).getBankRewardsBalance()
                bankRewardsBalance_P11 = await bankFacet.connect(signers[11]).getBankRewardsBalance()
                bankRewardsBalance_P12 = await bankFacet.connect(signers[12]).getBankRewardsBalance()
                bankRewardsBalance_P13 = await bankFacet.connect(signers[13]).getBankRewardsBalance()
                bankRewardsBalance_P14 = await bankFacet.connect(signers[14]).getBankRewardsBalance()
                bankRewardsBalance_P15 = await bankFacet.connect(signers[15]).getBankRewardsBalance()
                bankRewardsBalance_P16 = await bankFacet.connect(signers[16]).getBankRewardsBalance()
                bankRewardsBalance_P17 = await bankFacet.connect(signers[17]).getBankRewardsBalance()
                bankRewardsBalance_P18 = await bankFacet.connect(signers[18]).getBankRewardsBalance()
                bankRewardsBalance_P19 = await bankFacet.connect(signers[19]).getBankRewardsBalance()
                bankRewardsBalance_P20 = await bankFacet.connect(signers[20]).getBankRewardsBalance()
                bankRewardsBalance_coreTeam = await bankFacet.connect(coreTeamWallet).getBankRewardsBalance()

                expect(Number(CoreTeamBalance)).to.equal(BigInt(totalMintingCost * 0.1) + BigInt(100 * 10 ** 6))
                assert.equal(VaultHoldingBalance, 0) // went to zero when salt was deposited by each person into the DCA and Quant Vault
                assert.equal(TotalRewardBalance, 180 * 10 ** 6 * 4)
                assert.equal(VaultCouncilBalance, 0)
                assert.equal(GemTokenChallangeBalance, 0)
                assert.equal(GemTokenSalesBalance, 0)

                assert.equal(DcaVaultBalance, 180 * 10 ** 6) // compounded amount for index 3
                assert.equal(QuantVaultBalance, totalWithdrawableAmountForQuantVault)

                assert.equal(DcaApprovedControlWalletBalance, 0)
                assert.equal(QuantApprovedControlWalletBalance, 0)

                assert.equal(DiamondContractBalance, 7250 * 10 ** 6)
                assert.equal(SaltVaultTokenContractBalance, 0)
                assert.equal(CoreTeamWalletBalance, 0)
                assert.equal(RoyaltiesWalletBalance, 0)
                assert.equal(ProcurementWalletBalance, 0)
                assert.equal(GemTokenBurnWalletBalance, 0)

                assert.equal(bankRewardsBalance_P10, expectedRewardEachMonth)
                assert.equal(bankRewardsBalance_P11, expectedRewardEachMonth)
                assert.equal(bankRewardsBalance_P12, 0)
                assert.equal(bankRewardsBalance_P13, expectedRewardEachMonth)
                assert.equal(bankRewardsBalance_P14, expectedRewardEachMonth)
                assert.equal(bankRewardsBalance_P15, 0)
                assert.equal(bankRewardsBalance_P16, 0)
                assert.equal(bankRewardsBalance_P17, 0)
                assert.equal(bankRewardsBalance_P18, 0)
                assert.equal(bankRewardsBalance_P19, 0)
                assert.equal(bankRewardsBalance_P20, 0)
                assert.equal(bankRewardsBalance_coreTeam, 0)
            })
            it("revert when wrong wallet tries to withdraw the DCA vault", async function () {
                let dcaVaultIndex = 0
                await expect(vaultFacet.connect(signers[10]).withdrawVaultFunds(dcaVaultIndex)).to.revertedWith("must be the approved Control Wallet for this vault")
            })

            it("allow correct wallet to withdraw the DCA vault", async function () {
                let dcaVaultIndex = 0

                let expectedWithawAmount = 180 * 10 ** 6 // amount that was compounded from index 3 during reward cycle 1
                await expect(vaultFacet.connect(dcaApprovedControlWallet).withdrawVaultFunds(dcaVaultIndex))
                    .to.emit(vaultFacet, "FundsWithdrawn")
                    .withArgs(0, dcaApprovedControlWallet, expectedWithawAmount)

                expectedDiamondContractBalance -= Number(expectedWithawAmount)
            })

            it("Assert expectedDiamondContractBalance == 7070 * 10 ** 6 ", async function () {
                assert.equal(expectedDiamondContractBalance, 7070 * 10 ** 6) // 7250 - 180
            })

            it("confirm balances after withdrawing DCA Vault", async function () {
                // console.log("mockedUSDC balance of saltVaultBulls:", await mockedUSDC.balanceOf(saltVaultBulls.target))
                // console.log("mockedUSDC balance of dimaond:", await mockedUSDC.balanceOf(diamondAddress))
                // console.log("mockedUSDC balance of ERC721Facet:", await mockedUSDC.balanceOf(erc721Facet.target))
                // console.log("mockedUSDC balance of DCA Vault:", await vaultFacet.getVaultWithdrawableAmount(0))
                // console.log("mockedUSDC balance of Quant Vault:", await vaultFacet.getVaultWithdrawableAmount(1))

                CoreTeamBalance = await infoGetterFacet.getCoreTeamBalance()
                VaultHoldingBalance = await infoGetterFacet.getVaultHoldingBalance()
                TotalRewardBalance = await infoGetterFacet.getTotalRewardBalance()
                VaultCouncilBalance = await infoGetterFacet.getVaultCouncilBalance()
                GemTokenChallangeBalance = await infoGetterFacet.getGemTokenChallengeBalance()
                GemTokenSalesBalance = await infoGetterFacet.getGemTokenSalesBalance()

                DcaVaultBalance = await vaultFacet.getVaultWithdrawableAmount(0)
                QuantVaultBalance = await vaultFacet.getVaultWithdrawableAmount(1)

                DcaApprovedControlWalletBalance = await mockedUSDC.balanceOf(dcaApprovedControlWallet.address)
                QuantApprovedControlWalletBalance = await mockedUSDC.balanceOf(quantApprovedControlWallet.address)

                DiamondContractBalance = await mockedUSDC.balanceOf(diamondAddress)
                SaltVaultTokenContractBalance = await mockedUSDC.balanceOf(saltVaultBulls.target)
                CoreTeamWalletBalance = await mockedUSDC.balanceOf(coreTeamWallet.address)
                RoyaltiesWalletBalance = await mockedUSDC.balanceOf(royaltiesWallet.address)
                ProcurementWalletBalance = await mockedUSDC.balanceOf(procurementWallet.address)
                GemTokenBurnWalletBalance = await mockedUSDC.balanceOf(gemTokenBurnWallet.address)

                bankRewardsBalance_P10 = await bankFacet.connect(signers[10]).getBankRewardsBalance()
                bankRewardsBalance_P11 = await bankFacet.connect(signers[11]).getBankRewardsBalance()
                bankRewardsBalance_P12 = await bankFacet.connect(signers[12]).getBankRewardsBalance()
                bankRewardsBalance_P13 = await bankFacet.connect(signers[13]).getBankRewardsBalance()
                bankRewardsBalance_P14 = await bankFacet.connect(signers[14]).getBankRewardsBalance()
                bankRewardsBalance_P15 = await bankFacet.connect(signers[15]).getBankRewardsBalance()
                bankRewardsBalance_P16 = await bankFacet.connect(signers[16]).getBankRewardsBalance()
                bankRewardsBalance_P17 = await bankFacet.connect(signers[17]).getBankRewardsBalance()
                bankRewardsBalance_P18 = await bankFacet.connect(signers[18]).getBankRewardsBalance()
                bankRewardsBalance_P19 = await bankFacet.connect(signers[19]).getBankRewardsBalance()
                bankRewardsBalance_P20 = await bankFacet.connect(signers[20]).getBankRewardsBalance()
                bankRewardsBalance_coreTeam = await bankFacet.connect(coreTeamWallet).getBankRewardsBalance()

                expect(Number(CoreTeamBalance)).to.equal(BigInt(totalMintingCost * 0.1) + BigInt(100 * 10 ** 6))
                assert.equal(VaultHoldingBalance, 0) // went to zero when salt was deposited by each person into the DCA and Quant Vault
                assert.equal(TotalRewardBalance, 180 * 10 ** 6 * 4)
                assert.equal(VaultCouncilBalance, 0)
                assert.equal(GemTokenChallangeBalance, 0)
                assert.equal(GemTokenSalesBalance, 0)

                assert.equal(DcaVaultBalance, 0) //
                assert.equal(QuantVaultBalance, totalWithdrawableAmountForQuantVault)

                assert.equal(DcaApprovedControlWalletBalance, 180 * 10 ** 6)
                assert.equal(QuantApprovedControlWalletBalance, 0)

                assert.equal(DiamondContractBalance, 7250 * 10 ** 6 - 180 * 10 ** 6)
                assert.equal(SaltVaultTokenContractBalance, 0)
                assert.equal(CoreTeamWalletBalance, 0)
                assert.equal(RoyaltiesWalletBalance, 0)
                assert.equal(ProcurementWalletBalance, 0)
                assert.equal(GemTokenBurnWalletBalance, 0)

                assert.equal(bankRewardsBalance_P10, expectedRewardEachMonth)
                assert.equal(bankRewardsBalance_P11, expectedRewardEachMonth)
                assert.equal(bankRewardsBalance_P12, 0)
                assert.equal(bankRewardsBalance_P13, expectedRewardEachMonth)
                assert.equal(bankRewardsBalance_P14, expectedRewardEachMonth)
                assert.equal(bankRewardsBalance_P15, 0)
                assert.equal(bankRewardsBalance_P16, 0)
                assert.equal(bankRewardsBalance_P17, 0)
                assert.equal(bankRewardsBalance_P18, 0)
                assert.equal(bankRewardsBalance_P19, 0)
                assert.equal(bankRewardsBalance_P20, 0)
                assert.equal(bankRewardsBalance_coreTeam, 0)
            })

            it("confirm balances on contract match the expected total", async function () {
                let diamondContractBalance = await mockedUSDC.balanceOf(diamondAddress)
                let coreTeamBalance = await infoGetterFacet.getCoreTeamBalance()
                let vaultHoldingBalance = await infoGetterFacet.getVaultHoldingBalance()
                let totalRewardBalance = await infoGetterFacet.getTotalRewardBalance()
                let VaultCouncilBalance = await infoGetterFacet.getVaultCouncilBalance()
                let dcaVaultWithdrawableBalance = await vaultFacet.getVaultWithdrawableAmount(0)
                let quantVaultWithdrawableBalance = await vaultFacet.getVaultWithdrawableAmount(1)

                let dcaVaultInfo = await vaultFacet.getVaultInformation(0)
                let dispersableAmountForDCAVault = dcaVaultInfo[4]

                let quantVaultInfo = await vaultFacet.getVaultInformation(1)
                let dispersableAmountForQuantVault = quantVaultInfo[4]

                // console.log("CoreTeamBalance:", coreTeamBalance)
                // console.log("vaultHoldingBalance:", vaultHoldingBalance)
                // console.log("totalRewardBalance:", totalRewardBalance)
                // console.log("VaultCouncilBalance:", VaultCouncilBalance)
                // console.log("dcaVaultWithdrawableBalance:", dcaVaultWithdrawableBalance)
                // console.log("quantVaultWithdrawableBalance:", quantVaultWithdrawableBalance)
                // console.log("dispersableAmountForDCAVault:", Number(dispersableAmountForDCAVault) / 10 ** 6)
                // console.log("dispersableAmountForQuantVault:", Number(dispersableAmountForQuantVault) / 10 ** 6)
                // console.log("diamondContractBalance:", Number(diamondContractBalance) / 10 ** 6)

                expect(
                    Number(coreTeamBalance) +
                        Number(vaultHoldingBalance) +
                        Number(totalRewardBalance) +
                        Number(VaultCouncilBalance) +
                        Number(dcaVaultWithdrawableBalance) +
                        Number(quantVaultWithdrawableBalance) +
                        Number(dispersableAmountForDCAVault) +
                        Number(dispersableAmountForQuantVault),
                ).to.equal(Number(diamondContractBalance))
            })

            describe("Mocked sending funds to binance account and getting $100 back", function () {
                it("send all funds from wallet to mockedBinance account and get 1K back", async function () {
                    let balanceToSend = await mockedUSDC.balanceOf(dcaApprovedControlWallet)

                    expect(balanceToSend).to.equal(180 * 10 ** 6)

                    await mockedUSDC.connect(dcaApprovedControlWallet).transfer(mockedBinanceAccount, balanceToSend)

                    expect(await mockedUSDC.balanceOf(dcaApprovedControlWallet)).to.equal(0)

                    await mockedUSDC.connect(mockedBinanceAccount).transfer(dcaApprovedControlWallet, 100 * 10 ** 6)

                    expect(await mockedUSDC.balanceOf(dcaApprovedControlWallet)).to.equal(100 * 10 ** 6)
                })
            })

            describe("Confirm compounding rates are still intact", function () {
                it("confirm compounding rates are correct now after index 3 is set to 100", async function () {
                    let dcaVaultIndex = 0
                    expect(await vaultFacet.getNftVaultCompoundingRate(dcaVaultIndex, 1)).to.equal(0)
                    expect(await vaultFacet.getNftVaultCompoundingRate(dcaVaultIndex, 2)).to.equal(0)
                    expect(await vaultFacet.getNftVaultCompoundingRate(dcaVaultIndex, 3)).to.equal(100)
                    expect(await vaultFacet.getNftVaultCompoundingRate(dcaVaultIndex, 4)).to.equal(0)
                    expect(await vaultFacet.getNftVaultCompoundingRate(dcaVaultIndex, 5)).to.equal(0)
                })
            })

            describe(" Confirm Vault information is correct before rewarding", function () {
                let dcaVault = 0

                it("confirm compounding rates are correct now after index 3 is set to 100", async function () {
                    expect(await vaultFacet.getNftVaultCompoundingRate(dcaVault, 1)).to.equal(0)
                    expect(await vaultFacet.getNftVaultCompoundingRate(dcaVault, 2)).to.equal(0)
                    expect(await vaultFacet.getNftVaultCompoundingRate(dcaVault, 3)).to.equal(100)
                    expect(await vaultFacet.getNftVaultCompoundingRate(dcaVault, 4)).to.equal(0)
                    expect(await vaultFacet.getNftVaultCompoundingRate(dcaVault, 5)).to.equal(0)
                    expect(await vaultFacet.getNftVaultCompoundingRate(dcaVault, 6)).to.equal(0)
                    expect(await vaultFacet.getNftVaultCompoundingRate(dcaVault, 51)).to.equal(0)
                    expect(await vaultFacet.getNftVaultCompoundingRate(dcaVault, 52)).to.equal(0)
                    expect(await vaultFacet.getNftVaultCompoundingRate(dcaVault, 53)).to.equal(0)
                    expect(await vaultFacet.getNftVaultCompoundingRate(dcaVault, 54)).to.equal(0)
                    expect(await vaultFacet.getNftVaultCompoundingRate(dcaVault, 55)).to.equal(0)
                    expect(await vaultFacet.getNftVaultCompoundingRate(dcaVault, 56)).to.equal(0)
                })
                it("confirm salt deposit amounts", async function () {
                    expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 1)).to.equal(expectedSaltForEachDiamondBull)
                    expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 2)).to.equal(expectedSaltForEachDiamondBull)
                    expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 3)).to.equal(expectedSaltForEachDiamondBull + expectedSaltIncrease)
                    expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 4)).to.equal(expectedSaltForEachDiamondBull)
                    expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 5)).to.equal(expectedSaltForEachDiamondBull)
                    expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 6)).to.equal(0)
                    expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 51)).to.equal(0)
                    expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 52)).to.equal(0)
                    expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 53)).to.equal(0)
                    expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 54)).to.equal(0)
                    expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 55)).to.equal(0)
                })

                it("confirm salt deposit amounts", async function () {
                    expect(await vaultFacet.getNftRewardPoints(dcaVault, 1)).to.equal(0)
                    expect(await vaultFacet.getNftRewardPoints(dcaVault, 2)).to.equal(0)
                    expect(await vaultFacet.getNftRewardPoints(dcaVault, 3)).to.equal(0)
                    expect(await vaultFacet.getNftRewardPoints(dcaVault, 4)).to.equal(0)
                    expect(await vaultFacet.getNftRewardPoints(dcaVault, 5)).to.equal(0)
                    expect(await vaultFacet.getNftRewardPoints(dcaVault, 6)).to.equal(0)
                    expect(await vaultFacet.getNftRewardPoints(dcaVault, 51)).to.equal(0)
                    expect(await vaultFacet.getNftRewardPoints(dcaVault, 52)).to.equal(0)
                    expect(await vaultFacet.getNftRewardPoints(dcaVault, 53)).to.equal(0)
                    expect(await vaultFacet.getNftRewardPoints(dcaVault, 54)).to.equal(0)
                    expect(await vaultFacet.getNftRewardPoints(dcaVault, 55)).to.equal(0)
                })

                it("confirm getContinuousMonthsCompounding", async function () {
                    expect(await vaultFacet.getContinuousMonthsCompounding(dcaVault, 1)).to.equal(0)
                    expect(await vaultFacet.getContinuousMonthsCompounding(dcaVault, 2)).to.equal(0)
                    expect(await vaultFacet.getContinuousMonthsCompounding(dcaVault, 3)).to.equal(1)
                    expect(await vaultFacet.getContinuousMonthsCompounding(dcaVault, 4)).to.equal(0)
                    expect(await vaultFacet.getContinuousMonthsCompounding(dcaVault, 5)).to.equal(0)
                    expect(await vaultFacet.getContinuousMonthsCompounding(dcaVault, 6)).to.equal(0)
                    expect(await vaultFacet.getContinuousMonthsCompounding(dcaVault, 51)).to.equal(0)
                    expect(await vaultFacet.getContinuousMonthsCompounding(dcaVault, 52)).to.equal(0)
                    expect(await vaultFacet.getContinuousMonthsCompounding(dcaVault, 53)).to.equal(0)
                    expect(await vaultFacet.getContinuousMonthsCompounding(dcaVault, 54)).to.equal(0)
                    expect(await vaultFacet.getContinuousMonthsCompounding(dcaVault, 55)).to.equal(0)
                })

                it("confirm getBonusEligibilityForVaultDeposit", async function () {
                    expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVault, 1)).to.equal(false)
                    expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVault, 2)).to.equal(false)
                    expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVault, 3)).to.equal(false)
                    expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVault, 4)).to.equal(false)
                    expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVault, 5)).to.equal(false)
                    expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVault, 6)).to.equal(false)
                    expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVault, 51)).to.equal(false)
                    expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVault, 52)).to.equal(false)
                    expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVault, 53)).to.equal(false)
                    expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVault, 54)).to.equal(false)
                    expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVault, 55)).to.equal(false)
                })

                it("Confirm DCA Vault Information", async function () {
                    let vaultInfo = await vaultFacet.getVaultInformation(0)
                    expect(vaultInfo[0]).to.equal("DCA Vault") // name
                    expect(Number(vaultInfo[1])).to.equal(totalSaltInDCAVault + expectedSaltIncrease) // totalSalt
                    expect(Number(vaultInfo[2])).to.equal(0) // totalRewardPoints         // this doesn't reset until we deposit profits into the vault for the next cycle
                    expect(Number(vaultInfo[3])).to.equal(0) // withdrawableAmount
                    expect(Number(vaultInfo[4])).to.equal(0) // dispersableProfitAmount
                    expect(Number(vaultInfo[5])).to.equal(900 * 10 ** 6) // lifetimeRewardAmount
                    expect(vaultInfo[6]).to.equal(dcaWallet.address) // walletAddress
                    expect(vaultInfo[7]).to.equal(dcaApprovedControlWallet.address) // approvedControlWallet
                })

                it("Confirm last entry in the totalRewardPointsForCycle", async function () {
                    let rewardPointsArray = await vaultFacet.getRewardPointsArrayForVault(0)

                    const lastElement = rewardPointsArray[rewardPointsArray.length - 1]
                    expect(lastElement).to.equal(expectedTotalRewardPointsForCycle)
                    console.log("rewardPointsArray", rewardPointsArray)
                })

                it("Confirm totalRewardPointsForCycle length", async function () {
                    let rewardPointsCount = await vaultFacet.getTotalRewardPointsLength(0)
                    expect(rewardPointsCount).to.equal(1)
                })

                it("Confirm last entry in the getDepositedProfitArrayForVault", async function () {
                    let profitsArray = await vaultFacet.getDepositedProfitArrayForVault(0)

                    const lastElement = profitsArray[profitsArray.length - 1]
                    expect(lastElement).to.equal(900 * 10 ** 6)
                    console.log("profitsArray", profitsArray)
                })

                it("Confirm getDepositedProfitArrayLength length", async function () {
                    let profitArrayLength = await vaultFacet.getDepositedProfitArrayLength(0)
                    expect(profitArrayLength).to.equal(1)
                })
            })
        })

        describe("Reward DCA Vault with $1000 USDC", function () {
            let dcaVaultIndex = 0

            it("snapshot salt amount for the vault and each person before rewardin the vault", async function () {
                let dcaVaultInfo = await vaultFacet.getVaultInformation(dcaVaultIndex)
                totalSaltInDCAVaultbeforeRewarding = dcaVaultInfo[1]

                totalSaltDepositedForIndex1BeforeRewarding = await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 1)
                totalSaltDepositedForIndex2BeforeRewarding = await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 2)
                totalSaltDepositedForIndex3BeforeRewarding = await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 3)
                totalSaltDepositedForIndex4BeforeRewarding = await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 4)
                totalSaltDepositedForIndex5BeforeRewarding = await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 5)
                totalSaltDepositedForIndex6BeforeRewarding = await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 6)
                totalSaltDepositedForIndex51BeforeRewarding = await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 51)
                totalSaltDepositedForIndex52BeforeRewarding = await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 52)
                totalSaltDepositedForIndex53BeforeRewarding = await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 53)
                totalSaltDepositedForIndex54BeforeRewarding = await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 54)
                totalSaltDepositedForIndex55BeforeRewarding = await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 55)
                totalSaltDepositedForIndex56BeforeRewarding = await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 56)

                console.log("totalSaltDepositedForIndex1BeforeRewarding:", totalSaltDepositedForIndex1BeforeRewarding)
                console.log("totalSaltDepositedForIndex2BeforeRewarding:", totalSaltDepositedForIndex2BeforeRewarding)
                console.log("totalSaltDepositedForIndex3BeforeRewarding:", totalSaltDepositedForIndex3BeforeRewarding)
                console.log("totalSaltDepositedForIndex4BeforeRewarding:", totalSaltDepositedForIndex4BeforeRewarding)
                console.log("totalSaltDepositedForIndex5BeforeRewarding:", totalSaltDepositedForIndex5BeforeRewarding)
                console.log("totalSaltDepositedForIndex51BeforeRewarding:", totalSaltDepositedForIndex51BeforeRewarding)
                console.log("totalSaltDepositedForIndex52BeforeRewarding:", totalSaltDepositedForIndex52BeforeRewarding)
                console.log("totalSaltDepositedForIndex53BeforeRewarding:", totalSaltDepositedForIndex53BeforeRewarding)
                console.log("totalSaltDepositedForIndex54BeforeRewarding:", totalSaltDepositedForIndex54BeforeRewarding)
                console.log("totalSaltDepositedForIndex55BeforeRewarding:", totalSaltDepositedForIndex55BeforeRewarding)
                console.log("totalSaltDepositedForIndex56BeforeRewarding:", totalSaltDepositedForIndex56BeforeRewarding)
            })
            it("confirm it reverts if the wrong wallet deposits into the vault", async function () {
                await expect(vaultFacet.connect(quantApprovedControlWallet).depositProfitsAndcalculateVaultRewardPoints(dcaVaultIndex, 180 * 10 ** 6)).to.revertedWith(
                    "must be the approved vault wallet",
                )
            })

            let beforeDiamondBalance: number = 0
            let expectedTotalRewardPointsForCycle = 3427 * 300 * 4 + 3674 * 300 // index 3 salt deposit increased

            it("deposit $100 from the correct wallet and calculate points for DCA vault", async function () {
                console.log("expectedTotalRewardPointsForCycle", expectedTotalRewardPointsForCycle)

                expect(await mockedUSDC.balanceOf(dcaApprovedControlWallet)).to.equal(100 * 10 ** 6)

                beforeDiamondBalance = await mockedUSDC.balanceOf(diamondAddress)

                await mockedUSDC.connect(dcaApprovedControlWallet).approve(diamondAddress, 100 * 10 ** 6)

                await expect(vaultFacet.connect(dcaApprovedControlWallet).depositProfitsAndcalculateVaultRewardPoints(dcaVaultIndex, 100 * 10 ** 6))
                    .to.emit(vaultFacet, "VaultRewardPointsCalculated")
                    .withArgs(dcaVaultIndex, expectedTotalRewardPointsForCycle, 10 * 10 ** 6, 90 * 10 ** 6)

                expectedDiamondContractBalance += Number(100 * 10 ** 6)

                let afterDepsoitBalance = await mockedUSDC.balanceOf(diamondAddress)

                assert.equal(afterDepsoitBalance, BigInt(beforeDiamondBalance) + BigInt(100 * 10 ** 6))

                expect(await mockedUSDC.balanceOf(dcaApprovedControlWallet)).to.equal(0)
            })

            it("confirm coreTeam Balance increased after deposit", async function () {
                let coreTeamBalance = await infoGetterFacet.getCoreTeamBalance()

                expect(Number(coreTeamBalance)).to.equal(BigInt(totalMintingCost * 0.1) + BigInt(100 * 10 ** 6) + BigInt(10 * 10 ** 6))
            })

            it("Assert expectedDiamondContractBalance == 7170 * 10 ** 6 ", async function () {
                assert.equal(expectedDiamondContractBalance, 7170 * 10 ** 6) // 7250 - 180 + 100
            })

            it("Assert diamondContractBalance to equals expectedDiamondContractBalance", async function () {
                let diamondContractBalance = await mockedUSDC.balanceOf(diamondAddress)
                assert.equal(diamondContractBalance, expectedDiamondContractBalance)
            })

            it("confirm vault information is correct after depsoit", async function () {
                let vaultInfo = await vaultFacet.getVaultInformation(0)
                expect(vaultInfo[0]).to.equal("DCA Vault") // name
                expect(Number(vaultInfo[1])).to.equal(totalSaltInDCAVault + expectedSaltIncrease) // totalSalt
                expect(Number(vaultInfo[2])).to.equal(expectedTotalRewardPointsForCycle) // totalRewardPoints
                expect(Number(vaultInfo[3])).to.equal(0) // withdrawableAmount
                expect(Number(vaultInfo[4])).to.equal(90 * 10 ** 6) // dispersableProfitAmount
                expect(Number(vaultInfo[5])).to.equal(990 * 10 ** 6) // lifetimeRewardAmount
                expect(vaultInfo[6]).to.equal(dcaWallet.address) // walletAddress
                expect(vaultInfo[7]).to.equal(dcaApprovedControlWallet.address) // approvedControlWallet
            })

            it("confirm global reward total increased to $1000 after deposit", async function () {
                let globalRewardTotal = await infoGetterFacet.getGlobalRewardTotal()
                expect(globalRewardTotal).to.equal(990 * 10 ** 6)
            })

            it("confirm points are correct for each index", async function () {
                expect(await vaultFacet.getNftRewardPoints(dcaVaultIndex, 1)).to.equal(1028100)
                expect(await vaultFacet.getNftRewardPoints(dcaVaultIndex, 2)).to.equal(1028100)
                expect(await vaultFacet.getNftRewardPoints(dcaVaultIndex, 3)).to.equal(1102200)
                expect(await vaultFacet.getNftRewardPoints(dcaVaultIndex, 4)).to.equal(1028100)
                expect(await vaultFacet.getNftRewardPoints(dcaVaultIndex, 5)).to.equal(1028100)
                expect(await vaultFacet.getNftRewardPoints(dcaVaultIndex, 51)).to.equal(0)
            })

            it("confirm balances on contract match the expected total", async function () {
                let diamondContractBalance = await mockedUSDC.balanceOf(diamondAddress)
                let coreTeamBalance = await infoGetterFacet.getCoreTeamBalance()
                let vaultHoldingBalance = await infoGetterFacet.getVaultHoldingBalance()
                let totalRewardBalance = await infoGetterFacet.getTotalRewardBalance()
                let VaultCouncilBalance = await infoGetterFacet.getVaultCouncilBalance()
                let dcaVaultWithdrawableBalance = await vaultFacet.getVaultWithdrawableAmount(0)
                let quantVaultWithdrawableBalance = await vaultFacet.getVaultWithdrawableAmount(1)

                let dcaVaultInfo = await vaultFacet.getVaultInformation(0)
                let dispersableAmountForDCAVault = dcaVaultInfo[4]

                let quantVaultInfo = await vaultFacet.getVaultInformation(1)
                let dispersableAmountForQuantVault = quantVaultInfo[4]

                // console.log("CoreTeamBalance:", coreTeamBalance)
                // console.log("vaultHoldingBalance:", vaultHoldingBalance)
                // console.log("totalRewardBalance:", totalRewardBalance)
                // console.log("VaultCouncilBalance:", VaultCouncilBalance)
                // console.log("dcaVaultWithdrawableBalance:", dcaVaultWithdrawableBalance)
                // console.log("quantVaultWithdrawableBalance:", quantVaultWithdrawableBalance)
                // console.log("dispersableAmountForDCAVault:", Number(dispersableAmountForDCAVault) / 10 ** 6)
                // console.log("dispersableAmountForQuantVault:", Number(dispersableAmountForQuantVault) / 10 ** 6)
                // console.log("diamondContractBalance:", Number(diamondContractBalance) / 10 ** 6)

                expect(
                    Number(coreTeamBalance) +
                        Number(vaultHoldingBalance) +
                        Number(totalRewardBalance) +
                        Number(VaultCouncilBalance) +
                        Number(dcaVaultWithdrawableBalance) +
                        Number(quantVaultWithdrawableBalance) +
                        Number(dispersableAmountForDCAVault) +
                        Number(dispersableAmountForQuantVault),
                ).to.equal(Number(diamondContractBalance))
            })
        })

        describe("Disperse profits to NFTs", function () {
            let dcaVaultIndex = 0
            it("confirm only approved wallet can call the function", async function () {
                await expect(vaultFacet.connect(quantApprovedControlWallet).rewardVaultIndex(dcaVaultIndex, 1, 99999)).to.revertedWith("must be the approved vault wallet")
            })
            it("allow approved wallet to call the reward function", async function () {
                await expect(vaultFacet.connect(dcaApprovedControlWallet).rewardVaultIndex(dcaVaultIndex, 1, 99999))
                    .to.emit(vaultFacet, "ProfitsDispersedToHolders")
                    .withArgs(dcaVaultIndex, 1, 10)
            })

            it("confirm all the reward points are set back to zero for each NFT", async function () {
                expect(await vaultFacet.getNftRewardPoints(dcaVaultIndex, 1)).to.equal(0)
                expect(await vaultFacet.getNftRewardPoints(dcaVaultIndex, 2)).to.equal(0)
                expect(await vaultFacet.getNftRewardPoints(dcaVaultIndex, 3)).to.equal(0)
                expect(await vaultFacet.getNftRewardPoints(dcaVaultIndex, 4)).to.equal(0)
                expect(await vaultFacet.getNftRewardPoints(dcaVaultIndex, 5)).to.equal(0)
                expect(await vaultFacet.getNftRewardPoints(dcaVaultIndex, 51)).to.equal(0)
            })

            round2ExpectedRewardEachMonth = 17744218
            it("confirm the bankRewardsBalance each person", async function () {
                console.log("bankbalanceForSigner10:", await bankFacet.connect(signers[10]).getBankRewardsBalance())
                console.log("bankbalanceForSigner11:", await bankFacet.connect(signers[11]).getBankRewardsBalance())
                console.log("bankbalanceForSigner12:", await bankFacet.connect(signers[12]).getBankRewardsBalance())
                console.log("bankbalanceForSigner13:", await bankFacet.connect(signers[13]).getBankRewardsBalance())
                console.log("bankbalanceForSigner14:", await bankFacet.connect(signers[14]).getBankRewardsBalance())
                console.log("bankbalanceForSigner15:", await bankFacet.connect(signers[15]).getBankRewardsBalance())
                console.log("bankbalanceForSigner16:", await bankFacet.connect(signers[16]).getBankRewardsBalance())
                console.log("bankbalanceForSigner17:", await bankFacet.connect(signers[17]).getBankRewardsBalance())
                console.log("bankbalanceForSigner18:", await bankFacet.connect(signers[18]).getBankRewardsBalance())
                console.log("bankbalanceForSigner19:", await bankFacet.connect(signers[19]).getBankRewardsBalance())
                console.log("bankbalanceForSigner20:", await bankFacet.connect(signers[20]).getBankRewardsBalance())
                console.log("bankbalanceForCoreTeamWallet:", await bankFacet.connect(coreTeamWallet).getBankRewardsBalance())

                expect(await bankFacet.connect(signers[10]).getBankRewardsBalance()).to.equal(expectedRewardEachMonth + round2ExpectedRewardEachMonth)
                expect(await bankFacet.connect(signers[11]).getBankRewardsBalance()).to.equal(expectedRewardEachMonth + round2ExpectedRewardEachMonth)
                expect(await bankFacet.connect(signers[12]).getBankRewardsBalance()).to.equal(0)
                expect(await bankFacet.connect(signers[13]).getBankRewardsBalance()).to.equal(expectedRewardEachMonth + round2ExpectedRewardEachMonth)
                expect(await bankFacet.connect(signers[14]).getBankRewardsBalance()).to.equal(expectedRewardEachMonth + round2ExpectedRewardEachMonth)
                expect(await bankFacet.connect(signers[15]).getBankRewardsBalance()).to.equal(0)
                expect(await bankFacet.connect(signers[16]).getBankRewardsBalance()).to.equal(0)
                expect(await bankFacet.connect(signers[17]).getBankRewardsBalance()).to.equal(0)
                expect(await bankFacet.connect(signers[18]).getBankRewardsBalance()).to.equal(0)
                expect(await bankFacet.connect(signers[19]).getBankRewardsBalance()).to.equal(0)
                expect(await bankFacet.connect(signers[20]).getBankRewardsBalance()).to.equal(0)
                expect(await bankFacet.connect(coreTeamWallet).getBankRewardsBalance()).to.equal(0)
            })

            it("confirm the totalRewardBalance variable has increased correctly", async function () {
                const actualTotalRewardBalance = await infoGetterFacet.getTotalRewardBalance()
                const expectedTotal = expectedRewardEachMonth * 4 + round2ExpectedRewardEachMonth * 4
                const tolerance = 1 // Adjust this tolerance as needed

                expect(actualTotalRewardBalance).to.be.closeTo(expectedTotal, tolerance, "Total Reward Balance should be close to expected value")
            })

            it("confirm balances on contract match the expected total", async function () {
                let diamondContractBalance = await mockedUSDC.balanceOf(diamondAddress)
                let coreTeamBalance = await infoGetterFacet.getCoreTeamBalance()
                let vaultHoldingBalance = await infoGetterFacet.getVaultHoldingBalance()
                let totalRewardBalance = await infoGetterFacet.getTotalRewardBalance()
                let VaultCouncilBalance = await infoGetterFacet.getVaultCouncilBalance()
                let dcaVaultWithdrawableBalance = await vaultFacet.getVaultWithdrawableAmount(0)
                let quantVaultWithdrawableBalance = await vaultFacet.getVaultWithdrawableAmount(1)

                let dcaVaultInfo = await vaultFacet.getVaultInformation(0)
                let dispersableAmountForDCAVault = dcaVaultInfo[4]

                let quantVaultInfo = await vaultFacet.getVaultInformation(1)
                let dispersableAmountForQuantVault = quantVaultInfo[4]

                // console.log("CoreTeamBalance:", coreTeamBalance)
                // console.log("vaultHoldingBalance:", vaultHoldingBalance)
                // console.log("totalRewardBalance:", totalRewardBalance)
                // console.log("VaultCouncilBalance:", VaultCouncilBalance)
                // console.log("dcaVaultWithdrawableBalance:", dcaVaultWithdrawableBalance)
                // console.log("quantVaultWithdrawableBalance:", quantVaultWithdrawableBalance)
                // console.log("dispersableAmountForDCAVault:", Number(dispersableAmountForDCAVault) / 10 ** 6)
                // console.log("dispersableAmountForQuantVault:", Number(dispersableAmountForQuantVault) / 10 ** 6)
                // console.log("diamondContractBalance:", Number(diamondContractBalance) / 10 ** 6)

                const tolerance = 2 // Adjust this tolerance as needed

                let totalFromVariables =
                    Number(coreTeamBalance) +
                    Number(vaultHoldingBalance) +
                    Number(totalRewardBalance) +
                    Number(VaultCouncilBalance) +
                    Number(dcaVaultWithdrawableBalance) +
                    Number(quantVaultWithdrawableBalance) +
                    Number(dispersableAmountForDCAVault) +
                    Number(dispersableAmountForQuantVault)

                expect(totalFromVariables).to.be.closeTo(Number(diamondContractBalance), tolerance, "not close enough")
            })

            let index3SaltIncrease = 19023127
            let expectedSaltIncrease = Math.floor((index3SaltIncrease + index3SaltIncrease * 0.1) / (0.8 * 10 ** 6)) // 247 grains

            it("confirm salt in the vault increased based on compounding of p12", async function () {
                let dcaVaultInfo = await vaultFacet.getVaultInformation(dcaVaultIndex)
                let totalSaltInDCAVaultAfterRewarding = dcaVaultInfo[1]

                const tolerance = 2 // Adjust this tolerance as needed

                expect(BigInt(totalSaltInDCAVaultbeforeRewarding) + BigInt(expectedSaltIncrease)).to.be.closeTo(
                    totalSaltInDCAVaultAfterRewarding,
                    tolerance,
                    "The total salt increase should be close to expected value",
                )
            })

            it("confirm salt in vault increased only for index 3", async function () {
                const tolerance = 1 // Adjust this tolerance as needed
                expect(await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 1)).to.equal(totalSaltDepositedForIndex1BeforeRewarding)
                expect(await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 2)).to.equal(totalSaltDepositedForIndex2BeforeRewarding)
                expect(await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 3)).to.be.closeTo(
                    BigInt(totalSaltDepositedForIndex3BeforeRewarding) + BigInt(expectedSaltIncrease),
                    tolerance,
                    "not close enough",
                )
                expect(await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 4)).to.equal(totalSaltDepositedForIndex4BeforeRewarding)
                expect(await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 5)).to.equal(totalSaltDepositedForIndex5BeforeRewarding)
                expect(await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 6)).to.equal(totalSaltDepositedForIndex6BeforeRewarding)
                expect(await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 51)).to.equal(totalSaltDepositedForIndex51BeforeRewarding)
                expect(await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 52)).to.equal(totalSaltDepositedForIndex52BeforeRewarding)
                expect(await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 53)).to.equal(totalSaltDepositedForIndex53BeforeRewarding)
                expect(await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 54)).to.equal(totalSaltDepositedForIndex54BeforeRewarding)
                expect(await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 55)).to.equal(totalSaltDepositedForIndex55BeforeRewarding)
                expect(await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 56)).to.equal(totalSaltDepositedForIndex56BeforeRewarding)

                console.log("########### 1996               index 3 deposited salt amount: ", await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 3))
            })

            it("confirm continous compounding count only increased for index 3", async function () {
                expect(await vaultFacet.getContinuousMonthsCompounding(dcaVaultIndex, 10)).to.equal(0)
                expect(await vaultFacet.getContinuousMonthsCompounding(dcaVaultIndex, 2)).to.equal(0)
                expect(await vaultFacet.getContinuousMonthsCompounding(dcaVaultIndex, 3)).to.equal(2)
                expect(await vaultFacet.getContinuousMonthsCompounding(dcaVaultIndex, 4)).to.equal(0)
                expect(await vaultFacet.getContinuousMonthsCompounding(dcaVaultIndex, 5)).to.equal(0)
                expect(await vaultFacet.getContinuousMonthsCompounding(dcaVaultIndex, 6)).to.equal(0)
                expect(await vaultFacet.getContinuousMonthsCompounding(dcaVaultIndex, 51)).to.equal(0)
                expect(await vaultFacet.getContinuousMonthsCompounding(dcaVaultIndex, 52)).to.equal(0)
                expect(await vaultFacet.getContinuousMonthsCompounding(dcaVaultIndex, 53)).to.equal(0)
                expect(await vaultFacet.getContinuousMonthsCompounding(dcaVaultIndex, 54)).to.equal(0)
                expect(await vaultFacet.getContinuousMonthsCompounding(dcaVaultIndex, 55)).to.equal(0)
                expect(await vaultFacet.getContinuousMonthsCompounding(dcaVaultIndex, 56)).to.equal(0)
            })

            it("confirm no one has a bonus for deposits yet", async function () {
                expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVaultIndex, 1)).to.equal(false)
                expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVaultIndex, 2)).to.equal(false)
                expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVaultIndex, 3)).to.equal(false)
                expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVaultIndex, 4)).to.equal(false)
                expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVaultIndex, 5)).to.equal(false)
                expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVaultIndex, 6)).to.equal(false)
                expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVaultIndex, 51)).to.equal(false)
                expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVaultIndex, 52)).to.equal(false)
                expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVaultIndex, 53)).to.equal(false)
                expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVaultIndex, 54)).to.equal(false)
                expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVaultIndex, 55)).to.equal(false)
                expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVaultIndex, 56)).to.equal(false)
            })

            it("Assert expectedDiamondContractBalance == 7170 * 10 ** 6 ", async function () {
                assert.equal(expectedDiamondContractBalance, 7170 * 10 ** 6) // 7250 - 180 + 100
            })

            it("Assert diamondContractBalance to equals expectedDiamondContractBalance", async function () {
                let diamondContractBalance = await mockedUSDC.balanceOf(diamondAddress)
                assert.equal(diamondContractBalance, expectedDiamondContractBalance)
            })
        })
    })

    describe("Reward Cycle Month 3", function () {
        describe("Withdraw USDC from the DCA Vault", function () {
            it("revert when wrong wallet tries to withdraw the DCA vault", async function () {
                let dcaVaultIndex = 0
                await expect(vaultFacet.connect(signers[10]).withdrawVaultFunds(dcaVaultIndex)).to.revertedWith("must be the approved Control Wallet for this vault")
            })

            it("allow correct wallet to withdraw the DCA vault", async function () {
                let dcaVaultIndex = 0

                compoundedAmountForIndex3 = 19023127

                let expectedWithawAmount = compoundedAmountForIndex3 // amount that was compounded from index 3 during reward cycle 2
                await expect(vaultFacet.connect(dcaApprovedControlWallet).withdrawVaultFunds(dcaVaultIndex))
                    .to.emit(vaultFacet, "FundsWithdrawn")
                    .withArgs(0, dcaApprovedControlWallet, expectedWithawAmount)

                expectedDiamondContractBalance -= Number(expectedWithawAmount)
            })

            it("Assert expectedDiamondContractBalance ==  7170 * 10 ** 6  - 19023127 ", async function () {
                assert.equal(expectedDiamondContractBalance, 7170 * 10 ** 6 - compoundedAmountForIndex3)
            })

            it("Assert diamondContractBalance to equals expectedDiamondContractBalance", async function () {
                let diamondContractBalance = await mockedUSDC.balanceOf(diamondAddress)
                assert.equal(diamondContractBalance, expectedDiamondContractBalance)
            })

            it("confirm balances after withdrawing DCA Vault", async function () {
                // console.log("mockedUSDC balance of saltVaultBulls:", await mockedUSDC.balanceOf(saltVaultBulls.target))
                // console.log("mockedUSDC balance of dimaond:", await mockedUSDC.balanceOf(diamondAddress))
                // console.log("mockedUSDC balance of ERC721Facet:", await mockedUSDC.balanceOf(erc721Facet.target))
                // console.log("mockedUSDC balance of DCA Vault:", await vaultFacet.getVaultWithdrawableAmount(0))
                // console.log("mockedUSDC balance of Quant Vault:", await vaultFacet.getVaultWithdrawableAmount(1))

                CoreTeamBalance = await infoGetterFacet.getCoreTeamBalance()
                VaultHoldingBalance = await infoGetterFacet.getVaultHoldingBalance()
                TotalRewardBalance = await infoGetterFacet.getTotalRewardBalance()
                VaultCouncilBalance = await infoGetterFacet.getVaultCouncilBalance()
                GemTokenChallangeBalance = await infoGetterFacet.getGemTokenChallengeBalance()
                GemTokenSalesBalance = await infoGetterFacet.getGemTokenSalesBalance()

                DcaVaultBalance = await vaultFacet.getVaultWithdrawableAmount(0)
                QuantVaultBalance = await vaultFacet.getVaultWithdrawableAmount(1)

                DcaApprovedControlWalletBalance = await mockedUSDC.balanceOf(dcaApprovedControlWallet.address)
                QuantApprovedControlWalletBalance = await mockedUSDC.balanceOf(quantApprovedControlWallet.address)

                DiamondContractBalance = await mockedUSDC.balanceOf(diamondAddress)
                SaltVaultTokenContractBalance = await mockedUSDC.balanceOf(saltVaultBulls.target)
                CoreTeamWalletBalance = await mockedUSDC.balanceOf(coreTeamWallet.address)
                RoyaltiesWalletBalance = await mockedUSDC.balanceOf(royaltiesWallet.address)
                ProcurementWalletBalance = await mockedUSDC.balanceOf(procurementWallet.address)
                GemTokenBurnWalletBalance = await mockedUSDC.balanceOf(gemTokenBurnWallet.address)

                bankRewardsBalance_P10 = await bankFacet.connect(signers[10]).getBankRewardsBalance()
                bankRewardsBalance_P11 = await bankFacet.connect(signers[11]).getBankRewardsBalance()
                bankRewardsBalance_P12 = await bankFacet.connect(signers[12]).getBankRewardsBalance()
                bankRewardsBalance_P13 = await bankFacet.connect(signers[13]).getBankRewardsBalance()
                bankRewardsBalance_P14 = await bankFacet.connect(signers[14]).getBankRewardsBalance()
                bankRewardsBalance_P15 = await bankFacet.connect(signers[15]).getBankRewardsBalance()
                bankRewardsBalance_P16 = await bankFacet.connect(signers[16]).getBankRewardsBalance()
                bankRewardsBalance_P17 = await bankFacet.connect(signers[17]).getBankRewardsBalance()
                bankRewardsBalance_P18 = await bankFacet.connect(signers[18]).getBankRewardsBalance()
                bankRewardsBalance_P19 = await bankFacet.connect(signers[19]).getBankRewardsBalance()
                bankRewardsBalance_P20 = await bankFacet.connect(signers[20]).getBankRewardsBalance()
                bankRewardsBalance_coreTeam = await bankFacet.connect(coreTeamWallet).getBankRewardsBalance()

                let tolerance = 1
                expect(Number(CoreTeamBalance)).to.closeTo(BigInt(totalMintingCost * 0.1) + BigInt(100 * 10 ** 6) + BigInt(10 * 10 ** 6), tolerance, "not within 1")
                assert.equal(VaultHoldingBalance, 0) // went to zero when salt was deposited by each person into the DCA and Quant Vault
                assert.closeTo(TotalRewardBalance, 180 * 10 ** 6 * 4 + 17744218 * 4, tolerance, "not within 1")
                assert.equal(VaultCouncilBalance, 0)
                assert.equal(GemTokenChallangeBalance, 0)
                assert.equal(GemTokenSalesBalance, 0)

                assert.equal(DcaVaultBalance, 0) //
                assert.equal(QuantVaultBalance, totalWithdrawableAmountForQuantVault)

                assert.equal(DcaApprovedControlWalletBalance, compoundedAmountForIndex3)
                assert.equal(QuantApprovedControlWalletBalance, 0)
                assert.equal(SaltVaultTokenContractBalance, 0)
                assert.equal(CoreTeamWalletBalance, 0)
                assert.equal(RoyaltiesWalletBalance, 0)
                assert.equal(ProcurementWalletBalance, 0)
                assert.equal(GemTokenBurnWalletBalance, 0)

                assert.equal(bankRewardsBalance_P10, expectedRewardEachMonth + round2ExpectedRewardEachMonth)
                assert.equal(bankRewardsBalance_P11, expectedRewardEachMonth + round2ExpectedRewardEachMonth)
                assert.equal(bankRewardsBalance_P12, 0)
                assert.equal(bankRewardsBalance_P13, expectedRewardEachMonth + round2ExpectedRewardEachMonth)
                assert.equal(bankRewardsBalance_P14, expectedRewardEachMonth + round2ExpectedRewardEachMonth)
                assert.equal(bankRewardsBalance_P15, 0)
                assert.equal(bankRewardsBalance_P16, 0)
                assert.equal(bankRewardsBalance_P17, 0)
                assert.equal(bankRewardsBalance_P18, 0)
                assert.equal(bankRewardsBalance_P19, 0)
                assert.equal(bankRewardsBalance_P20, 0)
                assert.equal(bankRewardsBalance_coreTeam, 0)
            })

            it("confirm balances on contract match the expected total", async function () {
                let diamondContractBalance = await mockedUSDC.balanceOf(diamondAddress)
                let coreTeamBalance = await infoGetterFacet.getCoreTeamBalance()
                let vaultHoldingBalance = await infoGetterFacet.getVaultHoldingBalance()
                let totalRewardBalance = await infoGetterFacet.getTotalRewardBalance()
                let VaultCouncilBalance = await infoGetterFacet.getVaultCouncilBalance()
                let dcaVaultWithdrawableBalance = await vaultFacet.getVaultWithdrawableAmount(0)
                let quantVaultWithdrawableBalance = await vaultFacet.getVaultWithdrawableAmount(1)

                let dcaVaultInfo = await vaultFacet.getVaultInformation(0)
                let dispersableAmountForDCAVault = dcaVaultInfo[4]

                let quantVaultInfo = await vaultFacet.getVaultInformation(1)
                let dispersableAmountForQuantVault = quantVaultInfo[4]

                // console.log("CoreTeamBalance:", coreTeamBalance)
                // console.log("vaultHoldingBalance:", vaultHoldingBalance)
                // console.log("totalRewardBalance:", totalRewardBalance)
                // console.log("VaultCouncilBalance:", VaultCouncilBalance)
                // console.log("dcaVaultWithdrawableBalance:", dcaVaultWithdrawableBalance)
                // console.log("quantVaultWithdrawableBalance:", quantVaultWithdrawableBalance)
                // console.log("dispersableAmountForDCAVault:", Number(dispersableAmountForDCAVault) / 10 ** 6)
                // console.log("dispersableAmountForQuantVault:", Number(dispersableAmountForQuantVault) / 10 ** 6)
                // console.log("diamondContractBalance:", Number(diamondContractBalance) / 10 ** 6)

                expect(
                    Number(coreTeamBalance) +
                        Number(vaultHoldingBalance) +
                        Number(totalRewardBalance) +
                        Number(VaultCouncilBalance) +
                        Number(dcaVaultWithdrawableBalance) +
                        Number(quantVaultWithdrawableBalance) +
                        Number(dispersableAmountForDCAVault) +
                        Number(dispersableAmountForQuantVault),
                ).to.closeTo(Number(diamondContractBalance), 1, "not within 1")
            })

            describe("Mocked sending funds to binance account and getting $100 back", function () {
                it("send all funds from wallet to mockedBinance account and get 1K back", async function () {
                    let balanceToSend = await mockedUSDC.balanceOf(dcaApprovedControlWallet)

                    // console.log("balanceToSend:", balanceToSend)
                    expect(balanceToSend).to.equal(19023127)

                    await mockedUSDC.connect(dcaApprovedControlWallet).transfer(mockedBinanceAccount, balanceToSend)

                    expect(await mockedUSDC.balanceOf(dcaApprovedControlWallet)).to.equal(0)

                    await mockedUSDC.connect(mockedBinanceAccount).transfer(dcaApprovedControlWallet, 100 * 10 ** 6)

                    expect(await mockedUSDC.balanceOf(dcaApprovedControlWallet)).to.equal(100 * 10 ** 6)
                })
            })

            describe("Confirm compounding rates are still intact", function () {
                it("confirm compounding rates are correct now after index 3 is set to 100", async function () {
                    let dcaVaultIndex = 0
                    expect(await vaultFacet.getNftVaultCompoundingRate(dcaVaultIndex, 1)).to.equal(0)
                    expect(await vaultFacet.getNftVaultCompoundingRate(dcaVaultIndex, 2)).to.equal(0)
                    expect(await vaultFacet.getNftVaultCompoundingRate(dcaVaultIndex, 3)).to.equal(100)
                    expect(await vaultFacet.getNftVaultCompoundingRate(dcaVaultIndex, 4)).to.equal(0)
                    expect(await vaultFacet.getNftVaultCompoundingRate(dcaVaultIndex, 5)).to.equal(0)
                })
            })

            describe(" Confirm Vault information is correct before rewarding", function () {
                let dcaVault = 0

                it("confirm compounding rates are correct now after index 3 is set to 100", async function () {
                    expect(await vaultFacet.getNftVaultCompoundingRate(dcaVault, 1)).to.equal(0)
                    expect(await vaultFacet.getNftVaultCompoundingRate(dcaVault, 2)).to.equal(0)
                    expect(await vaultFacet.getNftVaultCompoundingRate(dcaVault, 3)).to.equal(100)
                    expect(await vaultFacet.getNftVaultCompoundingRate(dcaVault, 4)).to.equal(0)
                    expect(await vaultFacet.getNftVaultCompoundingRate(dcaVault, 5)).to.equal(0)
                    expect(await vaultFacet.getNftVaultCompoundingRate(dcaVault, 6)).to.equal(0)
                    expect(await vaultFacet.getNftVaultCompoundingRate(dcaVault, 51)).to.equal(0)
                    expect(await vaultFacet.getNftVaultCompoundingRate(dcaVault, 52)).to.equal(0)
                    expect(await vaultFacet.getNftVaultCompoundingRate(dcaVault, 53)).to.equal(0)
                    expect(await vaultFacet.getNftVaultCompoundingRate(dcaVault, 54)).to.equal(0)
                    expect(await vaultFacet.getNftVaultCompoundingRate(dcaVault, 55)).to.equal(0)
                    expect(await vaultFacet.getNftVaultCompoundingRate(dcaVault, 56)).to.equal(0)
                })
                it("confirm salt deposit amounts", async function () {
                    expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 1)).to.equal(expectedSaltForEachDiamondBull)
                    expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 2)).to.equal(expectedSaltForEachDiamondBull)

                    expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 3)).to.equal(3699)

                    expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 4)).to.equal(expectedSaltForEachDiamondBull)
                    expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 5)).to.equal(expectedSaltForEachDiamondBull)
                    expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 6)).to.equal(0)
                    expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 51)).to.equal(0)
                    expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 52)).to.equal(0)
                    expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 53)).to.equal(0)
                    expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 54)).to.equal(0)
                    expect(await vaultFacet.getDepositedSaltAmount(dcaVault, 55)).to.equal(0)
                })

                it("confirm salt deposit amounts", async function () {
                    expect(await vaultFacet.getNftRewardPoints(dcaVault, 1)).to.equal(0)
                    expect(await vaultFacet.getNftRewardPoints(dcaVault, 2)).to.equal(0)
                    expect(await vaultFacet.getNftRewardPoints(dcaVault, 3)).to.equal(0)
                    expect(await vaultFacet.getNftRewardPoints(dcaVault, 4)).to.equal(0)
                    expect(await vaultFacet.getNftRewardPoints(dcaVault, 5)).to.equal(0)
                    expect(await vaultFacet.getNftRewardPoints(dcaVault, 6)).to.equal(0)
                    expect(await vaultFacet.getNftRewardPoints(dcaVault, 51)).to.equal(0)
                    expect(await vaultFacet.getNftRewardPoints(dcaVault, 52)).to.equal(0)
                    expect(await vaultFacet.getNftRewardPoints(dcaVault, 53)).to.equal(0)
                    expect(await vaultFacet.getNftRewardPoints(dcaVault, 54)).to.equal(0)
                    expect(await vaultFacet.getNftRewardPoints(dcaVault, 55)).to.equal(0)
                })

                it("confirm getContinuousMonthsCompounding", async function () {
                    expect(await vaultFacet.getContinuousMonthsCompounding(dcaVault, 1)).to.equal(0)
                    expect(await vaultFacet.getContinuousMonthsCompounding(dcaVault, 2)).to.equal(0)
                    expect(await vaultFacet.getContinuousMonthsCompounding(dcaVault, 3)).to.equal(2)
                    expect(await vaultFacet.getContinuousMonthsCompounding(dcaVault, 4)).to.equal(0)
                    expect(await vaultFacet.getContinuousMonthsCompounding(dcaVault, 5)).to.equal(0)
                    expect(await vaultFacet.getContinuousMonthsCompounding(dcaVault, 6)).to.equal(0)
                    expect(await vaultFacet.getContinuousMonthsCompounding(dcaVault, 51)).to.equal(0)
                    expect(await vaultFacet.getContinuousMonthsCompounding(dcaVault, 52)).to.equal(0)
                    expect(await vaultFacet.getContinuousMonthsCompounding(dcaVault, 53)).to.equal(0)
                    expect(await vaultFacet.getContinuousMonthsCompounding(dcaVault, 54)).to.equal(0)
                    expect(await vaultFacet.getContinuousMonthsCompounding(dcaVault, 55)).to.equal(0)
                })

                it("confirm getBonusEligibilityForVaultDeposit", async function () {
                    expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVault, 1)).to.equal(false)
                    expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVault, 2)).to.equal(false)
                    expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVault, 3)).to.equal(false)
                    expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVault, 4)).to.equal(false)
                    expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVault, 5)).to.equal(false)
                    expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVault, 6)).to.equal(false)
                    expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVault, 51)).to.equal(false)
                    expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVault, 52)).to.equal(false)
                    expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVault, 53)).to.equal(false)
                    expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVault, 54)).to.equal(false)
                    expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVault, 55)).to.equal(false)
                })

                it("Confirm DCA Vault Information", async function () {
                    let vaultInfo = await vaultFacet.getVaultInformation(0)
                    expect(vaultInfo[0]).to.equal("DCA Vault") // name
                    expect(Number(vaultInfo[1])).to.equal(totalSaltInDCAVault + 3699) // totalSalt
                    expect(Number(vaultInfo[2])).to.equal(0) // totalRewardPoints         // this doesn't reset until we deposit profits into the vault for the next cycle
                    expect(Number(vaultInfo[3])).to.equal(0) // withdrawableAmount
                    expect(Number(vaultInfo[4])).to.equal(0) // dispersableProfitAmount
                    expect(Number(vaultInfo[5])).to.equal(900 * 10 ** 6 + 90 * 10 ** 6 * 2) // lifetimeRewardAmount
                    expect(vaultInfo[6]).to.equal(dcaWallet.address) // walletAddress
                    expect(vaultInfo[7]).to.equal(dcaApprovedControlWallet.address) // approvedControlWallet
                })

                it("Confirm last entry in the totalRewardPointsForCycle", async function () {
                    let rewardPointsArray = await vaultFacet.getRewardPointsArrayForVault(0)

                    const lastElement = rewardPointsArray[rewardPointsArray.length - 1]
                    expect(lastElement).to.equal(expectedTotalRewardPointsForCycle)
                    console.log("rewardPointsArray", rewardPointsArray)
                })

                it("Confirm totalRewardPointsForCycle length", async function () {
                    let rewardPointsCount = await vaultFacet.getTotalRewardPointsLength(0)
                    expect(rewardPointsCount).to.equal(1)
                })

                it("Confirm last entry in the getDepositedProfitArrayForVault", async function () {
                    let profitsArray = await vaultFacet.getDepositedProfitArrayForVault(0)

                    const lastElement = profitsArray[profitsArray.length - 1]
                    expect(lastElement).to.equal(90 * 10 ** 6)
                    console.log("profitsArray", profitsArray)
                })

                it("Confirm getDepositedProfitArrayLength length", async function () {
                    let profitArrayLength = await vaultFacet.getDepositedProfitArrayLength(0)
                    expect(profitArrayLength).to.equal(3)
                })
            })

            //     let totalSaltInDCAVaultbeforeRewarding: number = 0
            //     let totalSaltDepositedForIndex1BeforeRewarding: number = 0
            //     let totalSaltDepositedForIndex2BeforeRewarding: number = 0
            //     let totalSaltDepositedForIndex3BeforeRewarding: number = 0
            //     let totalSaltDepositedForIndex4BeforeRewarding: number = 0
            //     let totalSaltDepositedForIndex5BeforeRewarding: number = 0
            //     let totalSaltDepositedForIndex6BeforeRewarding: number = 0
            //     let totalSaltDepositedForIndex51BeforeRewarding: number = 0
            //     let totalSaltDepositedForIndex52BeforeRewarding: number = 0
            //     let totalSaltDepositedForIndex53BeforeRewarding: number = 0
            //     let totalSaltDepositedForIndex54BeforeRewarding: number = 0
            //     let totalSaltDepositedForIndex55BeforeRewarding: number = 0
            //     let totalSaltDepositedForIndex56BeforeRewarding: number = 0

            //     describe("Reward DCA Vault with $1000 USDC", function () {
            //         let dcaVaultIndex = 0

            //         it("snapshot salt amount for the vault and each person before rewardin the vault", async function () {
            //             let dcaVaultInfo = await vaultFacet.getVaultInformation(dcaVaultIndex)
            //             totalSaltInDCAVaultbeforeRewarding = dcaVaultInfo[1]

            //             totalSaltDepositedForIndex1BeforeRewarding = await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 1)
            //             totalSaltDepositedForIndex2BeforeRewarding = await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 2)
            //             totalSaltDepositedForIndex3BeforeRewarding = await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 3)
            //             totalSaltDepositedForIndex4BeforeRewarding = await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 4)
            //             totalSaltDepositedForIndex5BeforeRewarding = await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 5)
            //             totalSaltDepositedForIndex6BeforeRewarding = await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 6)
            //             totalSaltDepositedForIndex51BeforeRewarding = await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 51)
            //             totalSaltDepositedForIndex52BeforeRewarding = await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 52)
            //             totalSaltDepositedForIndex53BeforeRewarding = await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 53)
            //             totalSaltDepositedForIndex54BeforeRewarding = await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 54)
            //             totalSaltDepositedForIndex55BeforeRewarding = await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 55)
            //             totalSaltDepositedForIndex56BeforeRewarding = await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 56)

            //             console.log("totalSaltDepositedForIndex1BeforeRewarding:", totalSaltDepositedForIndex1BeforeRewarding)
            //             console.log("totalSaltDepositedForIndex2BeforeRewarding:", totalSaltDepositedForIndex2BeforeRewarding)
            //             console.log("totalSaltDepositedForIndex3BeforeRewarding:", totalSaltDepositedForIndex3BeforeRewarding)
            //             console.log("totalSaltDepositedForIndex4BeforeRewarding:", totalSaltDepositedForIndex4BeforeRewarding)
            //             console.log("totalSaltDepositedForIndex5BeforeRewarding:", totalSaltDepositedForIndex5BeforeRewarding)
            //             console.log("totalSaltDepositedForIndex51BeforeRewarding:", totalSaltDepositedForIndex51BeforeRewarding)
            //             console.log("totalSaltDepositedForIndex52BeforeRewarding:", totalSaltDepositedForIndex52BeforeRewarding)
            //             console.log("totalSaltDepositedForIndex53BeforeRewarding:", totalSaltDepositedForIndex53BeforeRewarding)
            //             console.log("totalSaltDepositedForIndex54BeforeRewarding:", totalSaltDepositedForIndex54BeforeRewarding)
            //             console.log("totalSaltDepositedForIndex55BeforeRewarding:", totalSaltDepositedForIndex55BeforeRewarding)
            //             console.log("totalSaltDepositedForIndex56BeforeRewarding:", totalSaltDepositedForIndex56BeforeRewarding)
            //         })
            //         it("confirm it reverts if the wrong wallet deposits into the vault", async function () {
            //             await expect(vaultFacet.connect(quantApprovedControlWallet).depositProfitsAndcalculateVaultRewardPoints(dcaVaultIndex, 180 * 10 ** 6)).to.revertedWith(
            //                 "must be the approved vault wallet",
            //             )
            //         })

            //         let beforeDiamondBalance: number = 0
            //         let expectedTotalRewardPointsForCycle = 3427 * 300 * 4 + 3674 * 300 // index 3 salt deposit increased

            //         it("deposit $100 from the correct wallet and calculate points for DCA vault", async function () {
            //             console.log("expectedTotalRewardPointsForCycle", expectedTotalRewardPointsForCycle)

            //             expect(await mockedUSDC.balanceOf(dcaApprovedControlWallet)).to.equal(100 * 10 ** 6)

            //             beforeDiamondBalance = await mockedUSDC.balanceOf(diamondAddress)

            //             await mockedUSDC.connect(dcaApprovedControlWallet).approve(diamondAddress, 100 * 10 ** 6)

            //             await expect(vaultFacet.connect(dcaApprovedControlWallet).depositProfitsAndcalculateVaultRewardPoints(dcaVaultIndex, 100 * 10 ** 6))
            //                 .to.emit(vaultFacet, "VaultRewardPointsCalculated")
            //                 .withArgs(dcaVaultIndex, expectedTotalRewardPointsForCycle, 10 * 10 ** 6, 90 * 10 ** 6)

            //             expectedDiamondContractBalance += Number(100 * 10 ** 6)

            //             let afterDepsoitBalance = await mockedUSDC.balanceOf(diamondAddress)

            //             assert.equal(afterDepsoitBalance, BigInt(beforeDiamondBalance) + BigInt(100 * 10 ** 6))

            //             expect(await mockedUSDC.balanceOf(dcaApprovedControlWallet)).to.equal(0)
            //         })

            //         it("confirm coreTeam Balance increased after deposit", async function () {
            //             let coreTeamBalance = await infoGetterFacet.getCoreTeamBalance()

            //             expect(Number(coreTeamBalance)).to.equal(BigInt(totalMintingCost * 0.1) + BigInt(100 * 10 ** 6) + BigInt(10 * 10 ** 6))
            //         })

            //         it("Assert expectedDiamondContractBalance == 7170 * 10 ** 6 ", async function () {
            //             assert.equal(expectedDiamondContractBalance, 7170 * 10 ** 6) // 7250 - 180 + 100
            //         })

            //         it("Assert diamondContractBalance to equals expectedDiamondContractBalance", async function () {
            //             let diamondContractBalance = await mockedUSDC.balanceOf(diamondAddress)
            //             assert.equal(diamondContractBalance, expectedDiamondContractBalance)
            //         })

            //         it("confirm vault information is correct after depsoit", async function () {
            //             let vaultInfo = await vaultFacet.getVaultInformation(0)
            //             expect(vaultInfo[0]).to.equal("DCA Vault") // name
            //             expect(Number(vaultInfo[1])).to.equal(totalSaltInDCAVault + expectedSaltIncrease) // totalSalt
            //             expect(Number(vaultInfo[2])).to.equal(expectedTotalRewardPointsForCycle) // totalRewardPoints
            //             expect(Number(vaultInfo[3])).to.equal(0) // withdrawableAmount
            //             expect(Number(vaultInfo[4])).to.equal(90 * 10 ** 6) // dispersableProfitAmount
            //             expect(Number(vaultInfo[5])).to.equal(990 * 10 ** 6) // lifetimeRewardAmount
            //             expect(vaultInfo[6]).to.equal(dcaWallet.address) // walletAddress
            //             expect(vaultInfo[7]).to.equal(dcaApprovedControlWallet.address) // approvedControlWallet
            //         })

            //         it("confirm global reward total increased to $1000 after deposit", async function () {
            //             let globalRewardTotal = await infoGetterFacet.getGlobalRewardTotal()
            //             expect(globalRewardTotal).to.equal(990 * 10 ** 6)
            //         })

            //         it("confirm points are correct for each index", async function () {
            //             expect(await vaultFacet.getNftRewardPoints(dcaVaultIndex, 1)).to.equal(1028100)
            //             expect(await vaultFacet.getNftRewardPoints(dcaVaultIndex, 2)).to.equal(1028100)
            //             expect(await vaultFacet.getNftRewardPoints(dcaVaultIndex, 3)).to.equal(1102200)
            //             expect(await vaultFacet.getNftRewardPoints(dcaVaultIndex, 4)).to.equal(1028100)
            //             expect(await vaultFacet.getNftRewardPoints(dcaVaultIndex, 5)).to.equal(1028100)
            //             expect(await vaultFacet.getNftRewardPoints(dcaVaultIndex, 51)).to.equal(0)
            //         })

            //         it("confirm balances on contract match the expected total", async function () {
            //             let diamondContractBalance = await mockedUSDC.balanceOf(diamondAddress)
            //             let coreTeamBalance = await infoGetterFacet.getCoreTeamBalance()
            //             let vaultHoldingBalance = await infoGetterFacet.getVaultHoldingBalance()
            //             let totalRewardBalance = await infoGetterFacet.getTotalRewardBalance()
            //             let VaultCouncilBalance = await infoGetterFacet.getVaultCouncilBalance()
            //             let dcaVaultWithdrawableBalance = await vaultFacet.getVaultWithdrawableAmount(0)
            //             let quantVaultWithdrawableBalance = await vaultFacet.getVaultWithdrawableAmount(1)

            //             let dcaVaultInfo = await vaultFacet.getVaultInformation(0)
            //             let dispersableAmountForDCAVault = dcaVaultInfo[4]

            //             let quantVaultInfo = await vaultFacet.getVaultInformation(1)
            //             let dispersableAmountForQuantVault = quantVaultInfo[4]

            //             // console.log("CoreTeamBalance:", coreTeamBalance)
            //             // console.log("vaultHoldingBalance:", vaultHoldingBalance)
            //             // console.log("totalRewardBalance:", totalRewardBalance)
            //             // console.log("VaultCouncilBalance:", VaultCouncilBalance)
            //             // console.log("dcaVaultWithdrawableBalance:", dcaVaultWithdrawableBalance)
            //             // console.log("quantVaultWithdrawableBalance:", quantVaultWithdrawableBalance)
            //             // console.log("dispersableAmountForDCAVault:", Number(dispersableAmountForDCAVault) / 10 ** 6)
            //             // console.log("dispersableAmountForQuantVault:", Number(dispersableAmountForQuantVault) / 10 ** 6)
            //             // console.log("diamondContractBalance:", Number(diamondContractBalance) / 10 ** 6)

            //             expect(
            //                 Number(coreTeamBalance) +
            //                     Number(vaultHoldingBalance) +
            //                     Number(totalRewardBalance) +
            //                     Number(VaultCouncilBalance) +
            //                     Number(dcaVaultWithdrawableBalance) +
            //                     Number(quantVaultWithdrawableBalance) +
            //                     Number(dispersableAmountForDCAVault) +
            //                     Number(dispersableAmountForQuantVault),
            //             ).to.equal(Number(diamondContractBalance))
            //         })
            //     })

            //     describe("Disperse profits to NFTs", function () {
            //         let dcaVaultIndex = 0
            //         it("confirm only approved wallet can call the function", async function () {
            //             await expect(vaultFacet.connect(quantApprovedControlWallet).rewardVaultIndex(dcaVaultIndex, 1, 99999)).to.revertedWith("must be the approved vault wallet")
            //         })
            //         it("allow approved wallet to call the reward function", async function () {
            //             await expect(vaultFacet.connect(dcaApprovedControlWallet).rewardVaultIndex(dcaVaultIndex, 1, 99999))
            //                 .to.emit(vaultFacet, "ProfitsDispersedToHolders")
            //                 .withArgs(dcaVaultIndex, 1, 10)
            //         })

            //         it("confirm all the reward points are set back to zero for each NFT", async function () {
            //             expect(await vaultFacet.getNftRewardPoints(dcaVaultIndex, 1)).to.equal(0)
            //             expect(await vaultFacet.getNftRewardPoints(dcaVaultIndex, 2)).to.equal(0)
            //             expect(await vaultFacet.getNftRewardPoints(dcaVaultIndex, 3)).to.equal(0)
            //             expect(await vaultFacet.getNftRewardPoints(dcaVaultIndex, 4)).to.equal(0)
            //             expect(await vaultFacet.getNftRewardPoints(dcaVaultIndex, 5)).to.equal(0)
            //             expect(await vaultFacet.getNftRewardPoints(dcaVaultIndex, 51)).to.equal(0)
            //         })

            //         round2ExpectedRewardEachMonth = 17744218
            //         it("confirm the bankRewardsBalance each person", async function () {
            //             console.log("bankbalanceForSigner10:", await bankFacet.connect(signers[10]).getBankRewardsBalance())
            //             console.log("bankbalanceForSigner11:", await bankFacet.connect(signers[11]).getBankRewardsBalance())
            //             console.log("bankbalanceForSigner12:", await bankFacet.connect(signers[12]).getBankRewardsBalance())
            //             console.log("bankbalanceForSigner13:", await bankFacet.connect(signers[13]).getBankRewardsBalance())
            //             console.log("bankbalanceForSigner14:", await bankFacet.connect(signers[14]).getBankRewardsBalance())
            //             console.log("bankbalanceForSigner15:", await bankFacet.connect(signers[15]).getBankRewardsBalance())
            //             console.log("bankbalanceForSigner16:", await bankFacet.connect(signers[16]).getBankRewardsBalance())
            //             console.log("bankbalanceForSigner17:", await bankFacet.connect(signers[17]).getBankRewardsBalance())
            //             console.log("bankbalanceForSigner18:", await bankFacet.connect(signers[18]).getBankRewardsBalance())
            //             console.log("bankbalanceForSigner19:", await bankFacet.connect(signers[19]).getBankRewardsBalance())
            //             console.log("bankbalanceForSigner20:", await bankFacet.connect(signers[20]).getBankRewardsBalance())
            //             console.log("bankbalanceForCoreTeamWallet:", await bankFacet.connect(coreTeamWallet).getBankRewardsBalance())

            //             expect(await bankFacet.connect(signers[10]).getBankRewardsBalance()).to.equal(expectedRewardEachMonth + round2ExpectedRewardEachMonth)
            //             expect(await bankFacet.connect(signers[11]).getBankRewardsBalance()).to.equal(expectedRewardEachMonth + round2ExpectedRewardEachMonth)
            //             expect(await bankFacet.connect(signers[12]).getBankRewardsBalance()).to.equal(0)
            //             expect(await bankFacet.connect(signers[13]).getBankRewardsBalance()).to.equal(expectedRewardEachMonth + round2ExpectedRewardEachMonth)
            //             expect(await bankFacet.connect(signers[14]).getBankRewardsBalance()).to.equal(expectedRewardEachMonth + round2ExpectedRewardEachMonth)
            //             expect(await bankFacet.connect(signers[15]).getBankRewardsBalance()).to.equal(0)
            //             expect(await bankFacet.connect(signers[16]).getBankRewardsBalance()).to.equal(0)
            //             expect(await bankFacet.connect(signers[17]).getBankRewardsBalance()).to.equal(0)
            //             expect(await bankFacet.connect(signers[18]).getBankRewardsBalance()).to.equal(0)
            //             expect(await bankFacet.connect(signers[19]).getBankRewardsBalance()).to.equal(0)
            //             expect(await bankFacet.connect(signers[20]).getBankRewardsBalance()).to.equal(0)
            //             expect(await bankFacet.connect(coreTeamWallet).getBankRewardsBalance()).to.equal(0)
            //         })

            //         it("confirm the totalRewardBalance variable has increased correctly", async function () {
            //             const actualTotalRewardBalance = await infoGetterFacet.getTotalRewardBalance()
            //             const expectedTotal = expectedRewardEachMonth * 4 + round2ExpectedRewardEachMonth * 4
            //             const tolerance = 1 // Adjust this tolerance as needed

            //             expect(actualTotalRewardBalance).to.be.closeTo(expectedTotal, tolerance, "Total Reward Balance should be close to expected value")
            //         })

            //         it("confirm balances on contract match the expected total", async function () {
            //             let diamondContractBalance = await mockedUSDC.balanceOf(diamondAddress)
            //             let coreTeamBalance = await infoGetterFacet.getCoreTeamBalance()
            //             let vaultHoldingBalance = await infoGetterFacet.getVaultHoldingBalance()
            //             let totalRewardBalance = await infoGetterFacet.getTotalRewardBalance()
            //             let VaultCouncilBalance = await infoGetterFacet.getVaultCouncilBalance()
            //             let dcaVaultWithdrawableBalance = await vaultFacet.getVaultWithdrawableAmount(0)
            //             let quantVaultWithdrawableBalance = await vaultFacet.getVaultWithdrawableAmount(1)

            //             let dcaVaultInfo = await vaultFacet.getVaultInformation(0)
            //             let dispersableAmountForDCAVault = dcaVaultInfo[4]

            //             let quantVaultInfo = await vaultFacet.getVaultInformation(1)
            //             let dispersableAmountForQuantVault = quantVaultInfo[4]

            //             // console.log("CoreTeamBalance:", coreTeamBalance)
            //             // console.log("vaultHoldingBalance:", vaultHoldingBalance)
            //             // console.log("totalRewardBalance:", totalRewardBalance)
            //             // console.log("VaultCouncilBalance:", VaultCouncilBalance)
            //             // console.log("dcaVaultWithdrawableBalance:", dcaVaultWithdrawableBalance)
            //             // console.log("quantVaultWithdrawableBalance:", quantVaultWithdrawableBalance)
            //             // console.log("dispersableAmountForDCAVault:", Number(dispersableAmountForDCAVault) / 10 ** 6)
            //             // console.log("dispersableAmountForQuantVault:", Number(dispersableAmountForQuantVault) / 10 ** 6)
            //             // console.log("diamondContractBalance:", Number(diamondContractBalance) / 10 ** 6)

            //             const tolerance = 2 // Adjust this tolerance as needed

            //             let totalFromVariables =
            //                 Number(coreTeamBalance) +
            //                 Number(vaultHoldingBalance) +
            //                 Number(totalRewardBalance) +
            //                 Number(VaultCouncilBalance) +
            //                 Number(dcaVaultWithdrawableBalance) +
            //                 Number(quantVaultWithdrawableBalance) +
            //                 Number(dispersableAmountForDCAVault) +
            //                 Number(dispersableAmountForQuantVault)

            //             expect(totalFromVariables).to.be.closeTo(Number(diamondContractBalance), tolerance, "not close enough")
            //         })

            //         let index3SaltIncrease = 19023127
            //         let expectedSaltIncrease = Math.floor((index3SaltIncrease + index3SaltIncrease * 0.1) / (0.8 * 10 ** 6)) // 247 grains

            //         it("confirm salt in the vault increased based on compounding of p12", async function () {
            //             let dcaVaultInfo = await vaultFacet.getVaultInformation(dcaVaultIndex)
            //             let totalSaltInDCAVaultAfterRewarding = dcaVaultInfo[1]

            //             const tolerance = 2 // Adjust this tolerance as needed

            //             expect(BigInt(totalSaltInDCAVaultbeforeRewarding) + BigInt(expectedSaltIncrease)).to.be.closeTo(
            //                 totalSaltInDCAVaultAfterRewarding,
            //                 tolerance,
            //                 "The total salt increase should be close to expected value",
            //             )
            //         })

            //         it("confirm salt in increased only for index 3", async function () {
            //             const tolerance = 1 // Adjust this tolerance as needed
            //             expect(await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 1)).to.equal(totalSaltDepositedForIndex1BeforeRewarding)
            //             expect(await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 2)).to.equal(totalSaltDepositedForIndex2BeforeRewarding)
            //             expect(await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 3)).to.be.closeTo(
            //                 BigInt(totalSaltDepositedForIndex3BeforeRewarding) + BigInt(expectedSaltIncrease),
            //                 tolerance,
            //                 "not close enough",
            //             )
            //             expect(await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 4)).to.equal(totalSaltDepositedForIndex4BeforeRewarding)
            //             expect(await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 5)).to.equal(totalSaltDepositedForIndex5BeforeRewarding)
            //             expect(await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 6)).to.equal(totalSaltDepositedForIndex6BeforeRewarding)
            //             expect(await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 51)).to.equal(totalSaltDepositedForIndex51BeforeRewarding)
            //             expect(await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 52)).to.equal(totalSaltDepositedForIndex52BeforeRewarding)
            //             expect(await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 53)).to.equal(totalSaltDepositedForIndex53BeforeRewarding)
            //             expect(await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 54)).to.equal(totalSaltDepositedForIndex54BeforeRewarding)
            //             expect(await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 55)).to.equal(totalSaltDepositedForIndex55BeforeRewarding)
            //             expect(await vaultFacet.getDepositedSaltAmount(dcaVaultIndex, 56)).to.equal(totalSaltDepositedForIndex56BeforeRewarding)
            //         })

            //         it("confirm continous compounding count only increased for index 3", async function () {
            //             expect(await vaultFacet.getContinuousMonthsCompounding(dcaVaultIndex, 10)).to.equal(0)
            //             expect(await vaultFacet.getContinuousMonthsCompounding(dcaVaultIndex, 2)).to.equal(0)
            //             expect(await vaultFacet.getContinuousMonthsCompounding(dcaVaultIndex, 3)).to.equal(2)
            //             expect(await vaultFacet.getContinuousMonthsCompounding(dcaVaultIndex, 4)).to.equal(0)
            //             expect(await vaultFacet.getContinuousMonthsCompounding(dcaVaultIndex, 5)).to.equal(0)
            //             expect(await vaultFacet.getContinuousMonthsCompounding(dcaVaultIndex, 6)).to.equal(0)
            //             expect(await vaultFacet.getContinuousMonthsCompounding(dcaVaultIndex, 51)).to.equal(0)
            //             expect(await vaultFacet.getContinuousMonthsCompounding(dcaVaultIndex, 52)).to.equal(0)
            //             expect(await vaultFacet.getContinuousMonthsCompounding(dcaVaultIndex, 53)).to.equal(0)
            //             expect(await vaultFacet.getContinuousMonthsCompounding(dcaVaultIndex, 54)).to.equal(0)
            //             expect(await vaultFacet.getContinuousMonthsCompounding(dcaVaultIndex, 55)).to.equal(0)
            //             expect(await vaultFacet.getContinuousMonthsCompounding(dcaVaultIndex, 56)).to.equal(0)
            //         })

            //         it("confirm no one has a bonus for deposits yet", async function () {
            //             expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVaultIndex, 1)).to.equal(false)
            //             expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVaultIndex, 2)).to.equal(false)
            //             expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVaultIndex, 3)).to.equal(false)
            //             expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVaultIndex, 4)).to.equal(false)
            //             expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVaultIndex, 5)).to.equal(false)
            //             expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVaultIndex, 6)).to.equal(false)
            //             expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVaultIndex, 51)).to.equal(false)
            //             expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVaultIndex, 52)).to.equal(false)
            //             expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVaultIndex, 53)).to.equal(false)
            //             expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVaultIndex, 54)).to.equal(false)
            //             expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVaultIndex, 55)).to.equal(false)
            //             expect(await vaultFacet.getBonusEligibilityForVaultDeposit(dcaVaultIndex, 56)).to.equal(false)
            //         })

            //         it("Assert expectedDiamondContractBalance == 7170 * 10 ** 6 ", async function () {
            //             assert.equal(expectedDiamondContractBalance, 7170 * 10 ** 6) // 7250 - 180 + 100
            //         })

            //         it("Assert diamondContractBalance to equals expectedDiamondContractBalance", async function () {
            //             let diamondContractBalance = await mockedUSDC.balanceOf(diamondAddress)
            //             assert.equal(diamondContractBalance, expectedDiamondContractBalance)
            //         })
        })
    })
})
