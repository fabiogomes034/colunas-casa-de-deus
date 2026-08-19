export const colors = {
  // Paleta Soft Light & Neumorfismo
  background: "#EEF1F6",
  backgroundAlt: "#E3E8F1",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  cardTint: "#FFFFFF",
  cardText: "#1D2433",

  // Tipografia / Textos
  onSurface: "#1D2433",
  onSurfaceMuted: "#7B879B",
  onSurfaceLo: "#AAB3C4",
  onBrand: "#FFFFFF",

  // Cores Institucionais
  brand: "#4A56D6",
  brandLight: "#6E7CF7",
  accent: "#E7A012",

  // Níveis (Bronze, Prata, Ouro)
  bronze: "#E8672B",
  bronzeLight: "#FF9A5A",
  prata: "#5C6E90",
  prataLight: "#8FA3C7",
  ouro: "#E7A012",
  ouroLight: "#FFCE63",

  // Status
  success: "#22B573",
  error: "#E8543E",
  border: "#E2E8F0",
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
