import React from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInDown,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ScreenBackground } from "@/src/components/ScreenBackground";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { colors, spacing, radius, font, tierMeta, TierKey } from "@/src/lib/theme";

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

export default function Certificate() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    name?: string;
    tier?: string;
  }>();

  const name = params.name || "Irmão(ã) em Cristo";
  const tierKey = (params.tier as TierKey) || "prata";
  const meta = tierMeta[tierKey] || tierMeta.prata;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Eu sou uma ${meta.label} no projeto de edificação da Casa de Deus! Junte-se a nós nesta obra.`,
      });
    } catch (error) {
      console.log("Erro ao compartilhar", error);
    }
  };

  const handleDownload = () => {
    Alert.alert(
      "Certificado Gerado!",
      "O seu certificado foi registrado com sucesso na tesouraria da igreja."
    );
  };

  return (
    <ScreenBackground>
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Cabeçalho */}
          <View style={styles.header}>
            <PressScale
              onPress={() => router.push("/")}
              style={styles.backButton}
              testID="certificate-home-btn"
            >
              <Ionicons name="home-outline" size={20} color={colors.onSurface} />
            </PressScale>
            <Text style={styles.headerTitle}>Certificado</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Destaque / Celebração */}
          <View style={styles.confettiSection}>
            <Animated.View entering={ZoomIn.duration(550).delay(80)}>
              <LinearGradient
                colors={[colors.ouroLight, colors.ouro]}
                style={styles.badgeIcon}
              >
                <Ionicons name="star" size={28} color="#FFFFFF" />
              </LinearGradient>
            </Animated.View>
            <Animated.Text
              entering={FadeInDown.duration(450).delay(220)}
              style={styles.celebrateTitle}
            >
              Você é uma coluna! 🎉
            </Animated.Text>
            <Animated.Text
              entering={FadeInDown.duration(450).delay(280)}
              style={styles.celebrateSubtitle}
            >
              Obrigado por sustentar e edificar a Casa de Deus
            </Animated.Text>
          </View>

          {/* Cartão do Certificado Soft Light */}
          <Animated.View
            entering={FadeInDown.duration(550).delay(340)}
            style={styles.certCard}
          >
            <View style={styles.certGlow} />

            <Text style={styles.certEyebrow}>CERTIFICADO DE CONTRIBUIÇÃO</Text>
            <Text style={styles.certProjectTitle}>Colunas da Casa de Deus</Text>

            <Text style={styles.certName}>{name}</Text>

            <View style={styles.certDivider} />

            <Text style={styles.certDesc}>
              É certificado que o(a) contribuinte acima é reconhecido(a) como {meta.label} da Igreja Visão Missionária — Sede Porto União.
            </Text>

            <View style={styles.tierTag}>
              <LinearGradient
                colors={[meta.lightColor, meta.color]}
                style={styles.tierDot}
              />
              <Text style={styles.tierTagText}>{meta.label}</Text>
            </View>

            <Text style={styles.certDate}>Emitido em agosto de 2026</Text>
          </Animated.View>

          {/* Botões de Ação */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(460)}
            style={styles.actionsRow}
          >
            <PressScale
              onPress={handleDownload}
              style={[styles.actionBtn, styles.actionPrimary]}
              testID="certificate-download-btn"
            >
              <Ionicons name="download-outline" size={18} color="#FFFFFF" />
              <Text style={styles.actionPrimaryText}>Baixar</Text>
            </PressScale>

            <PressScale
              onPress={handleShare}
              style={[styles.actionBtn, styles.actionSecondary]}
              testID="certificate-share-btn"
            >
              <Ionicons name="share-social-outline" size={18} color={colors.onSurface} />
              <Text style={styles.actionSecondaryText}>Compartilhar</Text>
            </PressScale>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(500).delay(520)}>
            <PrimaryButton
              title="Voltar ao Início"
              onPress={() => router.push("/")}
              style={{ marginTop: spacing.sm }}
            />
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
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
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
  confettiSection: {
    alignItems: "center",
    marginTop: spacing.xs,
  },
  badgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
    shadowColor: colors.ouro,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  celebrateTitle: {
    fontSize: font.size.lg,
    fontWeight: font.weight.black,
    color: colors.onSurface,
  },
  celebrateSubtitle: {
    fontSize: font.size.xs,
    color: colors.onSurfaceMuted,
    marginTop: 4,
    fontWeight: font.weight.medium,
  },
  certCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    shadowColor: "#A3B1C6",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 4,
  },
  certGlow: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(231, 160, 18, 0.08)",
  },
  certEyebrow: {
    fontSize: 10,
    fontWeight: font.weight.bold,
    color: colors.ouro,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  certProjectTitle: {
    fontSize: font.size.lg,
    fontWeight: font.weight.bold,
    color: colors.onSurface,
    marginTop: 6,
  },
  certName: {
    fontSize: font.size.xl,
    fontWeight: font.weight.black,
    color: colors.brand,
    marginVertical: spacing.md,
    textAlign: "center",
  },
  certDivider: {
    width: 44,
    height: 2.5,
    backgroundColor: colors.ouro,
    borderRadius: 2,
    marginBottom: spacing.md,
  },
  certDesc: {
    fontSize: font.size.xs,
    color: colors.onSurfaceMuted,
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: spacing.sm,
  },
  tierTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.md,
    marginTop: spacing.md,
    gap: 8,
  },
  tierDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  tierTagText: {
    fontSize: font.size.xs,
    fontWeight: font.weight.bold,
    color: colors.onSurface,
  },
  certDate: {
    fontSize: 10,
    color: colors.onSurfaceLo,
    fontWeight: font.weight.semibold,
    marginTop: spacing.lg,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionPrimary: {
    backgroundColor: colors.brand,
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 3,
  },
  actionPrimaryText: {
    color: "#FFFFFF",
    fontSize: font.size.xs,
    fontWeight: font.weight.bold,
  },
  actionSecondary: {
    backgroundColor: colors.card,
    shadowColor: "#A3B1C6",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 2,
  },
  actionSecondaryText: {
    color: colors.onSurface,
    fontSize: font.size.xs,
    fontWeight: font.weight.bold,
  },
});
