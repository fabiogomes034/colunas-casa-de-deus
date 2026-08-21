import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet, Text as RNText } from "react-native";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from "@expo-google-fonts/poppins";
import { colors } from "@/src/lib/theme";
import { AuthProvider } from "@/src/lib/auth";

SplashScreen.preventAutoHideAsync();

// --- Aplica a Poppins automaticamente em todo <Text> "comum" do app ---
// --- mas NÃO mexe em textos que já têm fonte própria (ícones tipo Ionicons) ---
const weightToFont: Record<string, string> = {
  "400": "Poppins_400Regular",
  normal: "Poppins_400Regular",
  "500": "Poppins_500Medium",
  "600": "Poppins_600SemiBold",
  "700": "Poppins_700Bold",
  bold: "Poppins_700Bold",
  "800": "Poppins_800ExtraBold",
};

const originalTextRender = (RNText as any).render;

(RNText as any).render = function (props: any, ref: any) {
  const flatStyle = StyleSheet.flatten(props.style) || {};

  // Ícones (Ionicons, etc.) já definem sua própria fontFamily — não mexe neles
  if (flatStyle.fontFamily) {
    return originalTextRender.call(this, props, ref);
  }

  const fontWeight = flatStyle.fontWeight ? String(flatStyle.fontWeight) : "400";
  const fontFamily = weightToFont[fontWeight] || "Poppins_400Regular";

  const mergedStyle = [
    { color: colors.onSurface },
    props.style,
    { fontFamily, fontWeight: "normal" as const },
  ];

  return originalTextRender.call(this, { ...props, style: mergedStyle }, ref);
};
// --- fim do patch ---

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const CustomTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background,
      card: colors.card,
      text: colors.onSurface,
      border: colors.border,
      primary: colors.brand,
    },
  };

  return (
    <ThemeProvider value={CustomTheme}>
      <AuthProvider>
        <View style={styles.container}>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              animation: "slide_from_right",
            }}
          />
        </View>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
