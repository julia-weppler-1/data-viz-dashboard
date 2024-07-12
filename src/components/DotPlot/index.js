import * as d3 from 'd3';
import { useRef, useEffect, useState } from 'react';
import { LabelsMap } from 'util/parsing/labelsMap';
import { wrap } from 'util/titleWrapper.js';
import './index.css';
export default function DotPlot({ data }) {
    const ref = useRef();
    const [xAxisField, setXAxisField] = useState("Q5l_f"); // State for X axis field
    const [yAxisField, setYAxisField] = useState("Q5k_f"); // State for Y axis field

    const xOptions = Object.keys(data[0]);
    const yOptions = Object.keys(data[0]);
    const [chiSquareValue, setChiSquareValue] = useState(null);
    const [degreesOfFreedom, setDegreesOfFreedom] = useState(null);
    const [isSignificant, setIsSignificant] = useState(null);
    const significanceLevel = 0.05; // Significance level for the chi-square test
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    // Function to handle dropdown open/close
    const handleDropdownToggle = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };
    // Event handler for X axis dropdown
    const handleXAxisChange = (event) => {
        setXAxisField(event.target.value);
        setIsDropdownOpen(false);
    };

    // Event handler for Y axis dropdown
    const handleYAxisChange = (event) => {
        setYAxisField(event.target.value);
        setIsDropdownOpen(false);
    };
    const handleSwapFields = () => {
        // Swap the values of xAxisField and yAxisField
        const temp = xAxisField;
        setXAxisField(yAxisField);
        setYAxisField(temp);
        setIsDropdownOpen(false);
    };
    function getCriticalValue(degreesOfFreedom, significanceLevel=0.05) {
        // Chi-square distribution table (e.g., for significance level 0.05)
        const chiSquareTable = {
            1: 3.841,
            2: 5.991,
            3: 7.815,
            4: 9.488,
            5: 11.070,
            6: 12.592,
            7: 14.067,
            8: 15.507,
            9: 16.919,
            10: 18.307,
            11: 19.675,
            12: 21.026,
            13: 22.362,
            14: 23.685,
            15: 24.996,
            16: 26.296,
        };
        // Check if degrees of freedom is in the table
        if (degreesOfFreedom in chiSquareTable) {
            return chiSquareTable[degreesOfFreedom];
        } else {
            // If degrees of freedom is not in the table, return null
            return null;
        }
    }
    function calculateChiSquare(observed, expected) {
        let chiSquare = 0;
        for (let i = 0; i < observed.length; i++) {
            if (expected[i] !== 0) { // Check if expected frequency is not zero
                chiSquare += Math.pow(observed[i] - expected[i], 2) / expected[i];
            }
        }
       
        return parseFloat(chiSquare.toFixed(4));
    }
    function isChiSquareSignificant(chiSquareValue, degreesOfFreedom, significanceLevel=0.05) {
        // Compute critical value
        const criticalValue = getCriticalValue(degreesOfFreedom, significanceLevel);
    
        // Check if chi-square value exceeds critical value
        return chiSquareValue > criticalValue;
    }
    const xLabelsMap = {};
    const yLabelsMap = {};

    // Populate mapping objects
    xOptions.forEach(option => {
        const label = LabelsMap(option, '');
        if (label !== "Label not found") {
            xLabelsMap[option] = label;
        }
    });
    
    yOptions.forEach(option => {
        const label = LabelsMap(option, '');
        if (label !== "Label not found") {
            yLabelsMap[option] = label;
        }
    });
    useEffect(() => {
        
        const svg = d3.select(ref.current);
        const xField = xAxisField;
        const yField = yAxisField;
        // Map response types to colors
        const uniqueXOptions = new Set();
        const uniqueYOptions = new Set();
        data.forEach(d => {
            Object.keys(d).forEach(key => {
                if (key === xAxisField && d[key] !== "") {
                    uniqueXOptions.add(d[key]);
                }
                if (key === yAxisField && d[key] !== "") {
                    uniqueYOptions.add(d[key]);
                }
            });
        });

        
        const titleText = `The relationship between ${LabelsMap(xAxisField, '')} and ${LabelsMap(yAxisField, '')} is${isSignificant ? '' : "n't"} statistically significant`;
        // Define categories and initialize combined counts object
        const combinedCounts = {};
        if (uniqueXOptions.length !== 0 && uniqueYOptions.length !== 0) {
            let xCategories=Array.from(uniqueXOptions).sort();
            let yCategories=Array.from(uniqueYOptions).sort();
            xCategories.forEach((x, index) => {
                xCategories[index] = LabelsMap(xField, x);
            });
            
            yCategories.forEach((y, index) => {
                yCategories[index] = LabelsMap(yField, y);
            });
            

            // Initialize combined counts for each category
            xCategories.forEach(categoryX => {
                combinedCounts[categoryX] = {};
                yCategories.forEach(categoryY => {
                    combinedCounts[categoryX][categoryY] = 0;
                });
            });
            

            // Calculate combined counts
            data.forEach(d => {
                var xresponse = LabelsMap(xField, d[xField]);
                var yresponse = LabelsMap(yField, d[yField]);
                if (xCategories.includes(xresponse) && yCategories.includes(yresponse)) {
                    combinedCounts[xresponse][yresponse]++;
                }
            });
            console.log(combinedCounts)
            // Calculate max combined count for scaling circle size
            const maxCombinedCount = d3.max(xCategories, categoryX => {
                return d3.max(yCategories, categoryY => combinedCounts[categoryX][categoryY]);
            });
            console.log(maxCombinedCount)
            // Calculate row totals
            const rowTotals = {};
            xCategories.forEach(categoryX => {
                rowTotals[categoryX] = 0;
                yCategories.forEach(categoryY => {
                    rowTotals[categoryX] += combinedCounts[categoryX][categoryY];
                });
            });

            // Calculate column totals
            const columnTotals = {};
            yCategories.forEach(categoryY => {
                columnTotals[categoryY] = 0;
                xCategories.forEach(categoryX => {
                    columnTotals[categoryY] += combinedCounts[categoryX][categoryY];
                });
            });

            // Calculate overall total
            const overallTotal = Object.values(rowTotals).reduce((acc, val) => acc + val, 0);

            // Compute expected frequencies
            const expectedFrequencies = {};
            xCategories.forEach(categoryX => {
                expectedFrequencies[categoryX] = {};
                yCategories.forEach(categoryY => {
                    expectedFrequencies[categoryX][categoryY] = (rowTotals[categoryX] * columnTotals[categoryY]) / overallTotal;
                });
            });

            const observedFrequencies = [];
            xCategories.forEach(categoryX => {
                yCategories.forEach(categoryY => {
                    observedFrequencies.push(combinedCounts[categoryX][categoryY]);
                });
            });

            // Flatten expected frequencies into a 1D array
            const expectedFrequenciesArray = [];
            xCategories.forEach(categoryX => {
                yCategories.forEach(categoryY => {
                    expectedFrequenciesArray.push(expectedFrequencies[categoryX][categoryY]);
                });
            });


            const chiSquare = calculateChiSquare(observedFrequencies, expectedFrequenciesArray)
            setChiSquareValue(chiSquare);
            // Set degrees of freedom
            const df = (xCategories.length - 1) * (yCategories.length - 1);
            setDegreesOfFreedom(df);
            // Check if chi-square value is significant
            const significant = isChiSquareSignificant(chiSquare, df, significanceLevel);
            setIsSignificant(significant);
            // Define dimensions and margins
            const margin = { top: 80, right: 20, bottom: 100, left: 60 };
            const width = 500 - margin.left - margin.right;
            const height = 500 - margin.top - margin.bottom;

            // Create SVG element
            svg.selectAll("*").remove();
            const mainSvg = svg.append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);
            const tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);
            // Define scales for x and y axes
            const xScale = d3.scaleBand()
                .domain(xCategories)
                .range([0, width])
                .padding(0.1);
            const yScale = d3.scaleBand()
                .domain(yCategories)
                .range([height, 0])
                .padding(0.1);

            // Add X-axis
            mainSvg.append("g")
                .attr("transform", `translate(0, ${height})`)
                .call(d3.axisBottom(xScale));

            // Add X-axis label
            const xAxisLabel = mainSvg.append("text")
                .attr("class", "x-axis-label")
                .text(LabelsMap(xField, ''));
            wrap(xAxisLabel, width, true);
            xAxisLabel            
                .attr("x", width + margin.left)
                .attr("y", height + margin.top - 30)
                .style("text-anchor", "middle")
                .attr("font-size", "13px");

            // Add Y-axis
            mainSvg.append("g")
                .call(d3.axisLeft(yScale))
                .selectAll("text")  
                .style("text-anchor", "end")
                .attr("dx", "4em")
                .attr("dy", "-1em")
                .attr("transform", "rotate(-90)");

            // Add Y-axis label
            const yAxisLabel = mainSvg.append("text")
                .attr("class", "y-axis-label")
                .attr("transform", "rotate(-90)")
                .attr("x", -height / 2)
                .attr("y", -margin.left + 20)
                .style("text-anchor", "middle")
                .attr("font-size", "13px")
                .text(LabelsMap(yField, ''));
            wrap(yAxisLabel, width - 40);

        
            const title = mainSvg.append("text")
                .attr("class", "chart-title")
                .attr("x", width / 2)
                .attr("y", margin.top / 2 - 120)
                .attr("text-anchor", "middle")
                .style("font-size", "14px")
                .text(titleText);
            wrap(title, width, true);
            xCategories.forEach(categoryX => {
                yCategories.forEach(categoryY => {
                    const proportion = combinedCounts[categoryX][categoryY] / maxCombinedCount;
                    const radius = Math.sqrt(proportion) * 25;
            
                    const circle = mainSvg.append("circle")
                        .attr("cx", xScale(categoryX) + xScale.bandwidth() / 2)
                        .attr("cy", yScale(categoryY) + yScale.bandwidth() / 2)
                        .attr("r", radius)
                        .attr("fill", "#4c78a8");
            
                    circle.transition()
                        .duration(500)
                        .attr("r", radius)
                        .on("end", () => {
                            circle.on("mouseover", function(event, d) {
                                tooltip.transition()
                                    .duration(200)
                                    .style("opacity", 0.9);
                                const cumulativeCount = combinedCounts[categoryX][categoryY];
                                tooltip.html(`Cumulative Count: ${cumulativeCount}`)
                                    .style("left", (event.pageX) + "px")
                                    .style("top", (event.pageY - 28) + "px");
                            })
                            .on("mouseout", function(d) {
                                tooltip.transition()
                                    .duration(500)
                                    .style("opacity", 0);
                            });
                        });
                });
            });
            
        

    }
    }, [data, xAxisField, yAxisField]);
    const blurb = chiSquareValue !== null && degreesOfFreedom !== null ? (
        <div style={{marginTop: '1%', marginLeft: '5px'}}>
    <p>Chi-square value: {chiSquareValue.toFixed(2)}</p>
    <p>Degrees of freedom: {degreesOfFreedom}</p>
    <p>{chiSquareValue} {chiSquareValue > getCriticalValue(degreesOfFreedom, significanceLevel) ? ">" : "<"} {getCriticalValue(degreesOfFreedom, significanceLevel)}</p>
    <div>
        {isSignificant 
            ? <p>This chi-square value is considered statistically significant at a {significanceLevel} significance level.</p> 
            : <p>This chi-square value is not statistically significant at a {significanceLevel} significance level.</p>}
    </div>
</div>
    ) : null;

    return (
        <div style={{ display: 'flex', width: '1000px', height: '500px', fontSize: '14px' }}>
            <div style={{ width: '50%', marginRight: '20px' }}>
                
            
    
                <div style={{ marginLeft: '20px' }}>
                    <svg ref={ref} style={{ width: '100%', height: '600px' }} />
                </div>
            </div>
    
            <div style={{ width: '20%', marginTop: '7%' }}>
            <div>
                    <div style={{ marginBottom: '10px' }}>
                        <label htmlFor="x-axis-select">Choose X Axis:</label>
                        <select
                            id="x-axis-select"
                            value={xAxisField}
                            onClick={handleDropdownToggle}
                            onChange={(event) => {
                                handleXAxisChange(event);
                            }}
                            style={{ fontSize: '13px', marginLeft: '10px' }}
                        >
                            {xOptions.map((field, index) => (
                                <option key={index} value={field}>
                                    {isDropdownOpen && xLabelsMap[field] ? xLabelsMap[field] : (xLabelsMap[field] ? xLabelsMap[field].slice(0, 12) : '')}
                                </option>
                            ))}

                        </select>
                    </div>
    
                    <div style={{ marginBottom: '10px' }}>
                        <label htmlFor="y-axis-select">Choose Y Axis:</label>
                        <select
                            id="y-axis-select"
                            value={yAxisField}
                            onClick={handleDropdownToggle}
                            onChange={(event) => {
                                handleYAxisChange(event);
                            }}
                            
                            style={{ fontSize: '13px', marginLeft: '10px' }}
                        >
                            {yOptions.map((field, index) => (
                                <option key={index} value={field}>
                                    {isDropdownOpen && yLabelsMap[field] ? yLabelsMap[field] : (yLabelsMap[field] ? yLabelsMap[field].slice(0, 12) : '')}
                                </option>
                            ))}

                        </select>
                    </div>
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <button onClick={handleSwapFields} style={{ fontSize: '12px', padding: '5px 10px' }} className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-1 px-2 border border-blue-500 hover:border-transparent rounded">
                        Swap Fields
                    </button>
                </div>
                {blurb}
            </div>
        </div>
    );
    
    
    
}
