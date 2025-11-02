import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (confusion_matrix, classification_report,accuracy_score, precision_score, recall_score, f1_score)
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.decomposition import PCA

import warnings
from sklearn.metrics import classification_report
from sklearn.exceptions import UndefinedMetricWarning
warnings.filterwarnings("ignore", category=UndefinedMetricWarning)


df = pd.read_csv("ML/data/Final.csv")

# Ensure numeric
df['AQI'] = pd.to_numeric(df['AQI'], errors='coerce')

# Categorize AQI into categories
def categorize_aqi(aqi):
    if aqi <= 50:
        return 'Good'
    elif aqi <= 100:
        return 'Moderate'
    elif aqi <= 150:
        return 'Unhealthy for Sensitive Groups'
    elif aqi <= 200:
        return 'Unhealthy'
    elif aqi <= 300:
        return 'Very Unhealthy'
    else:
        return 'Hazardous'

df['AQI_Category'] = df['AQI'].apply(categorize_aqi)

features = ['Temperature', 'RelativeHumidity']
X = df[features]
y = df['AQI_Category']

#Split dataset for traing 80% and test 20%.
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

models = {
     "Logistic Regression": LogisticRegression(max_iter=1000),
     "KNN": KNeighborsClassifier(n_neighbors=5),
     "Random Forest Tree": RandomForestClassifier( n_estimators=100, max_depth=15, random_state=42)
}

trained_models = {}
for name, model in models.items():
    model.fit(X_train_scaled, y_train)
    trained_models[name] = model

for name, model in trained_models.items():
    y_pred = model.predict(X_test_scaled)
    print(f"\n {name} Performance:")
    print(f"Accuracy:  {accuracy_score(y_test, y_pred):.2f}")
    print(f"Precision: {precision_score(y_test, y_pred, average='weighted'):.2f}")
    print(f"Recall:    {recall_score(y_test, y_pred, average='weighted'):.2f}")
    print(f"F1-Score:  {f1_score(y_test, y_pred, average='weighted'):.2f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, zero_division=0))

    # Confusion Matrix
    cm = confusion_matrix(y_test, y_pred, labels=np.unique(y_test))
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='YlGnBu',
                xticklabels=np.unique(y_test),
                yticklabels=np.unique(y_test))
    plt.title(f"Confusion Matrix - {name}")
    plt.xlabel("Predicted")
    plt.ylabel("Actual")
    plt.xticks(rotation=45)
    plt.yticks(rotation=45)
    plt.tight_layout()
    plt.show()


feature1 = 'AQI'
feature2 ='Temperature'

# Fit the best model
best_model = trained_models['Random Forest Tree']
X_vis = df[[feature1, feature2]].dropna()
y_vis = df.loc[X_vis.index, 'AQI_Category']

scaler_vis = StandardScaler()
X_vis_scaled = scaler_vis.fit_transform(X_vis)

# Meshgrid for decision boundary
x_min, x_max = X_vis_scaled[:, 0].min() - 1, X_vis_scaled[:, 0].max() + 1
y_min, y_max = X_vis_scaled[:, 1].min() - 1, X_vis_scaled[:, 1].max() + 1
xx, yy = np.meshgrid(np.arange(x_min, x_max, 0.02),
                     np.arange(y_min, y_max, 0.02))

Z = best_model.predict(np.c_[xx.ravel(), yy.ravel()])
Z = pd.Categorical(Z).codes.reshape(xx.shape)

plt.figure(figsize=(10, 8))
sns.scatterplot(x=X_vis_scaled[:, 0], y=X_vis_scaled[:, 1], hue=y_vis, palette="viridis", edgecolor="k")
plt.contourf(xx, yy, Z, alpha=0.3, cmap='viridis')
plt.title("Random Forest AQI Category Classification (AQI vs Temperature)")
plt.xlabel(feature1)
plt.ylabel(feature2)
plt.tight_layout()
plt.show()


# Save classification results and model metrics
output_path = "ML/ML-result/Classification_Result.csv"

results = []
for name, model in trained_models.items():
    y_pred = model.predict(X_test_scaled)
    results.append({
        "Model": name,
        "Accuracy": accuracy_score(y_test, y_pred),
        "Precision": precision_score(y_test, y_pred, average='weighted'),
        "Recall": recall_score(y_test, y_pred, average='weighted'),
        "F1-Score": f1_score(y_test, y_pred, average='weighted')
    })

results_df = pd.DataFrame(results)
results_df.to_csv(output_path, index=False)
print(f"Classification results saved to {output_path}")

# Save predicted categories
df["Predicted_Category"] = trained_models['Random Forest Tree'].predict(scaler.transform(df[features]))
df.to_csv("ML/ML-result/Classification_Data.csv", index=False)
print("Classification data with predictions saved")

