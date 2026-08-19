import React, { useState } from "react";
import {
  Alert,
  Clipboard,
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
import QRCode from "react-native-qrcode-svg";

import { api } from "@/src/lib/api";
import { ScreenBackground } from "@/src/components/ScreenBackground";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { colors, spacing, radius, font, tierMeta, formatBRL, TierKey } from "@/src/lib/theme";

export default function Payment() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    phone?: string;
    tier?: string;
    amount?: string;
  }>();

  const name = params.name || "Contribuinte";
  const phone = params.phone || "";
  const tierKey = (params.tier as TierKey) || "prata";
  const meta = tierMeta[tierKey] || tierMeta.prata;
  const amount = Number(params.amount) || meta.amount;

  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pixKey = "+55 41 99224-6602";

  const handleCopyPix = () => {
    Clipboard.setString(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      // Monta o payload garantindo tipos primitivos limpos
      const payload = {
        name: String(name),
        phone: String(phone),
        tier: String(tierKey),
        amount: Number(amount),
        status: "pago",
        paidAt: new Date().toISOString(),
      };

      await api.post("/members", payload);

      router.push({
        pathname: "/certificate",
        params: {
          name,
          tier: tierKey,
        },
      });
    } catch (error: any) {
      console.error("Erro ao registrar pagamento:", error);
      
      const serverMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Falha na comunicação com o servidor.";

      setErrorMessage(`Erro (${error.response?.status || 'conexão'}): ${serverMsg}`);

      if (Platform.OS === "web") {
        window.alert(`Erro ao confirmar: ${serverMsg}`);
      } else {
        Alert.alert("Atenção", `Erro ao confirmar: ${serverMsg}`);
      }
    } finally {
      setLoading(false);
    }
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
            <Pressable
              onPress={() => router.back()}
              style={styles.backButton}
              testID="payment-back-btn"
            >
              <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
            </Pressable>
            <Text style={styles.headerTitle}>Pagamento via Pix</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Card Resumo */}
          <View style={styles.summaryCard}>
            <LinearGradient
              colors={[meta.lightColor, meta.color]}
              style={styles.summaryIcon}
            >
              <Text style={styles.summaryIconText}>{tierKey.charAt(0).toUpperCase()}</Text>
            </LinearGradient>
            <View style={styles.summaryBody}>
              <Text style={styles.summaryName} numberOfLines={1}>{name}</Text>
              <Text style={styles.summarySub}>{meta.label} · mensalidade</Text>
            </View>
            <Text style={styles.summaryValue}>{formatBRL(amount)}</Text>
          </View>

          {/* Card QR Code Soft Light */}
          <View style={styles.qrCard}>
            <View style={styles.qrBox}>
              <QRCode
                value={pixKey}
                size={140}
                color={colors.onSurface}
                backgroundColor={colors.card}
              />
              <View style={styles.qrCenterBadge}>
                <Text style={styles.qrCenterBadgeText}>IVM</Text>
              </View>
            </View>

            <Text style={styles.qrCaption}>
              Escaneie com o app do seu banco{"\n"}ou copie a chave abaixo
            </Text>

            {/* Linha Copia e Cola */}
            <View style={styles.pixKeyRow}>
              <Text style={styles.pixKeyText} numberOfLines={1}>{pixKey}</Text>
              <Pressable
                onPress={handleCopyPix}
                style={styles.copyBtn}
                testID="payment-copy-btn"
              >
                <Text style={styles.copyBtnText}>{copied ? "Copiado! ✓" : "Copiar"}</Text>
              </Pressable>
            </View>
          </View>

          {/* Mensagem de Erro Visível caso o backend recuse */}
          {errorMessage && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={20} color="#FF3B30" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Botão de Confirmação */}
          <PrimaryButton
            title="Já paguei"
            onPress={handleConfirmPayment}
            loading={loading}
            testID="payment-confirm-btn"
            style={{
              backgroundColor: colors.success,
              marginTop: spacing.md,
            }}
          />

          {/* Indicador de Passos */}
          <View style={styles.stepsRow}>
            <View style={styles.stepDot} />
            <View style={[styles.stepDot, styles.stepDotActive]} />
            <View style={styles.stepDot} />
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
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    shadowColor: "#A3B1C6",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 3,
  },
  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryIconText: {
    color: "#FFFFFF",
    fontSize: font.size.base,
    fontWeight: font.weight.black,
  },
  summaryBody: {
    flex: 1,
  },
  summaryName: {
    fontSize: font.size.base,
    fontWeight: font.weight.bold,
    color: colors.onSurface,
  },
  summarySub: {
    fontSize: font.size.xs,
    color: colors.onSurfaceMuted,
    marginTop: 2,
  },
  summaryValue: {
    fontSize: font.size.base,
    fontWeight: font.weight.black,
    color: colors.onSurface,
  },
  qrCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.md,
    shadowColor: "#A3B1C6",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 3,
  },
  qrBox: {
    width: 170,
    height: 170,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderWidth: 1,
    borderColor: colors.border,
  },
  qrCenterBadge: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  qrCenterBadgeText: {
    fontSize: 11,
    fontWeight: font.weight.black,
    color: colors.brand,
  },
  qrCaption: {
    fontSize: font.size.xs,
    color: colors.onSurfaceMuted,
    textAlign: "center",
    lineHeight: 18,
    fontWeight: font.weight.medium,
  },
  pixKeyRow: {
    width: "100%",
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
  },
  pixKeyText: {
    flex: 1,
    fontSize: font.size.xs,
    fontWeight: font.weight.bold,
    color: colors.onSurface,
  },
  copyBtn: {
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.sm,
    shadowColor: "#A3B1C6",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: font.weight.bold,
    color: colors.brand,
  },
  errorBox: {
    backgroundColor: "#FFE5E5",
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  errorText: {
    color: "#D32F2F",
    fontSize: font.size.xs,
    fontWeight: font.weight.medium,
    flex: 1,
  },
  stepsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.xs,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.onSurfaceLo,
  },
  stepDotActive: {
    width: 18,
    backgroundColor: colors.brand,
  },
});
