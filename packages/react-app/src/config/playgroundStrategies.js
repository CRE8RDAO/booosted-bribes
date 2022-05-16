{
    "symbol": "MULTI",
    "strategies": [
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
        "name": "masterchef-pool-balance",
        "network": "250",
        "params": {
          "pid": "85",
          "symbol": "bbMINOR",
          "weight": 217,
          "decimals": 18,
          "tokenIndex": null,
          "chefAddress": "0x8166994d9ebBe5829EC86Bd81258149B87faCfd3",
          "uniPairAddress": null,
          "weightDecimals": 3
        },
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
        "name": "erc20-balance-of",
        "network": "250",
        "params": {
          "symbol": "ola",
          "address": "0xbbB192f66256002C96Dae28770b2622DB41d56Cc",
          "decimals": 18
          
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
        "name": "erc20-balance-of",
        "network": "250",
        "params": {
          "symbol": "unstaked SpiritLPs",
          "address": "0x459e7c947E04d73687e786E4A48815005dFBd49A",
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
    ]
  }