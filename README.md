AI-Powered Healthcare Diagnostic Tool
This project is an intelligent healthcare application that provides diagnostic predictions for multiple diseases based on user-inputted symptoms and health metrics. Built with Streamlit, it offers a user-friendly web interface that leverages several machine learning models to predict the likelihood of diseases like Diabetes, Heart Disease, and Parkinson's.

It serves as an excellent example of how AI can be applied in the healthcare domain to assist in preliminary diagnostics.

✨ Features
Multi-Disease Prediction: A unified system that can predict three different diseases.

User-Friendly Interface: A clean and interactive UI built with Streamlit, making it easy for users to input their data.

Trained ML Models: Utilizes pre-trained classification models for accurate predictions.

Easy to Deploy: As a Streamlit application, it can be easily deployed on various platforms.

🚀 Technologies Used
Web Framework: Streamlit

Machine Learning: Scikit-learn (for model building and training)

Data Manipulation: Pandas

Numerical Operations: NumPy

Model Persistence: Pickle

📂 Project Structure
healthcare/
│
├── saved_models/
│   ├── diabetes_model.sav
│   ├── heart_disease_model.sav
│   └── parkinsons_model.sav
│
├── dataset/
│   ├── diabetes.csv
│   ├── heart.csv
│   └── parkinsons.csv
│
├── predictive_system.py      # The main Streamlit application file
└── README.md                 # You are here!

saved_models/: Contains the pre-trained machine learning models for each disease.

dataset/: Contains the raw CSV data used to train the models.

predictive_system.py: The core Python script that runs the Streamlit web application.

⚙️ Getting Started
To run this project on your local machine, follow these steps.

Prerequisites
You need to have Python 3.7+ installed on your system.

Installation
Clone the repository:

Bash

git clone https://github.com/aimaniahub/healthcare.git
Navigate to the project directory:

Bash

cd healthcare
Install the required Python libraries:

Bash

pip install streamlit pandas numpy scikit-learn
Running the Application
Once the dependencies are installed, you can run the Streamlit application with a single command:

Bash

streamlit run predictive_system.py
This will start the application and open it in a new tab in your default web browser.

📈 How It Works
The user selects a disease from the dropdown menu in the sidebar.

A form specific to that disease appears, prompting the user to enter relevant health metrics (e.g., blood pressure, glucose level, age).

Upon submission, the application loads the corresponding pre-trained model from the saved_models/ directory.

The user's input is fed into the model, which then predicts whether the patient has the disease.

The result is displayed to the user in an easy-to-understand format.

🤝 Contributing
Contributions are always welcome! If you have ideas on how to improve the application or add predictions for new diseases, please feel free to fork the repository and submit a pull request.
