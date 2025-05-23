export interface ForecastData {
    date: string;
    prediction: number;
    actual: number | null;
}

export interface ForecastResponse {
    data: ForecastData[];
    success: boolean;
    error?: string
}

export interface DateRangeForecast {
    date: string;
    forecast: ForecastData[];
}
