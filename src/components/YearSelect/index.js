import React, { useCallback, useEffect, useState, useContext } from "react";
import { SurveyInfo } from "pages/HouseholdSurvey";
import { select } from "d3";
/*

    Parameter: options : [Object]
    Object Form: [{path : String, label : String}]

    Path is the path to the csv in the public folder
    Label is the label that will go next to the checkbox
    No options provided will cause the ResponseYearDropdown to return nothing.

    Parameter: default : String

    default is the path to the csv that should be checked by default. Leaving it empty means there will be nothing checked by default.

    
    Parameter: updateSelected : ([String]) => (Void)
    updateSelected should be the state in the parent element which keeps track of the CSV's that are selected

*/

export default function ResponseYearDropdown({ options, updateSelected, defaultPath, resetToDefault }) {

    const [responses, setResponses] = useState(defaultPath ? [defaultPath] : []);

    const responsesContains = (path) => {
        for (let i = 0; i < responses.length; i++) {
            if (responses[i] == path) { return true; }
        }
        return false;
    }

    useEffect(() => {
        setResponses([defaultPath]);
    }, [resetToDefault]);


    useEffect(() => {
        updateSelected(responses);
    }, []);


    const onChange = useCallback(
        (path) => (ev) => {
            const isChecked = ev.target.checked;
            let newResponses;
            if (isChecked) {
                newResponses = [...responses, path];
            } else {
                newResponses = responses.filter((p) => p !== path);
            }
            setResponses(newResponses);
            updateSelected(newResponses);
        },
        [responses, updateSelected]
    );

    if (!options || !options[0]) {
        return null;
    }

    // console.log("Selected:");
    // console.log(responses);

    return (
        <div className="text-center p-4 w-full">
            <h6 className="text-xl mb-2">Response Year:</h6>
            <div className="space-y-2 ml-3">
                {options.map((option) => {
                    return (
                        <label key={option.path} className="flex items-center">
                            <input
                                type="checkbox"
                                checked={responsesContains(option.path)}
                                onChange={onChange(option.path)}
                                className="w-6 h-6 mr-2"
                            />
                            <span className="text-lg">{option.label}</span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
}
