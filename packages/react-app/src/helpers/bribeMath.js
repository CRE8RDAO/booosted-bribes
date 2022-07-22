/**
 * 
 * @param {*} beetsScore 
 * @param {*} totalVotingPower 
 * @param {*} thisWeeksBasicBribeAmount Total Bribe payout at basic for 100%
 * @returns 
 */
export function calculateBasicBoosted (beetsScore, totalVotingPower = 48214146 ,thisWeeksBasicBribeAmount = 64773.488) {
  const basicBoostedForAddress = (beetsScore / totalVotingPower) * thisWeeksBasicBribeAmount

  return basicBoostedForAddress
}

export function amountToLpToGetBasicBoosted (beetsScore, totalVotingPower = 48214146,thisWeeksBasicBribeAmount = 64773.488) {
 return calculateBasicBoosted(beetsScore,totalVotingPower,thisWeeksBasicBribeAmount)*3
}

