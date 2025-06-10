from ultralytics import YOLO
import cv2

def detect_on_image(image_path, output_path, model_path):
    try:
        model = YOLO(model_path)
    except Exception as e:
        print(f"Model yükleme hatası: {e}")
        return []

    # Resmi oku
    image = cv2.imread(image_path)
    if image is None:
        print("Resim yüklenemedi.")
        return []

    image_height, image_width = image.shape[:2]
    hedef_siniflar = {'crosswalk', 'garbage_bin', 'stairs', 'stop_go_block'}
    names = model.names
    detections = []

    # Tahmin yap
    results = model.predict(image, device="cuda", imgsz=736)

    for result in results:
        for box in result.boxes:
            cls = int(box.cls[0].item())
            label = names[cls]
            conf = box.conf[0].item()

            if conf >= 0.4 and label in hedef_siniflar:
                x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                bbox_height = y2 - y1
                detections.append((label, conf, bbox_height, (x1, y1, x2, y2)))

                # Görsel üzerine çiz
                cv2.rectangle(image, (x1, y1), (x2, y2), (255, 0, 0), 3)
                cv2.putText(image, f"{label} {conf:.2f}", (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 3)

    # Görüntüyü kaydet
    cv2.imwrite(output_path, image)
    print(f"✅ Sonuç kaydedildi: {output_path}")
    return detections
