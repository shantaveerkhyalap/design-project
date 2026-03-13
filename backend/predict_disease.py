import sys
import json
import os
import numpy as np

# Suppress TensorFlow logs aggressively before imports
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
import logging
logging.getLogger('tensorflow').setLevel(logging.ERROR)

from prediction_service import CropDiseasePredictor

def parse_class_label(class_name):
    """
    Parse class label into crop and disease info.
    Handles various separator formats: ___, __, or single _
    """
    if not class_name:
        return 'Unknown', 'Unknown', 'Unknown'
        
    # Try splitting by '___' first (3 underscores)
    if '___' in class_name:
        parts = class_name.split('___', 1)
        crop = parts[0].replace('_', ' ').replace('  ', ' ').strip()
        disease_raw = parts[1].strip()
    elif '__' in class_name:
        parts = class_name.split('__', 1)
        crop = parts[0].replace('_', ' ').strip()
        disease_raw = parts[1].strip()
    elif '_' in class_name:
        # First word is typically the crop
        parts = class_name.split('_', 1)
        crop = parts[0].strip()
        disease_raw = parts[1].strip()
    else:
        return class_name, 'Unknown', 'Unknown'

    # Clean up disease name
    if disease_raw.lower() == 'healthy':
        return crop, 'Healthy', 'None'
    else:
        disease = disease_raw.replace('_', ' ').replace('  ', ' ').strip()
        return crop, 'Diseased', disease

def run_inference(image_path):
    """Load model and run inference on the given image."""
    try:
        predictor = CropDiseasePredictor()
        result = predictor.predict(image_path)
        
        if 'error' in result:
            return result

        predicted_class = result['disease']
        confidence = result['confidence']
        
        # Parse into structured result
        crop, status, disease = parse_class_label(predicted_class)

        # Map all predictions to top3 format for backend compatibility
        all_preds = result.get('all_predictions', {})
        top3 = []
        # Sort by confidence descending
        sorted_preds = sorted(all_preds.items(), key=lambda x: x[1], reverse=True)
        
        for name, conf in sorted_preds[:3]:
            c, s, d = parse_class_label(name)
            top3.append({
                "class": name,
                "crop": c,
                "disease": d,
                "status": s,
                "confidence": conf / 100.0 if conf > 1.0 else conf # handle % vs 0-1
            })

        return {
            "success": True,
            "crop": crop,
            "status": status,
            "diseaseName": disease,
            "confidence": confidence / 100.0 if confidence > 1.0 else confidence,
            "raw_class": predicted_class,
            "top3_predictions": top3,
            "model_used": result.get('model_used', 'crop_disease_efficientnetb0.keras')
        }

    except Exception as e:
        import traceback
        return {"error": f"Inference failed: {str(e)}", "trace": traceback.format_exc()}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided."}))
        sys.exit(1)

    image_path = sys.argv[1]

    if not os.path.exists(image_path):
        print(json.dumps({"error": f"Image file not found: {image_path}"}))
        sys.exit(1)

    result = run_inference(image_path)
    print(json.dumps(result))

