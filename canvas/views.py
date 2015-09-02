from django.shortcuts import render
from decimal import *
from django.views.decorators.csrf import requires_csrf_token
from django.http import HttpResponse
from .forms import ImageUploadForm
from .models import *
from .methods import *
import json

def index(request):
    my_projects = Project.objects.all()    
    project_list = []
    for project in my_projects:
        project_data = {}
        project_data['id'] = project.id
        project_data['name'] = project.project_name
        parts = []
        project_parts = Part.objects.filter(project=project.id)
        for part in project_parts:
            part_data = {}
            part_data['id'] = part.id
            part_data['name'] = part.name
            parts.append(part_data)
        project_data['parts'] = parts
        project_list.append(project_data)
    return render(request, 'index.html',{'my_projects':project_list})


@requires_csrf_token    
def editpart(request, project_id, part_id):
    part_data = Part.objects.get(pk=part_id)    
    images = Ismage.objects.filter(part=part_id).order_by('order')
    form = ImageUploadForm()
    return render(request, 'draw.html',{'part_data':part_data, 'form':form, 'images':images})
    
def upload_image(request):
    if request.method == 'POST':  
        part = Part.objects.get(pk=request.POST['part'])
        newimg = Ismage(src = request.FILES['src'], part = part, order=request.POST['order'], fn=request.POST['fn'])            
        newimg.save()
        return HttpResponse(json.dumps({"name":newimg.src.name,"id":newimg.id}))         
    return HttpResponse("post")

#TODO: when image is deleted we need to manually remove from file system http://stackoverflow.com/questions/5372934/how-do-i-get-django-admin-to-delete-files-when-i-remove-an-object-from-the-datab
#def post delete:   

@requires_csrf_token      
def save_layer(request, layer_id):
    if request.method == 'POST':  
        if int(layer_id) > 0: #is not new layer is edited layer. Will implement in future stage
            #if request.method == 'POST':
                #layer = Layer.objects.get(id=layer_id)
                #layer.name = request.POST['name']
                #layer.type = request.POST['type']
                #layer.description = description = request.POST['description']
                #if request.POST['audio_src'] != '': 
                    #layer.audio_src = request.FILE['audio_src']
                #layerdata = request.POST['layerdata']
                return HttpResponse("ok") 
        else: #is new layer
            image = Ismage.objects.filter(src = request.POST['ismage']);
            if image:
                if request.POST['audio_src'] == '':            
                    newLayer = Layer(name = request.POST['name'], description = request.POST['description'], type = request.POST['type'], layerdata = request.POST['layerdata'])
                    newLayer.save()
                    newLayer.ismage.add(image[0])
                else:
                    newLayer = Layer(name = request.POST['name'], description = request.POST['description'], type = request.POST['type'], audio_src = request.FILE['audio_src'], layerdata = request.POST['layerdata'])
                    newLayer.save()
                    newLayer.ismage.add(image[0])
                return HttpResponse(newLayer.id)         
            return HttpResponse("bad img")
 
def get_layers_by_image_id(request, ismage_id):
    ismage = Ismage()
    if ismage_id != 0:
        ismage = Ismage.objects.get(id=ismage_id)
        layers = Layer.objects.filter(ismage = ismage)
        layer_list = []
        for layer in layers:
            layer_data = {}
            layer_data['id'] = layer.id
            layer_data['name'] = layer.name
            layer_list.append(layer_data)
        return HttpResponse(json.dumps(layer_list), content_type="application/json")
    else:
        return HttpResponse("Error getting layers from image " + image_id)
         
def get_layer_data(request, layer_id):
    layer = Layer()
    if layer_id:
        layer = Layer.objects.get(id=layer_id)
        jsonlayer = {}
        jsonlayer['id'] = layer.id
        jsonlayer["name"] = layer.name
        jsonlayer["description"] = layer.description
        jsonlayer["type"] = layer.type
        jsonlayer["layerdata"] = layer.layerdata
        return HttpResponse(json.dumps(jsonlayer))
    else:
        return HttpResponse("Error getting data from layer " + layer_id)
        
def delete_layer(request, layer_id):
    layer = Layer.objects.get(id=layer_id).delete()
    return HttpResponse("true")
        
def delete_ismage(request, ismage_id):
    ismage = Ismage.objects.get(id=ismage_id)
    layers = Layer.objects.filter(ismage = ismage)
    layers.delete()
    ismage.delete()
    return HttpResponse("true")
    
    
@requires_csrf_token     
def viewpart(request, project_id, part_id, ismage_id=0):    
    part_data = Part.objects.get(pk=part_id)
    ismage = Ismage()
    next = 0
    prev = 0
    if int(ismage_id) == 0:
        ismage = Ismage.objects.filter(part=part_id).filter(order=1)[0]        
        if Ismage.objects.filter(part=part_id).count() > 1:
            next = Ismage.objects.filter(part=part_id).filter(order=2)[0].id
    else:
        ismage = Ismage.objects.get(id=ismage_id)
        try:
            prev = Ismage.objects.filter(part=part_id).filter(order=ismage.order-1)[0].id
        except:
            pass
        try:
            next = Ismage.objects.filter(part=part_id).filter(order=ismage.order+1)[0].id
        except:
            pass
        
    layers = Layer.objects.filter(ismage = ismage)
    
    return render(request, 'view.html',{'image':ismage, 'layers':layers, 'next':next, 'prev':prev})