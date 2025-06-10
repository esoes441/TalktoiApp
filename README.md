# TalktoiApp
Guiding_app_visually_impaired_invidividuals / Talktoi
 
Aim of the Application

This project was developed to support visually impaired individuals in independently navigating their surroundings by detecting nearby objects and their directions.

How the application works?

About the projectThe mobile application captures voice commands from the user, converts them into text, and sends a frame from the device’s camera to the server.
On the server side, object detection and depth analysis are performed to determine the direction, and location information for the target object specified by the user is generated.
This information is then sent back to the mobile application and conveyed to the user through text-to-speech technology.

Technologies Setup
 
Environment: VS Code, 
Testing Environment: Android Studio + Physical Device,
Frontend Language: React Native CLI,
Backend Language: Python,
API Used: FastAPI,
Communication Protocol: HTTP,
Object Detection: YOLOv8,
Depth Estimation: Size of Scale,
Core Frontend Libraries: react-native-tts, react-native-stt

Evaluation of Project Success

We conducted the tests manually. The majority of the tests yielded successful results.
