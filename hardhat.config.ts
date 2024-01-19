import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"
import "hardhat-contract-sizer"

import * as dotenv from "dotenv"
dotenv.config()

const ganacheMnemonic = process.env.GANACHE_MNEMONIC

if (!ganacheMnemonic) {
    throw new Error("GANACHE_MNEMONIC environment variable is not set.")
}

const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
                version: "0.8.18",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
            {
                version: "0.8.20",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    networks: {
        hardhat: {
            accounts: {
                count: 50, // Number of accounts
            },
        },
        ganache: {
            url: "http://127.0.0.1:8545", // This should match your Ganache CLI's listening address
            accounts: {
                count: 30,

                mnemonic: ganacheMnemonic,
            },
            // You can add other settings like gasPrice, gasLimit, etc., if needed
        },
        // Other network configurations...
    },
    // Additional configurations...
}

export default config
