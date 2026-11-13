const { test } = require('node:test');
const assert = require('node:assert/strict');
const subscribe = require('../api/subscribe.js');

test('signup validation, confirmation, privacy, and upstream failures', async () => {
  const originalFetch = global.fetch;
  const originalKey = process.env.BUTTONDOWN_API_KEY;
  const originalWarn = console.warn;
  const logs = [];
  console.warn = value => logs.push(JSON.parse(value));
  let calls = [], upstream = 201, upstreamBody = {}, invalidJSON = false;
  process.env.BUTTONDOWN_API_KEY = 'test-server-secret';
  global.fetch = async (url, options) => { calls.push({ url, ...options }); if (upstream === 'timeout') throw Error('timeout'); return { ok: upstream === 201, status: upstream, async json() { if (invalidJSON) throw Error('not JSON'); return upstreamBody; } }; };
  async function request(body = {email:'person@example.com',cohort:'mountain'}, overrides = {}) {
    const req = {method:'POST',headers:{host:'example.com',origin:'https://example.com','content-type':'application/json','x-vercel-forwarded-for':'192.0.2.1'},body,...overrides};
    const res = {headers:{},setHeader(k,v){this.headers[k]=v;},end(value){this.body=value;}};
    await subscribe(req,res); assert.ok(!res.body.includes('test-server-secret')); return res;
  }
  try {
    assert.equal((await request(undefined,{method:'GET'})).statusCode,405);
    assert.equal((await request(undefined,{headers:{host:'example.com',origin:'https://evil.example'}})).statusCode,403);
    for (const body of [{email:'bad',cohort:'summer'},{email:'ok@example.com',cohort:'other'},'{broken']) assert.equal((await request(body)).statusCode,400);
    assert.equal((await request({website:'spam'})).statusCode,200);
    assert.equal(calls.length,0);
    delete process.env.BUTTONDOWN_API_KEY;
    assert.equal((await request()).statusCode,503);
    process.env.BUTTONDOWN_API_KEY='test-server-secret';
    const valid = await request(); assert.equal(valid.statusCode,200);
    const payload = JSON.parse(calls[0].body);
    assert.equal(payload.type,'unactivated'); assert.equal(payload.metadata.cohort_interest,'mountain'); assert.equal(payload.ip_address,'192.0.2.1');
    assert.equal(calls[0].headers.Authorization,'Token test-server-secret');
    for (const [up,status] of [[409,503],[429,429],[422,503],[401,503],[500,503],['timeout',503]]) { upstream=up; assert.equal((await request()).statusCode,status); }
    assert.equal(calls[0].headers['X-Buttondown-Collision-Behavior'], 'add');
    assert.equal(calls[0].headers['X-Buttondown-Bypass-Firewall'], undefined);
    upstream = 400;
    upstreamBody = {code:'email_invalid',detail:'person@example.com 192.0.2.1 test-server-secret'};
    const invalid = await request();
    assert.equal(invalid.statusCode,400);
    assert.match(invalid.body,/couldn’t validate/);
    assert.ok(invalid.body.includes(logs.at(-1).reference));
    assert.equal(logs.at(-1).reason,'email_invalid');
    upstreamBody = {code:'subscriber_suppressed'};
    assert.equal((await request()).statusCode,422);
    upstreamBody = {code:'person@example.com', detail:'test-server-secret'};
    assert.equal((await request()).statusCode,503);
    assert.equal(logs.at(-1).reason,'upstream_error');
    upstream=422;
    upstreamBody={detail:[{loc:['body','ip_address'],msg:'192.0.2.1'}]};
    const schema = await request();
    assert.equal(schema.statusCode,503);
    assert.doesNotMatch(schema.body,/valid.*email|check.*address/i);
    invalidJSON=true;
    assert.equal((await request()).statusCode,503);
    invalidJSON=false;
    upstream=201;
    for (const type of ['blocked','complained','undeliverable','unsubscribed']) {
      upstreamBody={type};
      assert.equal((await request()).statusCode,422);
    }
    for (const type of ['regular','unactivated']) {
      upstreamBody={type};
      assert.equal((await request()).statusCode,200);
    }
    assert.doesNotMatch(JSON.stringify(logs),/person@example.com|192\.0\.2\.1|test-server-secret/);
    assert.ok(logs.every(log => /^[a-f0-9-]{36}$/.test(log.reference)));
    assert.equal(new Set(logs.map(log => log.reference)).size,logs.length);
    upstreamBody={};
    for (const email of ['builder+mountain@my-own-domain.dev',' me@selfhosted.example ']) {
      assert.equal((await request({email,cohort:'mountain'})).statusCode,200);
      assert.equal(JSON.parse(calls.at(-1).body).email_address,email.trim());
    }
    assert.equal((await request({email:'person@example.com',cohort:'upcoming'})).statusCode,200);
    assert.equal(JSON.parse(calls.at(-1).body).metadata.cohort_interest,'upcoming');
    const html=await request('email=person%40example.com&cohort=summer',{headers:{host:'example.com',accept:'text/html','content-type':'application/x-www-form-urlencoded'}});
    assert.equal(html.statusCode,200); assert.match(html.body,/<!doctype html>/);
  } finally {console.warn=originalWarn; global.fetch=originalFetch; if(originalKey===undefined)delete process.env.BUTTONDOWN_API_KEY;else process.env.BUTTONDOWN_API_KEY=originalKey;}
});
