// /* global describe it before ethers */

// import { getSelectors, FacetCutAction, removeSelectors, findAddressPositionInFacets } from "../../../scripts/diamond"
// import { deploy } from "../../../scripts/deploy"
// import { assert, expect } from "chai"
// import { ethers, network } from "hardhat"
// import { Contract } from "ethers"
// import { Network } from "@ethersproject/providers"

// describe("Gem Token Challenge Test", async function () {
//     this.timeout(60000) // Set timeout to 60 seconds

//     let diamondAddress: string
//     let diamondCutFacet: Contract
//     let diamondLoupeFacet: Contract
//     let ownershipFacet: Contract
//     let tx
//     let receipt
//     let result
//     const addresses: string[] = []
//     const expectedSymbol: string = "SVB"
//     const expectedName: string = "Salt Vault Bulls"
//     const data = "0x42"

//     let snapshotId: Network

//     let erc721Facet: Contract
//     let saltRepositoryFacet: Contract
//     let infoGetterFacet: Contract
//     let adminSetterFacet: Contract
//     let saltVaultBulls: Contract
//     let svbGemTokens: Contract
//     let mockedERC721Enumerable: Contract
//     let mockedUSDC: Contract
//     let saltVaultToken: any
//     let gemTokenChallengeFacet: any

//     let gemTokenBurnWallet: any
//     let bankFacet: any

//     let owner: any
//     let newOwner: any
//     let approved: any
//     let operator: any
//     let coreTeamWallet: any
//     let royaltiesWallet: any
//     let procurementWallet: any
//     let badActorWallet: any
//     let mockedExchange: any
//     let fee_receiver_wallet: any
//     let signers: any

//     let totalMintedUSDCamount: any

//     const TokenData = [
//         [1, 225, 1], // 225 tokens
//         [226, 445, 2], // 220 tokens
//         [446, 660, 3], // 215 tokens
//         [661, 870, 4], // 210 tokens
//         [871, 1075, 5], // 205 tokens
//         [1076, 1275, 10], // 200 tokens
//         [1276, 1470, 50], // 195 tokens
//         [1471, 1660, 100], // 190 tokens
//         [1661, 1845, 500], // 185 tokens
//         [1846, 2025, 1000], // 180 tokens
//         [2026, 2200, 5000], // 175 tokens
//         [2201, 2370, 10000], // 170 tokens
//         [2371, 2500, 50000], // 130 tokens
//         [2501, 2725, 1], // 225 tokens
//         [2726, 2945, 2], // 220 tokens
//         [2946, 3160, 3], // 215 tokens
//         [3161, 3370, 4], // 210 tokens
//         [3371, 3575, 5], // 205 tokens
//         [3576, 3775, 10], // 200 tokens
//         [3776, 3970, 50], // 195 tokens
//         [3971, 4160, 100], // 190 tokens
//         [4161, 4345, 500], // 185 tokens
//         [4346, 4525, 1000], // 180 tokens
//         [4526, 4700, 5000], // 175 tokens
//         [4701, 4870, 10000], // 170 tokens
//         [4871, 5000, 50000], // 130 tokens
//         [5001, 5225, 1], // 225 tokens
//         [5226, 5445, 2], // 220 tokens
//         [5446, 5660, 3], // 215 tokens
//         [5661, 5870, 4], // 210 tokens
//         [5871, 6075, 5], // 205 tokens
//         [6076, 6275, 10], // 200 tokens
//         [6276, 6470, 50], // 195 tokens
//         [6471, 6660, 100], // 190 tokens
//         [6661, 6845, 500], // 185 tokens
//         [6846, 7025, 1000], // 180 tokens
//         [7026, 7200, 5000], // 175 tokens
//         [7201, 7370, 10000], // 170 tokens
//         [7371, 7500, 50000], // 130 tokens
//         [7501, 7725, 1], // 225 tokens
//         [7726, 7945, 2], // 220 tokens
//         [7946, 8160, 3], // 215 tokens
//         [8161, 8370, 4], // 210 tokens
//         [8371, 8575, 5], // 205 tokens
//         [8576, 8775, 10], // 200 tokens
//         [8776, 8970, 50], // 195 tokens
//         [8971, 9160, 100], // 190 tokens
//         [9161, 9345, 500], // 185 tokens
//         [9346, 9525, 1000], // 180 tokens
//         [9526, 9700, 5000], // 175 tokens
//         [9701, 9870, 10000], // 170 tokens
//         [9871, 10000, 50000], // 130 tokens
//     ]

//     function calculateTokenValue(tokenIndices: number[], tokenData: [number, number, number][], primaryColor: string): [number, number] {
//         let primaryColorTotalValue = 0
//         let totalValue = 0

//         for (const index of tokenIndices) {
//             for (const data of tokenData) {
//                 if (data[0] <= index && index <= data[1]) {
//                     totalValue += data[2]

//                     if (index <= 2500 && primaryColor === "Red") {
//                         primaryColorTotalValue += data[2]
//                     } else if (index > 2500 && index <= 5000 && primaryColor === "Yellow") {
//                         primaryColorTotalValue += data[2]
//                     } else if (index > 5000 && index <= 7500 && primaryColor === "Green") {
//                         primaryColorTotalValue += data[2]
//                     } else if (index > 7500 && index <= 10000 && primaryColor === "Blue") {
//                         primaryColorTotalValue += data[2]
//                     }
//                     break
//                 }
//             }
//         }

//         return [primaryColorTotalValue, totalValue]
//     }

//     before(async function () {
//         diamondAddress = await deploy()
//         console.log({ diamondAddress })
//         diamondCutFacet = await ethers.getContractAt("DiamondCutFacet", diamondAddress)
//         diamondLoupeFacet = await ethers.getContractAt("DiamondLoupeFacet", diamondAddress)
//         ownershipFacet = await ethers.getContractAt("OwnershipFacet", diamondAddress)
//         erc721Facet = await ethers.getContractAt("ERC721Facet", diamondAddress)
//         saltRepositoryFacet = await ethers.getContractAt("SaltRepositoryFacet", diamondAddress)
//         infoGetterFacet = await ethers.getContractAt("InfoGetterFacet", diamondAddress)
//         adminSetterFacet = await ethers.getContractAt("AdminSetterFacet", diamondAddress)
//         gemTokenChallengeFacet = await ethers.getContractAt("GemTokenChallengeFacet", diamondAddress)
//         bankFacet = await ethers.getContractAt("BankFacet", diamondAddress)

//         // Get a list of available signers
//         signers = await ethers.getSigners()

//         owner = signers[0]
//         newOwner = signers[1]
//         approved = signers[2]
//         operator = signers[3]

//         coreTeamWallet = signers[5]
//         royaltiesWallet = signers[6]
//         procurementWallet = signers[7]
//         fee_receiver_wallet = signers[8]
//         gemTokenBurnWallet = signers[9]
//         mockedExchange = signers[30]

//         // SaltVaultToken
//         const SaltVaultToken = await ethers.getContractFactory("SaltVaultToken")
//         saltVaultToken = await SaltVaultToken.deploy()
//         await saltVaultToken.waitForDeployment()

//         // MockedUSDC
//         const MockedUSDC = await ethers.getContractFactory("MockedUSDC", signers[30])
//         mockedUSDC = await MockedUSDC.deploy(100000000 * 10 ** 6)
//         await mockedUSDC.waitForDeployment()

//         // set contract address on the diamond
//         await adminSetterFacet
//             .connect(signers[0])
//             .setAddresses(mockedUSDC.target, saltVaultToken.target, coreTeamWallet.address, royaltiesWallet.address, procurementWallet.address, gemTokenBurnWallet.address)

//         // ERC721 External  Salt Vault Bulls
//         const SaltVaultBulls = await ethers.getContractFactory("SaltVaultBulls")
//         saltVaultBulls = await SaltVaultBulls.deploy(diamondAddress)
//         await saltVaultBulls.waitForDeployment()

//         // ERC721 External  Salt Vault Bulls
//         const SVB_GemTokens = await ethers.getContractFactory("SVB_GemTokens")
//         svbGemTokens = await SVB_GemTokens.deploy(diamondAddress)
//         await svbGemTokens.waitForDeployment()

//         // Transfer tokens from signers[30] to signers[1] through signers[17]
//         const amount = ethers.parseUnits("10000", 6) // Assuming MockedUSDC uses 6 decimal places

//         for (let i = 10; i <= 20; i++) {
//             await mockedUSDC.connect(signers[30]).transfer(signers[i].address, amount)
//         }

//         await mockedUSDC.connect(signers[30]).transfer(owner.address, amount)

//         // gemTokenChallengeFacet

//         // let shuffledIndices = [
//         //     67, 8480, 717, 4045, 9716, 4035, 1138, 1078, 6633, 8277, 689, 1069, 8880, 8129, 3274, 7449, 7707, 3916, 8382, 3639, 999, 9, 2000, 2201, 2422, 807, 7712, 1693, 9080, 5844,
//         // ]

//         let shuffledIndices_1 = [900, 1100, 2000, 500, 1500] // 5 + 10 + 1000 + 3 + 100
//         let shuffledIndices_2 = [910, 1110, 2010, 510, 1510] // 5 + 10 + 1000 + 3 + 100
//         let shuffledIndices_3 = [2020, 8480, 717, 4045, 9716]
//         let shuffledIndices_4 = [3274, 7449, 7707, 3916, 8382]
//         let shuffledIndices_5 = [2422, 807, 7712, 1693, 9080, 5844]
//         let shuffledIndices_6 = [4422, 4807, 4712, 7693, 8080, 6844]

//         await gemTokenChallengeFacet.connect(owner).addShuffledIndexesBatch(shuffledIndices_1)
//         await gemTokenChallengeFacet.connect(owner).addShuffledIndexesBatch(shuffledIndices_2)
//         await gemTokenChallengeFacet.connect(owner).addShuffledIndexesBatch(shuffledIndices_3)
//         await gemTokenChallengeFacet.connect(owner).addShuffledIndexesBatch(shuffledIndices_4)
//         await gemTokenChallengeFacet.connect(owner).addShuffledIndexesBatch(shuffledIndices_5)
//         await gemTokenChallengeFacet.connect(owner).addShuffledIndexesBatch(shuffledIndices_6)

//         let redTokenData = [
//             [1, 225, 1], // 225 tokens
//             [226, 445, 2], // 220 tokens
//             [446, 660, 3], // 215 tokens
//             [661, 870, 4], // 210 tokens
//             [871, 1075, 5], // 205 tokens
//             [1076, 1275, 10], // 200 tokens
//             [1276, 1470, 50], // 195 tokens
//             [1471, 1660, 100], // 190 tokens
//             [1661, 1845, 500], //185 tokens
//             [1846, 2025, 1000], // 180 tokens
//             [2026, 2200, 5000], // 175 tokens
//             [2201, 2370, 10000], // 170 tokens
//             [2371, 2500, 50000], // 130 tokens
//         ]

//         // gemTokenChallengeFacet.setSingleToken()

//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(1, 225, 1, "Red")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(226, 445, 2, "Red")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(446, 660, 3, "Red")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(661, 870, 4, "Red")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(871, 1075, 5, "Red")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(1076, 1275, 10, "Red")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(1276, 1470, 50, "Red")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(1471, 1660, 100, "Red")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(1661, 1845, 500, "Red")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(1846, 2025, 1000, "Red")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(2026, 2200, 5000, "Red")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(2201, 2370, 10000, "Red")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(2371, 2500, 50000, "Red")

//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(2501, 2725, 1, "Yellow")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(2726, 2945, 2, "Yellow")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(2946, 3160, 3, "Yellow")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(3161, 3370, 4, "Yellow")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(3371, 3575, 5, "Yellow")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(3576, 3775, 10, "Yellow")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(3776, 3970, 50, "Yellow")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(3971, 4160, 100, "Yellow")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(4161, 4345, 500, "Yellow")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(4346, 4525, 1000, "Yellow")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(4526, 4700, 5000, "Yellow")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(4701, 4870, 10000, "Yellow")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(4871, 5000, 50000, "Yellow")

//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(5001, 5225, 1, "Green")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(5226, 5445, 2, "Green")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(5446, 5660, 3, "Green")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(5661, 5870, 4, "Green")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(5871, 6075, 5, "Green")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(6076, 6275, 10, "Green")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(6276, 6470, 50, "Green")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(6471, 6660, 100, "Green")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(6661, 6845, 500, "Green")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(6846, 7025, 1000, "Green")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(7026, 7200, 5000, "Green")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(7201, 7370, 10000, "Green")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(7371, 7500, 50000, "Green")

//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(7501, 7725, 1, "Blue")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(7726, 7945, 2, "Blue")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(7946, 8160, 3, "Blue")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(8161, 8370, 4, "Blue")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(8371, 8575, 5, "Blue")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(8576, 8775, 10, "Blue")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(8776, 8970, 50, "Blue")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(8971, 9160, 100, "Blue")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(9161, 9345, 500, "Blue")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(9346, 9525, 1000, "Blue")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(9526, 9700, 5000, "Blue")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(9701, 9870, 10000, "Blue")
//         await gemTokenChallengeFacet.connect(owner).bulkPopulateTokens(9871, 10000, 50000, "Blue")
//         console.log(" 194 getCurrentGemTokenRewardBalance:", Number(await gemTokenChallengeFacet.getCurrentGemTokenRewardBalance()) / 10 ** 6)
//     })

//     describe("Confirm Deployment is correct", async function () {
//         it("should have seven facets -- call to facetAddresses function", async () => {
//             for (const address of await diamondLoupeFacet.facetAddresses()) {
//                 addresses.push(address)
//             }
//             console.log({ addresses })
//             assert.equal(addresses.length, 9)
//         })

//         it("Test p10 has 10,000 mocked USDC and contracts have zero", async function () {
//             expect(await mockedUSDC.balanceOf(signers[10])).to.equal(10_000 * 10 ** 6)

//             // assert saltVaultBulls contract USDC balance is zero
//             expect(await mockedUSDC.balanceOf(mockedUSDC.target)).to.equal(0)

//             // assert diamondAddress contract USDC balance is zero
//             expect(await mockedUSDC.balanceOf(diamondAddress)).to.equal(0)

//             // assert erc721Facet contract USDC balance is zero
//             expect(await mockedUSDC.balanceOf(saltVaultBulls.target)).to.equal(0)
//         })

//         it("Confirm Contract addresses", async function () {
//             expect(await saltVaultBulls.usdcTokenContract()).to.equal(mockedUSDC.target)
//             expect(await saltVaultBulls.diamondAddress()).to.equal(diamondAddress)
//             expect(await saltVaultBulls.procurementWallet()).to.equal(procurementWallet.address)
//             expect(await saltVaultBulls.royaltiesWallet()).to.equal(royaltiesWallet.address)
//         })

//         it("Confirm Salt Vault Bulls External Contract is set on the diamond", async function () {
//             expect(await saltVaultBulls.isContractApprovedToMint()).to.equal(false)

//             await adminSetterFacet.setAuthorizeExternalContractsForERC721Facet(saltVaultBulls.target, true)

//             expect(await saltVaultBulls.isContractApprovedToMint()).to.equal(true)
//         })

//         it("Set external ERC721 contract to mint Bulls on the ERC721Facet", async function () {
//             expect(await saltVaultBulls.name()).to.equal("Salt Vault Bulls")
//             expect(await saltVaultBulls.symbol()).to.equal("SVB")
//         })

//         it("Confirm minting is not allowed while flag is false", async function () {
//             await expect(saltVaultBulls.connect(signers[10]).mint(0, signers[10].address)).to.revertedWith("Minting is not live or this rarity is sold out")
//         })

//         it("Change minting Status to live", async function () {
//             expect(await saltVaultBulls.getCostAndMintEligibility(0)).to.equal(0) // should return zero when set to false
//             expect(await saltVaultBulls.isMintingLive()).to.equal(false)
//             expect(await saltVaultBulls.checkClaimEligibility(0, 1)).to.equal("Mint is not Live or Rarity sold is out")
//             expect(await saltVaultBulls.checkClaimEligibility(1, 1)).to.equal("Mint is not Live or Rarity sold is out")
//             expect(await saltVaultBulls.checkClaimEligibility(2, 1)).to.equal("Mint is not Live or Rarity sold is out")
//             expect(await saltVaultBulls.checkClaimEligibility(3, 1)).to.equal("Mint is not Live or Rarity sold is out")
//             expect(await saltVaultBulls.checkClaimEligibility(4, 1)).to.equal("Mint is not Live or Rarity sold is out")
//             expect(await saltVaultBulls.checkClaimEligibility(5, 1)).to.equal("Mint is not Live or Rarity sold is out")
//             expect(await saltVaultBulls.checkClaimEligibility(6, 1)).to.equal("Mint is not Live or Rarity sold is out")
//             expect(await saltVaultBulls.checkClaimEligibility(0, 2)).to.equal("Only 1 mint per tx")
//             expect(await saltVaultBulls.checkClaimEligibility(1, 2)).to.equal("Only 1 mint per tx")
//             expect(await saltVaultBulls.checkClaimEligibility(2, 2)).to.equal("Only 1 mint per tx")
//             expect(await saltVaultBulls.checkClaimEligibility(3, 2)).to.equal("Only 1 mint per tx")
//             expect(await saltVaultBulls.checkClaimEligibility(4, 2)).to.equal("Only 1 mint per tx")
//             expect(await saltVaultBulls.checkClaimEligibility(5, 2)).to.equal("Only 1 mint per tx")
//             expect(await saltVaultBulls.checkClaimEligibility(6, 2)).to.equal("Only 1 mint per tx")

//             await saltVaultBulls.connect(owner).setMintingLive(true)

//             expect(await saltVaultBulls.getCostAndMintEligibility(0)).to.equal(2500 * 10 ** 6) // should return zero when set to false
//             expect(await saltVaultBulls.getCostAndMintEligibility(1)).to.equal(1000 * 10 ** 6) // should return zero when set to false
//             expect(await saltVaultBulls.getCostAndMintEligibility(2)).to.equal(750 * 10 ** 6) // should return zero when set to false
//             expect(await saltVaultBulls.getCostAndMintEligibility(3)).to.equal(500 * 10 ** 6) // should return zero when set to false
//             expect(await saltVaultBulls.getCostAndMintEligibility(4)).to.equal(350 * 10 ** 6) // should return zero when set to false
//             expect(await saltVaultBulls.getCostAndMintEligibility(5)).to.equal(200 * 10 ** 6) // should return zero when set to false
//             expect(await saltVaultBulls.getCostAndMintEligibility(6)).to.equal(100 * 10 ** 6) // should return zero when set to false

//             expect(await saltVaultBulls.isMintingLive()).to.equal(true)
//             expect(await saltVaultBulls.checkClaimEligibility(0, 1)).to.equal("")
//             expect(await saltVaultBulls.checkClaimEligibility(1, 1)).to.equal("")
//             expect(await saltVaultBulls.checkClaimEligibility(2, 1)).to.equal("")
//             expect(await saltVaultBulls.checkClaimEligibility(3, 1)).to.equal("")
//             expect(await saltVaultBulls.checkClaimEligibility(4, 1)).to.equal("")
//             expect(await saltVaultBulls.checkClaimEligibility(5, 1)).to.equal("")
//             expect(await saltVaultBulls.checkClaimEligibility(6, 1)).to.equal("")
//         })
//     })

//     describe("Gem Tokens", function () {
//         it("Confirm Gem Token External Contract is set on the diamond", async function () {
//             expect(await svbGemTokens.isContractApprovedToMint()).to.equal(false)

//             await adminSetterFacet.setAuthorizeExternalContractsForERC721Facet(svbGemTokens.target, true)

//             expect(await svbGemTokens.isContractApprovedToMint()).to.equal(true)
//         })

//         it("set mintingLive for GemTokens", async function () {
//             expect(await svbGemTokens.isMintingLive()).to.equal(false)

//             expect(await svbGemTokens.checkClaimEligibility(1)).to.equal("Mint is not Live or Gem Tokens are sold out")
//             expect(await svbGemTokens.checkClaimEligibility(3)).to.equal("Mint is not Live or Gem Tokens are sold out")
//             expect(await svbGemTokens.checkClaimEligibility(6)).to.equal("Mint is not Live or Gem Tokens are sold out")
//             expect(await svbGemTokens.checkClaimEligibility(9)).to.equal("Mint is not Live or Gem Tokens are sold out")
//             expect(await svbGemTokens.checkClaimEligibility(12)).to.equal("Mint is not Live or Gem Tokens are sold out")
//             expect(await svbGemTokens.checkClaimEligibility(15)).to.equal("Mint is not Live or Gem Tokens are sold out")

//             expect(await svbGemTokens.getCostAndMintEligibility(1)).to.equal(0) // should return zero when set to false

//             await svbGemTokens.connect(owner).setMintingLive(true)

//             expect(await svbGemTokens.getCostAndMintEligibility(1)).to.equal(15 * 10 ** 6) // should return zero when set to false

//             expect(await svbGemTokens.checkClaimEligibility(1)).to.equal("")
//             expect(await svbGemTokens.checkClaimEligibility(3)).to.equal("")
//             expect(await svbGemTokens.checkClaimEligibility(6)).to.equal("")
//             expect(await svbGemTokens.checkClaimEligibility(9)).to.equal("")
//             expect(await svbGemTokens.checkClaimEligibility(12)).to.equal("")
//             expect(await svbGemTokens.checkClaimEligibility(15)).to.equal("")

//             expect(await svbGemTokens.isMintingLive()).to.equal(true)
//         })

//         it("gem Token Price is returned correctly", async function () {
//             let returnedCost = await svbGemTokens.getCostAndMintEligibility(1)
//             assert.equal(returnedCost, 15 * 10 ** 6)

//             returnedCost = await svbGemTokens.getCostAndMintEligibility(2)
//             assert.equal(returnedCost, 30 * 10 ** 6)

//             returnedCost = await svbGemTokens.getCostAndMintEligibility(10)
//             assert.equal(returnedCost, 150 * 10 ** 6)

//             returnedCost = await svbGemTokens.getCostAndMintEligibility(15)
//             assert.equal(returnedCost, 15 * 15 * 10 ** 6)

//             returnedCost = await svbGemTokens.getCostAndMintEligibility(20)
//             assert.equal(returnedCost, 20 * 15 * 10 ** 6)
//         })

//         it("gem Token price reverts when quantity is more than 10", async function () {
//             await expect(svbGemTokens.getCostAndMintEligibility(21)).to.revertedWith("20 of less mints per tx only")
//         })

//         it("gem Token price reverts when quantity is zero", async function () {
//             await expect(svbGemTokens.getCostAndMintEligibility(0)).to.revertedWith("quantity can't be zero")
//         })

//         it("confirm freeMints for the owner are correct", async function () {
//             let totalFreeMintForPerson = await svbGemTokens.connect(signers[10]).getAvailableFreeGemStoneMints()
//             console.log("total Free mints:", totalFreeMintForPerson)
//         })
//     })

//     describe("Set game up and accounts", function () {
//         it("active Salt Vault Token", async function () {
//             await saltVaultToken.connect(owner).setUnderlyingToken(mockedUSDC.target)

//             await saltVaultToken.connect(owner).setFeeReceiver(fee_receiver_wallet.address)

//             await saltVaultToken.connect(owner).setApprovedCallerRole(diamondAddress, true)

//             await saltVaultToken.connect(owner).setTransferFeeExempt(diamondAddress, true)

//             await saltVaultToken.connect(owner).setCustomFee([owner, diamondAddress], [100000, 100000])

//             await saltVaultToken.connect(owner).setSaltVaultBullsAddress(diamondAddress)

//             await saltVaultToken.connect(owner).activateToken(true)

//             expect(await saltVaultToken.tokenActivated()).to.equal(true)
//         })

//         it("SVT balances should be zero", async function () {
//             expect(await saltVaultToken.balanceOf(owner)).to.equal(0)
//             expect(await saltVaultToken.balanceOf(diamondAddress)).to.equal(0)
//             expect(await gemTokenChallengeFacet.getCurrentGemTokenRewardBalance()).to.equal(0)
//             expect(await mockedUSDC.balanceOf(owner)).to.equal(10000 * 10 ** 6)
//         })

//         it("owner mints 1000 SVT tokens to deposit for the Gem Token Game", async function () {
//             let amount = 1000 * 10 ** 6

//             mockedUSDC.connect(owner).approve(saltVaultToken.target, amount)

//             let mockedUsdcBalance = await mockedUSDC.balanceOf(owner)
//             let saltVaultTokenBalance = await saltVaultToken.balanceOf(owner)

//             console.log("mockedUSDC balance:", Number(mockedUsdcBalance) / 10 ** 6)
//             console.log("saltVaultTokenBalance balance:", Number(saltVaultTokenBalance) / 10 ** 6)

//             await saltVaultToken.connect(owner).mintWithBacking(amount)

//             mockedUsdcBalance = await mockedUSDC.balanceOf(owner)
//             saltVaultTokenBalance = await saltVaultToken.balanceOf(owner)

//             console.log("mockedUSDC balance:", Number(mockedUsdcBalance) / 10 ** 6)
//             console.log("saltVaultTokenBalance balance:", Number(saltVaultTokenBalance) / 10 ** 6)
//         })

//         it("owner deposits 1000 SVT tokens for Gem Token Rewards", async function () {
//             expect(await saltVaultToken.balanceOf(owner)).to.equal(1000 * 10 ** 6)
//             expect(await saltVaultToken.balanceOf(diamondAddress)).to.equal(0)
//             expect(await gemTokenChallengeFacet.getCurrentGemTokenRewardBalance()).to.equal(0)
//             expect(await mockedUSDC.balanceOf(owner)).to.equal(9000 * 10 ** 6)

//             await saltVaultToken.connect(owner).approve(diamondAddress, 1000 * 10 ** 6)
//             await gemTokenChallengeFacet.connect(owner).depositRewardsForGame(1000 * 10 ** 6)

//             expect(await saltVaultToken.balanceOf(owner)).to.equal(0)
//             expect(await saltVaultToken.balanceOf(diamondAddress)).to.equal(1000 * 10 ** 6)
//             expect(await gemTokenChallengeFacet.getCurrentGemTokenRewardBalance()).to.equal(1000 * 10 ** 6)
//             expect(await mockedUSDC.balanceOf(owner)).to.equal(9000 * 10 ** 6)
//         })

//         it("all reward accounts are zero for signers[10] - signers[15]", async function () {
//             console.log("rewardBalance_p10: ", await bankFacet.connect(signers[10]).getRewardsBalance())

//             expect(await bankFacet.connect(signers[10]).getRewardsBalance()).to.equal(0)
//             expect(await bankFacet.connect(signers[11]).getRewardsBalance()).to.equal(0)
//             expect(await bankFacet.connect(signers[12]).getRewardsBalance()).to.equal(0)
//             expect(await bankFacet.connect(signers[13]).getRewardsBalance()).to.equal(0)
//             expect(await bankFacet.connect(signers[14]).getRewardsBalance()).to.equal(0)
//             expect(await bankFacet.connect(signers[15]).getRewardsBalance()).to.equal(0)

//             console.log("p10 gem Tokens: ", await svbGemTokens.walletOfOwner(signers[10]))
//         })

//         it("let signers[10] through signers[15] each need to mint gem Tokens", async function () {
//             console.log("p10 gem Tokens: ", await svbGemTokens.walletOfOwner(signers[10]))

//             for (let i = 10; i <= 15; i++) {
//                 let priceNeeded = 5 * 15 * 10 ** 6
//                 await mockedUSDC.connect(signers[i]).approve(svbGemTokens.target, priceNeeded)

//                 await svbGemTokens.connect(signers[i]).mintWithUsdc(5)

//                 totalMintedUSDCamount += Number(priceNeeded)
//             }

//             expect(await svbGemTokens.balanceOf(signers[10])).to.equal(5n)
//             expect(await svbGemTokens.balanceOf(signers[11])).to.equal(5n)
//             expect(await svbGemTokens.balanceOf(signers[12])).to.equal(5n)
//             expect(await svbGemTokens.balanceOf(signers[13])).to.equal(5n)
//             expect(await svbGemTokens.balanceOf(signers[14])).to.equal(5n)
//             expect(await svbGemTokens.balanceOf(signers[15])).to.equal(5n)
//         })
//     })

//     describe("Gem Tokens Game should be setup correctly", function () {
//         it("should verify gem token values at the end of each red range", async function () {
//             expect(await gemTokenChallengeFacet.getGemToken(1)).to.deep.equal([1, 1, "Red"])
//             expect(await gemTokenChallengeFacet.getGemToken(226)).to.deep.equal([226, 2, "Red"])
//             expect(await gemTokenChallengeFacet.getGemToken(446)).to.deep.equal([446, 3, "Red"])
//             expect(await gemTokenChallengeFacet.getGemToken(661)).to.deep.equal([661, 4, "Red"])
//             expect(await gemTokenChallengeFacet.getGemToken(871)).to.deep.equal([871, 5, "Red"])
//             expect(await gemTokenChallengeFacet.getGemToken(1076)).to.deep.equal([1076, 10, "Red"])
//             expect(await gemTokenChallengeFacet.getGemToken(1276)).to.deep.equal([1276, 50, "Red"])
//             expect(await gemTokenChallengeFacet.getGemToken(1471)).to.deep.equal([1471, 100, "Red"])
//             expect(await gemTokenChallengeFacet.getGemToken(1661)).to.deep.equal([1661, 500, "Red"])
//             expect(await gemTokenChallengeFacet.getGemToken(1846)).to.deep.equal([1846, 1000, "Red"])
//             expect(await gemTokenChallengeFacet.getGemToken(2026)).to.deep.equal([2026, 5000, "Red"])
//             expect(await gemTokenChallengeFacet.getGemToken(2201)).to.deep.equal([2201, 10000, "Red"])
//             expect(await gemTokenChallengeFacet.getGemToken(2371)).to.deep.equal([2371, 50000, "Red"])
//         })

//         it("should verify gem token values at the end of each red range", async function () {
//             expect(await gemTokenChallengeFacet.getGemToken(225)).to.deep.equal([225, 1, "Red"])
//             expect(await gemTokenChallengeFacet.getGemToken(445)).to.deep.equal([445, 2, "Red"])
//             expect(await gemTokenChallengeFacet.getGemToken(660)).to.deep.equal([660, 3, "Red"])
//             expect(await gemTokenChallengeFacet.getGemToken(870)).to.deep.equal([870, 4, "Red"])
//             expect(await gemTokenChallengeFacet.getGemToken(1075)).to.deep.equal([1075, 5, "Red"])
//             expect(await gemTokenChallengeFacet.getGemToken(1275)).to.deep.equal([1275, 10, "Red"])
//             expect(await gemTokenChallengeFacet.getGemToken(1470)).to.deep.equal([1470, 50, "Red"])
//             expect(await gemTokenChallengeFacet.getGemToken(1660)).to.deep.equal([1660, 100, "Red"])
//             expect(await gemTokenChallengeFacet.getGemToken(1845)).to.deep.equal([1845, 500, "Red"])
//             expect(await gemTokenChallengeFacet.getGemToken(2025)).to.deep.equal([2025, 1000, "Red"])
//             expect(await gemTokenChallengeFacet.getGemToken(2200)).to.deep.equal([2200, 5000, "Red"])
//             expect(await gemTokenChallengeFacet.getGemToken(2370)).to.deep.equal([2370, 10000, "Red"])
//             expect(await gemTokenChallengeFacet.getGemToken(2500)).to.deep.equal([2500, 50000, "Red"])
//         })

//         it("should verify gem token values at the beginning of each yellow range", async function () {
//             expect(await gemTokenChallengeFacet.getGemToken(2501)).to.deep.equal([2501, 1, "Yellow"])
//             expect(await gemTokenChallengeFacet.getGemToken(2726)).to.deep.equal([2726, 2, "Yellow"])
//             expect(await gemTokenChallengeFacet.getGemToken(2946)).to.deep.equal([2946, 3, "Yellow"])
//             expect(await gemTokenChallengeFacet.getGemToken(3161)).to.deep.equal([3161, 4, "Yellow"])
//             expect(await gemTokenChallengeFacet.getGemToken(3371)).to.deep.equal([3371, 5, "Yellow"])
//             expect(await gemTokenChallengeFacet.getGemToken(3576)).to.deep.equal([3576, 10, "Yellow"])
//             expect(await gemTokenChallengeFacet.getGemToken(3776)).to.deep.equal([3776, 50, "Yellow"])
//             expect(await gemTokenChallengeFacet.getGemToken(3971)).to.deep.equal([3971, 100, "Yellow"])
//             expect(await gemTokenChallengeFacet.getGemToken(4161)).to.deep.equal([4161, 500, "Yellow"])
//             expect(await gemTokenChallengeFacet.getGemToken(4346)).to.deep.equal([4346, 1000, "Yellow"])
//             expect(await gemTokenChallengeFacet.getGemToken(4526)).to.deep.equal([4526, 5000, "Yellow"])
//             expect(await gemTokenChallengeFacet.getGemToken(4701)).to.deep.equal([4701, 10000, "Yellow"])
//             expect(await gemTokenChallengeFacet.getGemToken(4871)).to.deep.equal([4871, 50000, "Yellow"])
//         })

//         it("should verify gem token values at the end of each yellow range", async function () {
//             expect(await gemTokenChallengeFacet.getGemToken(2725)).to.deep.equal([2725, 1, "Yellow"])
//             expect(await gemTokenChallengeFacet.getGemToken(2945)).to.deep.equal([2945, 2, "Yellow"])
//             expect(await gemTokenChallengeFacet.getGemToken(3160)).to.deep.equal([3160, 3, "Yellow"])
//             expect(await gemTokenChallengeFacet.getGemToken(3370)).to.deep.equal([3370, 4, "Yellow"])
//             expect(await gemTokenChallengeFacet.getGemToken(3575)).to.deep.equal([3575, 5, "Yellow"])
//             expect(await gemTokenChallengeFacet.getGemToken(3775)).to.deep.equal([3775, 10, "Yellow"])
//             expect(await gemTokenChallengeFacet.getGemToken(3970)).to.deep.equal([3970, 50, "Yellow"])
//             expect(await gemTokenChallengeFacet.getGemToken(4160)).to.deep.equal([4160, 100, "Yellow"])
//             expect(await gemTokenChallengeFacet.getGemToken(4345)).to.deep.equal([4345, 500, "Yellow"])
//             expect(await gemTokenChallengeFacet.getGemToken(4525)).to.deep.equal([4525, 1000, "Yellow"])
//             expect(await gemTokenChallengeFacet.getGemToken(4700)).to.deep.equal([4700, 5000, "Yellow"])
//             expect(await gemTokenChallengeFacet.getGemToken(4870)).to.deep.equal([4870, 10000, "Yellow"])
//             expect(await gemTokenChallengeFacet.getGemToken(5000)).to.deep.equal([5000, 50000, "Yellow"])
//         })

//         it("should verify gem token values at the beginning of each green range", async function () {
//             expect(await gemTokenChallengeFacet.getGemToken(5001)).to.deep.equal([5001, 1, "Green"])
//             expect(await gemTokenChallengeFacet.getGemToken(5226)).to.deep.equal([5226, 2, "Green"])
//             expect(await gemTokenChallengeFacet.getGemToken(5446)).to.deep.equal([5446, 3, "Green"])
//             expect(await gemTokenChallengeFacet.getGemToken(5661)).to.deep.equal([5661, 4, "Green"])
//             expect(await gemTokenChallengeFacet.getGemToken(5871)).to.deep.equal([5871, 5, "Green"])
//             expect(await gemTokenChallengeFacet.getGemToken(6076)).to.deep.equal([6076, 10, "Green"])
//             expect(await gemTokenChallengeFacet.getGemToken(6276)).to.deep.equal([6276, 50, "Green"])
//             expect(await gemTokenChallengeFacet.getGemToken(6471)).to.deep.equal([6471, 100, "Green"])
//             expect(await gemTokenChallengeFacet.getGemToken(6661)).to.deep.equal([6661, 500, "Green"])
//             expect(await gemTokenChallengeFacet.getGemToken(6846)).to.deep.equal([6846, 1000, "Green"])
//             expect(await gemTokenChallengeFacet.getGemToken(7026)).to.deep.equal([7026, 5000, "Green"])
//             expect(await gemTokenChallengeFacet.getGemToken(7201)).to.deep.equal([7201, 10000, "Green"])
//             expect(await gemTokenChallengeFacet.getGemToken(7371)).to.deep.equal([7371, 50000, "Green"])
//         })

//         it("should verify gem token values at the end of each green range", async function () {
//             expect(await gemTokenChallengeFacet.getGemToken(5225)).to.deep.equal([5225, 1, "Green"])
//             expect(await gemTokenChallengeFacet.getGemToken(5445)).to.deep.equal([5445, 2, "Green"])
//             expect(await gemTokenChallengeFacet.getGemToken(5660)).to.deep.equal([5660, 3, "Green"])
//             expect(await gemTokenChallengeFacet.getGemToken(5870)).to.deep.equal([5870, 4, "Green"])
//             expect(await gemTokenChallengeFacet.getGemToken(6075)).to.deep.equal([6075, 5, "Green"])
//             expect(await gemTokenChallengeFacet.getGemToken(6275)).to.deep.equal([6275, 10, "Green"])
//             expect(await gemTokenChallengeFacet.getGemToken(6470)).to.deep.equal([6470, 50, "Green"])
//             expect(await gemTokenChallengeFacet.getGemToken(6660)).to.deep.equal([6660, 100, "Green"])
//             expect(await gemTokenChallengeFacet.getGemToken(6845)).to.deep.equal([6845, 500, "Green"])
//             expect(await gemTokenChallengeFacet.getGemToken(7025)).to.deep.equal([7025, 1000, "Green"])
//             expect(await gemTokenChallengeFacet.getGemToken(7200)).to.deep.equal([7200, 5000, "Green"])
//             expect(await gemTokenChallengeFacet.getGemToken(7370)).to.deep.equal([7370, 10000, "Green"])
//             expect(await gemTokenChallengeFacet.getGemToken(7500)).to.deep.equal([7500, 50000, "Green"])
//         })

//         it("should verify gem token values at the beginning of each blue range", async function () {
//             expect(await gemTokenChallengeFacet.getGemToken(7501)).to.deep.equal([7501, 1, "Blue"])
//             expect(await gemTokenChallengeFacet.getGemToken(7726)).to.deep.equal([7726, 2, "Blue"])
//             expect(await gemTokenChallengeFacet.getGemToken(7946)).to.deep.equal([7946, 3, "Blue"])
//             expect(await gemTokenChallengeFacet.getGemToken(8161)).to.deep.equal([8161, 4, "Blue"])
//             expect(await gemTokenChallengeFacet.getGemToken(8371)).to.deep.equal([8371, 5, "Blue"])
//             expect(await gemTokenChallengeFacet.getGemToken(8576)).to.deep.equal([8576, 10, "Blue"])
//             expect(await gemTokenChallengeFacet.getGemToken(8776)).to.deep.equal([8776, 50, "Blue"])
//             expect(await gemTokenChallengeFacet.getGemToken(8971)).to.deep.equal([8971, 100, "Blue"])
//             expect(await gemTokenChallengeFacet.getGemToken(9161)).to.deep.equal([9161, 500, "Blue"])
//             expect(await gemTokenChallengeFacet.getGemToken(9346)).to.deep.equal([9346, 1000, "Blue"])
//             expect(await gemTokenChallengeFacet.getGemToken(9526)).to.deep.equal([9526, 5000, "Blue"])
//             expect(await gemTokenChallengeFacet.getGemToken(9701)).to.deep.equal([9701, 10000, "Blue"])
//             expect(await gemTokenChallengeFacet.getGemToken(9871)).to.deep.equal([9871, 50000, "Blue"])
//         })

//         it("should verify gem token values at the end of each blue range", async function () {
//             expect(await gemTokenChallengeFacet.getGemToken(7725)).to.deep.equal([7725, 1, "Blue"])
//             expect(await gemTokenChallengeFacet.getGemToken(7945)).to.deep.equal([7945, 2, "Blue"])
//             expect(await gemTokenChallengeFacet.getGemToken(8160)).to.deep.equal([8160, 3, "Blue"])
//             expect(await gemTokenChallengeFacet.getGemToken(8370)).to.deep.equal([8370, 4, "Blue"])
//             expect(await gemTokenChallengeFacet.getGemToken(8575)).to.deep.equal([8575, 5, "Blue"])
//             expect(await gemTokenChallengeFacet.getGemToken(8775)).to.deep.equal([8775, 10, "Blue"])
//             expect(await gemTokenChallengeFacet.getGemToken(8970)).to.deep.equal([8970, 50, "Blue"])
//             expect(await gemTokenChallengeFacet.getGemToken(9160)).to.deep.equal([9160, 100, "Blue"])
//             expect(await gemTokenChallengeFacet.getGemToken(9345)).to.deep.equal([9345, 500, "Blue"])
//             expect(await gemTokenChallengeFacet.getGemToken(9525)).to.deep.equal([9525, 1000, "Blue"])
//             expect(await gemTokenChallengeFacet.getGemToken(9700)).to.deep.equal([9700, 5000, "Blue"])
//             expect(await gemTokenChallengeFacet.getGemToken(9870)).to.deep.equal([9870, 10000, "Blue"])
//             expect(await gemTokenChallengeFacet.getGemToken(10000)).to.deep.equal([10000, 50000, "Blue"])
//         })
//     })

//     describe("Test Different Games Setups", function () {
//         let winningValue: Number
//         let primaryColor: string
//         let numberOfWinningSpot: Number
//         let isGameOpen: boolean
//         let isGameActive: boolean
//         let gamePayoutSpots: Number[]
//         let gameStartDate: Number

//         before(async function () {
//             // Take a snapshot
//             snapshotId = await network.provider.send("evm_snapshot")
//         })
//         afterEach(async function () {
//             // Revert to the snapshot after each test
//             await network.provider.send("evm_revert", [snapshotId])
//         })
//         describe("1 Winner for 1118 'Red' ", function () {
//             it("should set the game parameters", async function () {
//                 let gameDetails = await gemTokenChallengeFacet.getCurrentGameDetails()
//                 ;[winningValue, primaryColor, numberOfWinningSpot, isGameOpen, isGameActive, gamePayoutSpots, gameStartDate] = gameDetails

//                 assert.strictEqual(winningValue, 0)
//                 assert.strictEqual(primaryColor, "")
//                 assert.strictEqual(numberOfWinningSpot, 0)
//                 assert.strictEqual(isGameOpen, false)
//                 assert.strictEqual(isGameActive, false)
//                 assert.deepStrictEqual(gamePayoutSpots, []) // Use deepStrictEqual for array comparison
//                 assert.strictEqual(gameStartDate, 0)

//                 await gemTokenChallengeFacet.connect(owner).setGameParameters(1118, "Red", 1, [100])

//                 gameDetails = await gemTokenChallengeFacet.getCurrentGameDetails()
//                 ;[winningValue, primaryColor, numberOfWinningSpot, isGameOpen, isGameActive, gamePayoutSpots, gameStartDate] = gameDetails

//                 assert.strictEqual(winningValue, 1118)
//                 assert.strictEqual(primaryColor, "Red")
//                 assert.strictEqual(numberOfWinningSpot, 1)
//                 assert.strictEqual(isGameOpen, true)
//                 assert.deepStrictEqual(
//                     gamePayoutSpots.map((n) => Number(n)),
//                     [100],
//                 )
//                 assert.strictEqual(isGameActive, true)

//                 assert.notStrictEqual(gameStartDate, 0)
//             })

//             it("checkScore and have the correct number", async function () {
//                 let colorForMonth = "Red"

//                 let score = await gemTokenChallengeFacet.connect(signers[10]).checkTokenScoreForWallet()
//                 let expectedScore = calculateTokenValue(await svbGemTokens.walletOfOwner(signers[10]), TokenData, colorForMonth)
//                 expect(score).to.deep.equal(expectedScore)

//                 console.log("signers[10] walletOfOwner", await svbGemTokens.walletOfOwner(signers[10]))
//                 console.log("signers[10] _walletOfOwnerForGemTokens", await gemTokenChallengeFacet._walletOfOwnerForGemTokens(signers[10]))
//                 console.log("score:", score)
//                 console.log()

//                 score = await gemTokenChallengeFacet.connect(signers[11]).checkTokenScoreForWallet()
//                 expectedScore = calculateTokenValue(await svbGemTokens.walletOfOwner(signers[11]), TokenData, colorForMonth)
//                 expect(score).to.deep.equal(expectedScore)

//                 console.log("signers[11] walletOfOwner", await svbGemTokens.walletOfOwner(signers[11]))
//                 console.log("score:", score)
//                 console.log()

//                 score = await gemTokenChallengeFacet.connect(signers[12]).checkTokenScoreForWallet()
//                 expectedScore = calculateTokenValue(await svbGemTokens.walletOfOwner(signers[12]), TokenData, colorForMonth)
//                 expect(score).to.deep.equal(expectedScore)

//                 console.log("signers[12] walletOfOwner", await svbGemTokens.walletOfOwner(signers[12]))
//                 console.log("score:", score)
//                 console.log()

//                 score = await gemTokenChallengeFacet.connect(signers[13]).checkTokenScoreForWallet()
//                 expectedScore = calculateTokenValue(await svbGemTokens.walletOfOwner(signers[13]), TokenData, colorForMonth)
//                 expect(score).to.deep.equal(expectedScore)

//                 console.log("signers[13] walletOfOwner", await svbGemTokens.walletOfOwner(signers[13]))
//                 console.log("score:", score)
//                 console.log()

//                 score = await gemTokenChallengeFacet.connect(signers[14]).checkTokenScoreForWallet()
//                 expectedScore = calculateTokenValue(await svbGemTokens.walletOfOwner(signers[14]), TokenData, colorForMonth)
//                 expect(score).to.deep.equal(expectedScore)

//                 console.log("signers[14] walletOfOwner", await svbGemTokens.walletOfOwner(signers[14]))
//                 console.log("score:", score)
//                 console.log()

//                 score = await gemTokenChallengeFacet.connect(signers[15]).checkTokenScoreForWallet()
//                 expectedScore = calculateTokenValue(await svbGemTokens.walletOfOwner(signers[15]), TokenData, colorForMonth)
//                 expect(score).to.deep.equal(expectedScore)

//                 console.log("signers[15] walletOfOwner", await svbGemTokens.walletOfOwner(signers[15]))
//                 console.log("score:", score)
//                 console.log()
//             })

//             it("verify bank reward balances before game is won", async function () {
//                 expect(Number(await bankFacet.connect(signers[10]).getRewardsBalance())).to.equal(0)
//                 expect(Number(await bankFacet.connect(signers[11]).getRewardsBalance())).to.equal(0)
//                 expect(Number(await bankFacet.connect(signers[12]).getRewardsBalance())).to.equal(0)
//                 expect(Number(await bankFacet.connect(signers[13]).getRewardsBalance())).to.equal(0)
//                 expect(Number(await bankFacet.connect(signers[14]).getRewardsBalance())).to.equal(0)
//                 expect(Number(await bankFacet.connect(signers[15]).getRewardsBalance())).to.equal(0)
//                 expect(Number(await bankFacet.connect(coreTeamWallet).getRewardsBalance())).to.equal(0)
//             })

//             it("let signers try to win the game", async function () {
//                 for (let i = 10; i <= 15; i++) {
//                     let accessAllowed: boolean = await gemTokenChallengeFacet.connect(signers[i]).checkIfWinner()
//                     console.log("accessAllowed:", accessAllowed)

//                     if (accessAllowed) {
//                         console.log(`_*__*__*_signers${i} claiming the win_*__*__*_`)
//                         console.log()
//                         expect(await svbGemTokens.isApprovedForAll(signers[i].address, diamondAddress)).to.equal(false)
//                         await svbGemTokens.connect(signers[i]).setApprovalForAll(diamondAddress, true) // must setApprovalForAll for the diamond before you can call the burnAndClaimSpot function.
//                         expect(await svbGemTokens.isApprovedForAll(signers[i].address, diamondAddress)).to.equal(true)
//                         await gemTokenChallengeFacet.connect(signers[i]).burnAndClaimSpot()
//                     } else {
//                         console.log(`signers${i} can't claim`)
//                         console.log()
//                     }
//                 }
//             })

//             it("checkScore and wallets after winner claimed", async function () {
//                 let colorForMonth = "Red"

//                 let score = await gemTokenChallengeFacet.connect(signers[10]).checkTokenScoreForWallet()
//                 let expectedScore = calculateTokenValue(await svbGemTokens.walletOfOwner(signers[10]), TokenData, colorForMonth)
//                 expect(score).to.deep.equal(expectedScore)
//                 console.log("signers[10] walletOfOwner", await svbGemTokens.walletOfOwner(signers[10]))
//                 console.log("signers[10] _walletOfOwnerForGemTokens", await gemTokenChallengeFacet._walletOfOwnerForGemTokens(signers[10]))

//                 console.log("score:", score)
//                 console.log()

//                 score = await gemTokenChallengeFacet.connect(signers[11]).checkTokenScoreForWallet()
//                 expectedScore = calculateTokenValue(await svbGemTokens.walletOfOwner(signers[11]), TokenData, colorForMonth)
//                 expect(score).to.deep.equal(expectedScore)
//                 console.log("signers[11] walletOfOwner", await svbGemTokens.walletOfOwner(signers[11]))
//                 console.log("score:", score)
//                 console.log()

//                 score = await gemTokenChallengeFacet.connect(signers[12]).checkTokenScoreForWallet()
//                 expectedScore = calculateTokenValue(await svbGemTokens.walletOfOwner(signers[12]), TokenData, colorForMonth)
//                 expect(score).to.deep.equal(expectedScore)

//                 console.log("signers[12] walletOfOwner", await svbGemTokens.walletOfOwner(signers[12]))
//                 console.log("score:", score)
//                 console.log()

//                 score = await gemTokenChallengeFacet.connect(signers[13]).checkTokenScoreForWallet()
//                 expectedScore = calculateTokenValue(await svbGemTokens.walletOfOwner(signers[13]), TokenData, colorForMonth)
//                 expect(score).to.deep.equal(expectedScore)

//                 console.log("signers[13] walletOfOwner", await svbGemTokens.walletOfOwner(signers[13]))
//                 console.log("score:", score)
//                 console.log()

//                 score = await gemTokenChallengeFacet.connect(signers[14]).checkTokenScoreForWallet()
//                 expectedScore = calculateTokenValue(await svbGemTokens.walletOfOwner(signers[14]), TokenData, colorForMonth)
//                 expect(score).to.deep.equal(expectedScore)

//                 console.log("signers[14] walletOfOwner", await svbGemTokens.walletOfOwner(signers[14]))
//                 console.log("score:", score)
//                 console.log()

//                 score = await gemTokenChallengeFacet.connect(signers[15]).checkTokenScoreForWallet()
//                 expectedScore = calculateTokenValue(await svbGemTokens.walletOfOwner(signers[15]), TokenData, colorForMonth)
//                 expect(score).to.deep.equal(expectedScore)

//                 console.log("signers[15] walletOfOwner", await svbGemTokens.walletOfOwner(signers[15]))
//                 console.log("score:", score)
//                 console.log()
//                 console.log("balanceOf for gemTokenBurnWallet:", await svbGemTokens.balanceOf(gemTokenBurnWallet.address))
//             })

//             it("let signers try to win the game", async function () {
//                 console.log("After the first game ends")
//                 let gameDetails = await gemTokenChallengeFacet.getCurrentGameDetails()
//                 ;[winningValue, primaryColor, numberOfWinningSpot, isGameOpen, isGameActive, gamePayoutSpots, gameStartDate] = gameDetails

//                 console.log("winning Value:", winningValue)
//                 console.log("primaryColor:", primaryColor)
//                 console.log("numberOfWinningSpot:", numberOfWinningSpot)
//                 console.log("isGameOpen:", isGameOpen)
//                 console.log("isGameActive:", isGameActive)
//                 console.log("gamePayoutSpots:", gamePayoutSpots)
//                 console.log("gameStartDate:", gameStartDate)

//                 console.log("svt Balance for owner:", await saltVaultToken.balanceOf(owner))
//                 console.log("svt Balance for diamond:", Number(await saltVaultToken.balanceOf(diamondAddress)) / 10 ** 6)
//                 console.log("getCurrentGemTokenRewardBalance:", Number(await gemTokenChallengeFacet.getCurrentGemTokenRewardBalance()) / 10 ** 6)

//                 expect(await saltVaultToken.balanceOf(owner)).to.equal(0)
//                 expect(await saltVaultToken.balanceOf(diamondAddress)).to.equal(1000 * 10 ** 6)
//                 expect(await gemTokenChallengeFacet.getCurrentGemTokenRewardBalance()).to.equal(0)

//                 assert.strictEqual(winningValue, 1118)
//                 assert.strictEqual(primaryColor, "Red")
//                 assert.strictEqual(numberOfWinningSpot, 1)
//                 assert.strictEqual(isGameOpen, false)
//                 assert.strictEqual(isGameActive, false)
//                 assert.deepStrictEqual(
//                     gamePayoutSpots.map((n) => Number(n)),
//                     [100],
//                 )

//                 assert.notStrictEqual(gameStartDate, 0)
//             })

//             it("verify bank reward balances", async function () {
//                 // console.log("bankRewardBalance for p10:", Number(await bankFacet.connect(signers[10]).getRewardsBalance()) / 10 ** 6)
//                 // console.log("bankRewardBalance for p11:", Number(await bankFacet.connect(signers[11]).getRewardsBalance()) / 10 ** 6)
//                 // console.log("bankRewardBalance for p12:", Number(await bankFacet.connect(signers[12]).getRewardsBalance()) / 10 ** 6)
//                 // console.log("bankRewardBalance for p13:", Number(await bankFacet.connect(signers[13]).getRewardsBalance()) / 10 ** 6)
//                 // console.log("bankRewardBalance for p14:", Number(await bankFacet.connect(signers[14]).getRewardsBalance()) / 10 ** 6)
//                 // console.log("bankRewardBalance for p15:", Number(await bankFacet.connect(signers[15]).getRewardsBalance()) / 10 ** 6)
//                 // console.log("bankRewardBalance for coreTeamWallet:", Number(await bankFacet.connect(coreTeamWallet).getRewardsBalance()) / 10 ** 6)

//                 expect(Number(await bankFacet.connect(signers[10]).getRewardsBalance())).to.equal(1000 * 10 ** 6)
//                 expect(Number(await bankFacet.connect(signers[11]).getRewardsBalance())).to.equal(0)
//                 expect(Number(await bankFacet.connect(signers[12]).getRewardsBalance())).to.equal(0)
//                 expect(Number(await bankFacet.connect(signers[13]).getRewardsBalance())).to.equal(0)
//                 expect(Number(await bankFacet.connect(signers[14]).getRewardsBalance())).to.equal(0)
//                 expect(Number(await bankFacet.connect(signers[15]).getRewardsBalance())).to.equal(0)
//                 expect(Number(await bankFacet.connect(coreTeamWallet).getRewardsBalance())).to.equal(0)
//             })
//         })
//     })
// })
