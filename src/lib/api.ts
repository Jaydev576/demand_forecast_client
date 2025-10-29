const API_URL = 'http://127.0.0.1:8000';

type FetchOptions = RequestInit & { json?: any };

export async function apiFetch(path: string, options: FetchOptions = {}) {
  const url = API_URL.replace(/\/+$/,'') + '/' + path.replace(/^\/+/, '');

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
    'Content-Type': 'application/json',
  };

  const fetchOptions: RequestInit = {
    method: options.method || (options.json ? 'POST' : 'GET'),
    headers,
    body: options.json ? JSON.stringify(options.json) : options.body,
  };

  const res = await fetch(url, fetchOptions);
  const text = await res.text();
  try {
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
      return { error: data || { message: res.statusText }, status: res.status };
    }
    return { data, status: res.status };
  } catch (e) {
    if (!res.ok) return { error: { message: res.statusText }, status: res.status };
    return { data: text, status: res.status };
  }
}

export default apiFetch;