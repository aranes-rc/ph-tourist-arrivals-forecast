from prophet import Prophet
from prophet.serialize import model_to_json, model_from_json
from utils import create_future_dataframe, COVID_OUTBREAK_DATE, COVID_RECOVERY_DATE
import pandas as pd
import holidays
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor, as_completed
from multiprocessing import cpu_count
import numpy as np
from functools import partial
import os
from typing import Dict, Tuple, Optional
import time

class ProphetCountrySpecificModels:
    months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

    def __init__(self, data_path, use_multiprocessing=False, max_workers=None, cache_models=True):
        # Default to threading since multiprocessing has issues with pandas/Prophet
        self.use_multiprocessing = use_multiprocessing
        self.max_workers = max_workers or min(cpu_count(), 8)
        self.cache_models = cache_models
        self.cache_dir = "./model/country_model_cache"
        
        if self.cache_models:
            os.makedirs(self.cache_dir, exist_ok=True)
        
        self.load_historical_data(data_path)
        self.holidays = self.get_all_holidays()
        self.models = {}
        
        # Pre-compute country data to avoid repeated filtering
        self.country_data_cache = self._prepare_country_data()
        
        self.prepare_and_train_models()
        print(f"[>>>>] All {len(self.models)} models have been trained using {self.max_workers} workers!")

    def load_historical_data(self, data_path):
        try:
            self.historical_data = pd.read_csv(data_path)
            self.historical_data = self.historical_data.rename(columns={'Date': 'ds', 'Arrivals': 'y'})
            self.historical_data['ds'] = pd.to_datetime(self.historical_data['ds'])
            print(f"Country-specific historical data loaded: {len(self.historical_data)} rows")
        except Exception as e:
            raise Exception(f"Error loading historical data: {str(e)}")
    
    def _prepare_country_data(self):
        """Pre-compute and cache country-specific data to avoid repeated operations"""
        country_data = {}
        countries = self.historical_data['Country of Residence'].unique()
        
        # Add common columns once to the main dataframe
        self._add_feature_columns(self.historical_data)
        
        for country in countries:
            country_data[country] = self.historical_data[
                self.historical_data['Country of Residence'] == country
            ].copy()
        
        return country_data
    
    def _add_feature_columns(self, df):
        """Add all feature columns to dataframe"""
        # Monthly indicators
        for i, month in enumerate(self.months, 1):
            df[f'is_{month}'] = (df['ds'].dt.month == i).astype(int)
        
        # COVID periods
        covid_outbreak_date = '2020-02-01'
        covid_end_recovery_date = '2023-07-01'
        
        df['pre_covid'] = pd.to_datetime(df['ds']) < pd.to_datetime(covid_outbreak_date)
        df['has_covid'] = (
            (pd.to_datetime(df['ds']) > pd.to_datetime(covid_outbreak_date)) &
            (pd.to_datetime(df['ds']) < pd.to_datetime(covid_end_recovery_date))
        )

    def _create_model_for_country(self, country: str) -> Prophet:
        """Create a Prophet model for a specific country"""
        model = Prophet(
            yearly_seasonality=False,
            seasonality_mode='multiplicative',
            holidays=self.holidays,
        )

        # Add regressors
        for month in self.months:
            model.add_regressor(f'is_{month}')

        # Add seasonalities
        monthly_period = 365.5
        fourier_order = 10
        model.add_seasonality(
            name='yearly_pre_covid', 
            period=monthly_period, 
            fourier_order=fourier_order, 
            condition_name='pre_covid'
        )
        model.add_seasonality(
            name='yearly_has_covid', 
            period=monthly_period, 
            fourier_order=fourier_order, 
            condition_name='has_covid'
        )
        
        return model

    def _train_single_model(self, country):
        """Train a single model - designed for parallel execution"""
        # Get country data from cache
        country_data = self.country_data_cache[country]
        
        # Check cache first
        if self.cache_models:
            cache_path = os.path.join(self.cache_dir, f"{country.replace('/', '_')}_model.json")
            if os.path.exists(cache_path):
                try:
                    with open(cache_path, 'r') as f:
                        model = model_from_json(f.read())
                    print(f"[>] Loaded cached model for {country}")
                    return country, model
                except Exception as e:
                    print(f"[>] Cache corrupted for {country}, retraining...")
        
        print(f"[>] Training model for {country}...")
        start_time = time.time()
        
        model = self._create_model_for_country(country)
        model.fit(country_data)
        
        # Cache the trained model
        if self.cache_models:
            cache_path = os.path.join(self.cache_dir, f"{country.replace('/', '_')}_model.json")
            try:
                with open(cache_path, 'w') as f:
                    f.write(model_to_json(model))
            except Exception as e:
                print(f"Warning: Could not cache model for {country}: {e}")
        
        elapsed = time.time() - start_time
        print(f"[>] Completed {country} in {elapsed:.2f}s")
        return country, model

    def prepare_and_train_models(self):
        """Prepare and train all models in parallel"""
        countries = list(self.country_data_cache.keys())
        
        # Use ThreadPoolExecutor by default since it's more reliable with Prophet/pandas
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            future_to_country = {
                executor.submit(self._train_single_model, country): country 
                for country in countries
            }
            
            for future in as_completed(future_to_country):
                try:
                    country, model = future.result()
                    self.models[country] = model
                except Exception as e:
                    country = future_to_country[future]
                    print(f"Error training model for {country}: {e}")
                    import traceback
                    traceback.print_exc()

    def _forecast_single_country(self, country, future_df):
        """Forecast for a single country - designed for parallel execution"""        
        print(f"[>] Forecasting {country}...")
        start_time = time.time()
        
        try:
            model = self.models[country]
            forecast = model.predict(future_df)
            total_forecast = forecast['yhat'].sum()
            
            elapsed = time.time() - start_time
            print(f"\t[>] {country} forecasted {int(total_forecast)} in {elapsed:.2f}s")
            
            return country, total_forecast, forecast
        except Exception as e:
            print(f"Error forecasting for {country}: {e}")
            return country, 0, None

    def forecast_top_countries(self, start_date, months_to_forecast, count=None, return_full_forecasts=False):
        """Forecast all countries in parallel and return top performances"""
        if count is None:
            count = 5
        
        # Prepare future dataframe once
        future_df = create_future_dataframe(start_date, months_to_forecast)
        self._add_feature_columns_to_future(future_df)
        
        forecast_totals = {}
        full_forecasts = {} if return_full_forecasts else None
        
        # Use ThreadPoolExecutor for forecasting
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            future_to_country = {
                executor.submit(self._forecast_single_country, country, future_df.copy()): country 
                for country in self.models.keys()
            }
            
            for future in as_completed(future_to_country):
                try:
                    country, total, forecast = future.result()
                    if total > 0:  # Only include successful forecasts
                        forecast_totals[country] = total
                        if return_full_forecasts:
                            full_forecasts[country] = forecast
                except Exception as e:
                    country = future_to_country[future]
                    print(f"Error in forecast for {country}: {e}")

        # Sort and return top countries
        results = dict(sorted(forecast_totals.items(), key=lambda item: item[1], reverse=True))
        top_results = dict(list(results.items())[:count])
        
        if return_full_forecasts:
            return top_results, {k: v for k, v in full_forecasts.items() if k in top_results}
        
        return top_results
    
    def _add_feature_columns_to_future(self, future_df):
        """Add feature columns to future dataframe"""
        future_df['pre_covid'] = pd.to_datetime(future_df['ds']) < pd.to_datetime(COVID_OUTBREAK_DATE)
        future_df['has_covid'] = (
            (pd.to_datetime(future_df['ds']) > pd.to_datetime(COVID_OUTBREAK_DATE)) &
            (pd.to_datetime(future_df['ds']) < pd.to_datetime(COVID_RECOVERY_DATE))
        )

        for i, month in enumerate(self.months, 1):
            future_df[f'is_{month}'] = (future_df['ds'].dt.month == i).astype(int)

    def get_all_holidays(self):
        """Get holidays dataframe - optimized version"""
        data_years = list(range(
            self.historical_data['ds'].dt.year.min(), 
            self.historical_data['ds'].dt.year.max() + 3  # Add buffer for forecasting
        ))

        country_code = 'PH'
        country_holidays = holidays.country_holidays(country_code, years=data_years)

        holiday_df = pd.DataFrame(
            [(name, date) for date, name in country_holidays.items()],
            columns=['holiday', 'ds']
        )

        holiday_df['lower_window'] = 0
        holiday_df['upper_window'] = 0
        holiday_df = holiday_df.sort_values(by='ds').reset_index(drop=True)
        
        holiday_df['ds'] = pd.to_datetime(holiday_df['ds'])
        holiday_df['ds'] = holiday_df['ds'].dt.strftime('%Y-%m-01')
        holiday_df['ds'] = pd.to_datetime(holiday_df['ds'])
        holiday_df = holiday_df.drop_duplicates(subset=['holiday', 'ds'])
        
        # COVID lockdown periods
        lockdowns = pd.DataFrame([
            {
                'holiday': 'covid_impact_1',
                'ds': '2020-02-01',
                'lower_window': 0,
                'ds_upper': '2020-12-01'
            },
            {
                'holiday': 'covid_impact_2',
                'ds': '2021-01-01',
                'lower_window': 0,
                'ds_upper': '2021-12-01'
            },
            {
                'holiday': 'covid_recovery',
                'ds': '2022-01-01',
                'lower_window': 0,
                'ds_upper': '2022-07-01'
            }
        ])

        for t_col in ['ds', 'ds_upper']:
            lockdowns[t_col] = pd.to_datetime(lockdowns[t_col])

        lockdowns['upper_window'] = (lockdowns['ds_upper'] - lockdowns['ds']).dt.days

        return pd.concat([lockdowns, holiday_df])
    
    def clear_cache(self):
        """Clear the model cache"""
        if os.path.exists(self.cache_dir):
            import shutil
            shutil.rmtree(self.cache_dir)
            print("Model cache cleared")


if __name__ == "__main__":
    models = ProphetCountrySpecificModels(
        data_path="./dataset/country_monthly_dataset.csv",
        use_multiprocessing=False,  # Use threading by default
        max_workers=8,  # Adjust based on your CPU
        cache_models=True  # Cache trained models for reuse
    )
    
    top_countries = models.forecast_top_countries(
        start_date="2024-01-01",
        months_to_forecast=12,
        count=10
    )
    
    print("Top forecasted countries:", top_countries)