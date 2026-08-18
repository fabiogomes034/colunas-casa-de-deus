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

import { ScreenBackground } from "@/src/components/ScreenBackground";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { colors, spacing, radius, font, tierMeta, formatBRL } from "@/src/lib/theme";

type TierKey = "bronze" | "prata" | "ouro";

const TIERS: TierKey[] = ["bronze", "prata", "ouro"];

export default function Levels() {
  const router = useRouter();
  const [customValue, setCustomValue] = useState("");
  const [customError, setCustomError] = useState<string | null>(null);

  const goTo = (level: string, amount: number) =>
    router.push({ pathname: "/register", params: { level, amount: String(amount) } });

  const submitCustom = () => {
    const n = Number(customValue.replace(",", "."));
    if (!n || n < 10) {
      setCustomError("Valor mínimo: R$ 10,00");
      return;
    }
    setCustomError(null);
    goTo("outro", n);
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
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Pressable onPress={() => router.back()} style={styles.back} testID="back-button">
                <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
              </Pressable>
              <Text style={styles.eyebrow}>ESCOLHA SEU NÍVEL</Text>
              <Text style={styles.title}>Qual coluna você{"\n"}quer ser?</Text>
              <Text style={styles.sub}>
                Cada coluna sustenta uma parte da obra. Escolha com o coração.
              </Text>
            </View>

            <View style={styles.list}>
              {TIERS.map((key) => {
                const t = tierMeta[key];
                return (
                  <View key={key} style={[styles.card, { borderColor: t.color }]} testID={`tier-card-${key}`}>
                    <View style={styles.cardTopRow}>
                      <View style={[styles.tierIcon, { backgroundColor: t.color + "22", borderColor: t.color }]}>
                        <Text style={{ fontSize: 26 }}>{t.emoji}</Text>
                      </View>
                      <View style={styles.priceBlock}>
                        <Text style={styles.price}>{formatBRL(t.amount)}</Text>
                        <Text style={styles.perMonth}>por mês</Text>
                      </View>
                    </View>

                    <Text style={styles.tierName}>{t.label}</Text>
                    <Text style={[styles.tierSubtitle, { color: t.color }]}>{t.subtitle}</Text>
                    <Text style={styles.tierDesc}>{t.description}</Text>

                    <PrimaryButton
                      title="Ser Esta Coluna"
                      color={t.color}
                      textColor="#0B1120"
                      onPress={() => goTo(key, t.amount)}
                      testID={`tier-cta-${key}`}
                      style={{ marginTop: spacing.lg }}
                    />
                  </View>
                );
              })}

              <View style={styles.customCard} testID="custom-value-card">
                <Text style={styles.customTitle}>Semear Outro Valor</Text>
                <Text style={styles.customSub}>
                  Contribua com um valor livre, no que Deus colocar em seu coração.
                </Text>
                <View style={styles.inputRow}>
                  <Text style={styles.currencyLabel}>R$</Text>
                  <TextInput
                    value={customValue}
                    onChangeText={(v) => setCustomValue(v.replace(/[^0-9.,]/g, ""))}
                    placeholder="0,00"
                    placeholderTextColor={colors.cardTextMuted}
                    keyboardType="decimal-pad"
                    style={styles.input}
                    testID="custom-value-input"
                  />
                </View>
                {customError && <Text style={styles.err}>{customError}</Text>}
                <PrimaryButton
                  title="Continuar com este valor"
                  onPress={submitCustom}
                  testID="custom-value-cta"
                  style={{ marginTop: spacing.md }}
                />
                <Text style={styles.customHint}>Valor mínimo: R$ 10,00</Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxxl, paddingHorizontal: spacing.lg },
  header: { paddingTop: spacing.md, paddingHorizontal: spacing.sm, marginBottom: spacing.xl },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    marginBottom: spacing.lg,
  },
  eyebrow: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: font.weight.bold,
    letterSpacing: 1.4,
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.onSurface,
    fontSize: font.size.display,
    fontWeight: font.weight.black,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  sub: {
    color: colors.onSurfaceMuted,
    fontSize: font.size.base,
    marginTop: spacing.md,
    lineHeight: 22,
  },
  list: { gap: spacing.lg },
  card: {
    backgroundColor: colors.cardTint,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  cardTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  tierIcon: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5,
  },
  priceBlock: { alignItems: "flex-end" },
  price: {
    color: colors.cardText,
    fontSize: font.size.xxl,
    fontWeight: font.weight.black,
    letterSpacing: -0.5,
  },
  perMonth: { color: colors.cardTextMuted, fontSize: font.size.sm },
  tierName: {
    marginTop: spacing.lg,
    color: colors.cardText,
    fontSize: font.size.xl,
    fontWeight: font.weight.bold,
  },
  tierSubtitle: {
    marginTop: 2,
    fontSize: font.size.base,
    fontWeight: font.weight.semibold,
  },
  tierDesc: {
    color: colors.cardTextMuted,
    fontSize: font.size.base,
    lineHeight: 22,
    marginTop: spacing.md,
  },
  customCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginTop: spacing.md,
  },
  customTitle: {
    color: colors.onSurface,
    fontSize: font.size.xl,
    fontWeight: font.weight.bold,
  },
  customSub: {
    color: colors.onSurfaceMuted,
    fontSize: font.size.base,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardTint,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  currencyLabel: {
    color: colors.cardText,
    fontSize: font.size.lg,
    fontWeight: font.weight.bold,
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.cardText,
    fontSize: font.size.xl,
    fontWeight: font.weight.bold,
    paddingVertical: 14,
  },
  err: { color: colors.danger, fontSize: font.size.sm, marginTop: spacing.sm },
  customHint: {
    color: colors.onSurfaceMuted,
    fontSize: font.size.sm,
    marginTop: spacing.sm,
    textAlign: "center",
  },
});
