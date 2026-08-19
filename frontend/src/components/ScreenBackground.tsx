import React from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@/src/lib/theme";

interface ScreenBackgroundProps {
  children: React.ReactNode;
}

export function ScreenBackground({ children }: ScreenBackgroundProps) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <LinearGradient
        colors={[colors.background, colors.backgroundAlt]}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
