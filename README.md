# cøsmwasm devtøøls

a tool for interacting with cosmwasm contracts. online at https://cosmwasm.tools

## how to use

- default network is the Uni testnet for Juno, but you can use mainnet, your local dev server, or any compatible chain
- add an account for sending coins - connect your wallet, or generate a new account
- add your contract
- insert your JSON message to send
- send away!
  - use the dropdown -> Execute with... if you want to send funds with your transaction
- if you need coins (and are running on a local chain), you can set up a [cosmjs faucet](https://www.npmjs.com/package/@cosmjs/faucet) and add the endpoint into your network configuration
- once you have some coins in your wallet or another account, you can transfer them between accounts
- this is intended for testing! you can use it to work with production contracts, but do so at your own risk

## running locally

```
git clone https://github.com/aswever/cosmwasm-devtools
cd cosmwasm-devtools
yarn
yarn start
```
