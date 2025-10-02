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
    numero = db.Column(db.String(50), nullable=False)
    dateSignature = db.Column(db.String(50))
    typeMandat = db.Column(db.String(50))
    statutMandat = db.Column(db.String(50))
    typeTransaction = db.Column(db.String(50))
    proprietaire = db.Column(db.String(100))
    adresse = db.Column(db.Text)
    caracteristiques = db.Column(db.Text)
    prixSouhaite = db.Column(db.String(50))
    commission = db.Column(db.String(50))
    validite = db.Column(db.String(50))
    dateFinalisation = db.Column(db.String(50))
    acquereur = db.Column(db.String(100))


class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    numeroTransaction = db.Column(db.String(50), nullable=False)
    dateTransaction = db.Column(db.String(50))
    mandatRef = db.Column(db.String(50))
    typeTransaction = db.Column(db.String(50))
    bien = db.Column(db.String(200))
    prix = db.Column(db.String(50))
    commissionTotale = db.Column(db.String(50))
    client = db.Column(db.String(120))
    observations = db.Column(db.Text)


class Suivi(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    numeroMandat = db.Column(db.String(50), nullable=False)
    dateSuivi = db.Column(db.String(50))
    action = db.Column(db.String(100))
    contact = db.Column(db.String(120))
    resultat = db.Column(db.String(200))
    prochaineEtape = db.Column(db.String(200))
    datePrevue = db.Column(db.String(50))


class Recherche(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    numeroDemande = db.Column(db.String(50), nullable=False)
    dateDemande = db.Column(db.String(50))
    client = db.Column(db.String(120))
    typeBien = db.Column(db.String(120))
    budget = db.Column(db.String(50))
    criteres = db.Column(db.Text)
    biensProposes = db.Column(db.Text)
    statutDemande = db.Column(db.String(100))


class GestionLocative(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    numeroBien = db.Column(db.String(50), nullable=False)
    adresse = db.Column(db.Text)
    proprietaire = db.Column(db.String(120))
    locataire = db.Column(db.String(120))
    dateDebutBail = db.Column(db.String(50))
    loyer = db.Column(db.String(50))
    statutLoyer = db.Column(db.String(100))
    datePaiement = db.Column(db.String(50))
    observations = db.Column(db.Text)

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
            ('proprietaire', 'VARCHAR(100)'),
            ('adresse', 'TEXT'),
            ('caracteristiques', 'TEXT'),
            ('prixSouhaite', 'VARCHAR(50)'),
            ('commission', 'VARCHAR(50)'),
            ('validite', 'VARCHAR(50)'),
            ('dateFinalisation', 'VARCHAR(50)'),
            ('acquereur', 'VARCHAR(100)')
        ],
        'transaction': [
            ('numeroTransaction', 'VARCHAR(50)'),
            ('dateTransaction', 'VARCHAR(50)'),
            ('mandatRef', 'VARCHAR(50)'),
            ('typeTransaction', 'VARCHAR(50)'),
            ('prix', 'VARCHAR(50)'),
            ('commissionTotale', 'VARCHAR(50)'),
            ('client', 'VARCHAR(120)'),
            ('observations', 'TEXT')
        ],
        'suivi': [
            ('dateSuivi', 'VARCHAR(50)'),
            ('contact', 'VARCHAR(120)'),
            ('resultat', 'VARCHAR(200)'),
            ('prochaineEtape', 'VARCHAR(200)'),
            ('datePrevue', 'VARCHAR(50)')
        ],
        'recherche': [
            ('numeroDemande', 'VARCHAR(50)'),
            ('dateDemande', 'VARCHAR(50)'),
            ('typeBien', 'VARCHAR(120)'),
            ('budget', 'VARCHAR(50)'),
            ('criteres', 'TEXT'),
            ('biensProposes', 'TEXT'),
            ('statutDemande', 'VARCHAR(100)')
        ],
        'gestion_locative': [
            ('adresse', 'TEXT'),
            ('proprietaire', 'VARCHAR(120)'),
            ('dateDebutBail', 'VARCHAR(50)'),
            ('loyer', 'VARCHAR(50)'),
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
    return {c.name: getattr(obj, c.name) for c in obj.__table__.columns}


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
