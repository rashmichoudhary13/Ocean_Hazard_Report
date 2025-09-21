import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import { Alert, SafeAreaView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import ProfileInfo from '../../components/ProfileInfo';
import ProfileMenuItem from '../../components/ProfileMenuItem';
import { useAuth } from "../../context/AuthContext";

const menuItems = [
  { href: '/billing', icon: 'document-text-outline', name: 'Total Reports' },
];

const ProfileScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      Alert.alert("Logout Error", "There was an issue signing out.");
      console.error("Error signing out: ", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-cyan-50 to-cyan-200">
      <StatusBar barStyle="light-content" />

      <ProfileInfo
        user={{
          name: user?.displayName || "Anonymous",
          email: user?.email || "",
          avatarUrl: user?.photoURL || "https://randomuser.me/api/portraits/women/44.jpg",
        }}
      />

      <View className="mt-6 px-2">
        {menuItems.map((item) => (
          <ProfileMenuItem
            key={item.name}
            icon={item.icon}
            name={item.name}
            onPress={() => router.push(item.href)}
          />
        ))}

        <TouchableOpacity onPress={handleLogout} className="flex-row items-center justify-between p-4">
          <View className="flex-row items-center ">
            <Ionicons name="log-out-outline" size={29} color="#ef4444"/>
            <Text className="text-lg text-red-500 pl-6">Logout</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProfileScreen;

