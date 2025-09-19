import React, { useEffect, useState } from "react";
import MapView, { PROVIDER_DEFAULT, Marker, UrlTile } from "react-native-maps";
import { StyleSheet, SafeAreaView, ActivityIndicator } from "react-native";
import * as Location from "expo-location";

export default function map() {
  const [region, setRegion] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    (async () => {
      // Ask permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      // Get current position
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setUserLocation({ latitude, longitude });
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    })();
  }, []);

  if (!region) {
    // While location is loading
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="blue" />
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
      >
        {/* ✅ MapTiler Streets tiles */}
        <UrlTile
          urlTemplate="https://api.maptiler.com/maps/bright/{z}/{x}/{y}.png?key=PSKKY9Cyh2izeQTNhuac"
          maximumZ={20}
        />

        {/* User marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="You are here"
            pinColor="blue"
          />
        )}
      </MapView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
