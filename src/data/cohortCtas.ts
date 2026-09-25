export interface CohortForwardLink {
  label: string;
  href: string;
}

const cohortForwardLinks: Partial<Record<string, CohortForwardLink>> = {};

export function getCohortForwardLink(cohort: string): CohortForwardLink | undefined {
  return cohortForwardLinks[cohort];
}
