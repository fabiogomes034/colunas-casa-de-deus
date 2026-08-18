import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import ViewShot, { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";

import { ScreenBackground } from "@/src/components/ScreenBackground";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { colors, spacing, radius, font, tierMeta, tierColor, Tier } from "@/src/lib/theme";
import { api, Member } from "@/src/lib/api";

const BLESSINGS: Record<Exclude<Tier, "outro">, string> = {
  bronze: "Que o Senhor firme sua base e multiplique cada semente. Você é parte da sustentação da nossa casa.",
  prata: "Que a provisão de Deus flua sobre sua vida em abundância. Sua oferta expande a missão.",
  ouro: "Que o Deus fiel edifique através de você um legado eterno. Sua fidelidade constrói o futuro.",
};

export default function Certificate() {
  const router = useRouter();
  const { memberId } = useLocalSearchParams<{ memberId: string }>();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const shotRef = useRef<ViewShot>(null);

  useEffect(() => {
    if (!memberId) return;
    api.getMember(memberId as string).then(setMember).finally(() => setLoading(false));
  }, [memberId]);

  const tier: Tier = (member?.level as Tier) || "bronze";
  const isCustom = tier === "outro";
  const meta = !isCustom ? tierMeta[tier] : null;
  const tierC = tierColor(tier);
  const blessing = !isCustom ? BLESSINGS[tier] : "Que o Senhor abençoe cada semente lançada em Sua obra. Você é uma coluna neste projeto.";

  const share = async () => {
    if (!shotRef.current) return;
    setSharing(true);
    try {
      const uri = await captureRef(shotRef, { format: "png", quality: 1, result: "tmpfile" });
      if (Platform.OS === "web") {
        const link = document.createElement("a");
        link.href = uri;
        link.download = `certificado-${member?.name?.replace(/\s+/g, "-").toLowerCase() || "colunas"}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Compartilhar Certificado" });
      }
    } catch (e) {
      // silent
    } finally {
      setSharing(false);
    }
  };

  if (loading) {
    return (
      <ScreenBackground>
        <SafeAreaView style={styles.center}>
          <ActivityIndicator color={colors.onSurface} size="large" />
        </SafeAreaView>
      </ScreenBackground>
    );
  }
  if (!member) {
    return (
      <ScreenBackground>
        <SafeAreaView style={styles.center}>
          <Text style={{ color: colors.onSurface }}>Cadastro não encontrado.</Text>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Pressable onPress={() => router.replace("/")} style={styles.back} testID="back-button">
              <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
            </Pressable>
            <Text style={styles.eyebrow}>SEU CERTIFICADO</Text>
            <Text style={styles.title}>Gratidão!</Text>
            <Text style={styles.sub}>
              Que Deus multiplique cada semente. Compartilhe seu compromisso com a família.
            </Text>
          </View>

          <ViewShot ref={shotRef} options={{ format: "png", quality: 1 }} style={styles.certWrap}>
            <View style={[styles.cert, { borderColor: tierC }]} testID="certificate-card">
              <LinearGradient
                colors={["#0B1120", "#111827", "#0B1120"]}
                style={StyleSheet.absoluteFill}
              />
              <View style={[styles.certGlow, { backgroundColor: tierC + "30" }]} />

              <View style={styles.certHead}>
                <View style={[styles.seal, { borderColor: tierC }]}>
                  <Text style={{ fontSize: 34 }}>{meta?.emoji || "✨"}</Text>
                </View>
                <Text style={styles.certChurch}>IGREJA VISÃO MISSIONÁRIA</Text>
                <Text style={styles.certChurchSub}>Sede Porto União</Text>
              </View>

              <View style={styles.certBody}>
                <Text style={styles.certOverline}>CERTIFICADO DE GRATIDÃO</Text>
                <Text style={styles.certName} numberOfLines={2}>
                  {member.name}
                </Text>
                <View style={[styles.certDivider, { backgroundColor: tierC }]} />
                <Text style={styles.certLevelLabel}>é parte da</Text>
                <Text style={[styles.certLevel, { color: tierC }]}>
                  {meta ? meta.label.toUpperCase() : "COLUNA DA CASA DE DEUS"}
                </Text>
                {meta && (
                  <Text style={[styles.certLevelSub, { color: tierC }]}>
                    {meta.subtitle}
                  </Text>
                )}
              </View>

              <Text style={styles.blessing}>{blessing}</Text>

              <View style={styles.certFooter}>
                <Text style={styles.verse}>
                  "Deus ama a quem dá com alegria." — 2 Coríntios 9:7
                </Text>
                <Text style={styles.project}>Projeto Colunas da Casa de Deus · 2026</Text>
              </View>
            </View>
          </ViewShot>

          <PrimaryButton
            title="Salvar / Compartilhar Certificado"
            onPress={share}
            loading={sharing}
            color={tierC}
            textColor="#0B1120"
            style={{ marginTop: spacing.xl }}
            testID="share-certificate-button"
          />

          <Pressable
            onPress={() => router.replace("/")}
            style={styles.homeLink}
            testID="back-home-link"
          >
            <Text style={styles.homeLinkText}>Voltar para o início</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxxl, paddingHorizontal: spacing.lg },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { paddingTop: spacing.md, paddingHorizontal: spacing.sm, marginBottom: spacing.lg },
  back: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    marginBottom: spacing.lg,
  },
  eyebrow: { color: colors.brand, fontSize: 12, fontWeight: font.weight.bold, letterSpacing: 1.4, marginBottom: spacing.sm },
  title: { color: colors.onSurface, fontSize: font.size.display, fontWeight: font.weight.black },
  sub: { color: colors.onSurfaceMuted, fontSize: font.size.base, marginTop: spacing.md, lineHeight: 22 },

  certWrap: { marginTop: spacing.md },
  cert: {
    borderRadius: radius.xl,
    borderWidth: 2,
    overflow: "hidden",
    padding: spacing.xl,
    minHeight: 520,
  },
  certGlow: {
    position: "absolute",
    top: -60, right: -60,
    width: 220, height: 220,
    borderRadius: 999,
  },
  certHead: { alignItems: "center", marginBottom: spacing.xl },
  seal: {
    width: 76, height: 76, borderRadius: 38,
    borderWidth: 2,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    marginBottom: spacing.md,
  },
  certChurch: {
    color: colors.onSurface,
    fontSize: font.size.base,
    fontWeight: font.weight.black,
    letterSpacing: 1.2,
    textAlign: "center",
  },
  certChurchSub: {
    color: colors.onSurfaceMuted,
    fontSize: font.size.sm,
    marginTop: 2,
  },
  certBody: { alignItems: "center", marginTop: spacing.md, marginBottom: spacing.lg },
  certOverline: {
    color: colors.onSurfaceMuted, fontSize: 11, letterSpacing: 2,
    fontWeight: font.weight.bold, marginBottom: spacing.md,
  },
  certName: {
    color: colors.onSurface,
    fontSize: 28,
    fontWeight: font.weight.black,
    textAlign: "center",
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  certDivider: { width: 60, height: 3, borderRadius: 2, marginVertical: spacing.lg },
  certLevelLabel: { color: colors.onSurfaceMuted, fontSize: font.size.sm },
  certLevel: {
    fontSize: font.size.xl,
    fontWeight: font.weight.black,
    letterSpacing: 1.4,
    marginTop: 4,
    textAlign: "center",
  },
  certLevelSub: {
    fontSize: font.size.base,
    fontWeight: font.weight.semibold,
    marginTop: 4,
  },
  blessing: {
    color: colors.onSurface,
    fontSize: font.size.base,
    lineHeight: 24,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  certFooter: { alignItems: "center", marginTop: spacing.xl },
  verse: { color: colors.onSurfaceMuted, fontSize: font.size.sm, textAlign: "center" },
  project: { color: colors.onSurfaceMuted, fontSize: 11, letterSpacing: 1.2, marginTop: 6 },

  homeLink: { marginTop: spacing.lg, alignSelf: "center", padding: spacing.sm },
  homeLinkText: { color: colors.onSurfaceMuted, fontSize: font.size.base, fontWeight: font.weight.medium },
});
