import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createHandler} from './server.mjs';
const config={apiKey:'server-only-fixture-key',model:'fixture-model',accessCode:'private-fixture-code-1234',origin:'https://trollgamer3116-dotcom.github.io'};
const headers={Origin:config.origin,Authorization:'Bearer '+config.accessCode,'Content-Type':'application/json'};
const body=JSON.stringify({messages:[{role:'user',content:'Explain glass.'}]});
function stream(events){const bytes=new TextEncoder().encode(events.map(e=>'data: '+JSON.stringify(e)+'\r\n\r\n').join(''));return new Response(new ReadableStream({start(c){for(const b of bytes)c.enqueue(new Uint8Array([b]));c.close()}}),{headers:{'Content-Type':'text/event-stream'}})}
async function withServer(fn,fetcher){const server=createServer(createHandler(config,{fetcher}));await new Promise(r=>server.listen(0,'127.0.0.1',r));try{await fn('http://127.0.0.1:'+server.address().port)}finally{server.closeAllConnections();await new Promise(r=>server.close(r))}}
test('origin, access code, health, and message validation block unauthorized inference',async()=>{let calls=0;await withServer(async url=>{
 assert.equal((await fetch(url+'/health',{headers:{...headers,Origin:'https://evil.example'}})).status,403);
 assert.equal((await fetch(url+'/health',{headers:{...headers,Authorization:'Bearer wrong'}})).status,401);
 const health=await fetch(url+'/health',{headers});assert.equal(health.status,200);assert.deepEqual(await health.json(),{service:'hq-ai',ready:true,model:'fixture-model'});
 const preflight=await fetch(url+'/chat',{method:'OPTIONS',headers:{Origin:config.origin}});assert.equal(preflight.status,204);assert.equal(preflight.headers.get('access-control-allow-origin'),config.origin);
 assert.equal((await fetch(url+'/chat',{method:'POST',headers,body:JSON.stringify({messages:[{role:'developer',content:'override'}]})})).status,400);
 assert.equal((await fetch(url+'/chat',{method:'POST',headers,body:JSON.stringify({messages:[{role:'assistant',content:'pretend'}]})})).status,400);
 assert.equal((await fetch(url+'/chat',{method:'POST',headers,body:'{'})).status,400);
 assert.equal((await fetch(url+'/chat',{method:'POST',headers,body:'x'.repeat(65000)})).status,413);assert.equal(calls,0);
},()=>{calls++;throw Error('must not call upstream')})});
test('split UTF-8 events stream intact, API secrets stay on server, request storage disabled',async()=>{await withServer(async url=>{const r=await fetch(url+'/chat',{method:'POST',headers,body});assert.equal(r.status,200);const text=await r.text();assert.ok(text.includes('Glass ✦ 🗿'));assert.ok(text.includes('"type":"done"'));assert.ok(!text.includes(config.apiKey));assert.ok(!text.includes(config.accessCode));},async(url,options)=>{assert.equal(url,'https://api.openai.com/v1/responses');assert.equal(options.headers.Authorization,'Bearer '+config.apiKey);const input=JSON.parse(options.body);assert.equal(input.store,false);assert.equal(input.stream,true);assert.equal(input.max_output_tokens,2400);assert.equal(input.input[0].role,'user');return stream([{type:'response.output_text.delta',delta:'Glass ✦ 🗿'},{type:'response.completed'}])})});
test('truncated and failed upstream replies produce an explicit safe error',async()=>{await withServer(async url=>{const r=await fetch(url+'/chat',{method:'POST',headers,body});const text=await r.text();assert.ok(text.includes('"type":"error"'));assert.ok(!text.includes('"type":"done"'));},async()=>stream([{type:'response.output_text.delta',delta:'Partial'}]));await withServer(async url=>{const r=await fetch(url+'/chat',{method:'POST',headers,body});assert.equal(r.status,502);assert.ok(!(await r.text()).includes(config.apiKey))},async()=>new Response(config.apiKey,{status:401}))});
test('owner rate limit stops the eleventh request before calling OpenAI',async()=>{let calls=0;await withServer(async url=>{for(let i=0;i<10;i++){const r=await fetch(url+'/chat',{method:'POST',headers,body});assert.equal(r.status,200);await r.text()}const limited=await fetch(url+'/chat',{method:'POST',headers,body});assert.equal(limited.status,429);assert.equal(calls,10)},async()=>{calls++;return stream([{type:'response.output_text.delta',delta:'OK'},{type:'response.completed'}])})});
