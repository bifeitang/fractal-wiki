const API_BASE = "http://localhost:4141"

export const fetchJSON = (fn, data) => {
  const url = `${API_BASE}/${fn}`
  return fetch(url, {
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'post'
  }).then(r => r.json())
}

export const fetchText = (fn, data) => {
  const url = `${API_BASE}/${fn}`
  return fetch(url, {
    body: (data),
    method: 'post'
  }).then(r => r.text())
}
