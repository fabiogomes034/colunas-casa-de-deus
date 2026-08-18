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
          <View style={styles.hero} testID="home-hero">
            <Image source={{ uri: HERO }} style={StyleSheet.absoluteFill} contentFit="cover" />
            <LinearGradient
              colors={["rgba(11,17,32,0.15)", "rgba(11,17,32,0.55)", "rgba(11,17,32,0.98)"]}
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

            <View style={styles.verseCard} testID="home-verse-card">
              <Ionicons name="sparkles" size={22} color={colors.brand} />
              <Text style={styles.verseText}>
                "Cada um contribua segundo propôs no seu coração... Deus ama a quem dá com alegria."
              </Text>
              <Text style={styles.verseRef}>2 Coríntios 9:7</Text>
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
    height: 320,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radius.xl,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  heroContent: { padding: spacing.xl },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(37,99,235,0.85)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginBottom: spacing.md,
  },
  badgeText: {
    color: colors.onBrand,
    fontSize: 11,
    fontWeight: font.weight.bold,
    letterSpacing: 1.2,
  },
  church: {
    color: colors.onSurface,
    fontSize: font.size.lg,
    fontWeight: font.weight.black,
    letterSpacing: 0.5,
  },
  churchSub: {
    color: colors.onSurfaceMuted,
    fontSize: font.size.base,
    marginTop: 2,
  },
  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  title: {
    color: colors.onSurface,
    fontSize: font.size.display,
    fontWeight: font.weight.black,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  verseCard: {
    marginTop: spacing.xl,
    backgroundColor: colors.cardTint,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  verseText: {
    color: colors.cardText,
    fontSize: font.size.base,
    lineHeight: 24,
    fontStyle: "italic",
  },
  verseRef: {
    color: colors.brand,
    fontSize: font.size.sm,
    fontWeight: font.weight.bold,
    letterSpacing: 0.5,
  },
  leadText: {
    color: colors.onSurfaceMuted,
    fontSize: font.size.base,
    lineHeight: 24,
    marginTop: spacing.xl,
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
