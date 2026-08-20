import React from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { ScreenBackground } from "@/src/components/ScreenBackground";
import { colors, spacing, radius, font, tierMeta, formatBRL, TierKey } from "@/src/lib/theme";

const NÍVEIS: TierKey[] = ["bronze", "prata", "ouro"];

export default function Home() {
  const router = useRouter();

  const goToTier = (tier: string, amount: number) => {
    router.push({ pathname: "/register", params: { tier, amount: String(amount) } });
  };

  return (
    <ScreenBackground>
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Cabeçalho compacto */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <LinearGradient
                colors={[colors.brandLight, colors.brand]}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>IVM</Text>
              </LinearGradient>
              <View>
                <Text style={styles.eyebrow}>Sede Porto União</Text>
                <Text style={styles.greeting}>Igreja Visão Missionária</Text>
              </View>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>2026</Text>
            </View>
          </View>

          {/* Card de projeto */}
          <View style={styles.projectCard} testID="home-project-card">
            <Text style={styles.projectEyebrow}>PROJETO DE EDIFICAÇÃO</Text>
            <Text style={styles.projectTitle} testID="home-project-title">
              Colunas da Casa de Deus
            </Text>
            <Text style={styles.projectLead}>
              Seja uma coluna que sustenta, provê e edifica a obra do Senhor em nossa cidade.
            </Text>

            <Pressable
              onPress={() => router.push("/colunas" as any)}
              style={styles.projectCta}
              testID="home-cta-button"
            >
              <Text style={styles.projectCtaText}>Quero Ser Uma Coluna</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Acesso rápido aos 3 níveis */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Seja uma coluna</Text>
            <Text style={styles.sectionCount}>3 níveis</Text>
          </View>

          <View style={styles.tiersRow}>
            {NÍVEIS.map((key) => {
              const item = tierMeta[key];
              return (
                <Pressable
                  key={key}
                  onPress={() => goToTier(key, item.amount)}
                  style={styles.tierChip}
                  testID={`home-tier-${key}`}
                >
                  <LinearGradient
                    colors={[item.lightColor, item.color]}
                    style={styles.tierChipIcon}
                  >
                    <Text style={styles.tierChipLetter}>{key.charAt(0).toUpperCase()}</Text>
                  </LinearGradient>
                  <Text style={styles.tierChipLabel}>{item.label.replace("Coluna ", "")}</Text>
                  <Text style={styles.tierChipPrice}>{formatBRL(item.amount)}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Versículo, agora discreto */}
          <View style={styles.verseCard} testID="home-verse-card">
            <View style={styles.verseIconCircle}>
              <Ionicons name="sparkles" size={14} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.verseText}>
                "Cada um contribua segundo propôs no seu coração... Deus ama a quem dá com
                alegria."
              </Text>
              <Text style={styles.verseRef}>2 Coríntios 9:7</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: font.weight.black,
    fontSize: 12,
  },
  eyebrow: {
    fontSize: 10.5,
    fontWeight: font.weight.bold,
    color: colors.onSurfaceMuted,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  greeting: {
    fontSize: font.size.base,
    fontWeight: font.weight.bold,
    color: colors.onSurface,
    marginTop: 1,
  },
  badge: {
    backgroundColor: colors.card,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    shadowColor: "#A3B1C6",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 2,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: font.weight.bold,
    color: colors.brand,
  },
  projectCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.lg,
    shadowColor: "#A3B1C6",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 4,
  },
  projectEyebrow: {
    fontSize: 10.5,
    fontWeight: font.weight.bold,
    color: colors.brand,
    letterSpacing: 1.1,
    marginBottom: 6,
  },
  projectTitle: {
    fontSize: font.size.xl,
    fontWeight: font.weight.black,
    color: colors.onSurface,
    lineHeight: 30,
  },
  projectLead: {
    fontSize: font.size.sm,
    color: colors.onSurfaceMuted,
    lineHeight: 20,
    marginTop: 8,
  },
  projectCta: {
    marginTop: spacing.lg,
    backgroundColor: colors.brand,
    borderRadius: radius.md,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  projectCtaText: {
    color: "#FFFFFF",
    fontSize: font.size.sm,
    fontWeight: font.weight.bold,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: font.size.base,
    fontWeight: font.weight.bold,
    color: colors.onSurface,
  },
  sectionCount: {
    fontSize: font.size.xs,
    color: colors.onSurfaceMuted,
  },
  tiersRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  tierChip: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.sm,
    alignItems: "flex-start",
    gap: 6,
    shadowColor: "#A3B1C6",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 2,
  },
  tierChipIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tierChipLetter: {
    color: "#FFFFFF",
    fontWeight: font.weight.black,
    fontSize: 12,
  },
  tierChipLabel: {
    fontSize: 11.5,
    fontWeight: font.weight.bold,
    color: colors.onSurface,
  },
  tierChipPrice: {
    fontSize: 10.5,
    fontWeight: font.weight.medium,
    color: colors.onSurfaceMuted,
  },
  verseCard: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: "flex-start",
    shadowColor: "#A3B1C6",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 2,
  },
  verseIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  verseText: {
    color: colors.onSurfaceMuted,
    fontSize: font.size.xs,
    lineHeight: 18,
    fontStyle: "italic",
  },
  verseRef: {
    color: colors.brand,
    fontSize: 10.5,
    fontWeight: font.weight.bold,
    marginTop: 4,
  },
});
