from unittest import result
from fastapi import Body, FastAPI, Request, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Union
from utils.command_processor import extract_object_name,match_object_from_command
import os
import sys
import cv2
import json
import shutil
import numpy as np
import requests

# Gerekli modülleri import et
sys.path.append('.')  # Ana klasörü import yoluna ekler
from predict.predict_distance import get_focal_length_mm, mm_to_px, estimate_distance
from detect.detect_on_image import detect_on_image
from utils.command_processor import match_object_from_command

app = FastAPI()

# CORS ayarları - farklı kaynaklardan API'ye erişime izin ver
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sabit değişkenler
IMAGE_DIR = "images"
DEFAULT_IMAGE = "default.jpg"
CONFIG_FILE = "config.json"

# Konfigürasyon dosyasından aktif görüntü bilgisini yükleme
def load_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, 'r') as f:
                config = json.load(f)
                return config
        except:
            return {"active_image": DEFAULT_IMAGE}
    else:
        # Varsayılan konfigürasyon oluştur
        config = {"active_image": DEFAULT_IMAGE}
        save_config(config)
        return config

# Konfigürasyon dosyasını kaydetme
def save_config(config):
    with open(CONFIG_FILE, 'w') as f:
        json.dump(config, f)

# Konfigürasyon yükleme ve images klasörünü oluşturma
if not os.path.exists(IMAGE_DIR):
    os.makedirs(IMAGE_DIR)
    
# Varsayılan resim yoksa oluştur
default_image_path = os.path.join(IMAGE_DIR, DEFAULT_IMAGE)
if not os.path.exists(default_image_path):
    # Eğer varsayılan resim yoksa ve stair87 resmi varsa, onu kopyala
    source_image = "stair87.jpg"
    if os.path.exists(source_image):
        shutil.copy(source_image, default_image_path)
    else:
        # Boş bir siyah resim oluştur
        blank_image = 255 * np.ones((640, 480, 3), np.uint8)
        cv2.imwrite(default_image_path, blank_image)

# Aktif konfigürasyonu yükle
config = load_config()

# Nesne tespiti isteği için veri modeli
class DetectionRequest(BaseModel):
    object: str

class DetectionRequestSend(BaseModel):
    object: str
    confidence: float   # confidence'ı float olarak değiştiriyoruz
    bbox: list[float]          # bbox'u list olarak değiştiriyoruz (bu bir koordinat listesi olacak)
    distance: float     # distance'ı float olarak değiştiriyoruz
    direction: str

class DetectionResponse(BaseModel):
    status: str
    message: str
    data: Optional[DetectionRequestSend] = None

def process_specific_object_detection(image_path, requested_object):

    output_path = "result.jpg"
    model_path = "models/bestonbest50.pt"
    
    # YOLO-etiketten isteğe eşleme yap
    if requested_object in ["çöp", "yaya", "merdiven", "engelli"]:
        requested_object = match_object_from_command(requested_object)
    
    print(f"Tespit edilecek nesne: {requested_object}")
    print(f"Kullanılan görüntü: {image_path}")
    
    # Dosya kontrolü
    if not os.path.exists(image_path):
        print(f"HATA: Görüntü dosyası bulunamadı: {image_path}")
        return None
    
    # 1. YOLO ile tespit et
    detections = detect_on_image(image_path, output_path, model_path)
    
    # 2. Görüntü boyutu al
    image = cv2.imread(image_path)
    if image is None:
        print(f"HATA: Görüntü yüklenemedi: {image_path}")
        return None
        
    image_height, image_width = image.shape[:2]
    
    # 3. Focal Length hesapla
    focal_mm = get_focal_length_mm(image_path)
    if focal_mm is None:
        print("Focal length EXIF'ten alınamadı. Elle girilen değer kullanılıyor.")
        focal_mm = 4.2 # Mobil telefon lens değeri
    focal_px = mm_to_px(focal_mm, sensor_width_mm=6.2, image_width_px=image_width)
    
    # 4. Nesne boyları (gerçek dünyadaki yüksekliği - metre cinsinden)
    gercek_boylar_mm = {
        "garbage_bin": 0.9,
        "crosswalk": 0.05,
        "stairs": 1.3,
        "stop_go_block": 0.6,
}
    # 5. İstenen nesneyi ara
    print("\n🔍 Tespit Edilen Nesneler İçinde İstenen Nesne Aranıyor:")
    
    for label, conf, bbox_height, coords in detections:
        if label == requested_object and label in gercek_boylar_mm:
            real_h = gercek_boylar_mm[label]
            distance = estimate_distance(real_h, bbox_height, focal_px)
            
            bbox_center_x = (coords[0] + coords[2]) / 2
            
            image_center_x = image_width / 2
            
            margin = image_width * 0.2

            if bbox_center_x < (image_center_x - margin):
                direction = "sol"
            elif bbox_center_x > (image_center_x + margin):

                direction = "sağ"
            else:
                direction = "ön"
            
            distance1 = distance/450
            print(f"- {label} tespit edildi: güven: {conf:.2f}, mesafe: {distance1:.2f} m, yön: {direction}")

            return {
                "status": "success",
                "message": f"{requested_object} tespit edildi.",
                "data": {
                    "object": label,
                    "confidence": float(conf),
                    "bbox": coords,
                    "distance": float(distance1),
                    "direction": direction
                }
            }

    # Eğer döngü bittiyse ve eşleşen nesne bulunmadıysa:
    return {
        "status": "not_found",
        "message": f"{requested_object} tespit edilemedi.",
        "data": {}
    }



object_keywords = {
    "çöp": "garbage_bin",
    "çöp kutusu": "garbage_bin",
    "çöp konteynerı": "garbage_bin",
    "çöp kovası": "garbage_bin",
    "yaya": "crosswalk",
    "yaya geçidi": "crosswalk",
    "merdiven": "stairs",
    "engelli": "stop_go_block"
}


@app.post("/analyze")
async def upload_and_analyze(file: UploadFile = File(...), object_name: str = Form(...)):
    try:
        # Doğru nesne adını bul
        extracted_object = extract_object_name(object_name)
        if not extracted_object:
            return JSONResponse(
                status_code=400,
                content={"error": f"Gönderilen komutta geçerli bir nesne bulunamadı: '{object_name}'"}
            )

        # Resim adı belirle
        image_name = file.filename
        
        # Dosya yolunu oluştur
        file_path = os.path.join(IMAGE_DIR, image_name)
        
        # Dosyayı kaydet
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Aktif görüntüyü güncelle
        config["active_image"] = image_name
        save_config(config)
        
        # Nesne tespiti yap
        image_path = os.path.join(IMAGE_DIR, config.get("active_image", DEFAULT_IMAGE))
        result = process_specific_object_detection(image_path, extracted_object)
        
        if result is None:
            return JSONResponse(
                status_code=500,
                content={"error": "İşlem sırasında hata oluştu."}
            )
        
        elif result['status'] == "not_found":
            return JSONResponse(
                status_code=404,
                content={"message": f"'{extracted_object}' nesnesi görüntüde bulunamadı."}
            )

        # Başarılı sonuç döndür
        return {
            "success": True,
            "message": f"Görüntü başarıyla yüklendi ve '{extracted_object}' nesnesi tespit edildi.",
            "data": result['data']
        }
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"İşlem sırasında hata oluştu: {str(e)}"})
    
@app.post("/item")
async def test_endpoint(item: dict = Body(...)):
    print(item)

@app.get("/")
async def root():

    return {
        "message": "Nesne Tespit API'si çalışıyor",
        "endpoints": [
            {"method": "POST", "path": "/detect", "description": "Belirli bir nesneyi tespit eder"},
            {"method": "POST", "path": "/upload_image", "description": "Yeni görüntü yükler"},
            {"method": "POST", "path": "/set_active_image", "description": "Aktif görüntüyü değiştirir"},
            {"method": "GET", "path": "/list_images", "description": "Mevcut görüntüleri listeler"}
        ],
        "active_image": config.get("active_image", DEFAULT_IMAGE)
    }

if __name__ == "__main__":
    import uvicorn
    
    print("Nesne tespit API'si başlatılıyor...")
    uvicorn.run(app, host="0.0.0.0", port=8000)