import { upcomingCohorts, cohortDates } from './upcoming-cohorts.js';

export function renderCohortList(cohorts = upcomingCohorts, { disableLinks = false } = {}) {
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  return `<section class="upcoming-cohorts" aria-labelledby="upcoming-title"><h3 id="upcoming-title">Upcoming cohorts / 2027</h3><ul>${cohorts.map(cohort => {
    const content = `<div class="upcoming-cohort-name"><h4>${escape(cohort.name)}${(!disableLinks && cohort.href) ? ' <span aria-hidden="true">↗</span>' : ''}</h4><p>${escape(cohort.number)} · ${cohort.durationWeeks} ${cohort.durationWeeks === 1 ? 'week' : 'weeks'}${cohort.location ? ` · ${escape(cohort.location)}` : ''}</p></div><p class="upcoming-cohort-dates"><time datetime="${cohort.startDate}">${escape(cohortDates(cohort))}</time></p>`;
    return `<li>${(!disableLinks && cohort.href) ? `<a class="upcoming-cohort" href="${escape(cohort.href)}">${content}</a>` : `<div class="upcoming-cohort">${content}</div>`}</li>`;
  }).join('')}</ul></section>`;
}
