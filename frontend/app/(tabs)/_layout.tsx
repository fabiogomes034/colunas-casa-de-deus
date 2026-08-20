import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet, Platform } from "react-native";
import { colors } from "@/src/lib/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.onSurfaceLo,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name={focused ? "home" : "home-outline"} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="colunas"
        options={{
          title: "Colunas",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "albums" : "albums-outline"}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "person-circle" : "person-circle-outline"}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

function TabIcon({
  name,
  color,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
}) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Ionicons name={name} size={20} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 0,
    height: Platform.OS === "ios" ? 86 : 68,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 28 : 10,
    shadowColor: "#A3B1C6",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  tabLabel: {
    fontSize: 10.5,
    fontWeight: "700",
  },
  tabItem: {
    paddingTop: 2,
  },
  iconWrap: {
    width: 34,
    height: 26,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: {
    backgroundColor: "#EEF1F6",
  },
});
