import React from "react";
import { motion } from "framer-motion"; // Import framer motion for animations
import { TbCircleLetterH } from "react-icons/tb";
import { TbCircleLetterQ } from "react-icons/tb";
import { FiZoomIn, FiZoomOut, FiPieChart, FiBarChart } from "react-icons/fi";
import { FaChartLine, FaChartBar, FaChartPie } from "react-icons/fa6";
import BarChart from "components/BarChart";
import DonutChart from "components/DonutChart";
import "./index.css";
import LineChart from "components/LineChart";
import SlopeChart from "components/LineChart";

export default function ChartWrapper({ field, isPercentage, yearsSelected, onBarClick, data, filteredData, defaultChartType, title, allYears, allData }) {
    const [chartType, setChartType] = React.useState(defaultChartType);

    const changeChartType = (newType) => {
        setChartType(newType);
    };


    return (
        <motion.div // Wrap the entire component with motion for animations
            initial={{ opacity: 0, y: -20 }} // Initial animation settings
            animate={{ opacity: 1, y: 0 }} // Animation settings when component is mounted
            transition={{ duration: 0.5 }} // Transition duration
            className="flex flex-col justify-between"
        >
            <div>
                <div className="titleWrapper" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <h3>{title}</h3>
                </div>

                <div className="flex justify-between items-center"> {/* Added items-center class */}
                    <div>
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            {(field["Question Name"][0] === "Q") ? <TbCircleLetterQ size={24} color={"blue"} /> : <TbCircleLetterH size={24} color={"orange"} />}
                        </motion.div>
                    </div>
                    <div className="flex space-x-2 margin-right-3">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-gray-600 hover:text-gray-800 focus:outline-none"
                            onClick={() => changeChartType('bar')}
                        >
                            <FaChartBar />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-gray-600 hover:text-gray-800 focus:outline-none"
                            onClick={() => changeChartType('line')}
                        >
                            <FaChartLine />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-gray-600 hover:text-gray-800 focus:outline-none"
                            onClick={() => changeChartType('pie')}
                        >
                            <FaChartPie />
                        </motion.button>
                    </div>

                </div>
                <div style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
                    {chartType === "bar" ? (
                        <BarChart
                            field={field}
                            isPercentage={isPercentage}
                            data={data}
                            yearsSelected={yearsSelected}
                            onBarClick={onBarClick}
                            filteredData={filteredData}
                        />
                    ) : (chartType == 'pie' ?
                        (<DonutChart
                            field={field}
                            isPercentage={isPercentage}
                            data={data}
                            yearsSelected={yearsSelected}
                            onBarClick={onBarClick}
                            filteredData={filteredData}
                        />) :
                        (
                        <SlopeChart 
                        data={allData} 
                        field={field} 
                        years={allYears}/>
                        )
                    )
                    }
                </div>
            </div>
        </motion.div >
    );
}
