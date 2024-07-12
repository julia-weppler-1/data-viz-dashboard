import React, { useEffect, useState } from "react";
import { labelParser } from "util/parsing/labelParser";
import Checkboxes from "components/Checkboxes";
import ResponseYearDropdown from "components/YearSelect";
import RadioSelect from "components/RadioSelect";
import Charts from "components/Charts"
import getRespones from "util/parsing/getResponses";
import getResponses from "util/parsing/getResponses";
import Button from "components/Button";
import { TbCircleLetterH } from "react-icons/tb";
import { TbCircleLetterQ } from "react-icons/tb";
import "./index.css"


export const SurveyInfo = React.createContext();

export default function HouseholdSurvey() {

    //Filter to check wether it's a Question or Characteristic 

    const filter = (d) => { return (d['Question Name'].charAt(0) === "Q"); };
    const sampleText = "This dashboard shares data from three administrations of telephone surveys given in 2021, 2022, and 2023 on the practices and perspectives of parents toward media, digital devices, and educational technology. As part of a larger research and evaluation study on the long-term educational and community impacts of the district-wide EdConnect broadband initiative, telephone surveys were completed with a random sample of about 400 public school households each year.";

    const [resetValues, setResetValues] = useState(false);

    //Options for years given to the Responses Dropdown
    const options = [
        { path: "/data/household-responses-2021.csv", label: '2021' },
        { path: "/data/household-responses-2022.csv", label: '2022' },
        { path: "/data/household-responses-2023.csv", label: '2023' }
    ];

    const [surveyInfoValue, setSurveyInfoValue] = useState({
        yearsSelected: [],
        allYears: [],
        allYearsPaths: [],
        allQuestions: [],
        allCharacteristics: [],
        isPercentage: false,
        multiSelectAll: false,
        data: {},
        allData: []

    });

    //Add the list of all possible years to the context
    React.useEffect(() => {
        const yearArray = [];
        const yearsSelectedArray = [];

        options.forEach((option) => {
            yearArray.push(option.label);
            yearsSelectedArray.push(option.path);
        })
        setSurveyInfoValue((prev) => ({ ...prev, allYears: yearArray, allYearsPaths: yearsSelectedArray }));
    }, [])

    const handleReset = () => {
        setSurveyInfoValue((prev) => ({ ...prev, isPercentage: false, multiSelectAll: false }));
        // console.log("Context after reset:", surveyInfoValue);
        setResetValues(!resetValues);

    }


    //Update the response data
    const updateData = (newData, fileAdress) => {
        const returnData = surveyInfoValue.data;
        returnData[fileAdress] = newData;
        setSurveyInfoValue((prev) => ({
            ...prev,
            data: returnData
        }));
    }

    //update the total data
    const updateTotalData = (newData, fileAddress) => {
        setSurveyInfoValue((prev) => ({
            ...prev,
            allData: [...prev.allData, ...newData]
        }));
    }

    //Update the multiSelectAll part
    const updateMultiSelect = (newValue) => {
        setSurveyInfoValue((prev) => ({
            ...prev,
            multiSelectAll: newValue,
        }));
    }


    //Updates the isPercentage part of the context

    const updatePercentage = (newValue) => {
        setSurveyInfoValue((prev) => ({
            ...prev,
            isPercentage: newValue,
        }));
    }

    //Updates the allCharacteritics part of the context
    const updateCharacteristics = (newChars) => {
        setSurveyInfoValue((prev) => ({
            ...prev,
            allCharacteristics: newChars,
        }));
    };


    //Updates the allQuestions part of the context
    const updateQuestions = (newQuestions) => {
        setSurveyInfoValue((prev) => ({
            ...prev,
            allQuestions: newQuestions,
        }));
    };


    //Updates the yearsSelected part of the context
    const updateSelected = (newSelected) => {
        setSurveyInfoValue((prev) => ({
            ...prev,
            yearsSelected: newSelected,
        }));
        //console.log("Setting survey info value to: ", newSelected);
    };


    //Parses all the options for the labels for Characteristics and Questions
    useEffect(() => {
        const fetchData = async () => {
            labelParser("/data/labels.csv", updateCharacteristics, (d) => (!filter(d)));
            labelParser("/data/labels.csv", updateQuestions, filter);
        };
        fetchData();
    }, [resetValues]);

    //Parses all the responses for the year and adds them to the data object
    React.useEffect(() => {

        //Clear the old data
        setSurveyInfoValue((prev) => ({
            ...prev,
            data: {},
            allData: []
        }));

        const populateData = async (fileAdress, f) => {
            getResponses(fileAdress, f);
        }
        surveyInfoValue.yearsSelected.forEach(element => {
            populateData(element, updateData);
        });
        surveyInfoValue.allYearsPaths.forEach(element => {
            populateData(element, updateTotalData);
        });
    }, [surveyInfoValue.yearsSelected, resetValues]);



    console.log("Context: ", surveyInfoValue);

    return (
        <>
            <SurveyInfo.Provider value={surveyInfoValue}>
                <div className="container mx-auto">
                    <div className="mb-3">
                        <h4 className="text-4xl">EdConnect 2021-23 Household Survey Results</h4>
                    </div>
                    <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 mb-4">
                        <div className="md:w-1/2">
                            <p className="text-base font-normal">{sampleText}</p>
                        </div>
                        <div className="md:w-1/2">
                            <iframe
                                src="https://www.youtube.com/embed/k86FBDMCXms"
                                width='100%'
                                height='315'
                                title="YouTube video player"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            ></iframe>
                        </div>
                    </div>
                    <hr />
                    <div className="grid grid-cols-5 gap-3 overflow-hidden ">
                        <div className="col-span-1 border rounded-md shadow-md m-2">
                            <div className="m-3">
                                <Button
                                    label={"Reset"}
                                    action={handleReset}
                                />
                            </div>
                            <div className="flex justify-center ">
                                <ResponseYearDropdown
                                    options={options}
                                    resetToDefault={resetValues}
                                    defaultPath={options[2].path}
                                    updateSelected={updateSelected}
                                />
                            </div>
                            <div className="mt-4">
                                <RadioSelect
                                    options={[{ optionLabel: 'Count', optionValue: false }, { optionLabel: 'Percent', optionValue: true }]}
                                    label={"Display Unit"}
                                    updateSelected={updatePercentage}
                                    defaultOption={surveyInfoValue.isPercentage}
                                />
                            </div>
                            <div className="mt-4">
                                <RadioSelect
                                    options={[{ optionLabel: 'Any', optionValue: true }, { optionLabel: 'All', optionValue: false }]}
                                    label={"Filter By"}
                                    updateSelected={updateMultiSelect}
                                    defaultOption={surveyInfoValue.multiSelectAll}
                                />
                            </div>
                        </div>

                        {surveyInfoValue.allCharacteristics.length !== 0 && (
                            <div className=" m-2 col-span-2 max-h-96 border rounded-md shadow-md p-4 maxHeight">
                                <Checkboxes
                                    options={surveyInfoValue.allCharacteristics}
                                    update={updateCharacteristics}
                                    accordionHeader="Household Characteristics"
                                    icon={<TbCircleLetterH size={24} color={"orange"} />}

                                />
                            </div>
                        )}
                        {surveyInfoValue.allQuestions.length !== 0 && (
                            <div className="m-2 col-span-2 max-h-96 border rounded-md shadow-md p-4 maxHeight">
                                <Checkboxes
                                    options={surveyInfoValue.allQuestions}
                                    update={updateQuestions}
                                    accordionHeader="Survey Questions"
                                    icon={<TbCircleLetterQ size={24} color={"blue"} />}
                                />
                            </div>
                        )}
                    </div>
                    <hr />
                    <div className="pt-8">
                        {
                            (surveyInfoValue.data && (Object.keys(surveyInfoValue.data).length != 0) && (<Charts
                                defaultChartType={"bar"}
                                props={surveyInfoValue} />))}
                    </div>
                </div>

            </SurveyInfo.Provider>

        </>

    );
}