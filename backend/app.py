from flask import Flask, jsonify, render_template
from flask_cors import CORS
import os
import sqlite3
from werkzeug.security import generate_password_hash
from dotenv import load_dotenv


app = Flask(__name__)
CORS(app, supports_credentials=True)

load_dotenv()  

# Load environment variables
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "dev-secret-key-2024")
app.config['DATABASE'] = os.path.join("instance", "database.db")
app.config['TMDB_API_KEY'] = os.getenv("TMDB_API_KEY")

# Initialize database
def init_db():
    os.makedirs("instance", exist_ok=True)
    conn = sqlite3.connect(app.config['DATABASE'])
    
    # Import and create tables
    from models.admin_model import create_admin_table
    from models.recommendation_model import create_recommendation_table
    from models.user_model import create_user_table
    
    create_admin_table(conn)
    create_recommendation_table(conn)
    create_user_table(conn)
    
    # Create default admin user if not exists
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM admin")
    if cursor.fetchone()[0] == 0:
        password_hash = generate_password_hash("admin123")
        cursor.execute(
            "INSERT INTO admin (username, password_hash) VALUES (?, ?)",
            ("admin", password_hash)
        )
        print("Default admin created: username='admin', password='admin123'")
    
    conn.commit()
    conn.close()
    print("Database initialized successfully!")

# Import and register blueprints
from routes.public_routes import public_bp
from routes.api_routes import api_bp
from routes.admin_routes import admin_bp

app.register_blueprint(public_bp)
app.register_blueprint(api_bp, url_prefix="/api")
app.register_blueprint(admin_bp, url_prefix="/admin")

# Admin Template Routes
@app.route('/admin/login-page')
def admin_login_page():
    return render_template('admin/admin_login.html')

@app.route('/admin/dashboard-page')
def admin_dashboard_page():
    return render_template('admin/admin_dashboard.html')

@app.route('/admin/manage-recommendations-page')
def manage_recommendations_page():
    return render_template('admin/manage_recommendations.html')

@app.route('/admin/manage-users-page')
def manage_users_page():
    return render_template('admin/manage_users.html')

# Initialize database on app start
@app.before_request
def initialize_database():
    # Check if database file exists and is initialized
    if not os.path.exists(app.config['DATABASE']):
        init_db()
    else:
        # Verify tables exist by checking one table
        try:
            conn = sqlite3.connect(app.config['DATABASE'])
            conn.execute("SELECT 1 FROM admin LIMIT 1")
            conn.close()
        except sqlite3.OperationalError:
            # Tables don't exist, initialize database
            init_db()

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

@app.errorhandler(400)
def bad_request(error):
    return jsonify({"error": "Bad request"}), 400

if __name__ == "__main__":
    # Ensure database is initialized when starting the app
    if not os.path.exists(app.config['DATABASE']):
        init_db()
    app.run(debug=True, port=5000)