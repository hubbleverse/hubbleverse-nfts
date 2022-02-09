require("@nomiclabs/hardhat-waffle");
require('@nomiclabs/hardhat-web3')

const PRIVATE_KEY = `0x${process.env.PRIVATE_KEY || 'ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'}`

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    solidity: '0.8.4',
    networks: {
        local: {
            url: 'http://localhost:8545',
            chainId: 31337
        },
        c_chain: {
            url: 'https://api.avax.network/ext/bc/C/rpc',
            chainId: 43114,
            accounts: [ PRIVATE_KEY ]
        },
    },
    mocha: {
        timeout: 0
    }
};
