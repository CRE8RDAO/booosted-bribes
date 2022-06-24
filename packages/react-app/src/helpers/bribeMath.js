const totalVotingPower = 48214146
const thisWeeksBasicBribeAmount = 74291 // this should be total to work properly

export function calculateBasicBoosted (beetsScore, totalVotingPower = 48214146 ,thisWeeksBasicBribeAmount = 114551) {
  const basicBoostedForAddress = (beetsScore / totalVotingPower) * thisWeeksBasicBribeAmount

  return basicBoostedForAddress
}

export function amountToLpToGetBasicBoosted (beetsScore, totalVotingPower = 48214146,thisWeeksBasicBribeAmount = 114551) {
 return calculateBasicBoosted(beetsScore,totalVotingPower,thisWeeksBasicBribeAmount)*3
}

