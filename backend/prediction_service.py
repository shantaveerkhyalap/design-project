import os

# Suppress TensorFlow logs aggressively before imports
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
import logging
logging.getLogger('tensorflow').setLevel(logging.ERROR)

import tensorflow as tf
import numpy as np
import json
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.efficientnet import preprocess_input

class CropDiseasePredictor:
    def __init__(self, model_path=None, class_names_path=None):
        """Load model and class names once."""
        base_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Priority for the new model name
        if model_path is None:
            # Check for best_model(1).keras first as requested by user
            new_model_path = os.path.join(base_dir, 'models', 'best_model(1).keras')
            old_model_path = os.path.join(base_dir, 'models', 'crop_disease_efficientnetb0.keras')
            
            if os.path.exists(new_model_path):
                model_path = new_model_path
            else:
                model_path = old_model_path
        
        if class_names_path is None:
            class_names_path = os.path.join(base_dir, 'class_names.json')

        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at {model_path}")
            
        self.model = tf.keras.models.load_model(model_path)
        self.model_name = os.path.basename(model_path)
        
        if os.path.exists(class_names_path):
            with open(class_names_path, 'r') as f:
                self.class_names = json.load(f)
            # If class_names is a list, use as-is. If dict, convert keys to int for indexing.
            if isinstance(self.class_names, dict):
                self.class_names = [self.class_names[str(i)] for i in range(len(self.class_names))]
        else:
            self.class_names = []

    def predict(self, img_path):
        """Predict disease from leaf image."""
        if not self.class_names:
            return {"error": "Class names not loaded. Please provide class_names.json"}

        # Load image
        img = image.load_img(img_path, target_size=(224, 224))
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        
        # CRITICAL: Use EfficientNet's preprocess_input instead of manual / 255.0
        # This matches the training pipeline provided by the user.
        img_array = preprocess_input(img_array)

        predictions = self.model.predict(img_array, verbose=0)[0]
        top_idx = np.argmax(predictions)

        return {
            'disease': self.class_names[top_idx],
            'confidence': float(predictions[top_idx]),
            'all_predictions': {
                self.class_names[i]: float(p)
                for i, p in enumerate(predictions)
                if p > 0.01  # Only show classes >1% confidence
            },
            'model_used': self.model_name
        }
