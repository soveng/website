export interface CohortForwardLink {
  label: string;
  href: string;
}

const cohortForwardLinks: Partial<Record<string, CohortForwardLink>> = {
  'SEC-07': {
    label: 'SEC-08 ==>',
    href: '/#apply',
  },
};

export function getCohortForwardLink(cohort: string): CohortForwardLink | undefined {
  return cohortForwardLinks[cohort];
}
