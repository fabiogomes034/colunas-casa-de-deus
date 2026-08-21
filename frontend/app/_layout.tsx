import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet } from "react-native";
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

// Mantém a splash screen visível até as fontes carregarem
SplashScreen.preventAutoHideAsync();

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
      // Libera a splash screen só quando a fonte carregou (ou falhou)
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Enquanto a fonte não carrega, não renderiza nada (evita "flash" da fonte padrão)
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
