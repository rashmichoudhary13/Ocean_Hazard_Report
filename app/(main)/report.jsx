import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

// --- Hazard Types (from previous prompt) ---
// --- Hazards List ---
// ✅ Just edit this array to add/remove hazards
const hazardTypeNames = [
  "Oil Spill",
  "Plastic Pollution",
  "Coral Damage",
  "Illegal Fishing",
  "Chemical Spill",
  "Marine Debris",
  "Tsunami Risk",
  "Coastal Erosion",
];

// --- Auto-generate dropdown items ---
const hazardDropdownItems = hazardTypeNames.map((name) => ({
  label: name,
  value: name.toLowerCase().replace(/\s+/g, "_"),
}));


export default function Report() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedHazard, setSelectedHazard] = useState(null);
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // --- Pick Image with Camera Only (With Retake Option) ---
  const handlePickImage = async () => {
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
        // ✅ User clicked a proper photo
        setPhoto(result.assets[0].uri);
        photoSelected = true;
      } else {
        // ⚠️ User cancelled → show Retake option
        await new Promise((resolve) => {
          Alert.alert(
            "No Photo Captured",
            "Do you want to retake?",
            [
              {
                text: "Cancel",
                style: "cancel",
                onPress: () => resolve(false),
              },
              { text: "Retake", onPress: () => resolve(true) },
            ],
            { cancelable: false }
          );
        }).then((retry) => {
          if (!retry) {
            photoSelected = true; // exit loop if user cancels
          }
        });
      }
    }
  };

  // --- Get Location ---
  const handleGetLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access location denied!");
      return;
    }
    let loc = await Location.getCurrentPositionAsync({});
    setLocation({
      lat: loc.coords.latitude,
      lng: loc.coords.longitude,
    });
  };

  //---Date change---
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false); // close picker after selection
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // --- Submit ---
const handleSubmit = async () => {
  if (!selectedHazard) {
    alert("Please select a hazard type.");
    return;
  }
  if (!description.trim()) {
    alert("Please provide a description.");
    return;
  }

  const reportData = {
    hazardType: selectedHazard,
    description,
    location: location
      ? {
          type: "Point",
          coordinates: [location.lng, location.lat], // Mongo expects [lng, lat]
        }
      : null,
    mediaUrl: photo || "", // for now just sending local URI, later we upload to cloud
    date: date.toISOString().split("T")[0],
  };

  try {
    const response = await fetch("http://localhost:5000/reports", {
      // ⚠️ Use 10.0.2.2 for Android emulator
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reportData),
    });

    const data = await response.json();
    if (data.success) {
      console.log("✅ Report submitted:", data);
      setIsSubmitted(true);
    } else {
      Alert.alert("Error", "Failed to submit report.");
    }
  } catch (error) {
    console.error("❌ Error submitting:", error);
    Alert.alert("Error", "Could not submit report. Check connection.");
  }
};


  const handleReportAnother = () => {
    setIsSubmitted(false);
    setSelectedHazard(null);
    setDescription("");
    setPhoto(null);
    setLocation(null);
    setDate(new Date());
  };

  // --- Render Form ---
  const renderForm = () => (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 160 }}
      className="flex-1 bg-gradient-to-b from-cyan-50 to-cyan-200 p-6"
    >
      {/* Title Card */}
      <View className="bg-white/90 p-6 rounded-3xl shadow-xl border border-cyan-100">
        <Text className="text-3xl font-extrabold text-cyan-700 text-center">
          🌊 Ocean Hazard Report
        </Text>
        <Text className="text-base text-gray-600 mt-2 text-center">
          Help us track and respond to ocean hazards by reporting below.
        </Text>
      </View>

      {/* Hazard Type */}
      <View className="bg-white mt-6 p-5 rounded-2xl shadow-md border-l-4 border-cyan-500">
        <Text className="text-lg font-semibold text-cyan-800 mb-3">
          Hazard Type
        </Text>
        <DropDownPicker
          open={open}
          value={selectedHazard}
          items={hazardDropdownItems}
          setOpen={setOpen}
          setValue={setSelectedHazard}
          searchable={true}
          placeholder="Select a hazard type..."
          searchPlaceholder="Search hazards..."
          listMode="MODAL"
          style={{
            borderRadius: 12,
            borderColor: "#bae6fd",
            backgroundColor: "#f0f9ff",
          }}
          dropDownContainerStyle={{
            borderColor: "#bae6fd",
          }}
        />
      </View>

      {/* Location */}
      <View className="bg-white mt-6 p-5 rounded-2xl shadow-md border-l-4 border-cyan-500">
        <Text className="text-lg font-semibold text-cyan-800 mb-3">
          Location
        </Text>
        <TouchableOpacity
          onPress={handleGetLocation}
          className="flex-row items-center bg-cyan-50 p-4 rounded-xl"
        >
          <Feather name="map-pin" size={22} color="#0891b2" />
          <Text className="text-base text-gray-700 ml-3">
            {location
              ? `Lat: ${location.lat.toFixed(2)}, Lng: ${location.lng.toFixed(
                  2
                )}`
              : "Tap to use my location"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Description */}
      <View className="bg-white mt-6 p-5 rounded-2xl shadow-md border-l-4 border-cyan-500">
        <Text className="text-lg font-semibold text-cyan-800 mb-3">
          Description
        </Text>
        <TextInput
          placeholder="Describe the hazard (e.g., oil spill, dead fish, erosion)..."
          value={description}
          onChangeText={setDescription}
          multiline
          className="w-full bg-cyan-50 p-4 rounded-xl text-base h-28 text-gray-800 border border-cyan-200"
          placeholderTextColor="#94a3b8"
        />
      </View>

      {/* Photo */}
      <View className="bg-white mt-6 p-5 rounded-2xl shadow-md border-l-4 border-cyan-500">
        <Text className="text-lg font-semibold text-cyan-800 mb-3">Photo</Text>
        <TouchableOpacity
          onPress={handlePickImage}
          className="flex-row items-center justify-center bg-cyan-50 p-4 rounded-xl"
        >
          <Feather name="camera" size={22} color="#0891b2" />
          <Text className="text-base text-gray-700 ml-2">Upload a photo</Text>
        </TouchableOpacity>
        {photo && (
          <Image
            source={{ uri: photo }}
            className="w-full h-44 mt-4 rounded-xl border border-cyan-200"
            resizeMode="cover"
          />
        )}
      </View>

      {/* Date */}
      <View className="bg-white mt-6 p-5 rounded-2xl shadow-md border-l-4 border-cyan-500">
        <Text className="text-lg font-semibold text-cyan-800 mb-3">Date</Text>

        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          className="flex-row items-center bg-cyan-50 p-4 rounded-xl active:scale-95"
        >
          <Feather name="calendar" size={22} color="#0891b2" />
          <Text className="ml-2 text-base text-gray-700">
            {date.toISOString().split("T")[0]}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </View>

      {/* Submit */}
      <TouchableOpacity
        onPress={handleSubmit}
        className="w-full mt-4 bg-[#005f73] rounded-md"
      >
        <Text className="text-white text-center text-lg font-semibold py-3">
          Submit Report
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
  // --- Success Screen ---
  const renderSuccess = () => (
    <View className="flex-1 bg-cyan-100 items-center justify-center p-6">
      {/* Circle check icon */}
      <View className="w-32 h-32 rounded-full border-4 border-cyan-400 flex items-center justify-center bg-white shadow-lg">
        <Feather name="check" size={64} color="#06b6d4" />
      </View>

      {/* Title */}
      <Text className="text-2xl font-bold text-gray-800 mt-8">
        Report Submitted!
      </Text>

      {/* Subtitle */}
      <Text className="text-base text-gray-600 mt-3 text-center px-6">
        Thank you for helping keep oceans safe.
      </Text>

      {/* Report another */}
      <TouchableOpacity
        onPress={handleReportAnother}
        className="bg-cyan-500 mt-10 py-4 px-8 rounded-xl shadow-md"
        activeOpacity={0.8}
      >
        <Text className="text-white text-lg font-bold">
          Report Another Hazard
        </Text>
      </TouchableOpacity>

      {/* Wave background (non-interactive so it won't block touches) */}
      <View pointerEvents="none" className="absolute bottom-0 left-0 right-0">
        <Image
          source={require("../../assets/images/wave.png")}
          style={{ width: "100%", height: 160 }}
          resizeMode="cover"
        />
      </View>
    </View>
  );

  return isSubmitted ? renderSuccess() : renderForm();
}
