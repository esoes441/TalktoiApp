# command_processor.py

# Nesne eşleştirme için anahtar kelimeler
from typing import Optional


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



def extract_object_name(command: str) -> Optional[str]:

    if not command or not isinstance(command, str):
        return None

    command = command.lower().strip()

    # Önce tam eşleşme kontrol et
    for keyword in object_keywords:
        if command == keyword:
            return keyword

    # Cümle içinde parçalı eşleşme kontrol et
    for keyword in object_keywords:
        if keyword in command:
            return keyword

    return None


def match_object_from_command(command: str) -> str:

    # Doğrudan YOLO etiketi mi?
    yolo_labels = ["garbage_bin", "crosswalk", "stairs", "stop_go_block"]
    if command in yolo_labels:
        return command

    # Türkçe komut mu?
    if command in object_keywords:
        return object_keywords[command]

    # Cümle içinde anahtar kelime var mı?
    extracted = extract_object_name(command)
    if extracted and extracted in object_keywords:
        return object_keywords[extracted]

    # Hiçbiri değilse boş döndür
    return ""