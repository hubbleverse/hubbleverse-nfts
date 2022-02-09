const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('Hubbleverse', function() {
    before('factories', async function() {
        signers = await ethers.getSigners()
        ;([ _, proxyAdmin, alice, bob] = signers.map(s => s.address))
        minter = signers[9]

        Hubbleverse = await ethers.getContractFactory('Hubbleverse')
        TransparentUpgradeableProxy = await ethers.getContractFactory('TransparentUpgradeableProxy')
        baseUri = 'ipfs://QmSenTk76m3bNPCX3SPGPMqAjVPuzANYFpqa6XbXGhiHqH/'

        hubbleverse = await Hubbleverse.deploy()
        const proxy = await TransparentUpgradeableProxy.deploy(
            hubbleverse.address,
            proxyAdmin,
            hubbleverse.interface.encodeFunctionData('initialize', [baseUri])
        )
        hubbleverse = await ethers.getContractAt('Hubbleverse', proxy.address)
        minterRole = await hubbleverse.MINTER_ROLE()
    })

    it('will revert if initialized again', async function() {
        await expect(
            hubbleverse.initialize('')
        ).to.be.revertedWith('Initializable: contract is already initialized')
    })

    it('mint', async function() {
        await hubbleverse.mint(alice, 0, 1, [])
        expect(await hubbleverse.totalSupply(0)).to.eq(1)
        expect(await hubbleverse.exists(0)).to.be.true
    })

    it('need minter role to mint', async function() {
        await expect(
            hubbleverse.connect(minter).mintBatch(bob, [1, 2], [69, 420], [])
        ).to.be.revertedWith('ERC1155PresetMinterPauser: must have minter role to mint')

        await hubbleverse.grantRole(minterRole, minter.address)
        await hubbleverse.connect(minter).mintBatch(bob, [1, 2], [69, 420], [])

        expect(await hubbleverse.totalSupply(1)).to.eq(69)
        expect(await hubbleverse.totalSupply(2)).to.eq(420)
        expect(await hubbleverse.balanceOf(bob, 1)).to.eq(69)
        expect(await hubbleverse.balanceOf(bob, 2)).to.eq(420)
    })

    it('mintToBatch', async function() {
        await hubbleverse.revokeRole(minterRole, minter.address)
        await expect(
            hubbleverse.connect(minter).mintToBatch([alice, bob], 3, 5, [])
        ).to.be.revertedWith('Hubbleverse: must have minter role to mint')

        await hubbleverse.grantRole(minterRole, minter.address)
        await hubbleverse.connect(minter).mintToBatch([alice, bob], 3, 5, [])

        expect(await hubbleverse.totalSupply(3)).to.eq(10)
        expect(await hubbleverse.balanceOf(alice, 3)).to.eq(5)
        expect(await hubbleverse.balanceOf(bob, 3)).to.eq(5)
    })

    it('cannot transfer when pause', async function() {
        await hubbleverse.pause()
        await expect(
            hubbleverse.connect(ethers.provider.getSigner(bob)).safeTransferFrom(bob, alice, 1, 9, [])
        ).to.be.revertedWith('ERC1155Pausable: token transfer while paused')
    })

    it('can transfer when unpaused', async function() {
        await hubbleverse.unpause()
        await hubbleverse.connect(ethers.provider.getSigner(bob)).safeTransferFrom(bob, alice, 1, 9, [])
        expect(await hubbleverse.balanceOf(bob, 1)).to.eq(60)
        expect(await hubbleverse.balanceOf(alice, 1)).to.eq(9)
    })

    it('setURI', async function() {
        for (let i = 0; i < 4; i++) {
            expect(await hubbleverse.uri(i)).to.eq(baseUri + i)
        }

        const newURI = 'hubbleverse.com/'
        await hubbleverse.setURI(newURI)

        for (let i = 0; i < 4; i++) {
            expect(await hubbleverse.uri(i)).to.eq(newURI + i)
        }
    })
})
