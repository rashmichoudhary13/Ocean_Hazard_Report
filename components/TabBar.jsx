import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesome, FontAwesome5, Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

// Define the colors used in the component
const colors = {
  primary: "#1da2d8",
  grey: "#737373",
  white: "#FFFFFF",
  background: "white",
};

// Main TabBar component
const TabBar = ({ state, descriptors, navigation }) => {
  const [tabLayouts, setTabLayouts] = useState([]);
  const layoutsRef = useRef([]);
  const isInitialRender = useRef(true);

  const positionX = useSharedValue(0);
  const width = useSharedValue(0);

  // Icons for each route name
  const icons = {
    index: (props) => <FontAwesome name="home" size={24} {...props} />,
    map: (props) => <Feather name="map" size={24} {...props} />,
    profile: (props) => <FontAwesome5 name="user" size={24} {...props} />,
    report: (props) => <Feather name="plus-circle" size={24} {...props} />,
  };

  useEffect(() => {
    if (tabLayouts.length === state.routes.length && tabLayouts[state.index]) {
      const currentTabLayout = tabLayouts[state.index];

      const springConfig = {
        damping: 15,
        stiffness: 120,
        mass: 1,
      };

      if (isInitialRender.current) {
        positionX.value = currentTabLayout.x;
        width.value = currentTabLayout.width;
        isInitialRender.current = false;
      } else {
        positionX.value = withSpring(currentTabLayout.x, springConfig);
        width.value = withSpring(currentTabLayout.width, springConfig);
      }
    }
  }, [state.index, tabLayouts]);

  const animatedPillStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: positionX.value }],
      width: width.value,
    };
  });

  return (
    <View className="absolute bottom-6 left-0 right-0 items-center">
      <View className="flex-row justify-between items-center bg-white px-2 py-2 rounded-full shadow-lg w-[90%]">
        <Animated.View
          style={[animatedPillStyle, { backgroundColor: colors.primary }]}
          className="absolute top-2 bottom-2 rounded-full"
        />
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? options.title ?? route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: "tabLongPress", target: route.key });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              onLayout={(event) => {
                layoutsRef.current[index] = event.nativeEvent.layout;
                const allTabsMeasured =
                  layoutsRef.current.length === state.routes.length &&
                  !layoutsRef.current.some((layout) => layout === undefined);

                if (allTabsMeasured) {
                  if (
                    JSON.stringify(tabLayouts) !==
                    JSON.stringify(layoutsRef.current)
                  ) {
                    setTabLayouts([...layoutsRef.current]);
                  }
                }
              }}
              className="flex-1 justify-center items-center py-2 gap-1 z-10"
            >
              {icons[route.name]({
                color: isFocused ? colors.white : colors.grey,
              })}
              <Text
                className={`text-[11px] ${
                  isFocused ? "text-white" : "text-neutral-500"
                }`}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default TabBar;
