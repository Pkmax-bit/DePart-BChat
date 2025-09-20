import requests

try:
    response = requests.get('http://127.0.0.1:50755/api/v1/quote/invoices?month=2025-09', timeout=10)
    print('Status:', response.status_code)
    if response.status_code == 200:
        data = response.json()
        quotes = data.get('quotes', [])
        print('Success! Returned', len(quotes), 'quotes')
        if quotes:
            print('Sample quote keys:', list(quotes[0].keys()))
    else:
        print('Error response:', response.text[:200])
except Exception as e:
    print('Error:', e)