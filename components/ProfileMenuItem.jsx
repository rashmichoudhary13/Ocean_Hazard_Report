import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

// This new version can handle BOTH navigation (href) and actions (onPress)
const ProfileMenuItem = ({ href, icon, name, onPress, isLogout = false }) => {
  const textColor = isLogout ? 'text-red-500' : 'text-gray-700';
  const iconColor = isLogout ? '#ef4444' : '#0891b2';

  // This is the content that will be displayed (icon, name, etc.)
  const ItemContent = (
    <View className="flex-row items-center justify-between p-4">
      <View className="flex-row items-center">
        <Ionicons name={icon} size={29} />
        <Text className={`text-lg ml-6 ${textColor}`}>{name}</Text>
      </View>
      {!isLogout && <Ionicons name="chevron-forward-outline" size={24} color="#9ca3af" />}
    </View>
  );

  // If an 'onPress' function is passed, wrap the content in a Pressable
  // This is for actions like opening a modal or logging out.
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
        {ItemContent}
      </Pressable>
    );
  }

  // Otherwise, if no 'onPress' is given, wrap it in a Link for navigation.
  return (
    <Link href={href || '#'} asChild>
      <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
        {ItemContent}
      </Pressable>
    </Link>
  );
};

export default ProfileMenuItem;

