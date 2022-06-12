const { network } = require("hardhat")
const { DECIMALS, INITIAL_PRICE } = require("../helper-hardhat.config.js")

module.exports = async ({ getNamedAccounts, deployments, ethers }) => {
    const BASE_FEE = ethers.utils.parseEther("0.25")
    const GAS_PRICE_LINK = 1e9
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // If we are on a local development network, we need to deploy mocks!
    if (chainId == 31337) {
        log("Local network detected! Deploying mocks...")
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: [BASE_FEE, GAS_PRICE_LINK],
        })
        // await deploy("MockV3Aggregator", {
        //     from: deployer,
        //     log: true,
        //     args: [DECIMALS, INITIAL_PRICE],
        // })

        log("Mocks Deployed!")
    }
}
module.exports.tags = ["all", "mocks", "main"]
