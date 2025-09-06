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
        SGDClassifier(class_weight="balanced", random_state=42, loss="log_loss")
    )
    clf.fit(X, y)

    # Save model + classes
    modelPackage = {
        "model": clf,
        "classes": np.unique(y)
    }
    joblib.dump(modelPackage, os.path.join(userFolderPath, "model.pkl"))
    return




def updateModel(userFolderPath,imagePaths):
    #assuming imagePaths is a list of paths to new images
    modelPath = os.path.join(userFolderPath, "model.pkl")
    x = []
    y = []
    for imagePath in imagePaths:
        if not os.path.isfile(imagePath):
            continue

        image = face_recognition.load_image_file(imagePath)
        encodings = face_recognition.face_encodings(image)
        if not encodings:
            continue

        faceEncoding = encodings[0]
        personName = os.path.basename(os.path.dirname(imagePath))
        x.append(faceEncoding)
        y.append(personName)
    x = np.array(x)
    y = np.array(y)
    if not os.path.isfile(modelPath):
        clf = make_pipeline(
            StandardScaler(),
            SGDClassifier(class_weight="balanced", random_state=42, loss="log_loss")
        )
        clf.fit(x, y)
        modelPackage = {
            "model": clf,
            "classes": np.unique(y)
        }
        joblib.dump(modelPackage, modelPath)
        return
    modelPackage = joblib.load(modelPath)
    clf = modelPackage["model"]
    classes = modelPackage["classes"]
    clf.partial_fit(x, y, classes=np.unique(np.concatenate((classes, y))))
    modelPackage = {
        "model": clf,
        "classes": np.unique(np.concatenate((classes, y)))
    }
    joblib.dump(modelPackage, modelPath)
    return 