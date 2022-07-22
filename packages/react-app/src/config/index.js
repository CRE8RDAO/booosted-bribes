import addresses from "../addresses";
import { usePoller, useBlockNumber } from "eth-hooks";

export const CRE8R = 'cre8r.eth';
export const BEETS = 'beets.eth';
export const FTM = 'fantom';

const strategies = {
  [CRE8R]: [
    {
      "name": "masterchef-pool-balance",
      "network": "250",
      "params": {
        "pid": "39",
        "symbol": "BEETSLP -> SLP",
        "weight": 202,
        "tokenIndex": null,
        "chefAddress": "0x8166994d9ebBe5829EC86Bd81258149B87faCfd3",
        "uniPairAddress": null,
        "weightDecimals": 3
      }
    },
    { 
      "name": "erc20-balance-of",
      "network": "250",
      "params": {
      "address": "0xbbB192f66256002C96Dae28770b2622DB41d56Cc",
      "symbol": "OLA",
      "decimals": 18
    }
    },
    { 
      "name": "erc20-balance-of",
      "network": "250",
      "params": {
        "address": "0x2aD402655243203fcfa7dCB62F8A08cc2BA88ae0",  
          "symbol": "CRE8R",
          "decimals": 18,
          "weight": 9
    }
    },
    {
      "name": "erc20-balance-of-weighted",
      "network": "250",
      "params": {
        "symbol": "reaper",
        "weight": 0.2021571004,
        "address": "0xd70257272b108677B017A942cA80fD2b8Fc9251A",
        "decimals": 18
      }
    },
    {
      "name": "erc20-balance-of-weighted",
      "network": "250",
      "params": {
        "symbol": "moo",
        "address": "0x503FF2102D51ec816C693017d26E31df666Cadf0",
        "decimals": 18,
        "weight": 2.950783334
      }
    },
    {
      "name": "erc20-balance-of-weighted",
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
        "symbol": "spiritLPCRE8R",
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
  ],
  [BEETS]: [
    {
        "name": "masterchef-pool-balance",
        "network": "250",
        "params": {
          "pid": "22",
          "symbol": "fBEETS-STAKED",
          "weight": 1,
          "decimals": 18,
          "tokenIndex": null,
          "chefAddress": "0x8166994d9ebBe5829EC86Bd81258149B87faCfd3",
          "uniPairAddress": null,
          "weightDecimals": 0
        },
      
      },
      
    {
      "name": "erc20-balance-of-weighted",
      "network": "250",
      "params": {
        "symbol": "fbeets",
        "weight": 1,
        "address": "0xfcef8a994209d6916EB2C86cDD2AFD60Aa6F54b1",
        "decimals": 18
      }
    }
  ]
}

const network = {
  [FTM]: 250
};
export const voters = addresses

export const bribeSettings = {
  [CRE8R]: {
    strategies: strategies[CRE8R],
    network: network[FTM]
  },
  [BEETS]: {
    strategies: strategies[BEETS],
    network: network[FTM]
  }
}
//const blockNumber = useBlockNumber(props.provider);

 export const BLOCKNUMBER = 43050170;  // change to latest block that using the thing we looked at the other day. 
//export const BLOCKNUMBER = blockNumber;
//console.log("test blockbumber:", blockNumber)
export const BEETS_PROPOSALS = [
  0,1,2,3,4,5,6,7,
  "0x913940146e7d5ad7587d138348bc1a1f34c75e57f3a377cfbba862a084c0ed12", //round 8
  "0x52dae6401830de2baf203c921aa064839157e11dfb4fd1472b380ad58511c9ca", // round 9
]