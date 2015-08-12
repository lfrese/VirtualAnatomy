"""
Django settings for dog project.

For more information on this file, see
https://docs.djangoproject.com/en/1.7/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.7/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.7/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'oitphxzxr*(izcy^+at+(2s5dw5^a5oe$j6t=$f-0ih%@sl*z+'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

TEMPLATE_DEBUG = True

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'canvas',
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'dog.urls'

WSGI_APPLICATION = 'dog.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.7/ref/settings/#databases


#after installing postgreSQL have to go here and download psycopg2 http://www.stickpeople.com/projects/python/win-psycopg/
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'VirtualAnatomy',
        'USER':'postgres',
        'PASSWORD':'pass',
        'HOST': 'localhost',
        'POST': '5432',
    }
}

# Internationalization
# https://docs.djangoproject.com/en/1.7/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True

TEMPLATE_DIRS = (
    'dog/canvas/templates',
)
# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.7/howto/static-files/

def rel(*x):
   return os.path.join(os.path.abspath(os.path.dirname(__file__)), *x)
MEDIA_ROOT = rel('../canvas/media')
MEDIA_URL = '/canvas/media/'
STATIC_URL = '/static/'
STATIC_ROOT = '' #if only your static files are in project folder
STATICFILES_DIRS = ( rel('static'),) #if only your static files are in project folder
