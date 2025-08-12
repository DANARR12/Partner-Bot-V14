# Flask Profile API

A simple Flask application that provides a user profile endpoint.

## Features

- **Profile Endpoint**: `GET /profile/<username>` - Returns user profile information
- **Mock Data**: Currently returns example profile data (ready for database integration)

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

## Usage

### Running the Application

```bash
python app.py
```

The Flask app will start on `http://localhost:5000`

### API Endpoints

#### GET /profile/<username>

Returns profile information for a given username.

**Example Request:**
```bash
curl http://localhost:5000/profile/testuser
```

**Example Response:**
```json
{
  "username": "testuser",
  "display_name": "rahand1415_",
  "level": 18,
  "rep": 0,
  "credits": "2.56K",
  "rank": 8588129,
  "xp_current": 1441,
  "xp_needed": 2569,
  "total_xp": 23941
}
```

## Testing

Run the test script to verify the API works:

```bash
python test_app.py
```

**Note**: Make sure the Flask app is running before running the test script.

## Development

- The app runs in debug mode by default
- Profile data is currently hardcoded - replace with database queries as needed
- Add more endpoints as required for your application

## Next Steps

- [ ] Integrate with a real database
- [ ] Add user authentication
- [ ] Add more profile fields
- [ ] Implement profile update endpoints
- [ ] Add input validation
- [ ] Add error handling