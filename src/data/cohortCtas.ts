export interface CohortForwardLink {
  label: string;
  href: string;
}

export interface CohortNextPromo {
  forward: CohortForwardLink;
  eyebrow: string;
  title: string;
  paragraph: string;
  applyLabel: string;
}

const cohortNextPromos: Partial<Record<string, CohortNextPromo>> = {
  'SEC-07': {
    forward: {
      label: 'SEC-08 →',
      href: '/#apply',
    },
    eyebrow: 'SEC-08',
    title: 'YOLO++',
    paragraph:
      'Six weeks starting July 20. Bring something you want to ship and demo on Fridays. Fewer fixed themes than SEC-07, more room to chase an idea.',
    applyLabel: 'Apply for SEC-08',
  },
};

export function getCohortNextPromo(cohort: string): CohortNextPromo | undefined {
  return cohortNextPromos[cohort];
}

export function getCohortForwardLink(cohort: string): CohortForwardLink | undefined {
  return getCohortNextPromo(cohort)?.forward;
}
