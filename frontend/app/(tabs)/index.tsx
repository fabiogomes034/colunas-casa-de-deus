import React from "react";
import { Image, ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ScreenBackground } from "@/src/components/ScreenBackground";
import { colors, spacing, radius, font, tierMeta, formatBRL, TierKey } from "@/src/lib/theme";

const NÍVEIS: TierKey[] = ["bronze", "prata", "ouro"];

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
          <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.avatar}>
                <Image
                  source={require("../../assets/images/logo-app.png")}
                  style={styles.avatarImage}
                  resizeMode="contain"
                />
              </View>
              <View>
                <Text style={styles.eyebrow}>Sede Porto União</Text>
                <Text style={styles.greeting}>Igreja Visão Missionária</Text>
              </View>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>2026</Text>
            </View>
          </Animated.View>

          {/* Card de projeto */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(100)}
            style={styles.projectCard}
            testID="home-project-card"
          >
            <Text style={styles.projectEyebrow}>PROJETO DE EDIFICAÇÃO</Text>
            <Text style={styles.projectTitle} testID="home-project-title">
              Colunas da Casa de Deus
            </Text>
            <Text style={styles.projectLead}>
              Seja uma coluna que sustenta, provê e edifica a obra do Senhor em nossa cidade.
            </Text>

            <PressScale
              onPress={() => router.push("/colunas" as any)}
              style={styles.projectCta}
              testID="home-cta-button"
            >
              <Text style={styles.projectCtaText}>Quero Ser Uma Coluna</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </PressScale>
          </Animated.View>

          {/* Acesso rápido aos 3 níveis */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(180)}
            style={styles.sectionHeader}
          >
            <Text style={styles.sectionTitle}>Seja uma coluna</Text>
            <Text style={styles.sectionCount}>3 níveis</Text>
          </Animated.View>

          <View style={styles.tiersRow}>
            {NÍVEIS.map((key, index) => {
              const item = tierMeta[key];
              return (
                <PressScale
                  key={key}
                  onPress={() => goToTier(key, item.amount)}
                  style={styles.tierChip}
                  testID={`home-tier-${key}`}
                  entering={FadeInDown.duration(450).delay(220 + index * 90)}
                >
                  <LinearGradient
                    colors={[item.lightColor, item.color]}
                    style={styles.tierChipIcon}
                  >
                    <Text style={styles.tierChipLetter}>{key.charAt(0).toUpperCase()}</Text>
                  </LinearGradient>
                  <Text style={styles.tierChipLabel}>{item.label.replace("Coluna ", "")}</Text>
                  <Text style={styles.tierChipPrice}>{formatBRL(item.amount)}</Text>
                </PressScale>
              );
            })}
          </View>

          {/* Versículo, agora discreto */}
          <Animated.View
            entering={FadeInUp.duration(500).delay(500)}
            style={styles.verseCard}
            testID="home-verse-card"
          >
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
          </Animated.View>
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
    overflow: "hidden",
    backgroundColor: colors.card,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
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
      color: colors.cardText,
  lineHeight: 30,
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
