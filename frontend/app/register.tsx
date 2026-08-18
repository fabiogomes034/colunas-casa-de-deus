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

import { ScreenBackground } from "@/src/components/ScreenBackground";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { colors, spacing, radius, font, tierMeta, tierColor, formatBRL } from "@/src/lib/theme";
import { maskBRPhone, unmaskPhone } from "@/src/lib/phoneMask";
import { api, Level } from "@/src/lib/api";

export default function Register() {
  const router = useRouter();
  const params = useLocalSearchParams<{ level: string; amount: string }>();
  const level = (params.level || "bronze") as Level;
  const amount = Number(params.amount || 50);
  const meta = level !== "outro" ? tierMeta[level] : undefined;
  const tierC = tierColor(level);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameOk = name.trim().length >= 2;
  const phoneDigits = unmaskPhone(phone);
  const phoneOk = phoneDigits.length === 11;
  const canSubmit = nameOk && phoneOk && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const member = await api.createMember({
        name: name.trim(),
        whatsapp: phoneDigits,
        level,
        amount,
      });
      router.replace({
        pathname: "/payment",
        params: { memberId: member.id },
      });
    } catch (e: any) {
      setError(e?.message || "Erro ao cadastrar. Tente novamente.");
      setSubmitting(false);
    }
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
              <Text style={styles.eyebrow}>CADASTRO RÁPIDO</Text>
              <Text style={styles.title}>Seus dados</Text>
              <Text style={styles.sub}>
                Preencha rapidamente para prosseguir para o PIX. Você poderá salvar seu certificado ao final.
              </Text>
            </View>

            <View style={[styles.summary, { borderColor: tierC }]} testID="register-summary">
              <View style={[styles.summaryDot, { backgroundColor: tierC }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryLabel}>
                  {meta ? meta.label : "Semear Outro Valor"}
                </Text>
                <Text style={styles.summarySub}>
                  {meta ? meta.subtitle : "Contribuição livre"}
                </Text>
              </View>
              <Text style={styles.summaryAmount}>{formatBRL(amount)}</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>Nome completo</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Como você quer aparecer no certificado"
                  placeholderTextColor={colors.cardTextMuted}
                  style={styles.input}
                  autoCapitalize="words"
                  testID="register-name-input"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>WhatsApp</Text>
                <TextInput
                  value={phone}
                  onChangeText={(v) => setPhone(maskBRPhone(v))}
                  placeholder="(00) 00000-0000"
                  placeholderTextColor={colors.cardTextMuted}
                  keyboardType="phone-pad"
                  style={styles.input}
                  maxLength={16}
                  testID="register-phone-input"
                />
                <Text style={styles.hint}>Usaremos para lembretes mensais opcionais.</Text>
              </View>

              {error && <Text style={styles.err} testID="register-error">{error}</Text>}

              <PrimaryButton
                title="Ir para o PIX"
                onPress={submit}
                disabled={!canSubmit}
                loading={submitting}
                testID="register-submit"
                style={{ marginTop: spacing.xl }}
              />
              <Text style={styles.privacy}>
                Seus dados são usados apenas pela Igreja Visão Missionária — Sede Porto União.
              </Text>
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
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    marginBottom: spacing.lg,
  },
  eyebrow: { color: colors.brand, fontSize: 12, fontWeight: font.weight.bold, letterSpacing: 1.4, marginBottom: spacing.sm },
  title: { color: colors.onSurface, fontSize: font.size.display, fontWeight: font.weight.black, letterSpacing: -0.5 },
  sub: { color: colors.onSurfaceMuted, fontSize: font.size.base, marginTop: spacing.md, lineHeight: 22 },
  summary: {
    flexDirection: "row", alignItems: "center", gap: spacing.md,
    backgroundColor: colors.cardTint,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderLeftWidth: 4,
  },
  summaryDot: { width: 10, height: 10, borderRadius: 5 },
  summaryLabel: { color: colors.cardText, fontSize: font.size.lg, fontWeight: font.weight.bold },
  summarySub: { color: colors.cardTextMuted, fontSize: font.size.sm, marginTop: 2 },
  summaryAmount: { color: colors.cardText, fontSize: font.size.xl, fontWeight: font.weight.black },
  form: {
    marginTop: spacing.xl,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  field: { marginBottom: spacing.lg },
  label: {
    color: colors.onSurface,
    fontSize: font.size.sm,
    fontWeight: font.weight.semibold,
    marginBottom: spacing.sm,
    letterSpacing: 0.4,
  },
  input: {
    backgroundColor: colors.cardTint,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    color: colors.cardText,
    fontSize: font.size.lg,
    fontWeight: font.weight.medium,
  },
  hint: { color: colors.onSurfaceMuted, fontSize: font.size.sm, marginTop: spacing.sm },
  err: { color: colors.danger, fontSize: font.size.base, marginTop: spacing.sm, textAlign: "center" },
  privacy: {
    color: colors.onSurfaceMuted,
    fontSize: font.size.sm,
    textAlign: "center",
    marginTop: spacing.lg,
    lineHeight: 20,
  },
});
