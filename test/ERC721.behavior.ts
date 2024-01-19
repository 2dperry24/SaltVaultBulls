import { ethers } from "hardhat"
import { Contract, Signer, Wallet } from "ethers"
import { expect } from "chai"
import { PANIC_CODES } from "@nomicfoundation/hardhat-chai-matchers/panic"
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs"

import { shouldSupportInterfaces } from "../openzeppelin-contracts/test/utils/introspection/SupportsInterface.behavior"
import { RevertType } from "../openzeppelin-contracts/test/helpers/enums"
import { time, loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"

const firstTokenId: bigint = 343n
const secondTokenId: bigint = 5n
const nonExistentTokenId: bigint = 100n
const thirdTokenId: bigint = 52n
const baseURI: string = "https://api.example.com/v1/"

const RECEIVER_MAGIC_VALUE: string = "0x150b7a02"

const name = "SaltVaultBulls"
const symbol = "SVB"
const initialBaseURI: string = "ipfs://svbtestdata/"

// Load the fixture before each test
let accounts: any
let token: any

let owner: any
let newOwner: any
let approved: any
let operator: any
let other: any

async function erc721MetaDatafixture() {
    const accounts = await ethers.getSigners()

    ;[owner, newOwner, approved, operator, other] = accounts

    const MockedERC721Enumerable = await ethers.getContractFactory("MockedERC721Enumerable")
    const token = await MockedERC721Enumerable.deploy(name, symbol)
    await token.waitForDeployment()

    return { owner, newOwner, approved, operator, other, token }
}

describe("should act like ERC721MetaData", function () {
    describe("metadata", function () {
        it("has a name", async function () {
            let { token } = await loadFixture(erc721MetaDatafixture)

            expect(await token.name()).to.equal(name)
        })

        it("has a symbol", async function () {
            let { token } = await loadFixture(erc721MetaDatafixture)

            expect(await token.symbol()).to.equal(symbol)
        })
    })

    describe("token URI", function () {
        it("returns constructor BaseURI string by default", async function () {
            let { token } = await loadFixture(erc721MetaDatafixture)

            await token.mint(owner.getAddress(), firstTokenId)

            expect(await token.tokenURI(firstTokenId)).to.equal(initialBaseURI + firstTokenId + ".json")
        })

        it("reverts when queried for non existent token id", async function () {
            let { token } = await loadFixture(erc721MetaDatafixture)

            await token.mint(owner.getAddress(), firstTokenId)

            await expect(token.tokenURI(nonExistentTokenId)).to.be.revertedWith("ERC721Metadata: URI query for nonexistent token")
        })
    })
})

async function erc721fixture() {
    const accounts = await ethers.getSigners()

    ;[owner, newOwner, approved, operator, other] = accounts

    const MockedERC721Enumerable = await ethers.getContractFactory("MockedERC721Enumerable")
    const token = await MockedERC721Enumerable.deploy(name, symbol)
    await token.waitForDeployment()

    await token.mint(owner.getAddress(), firstTokenId)
    await token.mint(owner.getAddress(), secondTokenId)

    await token.connect(owner).approve(approved, firstTokenId)
    await token.connect(owner).setApprovalForAll(operator, true)

    return { owner, newOwner, approved, operator, other, token }
}

describe("should act like ERC721", function () {
    describe("With minted tokens", function () {
        describe("balanceOf", function () {
            describe("when the given address owns some tokens", function () {
                it("returns the amount of tokens owned by the given address", async function () {
                    let { token, owner } = await loadFixture(erc721fixture)

                    expect(await token.balanceOf(await owner.getAddress())).to.equal(2n)
                })
            })

            describe("when the given address does not own any tokens", function () {
                it("returns 0", async function () {
                    let { token, other } = await loadFixture(erc721fixture)

                    expect(await token.balanceOf(await other.getAddress())).to.equal(0n)
                })
            })

            describe("when querying the zero address", function () {
                it("throws", async function () {
                    let { token } = await loadFixture(erc721fixture)

                    await expect(token.balanceOf(ethers.ZeroAddress)).to.be.revertedWith("ERC721: address zero is not a valid owner")
                })
            })
        })

        describe("ownerOf", function () {
            describe("when the given token ID was tracked by this token", function () {
                it("returns the owner of the given token ID", async function () {
                    let { token, owner } = await loadFixture(erc721fixture)

                    expect(await token.ownerOf(firstTokenId)).to.equal(await owner.getAddress())
                })
            })

            describe("when the given token ID was not tracked by this token", function () {
                it("reverts", async function () {
                    let { token } = await loadFixture(erc721fixture)
                    await expect(token.ownerOf(nonExistentTokenId)).to.be.revertedWith("ERC721: invalid token ID")
                })
            })
        })

        describe("Transfers", function () {
            describe("when called by the owner", function () {
                it("transfers the ownership of the given token ID to the given address", async function () {
                    let { token, owner, newOwner } = await loadFixture(erc721fixture)

                    await expect(token.connect(owner).transferFrom(owner.getAddress(), newOwner.getAddress(), firstTokenId))
                        .to.emit(token, "Transfer")
                        .withArgs(owner.getAddress(), newOwner.getAddress(), firstTokenId)

                    expect(await token.ownerOf(firstTokenId)).to.equal(newOwner)
                })

                it("clears the approval for the token ID", async function () {
                    let { token, owner, newOwner } = await loadFixture(erc721fixture)

                    await expect(token.connect(owner).transferFrom(owner.getAddress(), newOwner.getAddress(), firstTokenId))
                        .to.emit(token, "Transfer")
                        .withArgs(owner.getAddress(), newOwner.getAddress(), firstTokenId)

                    expect(await token.getApproved(firstTokenId)).to.equal(ethers.ZeroAddress)
                })

                it("adjusts owners balances", async function () {
                    let { token, owner, newOwner } = await loadFixture(erc721fixture)

                    await expect(token.connect(owner).transferFrom(owner.getAddress(), newOwner.getAddress(), firstTokenId))
                        .to.emit(token, "Transfer")
                        .withArgs(owner.getAddress(), newOwner.getAddress(), firstTokenId)

                    expect(await token.balanceOf(owner)).to.equal(1)

                    expect(await token.balanceOf(newOwner)).to.equal(1)
                })

                it("adjusts owners tokens by index", async function () {
                    let { token, owner, newOwner } = await loadFixture(erc721fixture)

                    await expect(token.connect(owner).transferFrom(owner.getAddress(), newOwner.getAddress(), firstTokenId))
                        .to.emit(token, "Transfer")
                        .withArgs(owner.getAddress(), newOwner.getAddress(), firstTokenId)

                    expect(await token.tokenOfOwnerByIndex(newOwner, 0)).to.equal(firstTokenId)
                })
            })

            describe("when called by the approved", function () {
                it("transfers the ownership of the given token ID to the given address", async function () {
                    let { token, owner, newOwner, approved } = await loadFixture(erc721fixture)

                    await expect(token.connect(approved).transferFrom(owner.getAddress(), newOwner.getAddress(), firstTokenId))
                        .to.emit(token, "Transfer")
                        .withArgs(owner.getAddress(), newOwner.getAddress(), firstTokenId)

                    expect(await token.ownerOf(firstTokenId)).to.equal(newOwner)
                })

                it("clears the approval for the token ID", async function () {
                    let { token, owner, newOwner, approved } = await loadFixture(erc721fixture)

                    await expect(token.connect(approved).transferFrom(owner.getAddress(), newOwner.getAddress(), firstTokenId))
                        .to.emit(token, "Transfer")
                        .withArgs(owner.getAddress(), newOwner.getAddress(), firstTokenId)

                    expect(await token.getApproved(firstTokenId)).to.equal(ethers.ZeroAddress)
                })

                it("adjusts owners balances", async function () {
                    let { token, owner, newOwner, approved } = await loadFixture(erc721fixture)

                    await expect(token.connect(approved).transferFrom(owner.getAddress(), newOwner.getAddress(), firstTokenId))
                        .to.emit(token, "Transfer")
                        .withArgs(owner.getAddress(), newOwner.getAddress(), firstTokenId)

                    expect(await token.balanceOf(owner)).to.equal(1)

                    expect(await token.balanceOf(newOwner)).to.equal(1)
                })

                it("adjusts owners tokens by index", async function () {
                    let { token, owner, newOwner, approved } = await loadFixture(erc721fixture)

                    await expect(token.connect(approved).transferFrom(owner.getAddress(), newOwner.getAddress(), firstTokenId))
                        .to.emit(token, "Transfer")
                        .withArgs(owner.getAddress(), newOwner.getAddress(), firstTokenId)

                    expect(await token.tokenOfOwnerByIndex(newOwner, 0)).to.equal(firstTokenId)
                })
            })

            describe("when called by the operator", function () {
                it("transfers the ownership of the given token ID to the given address", async function () {
                    let { token, owner, newOwner, operator } = await loadFixture(erc721fixture)

                    await expect(token.connect(operator).transferFrom(owner.getAddress(), newOwner.getAddress(), firstTokenId))
                        .to.emit(token, "Transfer")
                        .withArgs(owner.getAddress(), newOwner.getAddress(), firstTokenId)

                    expect(await token.ownerOf(firstTokenId)).to.equal(newOwner)
                })

                it("clears the approval for the token ID", async function () {
                    let { token, owner, newOwner, operator } = await loadFixture(erc721fixture)

                    await expect(token.connect(operator).transferFrom(owner.getAddress(), newOwner.getAddress(), firstTokenId))
                        .to.emit(token, "Transfer")
                        .withArgs(owner.getAddress(), newOwner.getAddress(), firstTokenId)

                    expect(await token.getApproved(firstTokenId)).to.equal(ethers.ZeroAddress)
                })

                it("adjusts owners balances", async function () {
                    let { token, owner, newOwner, operator } = await loadFixture(erc721fixture)

                    await expect(token.connect(operator).transferFrom(owner.getAddress(), newOwner.getAddress(), firstTokenId))
                        .to.emit(token, "Transfer")
                        .withArgs(owner.getAddress(), newOwner.getAddress(), firstTokenId)

                    expect(await token.balanceOf(owner)).to.equal(1)

                    expect(await token.balanceOf(newOwner)).to.equal(1)
                })

                it("adjusts owners tokens by index", async function () {
                    let { token, owner, newOwner, operator } = await loadFixture(erc721fixture)

                    await expect(token.connect(operator).transferFrom(owner.getAddress(), newOwner.getAddress(), firstTokenId))
                        .to.emit(token, "Transfer")
                        .withArgs(owner.getAddress(), newOwner.getAddress(), firstTokenId)

                    expect(await token.tokenOfOwnerByIndex(newOwner, 0)).to.equal(firstTokenId)
                })
            })

            describe("when called by the approved without being approved", function () {
                it("transfers the ownership of the given token ID to the given address", async function () {
                    let { token, owner, newOwner, operator } = await loadFixture(erc721fixture)

                    await token.connect(owner).approve(ethers.ZeroAddress, firstTokenId)

                    await expect(token.connect(approved).transferFrom(owner.getAddress(), newOwner.getAddress(), firstTokenId)).to.revertedWith("ERC721: caller is not token owner or approved")

                    expect(await token.ownerOf(firstTokenId)).to.equal(owner)
                })

                it("clears the approval for the token ID", async function () {
                    let { token, owner, newOwner, operator } = await loadFixture(erc721fixture)

                    await token.connect(owner).approve(ethers.ZeroAddress, firstTokenId)

                    await expect(token.connect(approved).transferFrom(owner.getAddress(), newOwner.getAddress(), firstTokenId)).to.revertedWith("ERC721: caller is not token owner or approved")

                    expect(await token.getApproved(firstTokenId)).to.equal(ethers.ZeroAddress)
                })

                it("adjusts owners balances", async function () {
                    let { token, owner, newOwner, operator } = await loadFixture(erc721fixture)

                    await token.connect(owner).approve(ethers.ZeroAddress, firstTokenId)

                    await expect(token.connect(approved).transferFrom(owner.getAddress(), newOwner.getAddress(), firstTokenId)).to.revertedWith("ERC721: caller is not token owner or approved")

                    expect(await token.balanceOf(owner)).to.equal(2)

                    expect(await token.balanceOf(newOwner)).to.equal(0)
                })

                it("adjusts owners tokens by index", async function () {
                    let { token, owner, newOwner, operator } = await loadFixture(erc721fixture)

                    await token.connect(owner).approve(ethers.ZeroAddress, firstTokenId)

                    await expect(token.connect(approved).transferFrom(owner.getAddress(), newOwner.getAddress(), firstTokenId)).to.revertedWith("ERC721: caller is not token owner or approved")

                    expect(await token.tokenOfOwnerByIndex(owner, 0)).to.equal(firstTokenId)
                })
            })

            describe("when called by the operator without being approved", function () {
                it("transfers the ownership of the given token ID to the given address", async function () {
                    let { token, owner, newOwner, operator } = await loadFixture(erc721fixture)

                    await token.connect(owner).setApprovalForAll(operator, false)

                    await expect(token.connect(operator).transferFrom(owner.getAddress(), newOwner.getAddress(), firstTokenId)).to.revertedWith("ERC721: caller is not token owner or approved")

                    expect(await token.ownerOf(firstTokenId)).to.equal(owner)
                })

                it("clears the approval for the token ID", async function () {
                    let { token, owner, newOwner, operator } = await loadFixture(erc721fixture)

                    await token.connect(owner).setApprovalForAll(operator, false)

                    await expect(token.connect(operator).transferFrom(owner.getAddress(), newOwner.getAddress(), firstTokenId)).to.revertedWith("ERC721: caller is not token owner or approved")

                    expect(await token.getApproved(firstTokenId)).to.equal(approved)
                })

                it("adjusts owners balances", async function () {
                    let { token, owner, newOwner, operator } = await loadFixture(erc721fixture)

                    await token.connect(owner).setApprovalForAll(operator, false)

                    await expect(token.connect(operator).transferFrom(owner.getAddress(), newOwner.getAddress(), firstTokenId)).to.revertedWith("ERC721: caller is not token owner or approved")

                    expect(await token.balanceOf(owner)).to.equal(2)

                    expect(await token.balanceOf(newOwner)).to.equal(0)
                })

                it("adjusts owners tokens by index", async function () {
                    let { token, owner, newOwner, operator } = await loadFixture(erc721fixture)

                    await token.connect(owner).setApprovalForAll(operator, false)

                    await expect(token.connect(operator).transferFrom(owner.getAddress(), newOwner.getAddress(), firstTokenId)).to.revertedWith("ERC721: caller is not token owner or approved")

                    expect(await token.tokenOfOwnerByIndex(owner, 0)).to.equal(firstTokenId)
                })
            })
        })
    }) // with minted tokens Ending
})
//     });

//     before(async function () {
//         const fixtureData = await loadFixture(fixture);
//         token = fixtureData.token;
//         owner = fixtureData.owner;
//         newOwner = fixtureData.newOwner;
//         approved = fixtureData.approved;
//         operator = fixtureData.operator;
//         other = fixtureData.other;

//         await token.mint(owner.getAddress(), firstTokenId);
//         await token.mint(owner.getAddress(), secondTokenId);

//         await token.connect(owner).approve(approved, tokenId);
//         await token.connect(owner).setApprovalForAll(operator, true);
//         balanceBeforeOwner = Number(await token.balanceOf(owner));
//         balanceBeforeNewOwner = Number(await token.balanceOf(newOwner));
//         await expect(token.connect(approved).transferFrom(owner.getAddress(), newOwner.getAddress(), tokenId))
//             .to.emit(token, 'Transfer')
//             .withArgs(owner.getAddress(), newOwner.getAddress(), tokenId);
//     });

//     before(async function () {
//         const fixtureData = await loadFixture(fixture);
//         token = fixtureData.token;
//         owner = fixtureData.owner;
//         newOwner = fixtureData.newOwner;
//         approved = fixtureData.approved;
//         operator = fixtureData.operator;
//         other = fixtureData.other;

//         await token.mint(owner.getAddress(), firstTokenId);
//         await token.mint(owner.getAddress(), secondTokenId);

//         await token.connect(owner).approve(approved, tokenId);
//         await token.connect(owner).setApprovalForAll(operator, true);
//         balanceBeforeOwner = Number(await token.balanceOf(owner));
//         balanceBeforeNewOwner = Number(await token.balanceOf(newOwner));
//         await expect(token.connect(operator).transferFrom(owner.getAddress(), newOwner.getAddress(), tokenId))
//             .to.emit(token, 'Transfer')
//             .withArgs(owner.getAddress(), newOwner.getAddress(), tokenId);
//     });

//     describe('when called by the operator', function () {

//         it('transfers the ownership of the given token ID to the given address', async function () {
//             expect(await token.ownerOf(tokenId)).to.equal(newOwner);
//         });

//         it('clears the approval for the token ID', async function () {
//             expect(await token.getApproved(tokenId)).to.equal(ethers.ZeroAddress);
//         });

//         it('adjusts owners balances', async function () {
//             expect(await token.balanceOf(owner)).to.equal(balanceBeforeOwner - 1);
//         });

//         it('adjusts newOwners balances', async function () {
//             expect(await token.balanceOf(newOwner)).to.equal(balanceBeforeNewOwner + 1);
//         });

//         it('adjusts owners tokens by index', async function () {
//             expect(await token.tokenOfOwnerByIndex(newOwner, 0)).to.equal(tokenId);
//         });

//     });

//     before(async function () {
//         const fixtureData = await loadFixture(fixture);
//         token = fixtureData.token;
//         owner = fixtureData.owner;
//         newOwner = fixtureData.newOwner;
//         approved = fixtureData.approved;
//         operator = fixtureData.operator;
//         other = fixtureData.other;

//         await token.mint(owner.getAddress(), firstTokenId);
//         await token.mint(owner.getAddress(), secondTokenId);

//         balanceBeforeOwner = Number(await token.balanceOf(owner));
//         balanceBeforeNewOwner = Number(await token.balanceOf(newOwner));
//        // Expect the transferFrom call to be reverted
//        // Expect the transferFrom call to be reverted with the correct error message
//         // await expect(token.connect(operator).transferFrom(
//         //     await owner.getAddress(),
//         //     await newOwner.getAddress(),
//         //     firstTokenId
//         // )).to.be.revertedWith("ERC721: caller is not token owner or approved");

//     });

//     describe('when called by the owner without an approved user', function () {

//         // it('transfers the ownership of the given token ID to the given address', async function () {
//         //     expect(await token.ownerOf(firstTokenId)).to.equal(owner);
//         // });

//         // it('clears the approval for the token ID', async function () {
//         //     expect(await token.getApproved(firstTokenId)).to.equal(ethers.ZeroAddress);
//         // });

//         // it('adjusts owners balances', async function () {
//         //     expect(await token.balanceOf(owner)).to.equal(balanceBeforeOwner );
//         // });

//         it('adjusts newOwners balances', async function () {
//             expect(await token.balanceOf(newOwner)).to.equal(balanceBeforeNewOwner);
//         });

//         // it('adjusts owners tokens by index', async function () {
//         //     expect(await token.tokenOfOwnerByIndex(owner, 0)).to.equal(firstTokenId);
//         // });

//     });

// function transferWasSuccessful(token: any, from: any, to: any, tokenId: bigint) {

//     it('transfers the ownership of the given token ID to the given address', async function () {
//         expect(await token.ownerOf(tokenId)).to.equal(await to.address);
//     });

//     it('clears the approval for the token ID', async function () {
//         expect(await token.getApproved(tokenId)).to.equal(ethers.ZeroAddress);
//     });

//     it('adjusts owners balances', async function () {
//         const balanceBefore = await token.balanceOf(await from.address);
//         expect(await token.balanceOf(await from.address)).to.be.below(balanceBefore);
//     });

//     it('adjusts owners tokens by index', async function () {
//         expect(await token.tokenOfOwnerByIndex(await to.address, 0)).to.equal(tokenId);
//     });
// }

// describe('when called by the owner', function () {

//     // beforeEach(async function () {
//     //     // Perform the transfer here
//     //     await token.connect(owner).transferFrom(owner.address, newOwner.address, tokenId);
//     //     transferWasSuccessful(token, owner, newOwner, tokenId);
//     // });
//     describe('when called by the owner', function () {
//         beforeEach(async function () {
//             await token.connect(owner).transferFrom(await owner.getAddress(), await newOwner.getAddress(), firstTokenId);
//         });
//         transferWasSuccessful(token, owner, newOwner, firstTokenId);
//     });

// });

// describe("Transfers", function () {

//     function transferWasSuccessful(token: Contract, from: Signer, to: Signer, tokenId: bigint) {
//         // ... (test cases)
//     }

//     beforeEach(async function () {
//         // Initialize contract, signers, and mint token to `owner` if not already done
//         // ...
//     });

//     describe('when called by the owner', function () {
//         beforeEach(async function () {
//             // Ensure owner is the current owner of tokenId
//             await token.connect(owner).transferFrom(await owner.getAddress(), await newOwner.getAddress(), firstTokenId);
//         });

//         transferWasSuccessful(token, owner, newOwner, firstTokenId);
//     });

//     // ... (other scenarios)
// });

// // }); // parent Block Ending
