import { upcomingCohorts, cohortDates } from './upcoming-cohorts.js';
import { renderSignup } from './render-signup.js';
import { readFileSync } from 'node:fs';

export function renderApply(settings = JSON.parse(readFileSync('content/applications.json', 'utf8'))) {
  if (!['open', 'closed'].includes(settings.status)) throw new Error('Application status must be open or closed');
  const open = settings.status === 'open';
  if (open && !/^https:\/\//.test(settings.applicationUrl || '')) throw new Error('Open applications need an HTTPS application URL');
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const cohorts = `<section class="upcoming-cohorts" aria-labelledby="upcoming-title"><h3 id="upcoming-title">Upcoming cohorts / 2027</h3><ul>${upcomingCohorts.map(cohort => {
    const content = `<div class="upcoming-cohort-name"><h4>${escape(cohort.name)}${cohort.href ? ' <span aria-hidden="true">↗</span>' : ''}</h4><p>${cohort.durationWeeks} ${cohort.durationWeeks === 1 ? 'week' : 'weeks'}${cohort.location ? ` · ${escape(cohort.location)}` : ''}</p></div><p class="upcoming-cohort-dates"><time datetime="${cohort.startDate}">${escape(cohortDates(cohort))}</time></p>`;
    return `<li>${cohort.href ? `<a class="upcoming-cohort" href="${escape(cohort.href)}">${content}</a>` : `<div class="upcoming-cohort">${content}</div>`}</li>`;
  }).join('')}</ul></section>`;
  return `<div class="finale-main" data-applications="${settings.status}">
    <h2>${open ? 'Apply to join' : 'Join'}<br><span class="invitation-accent">the next</span><br>adventure</h2>
    ${cohorts}
    ${open ? `<a href="${escape(settings.applicationUrl)}" class="apply-button"><span>Apply to join the crew</span><span aria-hidden="true">↗</span></a>` : renderSignup('upcoming')}
    <a href="/faq/" class="application-faq">Read the FAQ <span aria-hidden="true">↗</span></a>
  </div>`;
}
