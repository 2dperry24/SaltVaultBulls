/* global describe it before ethers */

import { getSelectors, FacetCutAction, removeSelectors, findAddressPositionInFacets } from "../../scripts/diamond"
import { deployDiamond } from "../../scripts/deploy"
import { assert } from "chai"
import { ethers } from "hardhat"
import { Contract, BigNumber } from "ethers"

import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs"
import { expect } from "chai"

describe("InitializationTest", async function () {
    let diamondAddress: string
    let diamondCutFacet: Contract
    let diamondLoupeFacet: Contract
    let ownershipFacet: Contract
    let ERC721Facet: Contract
    let saltRepositoryFacet: Contract
    let infoGetterFacet: Contract
    let adminSetterFacet: Contract
    let saltVaultBulls: Contract
    let mockedUSDC: Contract
    let ERC20Facet: Contract
    let mockedDAI: Contract
    let mockedUSDT: Contract

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
        ERC721Facet = await ethers.getContractAt("ERC721Facet", diamondAddress)
        saltRepositoryFacet = await ethers.getContractAt("SaltRepositoryFacet", diamondAddress)
        infoGetterFacet = await ethers.getContractAt("InfoGetterFacet", diamondAddress)
        adminSetterFacet = await ethers.getContractAt("AdminSetterFacet", diamondAddress)
        ERC20Facet = await ethers.getContractAt("ERC20Facet", diamondAddress)

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

        // ERC20 Facades
        const MockedDAI = await ethers.getContractFactory("MockedDAI", mockedExchange)
        mockedDAI = await MockedDAI.deploy(ERC20Facet)
        await mockedDAI.waitForDeployment()

        // ERC20 Facades
        const MockedUSDT = await ethers.getContractFactory("MockedUSDT", mockedExchange)
        mockedUSDT = await MockedUSDT.deploy(ERC20Facet)
        await mockedUSDT.waitForDeployment()

        // // ERC721 Facade  Salt Vault Bulls
        // const SaltVaultBulls = await ethers.getContractFactory("SaltVaultBulls")
        // saltVaultBulls = await SaltVaultBulls.deploy(diamondAddress)
        // await saltVaultBulls.waitForDeployment()

        // MockedUSDC
        const MockedUSDC = await ethers.getContractFactory("MockedUSDC", signers[30])
        mockedUSDC = await MockedUSDC.deploy(100000000 * 10 ** 6)
        await mockedUSDC.waitForDeployment()

        // Transfer tokens from signers[30] to signers[1] through signers[17]
        const amount = ethers.parseUnits("100000", 6) // Assuming MockedUSDC uses 6 decimal places

        for (let i = 10; i <= 20; i++) {
            await mockedUSDC.connect(signers[30]).transfer(signers[i].address, amount)
        }
    })

    // it("should have 8 facets -- call to facetAddresses function", async () => {
    //     for (const address of await diamondLoupeFacet.facetAddresses()) {
    //         addresses.push(address)
    //     }
    //     console.log({ addresses })
    //     assert.equal(addresses.length, 8)

    //     // await mintBullsFacet.connect(owner).initMintBullsData()
    // })

    describe("Test Start ERC721", function () {
        it("Test Current State of saltVaultBulls ERC721 contract ", async function () {
            console.log("saltVaultBulls name:", await saltVaultBulls.name())
            console.log("saltVaultBulls symbol:", await saltVaultBulls.symbol())
            expect(await saltVaultBulls.name()).to.equal("Salt Vault Bulls")
            expect(await saltVaultBulls.symbol()).to.equal("SVB")

            console.log("saltVaultBulls diamondAddress:", await saltVaultBulls.diamondAddress())
            expect(await saltVaultBulls.diamondAddress()).to.equal(diamondAddress)

            let rarity = await infoGetterFacet.getRarityInformationForBull(0)
            expect(Number(rarity[0])).to.equal(0)
            expect(Number(rarity[1])).to.equal(2500 * 10 ** 6)
            expect(Number(rarity[2])).to.equal(300)
            expect(Number(rarity[3])).to.equal(1)
            expect(Number(rarity[4])).to.equal(50)

            rarity = await infoGetterFacet.getRarityInformationForBull(1)
            expect(Number(rarity[0])).to.equal(1)
            expect(Number(rarity[1])).to.equal(1000 * 10 ** 6)
            expect(Number(rarity[2])).to.equal(200)
            expect(Number(rarity[3])).to.equal(51)
            expect(Number(rarity[4])).to.equal(500)

            rarity = await infoGetterFacet.getRarityInformationForBull(2)
            expect(Number(rarity[0])).to.equal(2)
            expect(Number(rarity[1])).to.equal(750 * 10 ** 6)
            expect(Number(rarity[2])).to.equal(175)
            expect(Number(rarity[3])).to.equal(501)
            expect(Number(rarity[4])).to.equal(2000)

            rarity = await infoGetterFacet.getRarityInformationForBull(3)
            expect(Number(rarity[0])).to.equal(3)
            expect(Number(rarity[1])).to.equal(500 * 10 ** 6)
            expect(Number(rarity[2])).to.equal(150)
            expect(Number(rarity[3])).to.equal(2001)
            expect(Number(rarity[4])).to.equal(4000)

            rarity = await infoGetterFacet.getRarityInformationForBull(4)
            expect(Number(rarity[0])).to.equal(4)
            expect(Number(rarity[1])).to.equal(350 * 10 ** 6)
            expect(Number(rarity[2])).to.equal(130)
            expect(Number(rarity[3])).to.equal(4001)
            expect(Number(rarity[4])).to.equal(6000)

            rarity = await infoGetterFacet.getRarityInformationForBull(5)
            expect(Number(rarity[0])).to.equal(5)
            expect(Number(rarity[1])).to.equal(200 * 10 ** 6)
            expect(Number(rarity[2])).to.equal(115)
            expect(Number(rarity[3])).to.equal(6001)
            expect(Number(rarity[4])).to.equal(8000)

            rarity = await infoGetterFacet.getRarityInformationForBull(6)
            expect(Number(rarity[0])).to.equal(6)
            expect(Number(rarity[1])).to.equal(100 * 10 ** 6)
            expect(Number(rarity[2])).to.equal(100)
            expect(Number(rarity[3])).to.equal(8001)
            expect(Number(rarity[4])).to.equal(10000)
        })

        it("Test p10 has 10,000 mocked USDC and contracts have zero", async function () {
            expect(await mockedUSDC.balanceOf(signers[10])).to.equal(100_000 * 10 ** 6)

            // assert saltVaultBulls contract USDC balance is zero
            expect(await mockedUSDC.balanceOf(mockedUSDC.target)).to.equal(0)

            // assert diamondAddress contract USDC balance is zero
            expect(await mockedUSDC.balanceOf(diamondAddress)).to.equal(0)

            // assert erc721Facet contract USDC balance is zero
            expect(await mockedUSDC.balanceOf(ERC721Facet.target)).to.equal(0)
        })

        it("Set Contract addresses", async function () {
            expect(await saltVaultBulls.usdcTokenContract()).to.equal(ethers.ZeroAddress)
            expect(await saltVaultBulls.procurementWallet()).to.equal(ethers.ZeroAddress)
            expect(await saltVaultBulls.royaltiesWallet()).to.equal(ethers.ZeroAddress)

            await saltVaultBulls.connect(owner).setContractAddresses(mockedUSDC.target, procurementWallet.address, royaltiesWallet.address)

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
            await expect(saltVaultBulls.connect(signers[10]).mint(0, signers[0].address)).to.revertedWith("Minting is not live or this rarity is sold out")
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

            // // assert paper.xyz call works
            // expect(await saltVaultBulls.checkClaimEligibility(tier, 1)).to.equal("")
        })

        it("Confirm rarity information on diamond before minting", async function () {
            console.log("rarity information of rarity(0):", await infoGetterFacet.getRarityInformationForBull(0))
            console.log("saltVaultBulls.getCostAndMintEligibility(tier)", await saltVaultBulls.getCostAndMintEligibility(0))

            expect(await saltVaultBulls.symbol()).to.equal("SVB")
        })

        it("Minting 50 Diamond Bulls", async function () {
            const tier = 0 // Assuming tier 0 is what we're testing
            const mintsPerSigner = 5 // Adjust this number based on your requirements
            const costToMintEachNFT = 2500 * 10 ** 6

            // Loop over signers[10] to signers[19]
            for (let i = 10; i <= 19; i++) {
                for (let j = 0; j < mintsPerSigner; j++) {
                    // Amount to approve (make sure this is sufficient for the mint operation)
                    const amountToApprove = await saltVaultBulls.getCostAndMintEligibility(tier)

                    // assert paper.xyz call works
                    expect(await saltVaultBulls.checkClaimEligibility(tier, 1)).to.equal("")

                    // assert paper.xyz call works
                    expect(await amountToApprove).to.equal(costToMintEachNFT)

                    // Approve the proxySVB contract to spend tokens
                    await mockedUSDC.connect(signers[i]).approve(saltVaultBulls.target, costToMintEachNFT)

                    await saltVaultBulls.connect(signers[i]).mint(tier, signers[i].address)
                }
            }
            // Approve the proxySVB contract to spend tokens
            await mockedUSDC.connect(signers[20]).approve(saltVaultBulls.target, costToMintEachNFT)
            await expect(saltVaultBulls.connect(signers[20]).mint(tier, signers[20].address)).to.be.revertedWith("Minting is not live or this rarity is sold out")

            expect(await saltVaultBulls.checkClaimEligibility(tier, 1)).to.equal("Mint is not Live or Rarity sold is out")
            expect(await saltVaultBulls.totalSupply()).to.equal(50)
            expect(await saltVaultBulls.getCostAndMintEligibility(tier)).to.equal(0)
        })

        it("Test balances after mint", async function () {
            console.log("mockedUSDC balance of p10:", await mockedUSDC.balanceOf(signers[10]))
            console.log("mockedUSDC balance of saltVaultBulls:", await mockedUSDC.balanceOf(saltVaultBulls.target))
            console.log("mockedUSDC balance of dimaond:", await mockedUSDC.balanceOf(diamondAddress))
            console.log("mockedUSDC balance of ERC721Facet:", await mockedUSDC.balanceOf(ERC721Facet.target))

            // // assert saltVaultBulls contract USDC balance is zero
            // expect(await mockedUSDC.balanceOf(mockedUSDC.target)).to.equal(0)

            // // assert diamondAddress contract USDC balance is zero
            // expect(await mockedUSDC.balanceOf(diamondAddress)).to.equal(costToMintEachNFT)

            // // assert erc721Facet contract USDC balance is zero
            // expect(await mockedUSDC.balanceOf(ERC721Facet.target)).to.equal(costToMintEachNFT)
        })

        it("Test URI of minted NFT", async function () {
            // confirm total Supply is 1

            console.log("rarity information of rarity(0):", await infoGetterFacet.getRarityInformationForBull(0))
            console.log("totalSupply:", await saltVaultBulls.totalSupply())
            console.log("walletOfOwner(p10):", await saltVaultBulls.walletOfOwner(signers[10]))
            console.log("owner of index 1:", await saltVaultBulls.ownerOf(1))
            console.log("tokenOfOwnerByIndex  (p10, 0):", await saltVaultBulls.tokenOfOwnerByIndex(signers[10], 0))
            console.log("token URI of index 1:", await saltVaultBulls.tokenURI(1))

            let rarityInfo = await infoGetterFacet.getRarityInformationForBull(0)
            let totalSupply = await saltVaultBulls.totalSupply()
            let ownerOf = await saltVaultBulls.ownerOf(1)
            let walletOfOwner = await saltVaultBulls.walletOfOwner(signers[10])
            let tokenOfOwnerByIndex = await saltVaultBulls.tokenOfOwnerByIndex(signers[10], 0)

            // expect(Number(rarityInfo[3])).to.equal(2) // current index should now be 2

            // expect(totalSupply).to.equal(1) // total supply should be 1
            // expect(walletOfOwner.length).to.equal(1)
            // expect(Number(walletOfOwner[0])).to.equal(1)
            // expect(ownerOf).to.equal(signers[10].address)

            // expect(await saltVaultBulls.tokenOfOwnerByIndex(signers[10], 0)).to.equal(1)

            // await expect(saltVaultBulls.tokenOfOwnerByIndex(signers[10], 1)).to.revertedWith("ERC721Enumerable: owner index out of bounds")
        })

        it("Test salt Wallet for the minted Bull", async function () {
            // confirm total Supply is 1

            console.log("getBullInformation(1):", await infoGetterFacet.getBullInformation(1))
            console.log("getBullInformation(2):", await infoGetterFacet.getBullInformation(2))
        })

        it("Test approval", async function () {
            // confirm total Supply is 1

            console.log("walletOfOwner(p10):", await saltVaultBulls.walletOfOwner(signers[10]))
            console.log("walletOfOwner(p11):", await saltVaultBulls.walletOfOwner(signers[11]))

            console.log("getApproved(3):", await saltVaultBulls.getApproved(3))

            expect(await saltVaultBulls.getApproved(3)).to.equal(ethers.ZeroAddress)

            await saltVaultBulls.connect(signers[10]).approve(signers[11], 3)

            console.log("getApproved(3):", await saltVaultBulls.getApproved(3))

            expect(await saltVaultBulls.getApproved(3)).to.equal(signers[11])

            console.log("getApprovalHistory() of signers[10]:", await saltVaultBulls.connect(signers[10]).getApprovalHistory())

            //

            await saltVaultBulls.connect(signers[10]).approve(signers[15], 3)

            expect(await saltVaultBulls.getApproved(3)).to.equal(signers[15])

            console.log("getApproved(3):", await saltVaultBulls.getApproved(3))

            console.log("getApprovalHistory() of signers[10]:", await saltVaultBulls.connect(signers[10]).getApprovalHistory())

            await saltVaultBulls.connect(signers[10]).approve(ethers.ZeroAddress, 3)

            expect(await saltVaultBulls.getApproved(3)).to.equal(ethers.ZeroAddress)

            console.log("getApproved(3):", await saltVaultBulls.getApproved(3))

            console.log("getApprovalHistory() of signers[10]:", await saltVaultBulls.connect(signers[10]).getApprovalHistory())

            // await saltVaultBulls.connect(signers[10]).safeTransferFrom(signers[10], signers[11], 3)

            // console.log("walletOfOwner(p10):", await saltVaultBulls.walletOfOwner(signers[10]))
            // console.log("walletOfOwner(p11):", await saltVaultBulls.walletOfOwner(signers[11]))

            // // confirm approval is now reset

            // console.log("getApproved(3):", await saltVaultBulls.getApproved(3))

            // expect(await saltVaultBulls.getApproved(3)).to.equal(ethers.ZeroAddress)
        })

        it("Test approvalForAll", async function () {
            // confirm total Supply is 1

            // console.log("walletOfOwner(p12):", await saltVaultBulls.walletOfOwner(signers[12]))
            // console.log("walletOfOwner(p13):", await saltVaultBulls.walletOfOwner(signers[13]))

            // console.log("getApproved(11):", await saltVaultBulls.getApproved(11))
            // console.log("getApproved(12):", await saltVaultBulls.getApproved(12))
            // console.log("getApproved(13):", await saltVaultBulls.getApproved(13))
            // console.log("getApproved(14):", await saltVaultBulls.getApproved(14))
            // console.log("getApproved(15):", await saltVaultBulls.getApproved(15))
            // console.log()

            // expect(await saltVaultBulls.getApproved(3)).to.equal(ethers.ZeroAddress)

            await saltVaultBulls.connect(signers[12]).setApprovalForAll(signers[13], true)

            console.log("isApprovedForAll(P12 , P11):", await saltVaultBulls.isApprovedForAll(signers[12], signers[11]))
            console.log("isApprovedForAll(P12 , P13):", await saltVaultBulls.isApprovedForAll(signers[12], signers[13]))
            console.log("isApprovedForAll(P12 , P14):", await saltVaultBulls.isApprovedForAll(signers[12], signers[14]))
            console.log("isApprovedForAll(P12 , P15):", await saltVaultBulls.isApprovedForAll(signers[12], signers[15]))
            console.log()

            console.log("getApprovalHistory() of signers[12]:", await saltVaultBulls.connect(signers[12]).getApprovalHistory())

            let approvalHistory = await saltVaultBulls.connect(signers[12]).getApprovalHistory()

            console.log("getApprovalHistory[0]", approvalHistory[0])
            console.log()
            console.log("getApprovalHistory[1][0][0]", approvalHistory[1][0][0])

            console.log("getApprovalHistory[1].length", approvalHistory[1].length)

            expect(approvalHistory[1][0][0]).to.equal(signers[13].address)
            expect(approvalHistory[1].length).to.equal(1)
            expect(await saltVaultBulls.isApprovedForAll(signers[12], signers[11])).to.equal(false)
            expect(await saltVaultBulls.isApprovedForAll(signers[12], signers[13])).to.equal(true)
            expect(await saltVaultBulls.isApprovedForAll(signers[12], signers[14])).to.equal(false)

            await saltVaultBulls.connect(signers[12]).setApprovalForAll(signers[14], true)

            console.log("isApprovedForAll(P12 , P11):", await saltVaultBulls.isApprovedForAll(signers[12], signers[11]))
            console.log("isApprovedForAll(P12 , P13):", await saltVaultBulls.isApprovedForAll(signers[12], signers[13]))
            console.log("isApprovedForAll(P12 , P14):", await saltVaultBulls.isApprovedForAll(signers[12], signers[14]))
            console.log("isApprovedForAll(P12 , P15):", await saltVaultBulls.isApprovedForAll(signers[12], signers[15]))
            console.log()

            console.log("getApprovalHistory() of signers[12]:", await saltVaultBulls.connect(signers[12]).getApprovalHistory())

            approvalHistory = await saltVaultBulls.connect(signers[12]).getApprovalHistory()

            console.log("getApprovalHistory[0]", approvalHistory[0])
            console.log()
            console.log("getApprovalHistory[1][0][0]", approvalHistory[1][0][0])

            console.log("getApprovalHistory[1].length", approvalHistory[1].length)

            expect(approvalHistory[1][0][0]).to.equal(signers[13].address)
            expect(approvalHistory[1][1][0]).to.equal(signers[14].address)
            expect(approvalHistory[1].length).to.equal(2)
            expect(await saltVaultBulls.isApprovedForAll(signers[12], signers[11])).to.equal(false)
            expect(await saltVaultBulls.isApprovedForAll(signers[12], signers[13])).to.equal(true)
            expect(await saltVaultBulls.isApprovedForAll(signers[12], signers[14])).to.equal(true)
            expect(await saltVaultBulls.isApprovedForAll(signers[12], signers[15])).to.equal(false)

            await saltVaultBulls.connect(signers[12]).setApprovalForAll(signers[15], true)

            console.log("isApprovedForAll(P12 , P11):", await saltVaultBulls.isApprovedForAll(signers[12], signers[11]))
            console.log("isApprovedForAll(P12 , P13):", await saltVaultBulls.isApprovedForAll(signers[12], signers[13]))
            console.log("isApprovedForAll(P12 , P14):", await saltVaultBulls.isApprovedForAll(signers[12], signers[14]))
            console.log("isApprovedForAll(P12 , P15):", await saltVaultBulls.isApprovedForAll(signers[12], signers[15]))
            console.log()

            console.log("getApprovalHistory() of signers[12]:", await saltVaultBulls.connect(signers[12]).getApprovalHistory())

            approvalHistory = await saltVaultBulls.connect(signers[12]).getApprovalHistory()

            expect(approvalHistory[1][0][0]).to.equal(signers[13].address)
            expect(approvalHistory[1][1][0]).to.equal(signers[14].address)
            expect(approvalHistory[1][2][0]).to.equal(signers[15].address)
            expect(approvalHistory[1].length).to.equal(3)
            expect(await saltVaultBulls.isApprovedForAll(signers[12], signers[11])).to.equal(false)
            expect(await saltVaultBulls.isApprovedForAll(signers[12], signers[13])).to.equal(true)
            expect(await saltVaultBulls.isApprovedForAll(signers[12], signers[14])).to.equal(true)
            expect(await saltVaultBulls.isApprovedForAll(signers[12], signers[15])).to.equal(true)

            await saltVaultBulls.connect(signers[12]).setApprovalForAll(signers[14], false)

            console.log("isApprovedForAll(P12 , P11):", await saltVaultBulls.isApprovedForAll(signers[12], signers[11]))
            console.log("isApprovedForAll(P12 , P13):", await saltVaultBulls.isApprovedForAll(signers[12], signers[13]))
            console.log("isApprovedForAll(P12 , P14):", await saltVaultBulls.isApprovedForAll(signers[12], signers[14]))
            console.log("isApprovedForAll(P12 , P15):", await saltVaultBulls.isApprovedForAll(signers[12], signers[15]))
            console.log()

            console.log("getApprovalHistory() of signers[12]:", await saltVaultBulls.connect(signers[12]).getApprovalHistory())

            approvalHistory = await saltVaultBulls.connect(signers[12]).getApprovalHistory()

            console.log("getApprovalHistory[0]", approvalHistory[0])
            console.log()
            console.log("getApprovalHistory[1][0][0]", approvalHistory[1][0][0])

            console.log("getApprovalHistory[1].length", approvalHistory[1].length)

            expect(approvalHistory[1][0][0]).to.equal(signers[13].address)
            expect(approvalHistory[1][1][0]).to.equal(signers[15].address)
            expect(approvalHistory[1].length).to.equal(2)
            expect(await saltVaultBulls.isApprovedForAll(signers[12], signers[11])).to.equal(false)
            expect(await saltVaultBulls.isApprovedForAll(signers[12], signers[13])).to.equal(true)
            expect(await saltVaultBulls.isApprovedForAll(signers[12], signers[14])).to.equal(false)
            expect(await saltVaultBulls.isApprovedForAll(signers[12], signers[15])).to.equal(true)

            await saltVaultBulls.connect(signers[12]).setApprovalForAll(signers[13], false)

            console.log("isApprovedForAll(P12 , P11):", await saltVaultBulls.isApprovedForAll(signers[12], signers[11]))
            console.log("isApprovedForAll(P12 , P13):", await saltVaultBulls.isApprovedForAll(signers[12], signers[13]))
            console.log("isApprovedForAll(P12 , P14):", await saltVaultBulls.isApprovedForAll(signers[12], signers[14]))
            console.log("isApprovedForAll(P12 , P15):", await saltVaultBulls.isApprovedForAll(signers[12], signers[15]))
            console.log()

            console.log("getApprovalHistory() of signers[12]:", await saltVaultBulls.connect(signers[12]).getApprovalHistory())

            approvalHistory = await saltVaultBulls.connect(signers[12]).getApprovalHistory()

            console.log("getApprovalHistory[0]", approvalHistory[0])
            console.log()
            console.log("getApprovalHistory[1][0][0]", approvalHistory[1][0][0])

            console.log("getApprovalHistory[1].length", approvalHistory[1].length)

            expect(approvalHistory[1][0][0]).to.equal(signers[15].address)

            expect(approvalHistory[1].length).to.equal(1)
            expect(await saltVaultBulls.isApprovedForAll(signers[12], signers[11])).to.equal(false)
            expect(await saltVaultBulls.isApprovedForAll(signers[12], signers[13])).to.equal(false)
            expect(await saltVaultBulls.isApprovedForAll(signers[12], signers[14])).to.equal(false)
            expect(await saltVaultBulls.isApprovedForAll(signers[12], signers[15])).to.equal(true)

            await saltVaultBulls.connect(signers[12]).setApprovalForAll(signers[15], false)

            console.log("isApprovedForAll(P12 , P11):", await saltVaultBulls.isApprovedForAll(signers[12], signers[11]))
            console.log("isApprovedForAll(P12 , P13):", await saltVaultBulls.isApprovedForAll(signers[12], signers[13]))
            console.log("isApprovedForAll(P12 , P14):", await saltVaultBulls.isApprovedForAll(signers[12], signers[14]))
            console.log("isApprovedForAll(P12 , P15):", await saltVaultBulls.isApprovedForAll(signers[12], signers[15]))
            console.log()

            console.log("getApprovalHistory() of signers[12]:", await saltVaultBulls.connect(signers[12]).getApprovalHistory())

            approvalHistory = await saltVaultBulls.connect(signers[12]).getApprovalHistory()

            expect(approvalHistory[1].length).to.equal(0)
            expect(await saltVaultBulls.isApprovedForAll(signers[12], signers[11])).to.equal(false)
            expect(await saltVaultBulls.isApprovedForAll(signers[12], signers[13])).to.equal(false)
            expect(await saltVaultBulls.isApprovedForAll(signers[12], signers[14])).to.equal(false)
            expect(await saltVaultBulls.isApprovedForAll(signers[12], signers[15])).to.equal(false)
        })

        it("transfer NFT", async function () {
            // confirm total Supply is 1

            console.log("getApproved(26):", await saltVaultBulls.getApproved(26))

            expect(await saltVaultBulls.getApproved(26)).to.equal(ethers.ZeroAddress)

            console.log("walletOfOwner(p15):", await saltVaultBulls.walletOfOwner(signers[15]))

            expect(await saltVaultBulls.ownerOf(26)).to.equal(signers[15])

            await saltVaultBulls.connect(signers[15]).approve(signers[16], 26)

            console.log("getApprovalHistory() of signers[15]:", await saltVaultBulls.connect(signers[15]).getApprovalHistory())
            console.log("getApprovalHistory() of signers[16]:", await saltVaultBulls.connect(signers[16]).getApprovalHistory())
            console.log("getApprovalHistory() of signers[17]:", await saltVaultBulls.connect(signers[17]).getApprovalHistory())
            console.log("getApproved(26):", await saltVaultBulls.getApproved(26))
            expect(await saltVaultBulls.getApproved(26)).to.equal(signers[16])

            let approvalHistory = await saltVaultBulls.connect(signers[15]).getApprovalHistory()

            expect(approvalHistory[0].length).to.equal(1)
            expect(approvalHistory[0][0][1]).to.equal(signers[16].address)

            approvalHistory = await saltVaultBulls.connect(signers[16]).getApprovalHistory()
            expect(approvalHistory[0].length).to.equal(0)

            approvalHistory = await saltVaultBulls.connect(signers[17]).getApprovalHistory()
            expect(approvalHistory[0].length).to.equal(0)

            // transfer NFT 26 to signers[17]
            await saltVaultBulls.connect(signers[15]).safeTransferFrom(signers[15], signers[17], 26)

            expect(await saltVaultBulls.ownerOf(26)).to.equal(signers[17])

            console.log("getApprovalHistory() of signers[15]:", await saltVaultBulls.connect(signers[15]).getApprovalHistory())
            console.log("getApprovalHistory() of signers[16]:", await saltVaultBulls.connect(signers[16]).getApprovalHistory())
            console.log("getApprovalHistory() of signers[17]:", await saltVaultBulls.connect(signers[17]).getApprovalHistory())
            console.log("getApproved(26):", await saltVaultBulls.getApproved(26))
            expect(await saltVaultBulls.getApproved(26)).to.equal(ethers.ZeroAddress)

            approvalHistory = await saltVaultBulls.connect(signers[15]).getApprovalHistory()

            expect(approvalHistory[0].length).to.equal(0)

            approvalHistory = await saltVaultBulls.connect(signers[16]).getApprovalHistory()
            expect(approvalHistory[0].length).to.equal(0)

            approvalHistory = await saltVaultBulls.connect(signers[17]).getApprovalHistory()
            expect(approvalHistory[0].length).to.equal(0)

            //

            // await saltVaultBulls.connect(signers[15]).approve(signers[15], 3)

            // expect(await saltVaultBulls.getApproved(3)).to.equal(signers[15])

            // console.log("getApproved(3):", await saltVaultBulls.getApproved(3))

            // console.log("getApprovalHistory() of signers[10]:", await saltVaultBulls.connect(signers[10]).getApprovalHistory())

            // await saltVaultBulls.connect(signers[10]).approve(ethers.ZeroAddress, 3)

            // expect(await saltVaultBulls.getApproved(3)).to.equal(ethers.ZeroAddress)

            // console.log("getApproved(3):", await saltVaultBulls.getApproved(3))

            // console.log("getApprovalHistory() of signers[10]:", await saltVaultBulls.connect(signers[10]).getApprovalHistory())
        })
    })
})
