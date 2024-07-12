import * as d3 from 'd3';

export default function getResponses(csvFile, callback) {
    d3.csv(csvFile)
        .then((data) => {
            callback(data, csvFile);
        })
        .catch((error) => {
            console.log('Error loading the data: ' + error);
        });
        
}