import face_recognition
import os
import sklearn

#Lets first extract the encodings from the images and apply SGDClassifier
def createModelScratch(userFolderPath):

    imagesPath = os.path.join(userFolderPath, "images") #images folder
    encodingsList = []
    for personName in os.listdir(imagesPath):

        personPath = os.path.join(imagesPath, personName) #for particular person
        
        if os.path.isdir(personPath):
            for imageName in os.listdir(personPath):
                imagePath = os.path.join(personPath, imageName) #for particular image
                if os.path.isfile(imagePath):
                    image = face_recognition.load_image_file(imagePath)
                    encodings = face_recognition.face_encodings(image)
                    if encodings:
                        encoding = encodings[0]

                        