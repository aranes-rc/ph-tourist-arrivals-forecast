from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
from prophet_model import ProphetTourismModel

app = Flask(__name__)
CORS(app)

MODEL_PATH = './model/prophet_model.json'
DATA_PATH = './dataset/tourism_prophet_dataset.csv'

try:
    tourism_model = ProphetTourismModel(MODEL_PATH, DATA_PATH)
    print("Tourism forecasting model initialized successfully")
except Exception as e:
    print(f"Error initializing model: {str(e)}")
    tourism_model = None

@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Tourism Forecast API',
        'model_loaded': tourism_model is not None
    })

@app.route('/forecast', methods=['POST'])
def forecast():
    """
    Forecast tourist arrivals
    
    Expected JSON payload:
    {
        "start_date": "2024-01-01",
        "months_to_forecast": 12
    }
    """
    try:
        if not tourism_model:
            return jsonify({
                'success': False,
                'error': 'Model not initialized'
            }), 500
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No JSON data provided'
            }), 400
        
        start_date = data.get('start_date')
        months_to_forecast = data.get('months_to_forecast')
        
        if not start_date:
            return jsonify({
                'success': False,
                'error': 'start_date is required'
            }), 400
        
        if not months_to_forecast:
            return jsonify({
                'success': False,
                'error': 'months_to_forecast is required'
            }), 400
        
        try:
            months_to_forecast = int(months_to_forecast)
        except ValueError:
            return jsonify({
                'success': False,
                'error': 'months_to_forecast must be an integer'
            }), 400
        
        if months_to_forecast <= 0:
            return jsonify({
                'success': False,
                'error': 'months_to_forecast must be greater than 0'
            }), 400
        
        result = tourism_model.forecast(start_date, months_to_forecast)
        
        if result['success']:
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@app.route('/export', methods=['POST'])
def export_forecast():
    """
    Export forecast to file
    
    Expected JSON payload:
    {
        "start_date": "2024-01-01",
        "months_to_forecast": 12
    }
    """
    try:
        if not tourism_model:
            return jsonify({
                'success': False,
                'error': 'Model not initialized'
            }), 500
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No JSON data provided'
            }), 400
        
        start_date = data.get('start_date')
        months_to_forecast = data.get('months_to_forecast')
        
        if not start_date or not months_to_forecast:
            return jsonify({
                'success': False,
                'error': 'start_date and months_to_forecast are required'
            }), 400
        
        filename = tourism_model.export_forecast(
            start_date, 
            int(months_to_forecast)
        )
        
        return send_file(
            filename,
            as_attachment=True,
            download_name=filename
        )
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Export error: {str(e)}'
        }), 500

@app.route('/model-info', methods=['GET'])
def model_info():
    """Get model information"""
    try:
        if not tourism_model:
            return jsonify({
                'success': False,
                'error': 'Model not initialized'
            })
        
        return jsonify({
            'success': True,
            'model_path': tourism_model.model_path,
            'data_path': tourism_model.data_path,
            'historical_data_loaded': tourism_model.historical_data is not None,
            'historical_records': len(tourism_model.historical_data) if tourism_model.historical_data is not None else 0
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

if __name__ == '__main__':
    if not os.path.exists(MODEL_PATH):
        print(f"Warning: Model file {MODEL_PATH} not found")
    
    print("Starting Tourism Forecast API server...")
    print("Available endpoints:")
    print("  GET  /           - Health check")
    print("  POST /forecast   - Generate forecast")
    print("  POST /export     - Export forecast to file")
    print("  GET  /model-info - Get model information")
    
    app.run(debug=True, host='0.0.0.0', port=5000)