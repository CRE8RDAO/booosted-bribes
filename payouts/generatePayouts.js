const {
  getHoldings,
  getVotes,
  getPercentAndPoolPos,
  getLastPayout
} = require('./data')

const {
  calcPayouts
} = require('./math')

const {
  writeJSON,
  writeCSV,
  parseJSONToCSV
} = require('./utils')

async function main(holdingsLastRound, holdingsCurrentRound, proposalId, pool, limit, cre8rPrice = 0.03212, cre8rBasicPayoutperPercent = 742) {
  // console.log paramaters used in main function 
  console.log(`holdingsLastRound: ${holdingsLastRound}`)
  console.log(`holdingsCurrentRound: ${holdingsCurrentRound}`)
  console.log(`proposalId: ${proposalId}`)
  console.log(`pool: ${pool}`)
  console.log(`limit: ${limit}`)
  console.log(`cre8rPrice: ${cre8rPrice}`)
  console.log(`cre8rBasicPayoutperPercent: ${cre8rBasicPayoutperPercent}`)
  // calculate the average payoutUSD
  
  
  let lastPayouts = getLastPayout(holdingsLastRound)
  
  const {percent, poolPos} = await getPercentAndPoolPos(proposalId, pool);
  const {voters, total, addresses} = await getVotes(proposalId, poolPos)
  console.log(addresses.length , "asdfasdf")
  let lastHoldings;
  let currentHoldings;
  try {
    lastHoldings = await getHoldings(addresses, holdingsLastRound)
    currentHoldings = await getHoldings(addresses, holdingsCurrentRound)
  } catch (e) {
    console.error(e)
    console.error(`🚨🚨 FAILED to get holdings from snapshot API: try running this script later`)
    throw 'Error with getHoldings'
  }

  const {payouts, debug} = calcPayouts(addresses, voters, total, percent, lastHoldings, currentHoldings, lastPayouts, cre8rPrice, cre8rBasicPayoutperPercent, limit)
  const debugCSV = parseJSONToCSV(debug)
  // 
  writeJSON(debug, `bribe-payouts-${holdingsCurrentRound}.json`)
  writeCSV(debugCSV, `bribe-payouts-${holdingsCurrentRound}.csv`)
}

process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
  // 0 is useless
  // 1 is path
  // 2 is variable
});

const beetsBlockRounds = [
  39001234,//11
  40013791,//12
  41098725,//13
  42006392,//14
  43050170,//15
]
const proposalIds = [
  "0x9e89981a236c0de1aa0876eabc95537f7b2b33779c0942a81a5e5d0accc32a56", //14
  "0x9b3b328e77e2d5b99a26ede7b4f6c36ee0bf6b4c06241e84f50f01735270d6e9", //15
]
const poolChoiceName = "CRE8R in F-Major (CRE8R-FTM)"

const cre8rPrice = 0.01602;
const basicBribe = 647.7; 
main(beetsBlockRounds[beetsBlockRounds.length-2], beetsBlockRounds[beetsBlockRounds.length-1], proposalIds[proposalIds.length-1], poolChoiceName, undefined, cre8rPrice, basicBribe).then(() => {
  process.exit(0);
}).catch((error) => {
  console.error(error);
  process.exit(0);
})

//todo - need to figure out cre8r price logic (ie: how to not punish cre8r voters based on cre8r price changes)
//todo - read about best practices when writing scripts like this, (testing, coverage, readable)

//`yarn payouts` to run the script


//This file writes the file `data-${timestamp}.csv`
/*

So if we are doing payout for beets block round 11 to round 12, the bribe-payouts-40013791.csv
40013791 is the block number of round 12

`bribe-payouts-${currentHoldingsAddresses}.csv`
*/

//todo tests
/*
sum the payout in usd should be the same as the percentage of the vote times the basic bribes


*/