from django.conf import settings
from django.conf.urls import url, static
from . import views

intorfloat_re = "(\d+(?:\.\d+)?)"

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'project/(?P<project_id>[0-9]+)/part/(?P<part_id>[0-9]+)/view/(?P<ismage_id>[0-9]+)$', views.viewpart, name='viewproject'),
    url(r'project/(?P<project_id>[0-9]+)/part/(?P<part_id>[0-9]+)/view/image/(?P<ismage_id>[0-9]+)$', views.viewpart, name='viewproject'),
    url(r'project/(?P<project_id>[0-9]+)/part/(?P<part_id>[0-9]+)/edit/$', views.editpart, name='editproject'),
    url(r'save/image/$', views.upload_image, name='upload_image'),
    url(r'save/layer/(?P<layer_id>[0-9]+)$', views.save_layer, name='save_layer'),
    url(r'getlayers/image/(?P<ismage_id>[0-9]+)$', views.get_layers_by_image_id, name='get_layers_by_image_id'),
    url(r'getlayerdata/layer/(?P<layer_id>[0-9]+)$', views.get_layer_data, name='get_layer_data'),
    url(r'delete/layer/(?P<layer_id>[0-9]+)$', views.delete_layer, name='delete_layer'),
    url(r'delete/image/(?P<ismage_id>[0-9]+)$', views.delete_ismage, name='delete_ismage'),
] 