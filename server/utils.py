from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
import pandas as pd

COVID_OUTBREAK_DATE = '2020-02-01'
COVID_RECOVERY_DATE = '2023-07-01'

def create_future_dataframe(start_date, months_to_forecast):
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