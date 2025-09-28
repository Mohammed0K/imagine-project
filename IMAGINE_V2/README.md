# Imagine Project Full\nfrontend/: Next.js\nbackend/: Django REST\n

# How run backend
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/Mac: source .venv/bin/activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver  # http://127.0.0.1:8000

# How run frontend
cd frontend
npm install
npm run dev  # http://localhost:3000
