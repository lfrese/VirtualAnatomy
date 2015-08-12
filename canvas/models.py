from django.db import models
from django.contrib.auth.models import User

class Project(models.Model):
    user = models.ForeignKey(User)
    project_name = models.CharField(max_length=200)
    species = models.CharField(max_length=200, blank=True, null=True)
    
    def __str__(self):             
        return self.project_name
    
class Part(models.Model):
    project = models.ForeignKey(Project)
    name = models.CharField(max_length=200)
    subsection = models.CharField(max_length=200, blank=True, null=True)
    
    def __str__(self):              
        return self.name
    
class Ismage(models.Model):
    src = models.ImageField(upload_to='Ismages')
    part = models.ForeignKey(Part)
    three_d_src = models.FileField(upload_to='Ismages/3d', blank=True, null=True)
    order = models.IntegerField(default=0)
    fn = models.CharField(max_length=200)
    def __str__(self):              
        return self.src.name
 
    
class Layer(models.Model):
    ismage = models.ManyToManyField(Ismage)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    type = models.CharField(max_length=200, blank=True, null=True)
    audio_src = models.FileField(upload_to='Audio', blank=True, null=True)
    layerdata = models.TextField()
    def __str__(self):              
        return self.name
    