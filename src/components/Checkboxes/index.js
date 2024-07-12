

/*
Parameter: options : [Object]
    Object Form: {
        Question Name: String, 
        Display Label: String, 
        checked: Boolean
    }

Parameter: updateQuestions : ([Object] => ())
    Takes an array of objects of the form above, and updates the managed state

Parameter: accordionHeader : String
    A string of text to be displayed as the header

Parameter: icon: JSX.Element
    JSX element representing the icon to be displayed
*/
import React from 'react';
import { motion } from 'framer-motion';
import './index.css'

export default function Checkboxes({ options, update, accordionHeader, icon}) {
    const handleCheckboxClick = (index) => {
        const updatedQuestions = options.map((question, i) => {
            if (i === index) {
                return { ...question, checked: !question.checked };
            }
            return question;
        });
        update(updatedQuestions);
    };

    const handleInputChange = (index) => {
        handleCheckboxClick(index);
    };

    return (
        <motion.div
            style={{height: '100%'}}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-screen-sm mx-auto overflow-y-auto"
        >
            <div className='m-2'>
                <div className='flex justify-center items-center'>
                    <h6 className='m-2 relative font-semibold'>
                        {accordionHeader}
                    </h6>
                    {icon}
                </div>
                <div>
                    <div style={{ width: '100%' }}>
                        {options.map((element, index) => (
                            <motion.div
                                key={element['Question Name']}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-center mb-4 cursor-pointer"
                            >
                                <input
                                    id={`checkbox-${element['Question Name']}`}
                                    type="checkbox"
                                    value=""
                                    className="w-4 h-4 rounded-full"
                                    checked={element.checked}
                                    onChange={() => handleInputChange(index)}
                                />
                                <label
                                    htmlFor={`checkbox-${element['Question Name']}`}
                                    className="ml-2 text-sm font-medium"
                                    onClick={() => handleInputChange(index)}
                                >
                                    {element['Display Label']}
                                </label>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
