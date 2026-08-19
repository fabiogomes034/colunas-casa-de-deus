import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { ScreenBackground } from "@/src/components/ScreenBackground";
import { colors, spacing, radius, font, tierMeta, TierKey } from "@/src/lib/theme";
import { useAuth } from "@/src/lib/auth";
import { api, Member } from "@/src/lib/api";

export default function AdminDashboard() {
  const router = useRouter();
  const auth = useAuth() as any;
  const token = auth?.token;

  const [filtro, setFiltro] = useState<"todos" | "pago" | "pendente">("todos");
  const [search, setSearch] = useState("");

  const [membros, setMembros] = useState<Member[]>([]);
  const [estatisticas, setStats] = useState({
    total: 0,
    pendente: 0,
    aguardando_confirmacao: 0,
    confirmado: 0,
  });
  const [carregando, setCarregando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!token) {
      setCarregando(false);
      return;
    }
    setCarregando(true);
    setError(null);
    try {
      const [lista, stats] = await Promise.all([
        api.listMembers(token),
        api.stats(token),
      ]);
      setMembros(lista || []);
      setStats(stats || { total: 0, pendente: 0, aguardando_confirmacao: 0, confirmado: 0 });
    } catch (err: any) {
      setError(err?.message || "Credenciais inválidas ou token expirado");
    } finally {
      setCarregando(false);
    }
  }, [token]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleLogout = async () => {
    try {
      if (auth?.logout) await auth.logout();
      if (auth?.signOut) await auth.signOut();
    } catch {}

    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();
    }

    router.replace("/admin/login");
  };

  const handleConfirmarMembro = async (id: string) => {
    if (!token) return;
    try {
      await api.confirmMember(token, id);
      carregar();
    } catch (err: any) {
      alert(err?.message || "Erro ao confirmar membro");
    }
  };

  const membrosFiltrados = membros.filter((m) => {
    const atendeFiltro =
      filtro === "todos"
        ? true
        : filtro === "pago"
        ? m.status === "confirmado" || m.status === "aguardando_confirmacao"
        : m.status === "pendente";

    const atendeBusca =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.whatsapp && m.whatsapp.includes(search));

    return atendeFiltro && atendeBusca;
  });

  return (
    <ScreenBackground>
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Topo / Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>PR</Text>
              </View>
              <View>
                <Text style={styles.title}>Painel do Pastor</Text>
                <Text style={styles.subtitle}>Igreja Visão Missionária</Text>
              </View>
            </View>
            <Pressable onPress={handleLogout} style={styles.logoutBtn}>
              <Ionicons name="log-out-outline" size={24} color={colors.onSurfaceMuted} />
            </Pressable>
          </View>

          {/* Cards de Métricas */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>COLUNAS</Text>
              <Text style={styles.statVal}>{estatisticas.total}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>EM DIA</Text>
              <Text style={[styles.statVal, { color: colors.success }]}>
                {estatisticas.confirmado}
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>PENDENTES</Text>
              <Text style={[styles.statVal, { color: colors.brand }]}>
                {estatisticas.pendente + estatisticas.aguardando_confirmacao}
              </Text>
            </View>
          </View>

          {/* Barra de Pesquisa */}
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color={colors.onSurfaceMuted} />
            <TextInput
              placeholder="Buscar coluna..."
              placeholderTextColor={colors.onSurfaceMuted}
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
          </View>

          {/* Abas de Filtro */}
          <View style={styles.filterRow}>
            {(["todos", "pago", "pendente"] as const).map((f) => (
              <Pressable
                key={f}
                onPress={() => setFiltro(f)}
                style={[
                  styles.filterBtn,
                  filtro === f && styles.filterBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterBtnText,
                    filtro === f && styles.filterBtnTextActive,
                  ]}
                >
                  {f === "todos" ? "Todos" : f === "pago" ? "Em dia" : "Pendentes"}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Lista de Membros */}
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Colunas cadastradas</Text>
            <Text style={styles.listCount}>{membrosFiltrados.length} no total</Text>
          </View>

          {carregando ? (
            <ActivityIndicator size="large" color={colors.brand} style={{ marginTop: 40 }} />
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorMsg}>{error}</Text>
              <Pressable onPress={carregar} style={styles.retryBtn}>
                <Text style={styles.retryBtnText}>Tentar novamente</Text>
              </Pressable>
              <Pressable onPress={handleLogout} style={[styles.retryBtn, { marginTop: 10, backgroundColor: "#E2E8F0" }]}>
                <Text style={[styles.retryBtnText, { color: "#334155" }]}>Ir para Login</Text>
              </Pressable>
            </View>
          ) : membrosFiltrados.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma coluna encontrada.</Text>
          ) : (
            membrosFiltrados.map((m) => {
              const meta = tierMeta[(m.level as TierKey) || "prata"] || tierMeta.prata;
              const isAguardando = m.status === "aguardando_confirmacao";
              const isConfirmado = m.status === "confirmado";

              return (
                <View key={m.id} style={styles.memberCard}>
                  <LinearGradient
                    colors={[meta.lightColor, meta.color]}
                    style={styles.memberIcon}
                  >
                    <Text style={styles.memberIconText}>
                      {(m.level || "P").charAt(0).toUpperCase()}
                    </Text>
                  </LinearGradient>
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{m.name}</Text>
                    <Text style={styles.memberMeta}>
                      Coluna {meta.label} · {m.whatsapp || "Sem whats"}
                    </Text>
                  </View>
                  <View style={styles.memberAction}>
                    <View
                      style={[
                        styles.statusBadge,
                        isConfirmado
                          ? styles.statusPago
                          : isAguardando
                          ? styles.statusAguardando
                          : styles.statusPendente,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          isConfirmado
                            ? styles.statusPagoText
                            : isAguardando
                            ? styles.statusAguardandoText
                            : styles.statusPendenteText,
                        ]}
                      >
                        {isConfirmado
                          ? "Pago"
                          : isAguardando
                          ? "Aguardando"
                          : "Pendente"}
                      </Text>
                    </View>
                    {isAguardando && (
                      <Pressable
                        onPress={() => handleConfirmarMembro(m.id)}
                        style={styles.btnConfirmar}
                      >
                        <Text style={styles.btnConfirmarText}>Confirmar</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontWeight: font.weight.bold,
    fontSize: font.size.base,
  },
  title: {
    fontSize: font.size.lg,
    fontWeight: font.weight.bold,
    color: colors.onSurface,
  },
  subtitle: {
    fontSize: font.size.xs,
    color: colors.onSurfaceMuted,
  },
  logoutBtn: {
    padding: 8,
    backgroundColor: colors.card,
    borderRadius: radius.md,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    shadowColor: "#A3B1C6",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: font.weight.bold,
    color: colors.onSurfaceMuted,
  },
  statVal: {
    fontSize: font.size.xl,
    fontWeight: font.weight.black,
    color: colors.onSurface,
    marginTop: 4,
  },
  searchBox: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    height: 48,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: font.size.sm,
    color: colors.onSurface,
  },
  filterRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  filterBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.card,
  },
  filterBtnActive: {
    backgroundColor: colors.brand,
  },
  filterBtnText: {
    fontSize: font.size.xs,
    fontWeight: font.weight.bold,
    color: colors.onSurfaceMuted,
  },
  filterBtnTextActive: {
    color: "#fff",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  listTitle: {
    fontSize: font.size.base,
    fontWeight: font.weight.bold,
    color: colors.onSurface,
  },
  listCount: {
    fontSize: font.size.xs,
    color: colors.onSurfaceMuted,
  },
  errorContainer: {
    alignItems: "center",
    marginTop: 30,
    gap: 8,
  },
  errorMsg: {
    color: "#EF4444",
    fontSize: font.size.sm,
    textAlign: "center",
  },
  retryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    borderRadius: radius.md,
  },
  retryBtnText: {
    color: colors.brand,
    fontWeight: font.weight.bold,
    fontSize: font.size.xs,
  },
  emptyText: {
    textAlign: "center",
    color: colors.onSurfaceMuted,
    marginTop: 30,
    fontSize: font.size.sm,
  },
  memberCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  memberIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  memberIconText: {
    color: "#fff",
    fontWeight: font.weight.black,
    fontSize: font.size.base,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: font.size.sm,
    fontWeight: font.weight.bold,
    color: colors.onSurface,
  },
  memberMeta: {
    fontSize: font.size.xs,
    color: colors.onSurfaceMuted,
    marginTop: 2,
  },
  memberAction: {
    alignItems: "flex-end",
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  statusPago: {
    backgroundColor: "#DCFCE7",
  },
  statusAguardando: {
    backgroundColor: "#FEF3C7",
  },
  statusPendente: {
    backgroundColor: "#FEE2E2",
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: font.weight.bold,
  },
  statusPagoText: {
    color: "#15803D",
  },
  statusAguardandoText: {
    color: "#B45309",
  },
  statusPendenteText: {
    color: "#B91C1C",
  },
  btnConfirmar: {
    backgroundColor: colors.brand,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  btnConfirmarText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: font.weight.bold,
  },
});
