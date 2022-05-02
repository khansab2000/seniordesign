from django.shortcuts import render
from rest_framework.views import APIView
from . models import *
from rest_framework.response import Response
from . serializer import *
from deepface import DeepFace
from serpapi import GoogleSearch
import urllib.request
import json
import environ

env = environ.Env()
environ.Env.read_env()
  
class ReactView(APIView):
    serializer_class = ReactSerializer
    
    def getImageUrl(self, query):
        params = {
            "q": query,
            "tbm": "isch",
            "ijn": "0",
            "api_key": env("GOOGLE_SEARCH_API_KEY")
        }

        search = GoogleSearch(params)
        results = search.get_dict()
        images_results = results['images_results']
        return images_results[0]['original']

    def downloadImage(self, imageUrl):
        urllib.request.urlretrieve(imageUrl, "image.jpg")

    def getImageAnalysis(self):
        obj = DeepFace.analyze(img_path = "image.jpg", actions = ['gender', 'race'])
        return { 'gender': obj['gender'], 'race': obj['race'] }

    def get(self, request):
        detail = [ { "query": detail.query, "url": detail.url, "gender": detail.gender, "race": detail.race } 
        for detail in React.objects.all()]
        return Response(detail)
  
    def post(self, request):
        imageUrl = self.getImageUrl(request.data['query'])
        self.downloadImage(imageUrl)
        imageQualities = self.getImageAnalysis()

        request.data['url'] = imageUrl
        request.data['gender'] = imageQualities['gender']
        request.data['race'] = json.dumps(imageQualities['race'])

        serializer = ReactSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return  Response(serializer.data)