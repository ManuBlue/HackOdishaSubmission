# Project Title

## Description
This project is a web application that provides a dashboard for managing CCTV uploads, files, and settings. It includes user authentication and allows users to create models based on uploaded images.

## Features
- User registration and login
- Upload images for model creation
- Process videos and retrieve processed files
- View and manage uploaded images
- Sidebar navigation for easy access to different functionalities

## Technologies Used
- React for the frontend
- FastAPI for the backend
- MongoDB for data storage
- TypeScript for type safety
- JWT for authentication

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the client directory:
   ```
   cd client
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Running the Application
To run the application, you need to start both the frontend and backend servers.

### Frontend
1. Navigate to the client directory:
   ```
   cd client
   ```
2. Start the frontend server:
   ```
   npm start
   ```

### Backend
1. Navigate to the backend directory:
   ```
   cd backend
   ```
2. Start the backend server:
   ```
   uvicorn main:app --host 0.0.0.0 --port 8080 --reload
   ```

## API Endpoints
- **POST /register**: Register a new user
- **POST /login**: Authenticate a user
- **POST /addImages**: Upload images for a user
- **POST /processVideo**: Process a video file
- **GET /makeModel**: Create a model based on uploaded images
- **GET /getUserImageDetails**: Retrieve details of uploaded images
- **GET /getSpecificImage**: Retrieve a specific image

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or features.

## License
This project is licensed under the MIT License.