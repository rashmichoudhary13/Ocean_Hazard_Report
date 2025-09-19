// components/ProfileMenuItem.jsx
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

const ProfileMenuItem = ({ href, icon, name, isLogout = false }) => {
  const textColor = isLogout ? 'text-red-500' : 'text-black';
  const iconColor = isLogout ? 'red' : 'black'; // hex for yellow-400 and gray-300

  // The Link component from expo-router handles the press and navigation.
  return (
    <Link href={href || '#'} asChild>
      <TouchableOpacity className="flex-row items-center justify-between p-4">
        <View className="flex-row items-center space-x-4">
          <Ionicons name={icon} size={24} color={iconColor} />
          <Text className={`text-lg ${textColor} pl-6`}>{name}</Text>
        </View>
        {!isLogout && <Ionicons name="chevron-forward" size={22} color="#9CA3AF" />}
      </TouchableOpacity>
    </Link>
  );
};

export default ProfileMenuItem;