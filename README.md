# Progress Tracker MK3

## Overview

Progress Tracker MK3 is a web application designed specifically for the Army Cadet Force (ACF) to process and visualize cadet progression through the Army Cadet Syllabus (ACS). It converts raw cadet achievement data into a color-coded Excel report, enabling instructors and administrators to efficiently track and assess cadet development across all star levels.

## Core Functionality

### 1. Data Processing

The application processes a CSV file containing:
- Cadet names (including rank)
- P-Numbers
- Subject achievements across all ACS subjects (DT, SAA, SH, NAV, FC, FA, EXP, PHYS, CE, MK, JCIC, SCIC, AT, CIS)

Each subject cell indicates the star level achieved (Basic, 1*, 2*, 3*, 4*).

### 2. Star Level Determination

The application determines each cadet's overall star level based on ACF requirements:

- **4-Star**: Requires at least 2 subjects completed at 4* level
- **3-Star**: Requires 7 mandatory subjects (DT, SAA, SH, FC, NAV, JCIC, AT) plus at least 2 optional modules
- **2-Star**: Requires 9 mandatory subjects (DT, SAA, SH, FC, NAV, EXP, FA, PHYS, CE)
- **1-Star**: Requires 11 mandatory subjects (DT, SAA, SH, FC, NAV, EXP, FA, CIS, PHYS, CE, AT)
- **Basic**: Requires 7 mandatory subjects (DT, SH, FC, NAV, EXP, FA, CIS, PHYS)
- **Recruit**: Default if no level is complete

### 3. Rank Extraction and Sorting

The application:
1. Extracts ranks from cadet names (e.g., "Cadet Sgt John Smith" → Rank: "Sgt", Name: "John Smith")
2. Recognizes all ACF ranks: LCpl, Cpl, Sgt, SSgt, CSM, RSM
3. Sorts cadets hierarchically:
   - First by star level (highest to lowest)
   - Then by rank within each star level (highest to lowest)
   - Finally alphabetically by name within each rank

### 4. Output Generation

The application generates:
1. An interactive preview in the web interface
2. A downloadable Excel file with:
   - Cadets grouped by star level (Master → 4* → 3* → 2* → 1* → Basic → Recruit)
   - Modern color-coded cells showing clear progression from Recruit to Master Cadet
   - Proper sorting within each group

### 5. Statistical Analysis

The application provides:
1. A count of cadets at each star level
2. Total number of cadets in the dataset
3. Percentage breakdown of cadets by star level

### 6. Progression Path Analysis

For each cadet, the application:
1. Identifies which subjects they need to complete to advance to the next star level
2. Generates a personalized "Progression Path" showing the shortest route to advancement
3. Highlights priority subjects based on their current progress

## Visual Design

### Modern Color Scheme

Progress Tracker MK3 uses a modern, visually distinct color progression:

- **Recruit**: Light slate (#E2E8F0)
- **Basic**: Pale yellow (#FEF9C3)
- **1-Star**: Mint green (#DCFCE7)
- **2-Star**: Sky blue (#DBEAFE)
- **3-Star**: Lavender (#EDE9FE)
- **4-Star**: Rose (#FBCFE8)
- **Master Cadet**: Gold gradient (#FEF3C7 to #F59E0B)

This color scheme provides a clear visual progression while maintaining readability and professional appearance.

## Technical Implementation

### Data Flow

1. **Upload**: User uploads a CSV file through the intuitive drag-and-drop interface
2. **Processing**: 
   - Application processes the CSV data
   - Extracts rank and name information
   - Determines overall star level for each cadet using ACF criteria
   - Analyzes progression paths and next steps for each cadet
   - Calculates statistical summaries
   - Sorts cadets by star level, rank, and name
3. **Preview**: Generates an interactive preview showing the processed data with color coding and statistical summary
4. **Download**: User downloads the formatted Excel report with both summary statistics and progression recommendations

### Key Algorithms

#### Star Level Determination

The algorithm:
1. Identifies which subjects each cadet has completed at each star level
2. Applies ACF-specific requirements for each star level
3. Assigns the highest star level for which all criteria are met

#### Progression Path Analysis

The application:
1. Compares each cadet's current achievements against requirements for the next star level
2. Identifies missing subjects required for advancement
3. Calculates the minimum number of subjects needed to reach the next level
4. Prioritizes subjects based on cadet's existing strengths and common progression paths

#### Statistical Analysis

The application automatically:
1. Counts cadets at each star level
2. Calculates percentages based on total cadets
3. Identifies trends in cadet progression

## Excel Output Format

The Excel file includes:

1. **Summary Sheet**: 
   - Total number of cadets
   - Count and percentage of cadets at each star level
   - Visual chart showing distribution

2. **Main Progress Sheet**:
   - Cadets grouped by star level
   - Color-coded subject achievements
   - Sorted by rank and name

3. **Progression Paths Sheet**:
   - For each cadet, lists subjects needed to reach the next star level
   - Prioritizes subjects in recommended order of completion

## Using Progress Tracker MK3

1. Open the Progress Tracker MK3 application
2. Upload a CSV file containing cadet data
3. Review the interactive preview with statistical summary
4. Explore the progression analysis to identify focus areas
5. Download the comprehensive Excel report

The final Excel report provides a clear visual representation of each cadet's progress, enabling instructors to quickly identify cadets ready for advancement and those who may need additional support in specific subject areas. The progression path analysis serves as a valuable planning tool for instructors to guide each cadet's development effectively.

Stack Overview
To host Progress Tracker MK3 on Heroku with React.js for the frontend and Express.js for the backend, we'll use the following technology stack:

Frontend: React.js with modern UI libraries
Backend: Express.js on Node.js
Deployment: Heroku Platform
File Processing: Multer for file uploads, xlsx/csv-parser for data processing
Database (optional): PostgreSQL or MongoDB for saving historical data

Architecture
The application will follow a modern client-server architecture:

React Frontend:

Single-page application with responsive design
Drag-and-drop file upload interface
Interactive data visualization components
Progress statistics dashboard
Cadet progression path analysis view


Express Backend:

RESTful API endpoints for file processing
Business logic for star level determination
Statistical analysis services
Excel file generation