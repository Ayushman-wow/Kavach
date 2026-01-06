import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import joblib

# Load dataset
df = pd.read_csv("rockfall_mine_dataset.csv")

# Features & Target
X = df[['slope_angle_deg','rainfall_mm_24h','rock_strength_mpa',
       'seismic_events_24h','soil_moisture_pct','crack_width_mm',
       'mine_depth_m','blasting_activity','past_incidents']]
y = df['risk_level']

# Encode labels
encoder = LabelEncoder()
y_encoded = encoder.fit_transform(y)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
     X, y_encoded, test_size=0.2, random_state=42)

# Model Training
model = RandomForestClassifier(n_estimators=200)
model.fit(X_train, y_train)

# Test prediction
y_pred = model.predict(X_test)

# Evaluation
print("\nModel Accuracy:", accuracy_score(y_test, y_pred))
print("\nClassification Report:\n", classification_report(y_test, y_pred))

# Save model
joblib.dump(model,"rockfall_model.pkl")
joblib.dump(encoder,"label_encoder.pkl")
print("\nModel saved as rockfall_model.pkl & label_encoder.pkl")
