import { Alert, Button, Card, Checkbox, Input, notification, Radio, Space, Typography, Collapse, Select } from "antd"
import { ethers } from "ethers"
import React, { useEffect, useState } from "react"
import { useHistory, useLocation } from "react-router-dom"
import { useLocalStorage } from "./hooks"
import { AddressInput } from "./components"
import { useUserAddress } from "eth-hooks";
import useBribe from "./hooks/Bribe";
import { calculateBasicBoosted } from "./helpers/bribeMath"
import { amountToLpToGetBasicBoosted } from "./helpers/bribeMath"

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
  const address = useUserAddress(props.injectedProvider);

  const {cre8rScore,beetsScore} = useBribe(props.injectedProvider, address);

  return (
    <Card>
      {beetsScore ? (
        <span>For New Voters: LP at least ${amountToLpToGetBasicBoosted(beetsScore)} To recieve Basic Boosted Bribe amount: {calculateBasicBoosted(beetsScore)}</span>
      ) : (
        <span> Connect your $FBEETS wallet to calculate your bribe payment options.</span>
      )}
    </Card>
  )
}

export default BribeExplainer
