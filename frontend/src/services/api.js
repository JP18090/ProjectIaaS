function resolveBaseUrl() {
  const runtimeUrl = window.APP_CONFIG?.API_BASE_URL;
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  const baseUrl = runtimeUrl || envUrl || 'http://localhost:3000';
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

async function request(path, options = {}) {
  const response = await fetch(`${resolveBaseUrl()}${path}`, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  });

  if (!response.ok) {
    let message = `Falha na requisicao: ${response.status}`;
    try {
      const body = await response.json();
      message = body.message || body.error || message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function fetchVehicles() {
  return request('/items');
}

export function createVehicle(payload) {
  return request('/items', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateVehicle(id, payload) {
  return request(`/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export function deleteVehicle(id) {
  return request(`/items/${id}`, {
    method: 'DELETE'
  });
}

export function fetchReport() {
  return request('/report');
}

export function fetchVehicleImages(id, limit = 1) {
  return request(`/items/${id}/images?limit=${limit}`);
}

export function fetchFipeBrands() {
  return request('/fipe/brands');
}

export function fetchFipeModels(brandId) {
  return request(`/fipe/brands/${brandId}/models`);
}

export function fetchFipeYears(brandId, modelId) {
  return request(`/fipe/brands/${brandId}/models/${modelId}/years`);
}

export function fetchFipeVehicleInfo(brandId, modelId, yearId) {
  return request(`/fipe/brands/${brandId}/models/${modelId}/years/${yearId}`);
}
