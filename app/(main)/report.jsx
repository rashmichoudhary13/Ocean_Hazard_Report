import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import DateTimePicker from "@react-native-community/datetimepicker";
import DropDownPicker from "react-native-dropdown-picker";

// --- Hazard Types (from previous prompt) ---
const hazardTypeNames = [
  "Oil Spill",
  "Chemical Spill",
  "Plastic / Marine Debris",
  "Harmful Algal Bloom (Red Tide)",
  "Shipwreck",
  "Ghost Nets / Abandoned Fishing Gear",
  "Marine Animal Stranding",
  "Dead Fish / Mass Fish Kill",
  "Radioactive Waste / Leak",
  "Toxic Waste Dumping",
  "Coastal Erosion",
  "Tsunami Damage",
  "Storm Surge",
  "Cyclone / Hurricane Damage",
  "Coastal Flooding",
  "Coral Bleaching",
  "Sewage Discharge",
  "Industrial Waste Pollution",
  "Noise Pollution (Sonar / Ships)",
  "Ballast Water Pollution",
  "Heavy Metal Contamination",
  "Microplastic Pollution",
  "Invasive Marine Species",
  "Overfishing Impact Zones",
  "Illegal Sand Mining",
  "Oil Rig / Offshore Platform Leakage",
  "Destruction of Mangroves / Wetlands",
  "Ship Collision / Vessel Grounding",
  "Methane Seep / Gas Emission",
];

// Convert names into dropdown-friendly items
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

  // --- Pick Image ---
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission denied to access media library!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
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

  // --- Submit ---
  const handleSubmit = () => {
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
      location: location || "Not provided",
      description,
      photo,
      date: date.toISOString().split("T")[0],
    };
    console.log("Submitting Report:", reportData);
    setIsSubmitted(true);
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
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
      className="flex-1 bg-cyan-100 p-6"
    >
      <View className="bg-cyan-50 p-6 rounded-2xl">
        <Text className="text-3xl font-bold text-gray-800">
          Ocean Hazard Reporting
        </Text>
        <Text className="text-base text-gray-500 mt-2 mb-6">
          Please provide the details to report the ocean hazard.
        </Text>

        {/* Hazard Type Dropdown */}
        <Text className="text-lg font-semibold text-gray-700 mb-2">
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
            borderColor: "#e5e7eb",
            marginBottom: 20,
          }}
          dropDownContainerStyle={{
            borderColor: "#e5e7eb",
          }}
        />

        {/* Location */}
        <Text className="text-lg font-semibold text-gray-700 mb-2">
          Location
        </Text>
        <TouchableOpacity
          onPress={handleGetLocation}
          className="w-full flex-row items-center bg-white p-4 rounded-xl mb-6"
        >
          <Feather name="map-pin" size={22} color="#0891b2" />
          <Text className="text-base text-gray-700 ml-3">
            {location
              ? `Lat: ${location.lat.toFixed(2)}, Lng: ${location.lng.toFixed(
                  2
                )}`
              : "Use My Location"}
          </Text>
        </TouchableOpacity>

        {/* Description */}
        <Text className="text-lg font-semibold text-gray-700 mb-2">
          Description
        </Text>
        <TextInput
          placeholder="Add details about the hazard..."
          value={description}
          onChangeText={setDescription}
          multiline
          className="w-full bg-white p-4 rounded-xl text-base h-28 text-gray-800 border border-gray-200 mb-6"
        />

        {/* Photo */}
        <Text className="text-lg font-semibold text-gray-700 mb-2">Photo</Text>
        <TouchableOpacity
          onPress={handlePickImage}
          className="w-full flex-row items-center justify-center bg-white p-4 rounded-xl mb-6"
        >
          <Feather name="camera" size={22} color="#0891b2" />
          <Text className="text-base text-gray-700 ml-2">Add a photo</Text>
        </TouchableOpacity>
        {photo && (
          <Image
            source={{ uri: photo }}
            className="w-full h-40 mb-6 rounded-xl"
            resizeMode="cover"
          />
        )}

        {/* Date */}
        <Text className="text-lg font-semibold text-gray-700 mb-2">
          Date
        </Text>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          className="w-full flex-row items-center bg-white p-4 rounded-xl mb-6"
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
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          className="w-full bg-cyan-500 mt-2 py-4 rounded-xl"
        >
          <Text className="text-white text-center text-lg font-bold">
            Submit Report
          </Text>
        </TouchableOpacity>
      </View>
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
