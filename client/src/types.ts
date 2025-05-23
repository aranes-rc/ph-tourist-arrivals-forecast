export type Resource = 'idle' | 'loading' | 'success' | 'error';

export interface ForecastData {
    date: string;
    prediction: number;
    actual: number | null;
}

export interface CountryForecastData {
    name: string;
    value: number;
}

export interface ForecastResponse {
    data: ForecastData[];
    success: boolean;
    error?: string
}

export interface ForecastTopCountriesResponse {
    data: CountryForecastData[];
    success: boolean;
    error?: string
}

export interface DateRangeForecast {
    date: string;
    forecast: ForecastData[];
}
