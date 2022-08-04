/**
 * 
 * @param {string[]} addresses 
 * @param {{[address: string]: number}} voters fBeets voter voted on cre8r for
 * @param {number} total total fBeets that voted for cre8r
 * @param {*} percent - percent vote won for beets snapshot in decimal
 * @param {{[address: string]: number}} lastHoldingsAddresses addresses -> holdings
 * @param {{[address: string]: number}} currentHoldingsAddresses addresses -> holdings
 * @param {{[address: string]: number}} lastPayouts addresses -> lastPayout in cre8r
 * @param {*} cre8rPrice in USD 
 * @param {*} cre8rBasicPayoutperPercent in USD, this is the basic bribe paid per a percent of the vote
 * @param {*} limit 
 * @returns {{payout: any, address: any}}
 */
function calcPayouts(addresses, voters, total, percent, lastHoldingsAddresses, currentHoldingsAddresses, lastPayouts, cre8rPrice, cre8rBasicPayoutperPercent, limit, hasBonanza) {
  const payouts = []
  const debug = []
  for (let i = 0; i < addresses.length && (limit == null ? true : i < limit) ; i += 1) {
    let a = addresses[i]
    let currentHoldings = currentHoldingsAddresses[a] || 0
    let lastHoldings = lastHoldingsAddresses[a] || 0
    let lastWeekPayoutInCRE8R = lastPayouts[a] || 0
    let dif = currentHoldings - (lastHoldings + lastWeekPayoutInCRE8R) // a negative holding means that a used
    let basicBribe = voters[a]/total * 100 * percent * cre8rBasicPayoutperPercent 
    // totalPayoutAtBasicToAllCre8rVoters = 100 * percent * cre8rBasicPayoutperPercent 
    // basicBribe = ratio / cre8rPrice * percent * cre8rBasicPayoutperPercent
    //payouts
    let bogusestBribe = 0
    let basicBoost = 0
    let boostedBribe = 0
    let boostedBonus = 0
    let boostedBonanza = 0
    let payoutUSD = 0
    if (dif <= -currentHoldings * .04) { //why do we need the &&? could we remove currentHoldings?
      bogusestBribe = basicBribe * 0.5
    }
  
    if (currentHoldings > (basicBribe*3) && lastWeekPayoutInCRE8R == 0) {
      basicBoost = basicBribe * 1.1
    }
  
    if (basicBoost && currentHoldings >= lastHoldings + lastWeekPayoutInCRE8R && lastWeekPayoutInCRE8R != 0) {
      boostedBribe = basicBribe * 1.25
    }

    if (basicBoost && currentHoldings > lastWeekPayoutInCRE8R + lastHoldings*1.35  && lastWeekPayoutInCRE8R != 0) { // currentHoldings > lastHoldings*1.35 + lastWeekPayout
      boostedBonus = basicBribe * 1.6
      if (hasBonanza) {
        boostedBonanza = basicBribe * 1.6
      }
    }

    if (bogusestBribe) {
      payoutUSD = bogusestBribe
    } else {
      payoutUSD = Math.max(basicBribe, basicBoost, boostedBribe, boostedBonus, boostedBonanza)
    } 
    let debugBribes = {
      address: a,
      in: {
        ratio: voters[a]/total,
        currentHoldings,
        lastHoldings,
        lastWeekPayoutInCRE8R,
        dif,
        cre8rPrice,
        basicBribe
      },
      out: {
        bogusestBribe,
        basicBoost,
        boostedBribe,
        boostedBonus,
        boostedBonanza,
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
 * Assumes that there are only 2 tokens in the lp pool that are of value
 * @param {BigNumber} circulatingSupply 
 * @param {BigNumber} token1Amount 
 * @param {BigNumber} token1Price 
 * @param {BigNumber} token2Amount 
 * @param {BigNumber} token2Price 
 * @returns 
 */
function calculateLPTokenPriceInUSD (circulatingSupply, token1Amount, token1Price, token2Amount, token2Price) {
  return token1Amount.mul(token1Price).add(token2Amount.mul(token2Price)).div(circulatingSupply )
}

module.exports = {
  calcPayouts,
  calculateLPTokenPriceInUSD
}