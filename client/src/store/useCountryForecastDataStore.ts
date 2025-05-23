import create from 'zustand';
import axios from '../axios';
import { CountryForecastData, ForecastTopCountriesResponse, Resource } from '../types';


interface CountryForecastDataStore {
    status: Resource;
    data: CountryForecastData[];
    error: string | null;
    forecastTopCountries: (date: Date, monthsToForecast: number) => Promise<void>;
}

export const useCountryForecastDataStore = create<CountryForecastDataStore>((set) => ({
    status: 'idle',
    data: [],
    error: null,
    forecastTopCountries: async (date: Date, monthsToForecast: number) => {
        set({ status: 'loading', error: null });

        try {
            const offset = date.getTimezoneOffset();
            const startDate = new Date(date.getTime() - (offset * 60 * 1000));

            const body = {
                "start_date": startDate.toISOString().split('T')[0],
                "months_to_forecast": monthsToForecast
            };

            const response = await axios.post(`/forecast-top-countries`, body);
            const wrappedData: ForecastTopCountriesResponse = response.data;

            const processedData = wrappedData.data
                .map((item) => {
                    return {...item, value: Math.round(item.value)}
                })
                .filter((item) => item.value > 0);

            set({ data: processedData, status: 'success' });
        } catch (err: any) {
            set({ status: 'error', error: err.message ?? 'Unknown error' });
        }
    }
}));
