import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle, StyleProp } from "react-native";
import { colors, radius, font } from "../lib/theme";

type Props = {
  title: string;
  onPress?: () => void;
  color?: string;
  textColor?: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: "solid" | "outline" | "ghost";
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function PrimaryButton({
  title,
  onPress,
  color = colors.brand,
  textColor = colors.onBrand,
  disabled,
  loading,
  variant = "solid",
  style,
  testID,
}: Props) {
  const isSolid = variant === "solid";
  const isOutline = variant === "outline";
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isSolid && { backgroundColor: color },
        isOutline && { backgroundColor: "transparent", borderWidth: 2, borderColor: color },
        variant === "ghost" && { backgroundColor: "transparent" },
        (disabled || loading) && { opacity: 0.6 },
        pressed && !disabled && { transform: [{ scale: 0.98 }], opacity: 0.9 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isSolid ? textColor : color} />
      ) : (
        <Text
          style={[
            styles.text,
            { color: isSolid ? textColor : color },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: font.size.lg,
    fontWeight: font.weight.bold,
    letterSpacing: 0.3,
  },
});
