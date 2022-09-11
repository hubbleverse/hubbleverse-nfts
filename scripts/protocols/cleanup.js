const fs = require('fs')
const csv = require('csv-parser')
const Bluebird = require('bluebird')

const BATCH_SIZE = 20
const ID = 29

async function main() {
    const hubbleverse = await ethers.getContractAt('Hubbleverse', '0x101b6Bd0b14B6a62BBCf167039FcC673a58E2cc4')

    const mintedTo = {}
    let fromBlock = 19734558 // first block where token of ID was minted for deduplication
    // let latestBlock = 19735142 // fromBlock + 5000
    let latestBlock = await ethers.provider.getBlockNumber()
    while (fromBlock <= latestBlock) {
        const toBlock = Math.min(fromBlock + 2048, latestBlock)
        console.log({ fromBlock, toBlock })
        // emit TransferSingle(operator, address(0), to, id, amount);
        const events = await hubbleverse.queryFilter('TransferSingle', fromBlock, toBlock)
        events.forEach(event => {
            if (event.args.id.toNumber() == ID) {
                mintedTo[event.args.to.toLowerCase()] = true
            }
        })
        fromBlock = toBlock + 1
    }
    console.log('mintedTo =', Object.keys(mintedTo).length)

    // let contributors = ['0xe3d14B9191a86301565fe006b76B2fbE96873bbc', '0x2e909729016eb1013a197e05210e35ce4435abc4', '0x8FAB9B7B1414aB845793C55070b0C81a7a23e189']
    // .map(address => {
    let contributors = (await parseCsv(`${__dirname}/protocols.csv`))
    .map(({ address }) => {
        // console.log(address, mintedTo[address.toLowerCase()])
        if (ethers.utils.isAddress(address) && !mintedTo[address.toLowerCase()]) return ethers.utils.getAddress(address)
        return null
    })
    .filter(Boolean)
    // .slice(20000, 21000)

    console.log(contributors.length)
    const rejects = await getRejects(hubbleverse, contributors.slice(0))
    console.log({ rejects })
    contributors = contributors.filter(c => !rejects[c])
    fs.writeFileSync(`${__dirname}/protocols-cleaned.csv`, JSON.stringify(contributors))
    console.log(contributors.length)
}

async function getRejects(hubbleverse, contributors) {
    const rejects = []
    const batches = []

    while (contributors.length) {
        batches.push(contributors.slice(0, BATCH_SIZE))
        contributors = contributors.slice(BATCH_SIZE)
    }

    await Bluebird.map(batches, async batch => {
        // console.log(batch)
        try {
            await hubbleverse.estimateGas.mintToBatch(batch, ID, 1, [])
        } catch (e) {
            await Bluebird.map(batch, async addy => {
                try {
                    await hubbleverse.estimateGas.mintToBatch([addy], ID, 1, [])
                } catch (e) {
                    if (e.code == 'UNPREDICTABLE_GAS_LIMIT') {
                        rejects[addy] = true
                    } else {
                        console.log(e, addy)
                    }
                }
            }, { concurrency: 5 })
        }
    }, { concurrency: 5 })
    return rejects
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

main()
