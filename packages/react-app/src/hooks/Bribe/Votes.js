import { ethers } from "ethers"
import React, { useEffect, useState } from "react"
import { useHistory, useLocation } from "react-router-dom"
import { useUserAddress } from "eth-hooks"
import { useQuery, gql } from '@apollo/client';

const votersQuery = gql`
query Votes($id: String!, $first: Int, $skip: Int, $orderBy: String, $orderDirection: OrderDirection, $voter: String) {
  votes(
    first: $first
    skip: $skip
    where: {proposal: $id, vp_gt: 0, voter: $voter}
    orderBy: $orderBy
    orderDirection: $orderDirection
  ) {
    ipfs
    voter
    choice
    vp
    vp_by_strategy
  }
}
`
//CRE8R in F-Major (CRE8R-FTM)
export const useVotes = (proposalId, poolPos) => {
  const [voters, setVoters] = useState({});
  const [total, setTotal] = useState(0); // total votes for the pool
  const { loading, error, data } = useQuery(votersQuery, {
    variables: {
      "id": proposalId,
      "orderBy": "vp",
      "orderDirection": "desc",
      first: 150000,
      // skip: 1500
    }
  })
  useEffect(() => {
    if (data) {
      const _voters = {}
      let _total = 0
      for (let i = 0; i < data.votes.length; i++) {
        if (!data.votes[i].choice[poolPos]) continue;
        let percentVoteForPool = data.votes[i].choice[poolPos]/(Object.values(data.votes[i].choice).reduce((acc, val) => acc + val))
        let vpToPool = data.votes[i].vp * percentVoteForPool
        _voters[data.votes[i].voter] = vpToPool
        _total += vpToPool
      }
      setTotal(_total)
      setVoters(_voters)
    }
  },[data])
  return {voters, total, addresses: Object.keys(voters)}
}

