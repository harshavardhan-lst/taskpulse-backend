import pandas as pd
import numpy as np
np.random.seed(42)
data_size = 2000
scores = np.random.randint(0, 25, data_size)
time_taken = np.random.randint(10, 600, data_size)  # seconds
attempts = np.random.randint(1, 5, data_size)
# Fraud rule simulation
fraud = []
for i in range(data_size):
    if scores[i] > 20 and time_taken[i] < 30:
        fraud.append(1)
    elif attempts[i] > 3 and scores[i] > 18:
        fraud.append(1)
    else:
        fraud.append(0)
df = pd.DataFrame({
    "score": scores,
    "time_taken": time_taken,
    "attempts": attempts,
    "fraud": fraud
})
df.to_csv("fraud_dataset.csv", index=False)
print("Dataset generated!")