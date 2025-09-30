import { api } from "./api.js";

const registerSchema = {
  mandats: [
    "numero",
    "dateSignature",
    "typeMandat",
    "statutMandat",
    "typeTransaction",
    "proprietaire",
    "adresse",
    "caracteristiques",
    "prixSouhaite",
    "commission",
    "validite",
    "dateFinalisation",
    "acquereur"
  ],
  suivi: [
    "numeroMandat",
    "dateSuivi",
    "action",
    "contact",
    "resultat",
    "prochaineEtape",
    "datePrevue"
  ],
  transactions: [
    "numeroTransaction",
    "dateTransaction",
    "mandatRef",
    "typeTransaction",
    "bien",
    "prix",
    "commissionTotale",
    "client",
    "observations"
  ],
  gestion_locative: [
    "numeroBien",
    "adresse",
    "proprietaire",
    "locataire",
    "dateDebutBail",
    "loyer",
    "statutLoyer",
    "datePaiement",
    "observations"
  ],
  recherche: [
    "numeroDemande",
    "dateDemande",
    "client",
    "typeBien",
    "budget",
    "criteres",
    "biensProposes",
    "statutDemande"
  ]
};

const registerTitles = {
  mandats: "Registre des Mandats",
  suivi: "Registre de Suivi",
  transactions: "Registre des Transactions",
  gestion_locative: "Registre de Gestion Locative",
  recherche: "Registre de Recherche"
};

const registerHeaders = {
  mandats: [
    "Numéro",
    "Date Signature",
    "Type",
    "Statut",
    "Transaction",
    "Propriétaire",
    "Adresse",
    "Caractéristiques",
    "Prix Souhaité",
    "Commission",
    "Validité",
    "Finalisation",
    "Acquéreur",
    "Actions"
  ],
  suivi: [
    "Réf. Mandat",
    "Date",
    "Action",
    "Contact",
    "Résultat",
    "Prochaine Étape",
    "Date Prévue",
    "Actions"
  ],
  transactions: [
    "Numéro",
    "Date",
    "Réf. Mandat",
    "Type",
    "Bien",
    "Prix",
    "Commission",
    "Client",
    "Observations",
    "Actions"
  ],
  gestion_locative: [
    "Réf. Bien",
    "Adresse",
    "Propriétaire",
    "Locataire",
    "Début Bail",
    "Loyer",
    "Statut",
    "Paiement",
    "Observations",
    "Actions"
  ],
  recherche: [
    "Numéro",
    "Date",
    "Client",
    "Type de Bien",
    "Budget",
    "Critères",
    "Biens Proposés",
    "Statut",
    "Actions"
  ]
};

const registerConfigs = Object.entries(registerSchema).map(([name, fields]) => ({
  name,
  tableId: `${name}Table`,
  formId: `${name}Form`,
  endpoint: name === "gestion_locative" ? "gestion" : name,
  fields
}));

const registerConfigMap = new Map(registerConfigs.map((config) => [config.name, config]));
const registerControllers = new Map();
const registerDataCache = new Map();
let registersInitialized = false;
let currentUser = null;

const loginSection = document.getElementById("login-section");
const loginForm = document.getElementById("login-form");
const authStatus = document.getElementById("auth-status");
const mainSection = document.getElementById("main-app-section");
const adminSection = document.getElementById("admin-section");
const logoutButton = document.getElementById("logout-button");
const adminButton = document.getElementById("admin-button");
const backToAppButton = document.getElementById("back-to-app");
const createUserForm = document.getElementById("create-user-form");
const userInfo = document.getElementById("user-info");
const navButtons = document.querySelectorAll(".nav-button");
const registerSections = document.querySelectorAll(".register-section");
const statusMessage = document.getElementById("status-message");
const statusText = document.getElementById("status-text");
const statusBox = statusMessage?.querySelector("div");

const STATUS_CLASSES = {
  error: "bg-red-100 border border-red-300 text-red-700",
  success: "bg-green-100 border border-green-300 text-green-700"
};

function showStatus(message, type = "error") {
  if (!statusMessage || !statusText || !statusBox) {
    return;
  }
  statusText.textContent = message;
  statusMessage.classList.remove("hidden");
  statusBox.className = `${STATUS_CLASSES[type] || STATUS_CLASSES.error} px-4 py-3 rounded`;
}

function hideStatus() {
  if (!statusMessage || !statusText || !statusBox) {
    return;
  }
  statusMessage.classList.add("hidden");
  statusText.textContent = "";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return entities[char] || char;
  });
}

function formatPrintValue(value) {
  if (value === null || value === undefined) {
    return "";
  }
  return escapeHtml(value);
}

function getRegisterLabels(name) {
  const headers = registerHeaders[name] || [];
  return headers.filter((header) => header !== "Actions");
}

function buildRegisterTitle(name) {
  return registerTitles[name] || `Registre ${name}`;
}

function openPrintWindow(title, contentHtml) {
  const printWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!printWindow) {
    showStatus("Impossible d'ouvrir la fenêtre d'impression.", "error");
    return;
  }

  const safeTitle = escapeHtml(title);
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <title>${safeTitle}</title>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; margin: 24px; color: #111827; }
          h1 { font-size: 24px; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; font-size: 14px; }
          th { background-color: #f3f4f6; font-weight: 600; }
          tr:nth-child(even) td { background-color: #f9fafb; }
        </style>
      </head>
      <body>
        ${contentHtml}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function printRegister(registerName) {
  const config = registerConfigMap.get(registerName);
  if (!config) {
    return;
  }

  const items = registerDataCache.get(registerName) || [];
  const labels = getRegisterLabels(registerName);
  const title = buildRegisterTitle(registerName);

  const tableHeaders = labels.length
    ? labels.map((label) => `<th>${escapeHtml(label)}</th>`).join("")
    : config.fields.map((field) => `<th>${escapeHtml(field)}</th>`).join("");

  const tableRows = items.length
    ? items
        .map((item) => {
          const cells = config.fields
            .map((field) => `<td>${formatPrintValue(item[field])}</td>`)
            .join("");
          return `<tr>${cells}</tr>`;
        })
        .join("")
    : `<tr><td colspan="${Math.max(labels.length, config.fields.length, 1)}">Aucune donnée à imprimer.</td></tr>`;

  const contentHtml = `
    <h1>${escapeHtml(title)}</h1>
    <table>
      <thead>
        <tr>${tableHeaders}</tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  `;

  openPrintWindow(title, contentHtml);
}

function printRecord(registerName, item) {
  const config = registerConfigMap.get(registerName);
  if (!config) {
    return;
  }

  const labels = getRegisterLabels(registerName);
  const title = `${buildRegisterTitle(registerName)} - ${item[config.fields[0]] || "Enregistrement"}`;

  const rows = config.fields
    .map((field, index) => {
      const label = labels[index] || field;
      return `<tr><th>${escapeHtml(label)}</th><td>${formatPrintValue(item[field])}</td></tr>`;
    })
    .join("");

  const contentHtml = `
    <h1>${escapeHtml(buildRegisterTitle(registerName))}</h1>
    <table>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;

  openPrintWindow(title, contentHtml);
}

function clearTables() {
  registerConfigs.forEach((config) => {
    const tableBody = document.querySelector(`#${config.tableId} tbody`);
    if (tableBody) {
      tableBody.innerHTML = "";
    }
  });
  registerDataCache.clear();
}

function finalizeLogout(message = "") {
  currentUser = null;
  hideStatus();
  clearTables();
  if (userInfo) {
    userInfo.textContent = "";
  }
  if (adminButton) {
    adminButton.classList.add("hidden");
  }
  if (adminSection) {
    adminSection.classList.add("hidden");
  }
  if (mainSection) {
    mainSection.classList.add("hidden");
  }
  if (loginSection) {
    loginSection.classList.remove("hidden");
  }
  if (message && authStatus) {
    authStatus.textContent = message;
    authStatus.classList.remove("hidden");
  } else if (authStatus) {
    authStatus.textContent = "";
    authStatus.classList.add("hidden");
  }
}

function handleAuthError(error) {
  if (error?.status === 401) {
    finalizeLogout("Votre session a expiré. Veuillez vous reconnecter.");
    api.setAuthToken(null);
    return;
  }
  showStatus(error?.message || "Une erreur est survenue", "error");
}

function activateSection(sectionName) {
  navButtons.forEach((button) => {
    if (button.dataset.section === sectionName) {
      button.classList.remove("bg-gray-200", "text-gray-700");
      button.classList.add("bg-gray-800", "text-white");
    } else {
      button.classList.add("bg-gray-200", "text-gray-700");
      button.classList.remove("bg-gray-800", "text-white");
    }
  });

  registerSections.forEach((section) => {
    section.classList.toggle("hidden", section.dataset.section !== sectionName);
  });

  const controller = registerControllers.get(sectionName);
  if (controller) {
    controller.refresh();
  }
}

function setupForm(config) {
  const form = document.getElementById(config.formId);
  const tableBody = document.querySelector(`#${config.tableId} tbody`);

  async function refresh() {
    if (!tableBody || !currentUser) {
      return;
    }
    try {
      const items = await api.fetchData(config.endpoint);
      registerDataCache.set(config.name, items);
      tableBody.innerHTML = "";
      items.forEach((item) => {
        const row = document.createElement("tr");
        row.className = "border-b last:border-b-0";

        config.fields.forEach((field) => {
          const cell = document.createElement("td");
          cell.className = "px-4 py-2 text-sm text-gray-700";
          cell.textContent = item[field] || "";
          row.appendChild(cell);
        });

        const actionsCell = document.createElement("td");
        actionsCell.className = "px-4 py-2 text-sm text-right";

        const printButton = document.createElement("button");
        printButton.type = "button";
        printButton.className = "mr-3 text-blue-600 hover:text-blue-800 font-semibold";
        printButton.textContent = "Imprimer";
        printButton.addEventListener("click", () => {
          printRecord(config.name, item);
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "text-red-600 hover:text-red-800 font-semibold";
        deleteButton.textContent = "Supprimer";
        deleteButton.addEventListener("click", async () => {
          try {
            await api.deleteData(config.endpoint, item.id);
            refresh();
            showStatus("Entrée supprimée avec succès.", "success");
          } catch (error) {
            handleAuthError(error);
          }
        });

        actionsCell.appendChild(printButton);
        actionsCell.appendChild(deleteButton);
        row.appendChild(actionsCell);
        tableBody.appendChild(row);
      });
    } catch (error) {
      handleAuthError(error);
    }
  }

  if (form && !form.dataset.initialized) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      hideStatus();
      const formData = Object.fromEntries(new FormData(form));
      try {
        await api.postData(config.endpoint, formData);
        form.reset();
        showStatus("Entrée enregistrée avec succès.", "success");
        refresh();
      } catch (error) {
        handleAuthError(error);
      }
    });
    form.dataset.initialized = "true";
  }

  return { refresh };
}

function initializeRegisters() {
  if (registersInitialized) {
    return;
  }
  registerConfigs.forEach((config) => {
    registerControllers.set(config.name, setupForm(config));
  });
  registersInitialized = true;
}

function refreshAllRegisters() {
  registerControllers.forEach((controller) => {
    controller.refresh();
  });
}

function handleAuthSuccess(user) {
  currentUser = user;
  if (loginSection) {
    loginSection.classList.add("hidden");
  }
  if (adminSection) {
    adminSection.classList.add("hidden");
  }
  if (mainSection) {
    mainSection.classList.remove("hidden");
  }
  if (authStatus) {
    authStatus.textContent = "";
    authStatus.classList.add("hidden");
  }
  if (userInfo) {
    userInfo.textContent = `Connecté en tant que ${user.email} (${user.role})`;
  }
  if (adminButton) {
    adminButton.classList.toggle("hidden", user.role !== "admin");
  }
  hideStatus();
  initializeRegisters();
  refreshAllRegisters();
  activateSection("mandats");
}

async function attemptRehydrate() {
  if (!api.token) {
    finalizeLogout();
    return;
  }
  try {
    const { user } = await api.me();
    handleAuthSuccess(user);
  } catch (error) {
    api.setAuthToken(null);
    finalizeLogout();
  }
}

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideStatus();
    if (authStatus) {
      authStatus.classList.add("hidden");
    }
    const formData = new FormData(loginForm);
    const email = formData.get("email");
    const password = formData.get("password");
    try {
      const { user } = await api.login(email, password);
      loginForm.reset();
      handleAuthSuccess(user);
    } catch (error) {
      if (authStatus) {
        authStatus.textContent = error?.message || "Impossible de se connecter";
        authStatus.classList.remove("hidden");
      }
    }
  });
}

if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    try {
      await api.logout();
    } catch (error) {
      if (error.status && error.status !== 401) {
        showStatus(error.message, "error");
        return;
      }
    }
    finalizeLogout();
  });
}

if (adminButton) {
  adminButton.addEventListener("click", () => {
    hideStatus();
    if (mainSection) {
      mainSection.classList.add("hidden");
    }
    if (adminSection) {
      adminSection.classList.remove("hidden");
    }
  });
}

if (backToAppButton) {
  backToAppButton.addEventListener("click", () => {
    hideStatus();
    if (adminSection) {
      adminSection.classList.add("hidden");
    }
    if (mainSection) {
      mainSection.classList.remove("hidden");
    }
  });
}

if (createUserForm) {
  createUserForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    hideStatus();
    const formData = Object.fromEntries(new FormData(createUserForm));
    try {
      await api.createUser(formData);
      createUserForm.reset();
      showStatus("Nouvel utilisateur créé avec succès.", "success");
    } catch (error) {
      handleAuthError(error);
    }
  });
}

document.querySelectorAll(".print-register-button").forEach((button) => {
  const registerName = button.dataset.printRegister;
  if (!registerName) {
    return;
  }
  button.addEventListener("click", () => {
    printRegister(registerName);
  });
});

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activateSection(button.dataset.section);
  });
});

attemptRehydrate();
