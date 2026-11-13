const { isIP } = require('node:net');
const { randomUUID } = require('node:crypto');

const accepted = 'Thanks. Check your inbox for a confirmation email. If you already receive our updates, you’re all set.';
module.exports = async function subscribe(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const reply = (status, message) => {
    res.statusCode = status;
    if ((req.headers.accept || '').includes('text/html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      // Messages are fixed strings, never subscriber or upstream content.
      return res.end(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Cohort updates</title><body style="background:#080808;color:#eee8dd;font:20px/1.6 system-ui;max-width:36em;margin:15vh auto;padding:24px"><h1>Cohort updates</h1><p>${message}</p><a style="color:inherit" href="/#apply">Upcoming cohorts</a> · <a style="color:inherit" href="/mountain/">Mountain cohort</a></body></html>`);
    }
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message }));
  };
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return reply(405, 'Please use the signup form.'); }
  const origin = req.headers.origin;
  if (origin) {
    try { if (new URL(origin).host !== req.headers.host) return reply(403, 'Please sign up through our website.'); }
    catch { return reply(403, 'Please sign up through our website.'); }
  }
  let body = req.body;
  if (typeof body === 'string') {
    if (body.length > 2048) return reply(413, 'Please submit only your email address.');
    try { body = (req.headers['content-type'] || '').includes('application/json') ? JSON.parse(body) : Object.fromEntries(new URLSearchParams(body)); }
    catch { return reply(400, 'Please enter a valid email address.'); }
  }
  if (!body || typeof body !== 'object') return reply(400, 'Please enter a valid email address.');
  if (body.website) return reply(200, accepted);
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply(400, 'Please enter a valid email address.');
  const cohort = body.cohort;
  if (!['summer', 'mountain', 'upcoming'].includes(cohort)) return reply(400, 'Please use one of our cohort signup forms.');
  const failed = (status, reason, message, upstreamStatus = null) => {
    const reference = randomUUID();
    // Only local categories and allowlisted codes. Never log addresses, IPs,
    // credentials, upstream detail/metadata, or exception messages.
    console.warn(JSON.stringify({ event: 'signup_failed', reference, reason, upstreamStatus, cohort }));
    return reply(status, `${message} If this keeps happening, email info@sovereignengineering.io with reference ${reference}.`);
  };
  const key = process.env.BUTTONDOWN_API_KEY;
  if (!key) return failed(503, 'configuration', 'Signup is temporarily unavailable. Please try again later.');
  // Vercel supplies this trusted client address; retain Buttondown’s spam checks.
  const ip = (req.headers['x-vercel-forwarded-for'] || '').split(',')[0].trim();
  try {
    const response = await fetch('https://api.buttondown.com/v1/subscribers', {
      method: 'POST', signal: AbortSignal.timeout(10000),
      headers: { Authorization: `Token ${key}`, 'Content-Type': 'application/json',
        // Merge repeat signups rather than rejecting an existing subscriber.
        // Explicit unactivated below retains confirmation for resubscriptions.
        'X-Buttondown-Collision-Behavior': 'add' },
      body: JSON.stringify({ email_address: email, type: 'unactivated',
        metadata: { cohort_interest: cohort }, ...(isIP(ip) ? { ip_address: ip } : {}) }),
    });
    const result = await response.json().catch(() => null);
    if (response.ok) {
      if (['blocked', 'complained', 'undeliverable', 'unsubscribed'].includes(result?.type)) {
        return failed(422, 'subscriber_suppressed', 'The signup service couldn’t activate this subscription.', response.status);
      }
      return reply(200, accepted);
    }
    if (response.status === 429) return failed(429, 'rate_limited', 'Too many signup attempts right now. Please wait a few minutes before trying again.', response.status);
    if ([400, 422].includes(response.status) && result?.code === 'email_invalid') {
      return failed(400, 'email_invalid', 'The signup service couldn’t validate this email address. Check for a typo; if it’s correct, please contact us.', response.status);
    }
    if ([400, 409, 422].includes(response.status) && result?.code === 'subscriber_suppressed') {
      return failed(422, 'subscriber_suppressed', 'The signup service couldn’t activate this subscription.', response.status);
    }
    return failed(503, 'upstream_error', 'We couldn’t complete your signup. Please try again later.', response.status);
  } catch { return failed(503, 'connection_error', 'We couldn’t reach the signup service. Please try again shortly.'); }
};
