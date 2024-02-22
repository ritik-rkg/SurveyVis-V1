const csvtojson = require('csvtojson');
const fs = require('fs');

// Specify the path to your CSV file
const csvFilePath = 'NFHS5_processed_03102023_lat_long_condensed_new.csv';

// Use csvtojson to convert CSV to JSON
csvtojson()
  .fromFile(csvFilePath)
  .then((jsonArrayObj) => {
    // Define a replacer function to remove double quotes around string property values
    const replacer = (key, value) => {
      // If the value is a string, remove double quotes
      if (typeof value === 'string') {
        return value;
      }
      return value;
    };

    // Optionally, you can write the JSON to a file
    const jsonFilePath = 'output.json';
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonArrayObj, replacer, 2));
    console.log(`JSON written to ${jsonFilePath}`);
  })
  .catch((err) => {
    console.error(err);
  });
