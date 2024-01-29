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

    let expectedSaltForEachDiamondBull: any

    let expectedTotalRewardPointsForCycle: any

    let expectedDiamondContractBalance: number = 0 // start here at 0

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

    let expectedCoreTeamBalance: number = 0

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

    let globalRewardAmount: number = 0

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
        const MockedUSDC = await ethers.getContractFactory("MockedUSDC", mockedBinanceAccount)
        mockedUSDC = await MockedUSDC.deploy(1000000000 * 10 ** 6)
        await mockedUSDC.waitForDeployment()

        // set contract address on the diamond
        await adminSetterFacet.connect(signers[0]).setAddresses(mockedUSDC.target, coreTeamWallet.address, royaltiesWallet.address, procurementWallet.address, gemTokenBurnWallet.address)

        // ERC721 External  Salt Vault Bulls
        const SaltVaultBulls = await ethers.getContractFactory("SaltVaultBulls")
        saltVaultBulls = await SaltVaultBulls.deploy(diamondAddress)
        await saltVaultBulls.waitForDeployment()

        // ERC721 External  SVB Gem Tokens
        const SVB_GemTokens = await ethers.getContractFactory("SVB_GemTokens")
        svbGemTokens = await SVB_GemTokens.deploy(diamondAddress)
        await svbGemTokens.waitForDeployment()

        // Transfer tokens from mockedBinanceAccount to signers[1] through signers[17]
        const amount = ethers.parseUnits("10000", 6) // Assuming MockedUSDC uses 6 decimal places

        for (let i = 10; i <= 20; i++) {
            await mockedUSDC.connect(mockedBinanceAccount).transfer(signers[i].address, amount)
        }

        await mockedUSDC.connect(mockedBinanceAccount).transfer(owner.address, amount)
    })

    it("should have seven facets -- call to facetAddresses function", async () => {
        for (const address of await diamondLoupeFacet.facetAddresses()) {
            addresses.push(address)
        }
        console.log({ addresses })
        assert.equal(addresses.length, 11)
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
                expectedCoreTeamBalance += 250 * 10 ** 6 // 10% of 2500

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

    it("confirm balances on contract match the expected total", async function () {
        let coreTeamBalance = await infoGetterFacet.getCoreTeamBalance()
        let vaultHoldingBalance = await infoGetterFacet.getVaultHoldingBalance()
        let totalRewardBalance = await infoGetterFacet.getTotalRewardBalance()
        let VaultCouncilBalance = await infoGetterFacet.getVaultCouncilBalance()

        expect(Number(coreTeamBalance) + Number(vaultHoldingBalance) + Number(totalRewardBalance) + Number(VaultCouncilBalance)).to.equal(totalMintingCost)
    })

    describe("Let P10 approve P20 ", function () {
        it("assert no one is approved yet", async function () {
            expect(await saltVaultBulls.isApprovedForAll(signers[10], signers[20])).to.equal(false)
            expect(await saltVaultBulls.getApproved(1)).to.equal(ethers.ZeroAddress)
            expect(await saltVaultBulls.balanceOf(signers[10])).to.equal(1)
            expect(await saltVaultBulls.ownerOf(1)).to.equal(signers[10])
        })

        it("assert custom approval function returns correct values", async function () {
            let approvals = await saltVaultBulls.connect(signers[10]).getApprovalHistory()
            expect(approvals[0].length).to.equal(0)
            expect(approvals[1].length).to.equal(0)
        })

        it("p10 approves p20", async function () {
            await saltVaultBulls.connect(signers[10]).approve(signers[20], 1)
        })

        it("assert custom approval function returns correct values", async function () {
            let approvals = await saltVaultBulls.connect(signers[10]).getApprovalHistory()
            console.log(approvals[0])
            expect(approvals[0].length).to.equal(1)
            expect(approvals[0][0].length).to.equal(4)
            expect(approvals[0][0][0]).to.equal(1n)
            expect(approvals[0][0][1]).to.equal(signers[20].address)
            expect(approvals[1].length).to.equal(0)
        })

        it("assert p20 is the approved address", async function () {
            expect(await saltVaultBulls.isApprovedForAll(signers[10], signers[20])).to.equal(false)
            expect(await saltVaultBulls.getApproved(1)).to.equal(signers[20].address)
            expect(await saltVaultBulls.balanceOf(signers[10])).to.equal(1)
            expect(await saltVaultBulls.ownerOf(1)).to.equal(signers[10])
        })
    })

    describe("Let P10 switch approval to P19", function () {
        it("assert p20 is the approved address", async function () {
            expect(await saltVaultBulls.isApprovedForAll(signers[10], signers[20])).to.equal(false)
            expect(await saltVaultBulls.getApproved(1)).to.equal(signers[20].address)
            expect(await saltVaultBulls.balanceOf(signers[10])).to.equal(1)
            expect(await saltVaultBulls.ownerOf(1)).to.equal(signers[10])
        })

        it("p10 approves p20", async function () {
            await saltVaultBulls.connect(signers[10]).approve(signers[19], 1)
        })

        it("assert custom approval function returns correct values", async function () {
            let approvals = await saltVaultBulls.connect(signers[10]).getApprovalHistory()
            console.log(approvals[0])
            expect(approvals[0].length).to.equal(1)
            expect(approvals[0][0].length).to.equal(4)
            expect(approvals[0][0][0]).to.equal(1n)
            expect(approvals[0][0][1]).to.equal(signers[19].address)
            expect(approvals[1].length).to.equal(0)
        })

        it("assert p20 is the approved address", async function () {
            expect(await saltVaultBulls.isApprovedForAll(signers[10], signers[20])).to.equal(false)
            expect(await saltVaultBulls.isApprovedForAll(signers[10], signers[19])).to.equal(false)
            expect(await saltVaultBulls.getApproved(1)).to.equal(signers[19].address)
            expect(await saltVaultBulls.balanceOf(signers[10])).to.equal(1)
            expect(await saltVaultBulls.ownerOf(1)).to.equal(signers[10])
        })
    })

    describe("Let P10 aproveForAll to P16 and P17", function () {
        it("assert no approvedForAll addresses Yet", async function () {
            expect(await saltVaultBulls.isApprovedForAll(signers[10], signers[15])).to.equal(false)
            expect(await saltVaultBulls.isApprovedForAll(signers[10], signers[16])).to.equal(false)
        })

        it("p10 setApprovalForAll for p15", async function () {
            await saltVaultBulls.connect(signers[10]).setApprovalForAll(signers[15], true)
        })

        it("assert custom approval function returns correct values", async function () {
            let approvals = await saltVaultBulls.connect(signers[10]).getApprovalHistory()
            console.log(approvals[1])
            expect(approvals[0].length).to.equal(1)
            expect(approvals[0][0].length).to.equal(4)
            expect(approvals[0][0][0]).to.equal(1n)
            expect(approvals[0][0][1]).to.equal(signers[19].address)
            expect(approvals[1].length).to.equal(1)
            expect(approvals[1][0].length).to.equal(3)
            expect(approvals[1][0][0]).to.equal(signers[15].address)
            expect(approvals[1][0][2]).to.equal(true)
        })

        it("p10 setApprovalForAll for p16 too", async function () {
            await saltVaultBulls.connect(signers[10]).setApprovalForAll(signers[16], true)
        })

        it("assert custom approval function returns correct values", async function () {
            let approvals = await saltVaultBulls.connect(signers[10]).getApprovalHistory()
            console.log(approvals[1])
            expect(approvals[0].length).to.equal(1)
            expect(approvals[0][0].length).to.equal(4)
            expect(approvals[0][0][0]).to.equal(1n)
            expect(approvals[0][0][1]).to.equal(signers[19].address)
            expect(approvals[1].length).to.equal(2)
            expect(approvals[1][0].length).to.equal(3)
            expect(approvals[1][0][0]).to.equal(signers[15].address)
            expect(approvals[1][0][2]).to.equal(true)

            expect(approvals[1][1].length).to.equal(3)
            expect(approvals[1][1][0]).to.equal(signers[16].address)
            expect(approvals[1][1][2]).to.equal(true)
        })

        it("assert p20 is the approved address", async function () {
            expect(await saltVaultBulls.isApprovedForAll(signers[10], signers[15])).to.equal(true)
            expect(await saltVaultBulls.isApprovedForAll(signers[10], signers[16])).to.equal(true)
            expect(await saltVaultBulls.getApproved(1)).to.equal(signers[19].address)
            expect(await saltVaultBulls.balanceOf(signers[10])).to.equal(1)
            expect(await saltVaultBulls.ownerOf(1)).to.equal(signers[10])
        })
    })

    describe("Let P10 transfer NFT to p11 and all the approvals are removed", function () {
        it("p10 transfer index 1 to p11", async function () {
            await saltVaultBulls.connect(signers[10]).safeTransferFrom(signers[10], signers[11], 1)
        })

        it("assert approved addresses", async function () {
            expect(await saltVaultBulls.isApprovedForAll(signers[10], signers[15])).to.equal(true)
            expect(await saltVaultBulls.isApprovedForAll(signers[10], signers[16])).to.equal(true)

            expect(await saltVaultBulls.isApprovedForAll(signers[11], signers[15])).to.equal(false)
            expect(await saltVaultBulls.isApprovedForAll(signers[11], signers[16])).to.equal(false)

            expect(await saltVaultBulls.getApproved(1)).to.equal(ethers.ZeroAddress)
            expect(await saltVaultBulls.balanceOf(signers[10])).to.equal(0)
            expect(await saltVaultBulls.balanceOf(signers[11])).to.equal(2)
            expect(await saltVaultBulls.ownerOf(1)).to.equal(signers[11])
            expect(await saltVaultBulls.ownerOf(2)).to.equal(signers[11])
        })

        it("assert custom approval function returns correct values", async function () {
            let approvals = await saltVaultBulls.connect(signers[10]).getApprovalHistory()
            console.log(approvals)
            expect(approvals[0].length).to.equal(0)

            expect(approvals[1].length).to.equal(2)
            expect(approvals[1][0].length).to.equal(3)
            expect(approvals[1][0][0]).to.equal(signers[15].address)
            expect(approvals[1][0][2]).to.equal(true)

            expect(approvals[1][1].length).to.equal(3)
            expect(approvals[1][1][0]).to.equal(signers[16].address)
            expect(approvals[1][1][2]).to.equal(true)

            approvals = await saltVaultBulls.connect(signers[11]).getApprovalHistory()
            console.log(approvals)
            expect(approvals[0].length).to.equal(0)
            expect(approvals[1].length).to.equal(0)
        })
    })
})
