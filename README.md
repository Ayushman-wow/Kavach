#Rockfall Prediction System for Open-Pit Mines
________________________________________
##Overview

Kavach is an Advanced Rockfall Prediction System designed to support safety assessment and risk monitoring in coal mines.
The system provides a dashboard-based interface where users can select a mine, adjust geotechnical parameters, and analyse rockfall risk scenarios using a Machine Learning model trained on a Kaggle dataset.
________________________________________
##Key Result

-	Interactive geotechnical risk assessment dashboard

-	Real-time adjustment of 8 active risk factors

-	Machine Learning–based rockfall risk prediction

-	Focus on worker safety, trend analysis, and emergency support
________________________________________
##System Architecture
The system follows a user-driven input → ML processing → risk prediction workflow.
##Input Features
The system takes eight input features, exactly as shown in the dashboard:
-	Slope Angle

-	Rainfall

-	Rock Strength
-	
-	Seismic Events
-	
-	Soil Moisture
-	
-	Crack Width
-	
-	Mine Depth
-	
-	Past Incidents
________________________________________
##Output Predictions

-	Rockfall risk assessment based on selected parameters

-   Risk trend indicators
________________________________________
##Project Structure
Kavach/
│
├── dataset/

│   └── kaggle_dataset.csv

├── model/

│   └── trained_model.pkl

├── dashboard/

│   └── app.py

├── database/

│   └── safety_data.db

├── visualizations/

│   └── risk_trends.png

├── requirements.txt

└── README.md
________________________________________
##Frontend:

React 18

Tailwind CSS for responsive and modern styling

In that data visualisation: chart.js, react-circular - progressbar 

Map - leaflet

Https client- Axios (for handling Api requests)

Pdf generation – jspdf


##Backend:

FastAPI (Python)

Server: Uvicorn

ML: Random Forest

scikit - learn (Model Training)

NumPy (Data Processing)

Env- python-dotenv

________________________________________

##Quick Start
1.	Clone the repository
2.	git clone https://github.com/your-username/Kavach.git
3.	Install required dependencies
4.	pip install -r requirements.txt
5.	Run the dashboard application
6.	python dashboard/app.py
7.	Select a mine and adjust parameters to analyze risk
   
Methodology

##Data Generation

-    Dataset is sourced from Kaggle

-	Contains records related to geotechnical and environmental conditions

-   Data fields directly correspond to the 8 dashboard input features
________________________________________
##Machine Learning Models

-	A supervised Machine Learning model is used

-	The model learns relationships between geotechnical parameters and rockfall risk
________________________________________
##Model Selection

-	Model selected based on stability and suitability for tabular geotechnical data

-	Emphasis on interpretability and consistent performance
________________________________________
##Performance Analysis

-	Model performance evaluated using standard regression metrics

-	Ensures reliable mapping between input parameters and predicted risk
________________________________________
##Physics Validation

-	Input parameters are grounded in geotechnical and physical relevance
-	
-	Factors such as slope angle, rainfall, and rock strength reflect real-world conditions
________________________________________
##Example Usage

-	Select Korba Mine

-	Increase rainfall and soil moisture value

-	Observe changes in predicted risk trend

-	Use insights for safety planning and monitoring
________________________________________
##Generated Files

-	Trained Machine Learning model (.pkl)

-	Risk trend visualizations

-	Safety and assessment logs
________________________________________
##Data Files

-	Kaggle dataset used for training

-	Processed feature files for model input
________________________________________
##Visualization

	- Risk trend graphs

-	Environmental condition summaries

-	Worker distribution views (dashboard-based)
________________________________________
##Documentation

-	README.md: This documentation file.
________________________________________
##Future Improvements

Short Term

-	Improved UI responsiveness

-	Enhanced risk visualization

Medium Term

-	Integration of real-time sensors

-	Advanced trend-based prediction
Long Term

-	Fully automated safety alert system
________________________________________
##Technical Requirements

-	Python, Pandas, NumPy, Scikit-learn

-	HTML5, CSS3, Javascript, Tailwind CSS, React.js

-	Fast API

-	Mongo DB
________________________________________
##System Architecture Diagram

<img width="940" height="592" alt="image" src="https://github.com/user-attachments/assets/ff845386-9acf-4f52-be7f-6eae1f276579" />
 UI Screenshots
 
<img width="1004" height="560" alt="image" src="https://github.com/user-attachments/assets/44a32956-c7a1-4be3-adac-82890fe4edd9" />

<img width="1004" height="610" alt="image" src="https://github.com/user-attachments/assets/acad63ea-ebf3-4337-a49f-607fe583b37b" />

<img width="1033" height="602" alt="image" src="https://github.com/user-attachments/assets/ec1839d3-fa42-453b-a838-b61bb268e4b7" />

<img width="1045" height="678" alt="image" src="https://github.com/user-attachments/assets/d7508cfc-e582-460f-ae95-079621961eae" />






