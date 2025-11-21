# Import libraries
import os
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import NearestNeighbors
from sklearn.metrics import silhouette_score
from kneed import KneeLocator
from fastapi import FastAPI
from pydantic import BaseModel
import seaborn as sns
import warnings

warnings.filterwarnings("ignore")
sns.set(style="whitegrid")

app = FastAPI()

# Load Data
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(BASE_DIR, "../data/Final.csv")

df = pd.read_csv(csv_path) 

print("\nPreview of data:")
#display(df.head())

#Data Cleaning
print("\nMissing values before cleaning:\n", df.isnull().sum())

# Convert to numeric where needed
for col in ['AQI', 'Temperature', 'RelativeHumidity', 'WindSpeed']:
    df[col] = pd.to_numeric(df[col], errors='coerce')

# Fill AQI missing with mean
df['AQI'] = df['AQI'].fillna(df['AQI'].mean())

print("\nMissing values after cleaning:\n", df.isnull().sum())

# Pydantic model for request
class ClusterRequest(BaseModel):
    country: str = None  # If None, cluster all countries

#Post Method
@app.post("/cluster")
def run_dbscan(req: ClusterRequest = None):
    #DBSCAN 
    all_results = []  # Store all country results

    for country, group in df.groupby("Country"):
        print(f"\n============================")
        print(f"Clustering for: {country}")
        print("============================")

        # Clean and ensure numeric
        for col in ['AQI', 'Temperature', 'RelativeHumidity', 'WindSpeed']:
            group[col] = pd.to_numeric(group[col], errors='coerce')

        group = group.dropna(subset=['AQI', 'Temperature', 'RelativeHumidity', 'WindSpeed'])

        # Select features (added Month and Season)
        X = group[['AQI', 'Temperature', 'RelativeHumidity', 'WindSpeed']].values

        # Normalize
        X_scaled = StandardScaler().fit_transform(X)


        # Find k-distance plot (for visual)
        neigh = NearestNeighbors(n_neighbors=10)
        nbrs = neigh.fit(X_scaled)
        distances, indices = nbrs.kneighbors(X_scaled)
        distances = np.sort(distances[:, -1])

        plt.figure(figsize=(6, 4))
        plt.plot(distances)
        plt.title(f"k-distance Graph for {country}")
        plt.xlabel("Points sorted by distance")
        plt.ylabel("10th nearest neighbor distance")
        plt.grid(True)
        #plt.show()



        knee = KneeLocator(range(len(distances)), distances, curve='convex', direction='increasing')
        eps_value = distances[knee.knee]
        print("Suggested eps:", eps_value)

        # Apply DBSCAN (you can tweak eps per country if needed)
        db = DBSCAN(eps=eps_value, min_samples=4)
        group['Cluster'] = db.fit_predict(X_scaled)

        # Show results
        print("\nCluster counts:")
        print(group['Cluster'].value_counts())

        print("\nAverage values per cluster:")
        print(group.groupby('Cluster')[['AQI', 'Temperature', 'RelativeHumidity', 'WindSpeed']].mean())

        labels = db.labels_
        # Evaluate clustering using Silhouette score
        silhouette_avg = silhouette_score(X_scaled, labels)

        print(f'Silhouette Score: {silhouette_avg:.2f}')

        # Identifying noise points (labeled as -1)
        n_noise = np.sum(labels == -1)
        print(f'Number of noise points: {n_noise}')

        # Visualize clusters (AQI vs Temperature)
        plt.figure(figsize=(8, 6))
        sns.scatterplot(data=group, x='Temperature', y='AQI', hue='Cluster', palette='tab10', s=30)
        plt.title(f"DBSCAN Clustering for {country} (AQI vs Temperature)")
        plt.xlabel("Temperature (°C)")
        plt.ylabel("AQI")
        plt.legend(title="Cluster")
        #plt.show()


        # Prepare JSON result per country
        country_result = {
            "country": country,
            "eps": float(eps_value),
            "silhouette_score": float(silhouette_avg),
            "noise_points": int(n_noise),
            "clusters": group[['AQI', 'Temperature', 'RelativeHumidity', 'WindSpeed', 'Cluster']].to_dict(orient='records')
        }

        all_results.append(country_result)

    return {"clusters": all_results}

'''
    # Save clustering results
    output_path = "ML/ML-result/DBSCAN_Result.csv"
    df.to_csv(output_path, index=False)
    print(f"Results saved to {output_path}")
'''
