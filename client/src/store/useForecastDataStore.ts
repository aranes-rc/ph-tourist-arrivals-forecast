import create from 'zustand';
import axios from '../axios';
import { ForecastData, ForecastResponse } from '../types';
import dayjs from 'dayjs';

interface ForecastDataStore {
    currentForecastData: ForecastData[];
    forecast: (date: Date, monthsToForecast: number) => Promise<void>;
}

export const useForecastDataStore = create<ForecastDataStore>((set) => ({
    currentForecastData: [],
    forecast: async (date: Date, monthsToForecast: number) => {
        try {
            const offset = date.getTimezoneOffset();
            const startDate = new Date(date.getTime() - (offset * 60 * 1000));

            const body = {
                "start_date": startDate.toISOString().split('T')[0],
                "months_to_forecast": monthsToForecast
            };

            const response = await axios.post(`/forecast`, body);
            const wrappedData: ForecastResponse = response.data;

            const processedData = wrappedData.data.map((item) => {
                const date = dayjs(item.date).format('MMM YYYY')
                const actual = item.actual !== undefined && item.actual !== null ? item.actual : 0;
                const prediction = Math.floor(item.prediction);

                return {
                    date, prediction, actual
                };
            }).filter((item) => item.date !== null);

            if (processedData.length > 0) {
                set({ currentForecastData: processedData });
            } else {
                set({ currentForecastData: [] });
            }
        } catch (error) {
            console.error('Error fetching specific day data:', error);
        }
    },
}));
