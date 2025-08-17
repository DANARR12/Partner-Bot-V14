# سیستەمی چوونەژوورەوە - Flask Authentication System

سیستەمێکی پارێزراو و مۆدێرن بۆ چوونەژوورەوە و تۆمارکردنی بەکارهێنەرەکان بە بەکارهێنانی Flask و SQLite.

## 🌟 تایبەتمەندییەکان

### 🔐 پارێزراو
- **پاسۆرد هەشکردن** بە بەکارهێنانی PBKDF2
- **Session management** بۆ پاراستنی دۆخی چوونەژوورەوە
- **HTTPS support** بۆ پاراستنی زانیارییەکان
- **Input validation** بۆ پاراستنی لە هەڵە

### 🎨 دیزاین
- **RTL support** بۆ زمانی کوردی
- **Responsive design** بۆ هەموو ئامێرەکان
- **Modern UI** بە بەکارهێنانی CSS Variables
- **Smooth animations** بۆ ئەزموونی باشتر

### 📱 بەکارهێنان
- **User registration** بە validation
- **User login** بە error handling
- **Dashboard** بۆ بەکارهێنەرە چووەژوورەوەکان
- **Profile management** بۆ بینینی زانیارییەکان
- **Password change** بە validation

## 🚀 دەستپێکردن

### پێویستییەکان
- Python 3.7+ 
- pip (package manager)

### دامەزراندن

1. **Clone کردن یان download کردن**
   ```bash
   git clone <repository-url>
   cd flask-auth-system
   ```

2. **دامەزراندنی dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **ڕەن کردن**
   ```bash
   python app.py
   ```

4. **کردنەوەی browser**
   بڕۆ بۆ `https://localhost:5000`

## 📁 پڕۆژە ستراکچەر

```
flask-auth-system/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── users.db              # SQLite database (auto-generated)
├── templates/            # HTML templates
│   ├── base.html         # Base template
│   ├── home.html         # Home page
│   ├── login.html        # Login form
│   ├── register.html     # Registration form
│   ├── dashboard.html    # User dashboard
│   ├── profile.html      # User profile
│   ├── change_password.html # Password change form
│   ├── 404.html          # 404 error page
│   └── 500.html          # 500 error page
└── static/               # Static files
    └── css/
        └── style.css     # Main stylesheet
```

## 🛠️ API Routes

### Public Routes
- `GET /` - Home page
- `GET /login` - Login form
- `POST /login` - Login processing
- `GET /register` - Registration form
- `POST /register` - Registration processing

### Protected Routes
- `GET /dashboard` - User dashboard
- `GET /profile` - User profile
- `GET /change_password` - Password change form
- `POST /change_password` - Password change processing
- `GET /logout` - Logout

## 🗄️ دیتابیس

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);
```

## 🎨 دیزاین سیستەم

### ڕەنگەکان
- **Brand**: #1f1f1f (Dark gray)
- **Accent**: #d9c7f2 (Soft purple)
- **Background**: #f9f9fb (Light gray)
- **Text**: #222 (Dark gray)
- **Muted**: #666 (Medium gray)

### Typography
- **Font**: Noto Sans Arabic
- **Weights**: 300, 400, 500, 600, 700
- **Direction**: RTL (Right-to-Left)

## 🔧 کاستۆمایزکردن

### گۆڕینی ڕەنگەکان
دەتوانیت ڕەنگەکان لە `static/css/style.css` بگۆڕیت:

```css
:root {
  --brand: #your-color;
  --accent: #your-color;
  --bg: #your-color;
  --text: #your-color;
}
```

### زیادکردنی فیلدە نوێیەکان
بۆ زیادکردنی فیلدە نوێیەکان:

1. **دیتابیس گۆڕین**
   ```sql
   ALTER TABLE users ADD COLUMN new_field TEXT;
   ```

2. **Form گۆڕین**
   لە `templates/register.html` فیلدی نوێ زیاد بکە

3. **Backend گۆڕین**
   لە `app.py` validation و processing زیاد بکە

## 🔒 ئەمانەت

### پاسۆرد هەشکردن
پاسۆردەکان بە بەکارهێنانی PBKDF2 هەش دەکرێن:
```python
hashed_password = generate_password_hash(password, method='pbkdf2:sha256', salt_length=16)
```

### Session Management
- Sessions بە بەکارهێنانی Flask session
- Automatic logout بۆ security
- CSRF protection (recommended for production)

### HTTPS
سیستەمەکە بە HTTPS دەڕوات بۆ پاراستنی زانیارییەکان.

## 🚀 Production Deployment

### Environment Variables
```bash
export SECRET_KEY="your-super-secret-key"
export FLASK_ENV="production"
```

### Database
بۆ production، SQLite لەبری PostgreSQL یان MySQL بەکاربهێنە.

### Web Server
بۆ production، Gunicorn یان uWSGI بەکاربهێنە:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 🐛 Troubleshooting

### Common Issues

1. **Database errors**
   - دڵنیابە کە `users.db` فایل هەیە
   - دڵنیابە کە write permissions هەیە

2. **HTTPS errors**
   - pyOpenSSL دامەزرێنە
   - بۆ production، proper SSL certificate بەکاربهێنە

3. **Import errors**
   - دڵنیابە کە هەموو dependencies دامەزراون
   - `pip install -r requirements.txt` دووبارە بکە

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

ئەم پڕۆژەیە لەژێر MIT License دایە.

## 📞 Support

بۆ پشتگیری و پرسیارەکان:
- Email: support@example.com
- GitHub Issues: [Create Issue](https://github.com/your-repo/issues)

---

**سیستەمی چوونەژوورەوە** - پارێزراو و ئاسان بۆ بەکارهێنەرەکان 🔐