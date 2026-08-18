export const colors = {
  surface: "#0B1120",
  surfaceGradientEnd: "#111827",
  onSurface: "#F9FAFB",
  onSurfaceMuted: "#94A3B8",
  card: "#FFFFFF",
  cardTint: "rgba(255,255,255,0.96)",
  cardShadow: "rgba(0,0,0,0.35)",
  cardText: "#0B1120",
  cardTextMuted: "#475569",
  border: "#E5E7EB",
  divider: "rgba(255,255,255,0.08)",

  brand: "#2563EB",
  brandSoft: "#3B82F6",
  brandTint: "#DBEAFE",
  onBrand: "#FFFFFF",

  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",

  bronze: "#CD7F32",
  bronzeSoft: "#E8A87C",
  silver: "#C0C0C0",
  silverSoft: "#E5E7EB",
  gold: "#D4AF37",
  goldSoft: "#F5D976",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const font = {
  size: {
    sm: 13,
    base: 16,
    lg: 18,
    xl: 22,
    xxl: 26,
    display: 32,
  },
  weight: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    black: "800" as const,
  },
};

export type Tier = "bronze" | "prata" | "ouro" | "outro";

export const tierMeta: Record<Exclude<Tier, "outro">, {
  label: string;
  subtitle: string;
  description: string;
  amount: number;
  color: string;
  colorSoft: string;
  emoji: string;
}> = {
  bronze: {
    label: "Coluna de Bronze",
    subtitle: "Coluna da Sustentação",
    description: "Você firma a base e ajuda a manter a casa de Deus aberta e acolhedora para todos.",
    amount: 50,
    color: colors.bronze,
    colorSoft: colors.bronzeSoft,
    emoji: "🥉",
  },
  prata: {
    label: "Coluna de Prata",
    subtitle: "Coluna da Provisão",
    description: "Sua oferta abençoada expande nossa missão e impulsiona novas vidas alcançadas.",
    amount: 70,
    color: colors.silver,
    colorSoft: colors.silverSoft,
    emoji: "🥈",
  },
  ouro: {
    label: "Coluna de Ouro",
    subtitle: "Coluna do Legado",
    description: "Sua fidelidade constrói o futuro e viabiliza os grandes projetos da nossa igreja.",
    amount: 100,
    color: colors.gold,
    colorSoft: colors.goldSoft,
    emoji: "🥇",
  },
};

export function tierColor(t: Tier): string {
  if (t === "outro") return colors.brand;
  return tierMeta[t].color;
}

export function formatBRL(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
