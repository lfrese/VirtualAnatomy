from django.conf import settings
from django.conf.urls import url, static
from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'project/(?P<project_id>[0-9]+)/part/(?P<part_id>[0-9]+)/view/(?P<ismage_id>[0-9]+)$', views.viewpart, name='viewproject'),
    url(r'project/(?P<project_id>[0-9]+)/part/(?P<part_id>[0-9]+)/view/$', views.viewpart, name='viewproject'),
    url(r'project/(?P<project_id>[0-9]+)/part/(?P<part_id>[0-9]+)/edit/$', views.editpart, name='editproject'),
    url(r'uploadimage/$', views.upload_image, name='upload_image'),
    url(r'savelayer/$', views.save_layer, name='save_layer'),
    #url(r'getlayerdata/$', views.get_layer_data, name='get_layer_data'),
] 