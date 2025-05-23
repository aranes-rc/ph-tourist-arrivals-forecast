import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FaChartBar, FaChartLine, FaPlay } from "react-icons/fa";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from 'recharts';
import { useDarkThemeMode } from '../store/useDarkThemeMode';
import { useForecastDataStore } from '../store/useForecastDataStore';
import { CountryForecastData, DateRangeForecast, ForecastData } from '../types';
import { GraphSkeletonLoading } from './SkeletonLoading';
import { useCountryForecastDataStore } from '../store/useCountryForecastDataStore';
import getRandomColor from '../utils/getRandomColor';
import { Error } from './Error';

const maxDate = dayjs('2025-05'); // Add +1 month
const minDate = dayjs('2008-01');

interface GraphProps {
    currentTopCountriesData: CountryForecastData[];
    currentForecastData: ForecastData[];
    forecastMonths: number;
    setForecastMonths: (months: number) => void;
}

const currentTopCountriesData = JSON.parse(`{"data":[{"name":"Korea","value":1161020.1800921268},{"name":"Usa","value":691690.7194093401},{"name":"Japan","value":445396.7684959759},{"name":"China","value":374954.9257231871},{"name":"Australia","value":217043.4386454593},{"name":"Others","value":188440.83562975944},{"name":"Singapore","value":173779.29768646427},{"name":"Taiwan","value":165857.00817211176},{"name":"Canada","value":136863.74941529162},{"name":"United Kingdom","value":129197.40681954949}],"metadata":{"months_forecasted":12,"start_date":"2013-05-01"},"success":true}`).data;

export const Graph: React.FC<GraphProps> = ({ currentTopCountriesData, currentForecastData, forecastMonths, setForecastMonths }) => {
    const [selectedButton, setSelectedButton] = useState(1);
    const [selectedDate, setSelectedDate] = useState(maxDate); // Add +1 month
    const [pieColors, setPieColors] = useState<string[]>([]); // Add +1 month
    const forecastDataStore = useForecastDataStore();
    const countryForecastDataStore = useCountryForecastDataStore();


    const [isSelecting, setIsSelecting] = useState(false);
    const chartRef = useRef<HTMLDivElement>(null);
    const [refAreaLeft, setRefAreaLeft] = useState<string | null>(null);
    const [refAreaRight, setRefAreaRight] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [data, setData] = useState<ForecastData[]>(currentForecastData || []);
    const [originalData, setOriginalData] = useState<ForecastData[]>(currentForecastData || []);

    const { isDark } = useDarkThemeMode();

    const onForecastClick = () => {
        if (selectedDate.isValid()) {
            localStorage.setItem('selectedDate', selectedDate.toString());
            localStorage.setItem('forecastMonths', forecastMonths.toString());
            
            forecastDataStore.forecast(selectedDate.toDate(), forecastMonths);
            countryForecastDataStore.forecastTopCountries(selectedDate.toDate(), forecastMonths);
        }
    }

    useEffect(() => {
        if (currentForecastData?.length) {
            setData(currentForecastData);
            setOriginalData(currentForecastData);
            setStartDate(currentForecastData[0].date);
            setEndDate(currentForecastData[currentForecastData.length - 1].date);
        }
    }, [currentForecastData]);

    useEffect(() => {
        if (currentTopCountriesData?.length > 0) {
            const colors = currentTopCountriesData.map(() => getRandomColor());

            setPieColors(colors)
        }
    }, [currentTopCountriesData]);

    useEffect(() => {
        const sessionedSelectedDate = localStorage.getItem('selectedDate');
        
        if (sessionedSelectedDate)
            setSelectedDate(dayjs(sessionedSelectedDate));
    }, []);

    const zoomedData = useMemo(() => {
        if (!startDate || !endDate) {
            return data;
        }

        const dataPointsInRange = originalData.filter(
            (dataPoint) => dataPoint.date >= startDate && dataPoint.date <= endDate
        );

        // Ensure we have at least two data points for the chart to prevent rendering a single dot
        return dataPointsInRange.length > 1 ? dataPointsInRange : originalData.slice(0, 2);
    }, [startDate, endDate, originalData, data]);

    const handleButtonClick = (buttonNumber: number) => {
        setStartDate(null);
        setEndDate(null);
        setSelectedButton(buttonNumber);
    };

    const handleDateChange = (date: Date | dayjs.Dayjs | null) => {
        if (date) {
            const formattedDate = dayjs(date);
            setSelectedDate(formattedDate);
        }
    };

    const ChartTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
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

    const PieTooltip = ({ active, payload }: TooltipProps<any, any>) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4">
                    {payload.map((entry, index) => {
                        return (
                            <>
                                <p className={`font-bold ${isDark ? 'text-black' : 'text-black'}`}>{`Country: ${entry.name}`}</p>
                                <p
                                    key={`tooltip-${index}`}
                                    className={`font-bold text-gradient1`}
                                >
                                    {`Tourists: ${entry.value} 🧳`}
                                </p>
                            </>
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

    const handleMouseDown = (e: any) => {
        if (e.activeLabel) {
            setRefAreaLeft(e.activeLabel);
            setIsSelecting(true);
        }
    };

    const handleMouseMove = (e: any) => {
        if (isSelecting && e.activeLabel) {
            setRefAreaRight(e.activeLabel);
        }
    };

    const handleMouseUp = () => {
        if (refAreaLeft && refAreaRight) {
            const [left, right] = [refAreaLeft, refAreaRight].sort();
            setStartDate(left);
            setEndDate(right);
        }
        setRefAreaLeft(null);
        setRefAreaRight(null);
        setIsSelecting(false);
    };

    const handleReset = () => {
        setStartDate(originalData[0].date);
        setEndDate(originalData[originalData.length - 1].date);
    };

    const handleZoom = (e: React.WheelEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!originalData.length || !chartRef.current) return;

        let zoomFactor = 0.1;
        let direction = 0;
        let clientX = 0;

        if ('deltaY' in e) {
            // Mouse wheel event
            direction = e.deltaY < 0 ? 1 : -1;
            clientX = e.clientX;
        } else if (e.touches.length === 2) {
            // Pinch zoom
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);

            if ((e as any).lastTouchDistance) {
                direction = currentDistance > (e as any).lastTouchDistance ? 1 : -1;
            }
            (e as any).lastTouchDistance = currentDistance;

            clientX = (touch1.clientX + touch2.clientX) / 2;
        } else {
            return;
        }

        const currentRange = new Date(endDate || originalData[originalData.length - 1].date).getTime() -
            new Date(startDate || originalData[0].date).getTime();
        const zoomAmount = currentRange * zoomFactor * direction;

        const chartRect = chartRef.current.getBoundingClientRect();
        const mouseX = clientX - chartRect.left;
        const chartWidth = chartRect.width;
        const mousePercentage = mouseX / chartWidth;

        const currentStartDate = new Date(startDate || originalData[0].date).getTime();
        const currentEndDate = new Date(endDate || originalData[originalData.length - 1].date).getTime();

        const newStartDate = new Date(currentStartDate + zoomAmount * mousePercentage);
        const newEndDate = new Date(currentEndDate - zoomAmount * (1 - mousePercentage));

        setStartDate(newStartDate.toISOString());
        setEndDate(newEndDate.toISOString());
    };

    const formatXAxis = (tickItem: string) => {
        return dayjs(tickItem).format('MMM YYYY');
    };

    const formatYAxis = (value: number): string => {
        if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(1) + 'B';
        if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
        if (value >= 1_000) return (value / 1_000).toFixed(1) + 'K';
        return value.toString();
    }
      

    return (
        <div>
            <div className={` ${isDark ? 'bg-zinc-900 transition-colors border-2 border-zinc-700 ' : 'bg-white border-2 border-gray-200 '} graph-container gap-5 flex flex-col mt-10 px-10 py-12 rounded-md drop-shadow-md`}>
                <div className='w-full mx-auto gap-5 sm:flex-row sm:justify-between'>
                    <div className="flex flex-col md:items-end md:flex-row md:justify-center gap-5">
                        <div className='flex flex-col gap-1'>
                            <label>Months to forecast:</label>
                            <input
                                type="number"
                                min={1}
                                max={36}
                                value={forecastMonths}
                                onChange={(e) => setForecastMonths(Number(e.target.value))}
                                placeholder="Months to forecast"
                                className={`px-4 py-[1.1rem] min-w-[10rem] rounded-[0.2rem] border text-sm outline-none  border-gray-200 
                                    ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}
                            />
                        </div>

                        <div className='flex flex-col gap-1'>
                            <label>Starting date:</label>
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
                        </div>

                        <button
                            onClick={onForecastClick}
                            className={`flex justify-center items-center gap-3 border bg-gradient1/10 border-gradient2/80 py-[0.9rem] px-4 rounded-[0.2rem] transition-colors duration-150 ease-in-out ${isDark
                            ? 'hover:bg-gray-700 active:bg-gray-600'
                            : 'hover:bg-gray-200 active:bg-gray-300'
                            }`}
                            title="Generate Forecast"
                        >
                            <p className={`text-gradient2`}>Forecast</p>
                            <FaPlay className="text-bold text-[1rem] text-gradient2" />
                        </button>

                        {/* {isGraphLoading ? (
                            <ExportButtonLoader />
                        ) : (
                            <ExportModal pdfData={pdfData} />
                        )} */}
                    </div>
                </div>
                <hr className="w-1/2 mx-auto"></hr>
                <div className='flex flex-col justify-center md:flex-row gap-10'>
                    <div className='max-h-[30rem] md:w-1/2 overflow-y-auto chart-container' onWheel={handleZoom} onTouchMove={handleZoom} ref={chartRef} style={{ touchAction: 'none' }}>
                        {forecastDataStore.status === 'loading' ? (
                            <GraphSkeletonLoading />
                        ) : forecastDataStore.status === 'error' ? (
                            <Error 
                                title="Couldn't load the chart graph"
                                message={forecastDataStore.error}
                            />
                        ) : forecastDataStore.status === 'success' && data ? (
                            <div className='relative h-[30rem] '>
                                <div className="absolute top-2 right-4 my-2 sm:mb-4 z-40">
                                    <div className='flex flex-row gap-3'>
                                        <div>
                                            <button
                                                className={`px-6 py-4 rounded-l-lg opacity-60 hover:opacity-100 ${selectedButton === 1
                                                    ? 'bg-gradient2 text-white'
                                                    : 'bg-gray2 text-gray1'
                                                    }`}
                                                onClick={() => handleButtonClick(1)}
                                            >
                                                <FaChartLine />
                                            </button>
                                            <button
                                                className={`px-6 py-4 rounded-e-lg opacity-60 hover:opacity-100 ${selectedButton === 2
                                                    ? 'bg-gradient2 text-white'
                                                    : 'bg-gray2 text-gray1'
                                                    }`}
                                                onClick={() => handleButtonClick(2)}
                                            >
                                                <FaChartBar />
                                            </button>
                                        </div>
                                        <button
                                            onClick={handleReset} disabled={!startDate && !endDate} 
                                            className={`border bg-black/5 border-grey py-2 px-4 rounded-[0.2rem] transition-colors duration-150 ease-in-out opacity-60 hover:opacity-100 text-sm ${isDark
                                            ? 'hover:bg-gray-700 active:bg-gray-600'
                                            : 'hover:bg-gray-200 active:bg-gray-300'
                                            }`}
                                        >
                                            Reset view
                                        </button>
                                    </div>
                                </div>
                                <ResponsiveContainer>
                                    {selectedButton === 1 ? (
                                        <LineChart
                                            data={zoomedData}
                                            onMouseDown={handleMouseDown}
                                            onMouseMove={handleMouseMove}
                                            onMouseUp={handleMouseUp}
                                            onMouseLeave={handleMouseUp}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" tickFormatter={formatXAxis} />
                                            <YAxis tickFormatter={formatYAxis} />
                                            <Tooltip content={<ChartTooltip />} />
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
                                        <BarChart
                                            data={zoomedData}
                                            onMouseDown={handleMouseDown}
                                            onMouseMove={handleMouseMove}
                                            onMouseUp={handleMouseUp}
                                            onMouseLeave={handleMouseUp}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" tickFormatter={formatXAxis} />
                                            <YAxis tickFormatter={formatYAxis} />
                                            <Tooltip content={<ChartTooltip />} />
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
                            </div>
                        ) : null}

                    </div>
                    <div className="flex flex-col chart-container md:w-1/2 h-[30rem]">
                        {countryForecastDataStore.status === 'loading' ? (
                            <GraphSkeletonLoading />
                        ) : countryForecastDataStore.status === 'error' ? (
                            <Error 
                                title="Couldn't load the pie graph"
                                message={countryForecastDataStore.error}
                            />
                        ) : countryForecastDataStore.status === 'success' && data ? (
                            <>
                                <h1 className="mx-auto text-2xl font-bold">Top 10 Countries by Arrivals</h1>

                                <ResponsiveContainer>
                                    <PieChart>
                                        <Tooltip content={<PieTooltip />} />
                                        <Pie
                                            data={currentTopCountriesData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={140}
                                            innerRadius={70}
                                            label
                                            labelLine
                                        >
                                            {currentTopCountriesData.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={pieColors[index]} />
                                            ))}
                                        </Pie>
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </>
                        ) : null}
                        
                    </div>
                </div>

                <hr className="w-[80%] mx-auto"></hr>
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
