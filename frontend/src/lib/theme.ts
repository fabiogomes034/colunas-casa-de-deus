export const colors = {
  // Tema Neewick Dark Amber
  background: "#0D0F14",
  backgroundAlt: "#14171D",
  surface: "#1C1F26",
  card: "#1C1F26",
  cardTint: "#20242C",
  cardText: "#FFFFFF",

  // Tipografia / Textos
  onSurface: "#FFFFFF",
  onSurfaceMuted: "#9A9DA6",
  onSurfaceLo: "#6C6F78",
  onBrand: "#14171D",

  // Cores Institucionais
  brand: "#F5A623",
  brandLight: "#FFC94A",
  accent: "#C9973F",

  // Níveis (Bronze, Prata, Ouro) — ajustados ao tom âmbar
  bronze: "#D98A0F",
  bronzeLight: "#F5A623",
  prata: "#8A6A2E",
  prataLight: "#C9973F",
  ouro: "#F5A623",
  ouroLight: "#FFC94A",

  // Status
  success: "#22B573",
  error: "#E8543E",
  border: "#262A32",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 26,
  pill: 9999,
};

export const font = {
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 18,
    xl: 22,
    display: 30,
  },
  weight: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    black: "800" as const,
  },
};

export type TierKey = "bronze" | "prata" | "ouro";

export const tierMeta: Record<
  TierKey,
  { label: string; amount: number; color: string; lightColor: string; description: string }
> = {
  bronze: {
    label: "Coluna Bronze",
    amount: 50,
    color: colors.bronze,
    lightColor: colors.bronzeLight,
    description: "Sustenta os passos iniciais da edificação.",
  },
  prata: {
    label: "Coluna Prata",
    amount: 70,
    color: colors.prata,
    lightColor: colors.prataLight,
    description: "Fortalece a estrutura contínua do ministério.",
  },
  ouro: {
    label: "Coluna Ouro",
    amount: 100,
    color: colors.ouro,
    lightColor: colors.ouroLight,
    description: "Impulsiona grandes avanços na Casa de Deus.",
  },
};

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
