const snapshot = require('@snapshot-labs/snapshot.js');
const {ApolloClient, gql, HttpLink, InMemoryCache} = require('@apollo/client')
const fetch = require('cross-fetch')
const fs = require('fs');
const path = require('path');

const pool = "CRE8R in F-Major (CRE8R-FTM)"

const client = new ApolloClient({
  link: new HttpLink({ uri: 'https://hub.snapshot.org/graphql', fetch }),
  cache: new InMemoryCache(),
});

const CRE8R = 'cre8r'

//todo - dynamically get prices to set correct ratios
const CRE8Rstrategies = [
  {
    "name": "masterchef-pool-balance",
    "network": "250",
    "params": {
      "pid": "39",
      "symbol": "BEETSLP -> SLP",
      "weight": 172,
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
      "address": "0x2aD402655243203fcfa7dCB62F8A08cc2BA88ae0",  // add CRE8R but also gotta add beets back in
        "symbol": "CRE8R",
        "decimals": 18,
        "weight": 0.12
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

const bribeSettings = {
  [CRE8R]: {
    strategies: [...CRE8Rstrategies], //cre8r strategy 2 is the erc20 balance of address
    network: 250
  }
}

/**
 * 
 * @param {*} addresses 
 * @param {*} blockNumber 
 * @returns promise
 */
function getHoldings(addresses, blockNumber) {
  return snapshot.utils.getScores(
    CRE8R,
    [...bribeSettings[CRE8R].strategies],
    bribeSettings[CRE8R].network,
    [...addresses],
    blockNumber
  ).then(scores => {
    if (!scores) return;

  const holdings = {}
  for (let i = 0; i < scores.length; i++) {
    for (let j = 0; j < Object.keys(scores[i]).length; j++) {
      let key = Object.keys(scores[i])[j]
      if (holdings[key] === undefined) {
        holdings[key] = scores[i][key]
      } else {
        holdings[key] += scores[i][key]
      }                             
    }
  }
  for (let i = 0; i < Object.keys(holdings).length; i++) {
    holdings[Object.keys(holdings)[i]] *= 8.2 //converting vp to cre8r
  } 
    return holdings
  })
}


//CRE8R in F-Major (CRE8R-FTM)
/**
 * 
 * @param {*} proposalId 
 * @param {*} poolPos 
 * @returns {Promise<{voters: [], total: number, addresses: []}>}}
 */
const getVotes = async (proposalId, poolPos) => {
  const votersQuery = gql`
query Votes($id: String!, $first: Int, $skip: Int, $orderBy: String, $orderDirection: OrderDirection, $voter: String) {
  votes(
    first: $first
    skip: $skip
    where: {proposal: $id, vp_gt: 0, voter: $voter}
    orderBy: $orderBy
    orderDirection: $orderDirection
  ) {
    ipfs
    voter
    choice
    vp
    vp_by_strategy
  }
}
`
  const { loading, error, data } = await client.query({
    query: votersQuery,
    variables: {
      "id": proposalId,
      "orderBy": "vp",
      "orderDirection": "desc",
      first: 150000,
      // skip: 1500
    }
  })
  if (data) {
    const _voters = {}
    let _total = 0
    for (let i = 0; i < data.votes.length; i++) {
      if (!data.votes[i].choice[poolPos]) continue;
      let percentVoteForPool = data.votes[i].choice[poolPos]/(Object.values(data.votes[i].choice).reduce((acc, val) => acc + val))
      let vpToPool = data.votes[i].vp * percentVoteForPool
      _voters[data.votes[i].voter] = vpToPool
      _total += vpToPool
    }
    return {
      voters: _voters,
      total: _total,
      addresses: Object.keys(_voters)
    }
  }
}
/**
 * 
 * @param {*} proposalId 
 * @param {*} pool pool name - must be exact name
 * @returns {{percent: any, poolPos: string}} poolPos is a number that is a string and is 1 indexed of choices
 */
const getPercentAndPoolPos = async (proposalId, pool) => {
  const scoresQuery = gql`
  query ($proposalId: String!) {
    proposal(id: $proposalId) {
      id
      title
      choices
      start
      end
      snapshot
      state
      author
      created
      scores
    }
  }
  `
  const { loading, error, data } = await client.query({
    query: scoresQuery,
    variables: {
      proposalId: proposalId
    }
  })
    if (data) {
      const percentVotes = {}
      let totalVotes = 0
      let poolPos;
      for (let i = 0; i < data.proposal.choices.length; i++) {
        totalVotes += data.proposal.scores[i]
      }
      for (let i = 0; i < data.proposal.choices.length; i++) {
        percentVotes[data.proposal.choices[i]] = data.proposal.scores[i]/totalVotes
        if (data.proposal.choices[i] == pool) {
          poolPos = i + 1
        }
      }
      const percent = percentVotes[pool];
      return {percent, poolPos: poolPos.toString()}
    }
    throw new Error('percent not found, check if you have a valid proposal id')
}
// getVotes(proposalId, poolPos).then(res => {
  
// })

//todo - dynamically get payouts from txHash
/**
 * todo: dynamically get payouts
 * @returns 
 */
function getLastPayoutRound11(txHash) {
  return {
    "0x28aa4F9ffe21365473B64C161b566C3CdeAD0108":66218.40133
  ,"0xA5d896AcCC301fcaA21f03592269310e7444AA40":49158.67566
  ,"0xE221D5371EF7334a76aAC4f70b94DD80d1C18a00":31384.49833
  ,"0x43C4fF14DAe2Fbb389Dd94498C3D610A0c69a89d":27031.85162
  ,"0xb5AA18B5B83D0DD0e5B78EF72eF35d13Ed731A03":26717.43796
  ,"0x63DF7d9D7795883d56cA290f94aba8a6AA4F6f22":23116.13598
  ,"0x1568d689ee54dcAC6B2e4F1240c0C969da3EA195":4865.981554
  ,"0xA67D2c03c3cfe6177a60cAed0a4cfDA7C7a563e0":6895.211308
  ,"0xA66589142C46a20E747c68987A0CD46e5BC9fFC8":2325.931476
  ,"0xc6D3594E3605eeC43ecb479F552F7d21e28C38De":2279.513119
  ,"0x3c5Aac016EF2F178e8699D6208796A2D67557fe2":4350.281057
  ,"0xd25cDFFC867e96aD830731F26eeD0d7EF28BE2E0":1122.125636
  ,"0xF8F8DefF2bb1Ec297772c0dD16D399cDE0708946":968.0636173
  ,"0x357fe10b0CAa97c3d6cFB9987ceFA6e919eF7D1E":861.3435028
  ,"0x8dd83E67F2633F41509EdF1Cb65FBf0e9E4f9fe0":822.7820813
  ,"0xE32be3aA9b164357e9dF6e056431eaf8AA67bb19":754.6597084
  ,"0x4815Ee939fE2efeC2f7bc415f0cE2282f6417fe9":1743.920897
  ,"0x24ef39E84Abd49E36BB8d5b1952E00dD2365B604":691.9015322
  ,"0x212f7d290dd23d0Df08e9f9959758ed4Eb6705E9":1384.631989
  ,"0xd4cffd1Db38d276a412917CCC5B3460ea309F10C":548.7759177
  ,"0x4Ffc5F22770ab6046c8D66DABAe3A9CD1E7A03e7":468.543805
  ,"0xb79C662c667E056150d9BA0fec36217D6bB74049":1190.756886
  ,"0xf38b07B8ac72Ad70806E902c2ecFb7EdD36cA3f5":1044.536897
  ,"0xb6ba7bB854330285D3e608c76aEB33d4F14B1810":369.7142926
  ,"0x734e4186f3422614903c1463164ba1958127Ccb2":342.2360847
  ,"0x06FF56Da1bb2FE0dBf3c30E362f7eA05D5168620":623.1467764
  ,"0x8f786ff75A5dA2ee8A7eE2549dB464A5cbcdF718":297.0955778
  ,"0xE7026eaD5Ce701558Bdd20B85aD0F4A8C47F09e2":726.8855552
  ,"0x7a511663FA4C7bFa168bC920A29dC96992ca774e":253.6779122
  ,"0x768992817031203B010505F2C298e2e4f0510FEe":248.2320893
  ,"0xAC8b275b9ce0Fee06aBFB98ef20471A9E9dA56c4":231.9639514
  ,"0x0BdA0F33311E65379461D0A555BbD7669c0eaA22":624.0637615
  ,"0x6410BAC85BA91F23E7fd31a3994048EA2486f063":227.3185877
  ,"0x1AC41915889c4d958644968a473C8ca80eA54a69":225.0505575
  ,"0x45aDc095D1c01A404568dDcCA532BEB4f9c0C777":212.507756
  ,"0x3e6EdBa22D9cE22a7168406d26598AE20FE08e41":499.1500995
  ,"0xAa560Ad63cde52ac6249C493642CBd3Dc7E0B7a2":449.5983057
  ,"0x080DD66992DD18e17b4E7dA0341418B80b53Ef4C":174.6348581
  ,"0x09Fa38EBa245bb68354B8950FA2fe71f02863393":459.0964921
  ,"0x1Be88f58a765F79722363c67a0d9735668D60786":164.4622617
  ,"0xc4e5bf33d46A2f02d2375d5435747c4E731bEcaC":163.4995491
  ,"0x428b4f7347666915d738A7A68805243C19B83E18":148.8181808
  ,"0x7Fa4Ff7d05ec2c970A97Fa06A9D1141794d8c71F":148.366502
  ,"0x9ed786D41BefdC434e549C786C8Fc8841E14499C":143.1942153
  ,"0x2B89ab979798e4c4bec2D10c0393AeB0944B640d":119.3317461
  ,"0x47FE44e2A340a788F5faDd1ba91beF585f57A2CC":108.8642185
  ,"0x48C3A13eC8fF1B96269131135F69E0A6F6edB5e7":107.2345079
  ,"0xc265d8c5A2bDD6443713F4E88c5Ee767C3c80cb6":106.8628722
  ,"0x49920FA4F34476D18864215486bA0d40e66C6Fb7":104.8873025
  ,"0x005b753A8E7E2a7C24030284C20f5C3574191b72":247.3137461
  ,"0x6591a91f857a266101C79fD535f7E9EA7603a824":89.93091233
  ,"0x3Bb31C139aebEFdCE1d1c142362525bAbEA05D37":218.0395451
  ,"0xB1F4E4b9A137eD083c07a68620C88FC27f251040":84.56561182
  ,"0xe2860665106CebB46BE5E1388595feE42f43CA5D":83.56922606
  ,"0xCE5B6d4F24b06F9c93c42653695A26AB88f1B951":83.54837588
  ,"0x6c1333b30C53F132dD2D928d27892d89F110cbF8":81.9028852
  ,"0x14D4c1209938EB40a340CAd9c6bd7588D601881D":79.08546869
  ,"0xFD76660954e43f1022647E15F9582F536412190D":77.18150602
  ,"0x7cb6DE3Fe1Df1c4991489F95fc52EC3261ed624A":74.19839789
  ,"0x0E6bc05352AcF3098d14BF760283f0cc6d6Fea08":179.8249087
  ,"0x53de09a5097B3853d45F03849DD67a2eA8671FF6":70.26491884
  ,"0xB8922E08b04067470dF7bB242aF8d7361D3D0047":67.86347115
  ,"0x2Bf5Bf6977971E9428f4BF084D734f34e3eD9659":66.10717663
  ,"0x8Df2F71eC1948Eb7c497ffb51F1522F5B06A7A07":174.625133
  ,"0x97A691be9d335704C4FB63618Ae267b8e1bFE70a":62.90115567
  ,"0x62b0edABF08dB394d5559E72d113268D48A69f6B":62.49456496
  ,"0x2D5c6Fee1B585904Ea39110DA94d0cA9672EfD41":140.5795087
  ,"0x1bc2dd08c5332852CF647d746bC746B94d24950b":152.0737391
  ,"0xa9A979fcB2D8Caa59025A3fDD1Bc8A1b591162b6":150.3987669
  ,"0x7E97a8261Ba92479616899036ef303EBfEafE53D":54.21959199
  ,"0xB2515a7221b2654F9Faae0E4eD1d0E49Aa7B85DD":51.94985039
  ,"0x3ce21222573F66bbD7E216fE85196A20F41546b3":126.2913492
  ,"0x9F4E715fddc7c5a4C66a1F908927443Dcd9d7647":45.53856536
  ,"0x21feA8bB8603070E966E72AaBab83e0260433DFa":43.13063846
  ,"0x84b17C19424a487303630eE15659A8828Ff07DFc":42.49176154
  ,"0xd298C5399ae8D8DE121433a77b6fEf8e440034d5":42.22737035
  ,"0x789B3A661e6A48D386A3246606FCa9a8fFD1a75a":40.30773736
  ,"0xa3b926f6d2bB5507fE711847640bA2086CB11A75":103.4814808
  ,"0x02706C602c59F86Cc2EbD9aE662a25987A7C7986":103.08787
  ,"0xb81B07Beda149C6B0AEe849D210ABf2Ee655e525":101.0890408
  ,"0xaa695A6577702153B62bDc4347d13CF3FA6C398B":35.40276903
  ,"0x6C4a54e96E29FCd644d067f2f6dd54Cc3Fb8b21a":33.94352081
  ,"0x906b4a9f69C1bbC14EdC8D141B4A22DF6726592B":33.46215401
  ,"0xE7377048eDeec220187b3f3B3dCB8B621fE26EfB":83.60708545
  ,"0xbAc24192fD3FeF51f2671FA48e7B159A7191e8F5":79.35330683
  ,"0x4eaE4cda3F8c92cAA37E1dc5533824380985Db31":31.53934273
  ,"0x152c93a54F021bB5BD746786874EA7371C64dd1d":31.32838318
  ,"0x1bcC4dFF5Cf4e2a5EF2157A38f969De573882629":30.90163112
  ,"0x71742CC139223c3AD78a5f63D518F3C792A3f4C6":73.59823254
  ,"0xA79eAa96e4CCcF529Ad6318b8673e8e004c2d7D2":28.15822602
  ,"0xF7190722ca6387C4Da99b866f562021Dd02e442a":65.6497365
  ,"0xC95bd0c4144DF206890C1641D675C3c2C55108c4":25.68033058
  ,"0x9Cc2611b694DCc926aeB7a741F69d78AA9b58326":23.91633645
  ,"0x6E3e9A1dEeD0CCe220edE30F7c76f92AAdF1F078":56.45014795
  ,"0xBbf6aC1dc260aB7df6bE45fDA98FF41f869F2873":21.58041145
  ,"0x09074E4D60F8014bc8bf31bD48142C158Eb88B61":21.06611411
  ,"0xee7a39Cc7f708937f8c48C5e93d2d165267d3C8c":20.89336511
  ,"0x97470C1De3Af46E6291865fd8F1c401B39F5BfD9":20.15072333
  ,"0x05CBD6Fd7175274DC4579bD171Cff7270c344482":19.26149511
  ,"0xcF0dF836B234e3896185C3E24fe359f960af49b7":16.68738378
  ,"0xb11BEA1080317bAe244429a9491a8d5A6F29A229":16.48785313
  ,"0xF662bD348766349AdE94BBbfd523CeCcC6049145":15.47429245
  ,"0xe3Cd03a78f302eF1DfEc4D589D7EAD806eea37d3":14.08114162
  ,"0xb27C97Ff379cf77f1d190E67DfC62eb2F9Ed8556":10.60170961
  ,"0x75AEC1D6Bdb2d63BeCFd6c65A01f3E2175B98A62":26.23665892
  ,"0xA0801EB72eac6FF68457cA96E952AA96cd491557":8.902086497
  ,"0x4Fe49089770fE363fB07b5c19495c23B2863BeE6":18.21381761
  ,"0x32B8e1991c337c4dBD6F2789b7aA66164024C72a":7.000041288
  ,"0xd866529875D9498f0C75266aCc5620e38B59D6C3":6.106853134
  ,"0xA1EECA974975c29d84B4612DaBCDfb4128Cd21B4":6.069020901
  ,"0xB4a6E5E088325096dc87E43D24D31dE6212795C4":5.81736449
  ,"0x29199E981e293c9FB4134586094DE3C65Cf6DD19":15.62081781
  ,"0xc66cbf3e4a7aFa55b2600a197910faB4767954a4":13.63771868
  ,"0x8e5360Cc37EE2f1c07381937130214d3eeb04FE1":5.001630048
  ,"0x201b7d836751B9766e38f9840FC62DAcE0458fda":4.719553381
  ,"0x1B560c8157F8baCDD7B39fdb5fFF10938acf2420":4.390860111
  ,"0x09d7b566f83819Dc870467A589B70aa6EF2CE5b2":4.034273183
  ,"0xA739d85016F816A0Bb2C359db0fe25587eDf488B":3.860325649
  ,"0x6a65cC8e3Aa35bd8c8a5BF6A2aA335A5EC73Cd1B":2.720070674
  ,"0x33D935Ac178fa68C62AC5D199aE44519Fe026B4A":2.561630163
  ,"0xedfe87301BD9aA18b4ed5B5BE222F781E5b9160B":2.506070034
  ,"0xbd056Ec1deE313f88F2aeb5C3F529D6A14774ABB":0.810557641
  ,"0x54e05ecD036E05143f3A455355b08e6cBbAAAd9a":1.150998541
  ,"0x3D6991085Ab1ae3926cB96f25684C40a364B6856":0.867795087
  ,"0x86aA0f0231A2267BC0ee99Be06D5d5609f08205A":0.807061914
  ,"0xe5d81171D523cc6E68F5348710F3a62b2c6e795c":0.046485882}
}
function convertJSONToPayoutInfo (data) {
  let payoutData = {}
  for (let i = 0; i < data.length; i++) {
    payoutData[data[i].address] = data[i].payoutUSD
  }
  return payoutData
}

/**
 * 
 * @param {*} json 
 * @param {*} name requires .json at end
 */
function writeJSON(json, name) {
  let data = JSON.stringify(json);
  fs.writeFileSync(path.resolve(__dirname, "../../../../payouts", name) || 'data.json', data);
  console.log(`json written to ${name || 'data.json'}`)
} 

/**
 * 
 * @param {*} csv 
 * @param {*} name requires .csv at end
 */
function writeCSV(csv, name) {
  // let data = JSON.stringify(csv);
  fs.writeFileSync(path.resolve(__dirname, "../../../../payouts", name) || 'data.csv', csv);
  console.log(`csv written to ${name || 'data.csv'}`)
  fs.pat
} 

async function main(lastHoldingsAddresses, currentHoldingsAddresses, proposalId, pool, limit, cre8rPrice = 0.03212, cre8rBasicPayoutperPercent = 742) {
  // console.log paramaters used in main function 
  console.log(`lastHoldingsAddresses: ${lastHoldingsAddresses}`)
  console.log(`currentHoldingsAddresses: ${currentHoldingsAddresses}`)
  console.log(`proposalId: ${proposalId}`)
  console.log(`pool: ${pool}`)
  console.log(`limit: ${limit}`)
  console.log(`cre8rPrice: ${cre8rPrice}`)
  console.log(`cre8rBasicPayoutperPercent: ${cre8rBasicPayoutperPercent}`)
  // calculate the average payoutUSD
  
  
  let lastPayouts;
  if (lastHoldingsAddresses == beetsBlockRound11) {
    lastPayouts = getLastPayoutRound11();
  } else {
    let lastPayoutsData;
    try {
      lastPayoutsData = require(path.resolve(__dirname, "../../../../payouts", `bribe-payouts-${lastHoldingsAddresses}.json`))
    } catch(e) {
      console.log(e)
      console.error(`\n 🚨🚨🚨🚨🚨🚨 ERROR 🚨🚨🚨🚨🚨🚨 \n \n 🚨Make sure that ${path.resolve(__dirname, "../../../../payouts", `bribe-payouts-${lastHoldingsAddresses}.json`)} exists.🚨
      \n
      When you run this script, it generates a json with the csv as metadata so that it can get the last snapshots payout.
      `)
      return;
    }
    lastPayouts = convertJSONToPayoutInfo(lastPayoutsData);
  }
  
  const {percent, poolPos} = await getPercentAndPoolPos(proposalId, pool);
  const {voters, total, addresses} = await getVotes(proposalId, poolPos)

  let lastHoldings;
  let currentHoldings;
  try {
    lastHoldings = await getHoldings(addresses, lastHoldingsAddresses)
    currentHoldings = await getHoldings(addresses, currentHoldingsAddresses)
  } catch (e) {
    console.error(`🚨🚨 FAILED to get holdings from snapshot API: try running this script later`)
  }

  const {payouts, debug} = calcPayouts(addresses, voters, total, percent, lastHoldings, currentHoldings, lastPayouts, cre8rPrice, cre8rBasicPayoutperPercent, limit)
  const debugCSV = parseJSONToCSV(debug)
  // 
  writeJSON(debug, `bribe-payouts-${currentHoldingsAddresses}.json`)
  writeCSV(debugCSV, `bribe-payouts-${currentHoldingsAddresses}.csv`)
}

/**
 * 
 * @param {*} addresses 
 * @param {*} voters 
 * @param {*} total 
 * @param {*} percent 
 * @param {*} holdings11 
 * @param {*} holdings12 
 * @param {*} lastPayouts 
 * @param {*} cre8rPrice 
 * @param {*} cre8rBasicPayoutperPercent 
 * @param {*} limit 
 * @returns {{payout: any, address: any}}
 */
function calcPayouts(addresses, voters, total, percent, lastHoldingsAddresses, currentHoldingsAddresses, lastPayouts, cre8rPrice, cre8rBasicPayoutperPercent, limit) {
  const payouts = []
  const debug = []
  for (let i = 0; i < addresses.length && (limit == null ? true : i < limit) ; i += 1) {
    let a = addresses[i]
    let currentHoldings = currentHoldingsAddresses[a] || 0
    let lastHoldings = lastHoldingsAddresses[a] || 0
    let lastWeekPayout = lastPayouts[a] || 0
    let dif = currentHoldings - (lastHoldings + lastWeekPayout) // a negative holding means that a used
    let basicBribe = voters[a]/total * 100 * percent * cre8rBasicPayoutperPercent 
    // totalPayoutAtBasic = percent * 100 * cre8rBasicPayoutperPercent 
    // basicBribe = ratio / cre8rPrice * percent * cre8rBasicPayoutperPercent
    //payouts
    let bogusestBribe = 0
    let basicBoost = 0
    let boostedBribe = 0
    let boostedBonus = 0
    let payoutUSD = 0
    
    if (dif <= -currentHoldings * .1) { //why do we need the &&? could we remove currentHoldings?
      bogusestBribe = basicBribe * 0.5
    }
  
    if (currentHoldings > (basicBribe*3) && lastWeekPayout == 0) {
      basicBoost = basicBribe * 1.1
    }
  
    if (currentHoldings * 1.2 >= lastHoldings + lastWeekPayout) {
      boostedBribe = basicBribe * 1.25
    } else if (currentHoldings > lastHoldings) {
      boostedBribe = basicBribe
    }
  
    if (currentHoldings > (lastHoldings + lastWeekPayout) + lastHoldings*0.35) { // currentHoldings > lastHoldings*1.35 + lastWeekPayout
      boostedBonus = basicBribe * 1.35
    }

    if (bogusestBribe) {
      payoutUSD = bogusestBribe
    } else {
      payoutUSD = Math.max(basicBribe, basicBoost, boostedBribe, boostedBonus)
    } 
    let debugBribes = {
      address: a,
      in: {
        ratio: voters[a]/total,
        currentHoldings,
        lastHoldings,
        lastWeekPayout,
        dif,
        cre8rPrice,
        basicBribe
      },
      out: {
        bogusestBribe,
        basicBoost,
        boostedBribe,
        boostedBonus,
        payoutUSD,
        payoutCre8r: payoutUSD/cre8rPrice
      }
    }

    // console.log(debugBribes)
    debug.push({address: debugBribes.address, in: '',...debugBribes.in,out: '', ...debugBribes.out})
    payouts.push({address: a, payout: payoutUSD})
  }
  return {payouts, debug}
}

/**
 * Must be in format 
 * @param {[{field1: data, field2: any, ...}, ...]} myData 
 */
function parseJSONToCSV (myData) {
  const { parse } = require('json2csv');
  const opts = { fields: Object.keys(myData[0]) };

  try {
    const csv = parse(myData, opts);
    return csv
  } catch (err) {
    console.error(err);
  }
}

process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
  // 0 is useless
  // 1 is path
  // 2 is variable
});

const beetsBlockRound13 = 41098725
const beetsBlockRound11 = 39001234
const beetsBlockRound12 = 40013791 
const proposalId13 = "0x6e0973f4061c83b40ed8397bf7518e50c8519fd860b8e2476d7733bf71c4d0a9";
const cre8rPrice = 0.0158;
const basicBribe = 742;

(async () => {
  main(beetsBlockRound12, beetsBlockRound13, proposalId13, pool , undefined, cre8rPrice, basicBribe) //todo - dynamically get cre8r price
})()
//todo - read about best practices when writing scripts like this, (testing, coverage, readable)

//`yarn payouts` to run the script


//This file writes the file `data-${timestamp}.csv`
/*

So if we are doing payout for beets block round 11 to round 12, the bribe-payouts-40013791.csv
40013791 is the block number of round 12

`bribe-payouts-${currentHoldingsAddresses}.csv`
*/