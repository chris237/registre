import logging
import os
import secrets
from datetime import datetime
from functools import wraps

from flask import Flask, request, jsonify, g
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from logging.handlers import RotatingFileHandler
from sqlalchemy import text
from sqlalchemy.inspection import inspect
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)


def _parse_origins(raw_origins: str) -> set[str]:
    return {origin.strip() for origin in raw_origins.split(',') if origin.strip()}


_default_origins = {
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
}

ALLOWED_ORIGINS = _parse_origins(os.getenv("ALLOWED_ORIGINS", "")) or _default_origins

CORS(
    app,
    resources={r"/api/*": {"origins": list(ALLOWED_ORIGINS)}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
)

os.makedirs("logs", exist_ok=True)
log_handler = RotatingFileHandler("logs/app.log", maxBytes=1024 * 1024, backupCount=5)
log_handler.setFormatter(logging.Formatter("%(asctime)s - %(levelname)s - %(message)s"))
log_handler.setLevel(logging.INFO)
app.logger.addHandler(log_handler)
app.logger.setLevel(logging.INFO)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db = SQLAlchemy(app)

# ---- MODELS ----
class AuthToken(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    token = db.Column(db.String(64), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), default='agent', nullable=False)
    tokens = db.relationship('AuthToken', backref='user', cascade='all, delete-orphan')


class Mandat(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    referenceMandat = db.Column('numero', db.String(50), nullable=False, unique=True)
    dateDebut = db.Column('dateSignature', db.String(50))
    dateEcheance = db.Column(db.String(50))
    typeMandat = db.Column(db.String(50))
    typeTransaction = db.Column(db.String(50))
    statutMandat = db.Column(db.String(50))
    typeBien = db.Column(db.String(100))
    adresseBien = db.Column('adresse', db.Text)
    surfaceM2 = db.Column(db.String(50))
    nbPieces = db.Column(db.String(50))
    dpeClassement = db.Column(db.String(10))
    prixDemande = db.Column('prixSouhaite', db.String(50))
    honorairePourcent = db.Column('commission', db.String(50))
    tvaApplicable = db.Column(db.String(20))
    proprietaireNom = db.Column('proprietaire', db.String(120))
    proprietaireCoordonnees = db.Column(db.Text)
    clientVendeurInfos = db.Column(db.Text)
    clientAcheteurInfos = db.Column('acquereur', db.Text)
    agentResponsable = db.Column(db.String(120))
    notesMandat = db.Column('caracteristiques', db.Text)
    descriptionBien = db.Column(db.Text)

    transactions = db.relationship(
        'Transaction',
        back_populates='mandat',
        cascade='all, delete-orphan',
        passive_deletes=True,
        single_parent=True,
    )
    suivis = db.relationship(
        'Suivi',
        back_populates='mandat',
        cascade='all, delete-orphan',
        passive_deletes=True,
        single_parent=True,
    )
    gestions_locatives = db.relationship(
        'GestionLocative',
        back_populates='mandat',
        cascade='all, delete-orphan',
        passive_deletes=True,
        single_parent=True,
    )


class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    numeroTransaction = db.Column(db.String(50), nullable=False)
    dateSignature = db.Column('dateTransaction', db.String(50))
    referenceMandat = db.Column(
        'mandatRef',
        db.String(50),
        db.ForeignKey('mandat.numero', ondelete='CASCADE'),
        nullable=False,
    )
    typeTransaction = db.Column(db.String(50))
    clientVendeur = db.Column(db.String(120))
    acquereurLocataire = db.Column('client', db.String(120))
    notaire = db.Column(db.String(120))
    prixFinal = db.Column('prix', db.String(50))
    commissionHT = db.Column('commissionTotale', db.String(50))
    montantTVA = db.Column(db.String(50))
    conditionsSusp = db.Column(db.String(20))
    statutReglement = db.Column(db.String(50))
    notesTransaction = db.Column('observations', db.Text)

    mandat = db.relationship('Mandat', back_populates='transactions')


class Suivi(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    referenceMandat = db.Column(
        'numeroMandat',
        db.String(50),
        db.ForeignKey('mandat.numero', ondelete='CASCADE'),
        nullable=False,
    )
    dateAction = db.Column('dateSuivi', db.String(50))
    typeAction = db.Column('action', db.String(100))
    contactClient = db.Column('contact', db.String(120))
    intensiteAction = db.Column(db.String(20))
    details = db.Column('resultat', db.Text)
    prochaineEtape = db.Column(db.String(200))
    dateProchaineAction = db.Column('datePrevue', db.String(50))
    agent = db.Column(db.String(120))

    mandat = db.relationship('Mandat', back_populates='suivis')


class Recherche(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    numeroDemande = db.Column(db.String(50), nullable=False)
    dateDemande = db.Column(db.String(50))
    clientNom = db.Column('client', db.String(120))
    telephone = db.Column(db.String(50))
    typeRecherche = db.Column(db.String(120))
    budgetMin = db.Column(db.String(50))
    budgetMax = db.Column(db.String(50))
    secteurGeographique = db.Column(db.Text)
    delaiSouhaite = db.Column(db.String(50))
    motivations = db.Column(db.Text)
    criteresSpecifiques = db.Column('criteres', db.Text)
    biensProposes = db.Column(db.Text)
    statutDemande = db.Column(db.String(100))
    agentSuivi = db.Column(db.String(120))


class GestionLocative(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    referenceMandat = db.Column(
        db.String(50),
        db.ForeignKey('mandat.numero', ondelete='CASCADE'),
        nullable=False,
    )
    numeroBien = db.Column(db.String(50), nullable=False)
    adresseBien = db.Column('adresse', db.Text)
    proprietaireNom = db.Column('proprietaire', db.String(120))
    proprietaireCoordonnees = db.Column(db.Text)
    locataireNom = db.Column('locataire', db.String(120))
    locataireCoordonnees = db.Column(db.Text)
    debutBail = db.Column('dateDebutBail', db.String(50))
    finBail = db.Column(db.String(50))
    montantLoyerBase = db.Column('loyer', db.String(50))
    montantCharges = db.Column(db.String(50))
    depotGarantie = db.Column(db.String(50))
    irl = db.Column(db.String(50))
    dateProchaineIndexation = db.Column(db.String(50))
    etatPaiement = db.Column('statutLoyer', db.String(100))
    datePaiement = db.Column(db.String(50))
    notesIncident = db.Column('observations', db.Text)

    mandat = db.relationship('Mandat', back_populates='gestions_locatives')

# ---- HELPERS ----
def ensure_default_admin():
    if not User.query.filter_by(email='admin@example.com').first():
        admin = User(
            email='admin@example.com',
            password_hash=generate_password_hash('admin123'),
            role='admin'
        )
        db.session.add(admin)
        db.session.commit()


def ensure_schema():
    schema_spec = {
        'mandat': [
            ('dateSignature', 'VARCHAR(50)'),
            ('statutMandat', 'VARCHAR(50)'),
            ('typeTransaction', 'VARCHAR(50)'),
            ('typeBien', 'VARCHAR(100)'),
            ('adresse', 'TEXT'),
            ('surfaceM2', 'VARCHAR(50)'),
            ('nbPieces', 'VARCHAR(50)'),
            ('dpeClassement', 'VARCHAR(10)'),
            ('prixSouhaite', 'VARCHAR(50)'),
            ('commission', 'VARCHAR(50)'),
            ('tvaApplicable', 'VARCHAR(20)'),
            ('proprietaire', 'VARCHAR(120)'),
            ('proprietaireCoordonnees', 'TEXT'),
            ('clientVendeurInfos', 'TEXT'),
            ('acquereur', 'TEXT'),
            ('caracteristiques', 'TEXT'),
            ('descriptionBien', 'TEXT'),
            ('dateFinalisation', 'VARCHAR(50)'),
            ('validite', 'VARCHAR(50)'),
            ('dateEcheance', 'VARCHAR(50)'),
            ('agentResponsable', 'VARCHAR(120)')
        ],
        'transaction': [
            ('numeroTransaction', 'VARCHAR(50)'),
            ('dateTransaction', 'VARCHAR(50)'),
            ('mandatRef', 'VARCHAR(50)'),
            ('typeTransaction', 'VARCHAR(50)'),
            ('clientVendeur', 'VARCHAR(120)'),
            ('prix', 'VARCHAR(50)'),
            ('commissionTotale', 'VARCHAR(50)'),
            ('client', 'VARCHAR(120)'),
            ('notaire', 'VARCHAR(120)'),
            ('montantTVA', 'VARCHAR(50)'),
            ('conditionsSusp', 'VARCHAR(20)'),
            ('statutReglement', 'VARCHAR(50)'),
            ('observations', 'TEXT')
        ],
        'suivi': [
            ('numeroMandat', 'VARCHAR(50)'),
            ('dateSuivi', 'VARCHAR(50)'),
            ('action', 'VARCHAR(100)'),
            ('contact', 'VARCHAR(120)'),
            ('intensiteAction', 'VARCHAR(20)'),
            ('resultat', 'TEXT'),
            ('prochaineEtape', 'VARCHAR(200)'),
            ('datePrevue', 'VARCHAR(50)'),
            ('agent', 'VARCHAR(120)')
        ],
        'recherche': [
            ('numeroDemande', 'VARCHAR(50)'),
            ('dateDemande', 'VARCHAR(50)'),
            ('client', 'VARCHAR(120)'),
            ('telephone', 'VARCHAR(50)'),
            ('typeRecherche', 'VARCHAR(120)'),
            ('budgetMin', 'VARCHAR(50)'),
            ('budget', 'VARCHAR(50)'),
            ('budgetMax', 'VARCHAR(50)'),
            ('secteurGeographique', 'TEXT'),
            ('delaiSouhaite', 'VARCHAR(50)'),
            ('motivations', 'TEXT'),
            ('criteres', 'TEXT'),
            ('biensProposes', 'TEXT'),
            ('statutDemande', 'VARCHAR(100)'),
            ('agentSuivi', 'VARCHAR(120)')
        ],
        'gestion_locative': [
            ('referenceMandat', 'VARCHAR(50)'),
            ('adresse', 'TEXT'),
            ('proprietaire', 'VARCHAR(120)'),
            ('proprietaireCoordonnees', 'TEXT'),
            ('locataire', 'VARCHAR(120)'),
            ('locataireCoordonnees', 'TEXT'),
            ('dateDebutBail', 'VARCHAR(50)'),
            ('finBail', 'VARCHAR(50)'),
            ('loyer', 'VARCHAR(50)'),
            ('montantCharges', 'VARCHAR(50)'),
            ('depotGarantie', 'VARCHAR(50)'),
            ('irl', 'VARCHAR(50)'),
            ('dateProchaineIndexation', 'VARCHAR(50)'),
            ('statutLoyer', 'VARCHAR(100)'),
            ('datePaiement', 'VARCHAR(50)'),
            ('observations', 'TEXT')
        ]
    }

    connection = db.session.connection()

    for table, columns in schema_spec.items():
        existing_columns = {
            row[1]
            for row in connection.execute(text(f'PRAGMA table_info("{table}")'))
        }

        for column_name, column_type in columns:
            if column_name not in existing_columns:
                connection.execute(
                    text(
                        f'ALTER TABLE "{table}" '
                        f'ADD COLUMN "{column_name}" {column_type}'
                    )
                )

    db.session.commit()


def to_dict(obj):
    mapper = inspect(obj.__class__)
    return {attr.key: getattr(obj, attr.key) for attr in mapper.column_attrs}


def error_response(message, status):
    return jsonify({'error': message}), status


@app.route('/api/<path:_unused>', methods=['OPTIONS'])
def handle_api_options(_unused):
    response = app.make_default_options_response()
    return response


@app.after_request
def add_cors_headers(response):
    origin = request.headers.get("Origin")
    if origin in ALLOWED_ORIGINS:
        response.headers["Access-Control-Allow-Origin"] = origin
    else:
        response.headers.setdefault("Access-Control-Allow-Origin", "*")
    response.headers.add("Vary", "Origin")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    response.headers.add(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With",
    )
    response.headers.add(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    )
    return response


def get_bearer_token():
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        return auth_header.split(' ', 1)[1].strip()
    return None


def login_required(view_func):
    @wraps(view_func)
    def wrapped(*args, **kwargs):
        token_value = get_bearer_token()
        if not token_value:
            return error_response('Authentication required', 401)

        token = AuthToken.query.filter_by(token=token_value).first()
        if not token:
            return error_response('Invalid or expired token', 401)

        g.current_user = token.user
        g.auth_token = token
        return view_func(*args, **kwargs)

    return wrapped


def register_crud(model, endpoint):
    # GET
    def list_items():
        items = model.query.all()
        return jsonify([to_dict(i) for i in items])
    app.add_url_rule(
        f"/api/{endpoint}",
        f"list_{endpoint}",
        login_required(list_items),
        methods=["GET"]
    )

    # POST
    def create_item():
        data = request.json
        item = model(**data)
        db.session.add(item)
        db.session.commit()
        return jsonify({"id": item.id}), 201
    app.add_url_rule(
        f"/api/{endpoint}",
        f"create_{endpoint}",
        login_required(create_item),
        methods=["POST"]
    )

    # DELETE
    def delete_item(item_id):
        item = model.query.get(item_id)
        if not item:
            return jsonify({"error": "Not found"}), 404
        db.session.delete(item)
        db.session.commit()
        return '', 204
    app.add_url_rule(
        f"/api/{endpoint}/<int:item_id>",
        f"delete_{endpoint}",
        login_required(delete_item),
        methods=["DELETE"]
    )

# Register all CRUD
register_crud(Mandat, "mandats")
register_crud(Transaction, "transactions")
register_crud(Suivi, "suivi")
register_crud(Recherche, "recherche")
register_crud(GestionLocative, "gestion")

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        app.logger.warning("Login attempt rejected due to missing credentials")
        return error_response('Email and password are required', 400)

    email = email.strip().lower()

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        app.logger.warning("Failed login attempt for %s", email)
        return error_response('Invalid credentials', 401)

    AuthToken.query.filter_by(user_id=user.id).delete()
    token_value = secrets.token_hex(32)
    token = AuthToken(token=token_value, user=user)
    db.session.add(token)
    db.session.commit()

    app.logger.info("User %s authenticated successfully", email)

    return jsonify({
        'token': token_value,
        'user': {
            'id': user.id,
            'email': user.email,
            'role': user.role
        }
    })


@app.route('/api/auth/me', methods=['GET'])
@login_required
def me():
    user = g.current_user
    return jsonify({
        'user': {
            'id': user.id,
            'email': user.email,
            'role': user.role
        }
    })


@app.route('/api/auth/logout', methods=['POST'])
@login_required
def logout():
    db.session.delete(g.auth_token)
    db.session.commit()
    app.logger.info("User %s logged out", g.current_user.email)
    return '', 204


@app.route('/api/users', methods=['GET'])
@login_required
def list_users():
    if g.current_user.role != 'admin':
        return error_response('Admin privileges required', 403)

    users = (
        User.query
        .order_by(User.email.asc())
        .all()
    )

    return jsonify([
        {
            'id': user.id,
            'email': user.email,
            'role': user.role,
        }
        for user in users
    ])


@app.route('/api/users', methods=['POST'])
@login_required
def create_user():
    if g.current_user.role != 'admin':
        return error_response('Admin privileges required', 403)

    data = request.json or {}
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'agent')

    if not email or not password:
        return error_response('Email and password are required', 400)

    email = email.lower().strip()
    if User.query.filter_by(email=email).first():
        return error_response('Email already registered', 409)

    if role not in {'agent', 'admin'}:
        return error_response('Invalid role', 400)

    user = User(
        email=email,
        password_hash=generate_password_hash(password),
        role=role
    )
    db.session.add(user)
    db.session.commit()

    app.logger.info(
        "Admin %s created a new user %s with role %s",
        g.current_user.email,
        user.email,
        user.role,
    )

    return jsonify({
        'id': user.id,
        'email': user.email,
        'role': user.role
    }), 201


if __name__ == '__main__':
    with app.app_context():   # ✅ corrige l'erreur "outside of application context"
        db.create_all()
        ensure_schema()
        ensure_default_admin()
    app.run(host="0.0.0.0", port=5000, debug=True)


with app.app_context():
    db.create_all()
    ensure_schema()
    ensure_default_admin()
