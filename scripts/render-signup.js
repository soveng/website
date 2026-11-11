export function renderSignup(cohort) {
  return `<form class="cohort-signup" action="/api/subscribe" method="post" data-cohort-signup>
    <p class="signup-note" id="${cohort}-signup-note">Get notified when applications open.</p>
    <input type="hidden" name="cohort" value="${cohort}">
    <div class="signup-trap" aria-hidden="true"><label>Leave this empty<input name="website" type="text" tabindex="-1" autocomplete="off"></label></div>
    <label class="signup-label" for="${cohort}-email">Email address</label>
    <div class="signup-fields"><input id="${cohort}-email" name="email" type="email" autocomplete="email" required maxlength="254" placeholder="Your email address" aria-describedby="${cohort}-signup-note"><button type="submit">Notify me <span aria-hidden="true">↗</span></button></div>
    <p class="signup-feedback" role="status" aria-live="polite"></p>
  </form>`;
}
