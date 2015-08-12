from PIL import Image
from .models import Project, Part, Ismage, Layer

def get_parts(project_id):
    project_parts = Part.objects.filter(project=project_id)
    for part in project_parts:
        part_data = {}
        part_data['id'] = part.id
        part_data['name'] = part.name
        parts.append(part_data)
    project_data['parts'] = parts
    