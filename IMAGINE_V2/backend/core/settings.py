import os
from datetime import timedelta
BASE_DIR=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SECRET_KEY='dev'
DEBUG=True
ALLOWED_HOSTS=['*']
INSTALLED_APPS=['django.contrib.admin','django.contrib.auth','django.contrib.contenttypes','django.contrib.sessions','django.contrib.messages','django.contrib.staticfiles','rest_framework','corsheaders','accounts','guides','places','bookings','reviews']
MIDDLEWARE=['django.middleware.security.SecurityMiddleware','corsheaders.middleware.CorsMiddleware','django.contrib.sessions.middleware.SessionMiddleware','django.middleware.common.CommonMiddleware','django.middleware.csrf.CsrfViewMiddleware','django.contrib.auth.middleware.AuthenticationMiddleware','django.contrib.messages.middleware.MessageMiddleware','django.middleware.clickjacking.XFrameOptionsMiddleware']
CORS_ALLOW_ALL_ORIGINS=True
ROOT_URLCONF='core.urls'
TEMPLATES=[{'BACKEND':'django.template.backends.django.DjangoTemplates','DIRS':[],'APP_DIRS':True,'OPTIONS':{'context_processors':['django.template.context_processors.debug','django.template.context_processors.request','django.contrib.auth.context_processors.auth','django.contrib.messages.context_processors.messages']}}]
WSGI_APPLICATION='core.wsgi.application'
DATABASES={'default':{'ENGINE':'django.db.backends.sqlite3','NAME':os.path.join(BASE_DIR,'db.sqlite3')}}
AUTH_USER_MODEL='accounts.User'
REST_FRAMEWORK={'DEFAULT_AUTHENTICATION_CLASSES':('rest_framework_simplejwt.authentication.JWTAuthentication',),'DEFAULT_PERMISSION_CLASSES':('rest_framework.permissions.AllowAny',)}
SIMPLE_JWT={'ACCESS_TOKEN_LIFETIME':timedelta(minutes=60),'REFRESH_TOKEN_LIFETIME':timedelta(days=7)}
LANGUAGE_CODE='en-us';TIME_ZONE='UTC';USE_I18N=True;USE_TZ=True
STATIC_URL='/static/'
DEFAULT_AUTO_FIELD='django.db.models.BigAutoField'
