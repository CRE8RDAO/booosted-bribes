const snapshot = require('@snapshot-labs/snapshot.js');
const {ApolloClient, gql, HttpLink, InMemoryCache} = require('@apollo/client')
const fetch = require('cross-fetch')
const bribeSettings = require('./strategies')
const path = require('path');
const ethers = require('ethers');
const {
  calculateLPTokenPriceInUSD
} = require('../math');

const pool = "CRE8R in F-Major (CRE8R-FTM)"

const RELATIVE_PATH = "../out"

const client = new ApolloClient({
  link: new HttpLink({ uri: 'https://hub.snapshot.org/graphql', fetch }),
  cache: new InMemoryCache(),
});

/**
 * 
 * @param {*} addresses 
 * @param {*} blockNumber 
 * @returns promise
 */
function getHoldings(addresses, blockNumber) {
  return snapshot.utils.getScores(
    'cre8r',
    [...bribeSettings.strategies], 
    bribeSettings.network,
    [...addresses],
    blockNumber
  ).then(scores => {
    if (!scores) {
      console.error('Unable to fetch from scores')
      return;
    }
    
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
    //todo: pull dynamically
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
      console.log(poolPos)
      return {percent, poolPos: poolPos.toString()}
    }
    throw new Error('percent not found, check if you have a valid proposal id')
}

/**
 * 
 * @returns payout in cre8r on round 11
 */
function getLastPayoutRound11() {
  return require('./round11AddressesToPayout') / 0.011 // about the cre8r price at round 11
}

function convertJSONToPayoutCRE8RInfo (data) {
  let payoutData = {}
  for (let i = 0; i < data.length; i++) {
    payoutData[data[i].address] = data[i].payoutCre8r
  }
  return payoutData
}

const beetsBlockRound11 = 39001234
const FILE_MODE = '' // in some cases, manual overrides of the data is required. ex: -correct-state
/**
 * 
 * @param {*} lastHoldingsAddresses 
 * @returns lastPayouts in cre8r
 */
function getLastPayoutinCRE8R(lastHoldingsAddresses) {
  if (lastHoldingsAddresses == beetsBlockRound11) {
    return getLastPayoutRound11();
  } else {
    let lastPayoutsData;
    try {
      lastPayoutsData = require(path.resolve(__dirname, RELATIVE_PATH, `bribe-payouts-${lastHoldingsAddresses}${FILE_MODE}.json`))
    } catch(e) {
      console.log(e)
      console.error(`\n 🚨🚨🚨🚨🚨🚨 ERROR 🚨🚨🚨🚨🚨🚨 \n \n 🚨Make sure that ${path.resolve(__dirname, RELATIVE_PATH, `bribe-payouts-${lastHoldingsAddresses}${FILE_MODE}.json`)} exists.🚨
      \n
      When you run this script, it generates a json with the csv as metadata so that it can get the last snapshots payout.
      `)
      throw 'ERROR ^^^'
      return;
    }
    return convertJSONToPayoutCRE8RInfo(lastPayoutsData);
  }
}

async function getCRE8RPrice() {
  return fetch("https://api.dexscreener.com/latest/dex/pairs/fantom/0xbb4607bede4610e80d35c15692efcb7807a2d0a6000200000000000000000140-0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83-0x2aD402655243203fcfa7dCB62F8A08cc2BA88ae0").then(res => {
    if (res.status >= 400) {
      throw new Error("Bad response from server");
    }
    return res.json();
  }).then(data => {
    if (data.schemaVersion !== '1.0.0') {
      throw 'Schema was updated, please confirm mappings are still correct'
    }
    return data.pairs[0].priceUsd
  })
}

async function getFTMPrice() {
  return fetch("https://min-api.cryptocompare.com/data/pricemultifull?fsyms=FTM&tsyms=USD").then(res => {
    if (res.status >= 400) {
      throw new Error("Bad response from server");
    }
    return res.json();
  }).then(data => {
    return data.RAW.FTM.USD.PRICE
  })
}

async function getTokenBalance(provider, erc20Abi, erc20Address, account) {
  const contract = new ethers.Contract(erc20Address, erc20Abi, provider);
  return await contract.balanceOf(account);
}

async function getTotalSupply(provider, erc20Abi, erc20Address) {
  const contract = new ethers.Contract(erc20Address, erc20Abi, provider);
  return await contract.totalSupply();
}
function convertPriceToBigNumber(price) {
  return parseFloat(price.toString()).toFixed(5)*1e18
}
async function getSpiritLPCRE8R (){
  const provider = new ethers.providers.JsonRpcProvider("https://rpcapi.fantom.network");
  const ERC20_ABI = require('../abi/ERC20-abi.json');
  const ftmAddress = "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83";
  const cre8rAddress = "0x2aD402655243203fcfa7dCB62F8A08cc2BA88ae0";
  const spiritLPCRE8rAddress = "0x459e7c947E04d73687e786E4A48815005dFBd49A";
  const ftmBalance = await getTokenBalance(provider, ERC20_ABI, ftmAddress, spiritLPCRE8rAddress)
  const cre8rBalance = await getTokenBalance(provider, ERC20_ABI, cre8rAddress, spiritLPCRE8rAddress)
  const circulatingSupply = await getTotalSupply(provider, ERC20_ABI, spiritLPCRE8rAddress);
  const cre8rPrice = convertPriceToBigNumber(await getCRE8RPrice()).toString();
  const ftmPrice = convertPriceToBigNumber(await getFTMPrice()).toString();
  const spiritLPCRE8RPrice = calculateLPTokenPriceInUSD(circulatingSupply, ftmBalance, ftmPrice, cre8rBalance, cre8rPrice);

  console.log(`cre8rPrice: ${ethers.utils.formatUnits(cre8rPrice, 18)}`)
  console.log(`ftmPrice: ${ethers.utils.formatUnits(ftmPrice, 18)}`)
  console.log(`spiritLPCRE8RPrice: ${ethers.utils.formatUnits(spiritLPCRE8RPrice, 18)}`)
}


const beetsClient = new ApolloClient({
  link: new HttpLink({ uri: 'https://backend.beets-ftm-node.com/graphql', fetch }),
  cache: new InMemoryCache(),
});

const beetsPoolQuery = gql`
query BeetsPool($id: String!) {
  pool (id: $id){
    totalShares
    tokensList
    totalLiquidity
  
  }
}

`

async function getBeetsLPCRE8R () {
  const poolId = "0xbb4607bede4610e80d35c15692efcb7807a2d0a6000200000000000000000140"
  const { loading, error, data } = await beetsClient.query({
    query: beetsPoolQuery,
    variables: {
      "id": poolId
    }
  })
  if (data) {
    console.log(`lpCRE8RBeets: ${parseFloat(data.pool.totalLiquidity)/parseFloat(data.pool.totalShares)}`)
  } else {
    console.error(error)
  }
  // console.log(`cre8rPrice: ${ethers.utils.formatUnits(cre8rPrice, 18)}`)
  // console.log(`ftmPrice: ${ethers.utils.formatUnits(ftmPrice, 18)}`)
  // console.log(`lpCRE8RBeets: ${ethers.utils.formatUnits(spiritLPCRE8RPrice, 18)}`)
}

// getCRE8RPrice()
//getFTMPrice()
// getSpiritLPCRE8R()

// getBeetsLPCRE8R()
module.exports = {
  getHoldings,
  getVotes,
  getPercentAndPoolPos,
  convertJSONToPayoutCRE8RInfo,
  getLastPayoutinCRE8R
}