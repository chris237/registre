import { api } from "./api.js";

const registerConfigs = [
  { name: "mandats", tableId: "mandatTable", formId: "mandatForm", endpoint: "mandats", fields: ["numero", "typeMandat"] },
  { name: "transactions", tableId: "transactionTable", formId: "transactionForm", endpoint: "transactions", fields: ["numero", "bien"] },
  { name: "suivi", tableId: "suiviTable", formId: "suiviForm", endpoint: "suivi", fields: ["numeroMandat", "action"] },
  { name: "recherche", tableId: "rechercheTable", formId: "rechercheForm", endpoint: "recherche", fields: ["numero", "client"] },
  { name: "gestion", tableId: "gestionTable", formId: "gestionForm", endpoint: "gestion", fields: ["numeroBien", "locataire"] }
];

const registerControllers = new Map();
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

function clearTables() {
  registerConfigs.forEach((config) => {
    const tableBody = document.querySelector(`#${config.tableId} tbody`);
    if (tableBody) {
      tableBody.innerHTML = "";
    }
  });
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
      tableBody.innerHTML = "";
      items.forEach((item) => {
        const row = document.createElement("tr");
        row.className = "border-b last:border-b-0";
        const cells = config.fields
          .map((field) => `<td class="px-4 py-2 text-sm text-gray-700">${item[field] || ""}</td>`)
          .join("");
        row.innerHTML = `${cells}<td class="px-4 py-2 text-sm text-right"><button data-id="${item.id}" class="delete-btn text-red-600 hover:text-red-800 font-semibold">Supprimer</button></td>`;
        tableBody.appendChild(row);
      });

      tableBody.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", async () => {
          try {
            await api.deleteData(config.endpoint, button.dataset.id);
            refresh();
            showStatus("Entrée supprimée avec succès.", "success");
          } catch (error) {
            handleAuthError(error);
          }
        });
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

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activateSection(button.dataset.section);
  });
});

attemptRehydrate();
