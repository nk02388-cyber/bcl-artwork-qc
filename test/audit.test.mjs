import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import audit from '../api/audit.mjs';

const env={OPENAI_API_KEY:'synthetic-key',APP_ACCESS_TOKEN:'synthetic-access',ALLOWED_ORIGIN:'https://example.github.io'};
const payload={prompt:'ตรวจฉลากตาม checklist',images:['data:image/jpeg;base64,/9j/2Q=='],depth:'default'};
const result={verdict:'fix',summary:'ตัวอย่าง',transcript:'ฉลาก',checklist:['name','type','ingr','howto','maker','net','lot','mfg','exp','warn','notif','thai','barcode','dieline','color','claims'].map(id=>({id,status:'unclear',evidence:'',comment:'ตรวจยืนยัน'})),issues:[]};
async function invoke({method='POST',body=payload,origin='https://example.github.io',token='synthetic-access',settings=env,fetchImpl=()=>{throw Error('Unexpected network request');}}={}){
  const req={method,headers:{host:'backend.example',origin,authorization:`Bearer ${token}`,'content-type':'application/json'},body};
  const res=new EventEmitter();res.headers={};res.setHeader=(k,v)=>res.headers[k]=v;res.end=text=>{res.body=text?JSON.parse(text):null;res.writableEnded=true;};
  await audit(req,res,{env:settings,fetchImpl});return res;
}
test('CORS and access checks block unauthorized calls before contacting OpenAI',async()=>{
  assert.equal((await invoke({origin:'https://untrusted.example'})).statusCode,403);
  assert.equal((await invoke({token:'wrong'})).statusCode,401);
  assert.equal((await invoke({settings:{}})).statusCode,403);
  const config=await invoke({method:'GET',settings:{...env,OPENAI_API_KEY:''}});
  assert.equal(config.body.configured,false);assert(!JSON.stringify(config.body).includes(env.APP_ACCESS_TOKEN));
  assert.equal((await invoke({method:'OPTIONS'})).statusCode,204);
});
test('payload validation rejects missing images, URL fetching and oversized input',async()=>{
  for(const body of [null,'{',{}, {...payload,images:[]},{...payload,images:['https://private.example']},{...payload,depth:'unknown'},{...payload,prompt:'x'.repeat(30001)}]) assert.equal((await invoke({body})).statusCode,400);
  assert.equal((await invoke({body:{...payload,prompt:'x'.repeat(4000001)}})).statusCode,413);
});
test('OpenAI image request uses server key and structured output; returns existing UI result',async()=>{
  const response=await invoke({fetchImpl:async(url,options)=>{
    assert.equal(url,'https://api.openai.com/v1/responses');
    assert.equal(options.headers.Authorization,'Bearer synthetic-key');
    const sent=JSON.parse(options.body);
    assert.equal(sent.store,false);assert.equal(sent.model,'gpt-4.1-mini');
    assert.equal(sent.input[0].content[1].type,'input_image');assert.equal(sent.text.format.strict,true);
    return {ok:true,json:async()=>({status:'completed',output:[{content:[{type:'output_text',text:JSON.stringify(result)}]}]})};
  }});
  assert.equal(response.statusCode,200);assert.deepEqual(response.body,result);
});
test('upstream rate limits, incomplete and invalid output never become a successful audit',async()=>{
  assert.equal((await invoke({fetchImpl:async()=>({ok:false,status:429})})).statusCode,429);
  for(const data of [{status:'incomplete'},{status:'completed',output:[]},{status:'completed',output:[{content:[{type:'output_text',text:'{}'}]}]}]) assert.equal((await invoke({fetchImpl:async()=>({ok:true,json:async()=>data})})).statusCode,502);
  assert.equal((await invoke({fetchImpl:async()=>{throw Object.assign(Error(),{name:'AbortError'});}})).statusCode,504);
});
test('frontend scripts parse and contain no embedded credentials or stale copy handler',()=>{
  const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
  for(const [,script] of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) if(script.trim()) new vm.Script(script);
  assert(html.includes('id="apiAccess"'));assert(html.includes('function openaiAudit'));
  assert(html.includes('location.origin:"https://bcl-artwork-qc.vercel.app"'));
  assert(!html.includes('$("envCopy").onclick'));assert(!html.includes('synthetic-key'));
});
