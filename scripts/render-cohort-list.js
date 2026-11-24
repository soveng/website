import { upcomingCohorts, cohortDates } from './upcoming-cohorts.js';

export function renderCohortList(cohorts = upcomingCohorts, { disableLinks = false } = {}) {
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  return `<section class="upcoming-cohorts" aria-labelledby="upcoming-title"><h3 id="upcoming-title">Upcoming cohorts / 2027</h3><ul>${cohorts.map(cohort => {
    const linkedRow = !disableLinks && cohort.href && !cohort.estimatedCostEur;
    const name = !disableLinks && cohort.href && cohort.estimatedCostEur ? `<a href="${escape(cohort.href)}">${escape(cohort.name)} <span aria-hidden="true">↗</span></a>` : `${escape(cohort.name)}${linkedRow ? ' <span aria-hidden="true">↗</span>' : ''}`;
    const content = `<div class="upcoming-cohort-name"><h4>${name}</h4><p>${escape(cohort.number)} · ${cohort.durationWeeks} ${cohort.durationWeeks === 1 ? 'week' : 'weeks'}${cohort.location ? ` · ${escape(cohort.location)}` : ''}${cohort.estimatedCostEur ? ' · <a class="cohort-cost-link" href="/faq/#is-this-a-free-program" aria-label="Estimated cost: approximately 1,200 euros per person. Read the FAQ.">~€1,200 pp</a>' : ''}</p></div><p class="upcoming-cohort-dates"><time datetime="${cohort.startDate}">${escape(cohortDates(cohort))}</time></p>`;
    return `<li>${linkedRow ? `<a class="upcoming-cohort" href="${escape(cohort.href)}">${content}</a>` : `<div class="upcoming-cohort">${content}</div>`}</li>`;
  }).join('')}</ul></section>`;
}
