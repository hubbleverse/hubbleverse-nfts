const { expect } = require("chai");

describe('Hubbleverse', function() {
    before('factories', async function() {
        signers = await ethers.getSigners()
        ;([ _, alice, bob] = signers.map(s => s.address))

        Hubbleverse = await ethers.getContractFactory('Hubbleverse')
        baseUri = 'ipfs://QmSenTk76m3bNPCX3SPGPMqAjVPuzANYFpqa6XbXGhiHqH/'
        hubbleverse = await Hubbleverse.deploy(baseUri)
    })

    it('mint', async function() {
        await hubbleverse.mint(alice, 0, 1, [])
        expect(await hubbleverse.totalSupply(0)).to.eq(1)
        expect(await hubbleverse.exists(0)).to.be.true
        expect(await hubbleverse.uri(0)).to.eq(baseUri + 0)
    })

    it('need minter role to mint', async function() {
        await expect(
            hubbleverse.connect(signers[3]).mintBatch(bob, [1, 2], [69, 420], [])
        ).to.be.revertedWith('ERC1155PresetMinterPauser: must have minter role to mint')

        await hubbleverse.grantRole(await hubbleverse.MINTER_ROLE(), signers[3].address)
        await hubbleverse.connect(signers[3]).mintBatch(bob, [1, 2], [69, 420], [])

        expect(await hubbleverse.totalSupply(1)).to.eq(69)
        expect(await hubbleverse.totalSupply(2)).to.eq(420)
        expect(await hubbleverse.balanceOf(bob, 1)).to.eq(69)
        expect(await hubbleverse.balanceOf(bob, 2)).to.eq(420)
    })

    it('cannot transfer when pause', async function() {
        await hubbleverse.pause()
        await expect(
            hubbleverse.connect(signers[2]).safeTransferFrom(bob, alice, 1, 9, [])
        ).to.be.revertedWith('ERC1155Pausable: token transfer while paused')
    })

    it('can transfer when unpaused', async function() {
        await hubbleverse.unpause()
        await hubbleverse.connect(signers[2]).safeTransferFrom(bob, alice, 1, 9, [])
        expect(await hubbleverse.balanceOf(bob, 1)).to.eq(60)
        expect(await hubbleverse.balanceOf(alice, 1)).to.eq(9)
    })
})
