from flask import Flask,jsonify,request
import tensorflow as tf
import os
import zipfile
import collections
from PIL import Image
import tfci
import urllib.request

app = Flask(__name__)

@app.route("/api/health")
def hello_world():
    return "OK"

def get_bpp(image_dimensions, num_bytes):
  w, h = image_dimensions
  return num_bytes * 8 / (w * h)

@app.route('/api/compress', methods = ['POST']) 
def handle_compression(): 
    if(request.method == 'POST'): 
        f = request.files['file'] 
        ext = f.filename.split('.')[1]
        full_path = "uploads/uploaded_image." + ext
        f.save(filename)   
        file_name, _ = os.path.splitext(full_path)

        compressed_path = os.path.join("/compressed", f'{file_name}_{model}.{ext}')
        output_path = os.path.join("/uploads", f'{file_name}_{model}.{ext}')
      
        if os.path.isfile(output_path):
            print('duplicate:', output_path)
            data = { 
                "compressedSize" : os.path.getsize(output_path), 
                "imageB64" : Image.open(output_path).base64
            } 

            return jsonify(data) 

        # Compression
        tfci.compress("hific-lo", full_path, compressed_path)
        num_bytes = os.path.getsize(compressed_path)
        data = { 
            "compressedSize" : num_bytes, 
            "imageB64" : Image.open(output_path).base64
        } 
  
        return jsonify(data)