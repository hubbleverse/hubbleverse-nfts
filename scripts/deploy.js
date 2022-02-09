const { ethers } = require("hardhat")

async function main() {
    const Hubbleverse = await ethers.getContractFactory('Hubbleverse')
    const TransparentUpgradeableProxy = await ethers.getContractFactory('TransparentUpgradeableProxy')
    const ProxyAdmin = await ethers.getContractFactory('ProxyAdmin')

    const proxyAdmin = await ProxyAdmin.deploy()
    console.log({ proxyAdmin: proxyAdmin.address }) // 0x22085fc77d1030a9D82CF6b9E3b4bB7d42e13F21

    const hubbleverse = await Hubbleverse.deploy()
    console.log({ hubbleverse: hubbleverse.address }) // 0x27cfe2DB0A5CcD5e7E97B24718e9cDf65b140df1

    await new Promise(resolve => setTimeout(resolve, 5000));
    const proxy = await TransparentUpgradeableProxy.deploy(
        hubbleverse.address,
        proxyAdmin.address,
        hubbleverse.interface.encodeFunctionData('initialize', [''])
    )
    console.log({ proxy: proxy.address }) // 0x98fCC9df8b2359E1b7aE9B688fBFf65C99B839f6
}

main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});
