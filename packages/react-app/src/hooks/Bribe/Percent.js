import { ethers } from "ethers"
import React, { useEffect, useState } from "react"
import { useHistory, useLocation } from "react-router-dom"
import { useUserAddress } from "eth-hooks"
import { useQuery, gql } from '@apollo/client';

const scoresQuery = gql`
query ($proposalId: String!) {
  proposal(id: $proposalId) {
    id
    title
    choices
    start
    end
    snapshot
    state
    author
    created
    scores
  }
}
`
//CRE8R in F-Major (CRE8R-FTM)
export const usePercent = (proposalId, pool) => {
  const { loading, error, data } = useQuery(scoresQuery, {
    variables: {
      proposalId: proposalId
    }
  })
  const [percent, setPercent] = useState(0);
  useEffect(() => {
    if (data) {
      const percentVotes = {}
      let totalVotes = 0
      for (let i = 0; i < data.proposal.choices.length; i++) {
        totalVotes += data.proposal.scores[i]
      }
      for (let i = 0; i < data.proposal.choices.length; i++) {
        percentVotes[data.proposal.choices[i]] = data.proposal.scores[i]/totalVotes * 100
      }
      setPercent(percentVotes[pool])
    }
  },[data])
  return percent
}

