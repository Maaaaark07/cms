import React, { useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import 'chart.js/auto';

ChartJS.register(ArcElement, Tooltip);

const emptyChart = {
    labels: ['Male', 'Female', 'Senior Citizens', 'Youth'],
    datasets: [
        {
            data: [0, 0, 0, 0],
            backgroundColor: ['#0F3D3E', '#8E0553', '#F86151', '#FFBA42'],
            borderWidth: 0,
            hoverOffset: 4,
            hoverBorderWidth: 2,
            hoverBorderColor: '#ffffff',
        },
    ],
};

const PopulationChart = ({
    title = 'Population Statistics',
    male = 0,
    female = 0,
    seniorCitizens = 0,
    youth = 0,
    totalPopulation = 0,
    loading = false,
    filterLabel,
    filterValue,
    filterOptions = [],
    onFilterChange,
}) => {
    const [hoverData, setHoverData] = useState(null);
    const chartData = {
        ...emptyChart,
        datasets: [
            {
                ...emptyChart.datasets[0],
                data: [male || 0, female || 0, seniorCitizens || 0, youth || 0],
            },
        ],
    };

    const chartOptions = {
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            tooltip: {
                enabled: true,
                callbacks: {
                    label: (context) => {
                        const value = context.raw;
                        const percentage = totalPopulation
                            ? ((value / totalPopulation) * 100).toFixed(1)
                            : '0.0';
                        return `${context.label}: ${Number(value).toLocaleString()} (${percentage}%)`;
                    },
                },
            },
            legend: {
                display: false,
            },
        },
        onHover: (event, elements) => {
            if (elements && elements.length > 0) {
                const dataIndex = elements[0].index;
                const value = chartData.datasets[0].data[dataIndex];
                const label = chartData.labels[dataIndex];
                const percentage = totalPopulation
                    ? ((value / totalPopulation) * 100).toFixed(1)
                    : '0.0';
                setHoverData({ label, value, percentage });
                event.native.target.style.cursor = 'pointer';
            } else {
                setHoverData(null);
                event.native.target.style.cursor = 'default';
            }
        },
        hover: {
            mode: 'nearest',
            intersect: true,
        },
    };

    return (
        <div className="p-4 bg-white rounded-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h3 className="text-gray-500 text-xl font-bold">{title}</h3>
                {onFilterChange && (
                    <select
                        value={filterValue || ''}
                        onChange={(event) => onFilterChange(event.target.value)}
                        className="border text-sm border-gray-300 p-2 text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px]"
                    >
                        <option value="">{filterLabel || 'All'}</option>
                        {filterOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                )}
            </div>
            {loading ? (
                <p className="text-gray-500">Loading chart data...</p>
            ) : (
                <>
                    <div className="relative flex items-center justify-center" style={{ height: '484px' }}>
                        <Doughnut data={chartData} options={chartOptions} />
                        <div className="absolute inset-0 flex items-center justify-center" style={{ pointerEvents: 'none' }}>
                            {hoverData ? (
                                <div className="text-center transition-all duration-200">
                                    <p className="text-2xl font-bold text-gray-700">
                                        {hoverData.value.toLocaleString()}
                                    </p>
                                    <p className="text-lg text-gray-600 font-medium">{hoverData.label}</p>
                                    <p className="text-sm text-gray-500">{hoverData.percentage}% of total</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-700">
                                        {totalPopulation?.toLocaleString() || 'N/A'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-center mt-4 gap-4">
                        <div className="flex items-center space-x-2">
                            <span className="block w-4 h-4 bg-[#0F3D3E]"></span>
                            <span className="text-sm sm:text-base">Male</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="block w-4 h-4 bg-[#8E0553]"></span>
                            <span className="text-sm sm:text-base">Female</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="block w-4 h-4 bg-[#F86151]"></span>
                            <span className="text-sm sm:text-base">Sr. Citizen</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="block w-4 h-4 bg-[#FFBA42]"></span>
                            <span className="text-sm sm:text-base">Youth</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default PopulationChart;
