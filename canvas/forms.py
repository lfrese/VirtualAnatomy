from django import forms
from .models import Ismage

class ImageUploadForm(forms.ModelForm):
    class Meta:
        model = Ismage
        fields = ['src', 'part', 'order','fn']
        widgets = {
            'src': forms.TextInput(attrs={'class': 'upload', 'type':'file', 'id':'partimage', 'accept':'image/*'}),
            'part':forms.TextInput(attrs={'type':'hidden', 'name':'part', 'value':'0', 'id':'imgpart'}),
            'order':forms.TextInput(attrs={'type':'hidden', 'name':'order', 'value':'0', 'id':'hfImgorder'}),
            'fn':forms.TextInput(attrs={'type':'hidden', 'name':'fn', 'value':'', 'id':'hfImgName'}),
        }
        