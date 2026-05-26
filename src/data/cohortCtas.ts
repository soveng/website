export interface CohortCta {
  eyebrow: string;
  title: string;
  description: string;
  label: string;
  href: string;
}

const cohortCtas: Partial<Record<string, CohortCta>> = {
  'SEC-07': {
    eyebrow: 'SEC-08',
    title: 'YOLO++',
    description:
      'Six weeks starting July 20. Fewer themes, more room to build. Applications are open.',
    label: 'Apply for SEC-08',
    href: 'https://sovereignengineering.typeform.com/SEC-08',
  },
};

export function getCohortCta(cohort: string): CohortCta | undefined {
  return cohortCtas[cohort];
}
