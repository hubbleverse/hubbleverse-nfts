const { expect } = require("chai");
const { ethers } = require("hardhat");
const csv = require('csv-parser')

const fs = require('fs')
const DORLANZ = '0x82e6C5FDfB8966fC2cd4427D79CaEb5983fD1901'
describe('Hubbleverse', function() {
    before('factories', async function() {
        signers = await ethers.getSigners()
        alice = signers[0].address

        await network.provider.request({
            method: "hardhat_reset",
            params: [{
                forking: {
                    jsonRpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
                    blockNumber: 10820385 // having a consistent block number speeds up the tests across runs
                }
            }]
        })
        await impersonateAccount(DORLANZ)
        // give dorlanz some avax
        await web3.eth.sendTransaction({ from: alice, to: DORLANZ, value: ethers.constants.WeiPerEther.mul(10) })
        dorlanz = ethers.provider.getSigner(DORLANZ)

        hubbleverse = await ethers.getContractAt('Hubbleverse', '0x101b6Bd0b14B6a62BBCf167039FcC673a58E2cc4')
    })

    it('mintToBatch', async function() {
        await hubbleverse.connect(dorlanz).mintToBatch([alice, alice], 0, 1, [])
        expect(await hubbleverse.balanceOf(alice, 0)).to.eq(2)
        expect(await hubbleverse.totalSupply(0)).to.eq(2)
    })

    it('mintToGMX', async function() {
        const gmx = (await parseCsv(`${__dirname}/../scripts/gmx.csv`)).map(g => g.address).slice(0, 10)
        let toGive = gmx.slice()

        await hubbleverse.connect(dorlanz).mintToBatch(toGive, 1, 1, [])
        expect(await hubbleverse.totalSupply(1)).to.eq(gmx.length)
        for (let i = 0; i < gmx.length; i++) {
            expect(await hubbleverse.balanceOf(gmx[i], 1)).to.eq(1)
        }
    })

    it('setUri', async function() {
        const newuri = 'newuri/0'
        await hubbleverse.connect(dorlanz).setURI(0, newuri)
        expect(await hubbleverse.uri(0)).to.eq(newuri)
    })
})

async function impersonateAccount(account) {
    await network.provider.request({
        method: 'hardhat_impersonateAccount',
        params: [account],
    })
}

function parseCsv(path) {
    const results = []
    return new Promise(async (resolve, reject) => {
        fs.createReadStream(path)
        .pipe(csv())
        .on('data', (data) => {
            results.push(data)
        })
        .on('end', async () => {
            try {
                resolve(results)
            } catch(e) {
                reject(e)
            }
        });
    })
}
