// Mints an NFT for each of the three contracts
const { ethers, network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat.config.js")

module.exports = async function ({ getNamedAccounts }) {
    const { deployer } = await getNamedAccounts()

    // Basic NFT
    const basicNFT = await ethers.getContract("BasicNFT", deployer)
    const basicMintTx = await basicNFT.mintNFT()
    await basicMintTx.wait(1)
    console.log(`Basic NFT index 0 has tokenURI: ${await basicNFT.tokenURI(0)}`)

    // Random IPFS NFT
    const randomIpfsNFT = await ethers.getContract("RandomIpfsNFT", deployer)
    const mintFee = await randomIpfsNFT.getMintFee()

    await new Promise(async (resolve, reject) => {
        setTimeout(resolve, 600000) // 10min
        randomIpfsNFT.once("NftMinted", async function () {
            resolve()
        })

        const randomMintTx = await randomIpfsNFT.requestNFT({ value: mintFee.toString() })
        const randomMintTxReceipt = await randomMintTx.wait(1)
        if (developmentChains.includes(network.name)) {
            const requestId = randomMintTxReceipt.events[1].args.requestId.toString()
            const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
            await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, randomIpfsNFT.address)
        }
    })
    console.log(`Random IPFS NFT index 0 tokenURI: ${await randomIpfsNFT.getTokenURIs(0)}`)

    // Dynamic SVG NFT
    const highValue = ethers.utils.parseEther("2000")
    const dynamicSvgNFT = await ethers.getContract("DynamicSvgNFT", deployer)
    const dynamicMintTx = await dynamicSvgNFT.mintNFT(highValue.toString())
    await dynamicMintTx.wait(1)
    console.log(`Dynamic SVG NFT index 0 tokenURI: ${await dynamicSvgNFT.tokenURI(0)}`)
}
module.exports.tags = ["all", "mint"]
