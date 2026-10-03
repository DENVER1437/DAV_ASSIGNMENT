import requests

BASE = 'http://127.0.0.1:8000/api'

# 1. Health
res = requests.get(f'{BASE}/health')
assert res.status_code == 200, f'Health failed: {res.text}'
print('[PASS] GET /api/health passed')

# 2. Dataset Status & Summary
res = requests.get(f'{BASE}/dataset/status')
assert res.status_code == 200 and res.json()['is_processed'] is True
print('[PASS] GET /api/dataset/status passed (Records:', res.json()['total_records'], ')')

res = requests.get(f'{BASE}/dataset/summary')
assert res.status_code == 200
print('[PASS] GET /api/dataset/summary passed')

# 3. City Search: Delhi
req_delhi = {
    'city': 'Delhi',
    'radius_km': 15,
    'emergency_type': 'Cardiac Emergency',
    'required_facilities': ['Cardiology', 'ICU', 'Emergency Department'],
    'priorities': {'distance': 25, 'bed_availability': 25, 'icu_availability': 25, 'waiting_time': 25},
    'page': 1,
    'page_size': 5
}
res = requests.post(f'{BASE}/hospitals/search', json=req_delhi)
assert res.status_code == 200
data = res.json()
assert data['total_matches'] > 0
top = data['results'][0]
print(f"[PASS] Search Delhi: {data['total_matches']} matches (Top: {top['Hospital_Name']}, Score: {top['suitability_score']})")

# 4. Pincode / Area Search
req_area = {
    'area_or_pincode': '560038',
    'radius_km': 20,
    'emergency_type': 'Accident / Trauma',
    'required_facilities': ['Trauma Center', 'Ambulance'],
    'priorities': {'distance': 35, 'bed_availability': 25, 'icu_availability': 20, 'waiting_time': 20},
    'page': 1,
    'page_size': 5
}
res = requests.post(f'{BASE}/hospitals/search', json=req_area)
assert res.status_code == 200
assert res.json()['total_matches'] > 0
print(f"[PASS] Pincode/Area search: {res.json()['total_matches']} matches")

# 5. Geolocation Coordinates Search (Latitude & Longitude)
req_geo = {
    'latitude': 12.9716,
    'longitude': 77.5946,
    'radius_km': 10,
    'emergency_type': 'General Emergency',
    'required_facilities': ['Emergency Department'],
    'priorities': {'distance': 25, 'bed_availability': 25, 'icu_availability': 25, 'waiting_time': 25},
    'page': 1,
    'page_size': 5
}
res = requests.post(f'{BASE}/hospitals/search', json=req_geo)
assert res.status_code == 200
assert res.json()['total_matches'] > 0
print(f"[PASS] Geolocation coords search: {res.json()['total_matches']} matches")

# 6. Hospital Details & Explanation
h_id = top['Hospital_ID']
res = requests.get(f'{BASE}/hospitals/{h_id}')
assert res.status_code == 200 and res.json()['Hospital_ID'] == h_id
print(f"[PASS] GET /api/hospitals/{h_id} passed")

res = requests.get(f'{BASE}/hospitals/{h_id}/explanation?distance_km=4.2&emergency_type=Cardiac%20Emergency')
assert res.status_code == 200
print(f"[PASS] GET /api/hospitals/{h_id}/explanation passed")

# 7. Dataset Preview Pagination & Filters
res = requests.get(f'{BASE}/dataset/preview?page=1&page_size=10&city=Mumbai')
assert res.status_code == 200
assert len(res.json()['records']) == 10
print('[PASS] GET /api/dataset/preview pagination passed')

res = requests.get(f'{BASE}/dataset/preview?only_flagged=true')
assert res.status_code == 200
print(f"[PASS] GET /api/dataset/preview flagged filter passed ({res.json()['total']} flagged/imputed records)")

# 8. Analytics Charts
res = requests.get(f'{BASE}/analytics/charts')
assert res.status_code == 200
print(f"[PASS] GET /api/analytics/charts passed (Cities count: {len(res.json()['city_distribution'])})")

# 9. Smart Empty Results
req_empty = {
    'city': 'Delhi',
    'radius_km': 1,
    'emergency_type': 'Accident / Trauma',
    'required_facilities': ['Trauma Center', 'ICU', 'Ambulance', 'Cardiology', 'Neurology', 'Pediatrics'],
    'priorities': {'distance': 25, 'bed_availability': 25, 'icu_availability': 25, 'waiting_time': 25},
    'page': 1,
    'page_size': 5
}
res = requests.post(f'{BASE}/hospitals/search', json=req_empty)
assert res.status_code == 200
if res.json()['total_matches'] == 0:
    assert res.json()['empty_suggestion'] is not None
    print('[PASS] Smart empty state suggestion verified:', res.json()['empty_suggestion'][:60], '...')

# 10. Invalid CSV Upload Protection
fake_file = {'file': ('bad.txt', b'not a csv file content', 'text/plain')}
res = requests.post(f'{BASE}/dataset/upload', files=fake_file)
assert res.status_code == 400
print('[PASS] Invalid file upload rejection passed (Status 400)')

# 11. Pipeline Step-by-Step Telemetry & Analysis
res = requests.get(f'{BASE}/dataset/pipeline-steps')
assert res.status_code == 200
steps = res.json()
assert len(steps) == 6, f'Expected 6 pipeline steps, got {len(steps)}'
for s in steps:
    assert 'analysis' in s and len(s['analysis']) > 20
    assert 'metrics' in s and len(s['metrics']) > 0
print(f"[PASS] GET /api/dataset/pipeline-steps passed (Verified {len(steps)} stages with analytical insights)")

# 12. Persistent Database Health & Telemetry
res = requests.get(f'{BASE}/database/stats')
assert res.status_code == 200
db_data = res.json()
assert db_data['is_ready'] is True
assert db_data['integrity_check'] == 'ok'
assert db_data['hospitals_count'] > 0
assert 'SQLite' in db_data['engine']
print(f"[PASS] GET /api/database/stats passed ({db_data['hospitals_count']} records in {db_data['database_file']}, {db_data['indexes_count']} B-Tree indices, integrity: {db_data['integrity_check']})")

# 13. Interactive SQL Query Runner
sql_req = {
    'query': 'SELECT City, COUNT(*) as Total_Hospitals, ROUND(AVG(Bed_Occupancy_Pct), 1) as Avg_Occupancy FROM hospitals GROUP BY City ORDER BY Total_Hospitals DESC LIMIT 5;'
}
res = requests.post(f'{BASE}/database/query', json=sql_req)
assert res.status_code == 200
query_res = res.json()
assert query_res['row_count'] > 0
assert 'City' in query_res['columns']
print(f"[PASS] POST /api/database/query passed (Executed in {query_res['duration_ms']}ms, {query_res['row_count']} rows returned)")

# 14. Database Vacuum & Optimization
res = requests.post(f'{BASE}/database/vacuum')
assert res.status_code == 200
assert res.json()['status'] == 'OPTIMIZED'
print(f"[PASS] POST /api/database/vacuum passed ({res.json()['message']})")

print('\n' + '='*50)
print('ALL QUALITY BAR AUTOMATED TESTS PASSED SUCCESSFULLY!')
print('='*50)

