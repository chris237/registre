const API_URL = "http://localhost:5000/api";

async function fetchData(endpoint) {
  const res = await fetch(`${API_URL}/${endpoint}`);
  return res.json();
}

async function postData(endpoint, data) {
  const res = await fetch(`${API_URL}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

async function deleteData(endpoint, id) {
  await fetch(`${API_URL}/${endpoint}/${id}`, { method: "DELETE" });
}

export const api = { fetchData, postData, deleteData };
