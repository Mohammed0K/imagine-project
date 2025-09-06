
# IMAGINE Monorepo (Updated)

## Backend
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser  # optional
python manage.py runserver
```

Admin: http://127.0.0.1:8000/admin/
API:   http://127.0.0.1:8000/api/events/

## Frontend
```bash
cd frontend
npm install
npx tailwindcss init -p  # if postcss config not generated, safe to run
npm run dev
```

Set API base via `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```
