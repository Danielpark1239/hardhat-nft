const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat.config.js")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Random IPFS NFT Unit Tests", function () {
          let randomIpfsNFT, deployer, vrfCoordinatorV2Mock

          beforeEach(async () => {
              accounts = await ethers.getSigners()
              deployer = accounts[0]
              await deployments.fixture(["mocks", "randomIpfsNft"])
              randomIpfsNFT = await ethers.getContract("RandomIpfsNFT", deployer)
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
          })

          describe("constructor", () => {
              it("sets URIs correctly", async function () {
                  const tokenURIZero = await randomIpfsNFT.getTokenURIs(0)
                  assert(tokenURIZero.includes("ipfs://"))
              })
          })

          describe("requestNFT", () => {
              it("fails if payment isn't sent with the request", async function () {
                  await expect(randomIpfsNFT.requestNFT()).to.be.revertedWith(
                      "RandomIpfsNFT__NeedMoreETHSent"
                  )
              })
              it("emits an event and kicks off a random word request", async function () {
                  const fee = await randomIpfsNFT.getMintFee()
                  await expect(randomIpfsNFT.requestNFT({ value: fee.toString() })).to.emit(
                      randomIpfsNFT,
                      "NftRequested"
                  )
              })
          })
          describe("fulfillRandomWords", () => {
              it("mints NFT after random number returned", async function () {
                  await new Promise(async (resolve, reject) => {
                      randomIpfsNFT.once("NftMinted", async () => {
                          try {
                              const tokenURI = await randomIpfsNFT.getTokenURIs(0)
                              const tokenCounter = await randomIpfsNFT.getTokenCounter()
                              assert.equal(tokenURI.toString().includes("ipfs://"), true)
                              assert.equal(tokenCounter.toString(), "1")
                              resolve()
                          } catch (e) {
                              console.log(e)
                              reject(e)
                          }
                      })
                      try {
                          const fee = await randomIpfsNFT.getMintFee()
                          const requestNftResponse = await randomIpfsNFT.requestNFT({
                              value: fee.toString(),
                          })
                          const requestNftReceipt = await requestNftResponse.wait(1)
                          await vrfCoordinatorV2Mock.fulfillRandomWords(
                              requestNftReceipt.events[1].args.requestId,
                              randomIpfsNFT.address
                          )
                      } catch (error) {
                          console.log(error)
                          reject(error)
                      }
                  })
              })
          })
      })
