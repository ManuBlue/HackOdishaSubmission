import os 

currentDir = os.path.dirname(os.path.abspath(__file__))

userFolderPath = os.path.abspath(os.path.join(currentDir, '..', 'TemplateForUserAccount', 'User1'))


#To run the code, use the env that I actually didnt push lmao you can create a new one based on requirements.txt

#creating a model from scratch :

# from modelHandling import createModelScratch
# createModelScratch(userFolderPath) 
# tested and working


#Applying process video on the model :
from processVideo import processVideo
videoPath = os.path.join(userFolderPath, "testVideo.mp4")
outputVideoPath = os.path.join(userFolderPath, "outputVideo.mp4")
processVideo(videoPath, userFolderPath, outputVideoPath) 


