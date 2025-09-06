import face_recognition

def getFaceEncoding(npImage):
    return face_recognition.face_encodings(npImage)
    