from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/profile/<username>", methods=["GET"])
def get_profile(username):
    # Example/mock data — replace with real DB lookup
    profile = {
        "username": username,
        "display_name": "rahand1415_",
        "level": 18,
        "rep": 0,
        "credits": "2.56K",
        "credit_score": 750,  # <-- Added credit score field
        "rank": 8588129,
        "xp_current": 1441,
        "xp_needed": 2569,
        "total_xp": 23941
    }
    return jsonify(profile)

if __name__ == "__main__":
    app.run(debug=True, port=5000)