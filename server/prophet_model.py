import pandas as pd
from prophet.serialize import model_from_json
from prophet_country_model import ProphetCountrySpecificModels
from utils import create_future_dataframe, COVID_OUTBREAK_DATE, COVID_RECOVERY_DATE
import json

class ProphetTourismModel:
    def __init__(
        self, 
        aggregated_model_path, 
        aggregated_data_path,
        country_monthly_data_path,
    ):
        self.aggregated_model_path = aggregated_model_path
        self.aggregated_data_path = aggregated_data_path

        self.aggregated_model = None
        self.aggregated_historical_data = None

        self.prophet_countries = ProphetCountrySpecificModels(
            data_path=country_monthly_data_path,
            max_workers=8,  # TODO: Remove this
            cache_models=True
        )
        
        self.load_aggregated_model()
        self.load_historical_data()
    
    def load_aggregated_model(self):
        try:
            with open(self.aggregated_model_path, 'r') as f:
                model = model_from_json(f.read())
            
            self.aggregated_model = model
            print(f"Aggregated model loaded successfully from {self.aggregated_model_path}")
        except Exception as e:
            raise Exception(f"Error loading aggregated model: {str(e)}")
    
    def load_historical_data(self):
        try:
            self.aggregated_historical_data = pd.read_csv(self.aggregated_data_path)
            self.aggregated_historical_data['ds'] = pd.to_datetime(self.aggregated_historical_data['ds'])
            print(f"The aggregated historical data has been loaded successfully!")
        except Exception as e:
            raise Exception(f"Error loading historical data: {str(e)}")
    
    def forecast(self, start_date, months_to_forecast):
        try:
            if not self.aggregated_model:
                raise Exception("Aggregated model is not loaded")
            
            future_df = create_future_dataframe(start_date, months_to_forecast)

            future_df['pre_covid'] = pd.to_datetime(future_df['ds']) < pd.to_datetime(COVID_OUTBREAK_DATE)
            future_df['has_covid'] = (
                (pd.to_datetime(future_df['ds']) > pd.to_datetime(COVID_OUTBREAK_DATE)) &
                (pd.to_datetime(future_df['ds']) < pd.to_datetime(COVID_RECOVERY_DATE))
            )

            months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
            for i, month in enumerate(months, 1):
                future_df[f'is_{month}'] = (future_df['ds'].dt.month == i).astype(int)

            forecast = self.aggregated_model.predict(future_df)
            
            results = []
            
            for i, row in future_df.iterrows():
                date_str = row['ds'].strftime('%Y-%m-%d')
                prediction = float(forecast.iloc[i]['yhat'])
                
                actual = None
                if self.aggregated_historical_data is not None:
                    actual_row = self.aggregated_historical_data[
                        self.aggregated_historical_data['ds'].dt.strftime('%Y-%m-%d') == date_str
                    ]
                    if not actual_row.empty:
                        actual = float(actual_row.iloc[0]['y'])
                
                results.append({
                    'date': date_str,
                    'actual': actual,
                    'prediction': prediction
                })
            
            return {
                'success': True,
                'data': results,
                'metadata': {
                    'start_date': start_date,
                    'months_forecasted': months_to_forecast,
                    'total_records': len(results)
                }
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'data': []
            }
    
    def forecast_top_countries(self, start_date, months_to_forecast, count=None):
        try:
            results = self.prophet_countries.forecast_top_countries(start_date, months_to_forecast, count)
                
            return {
                'success': True,
                'data': results,
                'metadata': {
                    'start_date': start_date,
                    'months_forecasted': months_to_forecast
                }
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'data': []
            }
    
    def export_forecast(self, start_date, months_to_forecast, export_format='csv'):
        try:
            forecast_result = self.forecast(start_date, months_to_forecast)
            
            if not forecast_result['success']:
                raise Exception(forecast_result['error'])
            
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
            filename = f'tourism_forecast_{timestamp}.csv'
            df = pd.DataFrame(forecast_result['data'])
            df.to_csv(filename, index=False)
            
            return filename
        except Exception as e:
            raise Exception(f"Error exporting forecast: {str(e)}")
