from django.shortcuts import render
from decimal import *
from django.views.decorators.csrf import requires_csrf_token
from django.http import HttpResponse
from .forms import ImageUploadForm
from .models import *
from .methods import *
#import json

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
def viewpart(request, project_id, part_id, ismage_id=0):
    part_data = Part.objects.get(pk=part_id) 
    ismage = Ismage()
    if ismage_id == 0:
        ismage = Ismage.objects.filter(part=part_id).filter(order=1)
        print (ismage[0])
    else:
        ismage = Ismage.objects.get(id=ismage_id)
        
    layers = Layer.objects.filter(ismage = ismage)
    
    return render(request, 'view.html',{'image':ismage[0], 'layers':layers})

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
        return HttpResponse(newimg.src.name)         
    return HttpResponse("post")

#TODO: when image is deleted we need to manually remove from file system http://stackoverflow.com/questions/5372934/how-do-i-get-django-admin-to-delete-files-when-i-remove-an-object-from-the-datab
#def post delete:   

   
def save_layer(request):
    if request.method == 'POST':  
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
            return HttpResponse(newLayer.name)         
        return HttpResponse("bad img")
        
# def get_layer_data(request):
    # if request.method=="POST":
        # layer = Layer.objects.get(id=request.POST.get('layerid'))
        # jsonlayer = {}
        # jsonlayer['id'] = layer.id
        # jsonlayer["name"] = layer.name
        # jsonlayer["description"] = layer.description
        # jsonlayer["type"] = layer.type
        # jsonlayer["layerdata"] = layer.layerdata
        # return HttpResponse(json.dumps(jsonlayer),content_type="application/json")