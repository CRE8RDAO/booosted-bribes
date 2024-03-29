const {
  getHoldings,
  getVotes,
  getPercentAndPoolPos,
  getLastPayoutinCRE8R,
} = require("./data");

const { calcPayouts } = require("./math");

const { writeJSON, writeCSV, parseJSONToCSV } = require("./utils");

function consoleLogResults(payouts, percent, basicBribe) {
  const percentAsPercent = (percent * 100).toFixed(2);
  const payoutIfOnlyBasicBribe = percentAsPercent * basicBribe;
  const actualPayout = payouts.reduce((p, c) => p + c.payout, 0);
  console.log(`percent vote is: ${percentAsPercent}%`);
  console.log(
    `payout if only basic bribe: $${payoutIfOnlyBasicBribe.toFixed(2)}`
  );
  console.log(`actual payout (boosted bribes): $${actualPayout.toFixed(2)}`);
  console.log(
    `Assuming beets price is $${beetsPrice}, and ${totalBeetsEmissionsToFarms} beets * percentVote are emitted to cre8r-ftm farm, value of beets generated: $${(
      beetsPrice *
      totalBeetsEmissionsToFarms *
      percent
    ).toFixed(2)}`
  );
}

async function main(
  holdingsLastRound,
  holdingsCurrentRound,
  proposalId,
  pool,
  limit,
  cre8rPrice = 0.03212,
  cre8rBasicPayoutperPercent = 742,
  hasBonanza
) {
  // console.log paramaters used in main function
  console.log(`holdingsLastRound: ${holdingsLastRound}`);
  console.log(`holdingsCurrentRound: ${holdingsCurrentRound}`);
  console.log(`proposalId: ${proposalId}`);
  console.log(`pool: ${pool}`);
  console.log(`limit: ${limit}`);
  console.log(`cre8rPrice: ${cre8rPrice}`);
  console.log(`cre8rBasicPayoutperPercent: ${cre8rBasicPayoutperPercent}`);
  // calculate the average payoutUSD

  let lastPayouts = getLastPayoutinCRE8R(holdingsLastRound);

  const { percent, poolPos } = await getPercentAndPoolPos(proposalId, pool);
  const { voters, total, addresses } = await getVotes(proposalId, poolPos);
  console.log(addresses.length, "asdfasdf");
  let lastHoldings;
  let currentHoldings;
  try {
    lastHoldings = await getHoldings(addresses, holdingsLastRound);
    currentHoldings = await getHoldings(addresses, holdingsCurrentRound);
  } catch (e) {
    console.error(e);
    console.error(
      `🚨🚨 FAILED to get holdings from snapshot API: try running this script later`
    );
    throw "Error with getHoldings";
  }

  const { payouts, debug } = calcPayouts(
    addresses,
    voters,
    total,
    percent,
    lastHoldings,
    currentHoldings,
    lastPayouts,
    cre8rPrice,
    cre8rBasicPayoutperPercent,
    limit,
    hasBonanza
  );

  consoleLogResults(payouts, percent, cre8rBasicPayoutperPercent);

  const debugCSV = parseJSONToCSV(debug);
  //
  writeJSON(debug, `bribe-payouts-${holdingsCurrentRound}.json`);
  writeCSV(debugCSV, `bribe-payouts-${holdingsCurrentRound}.csv`);
}

process.argv.forEach(function (val, index, array) {
  console.log(index + ": " + val);
  // 0 is useless
  // 1 is path
  // 2 is variable
});

const beetsBlockRounds = [
  39001234, //11
  40013791, //12
  41098725, //13
  42006392, //14
  43050170, //15
  44457923, //16 delayed
  45482115, //17 delayed
  46563257, //18 delayed
  //Step 1: enter a blockround 3 days after beets round 16
];
const proposalIds = [
  "0x9e89981a236c0de1aa0876eabc95537f7b2b33779c0942a81a5e5d0accc32a56", //14
  "0x9b3b328e77e2d5b99a26ede7b4f6c36ee0bf6b4c06241e84f50f01735270d6e9", //15
  "0xbc5785e1323c70986d77d33ab734c1c18f122c2a6082f84fbc437c549d8b84ad", //16
  "0xf161196029cb7848d69154c87884de87c5c7a6d41686c9e7346bdc39d3620325", //17
  "0xa043b7eea5b8714c80f8c7c0caf7b6246e3ee20f1474ce717ee3301d848bed2d",
  //Step 2: enter proposal id
];
const hasBonanza = [
  false, //15
  false, //16
  false, //17
  false,
]; //when price goes up

const poolChoiceName = "CRE8R in F-Major (CRE8R-FTM)";
const cre8rPrice = 0.00663; //@dunks update cre8r price
const totalBeetsEmissionsToFarms = 569576; //check if month emissions is correct: https://docs.google.com/spreadsheets/d/1zFzIpptDMebyqoPgtPNCNFEvsZcpK_6GtGEOfFOkDKU/edit#gid=386276691
const beetsPrice = 0.0494;
const basicBribeForOnePercent = Math.max(
  (totalBeetsEmissionsToFarms * beetsPrice) / 100,
  320
); //@dunks check basicbribe price

//@dunks Then run `node payouts/generatePayouts.js`

//NOTE: for round 16, need to use the payouts for the bribe payouts of `bugged-this was paid out` but then use the correct vp balance
main(
  beetsBlockRounds[beetsBlockRounds.length - 2],
  beetsBlockRounds[beetsBlockRounds.length - 1],
  proposalIds[proposalIds.length - 1],
  poolChoiceName,
  undefined,
  cre8rPrice,
  basicBribeForOnePercent,
  hasBonanza[hasBonanza.length - 1]
)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(0);
  });

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
