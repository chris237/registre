import { api } from "./api.js";

function setupForm(tableId, formId, endpoint, fields) {
  const form = document.getElementById(formId);
  const tableBody = document.querySelector(`#${tableId} tbody`);

  async function refresh() {
    const items = await api.fetchData(endpoint);
    tableBody.innerHTML = "";
    items.forEach(i => {
      const tr = document.createElement("tr");
      tr.innerHTML = fields.map(f => `<td class='border px-2'>${i[f]||""}</td>`).join("")
        + `<td><button data-id="${i.id}" class="delete-btn bg-red-500 text-white px-2">X</button></td>`;
      tableBody.appendChild(tr);
    });
    tableBody.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        await api.deleteData(endpoint, btn.dataset.id);
        refresh();
      });
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    await api.postData(endpoint, data);
    form.reset();
    refresh();
  });

  refresh();
}

setupForm("mandatTable", "mandatForm", "mandats", ["numero","typeMandat"]);
setupForm("transactionTable", "transactionForm", "transactions", ["numero","bien"]);
setupForm("suiviTable", "suiviForm", "suivi", ["numeroMandat","action"]);
setupForm("rechercheTable", "rechercheForm", "recherche", ["numero","client"]);
setupForm("gestionTable", "gestionForm", "gestion", ["numeroBien","locataire"]);
