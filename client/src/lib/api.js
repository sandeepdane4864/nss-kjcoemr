const BASE = import.meta.env.VITE_API_URL || '/api';
let token = localStorage.getItem('nss_token');

export const setToken = (t) => {
  token = t;
  if (t) localStorage.setItem('nss_token', t);
  else localStorage.removeItem('nss_token');
};
export const hasToken = () => Boolean(token);

async function request(method, path, body, isForm = false) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !isForm) headers['Content-Type'] = 'application/json';
  let res;
  try {
    res = await fetch(BASE + path, { method, headers, body: body ? (isForm ? body : JSON.stringify(body)) : undefined });
  } catch {
    throw new Error('Cannot reach the server. Check your connection and try again.');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const first = data?.details?.[0];
    const err = new Error(first ? `${first.field}: ${first.message}` : data?.message || 'Something went wrong');
    err.status = res.status;
    throw err;
  }
  return data;
}

const toForm = (key, files, folder) => {
  const f = new FormData();
  f.append('folder', folder);
  [].concat(files).forEach((file) => f.append(key, file));
  return f;
};

export const api = {
  get: (p) => request('GET', p),
  post: (p, b) => request('POST', p, b ?? {}),
  patch: (p, b) => request('PATCH', p, b ?? {}),
  put: (p, b) => request('PUT', p, b ?? {}),
  del: (p) => request('DELETE', p),
  upload: (file, folder = 'misc') => request('POST', '/uploads', toForm('file', file, folder), true),
  uploadMany: (files, folder = 'gallery') => request('POST', '/uploads/multiple', toForm('files', files, folder), true),
};
