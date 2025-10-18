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


# IMAGINE Tours

منصة سياحية لعرض الوجهات والمرشدين، مع تسجيل/دخول مستخدمين ونموذج “اتصل بنا”. الواجهة ثابتة (HTML/CSS/JS) والباك-إند Django REST. التشغيل محليًا على Windows 11 عبر uvicorn مع SSL وربط على الدومين: https://imaginetours.net.

- واجهة: `frontend/` (HTML/CSS/JS)
- باك-إند: `api/` (Django + DRF)
- قاعدة بيانات: SQLite (`db.sqlite3`)
- تشغيل آمن: `run_https.ps1` على المنفذ 443
- الدخول بالبريد الإلكتروني فقط (غير حساس لحالة الأحرف)

---

## المتطلبات

- Python 3.11+ (مُجرّب على 3.12)
- PowerShell مع صلاحية تشغيل سكربتات:
    
        Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
    
- شهادات SSL محفوظة في:
    
        C:\ssl\certificate.crt
        C:\ssl\private.key
        C:\ssl\ca_bundle.crt
    
- إن وُجد `requirements.txt` فاستخدمه، وإن لم يوجد ثبّت الحزم يدويًا (بالأسفل).

---

## التركيب والتشغيل (Windows 11)

المسار المفترض للمشروع:
    
    C:\Users\Mohammed\Desktop\IMAGINE

1) البيئة الافتراضية والحزم

    cd C:\Users\Mohammed\Desktop\IMAGINE
    python -m venv .venv
    .\.venv\Scripts\Activate.ps1
    pip install -r requirements.txt
    # إن لم يوجد requirements.txt:
    # pip install django djangorestframework uvicorn[standard] django-cors-headers

2) فحص الإعدادات وتحديث القاعدة

    python manage.py check
    python manage.py migrate

3) إنشاء حساب مدير (إن لزم)

    python manage.py createsuperuser

4) تشغيل HTTPS

    .\run_https.ps1 -CertFile "C:\ssl\certificate.crt" -KeyFile "C:\ssl\private.key" -CaBundle "C:\ssl\ca_bundle.crt" -Port 443

إذا كان 443 محجوزًا:

    netstat -ano | findstr :443
    tasklist /FI "PID eq <PID>"
    Stop-Service W3SVC -Force
    Stop-Service WAS -Force

---

## هيكل المجلدات

    IMAGINE/
    ├─ manage.py
    ├─ db.sqlite3
    ├─ run_https.ps1
    ├─ .venv/
    ├─ imagine/
    │  ├─ settings.py       ← إعدادات Django
    │  ├─ urls.py           ← روابط نظيفة + تضمين /api/
    │  ├─ asgi.py / wsgi.py
    ├─ api/
    │  ├─ models.py         ← Place, Guide, Booking, Review, ContactMessage
    │  ├─ serializers.py    ← محولات JSON (تشمل RegisterSerializer)
    │  ├─ views.py          ← ViewSets + AuthViewSet (register/login)
    │  ├─ urls.py           ← تعريف مسارات REST
    │  └─ admin.py, apps.py, migrations/...
    └─ frontend/
       ├─ shared/navbar_v2.css
       ├─ home/      (home.html, home.css, script.js)
       ├─ places/    (places.html, places.css, assets/..)
       ├─ guides/    (guides.html, guides.css)
       ├─ contact/   (contact.html, contact.css, contact.js)
       ├─ login/     (login.html, login.css, login.js)
       ├─ register/  (register.html, register.css, register.js)
       └─ dashboard/ (dashboard.html, dashboard.css)

---

## الإعدادات المهمة (Django)

`imagine/settings.py` (نقاط أساسية):

- قاعدة البيانات (SQLite محليًا):

        DATABASES = {
          "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
          }
        }

- التطبيقات:

        INSTALLED_APPS = [
          "django.contrib.admin",
          "django.contrib.auth",
          "django.contrib.contenttypes",
          "django.contrib.sessions",
          "django.contrib.messages",
          "django.contrib.staticfiles",
          "rest_framework",
          "corsheaders",
          "api",
        ]

- DRF (تطوير محلي):

        REST_FRAMEWORK = {
          "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
          "DEFAULT_AUTHENTICATION_CLASSES": [],
        }

- المنطقة الزمنية:

        TIME_ZONE = "Asia/Riyadh"

- الروابط النظيفة: تقديم صفحات الواجهة عبر `urls.py` بتحويل `/home` إلى `frontend/home/home.html`… إلخ.
- مستقبلاً يُفضّل تقديم الملفات الثابتة عبر WhiteNoise/Nginx لإزالة تحذير StreamingHttpResponse وتحسين الأداء.

---

## مصادر أساسية (نسخ-ولصق)

### api/serializers.py

    from django.contrib.auth.models import User
    from rest_framework import serializers
    from .models import Place, Guide, Booking, Review, ContactMessage

    class PlaceSerializer(serializers.ModelSerializer):
        class Meta:
            model = Place
            fields = "__all__"

    class GuideSerializer(serializers.ModelSerializer):
        class Meta:
            model = Guide
            fields = "__all__"

    class BookingSerializer(serializers.ModelSerializer):
        class Meta:
            model = Booking
            fields = "__all__"

    class ReviewSerializer(serializers.ModelSerializer):
        class Meta:
            model = Review
            fields = "__all__"

    class ContactMessageSerializer(serializers.ModelSerializer):
        class Meta:
            model = ContactMessage
            fields = "__all__"

    class RegisterSerializer(serializers.ModelSerializer):
        password = serializers.CharField(write_only=True, min_length=8)

        class Meta:
            model = User
            fields = ("username", "email", "password")

        def validate_email(self, value):
            if value and User.objects.filter(email__iexact=value).exists():
                raise serializers.ValidationError("Email is already registered.")
            return value

        def validate_username(self, value):
            if User.objects.filter(username__iexact=value).exists():
                raise serializers.ValidationError("Username is already taken.")
            return value

        def create(self, validated_data):
            user = User(
                username=validated_data["username"],
                email=validated_data.get("email", ""),
            )
            user.set_password(validated_data["password"])
            user.save()
            return user

### api/views.py

    from django.contrib.auth import authenticate
    from django.contrib.auth.models import User
    from rest_framework import viewsets, status
    from rest_framework.decorators import action
    from rest_framework.response import Response

    from .models import Place, Guide, Booking, Review, ContactMessage
    from .serializers import (
        PlaceSerializer, GuideSerializer, BookingSerializer,
        ReviewSerializer, ContactMessageSerializer, RegisterSerializer
    )

    class PlaceViewSet(viewsets.ModelViewSet):
        queryset = Place.objects.all().order_by("name")
        serializer_class = PlaceSerializer

    class GuideViewSet(viewsets.ModelViewSet):
        queryset = Guide.objects.all().order_by("name")
        serializer_class = GuideSerializer

    class BookingViewSet(viewsets.ModelViewSet):
        queryset = Booking.objects.select_related("user", "guide", "place").all().order_by("-created_at")
        serializer_class = BookingSerializer

    class ReviewViewSet(viewsets.ModelViewSet):
        queryset = Review.objects.select_related("user", "guide", "place").all().order_by("-created_at")
        serializer_class = ReviewSerializer

    class ContactMessageViewSet(viewsets.ModelViewSet):
        queryset = ContactMessage.objects.all().order_by("-created_at")
        serializer_class = ContactMessageSerializer

    class AuthViewSet(viewsets.ViewSet):
        @action(detail=False, methods=["post"])
        def register(self, request):
            serializer = RegisterSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        @action(detail=False, methods=["post"])
        def login(self, request):
            email = (request.data.get("email") or "").strip()
            password = request.data.get("password") or ""
            if not email or not password:
                return Response({"detail": "Email and password are required."}, status=400)

            user = User.objects.filter(email__iexact=email).first()
            if not user:
                return Response({"detail": "Invalid email or password."}, status=400)

            auth_user = authenticate(username=user.username, password=password)
            if not auth_user:
                return Response({"detail": "Invalid email or password."}, status=400)

            return Response({"username": auth_user.username, "email": auth_user.email}, status=200)

### frontend/login/login.js

    document.addEventListener("DOMContentLoaded", () => {
      const form = document.querySelector("form");
      if (!form) return;

      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = (document.getElementById("email")?.value || "").trim();
        const password = document.getElementById("password")?.value || "";

        if (!email || !password) {
          alert("Please provide email and password.");
          return;
        }

        const payload = { email, password };

        try {
          const res = await fetch("/api/auth/login/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const data = await res.json().catch(() => ({}));

          if (!res.ok) {
            const firstField = data && typeof data === "object" ? Object.keys(data)[0] : null;
            const firstMsg = firstField ? (Array.isArray(data[firstField]) ? data[firstField][0] : String(data[firstField])) : null;
            const msg = firstMsg || data.detail || res.statusText;
            alert("Login failed: " + msg);
            return;
          }

          localStorage.setItem("user", JSON.stringify(data));
          window.location.href = "/dashboard";
        } catch {
          alert("Network error. Please try again.");
        }
      });
    });

### frontend/register/register.js

    document.addEventListener("DOMContentLoaded", () => {
      const form =
        document.getElementById("registerForm") ||
        document.querySelector('form[action*="register"], form');

      if (!form) return;

      const pick = (sel) => document.querySelector(sel);

      const nameEl =
        pick('#name') ||
        pick('#fullName') ||
        pick('input[name="name"]') ||
        pick('input[name="full_name"]') ||
        pick('input[placeholder*="Full Name" i]');

      const emailEl =
        pick('#email') ||
        pick('input[type="email"][name="email"]') ||
        pick('input[name="user[email]"]') ||
        pick('input[placeholder*="Email" i]');

      const pwdEl =
        pick('#password') ||
        pick('input[type="password"][name="password"]') ||
        pick('input[name="pass"]');

      const confirmEl =
        pick('#confirm') ||
        pick('input[name="confirm"]') ||
        pick('input[name="password2"]') ||
        pick('input[name="confirm_password"]') ||
        pick('input[placeholder*="Confirm" i]');

      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = (nameEl?.value || "").trim();
        const email = (emailEl?.value || "").trim();
        const password = pwdEl?.value || "";
        const confirm = confirmEl?.value || "";

        if (!name || !email || !password || !confirm) {
          alert("Please fill in all fields.");
          return;
        }
        if (password !== confirm) {
          alert("Passwords do not match.");
          return;
        }

        const username = (name ? name.replace(/\s+/g, "_") : email.split("@")[0]).toLowerCase();
        const payload = { username, email, password };

        try {
          const res = await fetch("/api/auth/register/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            credentials: "same-origin",
          });

          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            const firstField = data && typeof data === "object" ? Object.keys(data)[0] : null;
            const firstMsg = firstField ? (Array.isArray(data[firstField]) ? data[firstField][0] : String(data[firstField])) : null;
            const msg = firstMsg || data.detail || res.statusText;
            alert("Register failed: " + msg);
            return;
          }

          alert("Account created successfully. Please sign in.");
          window.location.href = "/login";
        } catch {
          alert("Network error. Please try again.");
        }
      });
    });

### روابط مطلقة داخل صفحات HTML

اجعل مسارات CSS/JS مطلقة لضمان عملها مع الروابط النظيفة:

`frontend/home/home.html`

    <link rel="stylesheet" href="/home/home.css">
    <script src="/home/script.js" defer></script>

`frontend/login/login.html`

    <base href="/login/">
    <script src="/login/login.js" defer></script>

كرر المبدأ لبقية الصفحات (`/places/places.css`, `/guides/guides.css`, …).

### run_https.ps1 (PowerShell مع SSL)

    param(
      [Parameter(Mandatory=$true)][string]$CertFile,
      [Parameter(Mandatory=$true)][string]$KeyFile,
      [Parameter(Mandatory=$false)][string]$CaBundle = $null,
      [int]$Port = 443
    )

    $env:SSL_CERT_FILE = $CertFile
    $env:SSL_KEY_FILE = $KeyFile
    if ($CaBundle) { $env:SSL_CA_BUNDLE = $CaBundle }

    uvicorn imagine.asgi:application `
      --host 0.0.0.0 `
      --port $Port `
      --ssl-certfile $CertFile `
      --ssl-keyfile $KeyFile

---

## نهايات الـ API

المصادقة

- POST `/api/auth/register/`

        { "username": "mohammed", "email": "user@example.com", "password": "StrongP@ssw0rd" }

  201: بيانات المستخدم (بدون كلمة المرور)  
  400: رسائل تحقق واضحة (اسم مستخدم/إيميل مستخدم، طول كلمة المرور…)

- POST `/api/auth/login/` (بالبريد فقط)

        { "email": "user@example.com", "password": "StrongP@ssw0rd" }

  200:

        { "username": "mohammed", "email": "user@example.com" }

  400:

        { "detail": "Invalid email or password." }

الموارد (CRUD)

- `/api/places/`
- `/api/guides/`
- `/api/bookings/`
- `/api/reviews/`
- `/api/contact/` (POST لإنشاء رسالة اتصل بنا)

---

## أوامر إدارة قاعدة البيانات

- تطبيق/إنشاء تغييرات

        python manage.py makemigrations
        python manage.py migrate

- إعادة تهيئة نظيفة محليًا

        del .\db.sqlite3
        python manage.py migrate

- تغيير كلمة مرور مستخدم

        python manage.py changepassword <username>

- عرض المستخدمين والإيميلات

        python manage.py shell -c "from django.contrib.auth.models import User; [print(u.username, '=>', u.email) for u in User.objects.all()]"

---

## اختبارات سريعة بعد التشغيل

- `https://imaginetours.net/` → يفتح `/home` بتنسيق صحيح
- `https://imaginetours.net/login` → أدخل البريد + كلمة المرور
- الإدارة: `https://imaginetours.net/admin/`
- API سريع:

        curl -k https://imaginetours.net/api/places/

---

## الأمان للإطلاق الرسمي

`imagine/settings.py`

    DEBUG = False
    ALLOWED_HOSTS = ["imaginetours.net"]

    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

يفضل تقديم الملفات الثابتة عبر WhiteNoise أو خادم أمامي (Nginx/IIS).

---

## استكشاف الأخطاء الشائعة

- No migrations to apply: القاعدة محدثة — ليست مشكلة.
- no such table: auth_user: شغّل `python manage.py migrate` قبل `createsuperuser`.
- ImportError في serializers: تأكد أن `serializers.py` يحتوي جميع الـ serializers التي تستوردها `views.py`.
- CSS لا يعمل على `/home`: استخدم مسارات مطلقة (`/home/home.css`) بدل النسبية.
- Login 400: تحقق من البريد وكلمة المرور. لإعادة ضبط:

        python manage.py changepassword <username>

---

## نسخ احتياطي واسترجاع

- نسخ احتياطي

        copy .\db.sqlite3 .\backup\db.sqlite3.bak

- استرجاع

        copy .\backup\db.sqlite3.bak .\db.sqlite3

---

## خارطة طريق

- JWT (SimpleJWT) للجلسات.
- WhiteNoise/Nginx للملفات الثابتة.
- منصة سجل أخطاء (Sentry).
- اختبارات وحدات (pytest + DRF).
- تشغيل كخدمة Windows (NSSM/Task Scheduler).
- SEO (sitemap.xml, robots.txt, meta tags).

---

## الترخيص

ضع نص رخصتك هنا (MIT/Apache-2.0/…).
