const Bluebird = require('bluebird')
const fs = require('fs')

const BATCH_SIZE = 250
const ID = 29

async function main() {
    const hubbleverse = await ethers.getContractAt('Hubbleverse', '0x101b6Bd0b14B6a62BBCf167039FcC673a58E2cc4')

    let fromBlock = 19734558 // first block where token of ID was minted for deduplication
    // let latestBlock = 19735142 // fromBlock + 5000
    let latestBlock = await ethers.provider.getBlockNumber()
    const mintedTo = {}
    while (fromBlock <= latestBlock) {
        const toBlock = Math.min(fromBlock + 2048, latestBlock)
        console.log({ fromBlock, toBlock })
        // emit TransferSingle(operator, address(0), to, id, amount);
        const events = await hubbleverse.queryFilter('TransferSingle', fromBlock, toBlock)
        events.forEach(event => {
            // console.log(event.args.id.toNumber())
            if (event.args.id.toNumber() == ID) {
                // console.log(event)
                mintedTo[event.args.to.toLowerCase()] = true
            }
        })
        // console.log(events)
        fromBlock = toBlock + 1
    }
    // console.log(Object.keys(mintedTo).length)

    let airdrop = {}
    let contributors = JSON.parse(fs.readFileSync(`${__dirname}/protocols-cleaned.csv`))
    contributors.forEach(c => {
        if (ethers.utils.isAddress(c) && mintedTo[c.toLowerCase()] == null) {
            airdrop[ethers.utils.getAddress(c)] = true
        }
    })
    airdrop = Object.keys(airdrop)
    console.log(airdrop, contributors.length, airdrop.length)

    const batches = []
    while (airdrop.length) {
        batches.push(airdrop.slice(0, BATCH_SIZE))
        airdrop = airdrop.slice(BATCH_SIZE)
    }

    const [ signer ] = await ethers.getSigners()
    let nonce = await signer.getTransactionCount()
    await Bluebird.map(batches, async batch => {
        hubbleverse.mintToBatch(batch, ID, 1, [], { nonce: nonce++ })
    }, { concurrency: 5 })
}

main()
