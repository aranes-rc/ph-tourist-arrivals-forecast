import Papa from 'papaparse';
import { Dayjs } from 'dayjs';
import { ForecastData } from '../../types';

export const exportToCSV = (data: ForecastData[], startDate: Dayjs, endDate: Dayjs) => {
    const formattedData = data.map(item => ({
        'Date': item.Datetime, 
        'Forecasted Arrivals': item.Load,
        'Actual Arrivals': item.Actual || 0
    }));

    const csvData = Papa.unparse(formattedData, {
        header: true,
        columns: ['Date', 'Forecasted Arrivals', 'Actual Arrivals'] //custom headers
    });

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `Tourist_Arrivals_Report_${startDate.format('MM-DD-YYYY')}_to_${endDate.format('MM-DD-YYYY')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
