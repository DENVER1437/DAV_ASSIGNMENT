from fastapi.testclient import TestClient
from app.main import app

with TestClient(app) as client:
    # 1. Health
    r = client.get('/api/health')
    assert r.status_code == 200, f"Health check failed: {r.text}"
    print('[PASS] Health OK')

    # 2. Status & Pipeline Steps
    r = client.get('/api/dataset/status')
    assert r.status_code == 200, f"Status failed: {r.text}"
    print('[PASS] Status OK (Records:', r.json()['total_records'], ')')

    r = client.get('/api/dataset/pipeline-steps')
    assert r.status_code == 200, f"Pipeline steps failed: {r.text}"
    steps = r.json()
    assert len(steps) == 6, f"Expected 6 steps, got {len(steps)}"
    print(f'[PASS] Pipeline steps OK ({len(steps)} steps with analysis)')
    for s in steps:
        print(f"   Stage {s['id']}: {s['title']} -> {s['short_desc']}")
        assert len(s['analysis']) > 20
        assert len(s['metrics']) > 0

    # 3. Database Stats
    r = client.get('/api/database/stats')
    assert r.status_code == 200, f"Database stats failed: {r.text}"
    db_st = r.json()
    assert db_st['is_ready'] is True
    assert db_st['hospitals_count'] == 10000
    assert db_st['integrity_check'] == 'ok'
    print(f"[PASS] Database Stats OK ({db_st['hospitals_count']} records, file: {db_st['file_size_formatted']}, latency: {db_st['query_benchmark_ms']}ms)")

    # 4. SQL Query Runner
    r = client.post('/api/database/query', json={
        'query': 'SELECT City, COUNT(*) as Total_Hospitals, ROUND(AVG(Bed_Occupancy_Pct), 1) as Avg_Occupancy FROM hospitals GROUP BY City ORDER BY Total_Hospitals DESC LIMIT 3;'
    })
    assert r.status_code == 200, f"SQL query failed: {r.text}"
    q_res = r.json()
    print(f"[PASS] SQL Query OK ({q_res['row_count']} rows in {q_res['duration_ms']}ms):")
    for row in q_res['rows']:
        print('  ', row)

    # 5. Search
    r = client.post('/api/hospitals/search', json={
        'city': 'Delhi',
        'radius_km': 15,
        'emergency_type': 'Cardiac Emergency',
        'required_facilities': ['Cardiology', 'ICU'],
        'priorities': {'distance': 25, 'bed_availability': 25, 'icu_availability': 25, 'waiting_time': 25},
        'page': 1,
        'page_size': 3
    })
    assert r.status_code == 200, f"Search failed: {r.text}"
    s_res = r.json()
    assert s_res['total_matches'] > 0
    print(f"[PASS] Search OK ({s_res['total_matches']} matches, top score: {s_res['results'][0]['suitability_score']})")

    # 6. Database Vacuum
    r = client.post('/api/database/vacuum')
    assert r.status_code == 200, f"Vacuum failed: {r.text}"
    print(f"[PASS] Vacuum OK: {r.json()['message']}")

    # 7. Preset Queries
    r = client.get('/api/database/preset-queries')
    assert r.status_code == 200
    presets = r.json()
    assert len(presets) >= 4
    print(f"[PASS] Preset queries OK ({len(presets)} enterprise queries available)")

    print('\n' + '='*50)
    print('ALL FASTAPI INTEGRATION TESTS PASSED SUCCESSFULLY!')
    print('='*50)
