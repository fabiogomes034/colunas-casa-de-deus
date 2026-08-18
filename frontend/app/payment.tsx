import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
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
import QRCode from "react-native-qrcode-svg";
import * as Clipboard from "expo-clipboard";

import { ScreenBackground } from "@/src/components/ScreenBackground";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { colors, spacing, radius, font, tierMeta, tierColor, formatBRL, Tier } from "@/src/lib/theme";
import { api, Member, PublicConfig } from "@/src/lib/api";
import { buildPixPayload } from "@/src/lib/pixCode";

export default function Payment() {
  const router = useRouter();
  const { memberId } = useLocalSearchParams<{ memberId: string }>();

  const [member, setMember] = useState<Member | null>(null);
  const [config, setConfig] = useState<PublicConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [marking, setMarking] = useState(false);
  const [marked, setMarked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!memberId) return;
    (async () => {
      try {
        const [m, cfg] = await Promise.all([api.getMember(memberId as string), api.getConfig()]);
        setMember(m);
        setConfig(cfg);
        setMarked(m.status !== "pendente");
      } catch (e: any) {
        setError(e?.message || "Erro ao carregar informações.");
      } finally {
        setLoading(false);
      }
    })();
  }, [memberId]);

  const pixPayload = useMemo(() => {
    if (!config || !member) return "";
    return buildPixPayload({
      pixKey: config.pix_key,
      merchantName: config.merchant_name,
      merchantCity: config.merchant_city,
      amount: member.amount,
      txid: `COL${member.id.slice(0, 6).toUpperCase()}`,
    });
  }, [config, member]);

  const tier: Tier = (member?.level as Tier) || "bronze";
  const tierC = tierColor(tier);
  const tierLabel = tier !== "outro" ? tierMeta[tier].label : "Semear Outro Valor";

  const copy = async () => {
    if (!config) return;
    await Clipboard.setStringAsync(config.pix_key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const markPaid = async () => {
    if (!member) return;
    setMarking(true);
    try {
      await api.markPaid(member.id);
      setMarked(true);
      router.push({ pathname: "/certificate", params: { memberId: member.id } });
    } catch (e: any) {
      setError(e?.message || "Erro ao registrar pagamento.");
    } finally {
      setMarking(false);
    }
  };

  const openWhatsappReminder = () => {
    if (!config || !member) return;
    const msg = `Olá! Gostaria de ser lembrado(a) todo mês da minha contribuição na ${tierLabel} do projeto Colunas da Casa de Deus 🙏 (${member.name})`;
    const url = `https://wa.me/${config.church_whatsapp}?text=${encodeURIComponent(msg)}`;
    Linking.openURL(url).catch(() => {});
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

  if (!member || !config) {
    return (
      <ScreenBackground>
        <SafeAreaView style={styles.center}>
          <Text style={styles.errBig}>{error || "Cadastro não encontrado."}</Text>
          <PrimaryButton title="Voltar" onPress={() => router.replace("/")} style={{ marginTop: spacing.lg }} />
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
            <Text style={styles.eyebrow}>PAGAMENTO VIA PIX</Text>
            <Text style={styles.title}>Contribuição PIX</Text>
          </View>

          <View style={styles.amountCard} testID="payment-amount-card">
            <Text style={styles.amountLabel}>Valor a contribuir</Text>
            <Text style={styles.amountValue}>{formatBRL(member.amount)}</Text>
            <View style={[styles.tierChip, { backgroundColor: tierC + "22", borderColor: tierC }]}>
              <View style={[styles.tierChipDot, { backgroundColor: tierC }]} />
              <Text style={[styles.tierChipText, { color: tierC }]}>{tierLabel}</Text>
            </View>
            <Text style={styles.merchant}>{config.merchant_name}</Text>
          </View>

          <View style={styles.actionCard}>
            <Text style={styles.actionTitle}>1. Copie a chave PIX</Text>
            <View style={styles.pixKeyBox}>
              <Ionicons name="key-outline" size={18} color={colors.brand} />
              <Text selectable style={styles.pixKeyText} testID="pix-key-text">
                {config.pix_key}
              </Text>
            </View>
            <PrimaryButton
              title={copied ? "✓ Chave copiada!" : "COPIAR CHAVE PIX"}
              color={copied ? colors.success : colors.brand}
              onPress={copy}
              testID="copy-pix-button"
            />
          </View>

          <View style={styles.actionCard}>
            <Text style={styles.actionTitle}>2. Ou escaneie o QR Code</Text>
            <View style={styles.qrWrap} testID="pix-qr-wrap">
              {pixPayload ? (
                <QRCode value={pixPayload} size={220} backgroundColor="#FFFFFF" color="#0B1120" />
              ) : (
                <ActivityIndicator />
              )}
            </View>
            <Text style={styles.qrHint}>
              Abra seu banco → PIX → Ler QR Code. O valor já vem preenchido.
            </Text>
          </View>

          <View style={styles.actionCard}>
            <Text style={styles.actionTitle}>3. Depois de pagar</Text>
            <Text style={styles.actionSub}>
              Confirme abaixo. O pastor validará seu pagamento manualmente no painel.
            </Text>
            <PrimaryButton
              title={marked ? "✓ Pagamento informado" : "Já realizei o pagamento via PIX"}
              onPress={markPaid}
              color={marked ? colors.success : colors.brand}
              loading={marking}
              disabled={marked}
              testID="mark-paid-button"
              style={{ marginTop: spacing.lg }}
            />
          </View>

          <Pressable onPress={openWhatsappReminder} style={styles.whatsRow} testID="whatsapp-reminder-button">
            <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
            <View style={{ flex: 1 }}>
              <Text style={styles.whatsTitle}>Receber Lembrete Mensal no WhatsApp</Text>
              <Text style={styles.whatsSub}>
                Abre uma conversa com a igreja para você pedir seu lembrete manualmente.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.onSurfaceMuted} />
          </Pressable>

          <Pressable
            onPress={() => router.push({ pathname: "/certificate", params: { memberId: member.id } })}
            style={styles.certLink}
            testID="see-certificate-link"
          >
            <Ionicons name="ribbon-outline" size={16} color={colors.brand} />
            <Text style={styles.certLinkText}>Ver meu certificado</Text>
          </Pressable>

          {error && <Text style={styles.err}>{error}</Text>}
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxxl, paddingHorizontal: spacing.lg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  header: { paddingTop: spacing.md, paddingHorizontal: spacing.sm, marginBottom: spacing.xl },
  back: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    marginBottom: spacing.lg,
  },
  eyebrow: { color: colors.brand, fontSize: 12, fontWeight: font.weight.bold, letterSpacing: 1.4, marginBottom: spacing.sm },
  title: { color: colors.onSurface, fontSize: font.size.display, fontWeight: font.weight.black, letterSpacing: -0.5 },

  amountCard: {
    backgroundColor: colors.cardTint,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: "center",
    shadowColor: "#000", shadowOpacity: 0.35, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 6,
  },
  amountLabel: { color: colors.cardTextMuted, fontSize: font.size.sm, letterSpacing: 0.6, fontWeight: font.weight.semibold },
  amountValue: {
    color: colors.cardText, fontSize: 44, fontWeight: font.weight.black,
    marginTop: 4, letterSpacing: -1,
  },
  tierChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderWidth: 1, borderRadius: radius.pill,
    paddingHorizontal: 12, paddingVertical: 6,
    marginTop: spacing.md,
  },
  tierChipDot: { width: 6, height: 6, borderRadius: 3 },
  tierChipText: { fontSize: font.size.sm, fontWeight: font.weight.bold, letterSpacing: 0.4 },
  merchant: { color: colors.cardTextMuted, fontSize: font.size.sm, marginTop: spacing.md },

  actionCard: {
    marginTop: spacing.lg,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.xl,
  },
  actionTitle: { color: colors.onSurface, fontSize: font.size.lg, fontWeight: font.weight.bold, marginBottom: spacing.md },
  actionSub: { color: colors.onSurfaceMuted, fontSize: font.size.base, lineHeight: 22 },
  pixKeyBox: {
    flexDirection: "row", alignItems: "center", gap: spacing.sm,
    backgroundColor: colors.cardTint, borderRadius: radius.md,
    paddingHorizontal: spacing.lg, paddingVertical: 14,
    marginBottom: spacing.md,
  },
  pixKeyText: { color: colors.cardText, fontSize: font.size.lg, fontWeight: font.weight.semibold, letterSpacing: 0.5 },

  qrWrap: {
    alignSelf: "center",
    padding: spacing.lg,
    backgroundColor: "#FFFFFF",
    borderRadius: radius.lg,
    marginVertical: spacing.md,
  },
  qrHint: { color: colors.onSurfaceMuted, fontSize: font.size.sm, textAlign: "center", lineHeight: 20 },

  whatsRow: {
    flexDirection: "row", alignItems: "center", gap: spacing.md,
    backgroundColor: "rgba(37,211,102,0.08)",
    borderColor: "rgba(37,211,102,0.25)",
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  whatsTitle: { color: colors.onSurface, fontSize: font.size.base, fontWeight: font.weight.bold },
  whatsSub: { color: colors.onSurfaceMuted, fontSize: font.size.sm, marginTop: 2, lineHeight: 18 },

  certLink: {
    marginTop: spacing.xl,
    alignSelf: "center",
    flexDirection: "row", alignItems: "center", gap: 6, padding: spacing.sm,
  },
  certLinkText: { color: colors.brand, fontSize: font.size.base, fontWeight: font.weight.semibold },

  err: { color: colors.danger, fontSize: font.size.base, marginTop: spacing.lg, textAlign: "center" },
  errBig: { color: colors.onSurface, fontSize: font.size.lg, textAlign: "center" },
});
