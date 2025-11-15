# Mk3 Progress Tracker Deployment Instructions

## Option 1: Deploy with Render (Recommended)

Render offers free hosting with automatic deployments from GitHub.

### Prerequisites:
- Git installed on your computer
- GitHub account
- Render account (free at render.com)

### Steps:

1. **Create a GitHub repository** (if you don't already have one):
   - Go to github.com and sign in
   - Click the "+" icon in the top right and select "New repository"
   - Name your repository (e.g., "mk3-progress-tracker")
   - Make it public
   - Click "Create repository"
   - Push your code to the repository:
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin https://github.com/yourusername/mk3-progress-tracker.git
     git push -u origin main
     ```

2. **Deploy to Render**:
   - Sign up for a free Render account at render.com
   - From your Render dashboard, click "New +" and select "Web Service"
   - Connect your GitHub repository
   - Configure the service:
     - **Name**: acf-progress-tracker (or your choice)
     - **Environment**: Node
     - **Build Command**: `npm run build`
     - **Start Command**: `npm start`
     - **Instance Type**: Free

3. **Configure environment variables**:
   - In Render dashboard, go to your service > Environment
   - Add the following environment variables:
     - `NODE_ENV` = `production`
     - `FRONTEND_URL` = (your Render service URL, e.g., `https://acf-progress-tracker.onrender.com`)
     - `PORT` = `5001` (optional, Render sets this automatically)
   - Click "Save Changes"

4. **Deploy**:
   - Click "Manual Deploy" > "Deploy latest commit"
   - Wait for the build to complete
   - Your app will be live at your Render URL

### Automatic Deployments:
- Render automatically redeploys when you push to your main branch on GitHub

## Option 2: Local Network Deployment

For running on a local network (e.g., within a detachment).

### Prerequisites:
- Node.js installed on the server computer
- Basic knowledge of command line

### Steps:

1. **Build the client**:
   ```
   cd client
   npm run build
   ```

2. **Install the serve package**:
   ```
   npm install -g serve
   ```

3. **Start the server**:
   ```
   cd ..
   npm start
   ```

4. **Access the application**:
   - On the server machine: http://localhost:5001
   - From other computers on the same network: http://SERVER-IP-ADDRESS:5001

## Customization

### Logo Replacement:
- Replace the logo files in `/client/public/images/` with your own versions
- Keep the same filenames for easy replacement

### Theming:
- Color schemes can be adjusted in the Tailwind configuration file at `/client/tailwind.config.js`
- Individual component styling can be modified in their respective files in `/client/src/components/`

## Troubleshooting

### Common Issues:

1. **File Upload Errors**:
   - Ensure the CSV file is in the correct format as exported from Westminster
   - Check that the column headers match what the application expects

2. **Deployment Errors**:
   - Verify that all dependencies are correctly listed in package.json
   - Check for any environment variables that might be missing

3. **Display Issues**:
   - Clear your browser cache
   - Try a different browser
   - Ensure JavaScript is enabled

For additional help, consult the README.md file or contact the developer.