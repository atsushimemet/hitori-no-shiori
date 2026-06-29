export const ease = {
  soft: [0.22, 1, 0.36, 1],
  gentle: [0.4, 0, 0.2, 1],
} as const;

export const duration = {
  page: 0.65,
  head: 0.5,
  card: 0.55,
  micro: 0.2,
} as const;

export const choreo = {
  headingStagger: 0.08,
  delayChildren: 0.15,
  stagger: 0.12,
} as const;
