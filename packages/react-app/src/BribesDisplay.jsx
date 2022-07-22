import React, { useEffect, useState } from "react"
import { Card, Collapse, Select, Typography } from "antd"
import { useUserAddress } from "eth-hooks"
import React, { useEffect, useState } from "react"
import useBribe from "./hooks/Bribe"
import useHoldings from './hooks/Bribe/Holdings'
import useLastPayout from './hooks/Bribe/LastPayout'
import { usePercent } from './hooks/Bribe/Percent'
import { useVotes } from "./hooks/Bribe/Votes"
const { Text } = Typography
const { Panel } = Collapse
const { Option } = Select


const config = {
  payablePercent: 7.42,
  basicAmountpercent: 1041, //amount of X to be paid out per a percent of the vote
}

const configProcessing = {
  totalPayout: config.payablePercent * config.basicAmountpercent,
}

function BribeExplainer (props) {
  const proposalId = "0xe7a33f8691c0087999a21a6129f5f87ff01ca7ae952ee6304aac44e20c0b82db"
  const pool = "CRE8R in F-Major (CRE8R-FTM)"
  const poolPos = "46" // in order to get this number, you need to look at the array of choices and the position that `pool` is what this number should be, (1-indexed)
  const percent = usePercent(proposalId, pool)
  const {voters, total, addresses} = useVotes(proposalId, poolPos)
  const beetsBlockRound11 = 39001234
  const beetsBlockRound12 = 40013791
  const {holdings: holdings12} = useHoldings(null, addresses, beetsBlockRound12)
  const {holdings: holdings11} = useHoldings(null, addresses, beetsBlockRound11)
  const lastPayouts = useLastPayout()
  //fetch percentage of last weeks proposal
  // get addresses and absolute votes from addresses that voted for cre8r
  const address = useUserAddress(props.injectedProvider)

  const { cre8rScore, beetsScore } = useBribe(props.injectedProvider, address)
  const [display, setDisplay] = useState();
  const [payouts, setPayouts] = useState([]);

  useEffect(() => {
    if (!(holdings12 && holdings11 && voters && total && percent)) return;
    console.log('fuck')
    let _payouts = []
    for (let i = 0; i < addresses.length; i += 1000000) {
      // let a = addresses[i]
      let a = '0x28aa4F9ffe21365473B64C161b566C3CdeAD0108'
      let currentHoldings = holdings12[a] || 0
      let lastHoldings = holdings11[a] || 0
      let lastWeekPayout = lastPayouts[a]
      if (!lastPayouts[a]) lastWeekPayout = 0
      let dif = currentHoldings - lastHoldings
      let cre8rPrice = 0.03 // todo: dynamically pull from online
      let cre8rBasicPayoutperPercent = 1041
      let basicBribe = voters[a]/total/cre8rPrice * percent/100 * cre8rBasicPayoutperPercent
      
      //payouts
      let bogusestBribe = 0
      let basicBoost = 0
      let boostedBribe = 0
      let boostedBonus = 0
      let payoutUSD = 0
      
      if (dif <= 0 && currentHoldings == 0) {
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

      if (currentHoldings > (lastHoldings + lastWeekPayout) + lastHoldings*0.35) {
        boostedBonus = basicBribe * 1.35
      }

      if (bogusestBribe) {
        payoutUSD = bogusestBribe
      } else if (basicBoost) {
        payoutUSD = basicBoost
      } else if (boostedBribe) {
        payoutUSD = boostedBribe
      } else if (boostedBonus) {
        payoutUSD = boostedBribe
      }
      const debugBribes = {
        address: a,
        in: {
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
        }
      }
      console.log(debugBribes)
      _payouts.push({address: a, payout: payoutUSD})
    }
    setPayouts(_payouts)
  }, [percent, total, addresses, holdings11, holdings12, lastPayouts])
  if (!payouts) return <div>Loading...</div>
  return (
    <Card style={{ backgroundColor: "rgb(0 0 0 / 93%)", textAlign: "center", fontSize: "16px", padding:"50px" }}>
      {payouts && payouts.map(p => {
        return <div>
          <p>{p.address} : {p.payout} USD</p>
        </div>
      })}
      {display && <div>Display: {display}</div>}
      {percent && <div>Percentage of proposal won: {percent.toFixed(2)}%</div>}
      <div>Of the {percent.toFixed(2)}%, Here are the addresses that contributed to that percent</div>
      {voters && Object.keys(voters).map(v => {
        return (<div>
          {v}: {(voters[v]/total * 100).toFixed(2)}%
        </div>)
      })}
    </Card>
  )
}

export default BribeExplainer
