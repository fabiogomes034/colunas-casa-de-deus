import React from "react";
import { Image, Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ScreenBackground } from "@/src/components/ScreenBackground";
import { colors, spacing, radius, font } from "@/src/lib/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Pressable com "afundada" suave ao tocar (spring)
function PressScale({
  children,
  onPress,
  onLongPress,
  delayLongPress,
  style,
  testID,
  entering,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  delayLongPress?: number;
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
      onLongPress={onLongPress}
      delayLongPress={delayLongPress}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
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

export default function PerfilTab() {
  const router = useRouter();

  const handleShare = async () => {
    try {
      await Share.share({
        message:
          "Conheça o app Colunas da Casa de Deus, da Igreja Visão Missionária - Sede Porto União: https://colunas-casa-de-deus.vercel.app",
      });
    } catch (error) {
      // usuário cancelou ou houve erro no compartilhamento nativo
    }
  };

  // Toque e segure no logo (~1.5s) abre o acesso do Pastor, sem botão visível
  const handleLogoLongPress = () => {
    router.push("/admin/login");
  };

  return (
    <ScreenBackground>
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
            <PressScale
              style={styles.avatarWrap}
              onLongPress={handleLogoLongPress}
              delayLongPress={1500}
              testID="perfil-logo-longpress"
            >
              <Image
                source={require("../../assets/images/logo-app.png")}
                style={styles.avatar}
                resizeMode="contain"
              />
            </PressScale>
            <View>
              <Text style={styles.title}>Igreja Visão Missionária</Text>
              <Text style={styles.subtitle}>Sede Porto União</Text>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(500).delay(100)}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>Sobre o projeto</Text>
            <Text style={styles.cardText}>
              "Colunas da Casa de Deus" é o projeto de contribuição mensal que sustenta a obra da
              igreja em nossa cidade. Cada coluna, no seu nível, fortalece a edificação.
            </Text>
          </Animated.View>

          {/* Acesso ao histórico de contribuições do membro */}
          <PressScale
            style={styles.linkRow}
            onPress={() => router.push("/historico")}
            testID="perfil-historico-link"
            entering={FadeInDown.duration(450).delay(160)}
          >
            <View style={styles.linkIconWrap}>
              <Ionicons name="time-outline" size={18} color={colors.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.linkTitle}>Meu histórico</Text>
              <Text style={styles.linkSub}>Suas contribuições ao longo do tempo</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceLo} />
          </PressScale>

          {/* Compartilhar o app */}
          <PressScale
            style={styles.linkRow}
            onPress={handleShare}
            testID="perfil-share-link"
            entering={FadeInDown.duration(450).delay(200)}
          >
            <View style={styles.linkIconWrap}>
              <Ionicons name="share-social-outline" size={18} color={colors.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.linkTitle}>Compartilhar o app</Text>
              <Text style={styles.linkSub}>Convide outros membros a participar</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceLo} />
          </PressScale>

          <PressScale
            style={styles.linkRow}
            onPress={() => Linking.openURL("https://wa.me/5541992246602")}
            testID="perfil-whatsapp"
            entering={FadeInDown.duration(450).delay(260)}
          >
            <View style={styles.linkIconWrap}>
              <Ionicons name="logo-whatsapp" size={18} color={colors.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.linkTitle}>Falar com a tesouraria</Text>
              <Text style={styles.linkSub}>Dúvidas sobre sua contribuição</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceLo} />
          </PressScale>

          <Animated.Text
            entering={FadeInDown.duration(450).delay(340)}
            style={styles.footerNote}
          >
            Colunas da Casa de Deus · Projeto 2026
          </Animated.Text>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  avatarWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: colors.card,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: font.size.lg,
    fontWeight: font.weight.bold,
    color: colors.onSurface,
  },
  subtitle: {
    fontSize: font.size.xs,
    color: colors.onSurfaceMuted,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: "#A3B1C6",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTitle: {
    fontSize: font.size.sm,
    fontWeight: font.weight.bold,
    color: colors.cardText,
    marginBottom: 6,
  },
  cardText: {
    fontSize: font.size.sm,
    color: colors.cardTextMuted,
    lineHeight: 20,
  },
  linkRow: {
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
  linkIconWrap: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  linkTitle: {
    fontSize: font.size.sm,
    fontWeight: font.weight.bold,
    color: colors.cardText,
  },
  linkSub: {
    fontSize: font.size.xs,
    color: colors.cardTextMuted,
    marginTop: 1,
  },
  footerNote: {
    textAlign: "center",
    fontSize: font.size.xs,
    color: colors.onSurfaceLo,
    marginTop: spacing.lg,
  },
});
