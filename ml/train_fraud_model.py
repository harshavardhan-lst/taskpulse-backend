import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import joblib

# Load dataset
df = pd.read_csv("fraud_dataset.csv")

X = df.drop("fraud", axis=1)
y = df["fraud"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model = xgb.XGBClassifier(
    n_estimators=200,
    max_depth=5,
    learning_rate=0.05,
    scale_pos_weight=(len(y_train) - sum(y_train)) / sum(y_train),  # handles imbalance
    use_label_encoder=False,
    eval_metric="logloss"
)

model.fit(X_train, y_train)

predictions = model.predict(X_test)

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, predictions))

print("\nClassification Report:")
print(classification_report(y_test, predictions))

joblib.dump(model, "fraud_model.pkl")
print("\nModel saved as fraud_model.pkl")