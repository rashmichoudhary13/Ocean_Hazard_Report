import { Redirect, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider, useAuth } from "../context/AuthContext";
import './globals.css';

SplashScreen.preventAutoHideAsync();

const RootLayoutNav = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  SplashScreen.hideAsync();

  if (!user) {
    return <Redirect href="/(auth)" />; 
  }

  return <Redirect href="/(main)" />;
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
      <RootLayoutNav />
    </AuthProvider>
  );
}