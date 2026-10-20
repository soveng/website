import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync,statSync} from 'node:fs';
import {join} from 'node:path';
import {parseDocument,DomUtils as D} from 'htmlparser2';
import {XMLParser,XMLValidator} from 'fast-xml-parser';
import {blogArticles,json} from './legacy-content.js';
const pages=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?pages(join(dir,e.name)):e.name.endsWith('.html')?[join(dir,e.name)]:[]);
const docs=new Map(pages('dist').map(file=>[file,parseDocument(readFileSync(file,'utf8'))]));
const problems=[];
const redirects=json('legacy-redirects');
const rewrites=JSON.parse(readFileSync('vercel.json','utf8')).rewrites || [];
const localHosts=['soveng.com','www.soveng.com','sovereignengineering.io','www.sovereignengineering.io','v3-nine-eta-60.vercel.app'];
function resolve(url,base) {
  let target;try{target=new URL(url,base);}catch{return null;}
  if(!localHosts.includes(target.hostname))return null;
  let path=decodeURIComponent(target.pathname);
  if(redirects[path.replace(/\/$/,'')]) return resolve(redirects[path.replace(/\/$/,'')]+(target.hash&&!redirects[path.replace(/\/$/,'')].includes('#')?target.hash:''),'https://sovereignengineering.io/');
  const rewrite=rewrites.find(rule=>!rule.has && rule.source===path);
  if(rewrite) path=rewrite.destination;
  let file='dist'+path;
  if(existsSync(file)&&statSync(file).isDirectory())file=file.replace(/\/$/,'')+'/index.html';
  if(!existsSync(file)&&!path.split('/').pop().includes('.'))file=file.replace(/\/$/,'')+'/index.html';
  return {file,hash:decodeURIComponent(target.hash.slice(1))};
}
for(const [file,doc] of docs) {
  const base='https://sovereignengineering.io/'+file.slice(5).replace(/index.html$/,'');
  for(const el of D.findAll(el=>el.type==='tag',doc.children)) {
    for(const attr of ['href','src','poster']) {
      const value=el.attribs?.[attr];if(!value||/^(mailto:|tel:|data:|nostr:)/.test(value)||value==='#')continue;
      const target=resolve(value,base);if(!target)continue;
      if(target.file.startsWith('dist/api/'))continue;
      if(!existsSync(target.file)){problems.push(`${file}: missing ${value}`);continue;}
      if(attr==='href'&&target.hash&&docs.has(target.file)&&!D.findOne(el=>el.attribs?.id===target.hash,docs.get(target.file).children))problems.push(`${file}: missing anchor ${value}`);
    }
  }
}
const legacyLinks=json('legacy-links').urls;
for(const path of legacyLinks) {
 const target=resolve(path,'https://sovereignengineering.io/');
 // Two originally broken relative links in syndicated posts belong to dergigi.com.
 if(!target && redirects[new URL(path,'https://sovereignengineering.io').pathname]?.startsWith('https://dergigi.com/'))continue;
 if(!target||!existsSync(target.file)){problems.push(`Legacy URL missing: ${path}`);continue;}
 if(target.hash&&docs.has(target.file)&&!D.findOne(el=>el.attribs?.id===target.hash,docs.get(target.file).children))problems.push(`Legacy fragment missing: ${path}`);
}
const rss=readFileSync('dist/dialogues.xml','utf8');
const feed=new XMLParser({ignoreAttributes:false,parseTagValue:false}).parse(rss).rss.channel;
for(const episode of feed.item) {
 const number=Number(episode.title.match(/^#?(\d+):/)[1]);
 const shortcut=redirects[`/${number}`];
 assert.ok(shortcut?.startsWith('/podcast/'),`Missing episode shortcut /${number}`);
 const destination=resolve(shortcut,'https://sovereignengineering.io/');
 assert.ok(destination&&existsSync(destination.file),`Broken episode shortcut /${number}`);
 const title=D.textContent(D.findOne(el=>el.name==='h1',docs.get(destination.file).children));
 assert.equal(title,episode.title,`Wrong episode at /${number}`);
}
for(const old of json('legacy-podcast-items')) {
 const episode=feed.item.find(item=>(item.guid?.['#text']||item.guid)===old.guid);
 assert.ok(episode,`Podcast GUID missing: ${old.guid}`);
 assert.equal(episode.enclosure['@_url'],old.enclosure,`Podcast audio changed: ${old.guid}`);
 assert.equal(episode.link,old.link,`Podcast link changed: ${old.guid}`);
}
const vercelRedirects=JSON.parse(readFileSync('vercel.json','utf8')).redirects;
for(const [source,destination] of Object.entries(redirects)) {
 const deployed=source.split('/').at(-1).includes('.')?source:source+'/';
 assert.ok(vercelRedirects.some(rule=>rule.source===deployed&&rule.destination===destination&&rule.permanent),`Missing Vercel redirect: ${source}`);
}

for(const [,url] of rss.matchAll(/<podcast:chapters url="([^"]+)"/g)) {
 const {file}=resolve(url,'https://sovereignengineering.io/');
 assert.ok(existsSync(file),url);assert.ok(JSON.parse(readFileSync(file)).chapters.length>0);
}
for(const file of ['dist/blog/rss.xml','dist/sitemap.xml','dist/sitemap-index.xml'])assert.equal(XMLValidator.validate(readFileSync(file,'utf8')),true,file);
const sitemap=new XMLParser().parse(readFileSync('dist/sitemap.xml','utf8')).urlset.url;
assert.equal(sitemap.length,docs.size-1);assert.ok(!sitemap.some(u=>u.loc.includes('404.html')));
assert.equal(blogArticles().length,15);
assert.match(readFileSync('dist/404.html','utf8'),/name="robots" content="noindex"/);
assert.equal(problems.length,0,[...new Set(problems)].join('\n'));
console.log(`Verified ${docs.size} pages, ${legacyLinks.length} legacy paths and fragments, internal links/anchors, chapter files, RSS, and sitemap.`);
