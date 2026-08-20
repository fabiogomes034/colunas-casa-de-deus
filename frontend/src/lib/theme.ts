export const colors = {
  // Tema Black & Gold (base para efeito vidro fosco depois)
  background: "#14120F",
  backgroundAlt: "#1B1815",
  surface: "#211D19",
  card: "#211D19",
  cardTint: "#26221D",
  cardText: "#F5F1E8",

  // Tipografia / Textos
  onSurface: "#F5F1E8",
  onSurfaceMuted: "#A39B8B",
  onSurfaceLo: "#6E6558",
  onBrand: "#1B1815",

  // Cores Institucionais
  brand: "#D4A24C",
  brandLight: "#E8C179",
  accent: "#C9973F",

  // Níveis (Bronze, Prata, Ouro) — ajustados ao tom dourado
  bronze: "#A9672B",
  bronzeLight: "#C9973F",
  prata: "#6E6558",
  prataLight: "#A39B8B",
  ouro: "#D4A24C",
  ouroLight: "#E8C179",

  // Status
  success: "#22B573",
  error: "#E8543E",
  border: "#2E2A24",
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
