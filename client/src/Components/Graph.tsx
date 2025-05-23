import { useState, useEffect } from 'react';
import { ResponsiveContainer, Area, AreaChart, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, TooltipProps, Legend, LineChart, Line } from 'recharts';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { GraphSkeletonLoading, ExportButtonLoader } from './SkeletonLoading';
import { FaChartLine } from "react-icons/fa6";
import { FaChartBar, FaPlay } from "react-icons/fa";
import dayjs from 'dayjs';
import { useForecastDataStore } from '../store/useForecastDataStore';
import { useDarkThemeMode } from '../store/useDarkThemeMode';
import { ExportModal } from './ExportModal';
import { DateRangeForecast, ForecastData } from '../types';

const maxDate = dayjs('2025-05'); // Add +1 month
const minDate = dayjs('2008-01');

interface GraphProps {
    currentForecastData: ForecastData[];
    forecastMonths: number;
    setForecastMonths: (months: number) => void;
}

export const Graph: React.FC<GraphProps> = ({ currentForecastData, forecastMonths, setForecastMonths }) => {
    const [selectedButton, setSelectedButton] = useState(1);
    const [selectedDate, setSelectedDate] = useState(maxDate); // Add +1 month
    const { forecast } = useForecastDataStore();

    // const isGraphLoading = specificDayData.length === 0 && currentForecastData.length === 0;
    const isGraphLoading = false;
    const { isDark } = useDarkThemeMode();

    const onForecastClick = () => {
        if (selectedDate.isValid()) {
            localStorage.setItem('selectedDate', selectedDate.toString());
            
            forecast(selectedDate.toDate(), forecastMonths);
        }
    }

    useEffect(() => {
        const sessionedSelectedDate = localStorage.getItem('selectedDate');
        console.log('here22', sessionedSelectedDate);
        
        if (sessionedSelectedDate)
            setSelectedDate(dayjs(sessionedSelectedDate));
    }, []);


    const handleButtonClick = (buttonNumber: number) => {
        setSelectedButton(buttonNumber);
    };

    const handleDateChange = (date: Date | dayjs.Dayjs | null) => {
        if (date) {
            const formattedDate = dayjs(date);
            setSelectedDate(formattedDate);
        }
    };

    const CustomTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4">
                    <p className={`font-bold ${isDark ? 'text-black' : 'text-black'}`}>{`Date: ${label}`}</p>
                    {payload.map((entry, index) => {
                        const isActualLoad = entry.name === 'Actual';
                        return (
                            <p
                                key={`tooltip-${index}`}
                                className={`font-bold ${isActualLoad ? 'text-gradient2' : 'text-gradient1'}`}
                            >
                                {`${entry.name}: ${entry.value} tourists 🧳`}
                            </p>
                        );
                    })}
                </div>
            );
        }
        return null;
    };


    const hasActuals = currentForecastData.some(item => item.actual !== null && item.actual !== undefined && item.actual !== 0);

    const pdfData: DateRangeForecast[] = currentForecastData.length > 0 ? [{
        date: selectedDate.format('MM-DD-YYYY'),
        forecast: currentForecastData.map(item => ({
            date: item.date,
            prediction: item.prediction,
            actual: item.actual !== null && item.actual !== undefined ? Number(item.actual) : 0,
        })),
    }] : [];


    return (
        <div>
            <div className={` ${isDark ? 'bg-zinc-900 transition-colors border-2 border-zinc-700 ' : 'bg-white border-2 border-gray-200 '} graph-container mt-10 px-10 py-12 rounded-md drop-shadow-md`}>
                <div className='flex flex-col gap-5 pl-5 pb-10 sm:flex-row sm:justify-between'>
                    <div className='flex items-center gap-5'>
                        <p>Chart type:</p>
                        <div>
                            <button
                                className={`px-6 py-4 rounded-l-lg ${selectedButton === 1
                                    ? 'bg-gradient2 text-white'
                                    : 'bg-gray2 text-gray1'
                                    }`}
                                onClick={() => handleButtonClick(1)}
                            >
                                <FaChartLine />
                            </button>
                            <button
                                className={`px-6 py-4 rounded-e-lg ${selectedButton === 2
                                    ? 'bg-gradient2 text-white'
                                    : 'bg-gray2 text-gray1'
                                    }`}
                                onClick={() => handleButtonClick(2)}
                            >
                                <FaChartBar />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        <input
                            type="number"
                            min={1}
                            max={36}
                            value={forecastMonths}
                            onChange={(e) => setForecastMonths(Number(e.target.value))}
                            placeholder="Months to forecast"
                            className={`px-4 py-[1.1rem] w-[10rem] rounded-[0.2rem] border text-sm outline-none  border-gray-200 
                                ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}
                        />

                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                views={['year', 'month']}
                                onChange={handleDateChange}
                                value={selectedDate}
                                maxDate={maxDate}
                                minDate={minDate}
                                sx={{
                                    '& .MuiInputBase-input': {
                                        color: isDark ? 'white' : 'inherit',
                                    },
                                    '& .MuiOutlinedInput-root': {
                                        backgroundColor: isDark ? 'black' : 'inherit',
                                        borderColor: isDark ? 'white' : 'inherit',
                                    },
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: isDark ? 'white' : 'inherit',
                                    },
                                    '& .MuiIconButton-root': {
                                        color: isDark ? 'white' : 'inherit',
                                    },
                                    '& .MuiInputAdornment-root .MuiIconButton-root': {
                                        color: isDark ? 'white' : 'inherit',
                                    }
                                }}
                            />
                        </LocalizationProvider>

                        <button
                            onClick={onForecastClick}
                            className={`flex items-center gap-3 border bg-gradient1/10 border-gradient2/80 py-[0.9rem] px-4 rounded-[0.2rem] transition-colors duration-150 ease-in-out ${isDark
                            ? 'hover:bg-gray-700 active:bg-gray-600'
                            : 'hover:bg-gray-200 active:bg-gray-300'
                            }`}
                            title="Generate Forecast"
                        >
                            <p className={`text-gradient2 hidden lg:block`}>Forecast</p>
                            <FaPlay className="text-bold text-[1rem] text-gradient2" />
                        </button>

                        {/* {isGraphLoading ? (
                            <ExportButtonLoader />
                        ) : (
                            <ExportModal pdfData={pdfData} />
                        )} */}
                    </div>
                </div>
                <div className='h-[30rem] max-h-30 overflow-y-auto chart-container'>
                    {isGraphLoading ? <GraphSkeletonLoading /> : (
                        <ResponsiveContainer>
                            {selectedButton === 1 ? (
                                <LineChart data={currentForecastData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    {hasActuals && (
                                        <Line
                                            type="monotone"
                                            dataKey="actual"
                                            stroke="#b88909"
                                            name="Actual"
                                            dot={{ stroke: '#b88909', strokeWidth: 5, r: 3, strokeDasharray: '' }}
                                        />
                                    )}
                                    <Line
                                        type="monotone"
                                        dataKey="prediction"
                                        stroke="#ff5500"
                                        name="Forecasted"
                                        dot={{ stroke: '#ff5500', strokeWidth: 5, r: 3, strokeDasharray: '' }}
                                    />
                                </LineChart>
                            ) : (
                                <BarChart data={currentForecastData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar
                                        dataKey="prediction"
                                        fill="#ff5500"
                                        name="Forecasted"
                                    />
                                    {hasActuals && (
                                        <Bar
                                            dataKey="actual"
                                            fill="#b88909"
                                            name="Actual"
                                        />
                                    )}
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    )}

                </div>

            </div>

            <div className='flex flex-col gap-5 px-4 note-fluid-container mt-5'>
                <p>
                    The <span className='text-gradient2 font-bold'> actual data </span> displays the tourist arrival data from the Department of Tourism (DOT) dataset.
                    While, the <span className='text-gradient1 font-bold'> forecasts </span> are generated from the prophet model.
                </p>
                <p className='text-solidRed italic font-semibold'> Note:  The last updated arrivals count for the dataset was April 2025.</p>
            </div>
        </div>
    );
};
