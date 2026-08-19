import React from "react";
import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { ScreenBackground } from "@/src/components/ScreenBackground";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { colors, spacing, radius, font } from "@/src/lib/theme";

const HERO =
  "https://images.unsplash.com/photo-1676302643892-539340907647?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwyfHxjaHVyY2glMjBwaWxsYXIlMjBhcmNoaXRlY3R1cmUlMjBkYXJrfGVufDB8fHx8MTc4NzA5MDYxMnww&ixlib=rb-4.1.0&q=85";

export default function Home() {
  const router = useRouter();
  return (
    <ScreenBackground>
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Card Hero com iluminação */}
          <View style={styles.hero} testID="home-hero">
            <Image source={{ uri: HERO }} style={StyleSheet.absoluteFill} contentFit="cover" />
            <LinearGradient
              colors={["rgba(238,241,246,0.1)", "rgba(29,36,51,0.5)", "rgba(29,36,51,0.92)"]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroContent}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>PROJETO 2026</Text>
              </View>
              <Text style={styles.church} testID="home-church-name">
                IGREJA VISÃO MISSIONÁRIA
              </Text>
              <Text style={styles.churchSub}>Sede Porto União</Text>
            </View>
          </View>

          <View style={styles.body}>
            <Text style={styles.title} testID="home-project-title">
              Colunas da{"\n"}Casa de Deus
            </Text>

            {/* Card do Versículo em estilo Soft Light */}
            <View style={styles.verseCard} testID="home-verse-card">
              <View style={styles.verseHeader}>
                <View style={styles.verseIconCircle}>
                  <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                </View>
                <Text style={styles.verseRef}>2 Coríntios 9:7</Text>
              </View>
              <Text style={styles.verseText}>
                "Cada um contribua segundo propôs no seu coração... Deus ama a quem dá com alegria."
              </Text>
            </View>

            <Text style={styles.leadText}>
              Seja uma coluna que sustenta, provê e edifica a obra do Senhor em nossa cidade.
            </Text>

            <PrimaryButton
              title="Quero Ser Uma Coluna"
              onPress={() => router.push("/levels")}
              testID="home-cta-button"
              style={{ marginTop: spacing.xl }}
            />

            <Pressable
              onPress={() => router.push("/admin/login")}
              style={styles.adminLink}
              testID="home-admin-link"
            >
              <Ionicons name="lock-closed-outline" size={14} color={colors.onSurfaceMuted} />
              <Text style={styles.adminLinkText}>Acesso do Pastor</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingBottom: spacing.xxxl },
  hero: {
    height: 290,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radius.xl,
    overflow: "hidden",
    justifyContent: "flex-end",
    shadowColor: "#A3B1C6",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 5,
  },
  heroContent: { padding: spacing.xl },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: colors.brand,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    marginBottom: spacing.md,
  },
  badgeText: {
    color: colors.onBrand,
    fontSize: 10.5,
    fontWeight: font.weight.bold,
    letterSpacing: 1.1,
  },
  church: {
    color: "#FFFFFF",
    fontSize: font.size.lg,
    fontWeight: font.weight.black,
    letterSpacing: 0.5,
  },
  churchSub: {
    color: "rgba(255,255,255,0.8)",
    fontSize: font.size.base,
    marginTop: 2,
    fontWeight: font.weight.medium,
  },
  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  title: {
    color: colors.onSurface,
    fontSize: font.size.display,
    fontWeight: font.weight.black,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  verseCard: {
    marginTop: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    shadowColor: "#A3B1C6",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 4, height: 6 },
    elevation: 3,
  },
  verseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  verseIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  verseText: {
    color: colors.onSurfaceMuted,
    fontSize: font.size.base,
    lineHeight: 22,
    fontStyle: "italic",
  },
  verseRef: {
    color: colors.brand,
    fontSize: font.size.sm,
    fontWeight: font.weight.bold,
  },
  leadText: {
    color: colors.onSurfaceMuted,
    fontSize: font.size.base,
    lineHeight: 22,
    marginTop: spacing.lg,
  },
  adminLink: {
    marginTop: spacing.xl,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: spacing.sm,
  },
  adminLinkText: {
    color: colors.onSurfaceMuted,
    fontSize: font.size.sm,
    fontWeight: font.weight.medium,
  },
});
