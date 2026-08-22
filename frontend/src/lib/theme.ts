export const colors = {
  // Paleta oficial fornecida (Coolors): #000814 · #001D3D · #003566 · #FFC300 · #FFD60A
  // Cada camada usa um tom levemente diferente (nunca a mesma cor chapada
  // repetida) para criar profundidade — sempre combinada com gradiente e
  // sombra colorida nos componentes (ScreenBackground, PrimaryButton, cards).
  background: "#000814",     // tom mais escuro da paleta — base do app
  backgroundAlt: "#001D3D",  // um tom acima, usado no gradiente de fundo
  surface: "#001D3D",
  card: "#001D3D",
  cardTint: "#003566",       // tom para gradiente superior dos cards
  cardText: "#F2F1EF",

  // Tipografia / Textos
  onSurface: "#F2F1EF",
  onSurfaceMuted: "#96AABB", // derivado de #003566 clareado, para texto secundário
  onSurfaceLo: "#003566",    // tom médio da paleta, para ícones/detalhes discretos
  onBrand: "#000814",        // texto escuro sobre fundo dourado

  // Cores Institucionais
  brand: "#FFC300",
  brandLight: "#FFD60A",     // tom mais claro para o topo do gradiente dourado
  accent: "#003566",         // acento secundário (tags, ícones)

  // Níveis (Bronze, Prata, Ouro) — harmonizados com a nova paleta
  bronze: "#B5793A",
  bronzeLight: "#D69A5C",
  prata: "#557796",          // variação clara de #003566
  prataLight: "#859CB1",
  ouro: "#FFC300",
  ouroLight: "#FFD60A",

  // Status
  success: "#3FBF8F",
  error: "#E8543E",
  border: "#00254B",

  // Sombra padrão (colorida, nunca preto puro — evita visual "chapado")
  shadow: "#000814",
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
