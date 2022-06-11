import { useState, useEffect, useCallback, useMemo } from "react";
import usePoller from "../Poller";
import useOnBlock from "../OnBlock";
import addresses from "../../addresses";
import snapshot from '@snapshot-labs/snapshot.js';
import { BEETS, BLOCKNUMBER } from "../../config";
import { bribeSettings, CRE8R } from "../../config";
import choices from "../../data/choices";
import votes from "../../data/votes"

export default function useHoldings(provider, addresses, blockNumber) {
  const [scores, setScores] = useState()
  // const [score, setScore] = useState();
  const [cre8rScore, setCre8rScore] = useState();
  const [beetsScore, setBeetsScore] = useState();

  // used to know how much an Fbeets holder voted for cre8r-ftm on the beets snapshot
  useMemo(() => {
    snapshot.utils.getScores(
      CRE8R,
      bribeSettings[CRE8R].strategies,
      bribeSettings[CRE8R].network,
      [...addresses],
      blockNumber
    ).then(scores => {
      if (!scores) return;
      /* scores =
      [
        {
          "0x28aa4F9ffe21365473B64C161b566C3CdeAD0108": 256952.369826964,
          "0xA5d896AcCC301fcaA21f03592269310e7444AA40": 92940.94437047132,
        }
        {
          "0x28aa4F9ffe21365473B64C161b566C3CdeAD0108": 1.369826964,
    },
    {
      "0xA67D2c03c3cfe6177a60cAed0a4cfDA7C7a563e0": 88629.52961428998,
      "0xbAc24192fD3FeF51f2671FA48e7B159A7191e8F5": 45.827461293704545,
      "0xc66cbf3e4a7aFa55b2600a197910faB4767954a4": 1175.1827139447937
    },
    {},
    {
      "0x75AEC1D6Bdb2d63BeCFd6c65A01f3E2175B98A62": 11.446509909773932
    }
  ]
  */
  
  const holdings = {}
  for (let i = 0; i < scores.length; i++) {
    for (let j = 0; j < Object.keys(scores[i]).length; j++) {
      let key = Object.keys(scores[i])[j]
      if (holdings[key] === undefined) {
        holdings[key] = scores[i][key]
      } else {
        holdings[key] += scores[i][key]
      }
    }
  }
  console.log(holdings)
});
}, [addresses])
/*
  // used for beets VP
  useEffect(() => {
    snapshot.utils.getScores(
      BEETS,
      bribeSettings[BEETS].strategies,
      bribeSettings[BEETS].network,
      addresses,
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
*/
/*
  // Only pass a provider to watch on a block if there is no pollTime
  useOnBlock((pollTime === 0)&&provider, () => {
    if (provider && address && pollTime === 0) {
      pollBalance(provider, address);
  }
  })
*/
  return {
    cre8rScore, beetsScore
  };
}


// configure to show Fbeets VP and cre8r vp separatley