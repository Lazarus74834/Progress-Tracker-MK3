# Mk3 Progress Tracker for Army Cadet Force

A web application for tracking cadet progression through the Army Cadet Force star levels system.

## Features

- Upload cadet data CSV exported from Westminster
- Automatic determination of star levels achieved
- Toggle between "Achieved Level" and "Training Level" views
- Detailed progress tracking for each cadet
- Color-coded visualization of progression
- Summary statistics and charts
- Excel report generation
- Responsive design for desktop and mobile

## Deployment Guide

### Recommended Approach: Split Deployment (Frontend on Netlify, Backend on Render)

This application is set up as a split deployment with:
- Frontend on Netlify (for fast static hosting)
- Backend on Render (for server processing)

#### Step 1: Deploy the Backend to Render

1. Create a free account at https://render.com
2. From your dashboard, click "New" and select "Web Service"
3. Connect your repository or use "Deploy from existing repository"
4. Configure the service:
   - **Name**: mk3-progress-tracker-backend
   - **Root Directory**: server (if your repo has the server folder)
   - **Environment**: Node
   - **Build Command**: npm install
   - **Start Command**: npm start
   - **Plan**: Free

5. Add environment variables:
   - `NODE_ENV`: production
   - `PORT`: 10000 (Render will automatically assign a port)

6. Click "Create Web Service" and wait for deployment
7. Note your backend URL (e.g., https://mk3-progress-tracker-backend.onrender.com)

#### Step 2: Deploy the Frontend to Netlify

1. Create a free account at https://www.netlify.com/
2. Install Netlify CLI: `npm install -g netlify-cli`
3. Update the backend URL in `.env.production`:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   ```
4. Build the frontend: 
   ```
   cd client
   npm run build
   ```
5. Deploy to Netlify:
   ```
   netlify deploy --dir=build
   ```
6. After testing the draft URL, deploy to production:
   ```
   netlify deploy --prod --dir=build
   ```

### Alternative Options

#### Option 1: Deploy Everything to Heroku

1. Create a free Heroku account at https://www.heroku.com/
2. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
3. Login to Heroku: `heroku login`
4. Create a new Heroku app: `heroku create acf-progress-tracker`
5. Push to Heroku:
   ```
   git add .
   git commit -m "Prepare for deployment"
   git push heroku main
   ```

#### Option 2: Local Hosting (for Internal Network)

1. Build the client app:
   ```
   cd client
   npm run build
   ```
2. Start the server (which will serve both API and static files):
   ```
   cd ..
   npm start
   ```
3. The app will be available at http://localhost:5001 or on your local network at http://your-ip-address:5001

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   cd client
   npm install
   cd ..
   ```
3. Start development server:
   ```
   npm run dev
   ```

## Usage Guide

1. Log in to Westminster
2. Navigate to: Personnel → Cadet Qualifications → ACF Star Awards
3. Select: All Subjects (ACS)
4. Click: Actions → Download → Download as CSV
5. Upload the CSV file to the Progress Tracker
6. Use the toggle switch to view Achieved Levels or Training Levels
7. Download the generated Excel report for offline use

## Created By

SSI Jacob Berry
Chelmsford Detachment Commander
B (EY) Company, Essex ACF

© Army Cadet Force. All rights reserved.