import TabBar from "@/components/TabBar";
import { Tabs } from 'expo-router';
import { useTranslation } from "react-i18next";

const MainStack = () => {
  const { t } = useTranslation("common");
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: t('home') }}/>
      <Tabs.Screen name="profile" options={{ title: t('profile') }} />
      <Tabs.Screen name="map" options={{ title: t('map') }} />
      <Tabs.Screen name="report" options={{ title: t('report') }} />
    </Tabs>
  )
}

export default MainStack;