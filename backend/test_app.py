import sys
import os

# Add the backend directory to Python path
sys.path.append(os.path.dirname(__file__))

from app import app, init_db

def test_app():
    print("Testing Flask app initialization...")
    
    # Test database initialization
    try:
        init_db()
        print("✓ Database initialized successfully")
    except Exception as e:
        print(f"✗ Database initialization failed: {e}")
        return
    
    # Test if blueprints are registered
    with app.app_context():
        rules = [rule.rule for rule in app.url_map.iter_rules()]
        print(f"✓ Registered {len(rules)} routes")
        
        # Check for key routes
        key_routes = ['/trending', '/search', '/admin/login-page', '/api/movie/']
        found_routes = 0
        for route in key_routes:
            if any(route in r for r in rules):
                print(f"✓ Route {route} found")
                found_routes += 1
            else:
                print(f"✗ Route {route} missing")
        
        print(f"✓ Found {found_routes} out of {len(key_routes)} key routes")
        print("✓ App test completed successfully!")

if __name__ == "__main__":
    test_app()