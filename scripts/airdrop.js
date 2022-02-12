const fs = require('fs')
const csv = require('csv-parser')

async function main() {
    let contributors = (await parseCsv(`${__dirname}/gmx.csv`)).map(g => g.address)
    hubbleverse = await ethers.getContractAt('Hubbleverse', '0x101b6Bd0b14B6a62BBCf167039FcC673a58E2cc4')

    let nonce = await signer.getTransactionCount()
    while(contributors.length) {
        await hubbleverse.mintToBatch(contributors.slice(0, 50), 0, 1, [], { nonce: nonce++ })
        contributors = contributors.slice(50)
    }
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
