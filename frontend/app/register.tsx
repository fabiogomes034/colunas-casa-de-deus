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
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { ScreenBackground } from "@/src/components/ScreenBackground";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { colors, spacing, radius, font, tierMeta, TierKey } from "@/src/lib/theme";

const TIERS: TierKey[] = ["bronze", "prata", "ouro"];

export default function Register() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tier?: string; amount?: string }>();

  const initialTier = (params.tier as TierKey) || "prata";
  const [selectedTier, setSelectedTier] = useState<TierKey>(
    TIERS.includes(initialTier) ? initialTier : "prata"
  );
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhoneChange = (text: string) => {
    const raw = text.replace(/\D/g, "");
    let masked = raw;
    if (raw.length > 11) return;
    if (raw.length > 2) masked = `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    if (raw.length > 7) masked = `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
    setPhone(masked);
  };

  const handleContinue = async () => {
    if (!name.trim()) {
      setError("Por favor, digite seu nome completo.");
      return;
    }
    if (phone.replace(/\D/g, "").length < 10) {
      setError("Por favor, insira um número de WhatsApp válido com DDD.");
      return;
    }

    setError(null);
    setLoading(true);

    const amount = tierMeta[selectedTier].amount;

    router.push({
      pathname: "/payment",
      params: {
        name: name.trim(),
        phone: phone.trim(),
        tier: selectedTier,
        amount: String(amount),
      },
    });

    setLoading(false);
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
            {/* Cabeçalho */}
            <View style={styles.header}>
              <Pressable
                onPress={() => router.back()}
                style={styles.backButton}
                testID="register-back-btn"
              >
                <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
              </Pressable>
              <Text style={styles.headerTitle}>Seja uma coluna</Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Texto Hero */}
            <View style={styles.leadContainer}>
              <Text style={styles.eyebrow}>PASSO 1 DE 2</Text>
              <Text style={styles.title}>Conte pra gente{"\n"}quem é você</Text>
              <Text style={styles.subtitle}>
                Seus dados ficam só com a tesouraria da igreja, usados apenas para lembrete mensal e certificado.
              </Text>
            </View>

            {/* Card do Formulário */}
            <View style={styles.formCard}>
              <View>
                <Text style={styles.fieldLabel}>NOME COMPLETO</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    placeholder="Digite seu nome"
                    placeholderTextColor={colors.onSurfaceLo}
                    value={name}
                    onChangeText={(v) => {
                      setName(v);
                      if (error) setError(null);
                    }}
                    style={styles.inputField}
                    testID="register-name-input"
                  />
                </View>
              </View>

              <View>
                <Text style={styles.fieldLabel}>WHATSAPP</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    placeholder="(42) 99999-9999"
                    placeholderTextColor={colors.onSurfaceLo}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={handlePhoneChange}
                    style={styles.inputField}
                    testID="register-phone-input"
                  />
                </View>
              </View>

              <View>
                <Text style={styles.fieldLabel}>ESCOLHA SUA COLUNA</Text>
                <View style={styles.tierSelectRow}>
                  {TIERS.map((tier) => {
                    const item = tierMeta[tier];
                    const isSelected = selectedTier === tier;

                    return (
                      <Pressable
                        key={tier}
                        onPress={() => setSelectedTier(tier)}
                        style={[styles.tierOption, isSelected && styles.tierOptionSelected]}
                        testID={`register-tier-${tier}`}
                      >
                        <LinearGradient
                          colors={[item.lightColor, item.color]}
                          style={styles.tierDot}
                        />
                        <Text style={[styles.tierName, isSelected && styles.tierTextSelected]}>
                          {item.label.replace("Coluna ", "")}
                        </Text>
                        <Text style={styles.tierPrice}>R$ {item.amount}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <PrimaryButton
              title="Continuar para pagamento"
              onPress={handleContinue}
              loading={loading}
              testID="register-submit-btn"
              style={{ marginTop: spacing.lg }}
            />

            <View style={styles.trustRow}>
              <Ionicons name="shield-checkmark-outline" size={14} color={colors.onSurfaceLo} />
              <Text style={styles.trustText}>Seus dados estão seguros</Text>
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
    paddingBottom: spacing.xxxl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#A3B1C6",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: font.size.base,
    fontWeight: font.weight.bold,
    color: colors.onSurface,
  },
  leadContainer: {
    marginTop: spacing.md,
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
  formCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.lg,
    shadowColor: "#A3B1C6",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 3,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: font.weight.bold,
    color: colors.onSurfaceMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 50,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputField: {
    fontSize: font.size.base,
    color: colors.onSurface,
    fontWeight: font.weight.medium,
  },
  tierSelectRow: {
    flexDirection: "row",
    gap: 8,
  },
  tierOption: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  tierOptionSelected: {
    backgroundColor: colors.card,
    borderColor: colors.brand,
    shadowColor: "#A3B1C6",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 2,
  },
  tierDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginBottom: 6,
  },
  tierName: {
    fontSize: font.size.xs,
    fontWeight: font.weight.bold,
    color: colors.onSurfaceMuted,
  },
  tierTextSelected: {
    color: colors.onSurface,
  },
  tierPrice: {
    fontSize: 10.5,
    color: colors.onSurfaceMuted,
    fontWeight: font.weight.medium,
    marginTop: 2,
  },
  errorText: {
    color: colors.error,
    fontSize: font.size.xs,
    marginTop: spacing.sm,
    textAlign: "center",
    fontWeight: font.weight.medium,
  },
  trustRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: spacing.md,
  },
  trustText: {
    fontSize: font.size.xs,
    color: colors.onSurfaceLo,
    fontWeight: font.weight.medium,
  },
});
