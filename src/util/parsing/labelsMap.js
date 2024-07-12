import { csv } from 'd3-fetch';

let labelsData = []; // Store the loaded labels data

// Load the labels data from the CSV file
csv('/data/labels.csv').then(data => {
    labelsData = data;
}).catch(error => {
    console.error('Error loading labels data:', error);
});

// Define the LabelsMap function
export function LabelsMap(question, response) {

    // Search for the label based on the provided question and response

    const labelEntry = labelsData.find(entry => entry['Question Name'] === question && entry['Option Name'] === response);
    // If label is found, return it; otherwise return null or handle the absence of label
    if (labelEntry) {
        return labelEntry['Display Label'];
    } else {
        return 'Label not found';
    }
}