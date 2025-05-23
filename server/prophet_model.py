import pandas as pd
from prophet.serialize import model_from_json
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
import json

COVID_OUTBREAK_DATE = '2020-02-01'
COVID_RECOVERY_DATE = '2023-07-01'

class ProphetTourismModel:
    def __init__(self, model_path, data_path=None):
        self.model_path = model_path
        self.data_path = data_path

        self.model = None
        self.historical_data = None

        self.load_model()

        if data_path:
            self.load_historical_data()
    
    def load_model(self):
        try:
            with open(self.model_path, 'r') as f:
                model = model_from_json(f.read())
            
            self.model = model
            print(f"Model loaded successfully from {self.model_path}")
        except Exception as e:
            raise Exception(f"Error loading model: {str(e)}")
    
    def load_historical_data(self):
        try:
            self.historical_data = pd.read_csv(self.data_path)
            self.historical_data['ds'] = pd.to_datetime(self.historical_data['ds'])
            print(f"Historical data loaded successfully from {self.data_path}")
        except Exception as e:
            raise Exception(f"Error loading historical data: {str(e)}")
    
    def create_future_dataframe(self, start_date, months_to_forecast):
        try:
            start_dt = datetime.strptime(start_date, '%Y-%m-%d')
            
            future_dates = []
            current_date = start_dt
            
            for i in range(months_to_forecast):
                future_dates.append(current_date)
                current_date = current_date + relativedelta(months=1)
            
            future_df = pd.DataFrame({'ds': future_dates})
            return future_df
            
        except Exception as e:
            raise Exception(f"Error creating future dataframe: {str(e)}")
    
    def forecast(self, start_date, months_to_forecast):
        try:
            if not self.model:
                raise Exception("Model not loaded")
            
            future_df = self.create_future_dataframe(start_date, months_to_forecast)

            future_df['pre_covid'] = pd.to_datetime(future_df['ds']) < pd.to_datetime(COVID_OUTBREAK_DATE)
            future_df['has_covid'] = (
                (pd.to_datetime(future_df['ds']) > pd.to_datetime(COVID_OUTBREAK_DATE)) &
                (pd.to_datetime(future_df['ds']) < pd.to_datetime(COVID_RECOVERY_DATE))
            )

            months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
            for i, month in enumerate(months, 1):
                future_df[f'is_{month}'] = (future_df['ds'].dt.month == i).astype(int)

            forecast = self.model.predict(future_df)
            
            results = []
            
            for i, row in future_df.iterrows():
                date_str = row['ds'].strftime('%Y-%m-%d')
                prediction = float(forecast.iloc[i]['yhat'])
                
                actual = None
                if self.historical_data is not None:
                    actual_row = self.historical_data[
                        self.historical_data['ds'].dt.strftime('%Y-%m-%d') == date_str
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
