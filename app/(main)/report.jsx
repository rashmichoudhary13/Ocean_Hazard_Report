import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
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
import { getCurrentLocation, pickImageWithCamera } from "../../context/reportUtils";

// --- Hazards ---
const hazardTypeNames = [
  "Oil Spill",
  "Plastic Pollution",
  "Coral Damage",
  "Illegal Fishing",
  "Chemical Spill",
  "Marine Debris",
  "tsunami",
  "Coastal Erosion",
];
const hazardDropdownItems = hazardTypeNames.map((name) => ({
  label: name,
  value: name.toLowerCase().replace(/\s+/g, "_"),
}));

export default function Report() {
  const { user } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedHazard, setSelectedHazard] = useState(null);
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // --- Submit Report ---
  const handleSubmit = async () => {
    if (!selectedHazard || !description.trim()) {
      Alert.alert("Validation Error", "Please select a hazard type and provide a description.");
      return;
    }
    if (!location) {
      Alert.alert("Validation Error", "Please provide a location for the report.");
      return;
    }

    // 👇 1. Create a new FormData object
    const formData = new FormData();

    // 👇 2. Append all the text fields
    formData.append('latitude', location.lat);
    formData.append('longitude', location.lng);
    formData.append('hazardType', selectedHazard);
    formData.append('description', description);

    // 👇 3. Append the photo file if it exists
    if (photo) {
      // The name of the file can be anything, but it's good practice
      // to give it a unique name. The 'media' key MUST match the
      // key in your backend's upload.single('media') middleware.
      const uriParts = photo.split('.');
      const fileType = uriParts[uriParts.length - 1];

      formData.append('media', {
        uri: photo,
        name: `photo_${Date.now()}.${fileType}`,
        type: `image/${fileType}`,
      });
    }

    try {
       if (!user) { // 👈 3. Add a check to ensure the user is logged in
        Alert.alert("Authentication Error", "You must be logged in to submit a report.");
        return;
      }

      const token = await user.getIdToken();

      // 👇 4. Pass the formData object to your service function
      const responseData = await submitReport(formData, token);
      // The backend returns the created report on success
      if (responseData && responseData._id) {
        setIsSubmitted(true);
      } else {
        Alert.alert("Error", responseData.error || "Failed to submit report.");
      }
    } catch (err) {
      Alert.alert("Error", "Could not submit report. Check your connection.");
      console.error("Submission Error:", err);
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
          searchable={true}
          placeholder="Select a hazard type..."
          listMode="MODAL"
          style={{ borderRadius: 12, borderColor: "#bae6fd", backgroundColor: "#f0f9ff" }}
          dropDownContainerStyle={{ borderColor: "#bae6fd" }}
        />
      </View>

      {/* Location */}
      <View className="bg-white mt-6 p-5 rounded-2xl shadow-md border-l-4 border-cyan-500">
        <Text className="text-lg font-semibold text-cyan-800 mb-3">Location</Text>
        <TouchableOpacity
          onPress={() => getCurrentLocation(setLocation)}
          className="flex-row items-center bg-cyan-50 p-4 rounded-xl"
        >
          <Feather name="map-pin" size={22} color="#0891b2" />
          <Text className="text-base text-gray-700 ml-3">
            {location
              ? `Lat: ${location.lat.toFixed(2)}, Lng: ${location.lng.toFixed(2)}`
              : "Tap to use my location"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Description */}
      <View className="bg-white mt-6 p-5 rounded-2xl shadow-md border-l-4 border-cyan-500">
        <Text className="text-lg font-semibold text-cyan-800 mb-3">Description</Text>
        <TextInput
          placeholder="Describe the hazard..."
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
          onPress={() => pickImageWithCamera(setPhoto)}
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
