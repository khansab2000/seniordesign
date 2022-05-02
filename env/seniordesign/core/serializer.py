from rest_framework import serializers
from . models import *
  
class ReactSerializer(serializers.ModelSerializer):
    class Meta:
        model = React
        #model.objects.all().delete()
        fields = ['query', 'url', 'gender', 'race']