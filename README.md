# HackOdishaSubmission
Project submitted for Hack Odisha 5.0

## Steps to Run

### Frontend
1. Navigate to root/frontend
2. Run:
   npm run dev

### Backend
1. Create a fresh Python 3.10 environment
2. Install dependencies:
   pip install -r root/requirements.txt
3. Navigate to root/backend/routes and run:
   uvicorn main:app

You can now access the website at:
http://localhost:5173

---

## Project Overview: Monitr – Advanced Security System Management

Security system management is traditionally a costly and resource-intensive process. With the rapid rise in urban populations worldwide, the demand for efficient, accurate, and reliable security solutions has grown significantly.

Our project, Monitr, is designed to address this challenge by providing a next-generation safety and surveillance system that makes monitoring safer, easier, and far more reliable for households, businesses, and large organizations.

---

## Limitations of Conventional Systems

- Traditional safety systems are often limited to motion detection, notifications, and alarm triggers.
- Such methods prove insufficient for long-term surveillance and effective security management, as they lack precision, adaptability, and the ability to distinguish between different individuals.

---

## Our Approach

- Object Tracking: Monitr employs the SORT algorithm to track individuals across video frames.
- Dynamic Identification: Each individual is assigned a unique ID, dynamically updated using our custom facial recognition model.
- Accuracy & Efficiency: This ensures precise, real-time identification, enabling users to monitor people consistently without the confusion of false alarms or duplicate detections.

---

## Key Advantages

- Incremental Learning: The model supports incremental learning, avoiding lengthy recomputations when new individuals are introduced.
- Proven Performance: Evaluated on the Labeled Faces in the Wild dataset, our system achieved an accuracy of 99.3%.
- Practical Use Cases:
  - Households: A reliable home security solution that recognizes family members and alerts homeowners about unknown visitors.
  - Small and Large Businesses: Enhanced access control, employee monitoring, and visitor management without relying only on ID cards or manual checks.
  - Institutions and Enterprises: Scalable surveillance for offices, campuses, and other facilities, helping distinguish between authorized personnel and strangers in real time.
- Confidence-Based Identification: Easily distinguish between known and unknown people using the model’s confidence score, with thresholds that can be set as needed.

---

## Implementation Challenges and Solutions

### 1. Real-Time Communication with WebSockets
- Getting WebSockets to work for real-time communication was tough.
- After a lot of effort, we finally managed to overcome the hurdles and make it stable.

### 2. Video Processing and Playback
- Making the video player work in the "VideoProcess output" wasn’t straightforward.
- At first, there didn’t seem to be any errors, which made it even more confusing.
- Turns out the problem was with the encoding format. The <video> tag wouldn’t play MP4 in our setup, so we had to re-encode everything into H.265 to get it running smoothly.

### 3. Machine Learning Model Development
- The hardest part by far was building an ML model that was fast, accurate, and supported partial fitting.
- First, we needed a way to represent faces as numbers. Using the face-recognition library, we converted each face into a 128-dimensional vector — basically the mathematical version of someone’s face.
- With that, we still had to figure out how to:
  - Classify people correctly
  - Decide if someone is a known person or a stranger (using a threshold)
  - Keep it efficient enough for real-time use
  - Allow updates without retraining everything from scratch

**Our Solution:**
- After trying out different options, we ended up with the SGDClassifier.
- It might look simple at first, but it checked all the boxes:
  - Very fast
  - Supports partial fitting (so we can keep adding new faces)
  - Outputs confidence scores (logits) that let us set thresholds for unknown vs known people
- When tested on the Labeled Faces in the Wild dataset, it reached an accuracy of 99.3%, which is super solid — even better than the human average.

---

## Conclusion

By integrating state-of-the-art tracking, facial recognition, and incremental learning, Monitr provides a robust, scalable, and cost-effective solution that simplifies surveillance tasks while making them significantly safer and more dependable for households, companies, and institutions alike.
