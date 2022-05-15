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

const { Text } = Typography
const { Panel } = Collapse
const { Option } = Select
const codec = require("json-url")("lzw")

/*
    Welcome to the Signator!
*/

const eip712Example = {
  types: {
    Greeting: [
      {
        name: "salutation",
        type: "string",
      },
      {
        name: "target",
        type: "string",
      },
      {
        name: "born",
        type: "int32",
      },
    ],
  },
  message: {
    salutation: "Hello",
    target: "Ethereum",
    born: 2015,
  },
}

function BribeExplainer (props) {
  const address = useUserAddress(props.injectedProvider)

  const { cre8rScore, beetsScore } = useBribe(props.injectedProvider, address)

  return (
    <Card style={{ backgroundColor: "rgb(0 0 0 / 93%)", textAlign: "center", fontSize: "16px", padding:"50px" }}>
      <h1>For new voters it all starts with Basic Boosted</h1>
      
      <Text>
        Your Basic Boosted Bribe amount is the hardest of all the bribes to calculate since you need to know: Your Voting Power / Total Voting Power * Dollar Value Of All Beets Emissions Directed By Votes. So this simple app does that for you.
        {" "}
      </Text>

      <br></br>
      <p>
        {beetsScore ? (
          <span>
            For New Voters: LP at least <Text type="success">${Math.round(amountToLpToGetBasicBoosted(beetsScore))}</Text> with {address}
            <br></br> To receive <Text type="success"> Basic Boosted </Text> Bribe amount: <Text type="success">${Math.round(calculateBasicBoosted(beetsScore))}</Text>
          </span>
        ) : (
          <span> Connect your $FBEETS wallet to calculate your bribe payment options.</span>
        )}
      </p>
      {/* <Swap></Swap> lets try get this to work */}
      <hr></hr>
      <h1>Want more boost tho?</h1>
      <p>TBH the rest of the Boosted Bribes Multipliers are a little bit more self explanatory.</p>
      <p>Basically just compound your Bribes from last round and HODL to get 1.25x aka <Text type="success">Boosted Bribe.</Text> </p>
      <p>OR increase you CRE8R holdings by 35% - <Text type="success">${Math.round((cre8rScore*0.23)*.35)}</Text> - to get 1.35x Boost aka <Text type="success">Boosted Bonus</Text>. </p>

      <hr></hr>
      <h3>This App is WIP: For info about the higher boosts pls check: </h3>
      <a href='https://cre8r.vip/boosted-bribes/' target='_blank'>
        🧱 Boosted Bribes™{" "}
      </a>
      Also check out  <a href='https://www.beetswars.live/' target='_blank'>
      www.beetswars.live{" "}
      </a> to compare Bribe offers!
    </Card>
  )
}

export default BribeExplainer
