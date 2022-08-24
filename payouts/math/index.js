const MARGIN_OF_ERROR = 0.005 // 0.5% percent
const vaultAddresses = [
  "0xeD4DBA0795965119D187DA57E080069Cd3415650"
]
/**
 * 
 * @param {string[]} addresses 
 * @param {{[address: string]: number}} voterToFBEETS 
 * @param {number} totalFBeetsVotedForCRE8R 
 * @param {number} percentVoteForCre8r 
 * @param {{[address: string]: number}} lastHoldingsAddressesInCRE8R 
 * @param {{[address: string]: number}} currentHoldingsAddressesInCRE8R 
 * @param {{[address: string]: number}} lastPayoutsInCRE8R 
 * @param {number} cre8rPrice 
 * @param {number} cre8rBasicPayoutperPercent 
 * @param {number | undefined} limit 
 * @param {number | undefined} hasBonanza 
 * @returns 
 */
function calcPayouts(
  addresses, 
  voterToFBEETS, 
  totalFBeetsVotedForCRE8R, 
  percentVoteForCre8r, 
  lastHoldingsAddressesInCRE8R, 
  currentHoldingsAddressesInCRE8R, 
  lastPayoutsInCRE8R, 
  cre8rPrice, 
  cre8rBasicPayoutperPercent, 
  limit, 
  hasBonanza
) {
  const payouts = []
  const debug = []
  for (let i = 0; i < addresses.length && (limit == null ? true : i < limit) ; i += 1) {
    const a = addresses[i]
    const currentHoldings = currentHoldingsAddressesInCRE8R[a] || 0
    const lastHoldings = lastHoldingsAddressesInCRE8R[a] || 0
    const lastWeekPayoutInCRE8R = lastPayoutsInCRE8R[a] || 0
    const dif = currentHoldings - (lastHoldings + lastWeekPayoutInCRE8R) // a negative holding means that a used
    const basicBribeUSD = voterToFBEETS[a]/totalFBeetsVotedForCRE8R * 100 * percentVoteForCre8r * cre8rBasicPayoutperPercent 
    // totalPayoutAtBasic = percent * 100 * cre8rBasicPayoutperPercent 
    // basicBribe = ratio / cre8rPrice * percent * cre8rBasicPayoutperPercent
    //payouts $CRE8R
    let bogusestBribe = 0
    let basicBoost = 0
    let boostedBribe = 0
    let boostedBonus = 0
    let boostedBonanza = 0

    //payouts $AMP
    let basicBoost2 = 0;
    let boostedBonus2 = 0;

    if (dif <= -currentHoldings * .04) { //why do we need the &&? could we remove currentHoldings?
      bogusestBribe = basicBribeUSD * 0.5
    } else {
      const hasLp3x = currentHoldings * (1 - MARGIN_OF_ERROR) > (basicBribeUSD*3)
      if (hasLp3x && lastWeekPayoutInCRE8R == 0) {
        basicBoost = basicBribeUSD * 1.1
      }
      
      if (hasLp3x && currentHoldings * 1.2  * (1 - MARGIN_OF_ERROR) >= lastHoldings + lastWeekPayoutInCRE8R) {
        boostedBribe = basicBribeUSD * 1.25
      }
      if (hasLp3x && currentHoldings * (1 - MARGIN_OF_ERROR) > (lastWeekPayoutInCRE8R + lastHoldings) * 1.35) { // currentHoldings > lastHoldings*1.35 + lastWeekPayout
        boostedBonus = basicBribeUSD * 1.35
        if (hasBonanza) {
          boostedBonanza = basicBribeUSD * 1.6
        }
      }
  
      if (hasLp3x) {
        const ratioLP = currentHoldings / basicBribeUSD
        const multiplierLP = (Math.min(6, (ratioLP)) - 3) * 1/3
        basicBoost2 = Math.max(0, multiplierLP * basicBribeUSD * 1.1) //basicBoost = basicBribeUSD * 1.1
  
        const ratioHoldings = currentHoldings / lastHoldings
        const multiplierHoldings = (Math.min(2, ratioHoldings) - 1.35) * 1 / 1.65 / 2
        // boostedBonus2 += multiplierHoldings * boostedBonus //extra bonus
        
        const excessCre8r = Math.max(0, currentHoldings - (lastHoldings + lastWeekPayoutInCRE8R)*1.35)
        
        boostedBonus2 = Math.max(0, multiplierHoldings * excessCre8r * cre8rPrice)
        
      }
    }


    let payoutUSD = 0
    if (vaultAddresses.find(vAddress => vAddress === a)) {
      payoutUSD = basicBribeUSD * 1.25 //boostedBribe reward
    } else if (bogusestBribe) {
      payoutUSD = bogusestBribe
    } else {
      payoutUSD = Math.max(basicBribeUSD, basicBoost, boostedBribe, boostedBonus, boostedBonanza)
    } 
    const debugBribes = {
      address: a,
      in: {
        ratio: voterToFBEETS[a]/totalFBeetsVotedForCRE8R,
        currentHoldings,
        lastHoldings,
        lastWeekPayoutInCRE8R,
        dif,
        cre8rPrice,
        basicBribe: basicBribeUSD
      },
      out: {
        bogusestBribe,
        basicBoost,
        boostedBribe,
        boostedBonus,
        boostedBonanza,
        payoutUSD,
        payoutCre8r: payoutUSD/cre8rPrice,
        payoutCre8rInUSD: payoutUSD,
        basicBoost2AmpInUSD: basicBoost2,
        boostedBonus2AmpInUSD: boostedBonus2,
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