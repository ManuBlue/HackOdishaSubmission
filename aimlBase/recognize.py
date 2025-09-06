import joblib
import os
def recognizePerson(userFolderPath,faceEncoding):
    modelPath = os.path.join(userFolderPath,"model.pkl")
    if not os.path.isfile(modelPath):
        return -1
    modelPackage = joblib.load(modelPath)
    model = modelPackage["model"]
    classes = modelPackage["classes"]
    probas = model.decision_function([faceEncoding])
    predictedPerson = classes[probas.argmax()]
    confidence = probas.max()
    return predictedPerson, confidence

