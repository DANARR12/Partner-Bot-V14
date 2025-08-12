from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # allow cross-origin requests (useful during dev)

def make_profile(username: str):
    # Replace with DB lookup in real app
    return {
        "username": username,
        "display_name": username,
        "level": 18,
        "rep": 0,
        "credits": "2.56K",
        "credit_score": 750,
        "rank": 8588129,
        "xp_current": 1441,
        "xp_needed": 2569,
        "total_xp": 23941
    }

@app.route("/p", methods=["GET"])
@app.route("/p/<username>", methods=["GET"])
def profile(username=None):
    try:
        # Allow ?user=somebody as fallback if no path username
        if username is None:
            username = request.args.get("user", "rahand1415_")
        return jsonify(make_profile(username))
    except Exception as e:
        # helpful error for debugging
        return jsonify({"error": "internal server error", "details": str(e)}), 500

if __name__ == "__main__":
    # change host to '0.0.0.0' if you need external access
    app.run(host="127.0.0.1", port=5000, debug=True)