import { readFileSync } from 'node:fs';

export const upcomingCohorts = JSON.parse(readFileSync('content/upcoming-cohorts.json', 'utf8'));
const month = date => date.toLocaleDateString('en-GB', { month: 'long', timeZone: 'UTC' });
export function cohortDates(cohort, includeYear = false) {
  const start = new Date(`${cohort.startDate}T12:00:00Z`);
  const end = new Date(`${cohort.endDate}T12:00:00Z`);
  const dates = start.getUTCMonth() === end.getUTCMonth()
    ? `${month(start)} ${start.getUTCDate()}–${end.getUTCDate()}`
    : `${month(start)} ${start.getUTCDate()} – ${month(end)} ${end.getUTCDate()}`;
  return dates + (includeYear ? `, ${end.getUTCFullYear()}` : '');
}
