import exifread

def get_focal_length_mm(image_path):
    with open(image_path, 'rb') as f:
        tags = exifread.process_file(f)
        focal_tag = tags.get('EXIF FocalLength')
        if focal_tag:
            focal_mm = float(str(focal_tag).split('/')[0])
            return focal_mm
        return None

def mm_to_px(focal_mm, sensor_width_mm, image_width_px=736):
    return (focal_mm / sensor_width_mm) * image_width_px

def estimate_distance(real_height_m, bbox_height_px, focal_px):
    return (real_height_m * focal_px) / bbox_height_px
