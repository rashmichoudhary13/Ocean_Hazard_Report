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
  
  // Get the register function from our context
  const { register } = useAuth();

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const userCredential = await register(email, password);
      const user = userCredential.user;
      await updateProfile(user, {
        displayName: name,
      });
      
      const token = await user.getIdToken();
      const API_URL = 'http://192.168.0.102:5000';
      console.log("role is: ", role);
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name, role: role }),
      });
      if (!response.ok) {
        throw new Error('Failed to create user profile on our server.');
      }

      Alert.alert('Success!', 'Your account has been created.');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('That email address is already registered.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError('An error occurred. Please try again.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white justify-center px-6">
      <Text className="text-center text-3xl font-black text-cyan-500 mb-4">
        Create Account
      </Text>
      <Text className="text-center font-bold text-2xl text-gray-700 mb-8 mx-auto">
        Create an account to report and track hazards.
      </Text>
      <TextInput
        mode="outlined"
        label="Name"
        value={name}
        onChangeText={setName}
        outlineColor="#06b6d4"
        activeOutlineColor="#06b6d4"
      />
      <TextInput
        mode="outlined"
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        outlineColor="#06b6d4"
        activeOutlineColor="#06b6d4"
        style={{ marginTop: 16 }}
      />
      <TextInput
        mode="outlined"
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        outlineColor="#06b6d4"
        activeOutlineColor="#06b6d4"
        style={{ marginTop: 16, marginBottom: 8 }}
      />
      {error ? <Text className="text-red-500 text-center mb-4">{error}</Text> : null}
      <Button
        mode="contained"
        buttonColor="#06b6d4"
        onPress={handleSignUp}
        loading={loading}
        disabled={loading}
        style={{ paddingVertical: 3 }}
        labelStyle={{ fontSize: 15, fontWeight: "bold" }}
      >
        Sign up
      </Button>
      <View className="mt-5">
        <Button
          mode="text"
          textColor="#06b6d4"
          labelStyle={{ fontSize: 18, fontWeight: "bold" }}
          onPress={() => router.push("/login")}
        >
          Already have an account
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default Register;
