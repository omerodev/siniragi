from django.shortcuts import render
from django.core.files.base import ContentFile
import base64
import cv2
import numpy as np
from PIL import Image
from .models import Drawing
import io

def preprocess_image(image_path):
    """
    Quick Draw formatına uygun şekilde preprocess yapar:
    - Arka plan siyah, çizgiler beyaz ve gri tonlarında olacak
    - 28x28 boyutuna küçültülecek
    """
    # 1. Görüntüyü oku ve griye çevir
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)

    # 2. Arka planı tersine çevir (siyah arka plan, beyaz çizgiler)
    image = cv2.bitwise_not(image)

    # 3. 28x28 boyutuna küçült (Quick Draw formatı)
    image = cv2.resize(image, (28, 28), interpolation=cv2.INTER_AREA)

    # 4. Normalize et (0-255 aralığında gri tonlama ayarla)
    image = cv2.normalize(image, None, 0, 255, cv2.NORM_MINMAX)

    # 5. PIL kullanarak resmi kaydet
    processed_image = Image.fromarray(image)
    buffer = io.BytesIO()
    processed_image.save(buffer, format="PNG")
    return buffer.getvalue()

def home(request):
    preprocessed_image_url = None

    if request.method == "POST":
        image_data = request.POST.get("image")
        format, imgstr = image_data.split(';base64,')
        ext = format.split('/')[-1]
        image_file = ContentFile(base64.b64decode(imgstr), name=f"drawing.{ext}")

        # Orijinal çizimi kaydet
        drawing = Drawing(image=image_file)
        drawing.save()

        # Preprocess yap ve yeni dosyayı kaydet
        processed_data = preprocess_image(drawing.image.path)
        processed_file = ContentFile(processed_data, name=f"processed_{drawing.id}.png")

        # Yeni preprocess edilmiş resmi kaydet
        drawing_preprocessed = Drawing(image=processed_file)
        drawing_preprocessed.save()

        # İşlenmiş görüntünün URL'sini al
        preprocessed_image_url = drawing_preprocessed.image.url

    return render(request, "home.html", {"preprocessed_image_url": preprocessed_image_url})
