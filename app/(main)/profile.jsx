import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, SafeAreaView, StatusBar, Text, View } from "react-native";
import LanguageModal from "../../components/LanguageModal"; // Import the new component
import ProfileInfo from "../../components/ProfileInfo";
import ProfileMenuItem from "../../components/ProfileMenuItem";
import { useAuth } from "../../context/AuthContext";

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation("profile");
  const [isModalVisible, setModalVisible] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      Alert.alert("Logout Error", "There was an issue signing out.");
      console.error("Error signing out: ", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-cyan-50 to-cyan-200">
      <StatusBar barStyle="dark-content" />

      <ProfileInfo
        user={{
          name: user?.displayName || "Anonymous",
          email: user?.email || "",
          avatarUrl:
            user?.photoURL || "https://randomuser.me/api/portraits/women/44.jpg",
        }}
      />

      <View className="flex-1 mt-6 px-2">
        <ProfileMenuItem
          icon="document-text-outline"
          name={t("totalReports")}
          href="/billing" // Using href for navigation is cleaner
        />

        <ProfileMenuItem
          icon="language-outline"
          name={t("language")}
          onPress={() => setModalVisible(true)} // This now just toggles the state
        />

        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          className="p-4"
        >
          <View className="flex-row items-center">
            <Ionicons name="log-out-outline" size={29} color="#ef4444" />
            <Text className="text-lg text-red-500 ml-6">
              {t("logout")}
            </Text>
          </View>
        </Pressable>
      </View>

      {/* All the modal code is now neatly contained in this single component */}
      <LanguageModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;

