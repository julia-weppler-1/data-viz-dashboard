
import * as d3 from 'd3';
import { useRef, useState, useEffect } from 'react';
import { LabelsMap } from "util/parsing/labelsMap";
import './index.css'
export default function BarChart({ field, isPercentage, data, yearsSelected, onBarClick, filteredData }) {
    const ref = useRef()
    const [selectedBar, setSelectedBar] = useState(null);

    console.log('ALL DATA', data);
    console.log("Years Selected", yearsSelected);
    console.log('Filtered:', filteredData);
    useEffect(() => {
        if (!data || data.length === 0){
            return;
        }
        const barHeight = 25; // Define a fixed height for each bar
        const width = 340;
        const height = data.length * barHeight + 50;
        const margin = { top: 60, right: 0, bottom: 30, left: 5 };
        const innerWidth = 350 - margin.left - margin.right - 40;
        const innerHeight = 230 - margin.top - margin.bottom - 70;
        // Count the occurrences of each enrollment status
        var counts = d3.rollup(data, v => v.length, d => d[field["Question Name"]]);
        if (filteredData != null){
            var filteredCounts = d3.rollup(filteredData, v => v.length, d => d[field["Question Name"]]);
        }
        // Get the maximum count
        var maxCount = d3.max(Array.from(counts.values())) * 1.4; // Increase the maximum count by 15% to make the chart more readable

        

        // Calculate the number of ticks based on the maximum count
        var tickCount = Math.ceil(15);

        // Adjust count if display type is percentage
        if (isPercentage) {
            var totalCount = d3.sum(Array.from(counts.values()));
            counts = new Map(Array.from(counts, ([k, v]) => [k, (v / totalCount) * 100]));
            maxCount = 100; // Maximum count is 100% now
            filteredCounts = new Map(Array.from(filteredCounts, ([k, v]) => [k, (v / totalCount) * 100]));

        }

        
        
        // Select the SVG element
        var svg = d3.select(ref.current);

        // Remove existing elements to avoid duplication
        svg.selectAll("*").remove();
        var svg = d3.select(ref.current)
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Define y scale and domain
        var y = d3.scaleBand()
            .domain(Array.from(counts.keys()))
            .range([0, innerHeight])
            .padding(0.1);

        // Define x scale and domain
        var x = d3.scaleLinear()
            .domain([0, maxCount + 30])
            .range([0, innerWidth-15]);
        // Add gridlines
        svg.append("g")
            .attr("class", "grid")
            .attr("transform", "translate(0," + innerHeight + ")")
            .call(d3.axisBottom(x)
                .ticks(tickCount) // Set the number of ticks
                .tickSize(-innerHeight)
                .tickFormat("")
                .tickSizeOuter(0) // To hide the last grid line
            )
            .selectAll(".tick line")
            .attr("stroke", "#ccc");

        const tooltip = d3.select(".tooltip");

        var bars = svg.selectAll(".bar")
            .data(counts.entries())
            .enter().append("g")
            .attr("class", "bar")
            .attr("transform", d => "translate(0," + y(d[0]) + ")")
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut);
        var barsFiltered = svg.selectAll(".filteredBar") //create 2 different classes of bars, totalbar and filteredbar
            .data(filteredCounts.entries())
            .enter().append("g")
            .attr("class", "bar")
            .attr("transform", d => "translate(0," + y(d[0]) + ")")

        function handleMouseOver(event, d) {
            const count = d[1]; // Get the count of the hovered bar
            const name = d[0];
            const totalCount = d3.sum(Array.from(counts.values())); // Calculate total count
            const percentage = ((count / totalCount) * 100).toFixed(2); // Calculate percentage

            d3.select(this).selectAll("rect") // Select the rect within the hovered bar group
                .style("fill", "#c9ebff") // Change the fill color
                .classed("highlighted", true);
            const tooltipContent = isPercentage
                ? `<strong>${LabelsMap(field["Question Name"], name)}</strong><br>(${percentage}% of total)`
                : `<strong>${LabelsMap(field["Question Name"], name)}</strong><br>Responses: ${count}<br>(${percentage}% of total)`;
            
            tooltip
                .html(tooltipContent)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px")
                .style("opacity", 0.9);
        }
        function handleMouseOverFiltered(event, d) {
            const count = d[1]; // Get the count of the hovered bar
            const name = d[0];
            const totalCount = d3.sum(Array.from(counts.values())); // Calculate total count
            const percentage = ((count / totalCount) * 100).toFixed(2); // Calculate percentage

            d3.select(this).selectAll("rect") // Select the rect within the hovered bar group
                .style("fill", "white") // Change the fill color
                .classed("highlighted", true);
            const tooltipContent = isPercentage
                ? `<strong>${LabelsMap(field["Question Name"], name)}</strong><br>(${percentage}% of total)`
                : `<strong>${LabelsMap(field["Question Name"], name)}</strong><br>Responses: ${count}<br>(${percentage}% of total)`;
            
            tooltip
                .html(tooltipContent)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px")
                .style("opacity", 0.9);
        }   
        function handleMouseOut() {
            tooltip.style("opacity", 0);
            d3.select(this).selectAll("rect")
                .style("fill", d => filteredData.length==0 ? "#4c78a8" : "#9ecae9" )
                .classed("highlighted", false);
        }
        function handleMouseOutFiltered() {
            tooltip.style("opacity", 0);
            d3.select(this).selectAll("rect")
                .style("fill", "orange")
                .classed("highlighted", false);
        }

        bars.append("rect")
            .attr("y", 0)
            .attr("height", y.bandwidth())
            .attr("width", 0) // Set initial width to 0
            .attr("fill", d => filteredData.length==0 ? "#4c78a8" : "#9ecae9" )
            .transition() // Add transition effect
            .duration(1000) // Set duration for the transition
            .attr("width", d => x(d[1])); // Transition to final width
        barsFiltered.append("rect")
            .attr("y", 0)
            .attr("height", y.bandwidth())
            .attr("width", 0) // Initially set width to 0
            .on("mouseover", handleMouseOverFiltered) // Add mouseover event handler for filtered bars
            .on("mouseout", handleMouseOutFiltered)
            .attr("fill", "orange")
            .transition() // Add transition effect
            .duration(1000) // Set duration for the transition
            .attr("width", d => x(d[1])); // Transition to the actual width


        // Add y-axis without ticks
        svg.append("g")
            .call(d3.axisLeft(y).tickSize(0).tickFormat('')); // Removing ticks and tick labels

        // Add x-axis
        svg.append("g")
            .attr("transform", "translate(0," + innerHeight + ")")
            .call(d3.axisBottom(x));
        
        d3.select(ref.current)
            .selectAll('.bar')
            .on('click', (event, d) => {
                const clickedData = d;
                const fieldName = field["Question Name"];
                setSelectedBar(clickedData[0]);
                onBarClick(clickedData, fieldName); // Pass clicked data and field name to parent component
            });
        bars.append("text")
            .attr("x", 0) // Position at the beginning of the axis
            .attr("y", y.bandwidth() / 2)
            .attr("dy", "0.35em") // Vertical alignment
            .attr("text-anchor", "start") // Left-align the text
            .attr("dx", 5)
            .text(d => (LabelsMap(field["Question Name"], d[0])))
            .style("font-size", "12px");
        barsFiltered.append("text")
            .attr("x", 0) // Position at the beginning of the axis
            .attr("y", y.bandwidth() / 2)
            .attr("dy", "0.35em") // Vertical alignment
            .attr("text-anchor", "start") // Left-align the text
            .attr("dx", 5)
            .text(d => (LabelsMap(field["Question Name"], d[0])))
            .style("font-size", "12px")
            .transition() // Add transition effect
            .duration(500) // Set duration for the transition
            .attr("x", 0); // Transition to the final position
    }, [data, isPercentage, yearsSelected, field, onBarClick, selectedBar]);

    return (
        <div className='chart'>
            <svg ref={ref} />
            <div className='tooltip'></div>
        </div>
    );
}


