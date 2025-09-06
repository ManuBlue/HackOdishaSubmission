from ultralytics import YOLO
import cv2
from recognize import recognizePerson
import face_recognition

def processVideo(videoPath, userFolderPath, outputVideoPath):
    yoloModel = YOLO("yolo11n.pt")
    cap = cv2.VideoCapture(videoPath)

    # Get video properties for VideoWriter
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    fourcc = cv2.VideoWriter_fourcc(*'H264')  # 'mp4v' works for .mp4
    out = cv2.VideoWriter(outputVideoPath, fourcc, fps, (width, height))

    idToConfidence = {}  # {trackingID: (predictedPerson, confidence)}

    frame_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        results = yoloModel.track(frame, persist=True)
        result = results[0]

        for box in result.boxes:
            classId = int(box.cls[0])
            if classId != 0:  # skip non-person objects
                continue

            trackingID = int(box.id[0])
            if trackingID not in idToConfidence:
                idToConfidence[trackingID] = ("Unknown", 0.0)
            x1, y1, x2, y2 = map(int, box.xyxy[0])

            # Only apply face recognition every 10 frames
            if frame_count % 10 == 0:
                personImage = frame[y1:y2, x1:x2]
                rgbPersonImage = cv2.cvtColor(personImage, cv2.COLOR_BGR2RGB)
                encodings = face_recognition.face_encodings(rgbPersonImage)
                if not encodings:
                    continue

                faceEncoding = encodings[0]
                predictedPerson, confidence = recognizePerson(userFolderPath, faceEncoding)

                # Update tracking ID info
                if trackingID in idToConfidence:
                    _, existingConfidence = idToConfidence[trackingID]
                    if confidence > existingConfidence:
                        idToConfidence[trackingID] = (predictedPerson, confidence)
                else:
                    idToConfidence[trackingID] = (predictedPerson, confidence)
            # Draw bounding box and label (always use last known)
            predictedPerson, confidence = idToConfidence.get(trackingID, ("Unknown", 0.0))
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            label = f"{predictedPerson} ({confidence:.2f})"
            cv2.putText(frame, label, (x1, max(y1 - 10, 0)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        # Write frame to output video
        out.write(frame)
        frame_count += 1

    cap.release()
    out.release()
