import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { ScreenBackground } from "@/src/components/ScreenBackground";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { colors, spacing, radius, font, tierMeta, formatBRL, TierKey } from "@/src/lib/theme";

const NÍVEIS: TierKey[] = ["bronze", "prata", "ouro"];

export default function ColunasTab() {
  const router = useRouter();
  const [customValue, setCustomValue] = useState("");
  const [customError, setCustomError] = useState<string | null>(null);

  const goTo = (tier: string, amount: number) => {
    router.push({
      pathname: "/register",
      params: { tier, amount: String(amount) },
    });
  };

  const handleCustomSubmit = () => {
    const n = Number(customValue.replace(",", "."));
    if (!n || n < 10) {
      setCustomError("O valor mínimo para contribuição é de R$ 10,00");
      return;
    }
    setCustomError(null);
    goTo("custom", n);
  };

  return (
    <ScreenBackground>
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.leadContainer}>
              <Text style={styles.eyebrow}>PROJETO DE EDIFICAÇÃO</Text>
              <Text style={styles.title}>Qual pilar você deseja levantar?</Text>
              <Text style={styles.subtitle}>
                Escolha o valor mensal que tocar no seu coração para apoiar a Casa de Deus.
              </Text>
            </View>

            <View style={styles.tilesContainer}>
              {NÍVEIS.map((key) => {
                const item = tierMeta[key];
                return (
                  <Pressable
                    key={key}
                    onPress={() => goTo(key, item.amount)}
                    style={styles.tileCard}
                    testID={`tier-card-${key}`}
                  >
                    <LinearGradient
                      colors={[item.lightColor, item.color]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.tileGlowIcon}
                    >
                      <Text style={styles.tileGlowLetter}>{key.charAt(0).toUpperCase()}</Text>
                    </LinearGradient>

                    <View style={styles.tileContent}>
                      <View style={styles.tileHeaderRow}>
                        <Text style={styles.tileLabel}>{item.label}</Text>
                        <Text style={[styles.tilePrice, { color: item.color }]}>
                          {formatBRL(item.amount)}
                          <Text style={styles.tilePricePeriod}>/mês</Text>
                        </Text>
                      </View>
                      <Text style={styles.tileDescription}>{item.description}</Text>
                    </View>

                    <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceLo} />
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.customCard}>
              <Text style={styles.customTitle}>Outro Valor no Coração</Text>
              <Text style={styles.customSubtitle}>
                Digite um valor personalizado caso queira contribuir com outra quantia.
              </Text>

              <View style={styles.inputRow}>
                <Text style={styles.currencyPrefix}>R$</Text>
                <TextInput
                  placeholder="0,00"
                  placeholderTextColor={colors.onSurfaceLo}
                  keyboardType="numeric"
                  value={customValue}
                  onChangeText={(val) => {
                    setCustomValue(val);
                    if (customError) setCustomError(null);
                  }}
                  style={styles.inputField}
                  testID="custom-amount-input"
                />
              </View>

              {customError && <Text style={styles.errorText}>{customError}</Text>}

              <PrimaryButton
                title="Avançar com este Valor"
                onPress={handleCustomSubmit}
                testID="custom-amount-btn"
                style={{ marginTop: spacing.md }}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  leadContainer: {
    marginBottom: spacing.lg,
  },
  eyebrow: {
    fontSize: font.size.xs,
    fontWeight: font.weight.bold,
    color: colors.brand,
    letterSpacing: 1.1,
    marginBottom: 4,
  },
  title: {
    fontSize: font.size.xl,
    fontWeight: font.weight.black,
    color: colors.onSurface,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: font.size.sm,
    color: colors.onSurfaceMuted,
    marginTop: 6,
    lineHeight: 20,
  },
  tilesContainer: {
    gap: spacing.md,
  },
  tileCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    shadowColor: "#A3B1C6",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 3,
  },
  tileGlowIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  tileGlowLetter: {
    color: "#FFFFFF",
    fontSize: font.size.lg,
    fontWeight: font.weight.black,
  },
  tileContent: {
    flex: 1,
  },
  tileHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  tileLabel: {
    fontSize: font.size.base,
    fontWeight: font.weight.bold,
    color: colors.onSurface,
  },
  tilePrice: {
    fontSize: font.size.base,
    fontWeight: font.weight.black,
  },
  tilePricePeriod: {
    fontSize: font.size.xs,
    fontWeight: font.weight.regular,
    color: colors.onSurfaceMuted,
  },
  tileDescription: {
    fontSize: font.size.xs,
    color: colors.onSurfaceMuted,
    lineHeight: 16,
  },
  customCard: {
    marginTop: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    shadowColor: "#A3B1C6",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 3,
  },
  customTitle: {
    fontSize: font.size.base,
    fontWeight: font.weight.bold,
    color: colors.onSurface,
  },
  customSubtitle: {
    fontSize: font.size.xs,
    color: colors.onSurfaceMuted,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currencyPrefix: {
    fontSize: font.size.base,
    fontWeight: font.weight.bold,
    color: colors.onSurfaceMuted,
    marginRight: spacing.xs,
  },
  inputField: {
    flex: 1,
    fontSize: font.size.base,
    fontWeight: font.weight.bold,
    color: colors.onSurface,
  },
  errorText: {
    color: colors.error,
    fontSize: font.size.xs,
    marginTop: 6,
    fontWeight: font.weight.medium,
  },
});
