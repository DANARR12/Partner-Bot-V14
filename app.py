from flask import Flask, render_template, request, redirect, url_for, session, flash
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os
from datetime import datetime

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'super_secret_key_123!')  # Secret key بۆ session

# ---------------------------
# دیتابیس ساده
# ---------------------------
def init_db():
    conn = sqlite3.connect('users.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def get_db_connection():
    conn = sqlite3.connect('users.db')
    conn.row_factory = sqlite3.Row
    return conn

# ---------------------------
# Home Page
# ---------------------------
@app.route('/')
def home():
    return render_template('home.html')

# ---------------------------
# Register
# ---------------------------
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form.get('email', '')
        password = request.form['password']
        confirm_password = request.form['confirm_password']

        # Validation
        if not username or not password:
            flash("تکایە هەموو خانەکان پڕبکەرەوە!", "danger")
            return render_template('register.html')
        
        if password != confirm_password:
            flash("پاسۆردەکان وەک یەک نین!", "danger")
            return render_template('register.html')
        
        if len(password) < 6:
            flash("پاسۆرد دەبێت لانیکەم ٦ پیت بێت!", "danger")
            return render_template('register.html')

        # Hash کردن پسورد
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256', salt_length=16)

        try:
            conn = get_db_connection()
            c = conn.cursor()
            c.execute("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", 
                     (username, email, hashed_password))
            conn.commit()
            conn.close()
            flash("بە سەرکەوتوویی تۆمارکرا!", "success")
            return redirect(url_for('login'))
        except sqlite3.IntegrityError:
            flash("ئەم ناوی بەکارهێنەرە هەیە!", "danger")
        except Exception as e:
            flash("هەڵەیەک ڕوویدا، تکایە دواتر هەوڵ بدە!", "danger")

    return render_template('register.html')

# ---------------------------
# Login
# ---------------------------
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        if not username or not password:
            flash("تکایە هەموو خانەکان پڕبکەرەوە!", "danger")
            return render_template('login.html')

        try:
            conn = get_db_connection()
            c = conn.cursor()
            c.execute("SELECT * FROM users WHERE username = ?", (username,))
            user = c.fetchone()
            
            if user and check_password_hash(user['password'], password):
                session['user_id'] = user['id']
                session['username'] = user['username']
                
                # Update last login
                c.execute("UPDATE users SET last_login = ? WHERE id = ?", 
                         (datetime.now(), user['id']))
                conn.commit()
                conn.close()
                
                flash("بە سەرکەوتوویی چوویتە ژوورەوە!", "success")
                return redirect(url_for('dashboard'))
            else:
                flash("ناوی بەکارهێنەر یان پاسۆرد هەڵەیە!", "danger")
        except Exception as e:
            flash("هەڵەیەک ڕوویدا، تکایە دواتر هەوڵ بدە!", "danger")
        finally:
            conn.close()

    return render_template('login.html')

# ---------------------------
# Dashboard (protected page)
# ---------------------------
@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        flash("تکایە سەرەتا چووە ژوورەوە!", "warning")
        return redirect(url_for('login'))
    
    try:
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("SELECT * FROM users WHERE id = ?", (session['user_id'],))
        user = c.fetchone()
        conn.close()
        
        return render_template('dashboard.html', user=user)
    except Exception as e:
        flash("هەڵەیەک ڕوویدا!", "danger")
        return redirect(url_for('login'))

# ---------------------------
# Profile
# ---------------------------
@app.route('/profile')
def profile():
    if 'user_id' not in session:
        flash("تکایە سەرەتا چووە ژوورەوە!", "warning")
        return redirect(url_for('login'))
    
    try:
        conn = get_db_connection()
        c = conn.cursor()
        c.execute("SELECT * FROM users WHERE id = ?", (session['user_id'],))
        user = c.fetchone()
        conn.close()
        
        return render_template('profile.html', user=user)
    except Exception as e:
        flash("هەڵەیەک ڕوویدا!", "danger")
        return redirect(url_for('dashboard'))

# ---------------------------
# Change Password
# ---------------------------
@app.route('/change_password', methods=['GET', 'POST'])
def change_password():
    if 'user_id' not in session:
        flash("تکایە سەرەتا چووە ژوورەوە!", "warning")
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        current_password = request.form['current_password']
        new_password = request.form['new_password']
        confirm_password = request.form['confirm_password']
        
        if new_password != confirm_password:
            flash("پاسۆردە نوێیەکان وەک یەک نین!", "danger")
            return render_template('change_password.html')
        
        if len(new_password) < 6:
            flash("پاسۆرد دەبێت لانیکەم ٦ پیت بێت!", "danger")
            return render_template('change_password.html')
        
        try:
            conn = get_db_connection()
            c = conn.cursor()
            c.execute("SELECT password FROM users WHERE id = ?", (session['user_id'],))
            user = c.fetchone()
            
            if user and check_password_hash(user['password'], current_password):
                hashed_password = generate_password_hash(new_password, method='pbkdf2:sha256', salt_length=16)
                c.execute("UPDATE users SET password = ? WHERE id = ?", (hashed_password, session['user_id']))
                conn.commit()
                conn.close()
                flash("پاسۆرد بە سەرکەوتوویی گۆڕدرا!", "success")
                return redirect(url_for('profile'))
            else:
                flash("پاسۆردی ئێستا هەڵەیە!", "danger")
        except Exception as e:
            flash("هەڵەیەک ڕوویدا!", "danger")
        finally:
            conn.close()
    
    return render_template('change_password.html')

# ---------------------------
# Logout
# ---------------------------
@app.route('/logout')
def logout():
    session.clear()
    flash("بە سەرکەوتوویی چوویتە دەرەوە!", "success")
    return redirect(url_for('login'))

# ---------------------------
# Error Handlers
# ---------------------------
@app.errorhandler(404)
def not_found_error(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('500.html'), 500

# ---------------------------
# Run App
# ---------------------------
if __name__ == '__main__':
    init_db()
    app.run(debug=True, ssl_context='adhoc')  # HTTPS خودکار بۆ دێمو