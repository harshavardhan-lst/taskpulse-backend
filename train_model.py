import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib

# Generate simple dataset
np.random.seed(42)

X = []
y = []

for _ in range(500):
    task_length = np.random.randint(20, 500)
    score = np.random.randint(0, 100)

    fraud = 1 if (score > 95 and task_length < 50) else 0

    X.append([task_length, score])
    y.append(fraud)

X = np.array(X)
y = np.array(y)

model = RandomForestClassifier()
model.fit(X, y)

joblib.dump(model, "fraud_model.pkl")

print("fraud_model.pkl created successfully")