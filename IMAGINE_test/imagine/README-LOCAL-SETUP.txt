IMAGINE - Local Setup (Windows 11)

1) Install Python 3.11+ from python.org and ensure 'Add to PATH' is checked.
2) Open PowerShell and go to your project folder:
   cd C:\Users\Mohammed\Desktop\IMAGINE

3) Create and activate a virtual environment:
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1

4) Install dependencies:
   pip install -r requirements.txt

5) Initialize the database:
   python manage.py migrate
   python manage.py createsuperuser  # optional for admin

6) Load demo data (places + guides):
   python manage.py loaddata fixtures\places.json
   python manage.py loaddata fixtures\guides.json
   # Optionally: reviews.json, bookings.json after you create a superuser and adjust user IDs.

7) Map your domain to localhost (requires admin PowerShell/Notepad):
   Add the following line to C:\Windows\System32\drivers\etc\hosts
     127.0.0.1   imaginetours.net

8) Put your SSL certificate files on disk, for example:
     C:\ssl\fullchain.pem
     C:\ssl\privkey.pem

9) Run with HTTPS on port 8443:
   .\run_https.ps1 -CertFile "C:\ssl\fullchain.pem" -KeyFile "C:\ssl\privkey.pem" -Port 8443

10) Open the site:
   https://imaginetours.net:8443/home/home.html

API endpoints (used by dashboard):
   https://imaginetours.net:8443/api/places/
   https://imaginetours.net:8443/api/guides/
   https://imaginetours.net:8443/api/bookings/
   https://imaginetours.net:8443/api/reviews/
   https://imaginetours.net:8443/api/contact/
   https://imaginetours.net:8443/api/auth/register/
   https://imaginetours.net:8443/api/auth/login/

Security Notes:
 - For local dev, DEBUG=True is acceptable. For production, set DEBUG=False, use a real DB, and a proper web server/reverse proxy.
 - Ensure your certificate private key remains private.
 - When moving to production, serve static files via a web server (nginx) and keep Django for the API.
