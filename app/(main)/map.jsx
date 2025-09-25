import * as Location from "expo-location";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from "react-native";
import MapView, { Circle, PROVIDER_DEFAULT, UrlTile } from "react-native-maps";
import { clusterReports } from "../../utils/MapHelpers";

const CLUSTER_DISTANCE_THRESHOLD = 0.5;
const INITIAL_LATITUDE_DELTA = 5.0;

const ZOOM_THRESHOLD = 0.5;

const MapLegend = () => (
    <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Hotspot Density</Text>
        <View style={styles.legendItem}>
            <View style={[styles.legendColorBox, { backgroundColor: "rgba(255, 69, 0, 0.7)" }]} />
            <Text style={styles.legendText}>Critical ({">"}40%)</Text>
        </View>
        <View style={styles.legendItem}>
            <View style={[styles.legendColorBox, { backgroundColor: "rgba(255, 209, 102, 0.7)" }]} />
            <Text style={styles.legendText}>Moderate (20-40%)</Text>
        </View>
        <View style={styles.legendItem}>
            <View style={[styles.legendColorBox, { backgroundColor: "rgba(255, 102, 179, 0.7)" }]} />
            <Text style={styles.legendText}>Low ({"<"}20%)</Text>
        </View>
    </View>
);

export default function Map() {
  const [region, setRegion] = useState(null);
  const [allReports, setAllReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentZoom, setCurrentZoom] = useState(INITIAL_LATITUDE_DELTA);

  useEffect(() => {
    // ... This useEffect is unchanged
    const initializeMap = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          alert("Permission to access location was denied");
          setLoading(false);
          return;
        }
        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        setRegion({
          latitude,
          longitude,
          latitudeDelta: INITIAL_LATITUDE_DELTA,
          longitudeDelta: INITIAL_LATITUDE_DELTA,
        });
        const API_URL = 'http://192.168.0.100:5000/reports';
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch reports.');
        const data = await response.json();
        setAllReports(data.reports);
      } catch (error) {
        console.error("Map initialization error:", error);
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };
    initializeMap();
  }, []);

  const reportClusters = useMemo(() => {
    if (allReports.length === 0) return [];
    return clusterReports(allReports, CLUSTER_DISTANCE_THRESHOLD);
  }, [allReports]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0891b2" />
        <Text style={styles.loadingText}>Loading reports...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={region}
        showsUserLocation={true}
        onRegionChangeComplete={(newRegion) => {
          setCurrentZoom(newRegion.latitudeDelta);
        }}
      >
        <UrlTile
          urlTemplate="https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=PSKKY9Cyh2izeQTNhuac"
          maximumZ={20}
        />

        {reportClusters.map((cluster) => {
          let radiusToRender;

          // 👇 Here is the new hybrid logic
          if (currentZoom > ZOOM_THRESHOLD) {
            // We are Zooned OUT: Use dynamic scaling to keep it visible
            radiusToRender = cluster.baseSize * currentZoom;
          } else {
            // We are Zoomed IN: Use the accurate, fixed radius
            radiusToRender = cluster.fixedRadius;
          }
          
          return (
            <Circle
              key={cluster.id}
              center={cluster.center}
              radius={radiusToRender}
              fillColor={cluster.color + 'B3'} 
              strokeColor={cluster.color}
              strokeWidth={1}
            />
          );
        })}
      </MapView>
      <MapLegend />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... your styles are the same
  container: { flex: 1 },
  map: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#0e7490',
  },
  legendContainer: {
    position: 'absolute',
    top: 60,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  legendTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  legendColorBox: {
    width: 15,
    height: 15,
    marginRight: 8,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 14,
  },
});