export type StepId =
  | "identity"
  | "values"
  | "athletes"
  | "brands"
  | "social"
  | "sociodemo"
  | "fans";

export type Step = {
  id: StepId;
  path: string;
  label: string;
  required: boolean;
};

export const STEPS: Step[] = [
  { id: "identity",  path: "/onboarding/identity",  label: "Your sport",    required: true  },
  { id: "values",    path: "/onboarding/values",    label: "Your values",   required: true  },
  { id: "athletes",  path: "/onboarding/athletes",  label: "Inspiration",   required: true  },
  { id: "brands",    path: "/onboarding/brands",    label: "Brand vibes",   required: true  },
  { id: "social",    path: "/onboarding/social",    label: "Your reach",    required: true  },
  { id: "sociodemo", path: "/onboarding/sociodemo", label: "The basics",    required: true  },
  { id: "fans",      path: "/onboarding/fans",      label: "Your hype squad", required: false },
];

export function stepIndex(id: StepId) {
  return STEPS.findIndex((s) => s.id === id);
}

export function progressPct(currentId: StepId) {
  // Each required step done = +~14%. Fans step is bonus (+2%). Matches reveal caps at 100.
  const required = STEPS.filter((s) => s.required);
  const idx = stepIndex(currentId);
  const doneRequired = Math.max(0, required.findIndex((s) => s.id === currentId));
  const base = (doneRequired / required.length) * 98;
  return Math.round(base);
}

export function nextPath(id: StepId): string {
  const idx = stepIndex(id);
  return STEPS[idx + 1]?.path ?? "/matches";
}

export function prevPath(id: StepId): string | null {
  const idx = stepIndex(id);
  return idx > 0 ? STEPS[idx - 1].path : null;
}
