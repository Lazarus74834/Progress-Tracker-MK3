# Mk3 Progress Tracker Deployment Instructions

## Option 1: Deploy with Netlify (Recommended for Simplicity)

Netlify offers a simple, free hosting solution that's perfect for this application.

### Prerequisites:
- Git installed on your computer
- GitHub account (optional, but recommended)
- Netlify account (free)

### Steps:

1. **Create a GitHub repository** (if you don't already have one):
   - Go to github.com and sign in
   - Click the "+" icon in the top right and select "New repository"
   - Name your repository (e.g., "mk3-progress-tracker")
   - Make it public or private as you prefer
   - Click "Create repository"
   - Follow GitHub's instructions to push your code to the repository

2. **Deploy to Netlify**:
   - Sign up for a free Netlify account at netlify.com
   - From your Netlify dashboard, click "New site from Git"
   - Choose GitHub and authorize Netlify to access your repositories
   - Select your mk3-progress-tracker repository
   - Configure the build settings:
     - Build command: `cd client && npm install && npm run build`
     - Publish directory: `client/build`
   - Click "Deploy site"

3. **Configure environment variables** (if needed):
   - In Netlify dashboard, go to Site settings > Build & deploy > Environment
   - Add any required environment variables

Your site will be live at a Netlify URL (e.g., https://your-site-name.netlify.app).

## Option 2: Deploy with Heroku

Heroku provides a platform for easily deploying both the frontend and backend together.

### Prerequisites:
- Git installed on your computer
- Heroku account (free)
- Heroku CLI installed

### Steps:

1. **Create a Heroku app**:
   ```
   heroku login
   heroku create acf-progress-tracker
   ```

2. **Push to Heroku**:
   ```
   git add .
   git commit -m "Ready for deployment"
   git push heroku main
   ```
   
   If you're not using git yet, initialize it first:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. **Open the deployed app**:
   ```
   heroku open
   ```

Your app will be available at https://acf-progress-tracker.herokuapp.com (or whatever name you chose).

## Option 3: Local Network Deployment

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