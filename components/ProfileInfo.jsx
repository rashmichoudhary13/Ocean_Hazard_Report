// components/ProfileInfo.jsx
import { useRouter } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';

const ProfileInfo = ({ user }) => {
  const router = useRouter();

  return (
    <>
      <View className="items-center mt-8 mb-6">
        <Image
          source={{ uri: user.avatarUrl }}
          className="w-24 h-24 rounded-full border-2 border-cyan-500"
        />
        <Text className="text-2xl font-bold mt-4">{user.name}</Text>
        <Text className="text-md mt-1">{user.email}</Text>
      </View>
      
      <View className="items-center my-4">
        <TouchableOpacity 
          onPress={() => router.push('/edit-profile')} // Example navigation
          className="bg-cyan-500 w-2/3 py-3 rounded-full items-center justify-center"
        >
          <Text className="text-white text-lg font-bold">Edit Profile</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default ProfileInfo;