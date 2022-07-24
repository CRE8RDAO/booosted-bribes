const fs = require('fs')
const path = require('path')
const RELATIVE_PATH = '../out'
//todo - figure out if these paths work and then set a relative path
/**
 * 
 * @param {*} json 
 * @param {*} name requires .json at end
 */
function writeJSON(json, name) {
  let data = JSON.stringify(json);
  fs.writeFileSync(path.resolve(__dirname,RELATIVE_PATH, name) || 'data.json', data);
  console.log(`json written to ${name || 'data.json'}`)
} 

/**
 * 
 * @param {*} csv 
 * @param {*} name requires .csv at end
 */
function writeCSV(csv, name) {
  // let data = JSON.stringify(csv);
  fs.writeFileSync(path.resolve(__dirname, RELATIVE_PATH, name) || 'data.csv', csv);
  console.log(`csv written to ${name || 'data.csv'}`)
} 

/**
 * Must be in format 
 * @param {[{field1: data, field2: any, ...}, ...]} myData 
 */
function parseJSONToCSV (myData) {
  const { parse } = require('json2csv');
  const opts = { fields: Object.keys(myData[0]) };

  try {
    const csv = parse(myData, opts);
    return csv
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  writeJSON,
  writeCSV,
  parseJSONToCSV
}