import { useState, useEffect, useCallback } from "react";
import usePoller from "./Poller";
import useOnBlock from "./OnBlock";
import addresses from "../addresses";
import snapshot from '@snapshot-labs/snapshot.js';
import { BEETS, BLOCKNUMBER } from "../config";
import { bribeSettings, CRE8R } from "../config";
import choices from "../data/choices";
import votes from "../data/votes"


const DEBUG = false;
export default function useBribe(provider, address, pollTime = 0, blockNumber = BLOCKNUMBER, space = CRE8R) {
  const [scores, setScores] = useState()
  // const [score, setScore] = useState();
  const [cre8rScore, setCre8rScore] = useState();
  const [beetsScore, setBeetsScore] = useState();

  // used to know how much an Fbeets holder voted for cre8r-ftm on the beets snapshot
  useEffect(() => {
    snapshot.utils.getScores(
      CRE8R,
      bribeSettings[CRE8R].strategies,
      bribeSettings[CRE8R].network,
      [address],
      blockNumber
    ).then(scores => {
      if (!scores) return;
      const scoresWithValues = scores.filter((val, i) => val[address] != null)
      let totalScore = 0
      if (!scoresWithValues) return;
      console.log(scoresWithValues)
      for (let i = 0; i < scoresWithValues.length; i++) {
        if (scoresWithValues[i][address]) {
          totalScore += scoresWithValues[i][address]
        }
      }
      setCre8rScore(totalScore)
    });
  }, [address])

  // used for beets VP
  useEffect(() => {
    snapshot.utils.getScores(
      BEETS,
      bribeSettings[BEETS].strategies,
      bribeSettings[BEETS].network,
      [address],
      blockNumber
    ).then(scores => {
      if (!scores) return;
      const scoresWithValues = scores.filter((val, i) => val[address] != null)
      let totalScore = 0
      if (!scoresWithValues) return;
      for (let i = 0; i < scoresWithValues.length; i++) {
        if (scoresWithValues[i][address]) {
          totalScore += scoresWithValues[i][address]
        }
      }
      setBeetsScore(totalScore)
    });
  }, [address])



  const [balance, setBalance] = useState();

  const pollBalance = useCallback(async (provider, address) => {
    if (provider && address) {
      const newBalance = await provider.getBalance(address);
      if (newBalance !== balance) {
        setBalance(newBalance);
      }
    }
  }, [provider, address]);

  // Only pass a provider to watch on a block if there is no pollTime
  useOnBlock((pollTime === 0)&&provider, () => {
    if (provider && address && pollTime === 0) {
      pollBalance(provider, address);
  }
  })

  // Use a poller if a pollTime is provided
  usePoller(async () => {
    if (provider && address && pollTime > 0) {
      if (DEBUG) console.log('polling!', address)
      pollBalance()
    }
  }, pollTime, provider && address)
  return {
    cre8rScore, beetsScore
  };
}


// configure to show Fbeets VP and cre8r vp separatley