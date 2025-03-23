# Progress Tracker MK3 - Build and Run Instructions

This document provides instructions for building and running the Progress Tracker MK3 application.

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

## Local Development Setup

1. Clone or download the repository

2. Install server dependencies:
   ```
   npm install
   ```

3. Install client dependencies:
   ```
   cd client
   npm install
   cd ..
   ```

4. Start the development server (both client and server):
   ```
   npm run dev
   ```

   This will run both the frontend React application and the backend Express server concurrently.
   - The React frontend will be available at http://localhost:3000
   - The Express backend will be running on http://localhost:5000

## Using the Application

1. Once the application is running, open your browser to http://localhost:3000

2. Upload a CSV file with cadet data. The file should include:
   - Name (including rank)
   - P-Number
   - Subject achievements (DT, SAA, SH, etc.)

   A sample CSV file is provided in sample_data.csv at the root of the project.

3. The application will process the data and display:
   - A statistical summary
   - An interactive color-coded progress table
   - An option to download an Excel report

## Production Deployment

For deployment to Heroku:

1. Create a Heroku account and install the Heroku CLI

2. Log in to Heroku:
   ```
   heroku login
   ```

3. Create a Heroku app:
   ```
   heroku create mk3-progress-tracker
   ```

4. Deploy to Heroku:
   ```
   git push heroku main
   ```

The application includes all the necessary configuration for Heroku deployment in the package.json file.

## Project Structure

- `/client`: React frontend application
- `/server`: Express backend application
- `/uploads`: Directory where uploaded files are stored temporarily

## Additional Notes

- The application processes cadet data according to Army Cadet Force (ACF) progression criteria
- Star levels are determined based on the specific subject requirements outlined in the README.md
- The Excel output includes color-coding for easy visual identification of progress