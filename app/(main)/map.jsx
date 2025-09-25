import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useEffect, useMemo, useState, useRef } from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Animated } from "react-native";
import MapView, { Marker, Callout, Heatmap, Circle, PROVIDER_DEFAULT, UrlTile } from "react-native-maps";
import { clusterReports } from "../../utils/MapHelpers";

// --- Configuration ---
const MAPTILER_API_KEY = 'PSKKY9Cyh2izeQTNhuac'; 
const API_URL = 'http://192.168.0.101:5000/reports'; 

const CLUSTER_DISTANCE_THRESHOLD = 0.8;
const ZOOM_IN_THRESHOLD = 4.0; // Zoom level to switch from clusters to markers
const DETAILED_MARKER_THRESHOLD = 1.0; // ✅ Zoom level to switch to detailed markers

const mapStyles = {
  hybrid: `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${MAPTILER_API_KEY}`,
  streets: `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`,
  satellite: `https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=${MAPTILER_API_KEY}`,
  dark: `https://api.maptiler.com/maps/dataviz-dark/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`,
};

// --- Helper Functions ---
const getSeverity = (hazard) => {
  const high = ['Tsunami', 'High Waves', 'Swell Surges'];
  if (high.includes(hazard.hazardType)) return { level: 'High', color: '#DC2626' };
  return { level: 'Medium', color: '#D97706' };
};

const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

// --- Optimized Marker Components ---

// ✅ A simpler marker for when the user is zoomed out
const SimpleMarker = ({ hazard }) => {
    const severity = getSeverity(hazard);
    return (
        <View style={[styles.simpleMarker, { backgroundColor: severity.color }]} />
    );
};

const PulsingMarker = ({ hazard }) => {
    const scaleValue = useRef(new Animated.Value(1)).current;
    const severity = getSeverity(hazard);

    useEffect(() => {
        if (severity.level === 'High') {
            const animation = Animated.loop(
                Animated.sequence([
                    Animated.timing(scaleValue, { toValue: 1.4, duration: 1000, useNativeDriver: true }),
                    Animated.timing(scaleValue, { toValue: 1, duration: 1000, useNativeDriver: true }),
                ])
            );
            animation.start();
            return () => animation.stop();
        }
    }, [severity.level, scaleValue]);

    return (
        <View style={styles.markerContainer}>
            {severity.level === 'High' && (
                <Animated.View style={[styles.markerPulse, { backgroundColor: severity.color, transform: [{ scale: scaleValue }] }]} />
            )}
            <View style={[styles.markerCore, { backgroundColor: severity.color }]}>
                <MaterialCommunityIcons name="waves" size={16} color="white" />
            </View>
            {hazard.verified && (
                <View style={styles.markerBadge}>
                    <MaterialCommunityIcons name="shield-check" size={12} color="white" />
                </View>
            )}
        </View>
    );
};

// --- Main Map Component ---
export default function MapScreen() {
  const [region, setRegion] = useState(null);
  const [hazards, setHazards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetchingData, setIsFetchingData] = useState(true); // ✅ New state for data fetching
  const [mapType, setMapType] = useState('hybrid');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [filters, setFilters] = useState({ severity: 'all', verified: 'all' });
  const [currentZoomDelta, setCurrentZoomDelta] = useState(15);
  const [showControls, setShowControls] = useState(false);
  const mapRef = useRef(null);
  
  // ✅ Step 1: Initialize map and location FIRST for instant load
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') throw new Error('Location permission denied');
        
        // Default to India view if location is not found quickly
        const initialRegion = {
          latitude: 20.5937,
          longitude: 78.9629,
          latitudeDelta: 15,
          longitudeDelta: 15,
        };
        setRegion(initialRegion);

      } catch (error) {
        console.error("Location initialization error:", error);
        alert(error.message);
      } finally {
        setLoading(false); // Map is ready to be shown
      }
    };
    initializeLocation();
  }, []);

  // ✅ Step 2: Fetch data in the background AFTER map is visible
  useEffect(() => {
    const fetchHazards = async () => {
        setIsFetchingData(true);
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch reports.');
            const data = await response.json();
            setHazards(data.reports || []);
        } catch (error) {
            console.error("Failed to fetch hazard data:", error);
        } finally {
            setIsFetchingData(false);
        }
    };
    if (!loading) { // Only fetch data once the map is ready
        fetchHazards();
    }
  }, [loading]);

  const filteredHazards = useMemo(() => {
    return hazards.filter(h => {
        const severity = getSeverity(h).level.toLowerCase();
        const matchesSeverity = filters.severity === 'all' || filters.severity === severity;
        const matchesVerified = filters.verified === 'all' || (filters.verified === 'verified' && h.verified) || (filters.verified === 'unverified' && !h.verified);
        return matchesSeverity && matchesVerified;
    });
  }, [hazards, filters]);
  
  const reportClusters = useMemo(() => {
      return clusterReports(filteredHazards, CLUSTER_DISTANCE_THRESHOLD);
  }, [filteredHazards]);

  // ✅ Step 3: Render only VISIBLE markers based on the current map region
  const visibleHazards = useMemo(() => {
      if (!region || currentZoomDelta > ZOOM_IN_THRESHOLD) {
          return [];
      }
      const bounds = {
          north: region.latitude + region.latitudeDelta / 2,
          south: region.latitude - region.latitudeDelta / 2,
          east: region.longitude + region.longitudeDelta / 2,
          west: region.longitude - region.longitudeDelta / 2,
      };
      return filteredHazards.filter(h => {
          const lat = h.location.coordinates[1];
          const lon = h.location.coordinates[0];
          return lat > bounds.south && lat < bounds.north && lon > bounds.west && lon < bounds.east;
      });
  }, [filteredHazards, region, currentZoomDelta]);


  const heatmapPoints = useMemo(() => 
    filteredHazards.map(h => ({
      latitude: h.location.coordinates[1],
      longitude: h.location.coordinates[0],
      weight: getSeverity(h).level === 'High' ? 1.0 : 0.5,
    })), [filteredHazards]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0891b2" />
        <Text style={styles.loadingText}>Initializing Map...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={region}
        showsUserLocation={true}
        mapType="none"
        onRegionChangeComplete={(newRegion) => {
            setRegion(newRegion); // Update region for viewport filtering
            setCurrentZoomDelta(newRegion.latitudeDelta);
        }}
      >
        <UrlTile urlTemplate={mapStyles[mapType]} maximumZ={19} />

        {showHeatmap ? (
            <Heatmap points={heatmapPoints} radius={40} opacity={0.8} />
        ) : currentZoomDelta > ZOOM_IN_THRESHOLD ? (
            reportClusters.map(cluster => (
                <Circle
                    key={cluster.id}
                    center={cluster.center}
                    radius={cluster.fixedRadius}
                    fillColor={cluster.color + '99'}
                    strokeColor={cluster.color}
                    strokeWidth={1.5}
                />
            ))
        ) : (
            // ✅ Render only visible hazards, and choose marker type by zoom
            visibleHazards.map((hazard) => (
                <Marker key={hazard._id} coordinate={{ latitude: hazard.location.coordinates[1], longitude: hazard.location.coordinates[0] }} tracksViewChanges={false}>
                    {currentZoomDelta < DETAILED_MARKER_THRESHOLD ? (
                         <PulsingMarker hazard={hazard} />
                    ) : (
                         <SimpleMarker hazard={hazard} />
                    )}
                    <Callout tooltip>
                        <View style={styles.calloutContainer}>
                            <Text style={styles.calloutTitle}>{hazard.hazardType}</Text>
                            <Text style={styles.calloutDescription}>{hazard.description}</Text>
                            <View style={styles.calloutFooter}>
                                <Text style={styles.calloutTime}>{formatTimeAgo(hazard.createdAt)}</Text>
                                <Text style={[styles.calloutSeverity, { color: getSeverity(hazard).color }]}>{getSeverity(hazard).level}</Text>
                            </View>
                        </View>
                    </Callout>
                </Marker>
            ))
        )}
      </MapView>
      
      {/* --- UI Panels (Unchanged) --- */}
      <TouchableOpacity onPress={() => setShowControls(!showControls)} style={styles.filterFab}>
        <MaterialCommunityIcons name="filter-variant" size={24} color="white" />
      </TouchableOpacity>

      {showControls && (
        <View style={styles.controlsContainer}>
          <View style={styles.controlHeader}>
            <Text style={styles.controlHeaderText}>Map Controls</Text>
            <TouchableOpacity onPress={() => setShowControls(false)}>
              <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <View style={styles.controlGroup}>
              <Text style={styles.controlTitle}>Map Style</Text>
              <View style={styles.buttonGroup}>
                  {Object.keys(mapStyles).map(type => (
                      <TouchableOpacity key={type} onPress={() => setMapType(type)} style={[styles.styleButton, mapType === type && styles.styleButtonActive]}>
                          <Text style={[styles.styleButtonText, mapType === type && styles.styleButtonTextActive]}>{type.charAt(0).toUpperCase()}</Text>
                      </TouchableOpacity>
                  ))}
              </View>
          </View>
          <View style={styles.controlGroup}>
              <Text style={styles.controlTitle}>View</Text>
              <TouchableOpacity onPress={() => setShowHeatmap(!showHeatmap)} style={styles.toggleButton}>
                  <MaterialCommunityIcons name={showHeatmap ? "map-marker-multiple" : "gradient-vertical"} size={20} color="#333" />
                  <Text style={styles.toggleButtonText}>{showHeatmap ? 'Show Markers' : 'Show Heatmap'}</Text>
              </TouchableOpacity>
          </View>
          <View style={styles.controlGroup}>
              <Text style={styles.controlTitle}>Filters</Text>
              <View style={styles.filterRow}>
                  <Text style={styles.filterLabel}>Severity</Text>
                  <View style={styles.buttonGroup}>
                      {['all', 'high', 'medium'].map(s => (
                          <TouchableOpacity key={s} onPress={() => setFilters(f => ({...f, severity: s}))} style={[styles.filterButton, filters.severity === s && styles.filterButtonActive]}>
                              <Text style={[styles.filterButtonText, filters.severity === s && styles.filterButtonTextActive]}>{s}</Text>
                          </TouchableOpacity>
                      ))}
                  </View>
              </View>
              <View style={styles.filterRow}>
                  <Text style={styles.filterLabel}>Status</Text>
                  <View style={styles.buttonGroup}>
                      {['all', 'verified', 'unverified'].map(s => (
                          <TouchableOpacity key={s} onPress={() => setFilters(f => ({...f, verified: s}))} style={[styles.filterButton, filters.verified === s && styles.filterButtonActive]}>
                              <Text style={[styles.filterButtonText, filters.verified === s && styles.filterButtonTextActive]}>{s}</Text>
                          </TouchableOpacity>
                      ))}
                  </View>
              </View>
          </View>
        </View>
      )}

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
            <Text style={styles.statValue}>{filteredHazards.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statItem}>
            <Text style={[styles.statValue, {color: '#DC2626'}]}>{filteredHazards.filter(h => getSeverity(h).level === 'High').length}</Text>
            <Text style={styles.statLabel}>High Priority</Text>
        </View>
      </View>
      
      {/* ✅ Data Fetching Indicator */}
      {isFetchingData && (
          <View style={styles.fetchingIndicator}>
              <ActivityIndicator size="small" color="#0284C7" />
              <Text style={styles.fetchingText}>Fetching latest reports...</Text>
          </View>
      )}
    </SafeAreaView>
  );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f9ff' },
    map: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f9ff' },
    loadingText: { marginTop: 10, fontSize: 16, color: '#0e7490' },
    markerContainer: { alignItems: 'center', justifyContent: 'center' },
    markerCore: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: 'white', alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 2 },
    markerPulse: { position: 'absolute', width: 28, height: 28, borderRadius: 14, opacity: 0.3 },
    markerBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#10B981', borderRadius: 8, padding: 1, borderWidth: 1, borderColor: 'white' },
    simpleMarker: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, borderColor: 'white', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1 },
    calloutContainer: { backgroundColor: 'white', borderRadius: 10, padding: 15, width: 250, borderWidth: 1, borderColor: '#ddd' },
    calloutTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 5 },
    calloutDescription: { fontSize: 12, color: '#4B5563', marginBottom: 10 },
    calloutFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    calloutTime: { fontSize: 10, color: '#6B7280' },
    calloutSeverity: { fontSize: 10, fontWeight: 'bold' },
    filterFab: { position: 'absolute', top: 60, right: 10, backgroundColor: '#3B82F6', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, },
    controlsContainer: { position: 'absolute', top: 120, right: 10, backgroundColor: 'rgba(255, 255, 255, 0.98)', borderRadius: 12, padding: 15, width: 220, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
    controlHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingBottom: 10, marginBottom: 10, },
    controlHeaderText: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
    controlGroup: { marginBottom: 10 },
    controlTitle: { fontSize: 12, fontWeight: 'bold', color: '#4B5563', marginBottom: 5, textTransform: 'uppercase' },
    buttonGroup: { flexDirection: 'row', justifyContent: 'space-between' },
    styleButton: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, backgroundColor: '#E5E7EB' },
    styleButtonActive: { backgroundColor: '#0284C7' },
    styleButtonText: { fontSize: 12, fontWeight: 'bold', color: '#374151' },
    styleButtonTextActive: { color: 'white' },
    toggleButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', padding: 8, borderRadius: 8 },
    toggleButtonText: { marginLeft: 8, fontWeight: '500', color: '#1F2937' },
    filterRow: { marginBottom: 8 },
    filterLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
    filterButton: { flex: 1, paddingVertical: 5, borderRadius: 6, backgroundColor: '#E5E7EB', marginHorizontal: 2 },
    filterButtonActive: { backgroundColor: '#3B82F6' },
    filterButtonText: { fontSize: 10, color: '#374151', textAlign: 'center', textTransform: 'capitalize' },
    filterButtonTextActive: { color: 'white' },
    statsContainer: { position: 'absolute', top: 60, left: 10, backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 12, padding: 10, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
    statItem: { alignItems: 'center', marginBottom: 8 },
    statValue: { fontSize: 24, fontWeight: 'bold', color: '#0284C7' },
    statLabel: { fontSize: 12, color: '#4B5563' },
    fetchingIndicator: { position: 'absolute', top: 60, left: '50%', transform: [{ translateX: -100 }], width: 200, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: 8, borderRadius: 12, elevation: 6 },
    fetchingText: { marginLeft: 8, color: '#0284C7', fontWeight: '500' },
});