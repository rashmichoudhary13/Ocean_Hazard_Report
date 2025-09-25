import { useTranslation } from "react-i18next";
import { Button, Modal, Text, TouchableOpacity, View } from "react-native";

const LanguageModal = ({ isVisible, onClose }) => {
  const { t, i18n } = useTranslation("profile");

  // This function now lives inside the modal component
  const changeLanguageAndClose = (lng) => {
    i18n.changeLanguage(lng);
    onClose(); // Closes the modal after selection
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose} // Handles the Android back button
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white p-6 rounded-2xl w-80 shadow-lg">
          <Text className="text-xl font-bold mb-4 text-center">
            {t("Choose Language")}
          </Text>

          {[
            { code: "en", label: "English" },
            { code: "hi", label: "हिंदी" },
          ].map((lang) => (
            <TouchableOpacity
              key={lang.code}
              onPress={() => changeLanguageAndClose(lang.code)}
              className="flex-row items-center py-3"
            >
              {/* Radio button style indicator */}
              <View
                className={`h-5 w-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                  i18n.language === lang.code
                    ? "border-blue-500"
                    : "border-gray-300"
                }`}
              >
                {i18n.language === lang.code && (
                  <View className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                )}
              </View>
              <Text className="text-lg">{lang.label}</Text>
            </TouchableOpacity>
          ))}

          <View className="mt-4">
            <Button title={t("close")} onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LanguageModal;
