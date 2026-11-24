import { renderCohortList } from './render-cohort-list.js';
import { renderSignup } from './render-signup.js';
import { readFileSync } from 'node:fs';

export function renderApply(settings = JSON.parse(readFileSync('content/applications.json', 'utf8'))) {
  if (!['open', 'closed'].includes(settings.status)) throw new Error('Application status must be open or closed');
  const open = settings.status === 'open';
  if (open && !/^https:\/\//.test(settings.applicationUrl || '')) throw new Error('Open applications need an HTTPS application URL');
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const cohorts = renderCohortList();
  return `<div class="finale-main" data-applications="${settings.status}">
    <h2>${open ? 'Apply to join' : 'Join'}<br><span class="invitation-accent">the next</span><br>adventure</h2>
    ${open ? `<a href="${escape(settings.applicationUrl)}" class="apply-button"><span>Apply to join the crew</span><span aria-hidden="true">↗</span></a>` : renderSignup('upcoming')}
    ${cohorts}
    <a href="/faq/" class="application-faq">Read the FAQ <span aria-hidden="true">↗</span></a>
  </div>`;
}
