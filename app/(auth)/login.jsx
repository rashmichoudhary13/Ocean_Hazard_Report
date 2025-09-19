import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Missing Information", "Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      let errorMessage = "An error occurred. Please try again.";
      if (error.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password.";
      }
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white justify-center px-6">
      {/* Title */}
      <Text className="text-center text-3xl font-black text-cyan-500 mb-4">
        Login here
      </Text>

      {/* Subtitle */}
      <Text className="text-center font-bold text-2xl w-56 text-gray-700 mb-8 mx-auto">
        Welcome back you’ve been missed!
      </Text>

      {/* Email Input */}
      <TextInput
        mode="outlined"
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        outlineColor="#06b6d4"
        activeOutlineColor="#06b6d4"
      />

      {/* Password Input */}
      <TextInput
        mode="outlined"
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        outlineColor="#06b6d4"
        activeOutlineColor="#06b6d4"
        style={{ marginTop: 16 }}
      />

      {/* Forgot Password */}
      <TouchableOpacity>
        <Text className="text-cyan-500 text-right mb-6 mt-3 font-bold">
          Forgot your password?
        </Text>
      </TouchableOpacity>

      {/* Sign In Button */}
      <Button
        mode="contained"
        buttonColor="#06b6d4"
        onPress={handleSignIn}
        loading={loading} // Use loading state here
        disabled={loading} // Disable button while loading
        style={{ paddingVertical: 3 }}
        labelStyle={{ fontSize: 15, fontWeight: "bold" }}
      >
        Sign in
      </Button>

      {/* Create new account */}
      <View className="mt-5">
        <Button
          mode="text"
          textColor="#06b6d4"
          labelStyle={{ fontSize: 18, fontWeight: "bold" }}
          onPress={() => router.push("/register")}
        >
          Create new account
        </Button>
      </View>

      {/* Social Login */}
      <Text className="text-center text-lg mb-4 mt-20 text-cyan-500 font-bold">
        Or continue with
      </Text>

      <View className="flex-row justify-center gap-5">
        <TouchableOpacity className="p-3 border rounded-lg w-16 items-center">
          <AntDesign name="google" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity className="p-3 border rounded-lg w-16 items-center">
          <FontAwesome name="facebook" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Login;
