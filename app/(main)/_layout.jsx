import { Tabs } from 'expo-router';
import TabBar from "@/components/TabBar";

const MainStack = () => {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: "Home" }}/>
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      <Tabs.Screen name="map" options={{ title: "Map" }} />
      <Tabs.Screen name="report" options={{ title: "Report" }} />
    </Tabs>
  )
}

export default MainStack;