import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './index.css';

const SlopeGraph = ({ data, field, years }) => {
    console.log("Data RecievedL", data);
    console.log("Years RecievedL", years);
    const svgRef = useRef();
    years = [2021, 2022, 2023];
    const filteredDataByYears = filterDataByYears(data);
    years.sort();

    console.log("FIeld: ", field);

    console.log("FIltere by years", filterDataByYears(data));

    const response = countAnswersByYear(field, filteredDataByYears, years);

    console.log("RESPONSE,", response);

    const startYear = years[0];
    const endYear = years[2];
    const middleYear = years[1];
    data = response ? response['data'] : null;


    useEffect(() => {
        if (!response) {
            console.log("No response, returning");
            return;
        }



        // Chart dimensions
        const width = 600;
        const height = 400;
        const marginTop = 50;
        const marginRight = 70;
        const marginBottom = 50;
        const marginLeft = 70;
        const padding = 5;

        // Prepare the positional scales
        const x = d3.scalePoint()
            .domain([0, 1, 2])
            .range([marginLeft, width - marginRight])
            .padding(0.5);

        const y = d3.scaleLinear()
            .domain(d3.extent(data.flatMap(d => [d[startYear], d[endYear]])))
            .range([height - marginBottom, marginTop]);

        const colorScale = d3.scaleOrdinal()
            .domain(data.map(d => d.response))
            .range(d3.schemeCategory10);

        const line = d3.line()
            .x((d, i) => x(i))
            .y((d) => y(d[startYear]));

        const formatNumber = y.tickFormat(100);

        // Create SVG container
        const svg = d3.select(svgRef.current)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: auto; font: 12px sans-serif;");

        svg.selectAll('*').remove();

        // Append the x axis
        svg.append("g")
            .attr("class", "label-text")
            .attr("text-anchor", "middle")
            .selectAll("g")
            .data([0, 1, 2])
            .join("g")
            .attr("transform", (i) => `translate(${x(i)},25)`)
            .call(g => g.append("text").text((i) => {
                if (i === 0) return startYear;
                else if (i === 1) return middleYear;
                else return endYear;
            }))
            .call(g => g.append("line").attr("y1", 5).attr("y2", 15).attr("stroke", "currentColor"));

        svg.append("line")
            .attr("stroke", "#ccc")
            .attr("x1", x(0) + x.bandwidth() / 2)
            .attr("y1", marginTop)
            .attr("x2", x(0) + x.bandwidth() / 2)
            .attr("y2", height - marginBottom)
            .attr("stroke-dasharray", "2")
            .attr("stroke-width", 1);

        svg.append("line")
            .attr("stroke", "#ccc")
            .attr("x1", x(1) + x.bandwidth() / 2)
            .attr("y1", marginTop)
            .attr("x2", x(1) + x.bandwidth() / 2)
            .attr("y2", height - marginBottom)
            .attr("stroke-dasharray", "2")
            .attr("stroke-width", 1);

        svg.append("line")
            .attr("stroke", "#ccc")
            .attr("x1", x(2) + x.bandwidth() / 2)
            .attr("y1", marginTop)
            .attr("x2", x(2) + x.bandwidth() / 2)
            .attr("y2", height - marginBottom)
            .attr("stroke-dasharray", "2")
            .attr("stroke-width", 1);

        // Append circles for the first year
        svg.append("g")
            .selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", x(0) + x.bandwidth() / 2)
            .attr("cy", (d) => y(d[startYear]))
            .attr("r", 5)
            .attr("fill", (d) => (colorScale(d.response)))
            .style("opacity", 0)
            .transition()
            .duration(1000)
            .style("opacity", 1);

        //Append circles for the last year
        svg.append("g")
            .selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", x(2) + x.bandwidth() / 2)
            .attr("cy", (d) => y(d[endYear]))
            .attr("r", 5)
            .attr("fill", (d) => (colorScale(d.response)))
            .style("opacity", 0)
            .transition()
            .duration(1000)
            .style("opacity", 1);

        //Appened circles for the third year
        svg.append("g")
            .selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", x(1) + x.bandwidth() / 2)
            .attr("cy", (d) => y(d[middleYear]))
            .attr("r", 5)
            .attr("fill", (d) => (colorScale(d.response)))
            .style("opacity", 0)
            .transition()
            .duration(1000)
            .style("opacity", 1);



        // First, define the lines
        const lines1 = svg.append("g")
            .selectAll("line")
            .data(data)
            .enter()
            .append("line")
            .attr("x1", x(0) + x.bandwidth() / 2)
            .attr("y1", (d) => y(d[startYear]))
            .attr("x2", x(0) + x.bandwidth() / 2) // Starting x position same as x1
            .attr("y2", (d) => y(d[startYear]))
            .attr("stroke", (d) => (colorScale(d.response)))
            .attr("stroke-width", 2)
            .style("opacity", 1); // Start with opacity 1

        const lines2 = svg.append("g")
            .selectAll("line")
            .data(data)
            .enter()
            .append("line")
            .attr("x1", x(1) + x.bandwidth() / 2)
            .attr("y1", (d) => y(d[middleYear]))
            .attr("x2", x(1) + x.bandwidth() / 2) // Starting x position same as x1
            .attr("y2", (d) => y(d[middleYear]))
            .attr("stroke", (d) => (colorScale(d.response)))
            .attr("stroke-width", 2)
            .style("opacity", 1); // Start with opacity 1

        // Then, transition the lines to their final positions
        lines1.transition()
            .duration(1000)
            .attr("x2", x(1) + x.bandwidth() / 2) // Ending x position for first set of lines
            .attr("y2", (d) => y(d[middleYear]));

        lines2.transition()
            .duration(1000)
            .delay(500) // Delay the second set of lines to start after the first set finishes
            .attr("x2", x(2) + x.bandwidth() / 2) // Ending x position for second set of lines
            .attr("y2", (d) => y(d[endYear]));


        //First  year labels
        svg.append("g")
            .selectAll("g")
            .data([0])
            .join("g")
            .attr("transform", (i) => `translate(${x(i) + (i ? padding + 10 : -padding - 10)},0)`)
            .attr("text-anchor", (i) => i ? "start" : "end")
            .selectAll("text")
            .data((i) => d3.zip(

                data.map(i ? (d) => `${formatNumber(d[startYear])} ${d.response}` : (d) => `${d.response} ${formatNumber(d[startYear])}`),
                dodge(data.map(d => y(d[startYear])))))
            .join("text")
            .attr("y", ([, y]) => y)
            .attr("dy", "0.35em")
            .style("opacity", 0)
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .attr("class", "label-text")
            .text(([text]) => text);

        //Middle year labels
        svg.append("g")
            .selectAll("g")
            .data([1])
            .join("g")
            .attr("transform", (i) => `translate(${x(i) + (i ? padding + 10 : -padding - 10)},0)`)
            .attr("text-anchor", (i) => i ? "start" : "end")
            .selectAll("text")
            .data((i) => d3.zip(

                data.map(i ? (d) => `${formatNumber(d[middleYear])}` : (d) => `${formatNumber(d[middleYear])}`),
                dodge(data.map(d => y(d[middleYear])))))
            .join("text")
            .attr("y", ([, y]) => y)
            .attr("dy", "0.35em")
            .style("opacity", 0)
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .attr("class", "label-text")
            .text(([text]) => text);

        //Third year label
        svg.append("g")
            .selectAll("g")
            .data([2])
            .join("g")
            .attr("transform", (i) => `translate(${x(i) + (i ? padding + 10 : -padding - 10)},0)`)
            .attr("text-anchor", (i) => i ? "start" : "end")
            .selectAll("text")
            .data((i) => d3.zip(

                data.map(i ? (d) => `${formatNumber(d[endYear])}` : (d) => `${formatNumber(d[endYear])}`),
                dodge(data.map(d => y(d[endYear])))))
            .join("text")
            .attr("y", ([, y]) => y)
            .attr("dy", "0.35em")
            .style("opacity", 0)
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .attr("class", "label-text")
            .text(([text]) => text);



    }, [data, response]);


    return <svg ref={svgRef}></svg>;
};

export default SlopeGraph;





function dodge(positions, separation = 10, maxiter = 10, maxerror = 1e-1) {
    positions = Array.from(positions);
    let n = positions.length;
    if (!positions.every(isFinite)) throw new Error("invalid position");
    if (!(n > 1)) return positions;
    let index = d3.range(positions.length);
    for (let iter = 0; iter < maxiter; ++iter) {
        index.sort((i, j) => d3.ascending(positions[i], positions[j]));
        let error = 0;
        for (let i = 1; i < n; ++i) {
            let delta = positions[index[i]] - positions[index[i - 1]];
            if (delta < separation) {
                delta = (separation - delta) / 2;
                error = Math.max(error, delta);
                positions[index[i - 1]] -= delta;
                positions[index[i]] += delta;
            }
        }
        if (error < maxerror) break;
    }
    return positions;
}


const filterDataByYears = (allData) => {
    const yearArray = [];
    const yearFilteredObject = {};
    console.log("For Eaching over: ", allData);
    allData.forEach(data => {
        if (!yearArray.includes(data["Year"])) {
            yearArray.push(data["Year"]);
            yearFilteredObject[data["Year"]] = [data];
        } else {
            yearFilteredObject[data["Year"]].push(data);
        }
    });
    console.log("YearFilteredOBject", yearFilteredObject);
    if (Object.keys(yearFilteredObject).length != 3) {
        return null;
    }
    return yearFilteredObject;
};

const countAnswersByYear = (field, filteredDataByYears, years) => {

    const data = {};
    years.sort();
    console.log("FIltered Data,", filteredDataByYears);
    console.log("Years:", years);
    const responses = [];
    var startYear = years[0];
    var middleYear = years[1];
    var endYear = years[2];


    if (!startYear || !endYear || !middleYear) {
        return;
    }

    if (!filteredDataByYears) {
        return;
    }

    console.log("FilteredDataByYeras", filteredDataByYears);

    field['responses'].forEach((element) => {
        responses.push({ label: element['Display Label'], responseId: element['Option Name'] });
    });

    responses.forEach((element) => {
        data[element.responseId] = { response: element.label, [startYear]: 0, [endYear]: 0, [middleYear]: 0 };
    })


    filteredDataByYears[startYear].forEach((element) => {
        const year = element['Year'];
        const responseId = element[field['Question Name']];
        if (data && data[responseId]) {
            data[responseId][startYear] += 1;
        }
    })

    filteredDataByYears[middleYear].forEach((element) => {
        const year = element['Year'];
        const responseId = element[field['Question Name']];
        console.log("No Crash Checking:", data[responseId]);
        if (data && data[responseId]) {
            data[responseId][middleYear] += 1;
        }
    })

    filteredDataByYears[endYear].forEach((element) => {
        const year = element['Year'];
        const responseId = element[field['Question Name']];
        console.log("No Crash Checking:", data[responseId]);
        if (data && data[responseId]) {
            data[responseId][endYear] += 1;
        }
    })



    const newData = []
    Object.keys(data).forEach((responseId) => {
        newData.push(data[responseId]);
    })

    console.log("Data after", newData);


    console.log('data', data);
    console.log('field', field);
    console.log('responses', responses);
    console.log('years', years);
    console.log("Start year", startYear);
    console.log("End year", endYear);


    return { data: newData, startYear: startYear, endYear: endYear, middleYear: middleYear };
}