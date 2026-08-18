import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../lib/theme";

export function ScreenBackground({ children, style, ...rest }: ViewProps) {
  return (
    <View style={[styles.root, style]} {...rest}>
      <LinearGradient
        colors={[colors.surface, colors.surfaceGradientEnd, colors.surface]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {/* Subtle radial glow simulated with a soft overlay */}
      <View pointerEvents="none" style={styles.glow} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  glow: {
    position: "absolute",
    top: -120,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 999,
    backgroundColor: "rgba(37,99,235,0.14)",
    filter: "blur(60px)" as any,
  },
});
