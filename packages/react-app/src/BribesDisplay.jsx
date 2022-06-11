import { Alert, Button, Card, Code, Span, Checkbox, Input, notification, Radio, Space, Typography, Collapse, Select } from "antd"
import { ethers } from "ethers"
import React, { useEffect, useState } from "react"
import { useHistory, useLocation } from "react-router-dom"
import { useLocalStorage } from "./hooks"
import { AddressInput } from "./components"
import { useUserAddress } from "eth-hooks"
import useBribe from "./hooks/Bribe"
import { calculateBasicBoosted } from "./helpers/bribeMath"
import { amountToLpToGetBasicBoosted } from "./helpers/bribeMath"
import { Swap } from "./components";
import { useQuery, gql } from '@apollo/client';
import { usePercent} from './hooks/Bribe/Percent'
import { useVotes } from "./hooks/Bribe/Votes"
import useHoldings from './hooks/Bribe/Holdings'
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
  const {voters, total} = useVotes(proposalId, poolPos)
  const beetsBlockRound11 = 39001234
  const beetsBlockRound12 = 40013791
  const addressesOfVoters = Object.keys(voters)
  const f = useHoldings(props.injectedProvider, addressesOfVoters, beetsBlockRound12)

  //fetch percentage of last weeks proposal
  // get addresses and absolute votes from addresses that voted for cre8r
  const address = useUserAddress(props.injectedProvider)

  const { cre8rScore, beetsScore } = useBribe(props.injectedProvider, address)

  return (
    <Card style={{ backgroundColor: "rgb(0 0 0 / 93%)", textAlign: "center", fontSize: "16px", padding:"50px" }}>
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
