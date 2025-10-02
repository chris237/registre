import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Briefcase,
  FileText,
  Home,
  Loader,
  LogOut,
  Plus,
  Printer,
  Search,
  Trash2,
  TrendingUp,
  Users
} from 'lucide-react';
import { api } from './api.js';

const registerDefinitions = {
  mandats: {
    title: 'Registre des Mandats',
    icon: Briefcase,
    endpoint: 'mandats',
    fields: [
      { name: 'numero', label: 'N° Mandat', required: true },
      { name: 'dateSignature', label: 'Date de signature', type: 'date' },
      { name: 'typeMandat', label: 'Type de mandat' },
      { name: 'statutMandat', label: 'Statut du mandat' },
      { name: 'typeTransaction', label: 'Type de transaction' },
      { name: 'proprietaire', label: 'Propriétaire' },
      { name: 'adresse', label: 'Adresse', type: 'textarea', fullWidth: true },
      { name: 'caracteristiques', label: 'Caractéristiques', type: 'textarea', fullWidth: true },
      { name: 'prixSouhaite', label: 'Prix souhaité' },
      { name: 'commission', label: 'Commission' },
      { name: 'validite', label: 'Validité' },
      { name: 'dateFinalisation', label: 'Date de finalisation', type: 'date' },
      { name: 'acquereur', label: 'Acquéreur' }
    ],
    columns: [
      { name: 'numero', label: 'N° Mandat' },
      { name: 'dateSignature', label: 'Date signature' },
      { name: 'typeMandat', label: 'Type' },
      { name: 'statutMandat', label: 'Statut' },
      { name: 'typeTransaction', label: 'Transaction' },
      { name: 'proprietaire', label: 'Propriétaire' },
      { name: 'adresse', label: 'Adresse', wrap: true },
      { name: 'prixSouhaite', label: 'Prix souhaité' }
    ]
  },
  suivi: {
    title: 'Registre de Suivi des Mandats',
    icon: TrendingUp,
    endpoint: 'suivi',
    fields: [
      { name: 'numeroMandat', label: 'Réf. Mandat', required: true },
      { name: 'dateSuivi', label: "Date de l'action", type: 'date' },
      { name: 'action', label: 'Action réalisée' },
      { name: 'contact', label: 'Contact associé' },
      { name: 'resultat', label: 'Résultat', type: 'textarea', fullWidth: true },
      { name: 'prochaineEtape', label: 'Prochaine étape', type: 'textarea', fullWidth: true },
      { name: 'datePrevue', label: 'Date prévue', type: 'date' }
    ],
    columns: [
      { name: 'numeroMandat', label: 'Réf. Mandat' },
      { name: 'dateSuivi', label: 'Date' },
      { name: 'action', label: 'Action' },
      { name: 'contact', label: 'Contact' },
      { name: 'resultat', label: 'Résultat', wrap: true },
      { name: 'prochaineEtape', label: 'Prochaine étape', wrap: true }
    ]
  },
  transactions: {
    title: 'Registre des Transactions',
    icon: FileText,
    endpoint: 'transactions',
    fields: [
      { name: 'numeroTransaction', label: 'N° Transaction', required: true },
      { name: 'dateTransaction', label: 'Date', type: 'date' },
      { name: 'mandatRef', label: 'Réf. Mandat' },
      { name: 'typeTransaction', label: 'Type de transaction' },
      { name: 'bien', label: 'Bien concerné' },
      { name: 'prix', label: 'Prix' },
      { name: 'commissionTotale', label: 'Commission totale' },
      { name: 'client', label: 'Client' },
      { name: 'observations', label: 'Observations', type: 'textarea', fullWidth: true }
    ],
    columns: [
      { name: 'numeroTransaction', label: 'N° Transaction' },
      { name: 'dateTransaction', label: 'Date' },
      { name: 'mandatRef', label: 'Réf. Mandat' },
      { name: 'typeTransaction', label: 'Type' },
      { name: 'bien', label: 'Bien', wrap: true },
      { name: 'prix', label: 'Prix' },
      { name: 'commissionTotale', label: 'Commission' }
    ]
  },
  gestion_locative: {
    title: 'Registre de Gestion Locative',
    icon: Home,
    endpoint: 'gestion',
    fields: [
      { name: 'numeroBien', label: 'Réf. Bien', required: true },
      { name: 'adresse', label: 'Adresse', type: 'textarea', fullWidth: true },
      { name: 'proprietaire', label: 'Propriétaire' },
      { name: 'locataire', label: 'Locataire' },
      { name: 'dateDebutBail', label: 'Début du bail', type: 'date' },
      { name: 'loyer', label: 'Loyer' },
      { name: 'statutLoyer', label: 'Statut du loyer' },
      { name: 'datePaiement', label: 'Date de paiement', type: 'date' },
      { name: 'observations', label: 'Observations', type: 'textarea', fullWidth: true }
    ],
    columns: [
      { name: 'numeroBien', label: 'Réf. Bien' },
      { name: 'locataire', label: 'Locataire' },
      { name: 'proprietaire', label: 'Propriétaire' },
      { name: 'dateDebutBail', label: 'Début bail' },
      { name: 'loyer', label: 'Loyer' },
      { name: 'statutLoyer', label: 'Statut du loyer' }
    ]
  },
  recherche: {
    title: 'Registre de Recherche Clients',
    icon: Search,
    endpoint: 'recherche',
    fields: [
      { name: 'numeroDemande', label: 'N° Demande', required: true },
      { name: 'dateDemande', label: 'Date', type: 'date' },
      { name: 'client', label: 'Client' },
      { name: 'typeBien', label: 'Type de bien' },
      { name: 'budget', label: 'Budget' },
      { name: 'criteres', label: 'Critères', type: 'textarea', fullWidth: true },
      { name: 'biensProposes', label: 'Biens proposés', type: 'textarea', fullWidth: true },
      { name: 'statutDemande', label: 'Statut' }
    ],
    columns: [
      { name: 'numeroDemande', label: 'N° Demande' },
      { name: 'dateDemande', label: 'Date' },
      { name: 'client', label: 'Client' },
      { name: 'typeBien', label: 'Type de bien' },
      { name: 'budget', label: 'Budget' },
      { name: 'statutDemande', label: 'Statut' }
    ]
  }
};

const navItems = [
  { id: 'mandats', label: 'Mandats', icon: Briefcase },
  { id: 'suivi', label: 'Suivi', icon: TrendingUp },
  { id: 'transactions', label: 'Transactions', icon: FileText },
  { id: 'gestion_locative', label: 'Gestion locative', icon: Home },
  { id: 'recherche', label: 'Recherche clients', icon: Search },
  { id: 'admin', label: 'Admin (utilisateurs)', icon: Users }
];

const STATUS_STYLES = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800'
};

const LoadingState = ({ message }) => (
  <div className="flex items-center justify-center py-12 text-gray-600">
    <Loader className="w-6 h-6 mr-3 animate-spin text-green-600" />
    <span className="text-base font-medium">{message}</span>
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center p-6 text-center bg-red-50 border border-red-200 rounded-lg text-red-700">
    <AlertTriangle className="w-8 h-8 mb-3" />
    <p className="font-semibold">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-3 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition"
      >
        Réessayer
      </button>
    )}
  </div>
);

const StatusBanner = ({ status, onClose }) => {
  if (!status) {
    return null;
  }
  const style = STATUS_STYLES[status.type] || STATUS_STYLES.info;
  return (
    <div className={`flex items-start justify-between px-4 py-3 border rounded-lg ${style}`}>
      <span className="font-medium">{status.message}</span>
      <button onClick={onClose} className="ml-4 text-sm font-semibold hover:underline">
        Fermer
      </button>
    </div>
  );
};

const LoginView = ({ onSubmit, isLoading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 font-bold text-xl">
            SL
          </div>
          <h1 className="text-2xl font-bold text-gray-900">SCI LemMarket</h1>
          <p className="text-sm text-gray-500">Accédez à vos registres sécurisés</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold py-2 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading && <Loader className="w-5 h-5 mr-2 animate-spin" />}
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        {error && <p className="text-sm text-center text-red-600">{error}</p>}
      </div>
    </div>
  );
};

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return entities[char] || char;
  });
}

function formatPrintValue(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return escapeHtml(String(value)).replace(/\n/g, '<br />');
}

function openPrintWindow(title, contentHtml) {
  const printWindow = window.open('', '_blank', 'noopener,noreferrer');
  if (!printWindow) {
    return;
  }
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
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

function printRegister(definition, items) {
  const headers = definition.fields.map((field) => `<th>${escapeHtml(field.label || field.name)}</th>`).join('');
  const rows = items.length
    ? items
        .map((item) => {
          const cells = definition.fields
            .map((field) => `<td>${formatPrintValue(item[field.name])}</td>`)
            .join('');
          return `<tr>${cells}</tr>`;
        })
        .join('')
    : `<tr><td colspan="${definition.fields.length}">Aucune donnée à imprimer.</td></tr>`;

  const content = `
    <h1>${escapeHtml(definition.title)}</h1>
    <table>
      <thead><tr>${headers}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
  openPrintWindow(definition.title, content);
}

function printRecord(definition, item) {
  const rows = definition.fields
    .map((field) => {
      const label = field.label || field.name;
      return `<tr><th>${escapeHtml(label)}</th><td>${formatPrintValue(item[field.name])}</td></tr>`;
    })
    .join('');

  const content = `
    <h1>${escapeHtml(definition.title)}</h1>
    <table><tbody>${rows}</tbody></table>
  `;
  openPrintWindow(`${definition.title} - ${item[definition.fields[0].name] || ''}`, content);
}

const RegisterView = ({ definition, onStatus, onUnauthorized }) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filter, setFilter] = useState('');

  const initialFormValues = useMemo(() => {
    const base = {};
    definition.fields.forEach((field) => {
      base[field.name] = '';
    });
    return base;
  }, [definition.fields]);

  const [formData, setFormData] = useState(initialFormValues);

  useEffect(() => {
    setFormData(initialFormValues);
  }, [initialFormValues]);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.fetchData(definition.endpoint);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.status === 401) {
        onUnauthorized();
        return;
      }
      setError(err.message || "Impossible de charger les données");
    } finally {
      setIsLoading(false);
    }
  }, [definition.endpoint, onUnauthorized]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.postData(definition.endpoint, formData);
      setFormData(initialFormValues);
      setIsFormOpen(false);
      onStatus({ type: 'success', message: 'Entrée enregistrée avec succès.' });
      fetchItems();
    } catch (err) {
      if (err.status === 401) {
        onUnauthorized();
        return;
      }
      onStatus({ type: 'error', message: err.message || "Impossible d'enregistrer l'entrée." });
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Confirmer la suppression de cette entrée ?')) {
      return;
    }
    try {
      await api.deleteData(definition.endpoint, itemId);
      onStatus({ type: 'success', message: 'Entrée supprimée avec succès.' });
      fetchItems();
    } catch (err) {
      if (err.status === 401) {
        onUnauthorized();
        return;
      }
      onStatus({ type: 'error', message: err.message || 'Suppression impossible.' });
    }
  };

  const filteredItems = useMemo(() => {
    const normalized = filter.trim().toLowerCase();
    const sortedItems = [...items].sort((a, b) => (b.id || 0) - (a.id || 0));
    if (!normalized) {
      return sortedItems;
    }
    return sortedItems.filter((item) =>
      Object.values(item).some((value) =>
        value && String(value).toLowerCase().includes(normalized)
      )
    );
  }, [items, filter]);

  const Icon = definition.icon;

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-4">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center">
          <Icon className="w-7 h-7 mr-3 text-green-600" />
          {definition.title}
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => printRegister(definition, filteredItems)}
            className="flex items-center px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg shadow-sm hover:bg-blue-50 transition"
          >
            <Printer className="w-5 h-5 mr-2" />
            Imprimer le registre
          </button>
          <button
            onClick={() => setIsFormOpen((prev) => !prev)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition"
          >
            <Plus className="w-5 h-5 mr-2" />
            {isFormOpen ? 'Fermer le formulaire' : 'Ajouter une fiche'}
          </button>
        </div>
      </header>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="p-6 bg-green-50 border border-green-200 rounded-xl shadow-inner">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {definition.fields.map((field) => {
              const commonProps = {
                id: field.name,
                name: field.name,
                value: formData[field.name] ?? '',
                onChange: handleInputChange,
                required: Boolean(field.required),
                className:
                  'w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500'
              };

              if (field.type === 'textarea') {
                return (
                  <div key={field.name} className={field.fullWidth ? 'md:col-span-2' : ''}>
                    <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    <textarea
                      {...commonProps}
                      rows={3}
                    />
                  </div>
                );
              }

              return (
                <div key={field.name} className={field.fullWidth ? 'md:col-span-2' : ''}>
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  <input
                    {...commonProps}
                    type={field.type || 'text'}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setFormData(initialFormValues);
                setIsFormOpen(false);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
            >
              Enregistrer
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        <input
          type="text"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder="Recherche rapide dans les fiches..."
          className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        {isLoading ? (
          <LoadingState message="Chargement des données en cours..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchItems} />
        ) : filteredItems.length === 0 ? (
          <div className="p-10 text-center text-gray-500 border border-dashed border-gray-300 rounded-xl bg-white">
            Aucune fiche enregistrée pour le moment.
          </div>
        ) : (
          <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {definition.columns.map((column) => (
                    <th
                      key={column.name}
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {column.label}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-green-50 transition">
                    {definition.columns.map((column) => (
                      <td
                        key={column.name}
                        className={`px-6 py-4 text-sm text-gray-700 ${column.wrap ? 'whitespace-normal break-words' : 'whitespace-nowrap'}`}
                      >
                        {item[column.name] || ''}
                      </td>
                    ))}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => printRecord(definition, item)}
                          className="inline-flex items-center px-3 py-1 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 transition"
                        >
                          <Printer className="w-4 h-4 mr-1" />
                          Fiche
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="inline-flex items-center px-3 py-1 text-sm text-red-600 bg-red-50 border border-red-200 rounded-full hover:bg-red-100 transition"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminView = ({ onStatus, onUnauthorized }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('agent');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createUser({ email, password, role });
      setEmail('');
      setPassword('');
      setRole('agent');
      onStatus({ type: 'success', message: "Nouvel utilisateur créé avec succès." });
    } catch (err) {
      if (err.status === 401) {
        onUnauthorized();
        return;
      }
      onStatus({ type: 'error', message: err.message || "Impossible de créer l'utilisateur." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="w-7 h-7 mr-3 text-green-600" />
            Gestion des utilisateurs
          </h2>
          <p className="text-sm text-gray-500">
            Créez de nouveaux comptes agents ou administrateurs pour votre équipe.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Rôle</label>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="agent">Agent</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Loader className="w-4 h-4 mr-2 animate-spin" />}
              {isSubmitting ? 'Création...' : "Créer l'utilisateur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [currentView, setCurrentView] = useState('mandats');

  useEffect(() => {
    const rehydrate = async () => {
      if (!api.token) {
        setIsAuthReady(true);
        return;
      }
      try {
        const { user } = await api.me();
        setCurrentUser(user);
        setCurrentView('mandats');
      } catch (error) {
        api.setAuthToken(null);
      } finally {
        setIsAuthReady(true);
      }
    };
    rehydrate();
  }, []);

  useEffect(() => {
    if (!status) {
      return;
    }
    const timer = window.setTimeout(() => setStatus(null), 5000);
    return () => window.clearTimeout(timer);
  }, [status]);

  const finalizeLogout = useCallback(() => {
    setCurrentUser(null);
    setCurrentView('mandats');
    api.setAuthToken(null);
  }, []);

  const handleUnauthorized = useCallback(() => {
    finalizeLogout();
    setStatus({ type: 'error', message: 'Votre session a expiré. Veuillez vous reconnecter.' });
  }, [finalizeLogout]);

  const handleLogin = async (email, password) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { user } = await api.login(email, password);
      setCurrentUser(user);
      setCurrentView('mandats');
      setStatus({ type: 'success', message: 'Connexion réussie.' });
    } catch (error) {
      setAuthError(error.message || 'Connexion impossible. Vérifiez vos identifiants.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (error) {
      if (error.status && error.status !== 401) {
        setStatus({ type: 'error', message: error.message || 'Impossible de se déconnecter.' });
        return;
      }
    }
    finalizeLogout();
  };

  const closeStatus = () => setStatus(null);

  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <LoadingState message="Initialisation de l'application..." />
      </div>
    );
  }

  if (!currentUser) {
    return <LoginView onSubmit={handleLogin} isLoading={authLoading} error={authError} />;
  }

  const availableNavItems = currentUser.role === 'admin'
    ? navItems
    : navItems.filter((item) => item.id !== 'admin');

  const activeDefinition = registerDefinitions[currentView];

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-green-700 text-white flex flex-col p-5 shadow-xl">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight">SCI <span className="text-green-200">LemMarket</span></h1>
          <p className="text-sm text-green-200/80 mt-1">Tableau de bord des registres</p>
        </div>
        <nav className="flex-1 space-y-2">
          {availableNavItems.map((item) => {
            const isActive = currentView === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center px-3 py-2 rounded-lg transition ${
                  isActive ? 'bg-green-100 text-green-900 shadow-lg' : 'text-green-100 hover:bg-green-600 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="pt-4 border-t border-green-600/60">
          <p className="text-xs text-green-200/80 mb-2 break-words">
            Connecté : {currentUser.email}
          </p>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-3 py-2 rounded-lg bg-green-800 text-red-200 hover:bg-red-600 hover:text-white transition"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Déconnexion
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {status && <StatusBanner status={status} onClose={closeStatus} />}
          {currentView === 'admin' ? (
            <AdminView onStatus={setStatus} onUnauthorized={handleUnauthorized} />
          ) : activeDefinition ? (
            <RegisterView
              definition={activeDefinition}
              onStatus={setStatus}
              onUnauthorized={handleUnauthorized}
            />
          ) : (
            <div className="p-10 text-center text-gray-500 border border-dashed border-gray-300 rounded-xl bg-white">
              Sélectionnez un registre pour commencer.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
