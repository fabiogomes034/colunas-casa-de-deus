export const colors = {
  // Paleta "Azul Brant & Sol de Minas" — navy profundo com dourado em detalhe
  background: "#01102E",       // navy quase preto, base da tela
  backgroundAlt: "#011E60",    // Azul Brant — usado no gradiente do fundo
  surface: "#0B2C74",          // navy mais claro, base das telas
  card: "#F2F1EF",             // Nuvem — card branco, contrasta com o fundo navy
  cardTint: "#E3E6F2",         // tom levemente mais frio, usado no gradiente do card
  cardText: "#01102E",         // texto escuro sobre o card branco
  cardTextMuted: "#5A6786",    // texto secundário sobre o card branco

  // Tipografia / Textos (sobre o fundo navy, fora do card)
  onSurface: "#F2F1EF",        // Nuvem — texto principal
  onSurfaceMuted: "#AAB6D9",   // azul-acinzentado suave — texto secundário
  onSurfaceLo: "#7481AD",      // texto terciário / hints
  onBrand: "#01102E",          // texto escuro sobre botão dourado (contraste)

  // Cores Institucionais
  brand: "#F7B700",            // Sol de Minas — só em detalhe (botão, badge, ícone)
  brandLight: "#FFCB3D",       // usado no gradiente do botão dourado
  brandOnLight: "#8A6100",     // dourado escurecido — texto/badge sobre o card branco (contraste)
  accent: "#6A7FC0",           // Horizonte Claro — acento secundário (links, chips)
  accentLight: "#93A3D6",

  // Níveis (Bronze, Prata, Ouro) — realinhados à nova paleta
  bronze: "#B36A2E",
  bronzeLight: "#D6924F",
  prata: "#6A7FC0",            // Horizonte Claro faz o papel do "prata"
  prataLight: "#93A3D6",
  ouro: "#F7B700",             // Sol de Minas faz o papel do "ouro"
  ouroLight: "#FFCB3D",

  // Status
  success: "#22B573",
  error: "#E8543E",
  border: "#1B2C63",
};

// Pares de cor para uso com expo-linear-gradient — evita fundos/cards "chapados"
export const gradients = {
  background: [colors.background, colors.backgroundAlt] as const,
  card: [colors.card, colors.cardTint] as const,
  brandButton: [colors.brand, colors.brandLight] as const,
};

// Sombras coloridas suaves (navy/dourado), em vez de preto puro — dão profundidade "flutuante"
export const shadow = {
  card: {
    shadowColor: "#011E60",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  brandGlow: {
    shadowColor: "#F7B700",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
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
