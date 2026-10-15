const { test } = require('node:test');
const assert = require('node:assert/strict');
const subscribe = require('../api/subscribe.js');

test('signup validation, confirmation, privacy, and upstream failures', async () => {
  const originalFetch = global.fetch;
  const originalKey = process.env.BUTTONDOWN_API_KEY;
  let calls = [], upstream = 201;
  process.env.BUTTONDOWN_API_KEY = 'test-server-secret';
  global.fetch = async (url, options) => { calls.push({ url, ...options }); if (upstream === 'timeout') throw Error('timeout'); return { ok: upstream === 201, status: upstream }; };
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
    for (const [up,status] of [[409,200],[429,429],[422,400],[401,503],[500,503],['timeout',503]]) { upstream=up; assert.equal((await request()).statusCode,status); }
    upstream=201;
    assert.equal((await request({email:'person@example.com',cohort:'upcoming'})).statusCode,200);
    assert.equal(JSON.parse(calls.at(-1).body).metadata.cohort_interest,'upcoming');
    const html=await request('email=person%40example.com&cohort=summer',{headers:{host:'example.com',accept:'text/html','content-type':'application/x-www-form-urlencoded'}});
    assert.equal(html.statusCode,200); assert.match(html.body,/<!doctype html>/);
  } finally {global.fetch=originalFetch; if(originalKey===undefined)delete process.env.BUTTONDOWN_API_KEY;else process.env.BUTTONDOWN_API_KEY=originalKey;}
});
