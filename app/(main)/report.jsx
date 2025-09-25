import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// utils + service
import { useAuth } from "../../context/AuthContext";
import { submitReport } from "../../context/reportService";
import {
  getCurrentLocation,
  pickImageWithCamera,
  pickMediaFromLibrary,
} from "../../context/reportUtils";


export default function Report() {
  const { user } = useAuth();
  const { t } = useTranslation('report'); // <-- Initialize translation hook

  // --- Translated Hazard & Severity Data ---
  // Moved inside the component to access the `t` function
  const naturalHazards = [
    { name: t('hazards.unusualTides'), key: 'unusualTides', icon: "waves-arrow-up" },
    { name: t('hazards.flooding'), key: 'flooding', icon: "home-flood" },
    { name: t('hazards.coastalDamage'), key: 'coastalDamage', icon: "image-broken-variant" },
    { name: t('hazards.highWaves'), key: 'highWaves', icon: "surfing" },
    { name: t('hazards.swellSurges'), key: 'swellSurges', icon: "pulse" },
    { name: t('hazards.tsunami'), key: 'tsunami', icon: "waves" },
  ];

  const manMadeHazards = [
    { name: t('hazards.oilSpill'), key: 'oilSpill', icon: "oil" },
    { name: t('hazards.pollutionDebris'), key: 'pollutionDebris', icon: "trash-can-outline" },
    { name: t('hazards.abnormalSeaBehaviour'), key: 'abnormalSeaBehaviour', icon: "radar" },
    { name: t('hazards.otherHazard'), key: 'otherHazard', icon: "alert-circle-outline" },
  ];

  const severityLevels = [
    { level: t('severity.low'), description: t('severity.lowDesc'), key: 'Low', color: "bg-green-100 border-green-300", textColor: "text-green-800" },
    { level: t('severity.medium'), description: t('severity.mediumDesc'), key: 'Medium', color: "bg-yellow-100 border-yellow-400", textColor: "text-yellow-800" },
    { level: t('severity.high'), description: t('severity.highDesc'), key: 'High', color: "bg-red-100 border-red-400", textColor: "text-red-800" },
  ];


  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // State for the multi-step form
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedHazard, setSelectedHazard] = useState(null);
  const [selectedSeverity, setSelectedSeverity] = useState(null);
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState(null);
  const [location, setLocation] = useState(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // --- Handlers ---
  const handleSubmit = async () => {
    // --- Validation Checks ---
    if (!selectedCategory || !selectedHazard || !selectedSeverity || !description.trim() || !location) {
      Alert.alert(t('validationErrorTitle'), t('validationErrorMessage'));
      return;
    }
    
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("latitude", location.lat);
    formData.append("longitude", location.lng);
    formData.append("hazardCategory", selectedCategory);
    formData.append("hazardType", selectedHazard); // Send original English key
    formData.append("severityLevel", selectedSeverity); // Send original English key
    formData.append("description", description);
    formData.append("reportDate", date.toISOString());

    if (media) {
      const uriParts = media.uri.split(".");
      const fileType = uriParts[uriParts.length - 1];
      formData.append("media", {
        uri: media.uri,
        name: `${media.type}_${Date.now()}.${fileType}`,
        type: `${media.type}/${fileType}`,
      });
    }

    try {
      if (!user) {
        Alert.alert(t('authErrorTitle'), t('authErrorMessage'));
        return;
      }
      const token = await user.getIdToken();
      const responseData = await submitReport(formData, token);

      if (responseData && responseData._id) {
        setIsSubmitted(true);
      } else {
        Alert.alert("Error", responseData.error || t('submissionFailedTitle'));
      }
    } catch (err) {
      let errorMessage = "Could not submit report. Check your connection.";
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      Alert.alert(t('submissionFailedTitle'), errorMessage);
      console.error("Submission Error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportAnother = () => {
    setIsSubmitted(false);
    setSelectedCategory(null);
    setSelectedHazard(null);
    setSelectedSeverity(null);
    setDescription("");
    setMedia(null);
    setLocation(null);
    setDate(new Date());
  };

  // --- Reusable UI Components for the Form ---
  const StepCard = ({ step, title, children }) => (
    <View className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mb-6">
      <Text className="text-xl font-bold text-slate-800 mb-4">
        <Text className="text-blue-600">{step}.</Text> {title}
      </Text>
      {children}
    </View>
  );

  const SelectionPill = ({ text, isSelected, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`py-3 px-5 rounded-full border-2 flex-row items-center ${
        isSelected ? "bg-blue-500 border-blue-500" : "bg-white border-slate-300"
      }`}
    >
      <Text className={`font-semibold ${isSelected ? "text-white" : "text-slate-700"}`}>
        {text}
      </Text>
    </TouchableOpacity>
  );

  const HazardGridCard = ({ hazard, isSelected, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`w-full p-4 rounded-xl border-2 items-center justify-center h-28 ${
        isSelected ? "bg-blue-50 border-blue-500" : "bg-slate-50 border-slate-200"
      }`}
    >
      <MaterialCommunityIcons 
        name={hazard.icon} 
        size={32} 
        color={isSelected ? "#2563eb" : "#475569"} 
      />
      <Text className={`text-center font-semibold mt-2 ${isSelected ? "text-blue-700" : "text-slate-700"}`}>
        {hazard.name}
      </Text>
    </TouchableOpacity>
  );

  const SeverityChoiceCard = ({ severity, isSelected, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 p-4 rounded-xl border-2 ${
        isSelected ? `bg-blue-50 border-blue-500` : `${severity.color}`
      }`}
    >
        <Text className={`text-lg font-bold text-center ${isSelected ? 'text-blue-800' : severity.textColor}`}>{severity.level}</Text>
        <Text className={`text-sm text-center mt-1 ${isSelected ? 'text-blue-600' : 'text-slate-600'}`}>{severity.description}</Text>
    </TouchableOpacity>
  );

  // --- Main Form Renderer ---
  const renderForm = () => (
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        className="flex-1 bg-slate-50 p-4"
      >
        {/* Header */}
        <View className="items-center mb-6">
          <Text className="text-3xl font-extrabold text-slate-800 text-center">
            {t('headerTitle')}
          </Text>
          <Text className="text-base text-slate-500 mt-2 text-center">
            {t('headerSubtitle')}
          </Text>
        </View>

        {/* Step 1: Hazard Category */}
        <StepCard step="1" title={t('step1Title')}>
          <View className="flex-row gap-4">
            <SelectionPill
              text={t('naturalHazard')}
              isSelected={selectedCategory === "natural"}
              onPress={() => { setSelectedCategory("natural"); setSelectedHazard(null); }}
            />
            <SelectionPill
              text={t('manMadeHazard')}
              isSelected={selectedCategory === "manmade"}
              onPress={() => { setSelectedCategory("manmade"); setSelectedHazard(null); }}
            />
          </View>
        </StepCard>

        {/* Step 2: Hazard Type */}
        {selectedCategory && (
          <StepCard step="2" title={t('step2Title')}>
            <View className="flex-row flex-wrap -m-1">
              {(selectedCategory === "natural" ? naturalHazards : manMadeHazards).map((h) => (
                <View key={h.key} className="w-1/2 p-1">
                  <HazardGridCard
                    hazard={h}
                    isSelected={selectedHazard === h.key}
                    onPress={() => setSelectedHazard(h.key)}
                  />
                </View>
              ))}
            </View>
          </StepCard>
        )}
        
        {/* Step 3: Severity Level */}
        {selectedHazard && (
          <StepCard step="3" title={t('step3Title')}>
              <View className="flex-row gap-2">
                  {severityLevels.map((s) => (
                      <SeverityChoiceCard 
                          key={s.key}
                          severity={s}
                          isSelected={selectedSeverity === s.key}
                          onPress={() => setSelectedSeverity(s.key)}
                      />
                  ))}
              </View>
          </StepCard>
        )}

        {/* Step 4: Provide Details */}
        {selectedSeverity && (
          <StepCard step="4" title={t('step4Title')}>
            {/* Location */}
            <Text className="text-lg font-semibold text-slate-700 mb-2">{t('locationLabel')}</Text>
            <TouchableOpacity
              onPress={() => getCurrentLocation(setLocation)}
              className="flex-row items-center bg-slate-100 p-4 rounded-xl border border-slate-200 mb-4"
            >
              <Feather name="map-pin" size={22} color="#475569" />
              <Text className="text-base text-slate-700 ml-3">
                {location
                  ? `Lat: ${location.lat.toFixed(4)}, Lng: ${location.lng.toFixed(4)}`
                  : t('locationPlaceholder')}
              </Text>
            </TouchableOpacity>

            {/* Description */}
            <Text className="text-lg font-semibold text-slate-700 mb-2">{t('descriptionLabel')}</Text>
            <TextInput
              placeholder={t('descriptionPlaceholder')}
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
              className="w-full bg-slate-100 p-4 pt-4 rounded-xl text-base h-32 text-slate-800 border border-slate-200 mb-4"
              placeholderTextColor="#94a3b8"
            />
            
            {/* Media Upload */}
            <Text className="text-lg font-semibold text-slate-700 mb-2">{t('mediaLabel')}</Text>
            {media ? (
              <View className="relative mb-4">
                  {media.type === "image" && <Image source={{ uri: media.uri }} className="w-full h-48 rounded-xl" />}
                  {media.type === "video" && (
                      <View className="w-full h-48 rounded-xl bg-slate-100 justify-center items-center">
                          <Feather name="video" size={40} color="#475569" />
                          <Text className="font-semibold text-slate-700 mt-2">{t('videoSelected')}</Text>
                      </View>
                  )}
                  <TouchableOpacity onPress={() => setMedia(null)} className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full">
                      <Feather name="x" size={18} color="white" />
                  </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                  onPress={() => Alert.alert(t('mediaPickerTitle'), t('mediaPickerMessage'), [
                      { text: t('takePhoto'), onPress: () => pickImageWithCamera(setMedia) },
                      { text: t('chooseFromLibrary'), onPress: () => pickMediaFromLibrary(setMedia) },
                      { text: t('cancel'), style: "cancel" },
                  ], { cancelable: true })}
                  className="flex-col items-center justify-center bg-slate-100 p-10 rounded-2xl border-2 border-dashed border-slate-300 mb-4"
              >
                  <Feather name="upload-cloud" size={40} color="#64748b" />
                  <Text className="text-base text-slate-600 mt-2 font-medium">{t('mediaPlaceholder')}</Text>
              </TouchableOpacity>
            )}

            {/* Date */}
            <Text className="text-lg font-semibold text-slate-700 mb-2">{t('dateLabel')}</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="flex-row items-center bg-slate-100 p-4 rounded-xl border border-slate-200"
            >
              <Feather name="calendar" size={22} color="#475569" />
              <Text className="ml-3 text-base text-slate-700">
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
          </StepCard>
        )}
        
        {/* Submit Button */}
        {selectedSeverity && location && description.trim() && (
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            className={`w-full mt-2 py-4 rounded-xl shadow-md ${isSubmitting ? "bg-slate-400" : "bg-blue-600"}`}
          >
            <Text className="text-white text-center text-lg font-bold">
              {isSubmitting ? t('submittingButton') : t('submitButton')}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
  );

  // --- Success Screen Renderer ---
  const renderSuccess = () => (
    <View className="flex-1 bg-slate-50 items-center justify-center p-6">
      <View className="w-32 h-32 rounded-full border-4 border-green-400 flex items-center justify-center bg-white shadow-lg">
        <Feather name="check" size={64} color="#10b981" />
      </View>
      <Text className="text-2xl font-bold text-slate-800 mt-8">{t('successTitle')}</Text>
      <Text className="text-base text-slate-600 mt-3 text-center px-6">
        {t('successMessage')}
      </Text>
      <TouchableOpacity
        onPress={handleReportAnother}
        className="bg-blue-600 mt-10 py-4 px-8 rounded-xl shadow-md"
      >
        <Text className="text-white text-lg font-bold">{t('reportAnotherButton')}</Text>
      </TouchableOpacity>
    </View>
  );

  return isSubmitted ? renderSuccess() : renderForm();
}

