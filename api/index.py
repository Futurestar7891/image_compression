from flask import *
from PIL import Image
import base64
import os
from time import sleep

app = Flask(__name__)
app.secret_key = "__TMP__"

@app.route("/api/health")
def hello_world():
    return "OK"

def compress_image(input_path, output_path):
    try:
        with Image.open(input_path) as img:
            img.save(output_path, optimize=True, quality=10)
        return True
    except Exception as e:
        return str(e)

@app.route('/api/compress', methods = ['POST']) 
def handle_compression(): 
    if request.method == "POST":
        uploaded_file = request.files["file"]

        if uploaded_file.filename != "":
            _, file_extension = os.path.splitext(uploaded_file.filename)
            input_path = os.path.abspath(os.path.join("uploads", uploaded_file.filename))
            output_path = os.path.abspath(os.path.join("compressed", uploaded_file.filename))
            uploaded_file.save(input_path)

            compression_result = compress_image(input_path, output_path)
            sleep(5)

            if compression_result is True:
                with open(output_path, "rb") as image_file:
                    encoded = base64.b64encode(image_file.read())

                output_size = os.path.getsize(output_path)
                preamble = "data:image/" + file_extension[1:] + ";base64,"

                data = {
                    "compressedSize": output_size,
                    "imageB64": preamble + encoded.decode("utf-8")
                }

                return jsonify(data)
            else:
                res = {
                    "error_status": compression_result
                }

                return jsonify(res), 500