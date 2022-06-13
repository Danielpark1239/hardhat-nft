const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat.config.js")
const { verify } = require("../utils/verify")
const fs = require("fs")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const chainId = network.config.chainId
    let ethUsdPriceFeedAddress

    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await ethers.getContract("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed
    }

    // deploy
    const lowSVG = await fs.readFileSync("./images/dynamicNFT/frown.svg", { encoding: "utf8" })
    const highSVG = await fs.readFileSync("./images/dynamicNFT/happy.svg", { encoding: "utf8" })
    args = [ethUsdPriceFeedAddress, lowSVG, highSVG]
    const dynamicSvgNFT = await deploy("DynamicSvgNFT", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    // verify
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(dynamicSvgNFT.address, args)
    }
}

module.exports.tags = ["all", "dynamicSvgNft", "main"]
