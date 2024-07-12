import React, { useEffect } from 'react';
import { csv } from 'd3-fetch';

export function labelParser(filePath, callback, filter) {
    // Use d3-fetch's csv function to load the CSV file
    csv(filePath).then(data => {
        // Filter the data to get questions where Option Name is empty
        var filteredData = data.filter(d => d['Option Name'] === '');
        var allOptions = data.filter(d => d['Option Name'] !== '');

        if (filter) {
            filteredData = filteredData.filter(filter);
        }

        // Extract and log the Question Name for each filtered entry
        const returnArray = [];
        filteredData.forEach((d,i) => {
            d.checked = i == 0;
            d.responses = allOptions.filter(option => option["Question Name"] === d["Question Name"]);
            returnArray.push(d);
        });

        callback(returnArray);
    });
}
