# Mk3 Progress Tracker Backend

This is the backend server for the Mk3 Progress Tracker application, designed to process CSV data from Westminster and generate Excel reports for Army Cadet Force progression tracking.

## Deployment to Render.com

### Step 1: Create a Render Account
1. Sign up for a free account at [render.com](https://render.com)

### Step 2: Create a New Web Service
1. From your Render dashboard, click "New" and select "Web Service"
2. Connect your GitHub repository (or use the manual deploy option)
3. Configure the service:
   - **Name**: mk3-progress-tracker-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Step 3: Configure Environment Variables
1. Under your service settings, go to "Environment"
2. Add the following variables:
   - `NODE_ENV`: production
   - `PORT`: 10000 (Render will automatically assign a port)

### Step 4: Deploy
1. Click "Create Web Service"
2. Wait for the build and deployment to complete

Your backend will be available at a URL like: https://mk3-progress-tracker-backend.onrender.com

## Local Development

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run server
   ```

3. The server will run on port 5001 by default

## API Endpoints

### POST /api/process
- Processes a CSV file and returns structured data
- Requires a CSV file uploaded with the field name 'file'
- Returns JSON with processed data and Excel report

## Notes

- The backend is designed to process data in-memory with no persistent storage
- All processing of cadet data happens server-side for data security
- The server uses CORS to allow requests only from authorized frontend sources