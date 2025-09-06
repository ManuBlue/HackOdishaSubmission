import joblib
import os
def recognizePerson(userFolderPath, faceEncoding):
    modelPath = os.path.join(userFolderPath, "model.pkl")
    if not os.path.isfile(modelPath):
        return "Unknown", 0.0  # Always return a tuple
    modelPackage = joblib.load(modelPath)
    model = modelPackage["model"]
    classes = modelPackage["classes"]
    probas = model.decision_function([faceEncoding])
    predictedPerson = classes[probas.argmax()]
    confidence = probas.max()
    return predictedPerson, confidence

