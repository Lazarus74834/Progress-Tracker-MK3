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

## Deployment Options

### Option 1: Deploy to Netlify (Easiest)

1. Create a free Netlify account at https://www.netlify.com/
2. Install Netlify CLI: `npm install -g netlify-cli`
3. Build the application: 
   ```
   cd client
   npm run build
   ```
4. Deploy with Netlify:
   ```
   netlify deploy
   ```
5. Follow the prompts and specify the `client/build` directory as your publish directory
6. Once you confirm everything looks correct, deploy to production:
   ```
   netlify deploy --prod
   ```

### Option 2: Deploy to Heroku

1. Create a free Heroku account at https://www.heroku.com/
2. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
3. Login to Heroku: `heroku login`
4. Create a new Heroku app: `heroku create acf-progress-tracker`
5. Add a Procfile to the root directory with: `web: npm start`
6. Push to Heroku:
   ```
   git add .
   git commit -m "Prepare for deployment"
   git push heroku master
   ```

### Option 3: Local Hosting (for Internal Network)

1. Build the client app:
   ```
   cd client
   npm run build
   ```
2. Install serve globally:
   ```
   npm install -g serve
   ```
3. Serve the application:
   ```
   serve -s build -l 3000
   ```
4. The app will be available at http://localhost:3000 or on your local network at http://your-ip-address:3000

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