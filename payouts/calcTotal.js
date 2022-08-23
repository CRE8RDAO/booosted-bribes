/**
 * This script is used to calculate the total payouts for boosted bribes
 */
// todo: create docs of the schema of the generated payouts
// todo: include referrals data
// read payouts
const {writeJSON} = require('./utils/index')
const payoutsForAmplifi = [
    require('./out/bribe-payouts-45482115.json'),
    require('./out/bribe-payouts-44457923.json')
]

function calcTotal () {
    const addressToTotalPayout = {}
    for (let i = 0; i < payoutsForAmplifi.length; i++) {
        const payouts = payoutsForAmplifi[i]
        for (let j = 0; j < payouts.length; j++) {
            const singlePayout = payouts[j]
            const address = singlePayout.address
            const currentValue = addressToTotalPayout[address] || {
                AMPinUSD: 0,
                CRE8RinUSD: 0
            }
            addressToTotalPayout[address] = currentValue
            addressToTotalPayout[address].AMPinUSD += singlePayout.boostedBonus2AmpInUSD + singlePayout.basicBoost2AmpInUSD
            addressToTotalPayout[address].CRE8RinUSD += singlePayout.payoutCre8rInUSD
        }
    }

    //convert object into array
    const totalPayouts = []
    const addressToTotalPayoutKeys = Object.keys(addressToTotalPayout)
    for (let i = 0; i < addressToTotalPayoutKeys.length; i++) {
        const address = addressToTotalPayoutKeys[i]
        totalPayouts.push({
            address,
            AMPinUSD: addressToTotalPayout[address].AMPinUSD,
            CRE8RinUSD: addressToTotalPayout[address].CRE8RinUSD
        })
    }
    
    const res = {
        dateTimeStamp: Date.now(),
        data: totalPayouts
    }
    console.log(res)
    writeJSON(res, `beets-boosted-bribes-${Date.now().toString()}.json`)
    // todo: upload to ipfs
}

calcTotal()