import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { ScreenBackground } from "@/src/components/ScreenBackground";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { colors, spacing, radius, font, tierColor, tierMeta, formatBRL, Tier } from "@/src/lib/theme";
import { useAuth } from "@/src/lib/auth";
import { api, Member, MemberStatus, Level } from "@/src/lib/api";

const STATUS_META: Record<MemberStatus, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: colors.onSurfaceMuted },
  aguardando_confirmacao: { label: "Aguardando confirmação", color: colors.warning },
  confirmado: { label: "Confirmado", color: colors.success },
};

const LEVEL_FILTERS: (Level | "todos")[] = ["todos", "bronze", "prata", "ouro", "outro"];
const STATUS_FILTERS: (MemberStatus | "todos")[] = ["todos", "aguardando_confirmacao", "confirmado", "pendente"];

export default function Dashboard() {
  const router = useRouter();
  const { token, signOut, loading: authLoading } = useAuth();

  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<{ total: number; pendente: number; aguardando_confirmacao: number; confirmado: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [levelFilter, setLevelFilter] = useState<Level | "todos">("todos");
  const [statusFilter, setStatusFilter] = useState<MemberStatus | "todos">("todos");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !token) router.replace("/admin/login");
  }, [authLoading, token]);

  const load = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      const [list, s] = await Promise.all([
        api.listMembers(token, {
          level: levelFilter !== "todos" ? levelFilter : undefined,
          status: statusFilter !== "todos" ? statusFilter : undefined,
        }),
        api.stats(token),
      ]);
      setMembers(list);
      setStats(s);
    } catch (e: any) {
      if (e?.message?.includes("401") || /inválid/i.test(e?.message || "")) {
        await signOut();
        router.replace("/admin/login");
        return;
      }
      setError(e?.message || "Erro ao carregar dados.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, levelFilter, statusFilter]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const confirm = async (m: Member) => {
    if (!token) return;
    setBusyId(m.id);
    try {
      await api.confirmMember(token, m.id);
      await load();
    } catch (e: any) {
      setError(e?.message || "Erro ao confirmar.");
    } finally {
      setBusyId(null);
    }
  };
  const resetStatus = async (m: Member) => {
    if (!token) return;
    setBusyId(m.id);
    try {
      await api.resetMember(token, m.id);
      await load();
    } catch (e: any) {
      setError(e?.message || "Erro ao redefinir.");
    } finally {
      setBusyId(null);
    }
  };
  const openWhatsapp = (m: Member) => {
    const msg = `Olá ${m.name.split(" ")[0]}! Aqui é o Pr. Fabio, da Igreja Visão Missionária. Estou confirmando sua contribuição no projeto Colunas da Casa de Deus 🙏`;
    Linking.openURL(`https://wa.me/55${m.whatsapp}?text=${encodeURIComponent(msg)}`).catch(() => {});
  };

  if (loading) {
    return (
      <ScreenBackground>
        <SafeAreaView style={styles.center}>
          <ActivityIndicator size="large" color={colors.onSurface} />
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <SafeAreaView edges={["top"]} style={{ flex: 1 }}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>PAINEL DO PASTOR</Text>
            <Text style={styles.title}>Contribuições</Text>
          </View>
          <Pressable
            onPress={async () => {
              await signOut();
              router.replace("/");
            }}
            style={styles.logoutBtn}
            testID="admin-logout"
          >
            <Ionicons name="log-out-outline" size={20} color={colors.onSurface} />
          </Pressable>
        </View>

        {stats && (
          <View style={styles.statsRow}>
            <StatBox label="Total" value={stats.total} color={colors.brand} />
            <StatBox label="Aguardando" value={stats.aguardando_confirmacao} color={colors.warning} />
            <StatBox label="Confirmados" value={stats.confirmado} color={colors.success} />
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          style={styles.chipStrip}
        >
          {LEVEL_FILTERS.map((k) => (
            <Chip
              key={`lvl-${k}`}
              label={k === "todos" ? "Todos" : k === "outro" ? "Outro" : tierMeta[k as Exclude<Tier, "outro">].label.replace("Coluna de ", "")}
              active={levelFilter === k}
              accent={k !== "todos" && k !== "outro" ? tierColor(k as Tier) : colors.brand}
              onPress={() => setLevelFilter(k)}
              testID={`filter-level-${k}`}
            />
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          style={styles.chipStrip}
        >
          {STATUS_FILTERS.map((k) => (
            <Chip
              key={`st-${k}`}
              label={k === "todos" ? "Todos os status" : STATUS_META[k].label}
              active={statusFilter === k}
              accent={k !== "todos" ? STATUS_META[k].color : colors.brand}
              onPress={() => setStatusFilter(k)}
              testID={`filter-status-${k}`}
            />
          ))}
        </ScrollView>

        <FlatList
          data={members}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor={colors.onSurface}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={40} color={colors.onSurfaceMuted} />
              <Text style={styles.emptyTitle}>Nenhum membro encontrado</Text>
              <Text style={styles.emptySub}>Assim que membros se cadastrarem, eles aparecerão aqui.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const tierC = tierColor(item.level as Tier);
            const st = STATUS_META[item.status];
            return (
              <View style={styles.memberCard} testID={`member-card-${item.id}`}>
                <View style={styles.memberTop}>
                  <View style={[styles.avatar, { borderColor: tierC, backgroundColor: tierC + "22" }]}>
                    <Text style={{ color: tierC, fontWeight: "800", fontSize: 16 }}>
                      {item.name.trim().charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.memberName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.memberTier}>
                      {item.level === "outro" ? "Semear outro valor" : tierMeta[item.level as Exclude<Tier, "outro">].label}
                      {"  ·  "}
                      <Text style={{ color: colors.cardText, fontWeight: "700" }}>{formatBRL(item.amount)}</Text>
                    </Text>
                  </View>
                </View>

                <View style={styles.memberMeta}>
                  <Pressable onPress={() => openWhatsapp(item)} style={styles.metaRow} testID={`whatsapp-${item.id}`}>
                    <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
                    <Text style={styles.metaText}>
                      {`(${item.whatsapp.slice(0, 2)}) ${item.whatsapp.slice(2, 7)}-${item.whatsapp.slice(7)}`}
                    </Text>
                  </Pressable>
                  <View style={[styles.statusPill, { backgroundColor: st.color + "22", borderColor: st.color }]}>
                    <View style={[styles.statusDot, { backgroundColor: st.color }]} />
                    <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
                  </View>
                </View>

                <View style={styles.memberActions}>
                  {item.status !== "confirmado" ? (
                    <PrimaryButton
                      title={busyId === item.id ? "..." : "Confirmar pagamento"}
                      color={colors.success}
                      onPress={() => confirm(item)}
                      loading={busyId === item.id}
                      testID={`confirm-${item.id}`}
                      style={{ flex: 1, minHeight: 44 }}
                    />
                  ) : (
                    <PrimaryButton
                      title="Redefinir para pendente"
                      variant="outline"
                      color={colors.onSurfaceMuted}
                      onPress={() => resetStatus(item)}
                      loading={busyId === item.id}
                      testID={`reset-${item.id}`}
                      style={{ flex: 1, minHeight: 44 }}
                    />
                  )}
                </View>
              </View>
            );
          }}
        />

        {error && <Text style={styles.errorBar}>{error}</Text>}
      </SafeAreaView>
    </ScreenBackground>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[styles.statBox, { borderColor: color + "55" }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Chip({
  label, active, accent, onPress, testID,
}: { label: string; active: boolean; accent: string; onPress: () => void; testID: string }) {
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      style={[
        styles.chip,
        active ? { backgroundColor: accent + "22", borderColor: accent } : { borderColor: "rgba(255,255,255,0.15)" },
      ]}
    >
      <Text style={[styles.chipText, { color: active ? accent : colors.onSurfaceMuted }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.md,
    gap: spacing.md,
  },
  eyebrow: { color: colors.brand, fontSize: 11, fontWeight: font.weight.bold, letterSpacing: 1.4 },
  title: { color: colors.onSurface, fontSize: font.size.xxl, fontWeight: font.weight.black, letterSpacing: -0.5 },
  logoutBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  statsRow: {
    flexDirection: "row", gap: spacing.md,
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: "flex-start",
  },
  statValue: { fontSize: font.size.xxl, fontWeight: font.weight.black },
  statLabel: { color: colors.onSurfaceMuted, fontSize: font.size.sm, marginTop: 2 },

  chipStrip: { maxHeight: 56, marginBottom: spacing.sm },
  chipRow: { paddingHorizontal: spacing.xl, gap: spacing.sm, alignItems: "center" },
  chip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  chipText: { fontSize: font.size.sm, fontWeight: font.weight.semibold, letterSpacing: 0.3 },

  listContent: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl, paddingTop: spacing.md, gap: spacing.md },
  memberCard: {
    backgroundColor: colors.cardTint,
    borderRadius: radius.xl,
    padding: spacing.lg,
    shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 3,
  },
  memberTop: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5,
  },
  memberName: { color: colors.cardText, fontSize: font.size.lg, fontWeight: font.weight.bold },
  memberTier: { color: colors.cardTextMuted, fontSize: font.size.sm, marginTop: 2 },
  memberMeta: {
    marginTop: spacing.md, flexDirection: "row",
    alignItems: "center", justifyContent: "space-between",
    flexWrap: "wrap", gap: spacing.sm,
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { color: colors.cardTextMuted, fontSize: font.size.sm, fontWeight: font.weight.medium },
  statusPill: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderRadius: radius.pill,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: font.weight.bold, letterSpacing: 0.3 },
  memberActions: { marginTop: spacing.md, flexDirection: "row", gap: spacing.md },

  empty: { alignItems: "center", padding: spacing.xl, gap: spacing.sm },
  emptyTitle: { color: colors.onSurface, fontSize: font.size.lg, fontWeight: font.weight.bold, marginTop: spacing.md },
  emptySub: { color: colors.onSurfaceMuted, fontSize: font.size.base, textAlign: "center", lineHeight: 22 },

  errorBar: {
    position: "absolute", left: 0, right: 0, bottom: 0,
    backgroundColor: colors.danger, color: "#fff",
    padding: spacing.md, textAlign: "center", fontWeight: "700",
  },
});
