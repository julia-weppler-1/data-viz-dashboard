import React, { useRef, useState, useEffect } from 'react';
import * as d3 from 'd3';
import { LabelsMap } from "util/parsing/labelsMap";
import './index.css';

export default function TreeMap({ field, isPercentage, data, yearsSelected, onBarClick }) {
    const ref = useRef();
    const [selectedSlice, setSelectedSlice] = useState(null);

    useEffect(() => {
        if (!data || data.length === 0) {
            return;
        }

        const width = 300;
        const height = 200;

        var counts = d3.rollup(data, v => v.length, d => d[field["Question Name"]]);
        var treeData = Array.from(counts, ([key, value]) => ({ key, value }));

        // Colors
        const baseColor = "rgb(151, 210, 245)";
        const complementaryColors = ["#FFD700", "#FF6347", "#32CD32", "#4169E1", "#FFA500", "#CD5C5C", "#00CED1", "#8B0000", "#ADFF2F"];

        // Dummy data for demonstration
        const dummyData = treeData.map((element, index) => ({
            name: LabelsMap(field["Question Name"], element.key),
            value: element.value,
            color: complementaryColors[index % complementaryColors.length] // Use complementary colors in a loop
        }));

        var svg = d3.select(ref.current)
            .attr("width", width)
            .attr("height", height);

        var color = d3.scaleOrdinal().range([baseColor, ...complementaryColors]);

        var treemapLayout = d3.treemap()
            .size([width, height])
            .padding(1)
            .round(true);

        var root = d3.hierarchy({ children: dummyData })
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value);

        treemapLayout(root);

        var cell = svg.selectAll("g")
            .data(root.leaves())
            .enter().append("g")
            .attr("transform", d => `translate(${d.x0},${d.y0})`);

        cell.append("rect")
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("fill", d => d.data.color) // Use the assigned color
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut)
            .on("click", handleClick);

        cell.append("text")
            .attr("x", 5)
            .attr("y", 15)
            .attr("fill", "white")
            .text(d => d.data.name);

        const tooltip = d3.select(".tooltip");

        function handleMouseOver(event, d) {
            const percentage = isPercentage ? Math.round(d.data.value / root.value * 100) : d.data.value;

            const tooltipContent = isPercentage
                ? `<strong>${d.data.name}</strong><br>(${percentage}% of total)`
                : `<strong>${d.data.name}</strong><br>Responses: ${percentage}`;

            tooltip
                .html(tooltipContent)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px")
                .style("opacity", 0.9);
        }

        function handleMouseOut() {
            tooltip.style("opacity", 0);
        }

        function handleClick(event, d) {
            const clickedData = d.data;
            const fieldName = field["Question Name"];

            if (selectedSlice && selectedSlice === clickedData.name) {
                setSelectedSlice(null);
                onBarClick(null, fieldName); // Pass null to indicate deselection
            } else {
                setSelectedSlice(clickedData.name);
                onBarClick(clickedData, fieldName); // Pass clicked data and field name to parent component
            }
        }

    }, [data, isPercentage, yearsSelected, field, onBarClick, selectedSlice]);

    return (
        <div className='chart'>
            <h3 className="chart-title mb-10">{LabelsMap(field["Question Name"], '')}</h3>
            <svg ref={ref} />
            <div className='tooltip'></div>
        </div>
    );
}
