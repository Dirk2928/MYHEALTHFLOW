import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import joblib
import json

print("=" * 50)
print("MyHealthFlow+ Lite - ML Model Training")
print("=" * 50)

data = [
    {"dizziness": 0, "fever": 0, "cough": 0, "headache": 1, "fatigue": 1,
     "age_group": "adult", "severity": 2, "duration_days": 1,
     "health_concern": "Mild - Rest advised"},
    {"dizziness": 0, "fever": 0, "cough": 1, "headache": 0, "fatigue": 0,
     "age_group": "adult", "severity": 1, "duration_days": 2,
     "health_concern": "Mild - Rest advised"},
    {"dizziness": 0, "fever": 0, "cough": 0, "headache": 0, "fatigue": 1,
     "age_group": "adult", "severity": 1, "duration_days": 1,
     "health_concern": "Mild - Rest advised"},
    {"dizziness": 1, "fever": 0, "cough": 0, "headache": 1, "fatigue": 0,
     "age_group": "adult", "severity": 2, "duration_days": 1,
     "health_concern": "Mild - Rest advised"},
    {"dizziness": 1, "fever": 1, "cough": 0, "headache": 0, "fatigue": 1,
     "age_group": "adult", "severity": 5, "duration_days": 3,
     "health_concern": "Moderate - Needs monitoring"},
    {"dizziness": 0, "fever": 1, "cough": 1, "headache": 1, "fatigue": 0,
     "age_group": "adult", "severity": 4, "duration_days": 2,
     "health_concern": "Moderate - Needs monitoring"},
    {"dizziness": 0, "fever": 1, "cough": 0, "headache": 1, "fatigue": 1,
     "age_group": "elderly", "severity": 3, "duration_days": 2,
     "health_concern": "Moderate - Needs monitoring"},
    {"dizziness": 1, "fever": 0, "cough": 0, "headache": 1, "fatigue": 1,
     "age_group": "adult", "severity": 4, "duration_days": 3,
     "health_concern": "Moderate - Needs monitoring"},
    {"dizziness": 1, "fever": 1, "cough": 1, "headache": 0, "fatigue": 0,
     "age_group": "elderly", "severity": 4, "duration_days": 3,
     "health_concern": "Moderate - Needs monitoring"},
    {"dizziness": 1, "fever": 1, "cough": 0, "headache": 1, "fatigue": 1,
     "age_group": "elderly", "severity": 8, "duration_days": 5,
     "health_concern": "Severe - Urgent referral"},
    {"dizziness": 1, "fever": 1, "cough": 1, "headache": 1, "fatigue": 1,
     "age_group": "elderly", "severity": 9, "duration_days": 7,
     "health_concern": "Severe - Urgent referral"},
    {"dizziness": 0, "fever": 1, "cough": 1, "headache": 1, "fatigue": 1,
     "age_group": "child", "severity": 7, "duration_days": 4,
     "health_concern": "Severe - Urgent referral"},
    {"dizziness": 1, "fever": 1, "cough": 1, "headache": 1, "fatigue": 1,
     "age_group": "elderly", "severity": 10, "duration_days": 7,
     "health_concern": "Severe - Urgent referral"},
    {"dizziness": 1, "fever": 0, "cough": 0, "headache": 1, "fatigue": 1,
     "age_group": "elderly", "severity": 6, "duration_days": 5,
     "health_concern": "Severe - Urgent referral"},
    {"dizziness": 0, "fever": 1, "cough": 1, "headache": 0, "fatigue": 0,
     "age_group": "child", "severity": 3, "duration_days": 2,
     "health_concern": "Moderate - Needs monitoring"},
    {"dizziness": 0, "fever": 0, "cough": 1, "headache": 0, "fatigue": 0,
     "age_group": "adult", "severity": 2, "duration_days": 3,
     "health_concern": "Mild - Rest advised"},
    {"dizziness": 1, "fever": 1, "cough": 0, "headache": 1, "fatigue": 1,
     "age_group": "adult", "severity": 6, "duration_days": 4,
     "health_concern": "Moderate - Needs monitoring"},
    {"dizziness": 1, "fever": 1, "cough": 1, "headache": 1, "fatigue": 0,
     "age_group": "child", "severity": 8, "duration_days": 5,
     "health_concern": "Severe - Urgent referral"},
    {"dizziness": 0, "fever": 0, "cough": 0, "headache": 1, "fatigue": 0,
     "age_group": "adult", "severity": 1, "duration_days": 1,
     "health_concern": "Mild - Rest advised"},
    {"dizziness": 1, "fever": 0, "cough": 1, "headache": 0, "fatigue": 1,
     "age_group": "elderly", "severity": 5, "duration_days": 4,
     "health_concern": "Moderate - Needs monitoring"},
]

df = pd.DataFrame(data)
print(f"\nDataset created with {len(df)} patient cases")
print(f"Health concern distribution:")
print(df['health_concern'].value_counts())

feature_columns = ['dizziness', 'fever', 'cough', 'headache', 'fatigue',
                   'age_group', 'severity', 'duration_days']

X = df[feature_columns].copy()
y = df['health_concern']

label_encoders = {}
for col in ['age_group']:
    le = LabelEncoder()
    X[col] = le.fit_transform(X[col])
    label_encoders[col] = le

print(f"\nFeature columns: {feature_columns}")
print(f"Unique health concerns: {y.unique().tolist()}")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print(f"\nTraining samples: {len(X_train)}")
print(f"Testing samples: {len(X_test)}")

model = DecisionTreeClassifier(
    max_depth=5,
    min_samples_split=2,
    random_state=42
)

model.fit(X_train, y_train)
print("\nModel training complete!")

accuracy = model.score(X_test, y_test)
print(f"\nModel Accuracy: {accuracy * 100:.1f}%")

importance = model.feature_importances_
print("\nFeature Importance:")
for name, imp in sorted(zip(feature_columns, importance), key=lambda x: x[1], reverse=True):
    bar = "█" * int(imp * 50)
    print(f"  {name:15s}: {imp:.3f} {bar}")

joblib.dump(model, 'model.pkl')
joblib.dump(label_encoders, 'encoders.pkl')

feature_info = {
    'feature_columns': feature_columns,
    'health_concerns': y.unique().tolist(),
    'accuracy': float(accuracy)
}

with open('feature_info.json', 'w') as f:
    json.dump(feature_info, f, indent=2)

print("\nModel saved to model.pkl")
print("Encoders saved to encoders.pkl")
print("Feature info saved to feature_info.json")
print("\nReady for API deployment!")