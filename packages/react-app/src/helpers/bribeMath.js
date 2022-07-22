import {TOTALVOTINGPOWER, BASICBRIBEFOR100} from '../config'
/**
 * 
 * @param {*} beetsScore 
 * @param {*} totalVotingPower 
 * @param {*} thisWeeksBasicBribeAmount Total Bribe payout at basic for 100%
 * @returns 
 */
export function calculateBasicBoosted (beetsScore, totalVotingPower = TOTALVOTINGPOWER,thisWeeksBasicBribeAmount = BASICBRIBEFOR100) {
  const basicBoostedForAddress = (beetsScore / totalVotingPower) * thisWeeksBasicBribeAmount

  return basicBoostedForAddress
}

export function amountToLpToGetBasicBoosted (beetsScore, totalVotingPower = TOTALVOTINGPOWER,thisWeeksBasicBribeAmount = BASICBRIBEFOR100) {
 return calculateBasicBoosted(beetsScore,totalVotingPower,thisWeeksBasicBribeAmount)*3
}

export function calculateAmountMoreForBoostedBonus (cre8rScore, ) {
  return Math.round((cre8rScore*CRE8R_FTM_LP_PRICE)*.35)
}