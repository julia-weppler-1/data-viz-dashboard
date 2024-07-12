/*
    Function accepts an array of two options of the following format:

    option : Object

    {
        optionLabel : String,
        optionValue : anything
    }

    The optionValue must be unique. The defaultOption must be provided, and will determine the first render of the component. UpdateSelected should be of the following form:

    (optionValue => ()) and accept the same datatype as optionValue, and update the state at the higher level.
*/

import React from "react";
import { motion } from "framer-motion";

export default function RadioSelect({ options, defaultOption, updateSelected, label }) {
    const [selectedValue, setSelectedValue] = React.useState(defaultOption);

    React.useEffect(() => {
        setSelectedValue(defaultOption);
    }, [defaultOption]);

    if (options.length !== 2) {
        return <></>;
    }

    const handleClick = (newValue) => {
        setSelectedValue(newValue);
        updateSelected(newValue);
    };

    return (
        <div className="p-4">
            {label && <h1 onClick={() => console.log("Current Value:")}>{label}</h1>}
            <div className="flex flex-col ">
                {options.map((option, index) => (
                    <motion.div
                        key={option.optionValue}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="inline-flex items-center justify-left"
                    >
                        <label className="relative flex items-center p-3 rounded-full cursor-pointer" htmlFor={option.optionValue.toString()}>
                            <input
                                name={label}
                                type="radio"
                                onChange={() => handleClick(option.optionValue)}
                                checked={option.optionValue === selectedValue}
                                className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-full border border-blue-gray-200 text-blue-500 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-blue-500 checked:before:bg-blue-500 hover:before:opacity-10"
                                id={option.optionValue.toString()}
                            />
                            <span className="absolute text-blue-500 transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor">
                                    <circle data-name="ellipse" cx="8" cy="8" r="8"></circle>
                                </svg>
                            </span>
                        </label>
                        <span className="ml-2">{option.optionLabel}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
