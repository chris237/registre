from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db = SQLAlchemy(app)

# ---- MODELS ----
class Mandat(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    numero = db.Column(db.String(50), nullable=False)
    typeMandat = db.Column(db.String(50))

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    numero = db.Column(db.String(50), nullable=False)
    bien = db.Column(db.String(200))

class Suivi(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    numeroMandat = db.Column(db.String(50), nullable=False)
    action = db.Column(db.String(100))

class Recherche(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    numero = db.Column(db.String(50), nullable=False)
    client = db.Column(db.String(100))

class GestionLocative(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    numeroBien = db.Column(db.String(50), nullable=False)
    locataire = db.Column(db.String(100))

# ---- HELPERS ----
def to_dict(obj):
    return {c.name: getattr(obj, c.name) for c in obj.__table__.columns}

def register_crud(model, endpoint):
    # GET
    def list_items():
        items = model.query.all()
        return jsonify([to_dict(i) for i in items])
    app.add_url_rule(f"/api/{endpoint}", f"list_{endpoint}", list_items, methods=["GET"])

    # POST
    def create_item():
        data = request.json
        item = model(**data)
        db.session.add(item)
        db.session.commit()
        return jsonify({"id": item.id}), 201
    app.add_url_rule(f"/api/{endpoint}", f"create_{endpoint}", create_item, methods=["POST"])

    # DELETE
    def delete_item(item_id):
        item = model.query.get(item_id)
        if not item:
            return jsonify({"error": "Not found"}), 404
        db.session.delete(item)
        db.session.commit()
        return '', 204
    app.add_url_rule(f"/api/{endpoint}/<int:item_id>", f"delete_{endpoint}", delete_item, methods=["DELETE"])

# Register all CRUD
register_crud(Mandat, "mandats")
register_crud(Transaction, "transactions")
register_crud(Suivi, "suivi")
register_crud(Recherche, "recherche")
register_crud(GestionLocative, "gestion")

if __name__ == '__main__':
    with app.app_context():   # ✅ corrige l'erreur "outside of application context"
        db.create_all()
    app.run(host="0.0.0.0", port=5000, debug=True)
