import React, { useState } from 'react';
import BarChart from '../BarChart';
import filterForChecked from 'util/parsing/filterChecked';
import DonutChart from 'components/DonutChart';
import Button from "components/Button";
import ChartWrapper from 'components/ChartWrapper';
import DotPlot from 'components/DotPlot';
function Charts({ props, defaultChartType }) {
    const { data, isPercentage, allQuestions, multiSelectAll, yearsSelected, allYearsData, allYears, allData} = props;


    const allCheckedFields = filterForChecked(props.allQuestions.concat(props.allCharacteristics));
    let combinedData = [];
    yearsSelected.forEach(year => {
        if (data[year]) {
            combinedData = combinedData.concat(data[year]);
        }
    });
    const [filteredData, setFilteredData] = useState(null);
    const [totalData, setTotalData] = useState(combinedData);
    const [clickedFields, setClickedFields] = useState([]);
    const [selectedCharts, setSelectedCharts] = useState({
        barChart: true,
        donutChart: false
    });
    console.log("Total Data:", totalData);
    const handleBarClick = (clickedData, fieldName) => {
        let newData = totalData;
        let updatedFields = [...clickedFields];

        fieldName = fieldName + ':' + clickedData[0];

        if (clickedData === null) {
            // If clickedData is null, it indicates deselection
            const index = updatedFields.indexOf(fieldName);
            if (index !== -1) {
                console.log("Removing field:", fieldName);
                updatedFields.splice(index, 1); // Remove the field from clickedFields
                setClickedFields(updatedFields);
            } else {
                updatedFields.push(fieldName);
                console.log("Field not found for removal:", fieldName);
            }
        } else {
            // Check if the clicked field already exists in updatedFields
            const fieldIndex = updatedFields.indexOf(fieldName);
            if (!multiSelectAll) {
                const existingFieldIndex = updatedFields.findIndex(field => field.startsWith(fieldName));
                if (existingFieldIndex !== -1) {
                    // Remove the existing field from updatedFields
                    updatedFields.splice(existingFieldIndex, 1);
                    setClickedFields(updatedFields);
                }
                else {
                    updatedFields.push(fieldName);
                    setClickedFields(updatedFields);
                }
            }
            else if (fieldIndex !== -1) {
                // Field already exists
                updatedFields.splice(fieldIndex, 1);
                console.log("Trying to remove:", updatedFields);
                setClickedFields(updatedFields);
            } else {
                // Field doesn't exist, add the field with the clicked value
                console.log("Adding field:", fieldName, "with value:", clickedData[0]);
                updatedFields.push(fieldName);
            }
            console.log("Updated Fields:", updatedFields);
            setClickedFields(updatedFields);
        }

        if (updatedFields.length === 0) {
            // If there are no more clicked fields, reset filteredData to null
            setFilteredData(null);
        } else {
            setClickedFields(updatedFields);
            if (multiSelectAll) {
                const uniqueData = new Set();
                updatedFields.forEach(field => {
                    const [fieldName, fieldValue] = field.split(':');
                    totalData.forEach(entry => {
                        if (entry[fieldName] === fieldValue) {
                            uniqueData.add(entry);
                        }
                    });
                });
                newData = Array.from(uniqueData);
            } else {
                newData = totalData;
                updatedFields.forEach(field => {
                    const [fieldName, fieldValue] = field.split(':');
                    newData = newData.filter(entry => entry[fieldName] === fieldValue);
                });
            }
            setFilteredData(newData); // Update filtered data
            console.log("Filtered Data:", newData);
        }
    };


    const handleResetFilters = () => {
        setFilteredData(null);
        setTotalData(combinedData);
        setClickedFields([]);
    };
    return (
        <div className='chart-container-parent'>
            {/* Reset Filters Button */}
            <div className="m-3">
                <Button
                    label={"Reset Filters"}
                    action={handleResetFilters}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-x-3 gap-y-5">
            <div style={{ gridColumn: '1 / span 3', gridRow: '1', marginRight: '20px', marginBottom: '20px' }}>
    <DotPlot data={filteredData !== null ? filteredData : totalData} />
</div>

                {allCheckedFields.map((field, idx) => {
                    const nullFiltered = filteredData === null ? "" : filteredData.filter(entry => entry[field["Question Name"]] != null && entry[field["Question Name"]] !== '');
                    const nullTotal = totalData.filter(entry => entry[field["Question Name"]] != null && entry[field["Question Name"]] !== '');
                    return (
                        <React.Fragment key={idx}>
                            {selectedCharts.barChart && (
                                <ChartWrapper
                                    field={field}
                                    isPercentage={isPercentage}
                                    data={nullTotal}
                                    yearsSelected={yearsSelected}
                                    onBarClick={handleBarClick}
                                    filteredData={nullFiltered}
                                    defaultChartType={defaultChartType}
                                    title={field["Display Label"]}
                                    allYears={allYears}
                                    allData={allData}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
    
}
export default Charts;