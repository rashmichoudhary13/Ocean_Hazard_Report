import { router, useLocalSearchParams } from "expo-router";
import { updateProfile } from "firebase/auth";
import { useState } from "react";
import { Alert, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

const Register = () => {
  const { role } = useLocalSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // This should call Firebase's createUserWithEmailAndPassword from your context
  const { register } = useAuth();

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      // Step 1: Create user in Firebase Auth
      const userCredential = await register(email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: name });
      const idToken = await user.getIdToken();

      // Step 2: Call the single backend endpoint to create the DB profile
      const response = await fetch("http://192.168.0.100:5000/auth/upsert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`, // Send token in header
        },
        body: JSON.stringify({
          name: name, // Send name and role for new profile creation
          role: role,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create profile on server.");
      }

      Alert.alert("Success!", "Your account has been created.");
      router.replace("/(main)");
    } catch (err) {
      if (err?.code === "auth/email-already-in-use") {
        setError("That email address is already registered.");
      } else if (err?.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError(err?.message || "An error occurred. Please try again.");
        console.error("Registration Error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white justify-center px-6">
      <Text className="text-center text-3xl font-black text-cyan-600 mb-4">
        Create Account
      </Text>
      <Text className="text-center font-bold text-xl text-gray-600 mb-8">
        Join our community to help keep coasts safe.
      </Text>

      <View className="space-y-4">
        <TextInput
          mode="outlined"
          label="Name"
          value={name}
          onChangeText={setName}
          outlineColor="#06b6d4"
          activeOutlineColor="#0891b2"
        />
        <TextInput
          mode="outlined"
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          outlineColor="#06b6d4"
          activeOutlineColor="#0891b2"
        />
        <TextInput
          mode="outlined"
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          outlineColor="#06b6d4"
          activeOutlineColor="#0891b2"
        />
      </View>

      {error ? (
        <Text className="text-red-500 text-center mt-4">{error}</Text>
      ) : null}

      <Button
        mode="contained"
        buttonColor="#06b6d4"
        onPress={handleSignUp}
        loading={loading}
        disabled={loading}
        className="mt-6 py-1"
        labelStyle={{ fontSize: 16, fontWeight: "bold" }}
      >
        Sign up
      </Button>

      <View className="mt-4">
        <Button
          mode="text"
          textColor="#0891b2"
          labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
          onPress={() => router.push("/login")}
        >
          Already have an account?
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default Register;