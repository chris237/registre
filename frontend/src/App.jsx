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
  RefreshCw,
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
      { name: 'referenceMandat', label: 'Référence mandat', required: true, placeholder: 'Ex. M-2024-001' },
      {
        name: 'typeMandat',
        label: 'Type de mandat',
        type: 'select',
        placeholder: 'Sélectionnez un type',
        options: ['Vente Simple', 'Vente Exclusif', 'Location Simple', 'Location Exclusif', 'Autre']
      },
      {
        name: 'typeTransaction',
        label: 'Type de transaction',
        type: 'select',
        placeholder: 'Sélectionnez une transaction',
        options: ['Vente', 'Achat', 'Location', 'Gestion', 'Autre']
      },
      {
        name: 'typeBien',
        label: 'Type de bien',
        type: 'select',
        placeholder: 'Sélectionnez un type de bien',
        options: ['Maison', 'Appartement', 'Terrain', 'Bureau', 'Local commercial', 'Autre']
      },
      {
        name: 'adresseBien',
        label: 'Adresse complète du bien',
        type: 'textarea',
        fullWidth: true,
        placeholder: 'Adresse postale complète et précisions d’accès'
      },
      { name: 'surfaceM2', label: 'Surface (m²)', type: 'number', placeholder: 'Ex. 125' },
      { name: 'nbPieces', label: 'Nombre de pièces', type: 'number', placeholder: 'Ex. 5' },
      {
        name: 'dpeClassement',
        label: 'Classement DPE',
        type: 'select',
        options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'Non renseigné']
      },
      { name: 'prixDemande', label: 'Prix demandé (FCFA)', type: 'number', placeholder: 'Ex. 150000000' },
      { name: 'honorairePourcent', label: 'Honoraires agence (%)', type: 'number', placeholder: 'Ex. 5' },
      { name: 'tvaApplicable', label: 'TVA applicable (%)', type: 'number', placeholder: 'Ex. 18' },
      { name: 'proprietaireNom', label: 'Propriétaire / vendeur', required: true, placeholder: 'Nom et prénom du propriétaire' },
      {
        name: 'proprietaireCoordonnees',
        label: 'Coordonnées propriétaire / vendeur',
        type: 'textarea',
        fullWidth: true,
        placeholder: 'Téléphone, email, adresse postale...'
      },
      {
        name: 'clientVendeurInfos',
        label: 'Contacts complémentaires vendeur',
        type: 'textarea',
        fullWidth: true,
        placeholder: 'Mandataire, co-indivisaire, représentant légal...'
      },
      {
        name: 'clientAcheteurInfos',
        label: 'Client acquéreur / locataire (coordonnées)',
        type: 'textarea',
        fullWidth: true,
        placeholder: 'Nom, téléphone, email des prospects intéressés'
      },
      { name: 'dateDebut', label: 'Date de début de mandat', type: 'date' },
      { name: 'dateEcheance', label: "Date d'échéance", type: 'date' },
      { name: 'agentResponsable', label: 'Agent responsable', placeholder: 'Nom de l’agent en charge' },
      {
        name: 'descriptionBien',
        label: 'Description du bien',
        type: 'textarea',
        fullWidth: true,
        placeholder: 'Résumé des atouts du bien, environnement, travaux réalisés...'
      },
      {
        name: 'notesMandat',
        label: 'Notes internes / suivi mandat',
        type: 'textarea',
        fullWidth: true,
        placeholder: 'Clauses spécifiques, points de vigilance, instructions propriétaires...'
      }
    ],
    columns: [
      { name: 'referenceMandat', label: 'Référence mandat' },
      { name: 'typeMandat', label: 'Type' },
      { name: 'typeBien', label: 'Bien' },
      { name: 'proprietaireNom', label: 'Propriétaire / vendeur', wrap: true },
      { name: 'agentResponsable', label: 'Agent' },
      { name: 'prixDemande', label: 'Prix demandé (FCFA)' },
      { name: 'dateEcheance', label: 'Échéance' }
    ]
  },
  suivi: {
    title: 'Registre de Suivi des Mandats',
    icon: TrendingUp,
    endpoint: 'suivi',
    fields: [
      { name: 'referenceMandat', label: 'Référence mandat', required: true, placeholder: 'Mandat concerné' },
      { name: 'dateAction', label: "Date de l'action", type: 'date' },
      {
        name: 'typeAction',
        label: 'Action réalisée',
        type: 'select',
        placeholder: 'Sélectionnez une action',
        options: ['Visite', 'Appel téléphonique', 'Email', 'Offre reçue', 'Relance propriétaire', 'Campagne marketing', 'Autre']
      },
      {
        name: 'intensiteAction',
        label: "Intensité de l'action",
        type: 'select',
        options: ['Faible', 'Moyenne', 'Forte']
      },
      { name: 'contactClient', label: 'Contact client', placeholder: 'Nom du contact impliqué' },
      {
        name: 'details',
        label: 'Détails / commentaires',
        type: 'textarea',
        fullWidth: true,
        placeholder: 'Résultat de la relance, feedback client, points à retenir...'
      },
      { name: 'agent', label: 'Agent enregistreur', placeholder: 'Agent ayant réalisé l’action' },
      {
        name: 'prochaineEtape',
        label: 'Prochaine étape planifiée',
        type: 'textarea',
        fullWidth: true,
        placeholder: 'Action à prévoir et objectifs associés'
      },
      { name: 'dateProchaineAction', label: 'Date prochaine action', type: 'date' }
    ],
    columns: [
      { name: 'referenceMandat', label: 'Référence mandat' },
      { name: 'dateAction', label: 'Date' },
      { name: 'typeAction', label: 'Action' },
      { name: 'intensiteAction', label: 'Intensité' },
      { name: 'contactClient', label: 'Contact client' },
      { name: 'agent', label: 'Agent' }
    ]
  },
  transactions: {
    title: 'Registre des Transactions',
    icon: FileText,
    endpoint: 'transactions',
    fields: [
      { name: 'numeroTransaction', label: 'N° Transaction', required: true, placeholder: 'Ex. T-2024-001' },
      { name: 'referenceMandat', label: 'Référence mandat', required: true, placeholder: 'Mandat lié' },
      {
        name: 'typeTransaction',
        label: 'Type de transaction',
        type: 'select',
        placeholder: 'Sélectionnez un type',
        options: ['Vente définitive', 'Location signée', 'Compromis', 'Promesse', 'Autre']
      },
      { name: 'dateSignature', label: 'Date de signature / compromis', type: 'date' },
      { name: 'clientVendeur', label: 'Client vendeur / bailleur', placeholder: 'Nom complet du vendeur' },
      { name: 'acquereurLocataire', label: 'Acquéreur / locataire', required: true, placeholder: 'Nom complet de la contrepartie' },
      { name: 'notaire', label: 'Notaire (si vente)', placeholder: 'Étude notariale en charge' },
      { name: 'prixFinal', label: 'Prix final ou loyer (FCFA)', type: 'number', placeholder: 'Montant conclu' },
      { name: 'commissionHT', label: 'Commission agence HT (FCFA)', type: 'number', placeholder: 'Montant HT' },
      { name: 'montantTVA', label: 'Montant TVA (FCFA)', type: 'number', placeholder: 'Montant de TVA' },
      {
        name: 'conditionsSusp',
        label: 'Conditions suspensives',
        type: 'select',
        options: ['Oui', 'Non']
      },
      {
        name: 'statutReglement',
        label: 'Statut règlement commission',
        type: 'select',
        options: ['En attente', 'Partiellement réglée', 'Réglée']
      },
      {
        name: 'notesTransaction',
        label: 'Notes sur la transaction',
        type: 'textarea',
        fullWidth: true,
        placeholder: 'Conditions particulières, échéancier de paiement, observations diverses'
      }
    ],
    columns: [
      { name: 'numeroTransaction', label: 'N° Transaction' },
      { name: 'referenceMandat', label: 'Référence mandat' },
      { name: 'typeTransaction', label: 'Type' },
      { name: 'clientVendeur', label: 'Vendeur / bailleur', wrap: true },
      { name: 'acquereurLocataire', label: 'Acquéreur / locataire', wrap: true },
      { name: 'prixFinal', label: 'Prix final (FCFA)' },
      { name: 'statutReglement', label: 'Règlement commission' }
    ]
  },
  gestion_locative: {
    title: 'Registre de Gestion Locative',
    icon: Home,
    endpoint: 'gestion',
    fields: [
      { name: 'referenceMandat', label: 'Référence mandat', placeholder: 'Mandat de gestion lié' },
      { name: 'numeroBien', label: 'Référence bien', required: true, placeholder: 'Ex. B-2024-001' },
      {
        name: 'adresseBien',
        label: 'Adresse complète du bien',
        type: 'textarea',
        fullWidth: true,
        placeholder: 'Adresse, étage, accès, particularités...'
      },
      { name: 'proprietaireNom', label: 'Propriétaire / bailleur', required: true },
      {
        name: 'proprietaireCoordonnees',
        label: 'Coordonnées propriétaire',
        type: 'textarea',
        fullWidth: true,
        placeholder: 'Téléphone, email, adresse de correspondance'
      },
      { name: 'locataireNom', label: 'Locataire', required: true },
      {
        name: 'locataireCoordonnees',
        label: 'Coordonnées locataire',
        type: 'textarea',
        fullWidth: true,
        placeholder: 'Téléphone, email, adresse de facturation'
      },
      { name: 'debutBail', label: 'Début du bail', type: 'date' },
      { name: 'finBail', label: 'Fin du bail', type: 'date' },
      { name: 'montantLoyerBase', label: 'Loyer hors charges (FCFA)', type: 'number' },
      { name: 'montantCharges', label: 'Charges mensuelles (FCFA)', type: 'number' },
      { name: 'depotGarantie', label: 'Dépôt de garantie (FCFA)', type: 'number' },
      { name: 'irl', label: 'Indice IRL appliqué', placeholder: 'Indice de référence des loyers' },
      { name: 'dateProchaineIndexation', label: 'Prochaine indexation', type: 'date' },
      {
        name: 'etatPaiement',
        label: 'Statut paiement',
        type: 'select',
        options: ['À jour', 'En retard', 'Impayé']
      },
      { name: 'datePaiement', label: 'Date dernier paiement', type: 'date' },
      {
        name: 'notesIncident',
        label: 'Incidents / travaux',
        type: 'textarea',
        fullWidth: true,
        placeholder: 'Retards, réparations, communications avec le locataire...'
      }
    ],
    columns: [
      { name: 'numeroBien', label: 'Référence bien' },
      { name: 'referenceMandat', label: 'Mandat lié' },
      { name: 'locataireNom', label: 'Locataire' },
      { name: 'proprietaireNom', label: 'Propriétaire', wrap: true },
      { name: 'montantLoyerBase', label: 'Loyer HC (FCFA)' },
      { name: 'etatPaiement', label: 'Statut paiement' }
    ]
  },
  recherche: {
    title: 'Registre de Recherche Clients',
    icon: Search,
    endpoint: 'recherche',
    fields: [
      { name: 'numeroDemande', label: 'N° Demande', required: true, placeholder: 'Ex. D-2024-001' },
      { name: 'dateDemande', label: 'Date de la demande', type: 'date' },
      { name: 'clientNom', label: 'Nom complet du client', required: true },
      { name: 'telephone', label: 'Téléphone', required: true, placeholder: 'Ex. +225 00 00 00 00' },
      {
        name: 'typeRecherche',
        label: 'Type de recherche',
        type: 'select',
        placeholder: 'Sélectionnez un type',
        options: ['Achat résidence principale', 'Achat investissement', 'Location']
      },
      { name: 'budgetMin', label: 'Budget minimum (FCFA)', type: 'number' },
      { name: 'budgetMax', label: 'Budget maximum (FCFA)', type: 'number' },
      {
        name: 'secteurGeographique',
        label: 'Secteurs géographiques recherchés',
        type: 'textarea',
        fullWidth: true,
        placeholder: 'Quartiers, villes, zones prioritaires'
      },
      {
        name: 'delaiSouhaite',
        label: 'Délai souhaité',
        type: 'select',
        options: ['Immédiat (< 3 mois)', 'Moyen terme (3-6 mois)', 'Long terme (> 6 mois)']
      },
      {
        name: 'motivations',
        label: 'Motivations / urgence',
        type: 'textarea',
        fullWidth: true,
        placeholder: 'Projet de vie, investissement, mobilité professionnelle...'
      },
      {
        name: 'criteresSpecifiques',
        label: 'Critères spécifiques',
        type: 'textarea',
        fullWidth: true,
        placeholder: 'Surface minimale, nombre de pièces, prestations attendues...'
      },
      {
        name: 'biensProposes',
        label: 'Biens déjà proposés',
        type: 'textarea',
        fullWidth: true,
        placeholder: 'Historique des propositions envoyées au client'
      },
      {
        name: 'statutDemande',
        label: 'Statut de la demande',
        type: 'select',
        options: ['En attente', 'En recherche active', 'Proposition envoyée', 'Clôturée', 'Annulée']
      },
      { name: 'agentSuivi', label: 'Agent en charge', placeholder: 'Conseiller responsable du dossier' }
    ],
    columns: [
      { name: 'numeroDemande', label: 'N° Demande' },
      { name: 'clientNom', label: 'Client' },
      { name: 'telephone', label: 'Téléphone' },
      { name: 'typeRecherche', label: 'Type de recherche' },
      { name: 'budgetMax', label: 'Budget max (FCFA)' },
      { name: 'agentSuivi', label: 'Agent' }
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

  useEffect(() => {
    setIsFormOpen(false);
    setFilter('');
  }, [definition]);

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
            onClick={() =>
              setIsFormOpen((prev) => {
                const next = !prev;
                if (next) {
                  setFormData(initialFormValues);
                  setFilter('');
                }
                return next;
              })
            }
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition"
          >
            <Plus className="w-5 h-5 mr-2" />
            {isFormOpen ? 'Fermer le formulaire' : 'Ajouter une fiche'}
          </button>
        </div>
      </header>

      {isFormOpen ? (
        <form onSubmit={handleSubmit} className="p-6 bg-green-50 border border-green-200 rounded-xl shadow-inner">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {definition.fields.map((field) => {
              const wrapperClass = field.fullWidth ? 'md:col-span-2' : '';
              const fieldValue = formData[field.name] ?? '';
              const baseClass =
                'w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500';
              const commonProps = {
                id: field.name,
                name: field.name,
                value: fieldValue,
                onChange: handleInputChange,
                required: Boolean(field.required)
              };

              return (
                <div key={field.name} className={wrapperClass}>
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      {...commonProps}
                      rows={4}
                      placeholder={field.placeholder}
                      className={`${baseClass} resize-y`}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      {...commonProps}
                      className={`${baseClass} bg-white`}
                    >
                      <option value="" disabled={Boolean(field.required)}>
                        {field.placeholder || 'Sélectionnez une option'}
                      </option>
                      {(field.options || []).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      {...commonProps}
                      type={field.type || 'text'}
                      placeholder={field.placeholder}
                      className={baseClass}
                      autoComplete="off"
                    />
                  )}
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
      ) : (
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
      )}
    </div>
  );
};

const AdminView = ({ onStatus, onUnauthorized }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('agent');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState(null);

  const loadUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    setUsersError(null);
    try {
      const data = await api.listUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.status === 401) {
        onUnauthorized();
        return;
      }
      setUsersError(err.message || 'Impossible de charger les utilisateurs.');
    } finally {
      setIsLoadingUsers(false);
    }
  }, [onUnauthorized]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createUser({ email, password, role });
      setEmail('');
      setPassword('');
      setRole('agent');
      onStatus({ type: 'success', message: "Nouvel utilisateur créé avec succès." });
      loadUsers();
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
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Utilisateurs existants</h3>
            <p className="text-sm text-gray-500">Consultez les comptes actuellement actifs.</p>
          </div>
          <button
            onClick={loadUsers}
            disabled={isLoadingUsers}
            className="inline-flex items-center self-start rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoadingUsers ? (
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Rafraîchir
          </button>
        </div>
        {usersError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="flex items-center justify-between gap-3">
              <span>{usersError}</span>
              <button
                onClick={loadUsers}
                className="font-semibold text-red-700 underline-offset-2 hover:underline"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}
        {isLoadingUsers ? (
          <LoadingState message="Chargement des utilisateurs..." />
        ) : users.length ? (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Rôle
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {users.map((user) => (
                  <tr key={user.id} className="transition hover:bg-green-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{user.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Aucun utilisateur enregistré pour le moment.</p>
        )}
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
