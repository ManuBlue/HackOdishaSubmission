import face_recognition
import os
import numpy as np
import joblib
from sklearn.linear_model import SGDClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

# Lets first extract the encodings from the images and apply SGDClassifier
def createModelScratch(userFolderPath):
    imagesPath = os.path.join(userFolderPath, "images") # images folder
    X, y = [], []

    for personName in os.listdir(imagesPath):

        personPath = os.path.join(imagesPath, personName) # for particular person
        
        if os.path.isdir(personPath):
            for imageName in os.listdir(personPath):
                imagePath = os.path.join(personPath, imageName) # for particular image
                if os.path.isfile(imagePath):
                    image = face_recognition.load_image_file(imagePath)
                    encodings = face_recognition.face_encodings(image)
                    if encodings:
                        X.append(encodings[0])
                        y.append(personName)

    X = np.array(X)
    y = np.array(y)

    # Create pipeline with scaling + SGDClassifier
    clf = make_pipeline(
        StandardScaler(),
        SGDClassifier(class_weight="balanced", random_state=42)
    )
    clf.fit(X, y)

    # Save model + classes
    modelPackage = {
        "model": clf,
        "classes": np.unique(y)
    }
    joblib.dump(modelPackage, os.path.join(userFolderPath, "model.pkl"))
