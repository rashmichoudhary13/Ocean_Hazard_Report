import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSignIn = () => {
    console.log(email + " , " + password);
  }

  return (
    <SafeAreaView className="flex-1 bg-white justify-center px-6">
      {/* Title */}
      <Text className="text-center text-3xl font-black text-purple-600 mb-4">
        Create Account
      </Text>

      {/* Subtitle */}
      <Text className="text-center font-bold text-2xl  text-gray-700 mb-8 mx-auto">
       Create an account to report and track hazards.
      </Text>

      {/* Name Input */}
       <TextInput
        mode="outlined"
        label="Name"
        value={name}
        onChangeText={setName}
        outlineColor="#9333EA"
        activeOutlineColor="#9333EA"
      />

      {/* Email Input */}
      <TextInput
        mode="outlined"
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        outlineColor="#9333EA"
        activeOutlineColor="#9333EA"
        style={{ marginTop: 16 }}
      />

      {/* Password Input */}
      <TextInput
        mode="outlined"
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        outlineColor="#9333EA"
        activeOutlineColor="#9333EA"
        style={{ marginTop: 16, marginBottom: 20}}
      />

      {/* Sign In Button */}
      <Button
        mode="contained"
        buttonColor="#9333EA"
        onPress={handleSignIn}
        style={{ paddingVertical: 3 }}
        labelStyle={{ fontSize: 15, fontWeight: "bold" }}
      >
        Sign up
      </Button>

      {/* Create new account */}
      <View className="mt-5">
        <Button
          mode="text"
          labelStyle={{ fontSize: 18, fontWeight: "bold" }}
          onPress={() => router.push("/login")}
        >
          Already have an account
        </Button>
      </View>

      {/* Social Login */}
      <Text className="text-center text-lg mb-4 mt-20 text-purple-600 font-bold">
        Or continue with
      </Text>

      <View className="flex-row justify-center gap-5">
        <TouchableOpacity className="p-3 border rounded-lg  w-16">
          <AntDesign name="google" size={24} color="black" className="text-center" />
        </TouchableOpacity>
        <TouchableOpacity className="p-3 border rounded-lg w-16">
          <FontAwesome name="facebook" size={24} color="black" className="text-center"/>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Register;
