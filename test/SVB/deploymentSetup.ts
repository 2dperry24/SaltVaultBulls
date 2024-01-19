/* global describe it before ethers */

import { getSelectors, FacetCutAction, removeSelectors, findAddressPositionInFacets } from "../../scripts/diamond"
import { deployDiamond } from "../../scripts/deploy"
import { assert } from "chai"
import { ethers } from "hardhat"
import { Contract } from "ethers"

import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs"
import { expect } from "chai"

describe("InitializationTest", async function () {
    let diamondAddress: string
    let diamondCutFacet: Contract
    let diamondLoupeFacet: Contract
    let ownershipFacet: Contract
    let erc721Facet: Contract
    let saltRepositoryFacet: Contract
    let infoGetterFacet: Contract
    let adminSetterFacet: Contract
    let saltVaultToken: Contract
    let mockedUSDC: Contract

    let signers: any
    let owner: any
    let coreTeamWallet: any
    let royaltiesWallet: any
    let procurementWallet: any
    let vaultWallet1: any
    let vaultWallet2: any
    let vaultWallet3: any
    let badActorWallet: any
    let mockedExchange: any

    let tx
    let receipt
    let result
    const addresses: string[] = []

    before(async function () {
        // Deploy Diamond and Get Facet Information
        diamondAddress = await deployDiamond()
        console.log({ diamondAddress })
        diamondCutFacet = await ethers.getContractAt("DiamondCutFacet", diamondAddress)
        diamondLoupeFacet = await ethers.getContractAt("DiamondLoupeFacet", diamondAddress)
        ownershipFacet = await ethers.getContractAt("OwnershipFacet", diamondAddress)
        erc721Facet = await ethers.getContractAt("ERC721Facet", diamondAddress)
        saltRepositoryFacet = await ethers.getContractAt("SaltRepositoryFacet", diamondAddress)
        infoGetterFacet = await ethers.getContractAt("InfoGetterFacet", diamondAddress)
        adminSetterFacet = await ethers.getContractAt("AdminSetterFacet", diamondAddress)

        // Deploy MockedUSDC and disperse these tokens

        // Get a list of available signers
        signers = await ethers.getSigners()

        owner = signers[0]
        coreTeamWallet = signers[1]
        royaltiesWallet = signers[2]
        procurementWallet = signers[3]
        vaultWallet1 = signers[4]
        vaultWallet2 = signers[5]
        vaultWallet3 = signers[6]
        mockedExchange = signers[30]
        badActorWallet = signers[13]

        // MockedUSDC
        const MockedUSDC = await ethers.getContractFactory("MockedUSDC", mockedExchange)
        mockedUSDC = await MockedUSDC.deploy(100000000 * 10 ** 6)
        await mockedUSDC.waitForDeployment()

        // Transfer tokens from signers[30] to signers[1] through signers[17]
        const amount = ethers.parseUnits("10000", 6) // Assuming MockedUSDC uses 6 decimal places

        for (let i = 10; i <= 20; i++) {
            await mockedUSDC.connect(mockedExchange).transfer(signers[i].address, amount)
        }

        // Salt Vault Token
        const SaltVaultToken = await ethers.getContractFactory("SaltVaultToken")
        saltVaultToken = await SaltVaultToken.deploy()
        await saltVaultToken.waitForDeployment()
    })

    it("should have 7 facets -- call to facetAddresses function", async () => {
        for (const address of await diamondLoupeFacet.facetAddresses()) {
            addresses.push(address)
        }
        console.log({ addresses })
        assert.equal(addresses.length, 8)

        console.log(await diamondLoupeFacet.facetFunctionSelectors(erc721Facet.target))
    })

    // describe("Starting Bull Variables", function () {
    //     it("Confirm Diamond Bull Information", async function () {
    //         let bullData = await infoGetterFacet.getBullRarityInformation(0)

    //         expect(Number(bullData[0])).to.equal(0) // Rarity
    //         expect(Number(bullData[1])).to.equal(2500 * 10 ** 6) // mintCost
    //         expect(Number(bullData[2])).to.equal(300) // rewardMultiplier
    //         expect(Number(bullData[3])).to.equal(1) // currentIndex
    //         expect(Number(bullData[4])).to.equal(50) // lastIndex
    //     })

    //     it("Confirm Ruby Bull Information", async function () {
    //         let bullData = await infoGetterFacet.getBullRarityInformation(1)

    //         expect(Number(bullData[0])).to.equal(1) // Rarity
    //         expect(Number(bullData[1])).to.equal(1000 * 10 ** 6) // mintCost
    //         expect(Number(bullData[2])).to.equal(200) // rewardMultiplier
    //         expect(Number(bullData[3])).to.equal(51) // currentIndex
    //         expect(Number(bullData[4])).to.equal(500) // lastIndex
    //     })

    //     it("Confirm Platinum Bull Information", async function () {
    //         let bullData = await infoGetterFacet.getBullRarityInformation(2)

    //         expect(Number(bullData[0])).to.equal(2) // Rarity
    //         expect(Number(bullData[1])).to.equal(750 * 10 ** 6) // mintCost
    //         expect(Number(bullData[2])).to.equal(175) // rewardMultiplier
    //         expect(Number(bullData[3])).to.equal(501) // currentIndex
    //         expect(Number(bullData[4])).to.equal(2000) // lastIndex
    //     })

    //     it("Confirm Gold Bull Information", async function () {
    //         let bullData = await infoGetterFacet.getBullRarityInformation(3)

    //         expect(Number(bullData[0])).to.equal(3) // Rarity
    //         expect(Number(bullData[1])).to.equal(500 * 10 ** 6) // mintCost
    //         expect(Number(bullData[2])).to.equal(150) // rewardMultiplier
    //         expect(Number(bullData[3])).to.equal(2001) // currentIndex
    //         expect(Number(bullData[4])).to.equal(4000) // lastIndex
    //     })

    //     it("Confirm Silver Bull Information", async function () {
    //         let bullData = await infoGetterFacet.getBullRarityInformation(4)

    //         expect(Number(bullData[0])).to.equal(4) // Rarity
    //         expect(Number(bullData[1])).to.equal(350 * 10 ** 6) // mintCost
    //         expect(Number(bullData[2])).to.equal(130) // rewardMultiplier
    //         expect(Number(bullData[3])).to.equal(4001) // currentIndex
    //         expect(Number(bullData[4])).to.equal(6000) // lastIndex
    //     })

    //     it("Confirm Bronze Bull Information", async function () {
    //         let bullData = await infoGetterFacet.getBullRarityInformation(5)

    //         expect(Number(bullData[0])).to.equal(5) // Rarity
    //         expect(Number(bullData[1])).to.equal(200 * 10 ** 6) // mintCost
    //         expect(Number(bullData[2])).to.equal(115) // rewardMultiplier
    //         expect(Number(bullData[3])).to.equal(6001) // currentIndex
    //         expect(Number(bullData[4])).to.equal(8000) // lastIndex
    //     })

    //     it("Confirm Blank Bull Information", async function () {
    //         let bullData = await infoGetterFacet.getBullRarityInformation(6)

    //         expect(Number(bullData[0])).to.equal(6) // Rarity
    //         expect(Number(bullData[1])).to.equal(100 * 10 ** 6) // mintCost
    //         expect(Number(bullData[2])).to.equal(100) // rewardMultiplier
    //         expect(Number(bullData[3])).to.equal(8001) // currentIndex
    //         expect(Number(bullData[4])).to.equal(10000) // lastIndex
    //     })
    // })

    describe("Starting Salt Repository Variables", function () {
        it("Confirm Salt Grain Prices", async function () {
            expect(await saltRepositoryFacet.getSaltGrainPurchasePrice(1, 0, 0, 0)).to.equal(1 * 10 ** 6)
            expect(await saltRepositoryFacet.getSaltGrainPurchasePrice(10, 0, 0, 0)).to.equal(10 * 10 ** 6)
            expect(await saltRepositoryFacet.getSaltGrainPurchasePrice(18, 0, 0, 0)).to.equal(18 * 10 ** 6)
            expect(await saltRepositoryFacet.getSaltGrainPurchasePrice(0, 1, 0, 0)).to.equal(9 * 10 ** 6)
            expect(await saltRepositoryFacet.getSaltGrainPurchasePrice(0, 7, 0, 0)).to.equal(7 * 9 * 10 ** 6)
            expect(await saltRepositoryFacet.getSaltGrainPurchasePrice(0, 27, 0, 0)).to.equal(27 * 9 * 10 ** 6)
            expect(await saltRepositoryFacet.getSaltGrainPurchasePrice(0, 0, 1, 0)).to.equal(85 * 10 ** 6)
            expect(await saltRepositoryFacet.getSaltGrainPurchasePrice(0, 0, 0, 1)).to.equal(800 * 10 ** 6)
            expect(await saltRepositoryFacet.getSaltGrainPurchasePrice(1, 1, 1, 1)).to.equal((800 + 85 + 9 + 1) * 10 ** 6)
            expect(await saltRepositoryFacet.getSaltGrainPurchasePrice(0, 5, 5, 8)).to.equal((800 * 8 + 85 * 5 + 9 * 5) * 10 ** 6)
        })
    })

    describe("Starting Salt Repository Variables", function () {
        it("assert USDC has been sent by mockedExchange", async () => {
            expect(await mockedUSDC.balanceOf(signers[5])).to.equal(0)
            expect(await mockedUSDC.balanceOf(signers[10])).to.equal(10_000 * 10 ** 6)
        })

        // it("set Minting Bulls to Live when not ready", async () => {
        //     await expect(adminSetterFacet.connect(owner).setBullsMintStatus(true)).to.be.revertedWith("Addresses must be set first")
        // })

        // it("set Addresses on Contract", async () => {
        //     await adminSetterFacet.connect(owner).setAddresses(mockedUSDC.getAddress(), saltVaultToken.getAddress(), coreTeamWallet.address, royaltiesWallet.address, procurementWallet.address)

        //     expect(await infoGetterFacet.getUsdcContractAddress()).to.equal(mockedUSDC.target)
        //     expect(await infoGetterFacet.getSaltVaultTokenAddress()).to.equal(saltVaultToken.target)
        //     expect(await infoGetterFacet.getCoreTeamWalletAddress()).to.equal(coreTeamWallet.address)
        //     expect(await infoGetterFacet.getRoyaltiesWalletAddress()).to.equal(royaltiesWallet.address)
        //     expect(await infoGetterFacet.getProcurementWalletAddress()).to.equal(procurementWallet.address)
        // })

        // it("set Minting Bulls to Live", async () => {
        //     await adminSetterFacet.connect(owner).setBullsMintStatus(true)

        //     expect(await infoGetterFacet.getIsBullsMintLiveStatus()).to.equal(true)
        // })

        // it("Let person10 mint a Diamond Bull NFT", async function () {
        //     const expectedAddressToMintTo = signers[10].address
        //     const expectedTokenId = 1
        //     const expectedMintCost = 2500 * 10 ** 6
        //     const expectedAum = 2500 * 0.9 * 10 ** 6
        //     const expectedGrains = 0
        //     const expectedPillars = 0
        //     const expectedSheets = 5
        //     const expectedCubes = 2
        //     const expectedBonusGrains = 250

        //     // Amount to approve (make sure this is sufficient for the mint operation)
        //     const amountToApprove = await infoGetterFacet.getCostAndMintEligibility(0)

        //     expect(amountToApprove).to.equal(expectedMintCost)

        //     console.log("usdcContract:", await infoGetterFacet.getUsdcContractAddress())

        //     // Approve the proxySVB contract to spend tokens
        //     await mockedUSDC.connect(signers[10]).approve(mintingBullsFacet, amountToApprove)

        //     await mintingBullsFacet.connect(signers[10]).mintBull(0, signers[10].address, 1)

        //     // // Now attempt the mint
        //     // await expect(mintingBullsFacet.connect(signers[10]).mintBull(0, signers[10].address, 1)).to.emit(mintingBullsFacet.target, "MintedBull").withArgs(expectedAddressToMintTo, expectedTokenId, expectedMintCost, expectedAum, expectedGrains, expectedPillars, expectedSheets, expectedCubes, expectedBonusGrains)

        //     expect(await mintingBullsFacet.totalSupply()).to.equal(1)

        //     let bull = await infoGetterFacet.getBullInformation(1)
        //     console.log("bull:", bull)

        //     console.log("balanceOf:", await mintingBullsFacet.balanceOf(signers[10]))
        //     console.log("walletOfOwner:", await infoGetterFacet.walletOfOwner(signers[10]))
        // })

        // it("test sending ERC20 to diamond", async function () {

        // })
        // const _1K = 1_000 * 10 ** 6
        // it("Owner buys 10,000 $SVT for reward distribution", async function () {
        //     // Setup SVT token now that proxySVB is known
        //     await saltVaultToken.connect(signers[0]).setSaltVaultBullsAddress(mintingBullsFacet.target)
        //     await saltVaultToken.connect(signers[0]).setUnderlyingToken(mockedUSDC)
        //     await saltVaultToken.connect(signers[0]).setFeeReceiver(signers[6].address)

        //     await saltVaultToken.connect(signers[0]).setCustomFee([signers[6].address, signers[10].address], [100000, 100000])

        //     await saltVaultToken.connect(signers[0]).activateToken(true)

        //     await mockedUSDC.connect(signers[10]).approve(saltVaultToken.target, _1K)
        //     await saltVaultToken.connect(signers[10]).mintWithBacking(_1K)
        // })

        // it("Assert owner has 10,000 $SVT", async function () {
        //     expect(await saltVaultToken.balanceOf(signers[10])).to.equal(_1K)
        // })

        // it("test diamond to safeTransfer mockedUSDC on the mintingFacet", async function () {
        //     let p10_usdc_balance_before = await mockedUSDC.balanceOf(signers[10])
        //     let p10_svt_balance_before = await saltVaultToken.balanceOf(signers[10])

        //     let facet_balance_before = await mockedUSDC.balanceOf(mintingBullsFacet.target)

        //     console.log("mockedUSDC balance of person10 :", Number(p10_usdc_balance_before) / 10 ** 6)
        //     console.log("SVT balance of person10        :", Number(p10_svt_balance_before) / 10 ** 6)
        //     // console.log("mockedUSDC balance of facet:", Number(facet_balance_before) / 10 ** 6)

        //     // // await mockedUSDC.connect(signers[10]).transfer(mintingBullsFacet.target, 10 * 10 ** 6)

        //     await saltVaultToken.connect(signers[10]).approve(mintingBullsFacet.target, 10 * 10 ** 6)

        //     await mockedUSDC.connect(signers[10]).approve(mintingBullsFacet.target, 10 * 10 ** 6)

        //     await mintingBullsFacet.test10(signers[10].address)

        //     let p10_usdc_balance_after = await mockedUSDC.balanceOf(signers[10])
        //     let p10_svt_balance_after = await saltVaultToken.balanceOf(signers[10])

        //     let facet_balance_after = await mockedUSDC.balanceOf(mintingBullsFacet.target)

        //     console.log("mockedUSDC balance of person10 :", Number(p10_usdc_balance_after) / 10 ** 6)
        //     console.log("SVT balance of person10        :", Number(p10_svt_balance_after) / 10 ** 6)

        //     // let p10_balance_after = await mockedUSDC.balanceOf(signers[10])
        //     // let facet_balance_after = await mockedUSDC.balanceOf(mintingBullsFacet.target)
        //     // console.log()
        //     // console.log("mockedUSDC balance of person10:", Number(p10_balance_after) / 10 ** 6)
        //     // // console.log("mockedUSDC balance of facet:", Number(facet_balance_after) / 10 ** 6)
        // })

        // it("test minting", async function () {
        //     let p10_usdc_balance_before = await mockedUSDC.balanceOf(signers[10])
        //     let p10_svt_balance_before = await saltVaultToken.balanceOf(signers[10])

        //     let facet_balance_before = await mockedUSDC.balanceOf(mintBullsFacet.target)

        //     console.log("mockedUSDC balance of person10 :", Number(p10_usdc_balance_before) / 10 ** 6)
        //     console.log("SVT balance of person10        :", Number(p10_svt_balance_before) / 10 ** 6)
        //     // console.log("mockedUSDC balance of facet:", Number(facet_balance_before) / 10 ** 6)

        //     // // await mockedUSDC.connect(signers[10]).transfer(mintingBullsFacet.target, 10 * 10 ** 6)

        //     await saltVaultToken.connect(signers[10]).approve(mintBullsFacet.target, 2500 * 10 ** 6)

        //     await mockedUSDC.connect(signers[10]).approve(mintBullsFacet.target, 2500 * 10 ** 6)

        //     await mintBullsFacet.mintBull(signers[10].address, 0, 1)

        //     //

        //     await saltVaultToken.connect(signers[10]).approve(mintBullsFacet.target, 1000 * 10 ** 6)

        //     await mockedUSDC.connect(signers[10]).approve(mintBullsFacet.target, 1000 * 10 ** 6)

        //     await mintBullsFacet.mintBull(signers[10].address, 1, 1)

        //     //

        //     await saltVaultToken.connect(signers[11]).approve(mintBullsFacet.target, 1000 * 10 ** 6)

        //     await mockedUSDC.connect(signers[11]).approve(mintBullsFacet.target, 1000 * 10 ** 6)

        //     await mintBullsFacet.mintBull(signers[11].address, 1, 1)

        //     let p10_usdc_balance_after = await mockedUSDC.balanceOf(signers[10])
        //     let p10_svt_balance_after = await saltVaultToken.balanceOf(signers[10])

        //     let facet_balance_after = await mockedUSDC.balanceOf(mintBullsFacet.target)

        //     console.log("mockedUSDC balance of person10 :", Number(p10_usdc_balance_after) / 10 ** 6)
        //     console.log("SVT balance of person10        :", Number(p10_svt_balance_after) / 10 ** 6)
        //     console.log()
        //     console.log()

        //     let symbol = await mintBullsFacet.symbol()
        //     console.log("symbol:", symbol)
        //     expect(symbol).to.equal("SVB")

        //     let name = await mintBullsFacet.name()
        //     console.log("name:", name)
        //     expect(name).to.equal("Salt Vault Bulls")

        //     let tokenURI_1 = await mintBullsFacet.tokenURI(1)
        //     console.log("tokenURI:", tokenURI_1)
        //     expect(tokenURI_1).to.equal("ipfs://svbnft.com/1")

        //     let tokenURI_51 = await mintBullsFacet.tokenURI(51)
        //     console.log("tokenURI:", tokenURI_51)
        //     expect(tokenURI_51).to.equal("ipfs://svbnft.com/51")

        //     let tokenURI_52 = await mintBullsFacet.tokenURI(52)
        //     console.log("tokenURI:", tokenURI_52)
        //     expect(tokenURI_52).to.equal("ipfs://svbnft.com/52")

        //     let totalSupply = await mintBullsFacet.totalSupply()
        //     console.log("totalSupply:", totalSupply)
        //     expect(totalSupply).to.equal(3)

        //     //
        //     // Token approvals
        //     //

        //     let getApproved1 = await mintBullsFacet.getApproved(1)
        //     console.log("getApproved1:", getApproved1)
        //     expect(getApproved1).to.equal(ethers.ZeroAddress)

        //     let getApproved51 = await mintBullsFacet.getApproved(51)
        //     console.log("getApproved51:", getApproved51)
        //     expect(getApproved51).to.equal(ethers.ZeroAddress)

        //     let getApproved52 = await mintBullsFacet.getApproved(52)
        //     console.log("getApproved52:", getApproved52)
        //     expect(getApproved52).to.equal(ethers.ZeroAddress)

        //     await mintBullsFacet.connect(signers[10]).approve(signers[30], 51)

        //     getApproved1 = await mintBullsFacet.getApproved(1)
        //     console.log("getApproved1:", getApproved1)
        //     expect(getApproved1).to.equal(ethers.ZeroAddress)

        //     getApproved51 = await mintBullsFacet.getApproved(51)
        //     console.log("getApproved51:", getApproved51)
        //     expect(getApproved51).to.equal(signers[30])

        //     getApproved52 = await mintBullsFacet.getApproved(52)
        //     console.log("getApproved52:", getApproved52)
        //     expect(getApproved52).to.equal(ethers.ZeroAddress)

        //     //
        //     // set approvalForAlls
        //     //

        //     let isApprovedForAll = await mintBullsFacet.isApprovedForAll(signers[10], saltVaultToken.target)
        //     console.log("isApprovedForAll:", isApprovedForAll)
        //     expect(isApprovedForAll).to.equal(false)

        //     await mintBullsFacet.connect(signers[10]).setApprovalForAll(saltVaultToken.target, true)

        //     isApprovedForAll = await mintBullsFacet.isApprovedForAll(signers[10], saltVaultToken.target)
        //     console.log("isApprovedForAll:", isApprovedForAll)
        //     expect(isApprovedForAll).to.equal(true)

        //     //
        //     //
        //     //

        //     let tokenOfOwnerByIndex = await mintBullsFacet.tokenOfOwnerByIndex(signers[10], 0)
        //     console.log("tokenOfOwnerByIndex:", tokenOfOwnerByIndex)
        //     expect(tokenOfOwnerByIndex).to.equal(1)

        //     tokenOfOwnerByIndex = await mintBullsFacet.tokenOfOwnerByIndex(signers[10], 1)
        //     console.log("tokenOfOwnerByIndex:", tokenOfOwnerByIndex)
        //     expect(tokenOfOwnerByIndex).to.equal(51)

        //     tokenOfOwnerByIndex = await mintBullsFacet.tokenOfOwnerByIndex(signers[11], 0)
        //     console.log("tokenOfOwnerByIndex:", tokenOfOwnerByIndex)
        //     expect(tokenOfOwnerByIndex).to.equal(52)

        //     //
        //     //
        //     //

        //     let tokenByIndex0 = await mintBullsFacet.tokenByIndex(0)
        //     console.log("tokenByIndex0:", tokenByIndex0)
        //     expect(tokenByIndex0).to.equal(1)

        //     let tokenByIndex1 = await mintBullsFacet.tokenByIndex(1)
        //     console.log("tokenByIndex1:", tokenByIndex1)
        //     expect(tokenByIndex1).to.equal(51)

        //     let tokenByIndex2 = await mintBullsFacet.tokenByIndex(2)
        //     console.log("tokenByIndex0:", tokenByIndex2)
        //     expect(tokenByIndex2).to.equal(52)

        //     //
        //     //
        //     //

        //     let balanceP10 = await mintBullsFacet.balanceOf(signers[10])
        //     console.log("balanceOfP10:", balanceP10)
        //     expect(balanceP10).to.equal(2)

        //     let balanceP11 = await mintBullsFacet.balanceOf(signers[11])
        //     console.log("balanceOfP11:", balanceP11)
        //     expect(balanceP11).to.equal(1)

        //     let balanceP12 = await mintBullsFacet.balanceOf(signers[12])
        //     console.log("balanceOfP12:", balanceP12)
        //     expect(balanceP12).to.equal(0)

        //     let walletOfOwnerP10 = await mintBullsFacet.walletOfOwner(signers[10])
        //     console.log("walletOfOwnerP10:", walletOfOwnerP10)
        //     expect(Number(walletOfOwnerP10[0])).to.equal(1)
        //     expect(Number(walletOfOwnerP10[1])).to.equal(51)

        //     let walletOfOwnerP11 = await mintBullsFacet.walletOfOwner(signers[11])
        //     console.log("walletOfOwnerP11:", walletOfOwnerP11)
        //     expect(Number(walletOfOwnerP11[0])).to.equal(52)

        //     let bull = await infoGetterFacet.getBullInformation(1)
        //     console.log("bull1:", bull)
        //     expect(bull[0]).to.equal(0)
        //     expect(bull[1]).to.equal(6)
        //     expect(bull[2]).to.equal(1)
        //     expect(bull[3]).to.equal(1)
        //     expect(bull[4]).to.equal(3)
        //     expect(bull[5]).to.equal(0)

        //     let bull51 = await infoGetterFacet.getBullInformation(51)
        //     console.log("bull51:", bull51)

        //     bull = await infoGetterFacet.getBullInformation(51)
        //     console.log("bull51:", bull)
        //     expect(bull[0]).to.equal(1)
        //     expect(bull[1]).to.equal(3)
        //     expect(bull[2]).to.equal(3)
        //     expect(bull[3]).to.equal(2)
        //     expect(bull[4]).to.equal(1)
        //     expect(bull[5]).to.equal(0)

        //     bull = await infoGetterFacet.getBullInformation(52)
        //     console.log("bull52:", bull)
        //     expect(bull[0]).to.equal(1)
        //     expect(bull[1]).to.equal(3)
        //     expect(bull[2]).to.equal(3)
        //     expect(bull[3]).to.equal(2)
        //     expect(bull[4]).to.equal(1)
        //     expect(bull[5]).to.equal(0)

        //     // let p10 send index 51 to p12

        //     await mintBullsFacet.connect(signers[10]).safeTransferFrom(signers[10], signers[12], 51)

        //     balanceP10 = await mintBullsFacet.balanceOf(signers[10])
        //     console.log("balanceOfP10:", balanceP10)
        //     expect(balanceP10).to.equal(1)

        //     balanceP11 = await mintBullsFacet.balanceOf(signers[11])
        //     console.log("balanceOfP11:", balanceP11)
        //     expect(balanceP11).to.equal(1)

        //     balanceP12 = await mintBullsFacet.balanceOf(signers[12])
        //     console.log("balanceOfP12:", balanceP12)
        //     expect(balanceP12).to.equal(1)

        //     walletOfOwnerP10 = await mintBullsFacet.walletOfOwner(signers[10])
        //     console.log("walletOfOwnerP10:", walletOfOwnerP10)
        //     expect(Number(walletOfOwnerP10[0])).to.equal(1)

        //     walletOfOwnerP11 = await mintBullsFacet.walletOfOwner(signers[11])
        //     console.log("walletOfOwnerP11:", walletOfOwnerP11)
        //     expect(Number(walletOfOwnerP11[0])).to.equal(52)

        //     let walletOfOwnerP12 = await mintBullsFacet.walletOfOwner(signers[12])
        //     console.log("walletOfOwnerP12:", walletOfOwnerP12)
        //     expect(Number(walletOfOwnerP12[0])).to.equal(51)

        //     // Test ownership of an 1155 nft

        //     let balanceP1 = await mintBullsFacet.balanceOf(signers[12])
        //     console.log("balanceOfP12:", balanceP12)
        //     expect(balanceP12).to.equal(0)
        // })
    })
})
