import showcaseProjects from '@/data/showcaseProjects.js';

export interface ExtraLink {
  link: string;
  linkText: string;
}

export interface ShowcaseProject {
  name: string;
  description: string;
  cohort: string;
  link: string;
  linkText: string;
  logo?: string;
  highlight?: boolean;
  extraLinks?: ExtraLink[];
}

export interface CohortSummary {
  cohort: string;
  count: number;
  sampleProjects: string[];
  highlightProjects: string[];
}

export const allShowcaseProjects = showcaseProjects as ShowcaseProject[];

export function getCohortNumber(cohort: string): number {
  return Number.parseInt(cohort.replace('SEC-', ''), 10);
}

export function sortCohortsAsc(cohorts: string[]): string[] {
  return [...cohorts].sort((left, right) => getCohortNumber(left) - getCohortNumber(right));
}

export const sortedCohorts = sortCohortsAsc([...new Set(allShowcaseProjects.map((project) => project.cohort))]);

export function getProjectsForCohort(cohort: string): ShowcaseProject[] {
  return allShowcaseProjects.filter((project) => project.cohort === cohort);
}

export function getProjectByName(name: string): ShowcaseProject | undefined {
  return allShowcaseProjects.find((project) => project.name === name);
}

export function slugifyProjectName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getCohortSummaries(): CohortSummary[] {
  return sortedCohorts.map((cohort) => {
    const projects = getProjectsForCohort(cohort);
    const highlightProjects = projects.filter((project) => project.highlight).map((project) => project.name);

    return {
      cohort,
      count: projects.length,
      sampleProjects: projects.slice(0, 3).map((project) => project.name),
      highlightProjects,
    };
  });
}

export function getAdjacentCohorts(cohort: string): {
  previousCohort?: string;
  nextCohort?: string;
} {
  const cohortIndex = sortedCohorts.indexOf(cohort);

  return {
    previousCohort: cohortIndex > 0 ? sortedCohorts[cohortIndex - 1] : undefined,
    nextCohort: cohortIndex >= 0 && cohortIndex < sortedCohorts.length - 1 ? sortedCohorts[cohortIndex + 1] : undefined,
  };
}
