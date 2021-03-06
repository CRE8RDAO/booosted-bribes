/**
 * Note: These strategies are weighted in units of the cre8r-ftm lp token on spirit
 */
module.exports = {
  network: 250,
  strategies: [
    { //beets balance on chain //cre8r in f major pool
      "name": "masterchef-pool-balance",
      "network": "250",
      "params": {
        "pid": "39",
        "symbol": "BEETSLP -> SLP",
        "weight": 172, // to change to weight one
        "tokenIndex": null,
        "chefAddress": "0x8166994d9ebBe5829EC86Bd81258149B87faCfd3",
        "uniPairAddress": null,
        "weightDecimals": 3
      }
    },
    { //check if users have balances in ola: https://ola.finance/
      "name": "erc20-balance-of",
      "network": "250",
      "params": {
      "address": "0xbbB192f66256002C96Dae28770b2622DB41d56Cc",
      "symbol": "OLA", //Why is this called OLA?
      "decimals": 18
    }
    },
    {  //CRE8R DAO token
      "name": "erc20-balance-of-weighted",
      "network": "250",
      "params": {
        "address": "0x2aD402655243203fcfa7dCB62F8A08cc2BA88ae0",  // add CRE8R but also gotta add beets back in
          "symbol": "CRE8R", 
          "decimals": 18,
          "weight": 0.12 // todo make dynamic
    }
    },
    {
      "name": "erc20-balance-of-weighted", //CRE8R In F-Major Beethoven-X Crypt (rf-BPT-CR...)
      "network": "250",
      "params": {
        "symbol": "reaper",
        "weight": 0.2021571004,
        "address": "0xd70257272b108677B017A942cA80fD2b8Fc9251A",
        "decimals": 18
      }
    },
    {
      "name": "erc20-balance-of-weighted", // Moo Spirit FTM-CRE8R (mooSpirit...)
      "network": "250",
      "params": {
        "symbol": "moo",
        "address": "0x503FF2102D51ec816C693017d26E31df666Cadf0",
        "decimals": 18,
        "weight": 2.950783334
      }
    },
    {
      "name": "erc20-balance-of-weighted", // BELUGA SPIRIT-LP (bSPIRIT-LP)
      "network": "250",
      "params": {
        "symbol": "beluga",
        "weight": 1,
        "address": "0x6D931508d47f1D858c209C5296E9afC091a2Ddff",
        "decimals": 18
      }
    },
    {
      "name": "contract-call",
      "network": "250",
      "params": {
        "symbol": "spiritLPCRE8R", //go to spiritswap cre8r farm to see price to see
        "address": "0xDcD990038d9CBe98B84a6aD9dBc880e3d4b06599",
        "decimals": 18,
        "methodABI": {
          "name": "balanceOf",
          "type": "function",
          "inputs": [
            {
              "name": "account",
              "type": "address",
              "internalType": "address"
            }
          ],
          "outputs": [
            {
              "name": "",
              "type": "uint256",
              "internalType": "uint256"
            }
          ],
          "stateMutability": "view"
        }
      }
    }
  ]
}