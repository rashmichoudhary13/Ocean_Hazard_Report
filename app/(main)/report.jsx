import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Video } from "expo-av"; // 👈 1. Import Video component
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

// utils + service
import { useAuth } from "../../context/AuthContext";
import { submitReport } from "../../context/reportService";
import {
  // 👈 2. Import the new pickMediaFromLibrary function
  getCurrentLocation,
  pickImageWithCamera,
  pickMediaFromLibrary,
} from "../../context/reportUtils";

// --- Hazards ---
// ✅ Corrected this array to EXACTLY match the backend's enum list
const hazardTypeNames = [
  "Unusual Tides",
  "Flooding",
  "Coastal damage", // <-- Corrected capitalization
  "High Waves",
  "Swell Surges",
  "Abnormal Sea Behaviour",
  "Tsunami",
];

// ✅ Changed 'value' to be the name itself, not the formatted version
const hazardDropdownItems = hazardTypeNames.map((name) => ({
  label: name,
  value: name, // <-- This is the fix
}));

export default function Report() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedHazard, setSelectedHazard] = useState(null);
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  // 👇 3. Replace 'photo' state with a unified 'media' state
  const [media, setMedia] = useState(null); // Will store { uri: '...', type: 'image' | 'video' }
  const [location, setLocation] = useState(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // --- Submit Report ---
  const handleSubmit = async () => {
    if (!selectedHazard || !description.trim()) {
      Alert.alert(
        "Validation Error",
        "Please select a hazard type and provide a description."
      );
      return;
    }
    if (!location) {
      Alert.alert(
        "Validation Error",
        "Please provide a location for the report."
      );
      return;
    }

    const formData = new FormData();
    formData.append("latitude", location.lat);
    formData.append("longitude", location.lng);
    formData.append("hazardType", selectedHazard);
    formData.append("description", description);

    // 👇 Append media if present
    if (media) {
      const uriParts = media.uri.split(".");
      const fileType = uriParts[uriParts.length - 1];
      formData.append("media", {
        uri: media.uri,
        name: `${media.type}_${Date.now()}.${fileType}`,
        type: `${media.type}/${fileType}`, // Works for both image/video
      });
    }

    try {
      if (!user) {
        Alert.alert(
          "Authentication Error",
          "You must be logged in to submit a report."
        );
        return;
      }

      const token = await user.getIdToken();
      const responseData = await submitReport(formData, token);

      if (responseData && responseData._id) {
        setIsSubmitted(true);
        Alert.alert(
          "Success",
          "Report submitted successfully! Image classified as matching."
        ); // ✅ Green success message
      } else {
        // ✅ Display backend error if available
        Alert.alert(
          "Error",
          responseData.error || "Failed to submit report. Please try again."
        );
      }
    } catch (err) {
      // ✅ Parse error from backend (400, etc.)
      let errorMessage =
        "Could not submit report. Check your connection or try again.";
      if (err.response && err.response.data && err.response.data.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      Alert.alert("Submission Failed", errorMessage); // ❌ Red error message
      console.error("Submission Error:", err);
    }
  };

  const handleReportAnother = () => {
    setIsSubmitted(false);
    setSelectedHazard(null);
    setDescription("");
    setMedia(null); // 👈 5. Reset the new media state
    setLocation(null);
    setDate(new Date());
  };

  // --- UI ---
  const renderForm = () => (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 160 }}
      className="flex-1 bg-gradient-to-b from-cyan-50 to-cyan-200 p-6"
    >
      {/* Title */}
      <View className="bg-white/90 p-6 rounded-3xl shadow-xl border border-cyan-100">
        <Text className="text-3xl font-extrabold text-cyan-700 text-center">
          🌊 Ocean Hazard Report
        </Text>
        <Text className="text-base text-gray-600 mt-2 text-center">
          Help us track and respond to ocean hazards by reporting below.
        </Text>
      </View>

      {/* Hazard Dropdown */}
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
          searchable={true} // It's a good practice to keep this for long lists
          placeholder="Select a hazard type..."
          // ✅ This is the key change to ensure the list is fully visible
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
          onPress={() => getCurrentLocation(setLocation)}
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
          placeholder="Describe the hazard..."
          value={description}
          onChangeText={setDescription}
          multiline
          className="w-full bg-cyan-50 p-4 rounded-xl text-base h-28 text-gray-800 border border-cyan-200"
          placeholderTextColor="#94a3b8"
        />
      </View>

      {/* 👇 6. Redesigned Media Section */}
      <View className="bg-white mt-6 p-5 rounded-2xl shadow-md border-l-4 border-cyan-500">
        <Text className="text-lg font-semibold text-cyan-800 mb-3">
          Upload Media
        </Text>

        {/* --- Media Preview or Upload Area --- */}
        {media ? (
          <View className="mt-1 relative">
            {/* Display Image Preview */}
            {media.type === "image" && (
              <Image
                source={{ uri: media.uri }}
                className="w-full h-48 rounded-xl border border-gray-200"
                resizeMode="cover"
              />
            )}

            {/* ✅ NEW: Display Video Selection Confirmation */}
            {media.type === "video" && (
              <View className="w-full h-48 rounded-xl bg-cyan-50 border-2 border-dashed border-cyan-200 flex-col items-center justify-center p-4">
                <View className="flex-row items-center bg-white p-4 rounded-full shadow-md">
                  <Feather name="video" size={28} color="#0891b2" />
                  <Text className="text-base font-semibold text-cyan-900 ml-3">
                    Video Selected
                  </Text>
                  <Feather
                    name="check-circle"
                    size={22}
                    color="#10b981"
                    className="ml-2"
                  />
                </View>
              </View>
            )}

            {/* Remove Media Button (works for both image and video) */}
            <TouchableOpacity
              onPress={() => setMedia(null)}
              className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full z-10"
            >
              <Feather name="x" size={18} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          /* --- Upload Dropzone --- */
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "Add Media",
                "Choose an option to add your media.",
                [
                  {
                    text: "Take Photo",
                    onPress: () => pickImageWithCamera(setMedia),
                  },
                  {
                    text: "Choose from Library",
                    onPress: () => pickMediaFromLibrary(setMedia),
                  },
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                ],
                { cancelable: true }
              );
            }}
            className="mt-2 flex-col items-center justify-center bg-cyan-50/50 p-10 rounded-2xl border-2 border-dashed border-cyan-300"
          >
            <Feather name="upload-cloud" size={40} color="#0891b2" />
            <Text className="text-base text-gray-600 mt-2 font-medium">
              Tap to add Photo or Video
            </Text>
            <Text className="text-sm text-gray-500 mt-1">(Photo or Video)</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Date */}
      <View className="bg-white mt-6 p-5 rounded-2xl shadow-md border-l-4 border-cyan-500">
        <Text className="text-lg font-semibold text-cyan-800 mb-3">Date</Text>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          className="flex-row items-center bg-cyan-50 p-4 rounded-xl"
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
            onChange={(e, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
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

  const renderSuccess = () => (
    <View className="flex-1 bg-cyan-100 items-center justify-center p-6">
      <View className="w-32 h-32 rounded-full border-4 border-cyan-400 flex items-center justify-center bg-white shadow-lg">
        <Feather name="check" size={64} color="#06b6d4" />
      </View>
      <Text className="text-2xl font-bold text-gray-800 mt-8">
        Report Submitted!
      </Text>
      <Text className="text-base text-gray-600 mt-3 text-center px-6">
        Thank you for helping keep oceans safe.
      </Text>
      <TouchableOpacity
        onPress={handleReportAnother}
        className="bg-cyan-500 mt-10 py-4 px-8 rounded-xl shadow-md"
      >
        <Text className="text-white text-lg font-bold">
          Report Another Hazard
        </Text>
      </TouchableOpacity>
    </View>
  );

  return isSubmitted ? renderSuccess() : renderForm();
}
