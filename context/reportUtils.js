// context/reportUtils.js
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Alert } from "react-native";

// --- Time Validation Helper (Final Version with Filename Parsing) ---
const isMediaRecent = (asset) => {
  let timestampToValidate = null;

  if (asset.type === "video") {
    let creationTimestamp = asset.creationTime;

    // Normalize seconds to milliseconds if needed
    if (creationTimestamp && creationTimestamp < 100000000000) {
      creationTimestamp *= 1000;
    }

    if (creationTimestamp) {
      timestampToValidate = creationTimestamp;
    } else {
      // ✅ NEW: Fallback to parsing the filename if creationTime is missing
      const filename = asset.fileName || "";
      // Looks for a pattern like "VID_20250920_230540"
      const match = filename.match(/(\d{4})(\d{2})(\d{2})_?(\d{2})(\d{2})(\d{2})/);

      if (match) {
        console.log("Parsing timestamp from filename:", filename);
        // Creates a date string like "2025-09-20T23:05:40"
        const isoString = `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}`;
        const parsedDate = new Date(isoString);
        if (!isNaN(parsedDate.getTime())) {
          timestampToValidate = parsedDate.getTime();
        }
      }
    }

    // If both metadata and filename parsing fail, allow the video to avoid blocking the user.
    if (!timestampToValidate) {
      console.warn("Could not verify video timestamp from metadata or filename. Allowing video.");
      return true;
    }
  } else {
    // Image logic (remains the same)
    const exifDateString = asset.exif?.DateTimeOriginal;
    if (exifDateString) {
      const formattedString =
        exifDateString.substring(0, 10).replace(/:/g, "-") + "T" + exifDateString.substring(11);
      const parsedDate = new Date(formattedString);
      if (!isNaN(parsedDate.getTime())) {
        timestampToValidate = parsedDate.getTime();
      }
    }
    if (!timestampToValidate) {
      let creationTimestamp = asset.creationTime;
      if (creationTimestamp) {
        if (creationTimestamp < 100000000000) {
          creationTimestamp *= 1000;
        }
        timestampToValidate = creationTimestamp;
      }
    }
  }

  if (!timestampToValidate) {
    console.warn("Could not determine a valid timestamp for the image. Allowing it.");
    return true;
  }

  const oneHour = 60 * 60 * 1000;
  const now = Date.now();
  const mediaAge = now - new Date(timestampToValidate).getTime();

  return mediaAge <= oneHour;
};

// --- Reusable Alert ---
const showTimeLimitWarning = () => {
  Alert.alert(
    "Time Limit Exceeded",
    "The selected photo or video must have been created within the last hour."
  );
};

// --- Pick Image with Camera ---
export const pickImageWithCamera = async (setMedia) => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Permission Error", "Permission to access camera was denied.");
    return;
  }
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.7,
    exif: true,
  });
  if (!result.canceled) {
    const asset = result.assets[0];
    if (isMediaRecent(asset)) {
      setMedia({ uri: asset.uri, type: "image" });
    } else {
      showTimeLimitWarning();
    }
  }
};

// --- Pick Media from Library ---
export const pickMediaFromLibrary = async (setMedia) => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Permission Error", "Permission to access the media library was denied.");
    return;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    quality: 0.7,
    exif: true,
  });
  if (!result.canceled) {
    const asset = result.assets[0];
    if (isMediaRecent(asset)) {
      setMedia({ uri: asset.uri, type: asset.type || "image" });
    } else {
      showTimeLimitWarning();
    }
  }
};

// --- Get Current Location ---
export const getCurrentLocation = async (setLocation) => {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Permission Error", "Permission to access location was denied.");
    return;
  }
  const loc = await Location.getCurrentPositionAsync({});
  setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
};