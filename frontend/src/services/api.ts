import {
  HospitalSearchRequest,
  HospitalSearchResponse,
  Hospital,
  DatasetStatus,
  AnalyticsCharts,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function checkBackendHealth(): Promise<{ status: string; service: string }> {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error('Backend service unreachable');
  return res.json();
}

export async function searchHospitals(params: HospitalSearchRequest): Promise<HospitalSearchResponse> {
  const res = await fetch(`${API_BASE}/api/hospitals/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.message || 'Hospital search failed');
  }
  return res.json();
}

export async function searchNearbyHospitals(params: {
  latitude: number;
  longitude: number;
  radius_km?: number;
  emergency_type?: string;
  facilities?: string[];
  sort_by?: string;
}): Promise<HospitalSearchResponse> {
  const res = await fetch(`${API_BASE}/api/hospitals/nearby`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      latitude: params.latitude,
      longitude: params.longitude,
      radius_km: params.radius_km || 10.0,
      emergency_type: params.emergency_type || 'General Emergency',
      facilities: params.facilities || [],
      sort_by: params.sort_by || 'suitability',
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.message || 'Nearby hospital search failed');
  }
  return res.json();
}

export async function reverseGeocode(lat: number, lon: number): Promise<{ city: string; locality: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/hospitals/reverse-geocode?lat=${lat}&lon=${lon}`);
    if (res.ok) {
      return res.json();
    }
  } catch (err) {
    console.warn('Backend reverse-geocode fallback note:', err);
  }
  return { city: 'Detected Area', locality: `Near coordinates (${lat.toFixed(3)}, ${lon.toFixed(3)})` };
}

export async function getHospitalById(id: string): Promise<Hospital> {
  const res = await fetch(`${API_BASE}/api/hospitals/${id}`);
  if (!res.ok) throw new Error(`Hospital ${id} not found`);
  return res.json();
}

export async function getHospitalExplanation(id: string, distanceKm = 5.0, emergencyType = 'General Emergency') {
  const res = await fetch(
    `${API_BASE}/api/hospitals/${id}/explanation?distance_km=${distanceKm}&emergency_type=${encodeURIComponent(emergencyType)}`
  );
  if (!res.ok) throw new Error('Failed to retrieve scoring breakdown');
  return res.json();
}

export async function getDatasetStatus(): Promise<DatasetStatus> {
  const res = await fetch(`${API_BASE}/api/dataset/status`);
  if (!res.ok) throw new Error('Failed to fetch dataset status');
  return res.json();
}

export async function loadDemoDataset(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/dataset/load-demo`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to load demo dataset');
  }
  return res.json();
}

export async function resetDataset(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/dataset/reset`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to reset dataset');
  return res.json();
}

export async function uploadDataset(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/api/dataset/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Dataset upload failed');
  }
  return res.json();
}

export async function triggerReprocess(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/dataset/process`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Dataset re-processing failed');
  return res.json();
}

export async function replayPipeline(): Promise<any> {
  const res = await fetch(`${API_BASE}/api/dataset/replay`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Pipeline replay failed');
  }
  return res.json();
}

export async function getDatasetPreview(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  city?: string;
  category?: string;
  onlyFlagged?: boolean;
  sortBy?: string;
  sortAsc?: boolean;
}): Promise<{
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  records: Hospital[];
}> {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page.toString());
  if (params.pageSize) query.append('page_size', params.pageSize.toString());
  if (params.search) query.append('search', params.search);
  if (params.city) query.append('city', params.city);
  if (params.category) query.append('category', params.category);
  if (params.onlyFlagged !== undefined) query.append('only_flagged', params.onlyFlagged.toString());
  if (params.sortBy) query.append('sort_by', params.sortBy);
  if (params.sortAsc !== undefined) query.append('sort_asc', params.sortAsc.toString());

  const res = await fetch(`${API_BASE}/api/dataset/preview?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch dataset preview');
  return res.json();
}

export async function getAnalyticsCharts(): Promise<AnalyticsCharts> {
  const res = await fetch(`${API_BASE}/api/analytics/charts`);
  if (!res.ok) throw new Error('Failed to retrieve analytics data');
  return res.json();
}

export async function getPipelineSteps(): Promise<import('../types').PipelineStepDetail[]> {
  const res = await fetch(`${API_BASE}/api/dataset/pipeline-steps`);
  if (!res.ok) throw new Error('Failed to fetch pipeline steps');
  return res.json();
}

export async function getDatabaseStats(): Promise<import('../types').DatabaseStats> {
  const res = await fetch(`${API_BASE}/api/database/stats`);
  if (!res.ok) throw new Error('Failed to fetch database telemetry');
  return res.json();
}

export async function executeSqlQuery(query: string, limit = 50): Promise<import('../types').SqlQueryResult> {
  const res = await fetch(`${API_BASE}/api/database/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, limit }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.message || 'SQL execution failed');
  }
  return res.json();
}

export async function getPresetQueries(): Promise<import('../types').PresetQuery[]> {
  const res = await fetch(`${API_BASE}/api/database/preset-queries`);
  if (!res.ok) throw new Error('Failed to fetch preset queries');
  return res.json();
}

export async function vacuumDatabase(): Promise<{
  status: string;
  duration_ms: number;
  size_before_kb: number;
  size_after_kb: number;
  reclaimed_kb: number;
  message: string;
}> {
  const res = await fetch(`${API_BASE}/api/database/vacuum`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Database optimization failed');
  }
  return res.json();
}

export async function getDatabaseAuditLogs(limit = 20): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/database/audit-logs?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch database audit logs');
  return res.json();
}

export function getDownloadDatasetUrl(): string {
  return `${API_BASE}/api/dataset/download`;
}

