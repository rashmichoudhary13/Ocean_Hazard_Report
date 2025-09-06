import { Tabs } from 'expo-router';

const MainStack = () => {
  return (
    <Tabs screenOptions={ {headerShown: false}}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="report" />
    </Tabs>
  )
}

export default MainStack;