import create from 'zustand';
import axios from '../axios';
import { ForecastData, ForecastResponse, ForecastTopCountriesResponse, Resource } from '../types';

interface ForecastDataStore {
    status: Resource;
    data: ForecastData[];
    error: string | null;
    forecast: (date: Date, monthsToForecast: number) => Promise<void>;
}

export const useForecastDataStore = create<ForecastDataStore>((set) => ({
    status: 'idle',
    error: null,
    data: [],
    forecast: async (date: Date, monthsToForecast: number) => {
        set({ status: 'loading', error: null });

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
                const date = item.date
                const actual = item.actual !== undefined && item.actual !== null ? item.actual : 0;
                const prediction = Math.round(item.prediction);

                return {
                    date, prediction, actual
                };
            }).filter((item) => item.date !== null);

            set({ data: processedData, status: 'success' });
        } catch (error: any) {
            set({ status: 'error', error: error.message ?? 'Unknown error' });
        }
    },
    forecastTopCountries: async (date: Date, monthsToForecast: number) => {
        set({ isPieGraphLoading: true });

        try {
            const offset = date.getTimezoneOffset();
            const startDate = new Date(date.getTime() - (offset * 60 * 1000));

            const body = {
                "start_date": startDate.toISOString().split('T')[0],
                "months_to_forecast": monthsToForecast
            };

            const response = await axios.post(`/forecast-top-countries`, body);
            const wrappedData: ForecastTopCountriesResponse = response.data;

            const processedData = wrappedData.data.filter((item) => item.value < 0);

            if (processedData.length > 0) {
                set({ currentTopCountriesData: processedData });
            } else {
                set({ currentTopCountriesData: [] });
            }
        } catch (error) {
            console.error('Error forecasting top countries data:', error);
        }

        set({ isPieGraphLoading: false });
    }
}));
