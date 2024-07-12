import * as d3 from 'd3';
import { useRef, useState, useEffect } from 'react';
import { LabelsMap } from "util/parsing/labelsMap";
import './index.css';
export default function DonutChart({ field, isPercentage, data, yearsSelected, onBarClick, filteredData }) {
    const ref = useRef();
    const [selectedSlice, setSelectedSlice] = useState(null);

    useEffect(() => {
        if (!data || data.length === 0) {
            return;
        }
        const width = 350;
        const height = 200;
        const radius = Math.min(width-150, height) / 3;
        const innerRadius = radius * 0.5; // Define the inner radius for the donut hole
        const darkBlue = "#4c78a8"; // Blue color for all sections
        const lightBlue = "#9ecae9"; // Light blue color for filtered sections
        const highlightColor = 'orange'; // Color for highlighting filtered data
        const fillColor = filteredData.length !== 0 ? lightBlue : darkBlue;
        var counts = d3.rollup(data, v => v.length, d => d[field["Question Name"]]);
        var filteredCounts = filteredData ? d3.rollup(filteredData, v => v.length, d => d[field["Question Name"]]) : null;

        var pieData = Array.from(counts, ([key, value]) => ({ key, value }));
        var filteredPieData = filteredCounts ? Array.from(filteredCounts, ([key, value]) => ({ key, value })) : [];
        var totalCount = d3.sum(Array.from(counts.values()));
        var svg = d3.select(ref.current);

        // Remove existing elements to avoid duplication
        svg.selectAll("*").remove();
        var svg = d3.select(ref.current)
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        var pie = d3.pie()
            .value(d => d.value);

        var arc = d3.arc()
            .innerRadius(innerRadius) // Set inner radius for the donut hole
            .outerRadius(radius);
        var outerArc = d3.arc()
            .innerRadius(radius * 0.9)
            .outerRadius(radius * 0.9)
        var arcs = svg.selectAll("arc")
            .data(pie(pieData))
            .enter()
            .append("g")
            .attr("class", "arc")
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut);
// Append arcs and start transitions
arcs.append("path")
    .attr("d", arc)
    .attr("stroke", "white")
    .style("stroke-width", "2px")
    .attr("fill", function(d) { return d.value ? fillColor : "white"; }) // Set fill to white for empty arcs
    .transition()
    .duration(800)
    .attrTween('d', function(d) {
        var i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
        return function(t) {
            d.endAngle = i(t);
            return arc(d);
        };
    });
        // Function to detect collision between two elements


        // Highlight filtered sections
        if (filteredPieData.length > 0) {
            // Create arcs for filtered data
            const filteredArcs = svg.selectAll(".arc-filtered")
                .data(pie(filteredPieData))
                .enter()
                .append("g")
                .attr("class", "arc-filtered");

            filteredArcs.each(function(filteredSlice) {
                // Find the corresponding slice in the total data
                const correspondingSlice = pie(pieData).find(d => d.data.key === filteredSlice.data.key);

                // Use the start angle from the corresponding slice in the total data
                const startAngle = correspondingSlice.startAngle;

                // Calculate the proportion of filtered data to total data
                const filteredProportion = filteredSlice.value / totalCount;

                // Calculate the end angle based on the proportion
                const endAngle = startAngle + (2 * Math.PI * filteredProportion);

                // Create an arc generator for the filtered slice
                const filteredArc = d3.arc()
                    .innerRadius(innerRadius + 1) // Set inner radius for the donut hole
                    .outerRadius(radius - 1); // Set outer radius

                // Append path for the filtered slice
                d3.select(this).append("path")
                    .attr("d", filteredArc({ startAngle, endAngle })) // Generate path for the filtered arc
                    // .attr("stroke", "white")
                    // .style("stroke-width", "2px")
                    .on("mouseover", function(event, d) {
                        handleMouseOverFiltered(event, d, totalCount);
                    })
                    .on("mouseout", function(event, d) {
                        handleMouseOutFiltered(event, d, totalCount);
                    })
                    .attr("fill", function(d) { return d.value ? highlightColor : fillColor; }) // Set fill to white for empty arcs
                    .transition()
                    .duration(800)
                    .attrTween('d', function(d) {
                        var i = d3.interpolateObject({ startAngle: startAngle + 0.1, endAngle: startAngle + 0.1 }, { startAngle, endAngle });
                        return function(t) {
                            return filteredArc(i(t));
                        };
                    });
                    

                
            });
        }
        arcs.each(function(d) {
            const startAngle = d.startAngle;
            const endAngle = d.endAngle;
            const midAngle = (startAngle + endAngle) / 2; // Mid angle of the slice
            
            // Calculate the position for the label lines to be drawn outside the donut
            const labelLineLength = 30; // Length of the label lines
            const horizontalLineLength = 35; // Length of the horizontal lines
            const labelOffset = -30;
            // Calculate the endpoint of the line for labels
            const labelLineEndX = arc.centroid(d)[0] + Math.cos(midAngle) * labelLineLength;
            const labelLineEndY = arc.centroid(d)[1] + Math.sin(midAngle) * labelLineLength;
            
            // Calculate the perpendicular angle
            const perpendicularAngle = midAngle - Math.PI / 2;
            
            // Calculate the endpoint of the perpendicular line
            const perpendicularEndX = arc.centroid(d)[0] + Math.cos(perpendicularAngle) * labelLineLength;
            const perpendicularEndY = arc.centroid(d)[1] + Math.sin(perpendicularAngle) * labelLineLength;
            
            // Calculate the horizontal line endpoint
            const horizontalEndX = perpendicularEndX + (midAngle > Math.PI ? -1 : 1) * horizontalLineLength;
            
            // Draw lines perpendicular to the donut slices
            svg.append("line")
                .attr("x1", arc.centroid(d)[0])
                .attr("y1", arc.centroid(d)[1])
                .attr("x2", perpendicularEndX)
                .attr("y2", perpendicularEndY)
                .attr("stroke", "black");
            
            // Draw connecting lines
            svg.append("line")
                .attr("x1", perpendicularEndX)
                .attr("y1", perpendicularEndY)
                .attr("x2", horizontalEndX)
                .attr("y2", perpendicularEndY)
                .attr("stroke", "black");
            
            // Add text labels at the end of the horizontal lines
            svg.append("text")
                .attr("x", horizontalEndX + (midAngle > Math.PI ? labelOffset : -labelOffset*1.5))
                .attr("y", perpendicularEndY + (midAngle > Math.PI ? labelOffset*0.4 : -labelOffset*0.3))
                .attr("text-anchor", midAngle > Math.PI ? "start" : "end")
                .attr("dy", "0.35em")
                .style("font-size", "12px") // Set font size relative to chart size
                .text(LabelsMap(field["Question Name"], d.data.key));
        });
        

        const tooltip = d3.select(".tooltip");

        function handleMouseOver(event, d) {
            const percentage = isPercentage ? Math.round(d.data.value / totalCount * 100) : d.data.value;

            const tooltipContent = isPercentage
                ? `<strong>${LabelsMap(field["Question Name"], d.data.key)}</strong><br>(${percentage}% of total)`
                : `<strong>${LabelsMap(field["Question Name"], d.data.key)}</strong><br>Responses: ${percentage}`;

            tooltip
                .html(tooltipContent)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px")
                .style("opacity", 0.9);
        }

        function handleMouseOut() {
            tooltip.style("opacity", 0);
        }
        function handleMouseOverFiltered(event, d, totalCount) {
            const filteredLabel = LabelsMap(field["Question Name"], d.data.key);
            const percentage = isPercentage ? Math.round(d.data.value / totalCount * 100) : d.data.value;
        
            const tooltipContent = isPercentage
                ? `<strong>${filteredLabel}</strong><br>(${percentage}% of total)`
                : `<strong>${filteredLabel}</strong><br>Responses: ${percentage}`;
        
            tooltip
                .html(tooltipContent)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px")
                .style("opacity", 0.9);
        }
        
        function handleMouseOutFiltered(event, d, totalCount) {
            tooltip.style("opacity", 0);
        }
        
   
        d3.select(ref.current)
            .selectAll('.arc')
            .on('click', (event, d) => {
                console.log(d);
                const clickedData = d.data.key;
                const fieldName = field["Question Name"];
                setSelectedSlice(clickedData);
                onBarClick(clickedData, fieldName); // Pass clicked data and field name to parent component
            });
            d3.select(ref.current)
            .selectAll('.arc-filtered')
            .on('click', (event, d) => {
                console.log(d);
                const clickedData = d.data.key;
                const fieldName = field["Question Name"];
                setSelectedSlice(clickedData);
                onBarClick(clickedData, fieldName); // Pass clicked data and field name to parent component
            });
    }, [data, isPercentage, yearsSelected, field, onBarClick, selectedSlice, filteredData]);

    return (
        <div className='chart'>
            <svg ref={ref} />
            <div className='tooltip'></div>
        </div>
    );
}
