const {
  getHoldings
} = require('./data');
const fetch = require('cross-fetch')
const {
  calcPayouts
} = require('./math/index')
// const f= getHoldings(["0x43C4fF14DAe2Fbb389Dd94498C3D610A0c69a89d", "0x397A7EC90bb4f0e89Ffd2Fb3269a3ef295d4f84A"],42006392)

const addresses = ["0x43C4fF14DAe2Fbb389Dd94498C3D610A0c69a89d"]
const voters = {
  "0x43C4fF14DAe2Fbb389Dd94498C3D610A0c69a89d": 50
}


const total = 50 //84619703//387386679469087688
const percent = 0.01 //99000/84619703 // if I have 40000 fBeets and there are 84619703 fBeets in circulation so the assuming everyone votes, the lowest percent you can earn is 40000/84619703
const lastHoldingsAddressesToCRE8R = {
  "0x43C4fF14DAe2Fbb389Dd94498C3D610A0c69a89d": 100000
}
const currentHoldingsAddressesToCRE8R = {
  "0x43C4fF14DAe2Fbb389Dd94498C3D610A0c69a89d": 14000
}

const lastPayouts = {
  "0x43C4fF14DAe2Fbb389Dd94498C3D610A0c69a89d": 1
}
const cre8rPrice = 0.012
const cre8rBasicPayoutperPercent = 612
const res = calcPayouts(addresses, voters, total, percent, lastHoldingsAddressesToCRE8R, currentHoldingsAddressesToCRE8R,lastPayouts, cre8rPrice, cre8rBasicPayoutperPercent)
console.log(res)