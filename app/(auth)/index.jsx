import { Link } from "expo-router";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";

export default function Auth() {
  return (
    <ImageBackground
      source={require("../../assets/images/login_bg.jpg")} // 👈 update your image path
      className="flex-1 justify-between"
      resizeMode="cover"
    >
      <View className="flex-1 bg-black/40 justify-between p-5">
        {/* Title */}

        <Text></Text>
        <Text className="text-white text-center text-4xl font-semibold"> Choose your role </Text>
        {/* Buttons at bottom */}
        <View className="mb-10">
          <Link href={{ pathname: "/login", params: { role: 'citizen' } }} asChild>
            <TouchableOpacity className="bg-purple-600 py-4 rounded-2xl mb-7">
              <Text className="text-white text-center text-lg font-semibold">
                Citizen
              </Text>
            </TouchableOpacity>
          </Link>

          <Link href={{ pathname: "/login", params: { role: 'official' } }} asChild>
            <TouchableOpacity className="bg-white  py-4 rounded-2xl">
              <Text className="text-black text-center text-lg font-semibold">
                Authority
              </Text>
            </TouchableOpacity>
          </Link>

          <View className="mt-10">
            <Text className="text-2xl font-bold text-center text-white "> Ocean Hazard </Text>
          </View>

        </View>
      </View>
    </ImageBackground>
  );
}
