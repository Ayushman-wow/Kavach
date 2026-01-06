import pandas as pd
import numpy as np

# Number of samples
n = 1200   # can increase if needed

# Generate realistic distributions
np.random.seed(42)
data = {
    "slope_angle_deg": np.random.randint(20, 80, n),
    "rainfall_mm_24h": np.random.randint(0, 200, n),
    "rock_strength_mpa": np.random.randint(20, 200, n),
    "seismic_events_24h": np.random.randint(0, 50, n),
    "soil_moisture_pct": np.random.randint(10, 100, n),
    "crack_width_mm": np.random.randint(0, 200, n),
    "mine_depth_m": np.random.randint(10, 800, n),
    "blasting_activity": np.random.randint(0, 2, n),
    "past_incidents": np.random.randint(0, 20, n)
}

df = pd.DataFrame(data)

# Weighted scoring for risk calculation
df["risk_score"] = (
    df["slope_angle_deg"]*0.18 +
    df["rainfall_mm_24h"]*0.16 +
    (200-df["rock_strength_mpa"])*0.20 +
    df["seismic_events_24h"]*0.14 +
    df["soil_moisture_pct"]*0.10 +
    df["crack_width_mm"]*0.12 +
    df["mine_depth_m"]*0.05 +
    df["past_incidents"]*0.03 +
    df["blasting_activity"]*5
)

# Normalize score to 0-100
df["risk_score"] = (df["risk_score"] - df["risk_score"].min()) / (df["risk_score"].max()-df["risk_score"].min()) * 100

# Categorize risk levels
def label(score):
    if score < 35: return "Low"
    elif score < 70: return "Medium"
    else: return "High"

df["risk_level"] = df["risk_score"].apply(label)

# Save to CSV
df.to_csv("rockfall_mine_dataset.csv", index=False)

print(df.head())
print("\nDataset Generated! Saved as rockfall_mine_dataset.csv")









