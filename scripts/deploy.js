const { ethers } = require("hardhat")

async function main() {
    const Hubbleverse = await ethers.getContractFactory('Hubbleverse')
    const TransparentUpgradeableProxy = await ethers.getContractFactory('TransparentUpgradeableProxy')
    const ProxyAdmin = await ethers.getContractFactory('ProxyAdmin')

    const proxyAdmin = await ProxyAdmin.deploy()
    console.log({ proxyAdmin: proxyAdmin.address }) // 0x22085fc77d1030a9D82CF6b9E3b4bB7d42e13F21

    const hubbleverse = await Hubbleverse.deploy()
    Hubbleverse.deploy()
    console.log({ hubbleverse: hubbleverse.address }) // 0xD33C3A389a73B03A6547b6Df06bf9bF24430882E

    await new Promise(resolve => setTimeout(resolve, 5000));
    const args = [
        hubbleverse.address,
        proxyAdmin.address,
        hubbleverse.interface.encodeFunctionData('initialize', [''])
    ]
    console.log(args) // helps in verification

    const proxy = await TransparentUpgradeableProxy.deploy(...args)
    console.log({ proxy: proxy.address }) // 0x101b6Bd0b14B6a62BBCf167039FcC673a58E2cc4
}

main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});
