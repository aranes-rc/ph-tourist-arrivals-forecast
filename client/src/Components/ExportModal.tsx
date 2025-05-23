import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { TiDownload } from 'react-icons/ti';
import { MdCancel } from "react-icons/md";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { PdfData } from '../Components/PDF/PdfData';
import { useDarkThemeMode } from '../store/useDarkThemeMode';
import { useForecastDataStore } from '../store/useForecastDataStore';
import { DateRangeForecast, ForecastData } from '../types';
import { formatTimeTo12Hour } from '../utils/convertTo12HourFormat';
import { exportToCSV } from '../Components/CSV/exportToCsv';

interface ExportModalProps {
    pdfData: DateRangeForecast[];
}

export const ExportModal: React.FC<ExportModalProps> = ({ }) => {
    const style = {
        position: 'absolute' as 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '97%',
        maxWidth: 500,
        bgcolor: 'background.paper',
        p: 4,
    };

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const { isDark } = useDarkThemeMode();
    const [selectedButton, setSelectedButton] = useState(1);
    const [startDate, setStartDate] = useState<Dayjs | null>(dayjs());
    const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
    const [dataForRange, setDataForRange] = useState<DateRangeForecast[]>([]);
    const [rawData, setRawData] = useState<ForecastData[]>([]);
    const { fetchForecastByDateRange } = useForecastDataStore();

    const handleButtonClick = (buttonNumber: number) => {
        setSelectedButton(buttonNumber);
    };

    const handleStartDateChange = (date: Dayjs | null) => {
        if (date) {
            setStartDate(date);
        }
    };

    const handleEndDateChange = (date: Dayjs | null) => {
        if (date) {
            setEndDate(date);
        }
    };

    useEffect(() => {
        if (startDate && endDate) {
            fetchForecastByDateRange(startDate.toDate(), endDate.toDate())
                .then(() => {
                    const dataFromStore = useForecastDataStore.getState().currentForecastData;

                    //raw data for csv
                    setRawData(dataFromStore);

                    const groupedData: DateRangeForecast[] = dataFromStore.reduce((acc: DateRangeForecast[], item: ForecastData) => {
                        const date = item.Datetime.split(' ')[0];
                        const existingEntry = acc.find(entry => entry.date === date);

                        if (existingEntry) {
                            existingEntry.forecast.push({
                                Datetime: formatTimeTo12Hour(item.Datetime),
                                Load: item.Load || 0,
                                Actual: item.Actual || 0,
                            });
                        } else {
                            acc.push({
                                date,
                                forecast: [{
                                    Datetime: formatTimeTo12Hour(item.Datetime),
                                    Load: item.Load || 0,
                                    Actual: item.Actual || 0,
                                }],
                            });
                        }

                        return acc;
                    }, []);

                    setDataForRange(groupedData);
                })
                .catch(error => console.error('Error fetching data:', error));
        }
    }, [startDate, endDate, fetchForecastByDateRange]);


    const handleExportCSV = () => {
        if (startDate && endDate) {
            exportToCSV(rawData, startDate, endDate);
        } else {
            console.error('Start date and/or end date is not defined');
        }
    };



    const dateRange: [Dayjs, Dayjs] | null = startDate && endDate ? [startDate, endDate] : null;

    return (
        <div>
            <button
                className={`border border-gray-200 py-[0.9rem] px-4 rounded-md transition-colors duration-150 ease-in-out ${isDark
                    ? 'hover:bg-gray-700 active:bg-gray-600'
                    : 'hover:bg-gray-200 active:bg-gray-300'
                    }`}
                onClick={handleOpen}
            >
                <TiDownload className={` ${isDark ? 'text-gray-400 ' : 'text-gray1'} text-[1.5rem]`} />
            </button>

            <Modal
                open={open}
                onClose={handleClose}
            >
                <Box sx={style}>
                    <div className='flex flex-col font-manrope'>
                        <div className='flex justify-between pb-4'>
                            <p className='text-textBold font-extrabold text-2xl'>Export Data</p>
                            <MdCancel
                                className='cursor-pointer text-3xl text-gradient2 mb-5'
                                onClick={handleClose}
                            />
                        </div>

                        <div className='flex items-center gap-3 pb-10'>
                            <p className='text-textBold font-semibold'>Export as:</p>
                            <div className='flex items-center gap-5'>
                                <button
                                    className={`px-6 py-4 rounded ${selectedButton === 1
                                        ? 'bg-gradient2 text-white'
                                        : 'bg-gray2 text-gray1'
                                        }`}
                                    onClick={() => handleButtonClick(1)}
                                >
                                    PDF
                                </button>
                                <p className='text-textBold font-semibold'>or</p>
                                <button
                                    className={`px-6 py-4 rounded ${selectedButton === 2
                                        ? 'bg-gradient2 text-white'
                                        : 'bg-gray2 text-gray1'
                                        }`}
                                    onClick={() => handleButtonClick(2)}
                                >
                                    CSV
                                </button>
                            </div>
                        </div>

                        <div className='flex flex-col text-textBold'>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <div className='flex items-center gap-5'>
                                    <div>
                                        <p className='pb-2 font-semibold'>Start</p>
                                        <DatePicker
                                            onChange={handleStartDateChange}
                                            value={startDate}
                                            maxDate={dayjs()}
                                            minDate={dayjs('2014-01-01')}
                                        />
                                    </div>
                                    <p className='pt-7 '> — </p>
                                    <div>
                                        <p className='pb-2 font-semibold'>End</p>
                                        <DatePicker
                                            onChange={handleEndDateChange}
                                            value={endDate}
                                            maxDate={dayjs()}
                                            minDate={dayjs('2014-01-01')}
                                        />
                                    </div>
                                </div>
                            </LocalizationProvider>

                            {dateRange && selectedButton === 1 && (
                                <PDFDownloadLink
                                    document={<PdfData data={dataForRange} dateRange={dateRange} />}
                                    fileName={
                                        startDate?.isSame(endDate, 'day')
                                            ? `Energy Load Report (${startDate?.format('MM-DD-YYYY')}).pdf`
                                            : `Energy Load Report (${startDate?.format('MM-DD-YYYY')} to ${endDate?.format('MM-DD-YYYY')}).pdf`
                                    }
                                >
                                    {({ loading }) => (
                                        <button
                                            className={`w-full mt-10 rounded py-2 text-white font-bold 
                    ${loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-gradient2 active:bg-indigo-500'}`}
                                            disabled={loading}
                                        >
                                            {loading ? 'Generating Data...' : 'EXPORT DATA'}
                                        </button>
                                    )}
                                </PDFDownloadLink>
                            )}


                            {dateRange && selectedButton === 2 && (
                                <button
                                    className={`w-full mt-10 rounded py-2 text-white font-bold bg-gradient2 active:bg-indigo-500`}
                                    onClick={handleExportCSV}
                                >
                                    EXPORT DATA
                                </button>
                            )}
                        </div>
                    </div>
                </Box>
            </Modal>
        </div>
    );
};
