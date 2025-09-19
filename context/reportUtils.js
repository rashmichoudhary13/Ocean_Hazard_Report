// context/reportUtils.js
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Alert } from "react-native";

// --- Pick Image with Retake Option ---
export const pickImageWithCamera = async (setPhoto) => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    alert("Permission denied to access camera!");
    return;
  }

  let photoSelected = false;

  while (!photoSelected) {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
      photoSelected = true;
    } else {
      await new Promise((resolve) => {
        Alert.alert(
          "No Photo Captured",
          "Do you want to retake?",
          [
            { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
            { text: "Retake", onPress: () => resolve(true) },
          ],
          { cancelable: false }
        );
      }).then((retry) => {
        if (!retry) {
          photoSelected = true;
        }
      });
    }
  }
};

// --- Get Current Location ---
export const getCurrentLocation = async (setLocation) => {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    alert("Permission to access location denied!");
    return;
  }

  const loc = await Location.getCurrentPositionAsync({});
  setLocation({
    lat: loc.coords.latitude,
    lng: loc.coords.longitude,
  });
};
