const fs = require('fs')
const csv = require('csv-parser')
const Bluebird = require('bluebird')

const BATCH_SIZE = 250 // takes 7.7m gas
const ID = 29

async function main() {
    let contributors = await parseCsv(`${__dirname}/gmx.csv`)
    const hubbleverse = await ethers.getContractAt('Hubbleverse', '0x101b6Bd0b14B6a62BBCf167039FcC673a58E2cc4')

    const batches = []
    while (contributors.length) {
        batches.push(contributors.slice(0, BATCH_SIZE))
        contributors = contributors.slice(BATCH_SIZE)
    }

    const [ signer ] = await ethers.getSigners()
    let nonce = await signer.getTransactionCount()
    await Bluebird.map(batches, async batch => {
        hubbleverse.mintToBatch(batch, ID, 1, [], { nonce: nonce++ })
    }, { concurrency: 5 })
}

function parseCsv(path) {
    const results = []
    return new Promise(async (resolve, reject) => {
        fs.createReadStream(path)
        .pipe(csv())
        .on('data', (data) => {
            results.push(data.address)
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
