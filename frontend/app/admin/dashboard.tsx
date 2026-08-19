import React, { useState } from "react";
import {
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

interface Contributor {
  id: string;
  name: string;
  tier: TierKey;
  amount: number;
  status: "paid" | "pending";
}

const DADOS_EXEMPLO: Contributor[] = [
  { id: "1", name: "Maria Fernandes", tier: "ouro", amount: 100, status: "paid" },
  { id: "2", name: "João Vitor", tier: "prata", amount: 70, status: "paid" },
  { id: "3", name: "Ana Beatriz", tier: "bronze", amount: 50, status: "pending" },
  { id: "4", name: "Carlos Eduardo", tier: "prata", amount: 70, status: "paid" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "paid" | "pending">("all");
  const [search, setSearch] = useState("");

  const filteredMembers = DADOS_EXEMPLO.filter((m) => {
    const matchesFilter =
      filter === "all" ? true : filter === "paid" ? m.status === "paid" : m.status === "pending";
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalCols = DADOS_EXEMPLO.length;
  const totalPaid = DADOS_EXEMPLO.filter((m) => m.status === "paid").length;
  const totalPending = DADOS_EXEMPLO.filter((m) => m.status === "pending").length;

  return (
    <ScreenBackground>
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <LinearGradient
                colors={[colors.brandLight, colors.brand]}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>PR</Text>
              </LinearGradient>
              <View>
                <Text style={styles.headerTitle}>Painel do Pastor</Text>
                <Text style={styles.headerSub}>Igreja Visão Missionária</Text>
              </View>
            </View>

            <Pressable
              onPress={() => router.push("/")}
              style={styles.logoutBtn}
              testID="admin-logout-btn"
            >
              <Ionicons name="log-out-outline" size={18} color={colors.onSurfaceMuted} />
            </Pressable>
          </View>

          {/* Linha de KPIs / Métricas */}
          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>COLUNAS</Text>
              <Text style={styles.kpiValue}>{totalCols}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>EM DIA</Text>
              <Text style={[styles.kpiValue, { color: colors.success }]}>{totalPaid}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>PENDENTES</Text>
              <Text style={[styles.kpiValue, { color: colors.error }]}>{totalPending}</Text>
            </View>
          </View>

          {/* Campo de Busca */}
          <View style={styles.searchRow}>
            <Ionicons name="search-outline" size={16} color={colors.onSurfaceLo} />
            <TextInput
              placeholder="Buscar coluna..."
              placeholderTextColor={colors.onSurfaceLo}
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
          </View>

          {/* Filtros em Chips */}
          <View style={styles.filtersRow}>
            <Pressable
              onPress={() => setFilter("all")}
              style={[styles.filterChip, filter === "all" && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, filter === "all" && styles.filterChipTextActive]}>
                Todos
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setFilter("paid")}
              style={[styles.filterChip, filter === "paid" && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, filter === "paid" && styles.filterChipTextActive]}>
                Em dia
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setFilter("pending")}
              style={[styles.filterChip, filter === "pending" && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, filter === "pending" && styles.filterChipTextActive]}>
                Pendentes
              </Text>
            </Pressable>
          </View>

          {/* Rótulo da Lista */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Colunas cadastradas</Text>
            <Text style={styles.sectionCount}>{filteredMembers.length} no total</Text>
          </View>

          {/* Lista de Membros */}
          <View style={styles.membersList}>
            {filteredMembers.map((m) => {
              const meta = tierMeta[m.tier] || tierMeta.prata;
              const isPaid = m.status === "paid";

              return (
                <View key={m.id} style={styles.memberCard}>
                  <LinearGradient
                    colors={[meta.lightColor, meta.color]}
                    style={styles.memberIcon}
                  >
                    <Text style={styles.memberIconText}>{m.tier.charAt(0).toUpperCase()}</Text>
                  </LinearGradient>

                  <View style={styles.memberBody}>
                    <Text style={styles.memberName}>{m.name}</Text>
                    <Text style={styles.memberSub}>
                      {meta.label} · R$ {m.amount}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: isPaid ? "rgba(34, 181, 115, 0.12)" : "rgba(232, 84, 62, 0.12)" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        { color: isPaid ? colors.success : colors.error },
                      ]}
                    >
                      {isPaid ? "Em dia" : "Pendente"}
                    </Text>
                  </View>
                </View>
              );
            })}
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
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#A3B1C6",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: font.weight.black,
    color: "#FFFFFF",
  },
  headerTitle: {
    fontSize: font.size.base,
    fontWeight: font.weight.bold,
    color: colors.onSurface,
  },
  headerSub: {
    fontSize: font.size.xs,
    color: colors.onSurfaceMuted,
    marginTop: 1,
  },
  logoutBtn: {
    width: 36,
    height: 36,
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
  kpiRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: spacing.xs,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    shadowColor: "#A3B1C6",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 3,
  },
  kpiLabel: {
    fontSize: 9.5,
    fontWeight: font.weight.bold,
    color: colors.onSurfaceMuted,
    letterSpacing: 0.6,
  },
  kpiValue: {
    fontSize: font.size.lg,
    fontWeight: font.weight.black,
    color: colors.onSurface,
    marginTop: 4,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 46,
    shadowColor: "#A3B1C6",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: font.size.xs,
    color: colors.onSurface,
    fontWeight: font.weight.medium,
  },
  filtersRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.sm,
    backgroundColor: colors.card,
    shadowColor: "#A3B1C6",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  filterChipActive: {
    backgroundColor: colors.brand,
    shadowColor: colors.brand,
    shadowOpacity: 0.4,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: font.weight.bold,
    color: colors.onSurfaceMuted,
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: font.size.sm,
    fontWeight: font.weight.bold,
    color: colors.onSurface,
  },
  sectionCount: {
    fontSize: font.size.xs,
    color: colors.onSurfaceMuted,
    fontWeight: font.weight.medium,
  },
  membersList: {
    gap: 10,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    shadowColor: "#A3B1C6",
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 3,
  },
  memberIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  memberIconText: {
    color: "#FFFFFF",
    fontSize: font.size.xs,
    fontWeight: font.weight.black,
  },
  memberBody: {
    flex: 1,
  },
  memberName: {
    fontSize: font.size.xs,
    fontWeight: font.weight.bold,
    color: colors.onSurface,
  },
  memberSub: {
    fontSize: 10.5,
    color: colors.onSurfaceMuted,
    marginTop: 2,
    fontWeight: font.weight.medium,
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 9.5,
    fontWeight: font.weight.black,
  },
});
