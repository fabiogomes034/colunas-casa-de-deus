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
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ScreenBackground } from "@/src/components/ScreenBackground";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { colors, spacing, radius, font, tierMeta, formatBRL, TierKey } from "@/src/lib/theme";
import { api, Member, MemberStatus } from "@/src/lib/api";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Pressable com "afundada" suave ao tocar (spring)
function PressScale({
  children,
  onPress,
  style,
  testID,
  entering,
}: {
  children: React.ReactNode;
  onPress: () => void;
  style: any;
  testID?: string;
  entering?: any;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      style={[style, animatedStyle]}
      testID={testID}
      entering={entering}
    >
      {children}
    </AnimatedPressable>
  );
}

const STATUS_META: Record<MemberStatus, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: colors.onSurfaceMuted },
  aguardando_confirmacao: { label: "Aguardando confirmação", color: colors.brand },
  confirmado: { label: "Confirmado", color: colors.success },
};

function formatMonthYear(iso: string): string {
  try {
    const date = new Date(iso);
    const text = date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    return text.charAt(0).toUpperCase() + text.slice(1);
  } catch {
    return iso;
  }
}

export default function Historico() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [history, setHistory] = useState<Member[]>([]);

  const handlePhoneChange = (text: string) => {
    const raw = text.replace(/\D/g, "");
    let masked = raw;
    if (raw.length > 11) return;
    if (raw.length > 2) masked = `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    if (raw.length > 7) masked = `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
    setPhone(masked);
  };

  const handleSearch = async () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length !== 11) {
      setError("Digite um WhatsApp válido com DDD (11 dígitos).");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const result = await api.getByWhatsapp(digits);
      setHistory(result);
      setSearched(true);
    } catch (e: any) {
      setError(e.message || "Não foi possível buscar seu histórico agora.");
    } finally {
      setLoading(false);
    }
  };

  const totalConfirmado = history
    .filter((m) => m.status === "confirmado")
    .reduce((sum, m) => sum + m.amount, 0);

  const memberName = history[0]?.name;

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
            <View style={styles.header}>
              <PressScale
                onPress={() => router.back()}
                style={styles.backButton}
                testID="historico-back-btn"
              >
                <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
              </PressScale>
              <Text style={styles.headerTitle}>Meu histórico</Text>
              <View style={{ width: 40 }} />
            </View>

            <Animated.View entering={FadeInDown.duration(500)} style={styles.formCard}>
              <Text style={styles.fieldLabel}>SEU WHATSAPP</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="(42) 99999-9999"
                  placeholderTextColor={colors.onSurfaceLo}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={handlePhoneChange}
                  style={styles.inputField}
                  testID="historico-phone-input"
                />
              </View>
              <PrimaryButton
                title="Ver meu histórico"
                onPress={handleSearch}
                loading={loading}
                testID="historico-search-btn"
                style={{ marginTop: spacing.md }}
              />
              {error && <Text style={styles.errorText}>{error}</Text>}
            </Animated.View>

            {searched && history.length === 0 && !error && (
              <Animated.View entering={FadeInDown.duration(400)} style={styles.emptyCard}>
                <Ionicons name="search-outline" size={22} color={colors.onSurfaceLo} />
                <Text style={styles.emptyText}>
                  Não encontramos contribuições para esse WhatsApp ainda.
                </Text>
              </Animated.View>
            )}

            {history.length > 0 && (
              <>
                <Animated.View
                  entering={FadeInDown.duration(450).delay(80)}
                  style={styles.summaryCard}
                >
                  <Text style={styles.summaryName}>Olá, {memberName?.split(" ")[0]}!</Text>
                  <Text style={styles.summaryLabel}>Total já contribuído</Text>
                  <Text style={styles.summaryValue}>{formatBRL(totalConfirmado)}</Text>
                </Animated.View>

                <View style={styles.listWrap}>
                  {history.map((item, index) => {
                    const meta = tierMeta[item.level as TierKey] || tierMeta.prata;
                    const statusMeta = STATUS_META[item.status];
                    return (
                      <Animated.View
                        key={item.id}
                        entering={FadeInDown.duration(400).delay(120 + index * 60)}
                        style={styles.historyRow}
                      >
                        <LinearGradient
                          colors={[meta.lightColor, meta.color]}
                          style={styles.historyDot}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.historyMonth}>
                            {formatMonthYear(item.created_at)}
                          </Text>
                          <Text style={[styles.historyStatus, { color: statusMeta.color }]}>
                            {statusMeta.label}
                          </Text>
                        </View>
                        <Text style={styles.historyValue}>{formatBRL(item.amount)}</Text>
                      </Animated.View>
                    );
                  })}
                </View>
              </>
            )}
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
    gap: spacing.md,
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
  formCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
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
  errorText: {
    color: colors.error,
    fontSize: font.size.xs,
    marginTop: spacing.sm,
    textAlign: "center",
    fontWeight: font.weight.medium,
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: font.size.sm,
    color: colors.onSurfaceMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: "center",
    shadowColor: "#A3B1C6",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 3,
  },
  summaryName: {
    fontSize: font.size.base,
    fontWeight: font.weight.bold,
    color: colors.onSurface,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: font.size.xs,
    color: colors.onSurfaceMuted,
  },
  summaryValue: {
    fontSize: font.size.xl,
    fontWeight: font.weight.black,
    color: colors.brand,
    marginTop: 2,
  },
  listWrap: {
    gap: spacing.sm,
  },
  historyRow: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    shadowColor: "#A3B1C6",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 2,
  },
  historyDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  historyMonth: {
    fontSize: font.size.sm,
    fontWeight: font.weight.bold,
    color: colors.onSurface,
  },
  historyStatus: {
    fontSize: font.size.xs,
    fontWeight: font.weight.medium,
    marginTop: 2,
  },
  historyValue: {
    fontSize: font.size.sm,
    fontWeight: font.weight.black,
    color: colors.onSurface,
  },
});
