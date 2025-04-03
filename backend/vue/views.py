from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import time
import random

@csrf_exempt
def config(request):
    return JsonResponse({
        "supports_search": True,
        "supports_group_request": False,
        "supported_resolutions": ["1", "5", "15", "30", "60", "D"],
        "supports_marks": False,
        "supports_time": True,
        "exchanges": [{"value": "NEPSE", "name": "Nepal Stock Exchange"}]
    })

@csrf_exempt
def symbols(request):
    symbol = request.GET.get('symbol', 'AAPL')
    return JsonResponse({
        "name": symbol,
        "ticker": symbol,
        "description": f"{symbol} Stock",
        "type": "stock",
        "session": "0930-1530",
        "timezone": "Asia/Kathmandu",
        "minmov": 1,
        "pricescale": 100,
        "has_dwm": True,
        "has_intraday": True,
        "supported_resolutions": ["1", "5", "15", "30", "60", "D"]
    })

@csrf_exempt
def history(request):
    # Generate realistic mock data for 30 days
    timestamps = []
    closes = []
    current_time = int(time.time()) - 86400 * 30
    
    base_price = 1000
    for i in range(30):
        timestamps.append(current_time)
        price_change = random.uniform(-20, 20)
        closes.append(round(base_price + price_change, 2))
        base_price = closes[-1]
        current_time += 86400
        
    return JsonResponse({
        "s": "ok",
        "t": timestamps,
        "c": closes,
        "o": [x - random.uniform(5, 15) for x in closes],
        "h": [x + random.uniform(5, 15) for x in closes],
        "l": [x - random.uniform(10, 20) for x in closes],
        "v": [random.randint(10000, 50000) for _ in closes]
    })