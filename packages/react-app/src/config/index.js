import addresses from "../addresses";
import { usePoller, useBlockNumber } from "eth-hooks";

export const BLOCKNUMBER = 43050170;  // https://snapshot.org/#/beets.eth // change to latest block that using the thing we looked at the other day. 
export const BASICBRIBEFOR100 = 64773.488; // https://docs.google.com/spreadsheets/d/1ex4qMXnqAmjMrbYxLbVLqvQgg0REQ0_r3RIcHMIMfKA/edit#gid=0
export const TOTALVOTINGPOWER = 83957874; // https://ftmscan.com/token/0xfcef8a994209d6916eb2c86cdd2afd60aa6f54b1?a=0xc6fe438c3d3e9b9e18e6fa47921b04eca19dcc57
export const CRE8R_FTM_LP_PRICE = 0.15;  // https://app.spiritswap.finance/#/farms/allfarms -> search for cre8r (cre8r-ftm lp)


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
