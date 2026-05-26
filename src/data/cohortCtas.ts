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
      'July 20. Six weeks. Pick a project, ship it every Friday. YOLO++ is the loose cohort: less homework, more room to build what you actually want running.',
    applyLabel: 'Apply for SEC-08',
  },
};

export function getCohortNextPromo(cohort: string): CohortNextPromo | undefined {
  return cohortNextPromos[cohort];
}

export function getCohortForwardLink(cohort: string): CohortForwardLink | undefined {
  return getCohortNextPromo(cohort)?.forward;
}
