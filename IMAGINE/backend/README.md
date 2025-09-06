# IMAGINE Backend (Django + DRF)

## Requirements
- Python 3.10+
- pip
- virtualenv (optional but recommended)

## Setup
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt

# Run dev server
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

API test:
- Open: http://127.0.0.1:8000/api/events/
