import React, { useEffect, useState } from "react";
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
import { colors, spacing, radius, font } from "@/src/lib/theme";
import { useAuth } from "@/src/lib/auth";

export default function AdminLogin() {
  const router = useRouter();
  const { signIn, token, loading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && token) router.replace("/admin/dashboard");
  }, [loading, token]);

  const submit = async () => {
    if (!username.trim() || !password) return;
    setSubmitting(true);
    setError(null);
    try {
      await signIn(username.trim(), password);
      router.replace("/admin/dashboard");
    } catch (e: any) {
      setError(e?.message || "Usuário ou senha inválidos");
    } finally {
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
            <Pressable onPress={() => router.replace("/")} style={styles.back} testID="back-button">
              <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
            </Pressable>

            <View style={styles.hero}>
              <View style={styles.iconWrap}>
                <Ionicons name="shield-checkmark" size={30} color={colors.brand} />
              </View>
              <Text style={styles.title}>Painel do Pastor</Text>
              <Text style={styles.sub}>
                Área restrita. Acesse com suas credenciais para acompanhar as contribuições dos membros.
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>Usuário</Text>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Seu usuário"
                  placeholderTextColor={colors.cardTextMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                  testID="admin-username-input"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Senha</Text>
                <View style={styles.passRow}>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor={colors.cardTextMuted}
                    secureTextEntry={!showPass}
                    style={[styles.input, { flex: 1 }]}
                    testID="admin-password-input"
                  />
                  <Pressable onPress={() => setShowPass((s) => !s)} style={styles.eye}>
                    <Ionicons
                      name={showPass ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={colors.cardTextMuted}
                    />
                  </Pressable>
                </View>
              </View>

              {error && (
                <Text style={styles.err} testID="admin-login-error">
                  {error}
                </Text>
              )}

              <PrimaryButton
                title="Entrar"
                onPress={submit}
                loading={submitting}
                disabled={!username.trim() || !password}
                testID="admin-login-submit"
                style={{ marginTop: spacing.lg }}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: spacing.xl, justifyContent: "center" },
  back: {
    position: "absolute", top: spacing.md, left: spacing.md,
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    zIndex: 1,
  },
  hero: { alignItems: "center", marginBottom: spacing.xxl },
  iconWrap: {
    width: 72, height: 72, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
    backgroundColor: colors.brandTint,
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.onSurface, fontSize: font.size.xxl,
    fontWeight: font.weight.black, letterSpacing: -0.5,
  },
  sub: {
    color: colors.onSurfaceMuted, fontSize: font.size.base,
    marginTop: spacing.md, textAlign: "center", lineHeight: 22,
  },
  form: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  field: { marginBottom: spacing.lg },
  label: {
    color: colors.onSurface, fontSize: font.size.sm,
    fontWeight: font.weight.semibold, marginBottom: spacing.sm, letterSpacing: 0.4,
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
  passRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  eye: {
    width: 44, height: 44, borderRadius: radius.md,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  err: {
    color: colors.danger, fontSize: font.size.base,
    textAlign: "center", marginTop: spacing.sm,
  },
});
