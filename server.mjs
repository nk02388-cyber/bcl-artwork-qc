import http from 'node:http';
import {readFile} from 'node:fs/promises';
import audit from './api/audit.mjs';
const html=await readFile(new URL('./public/index.html',import.meta.url));
http.createServer(async(req,res)=>{
  if(req.url?.split('?')[0]==='/api/audit') return audit(req,res);
  if(req.url==='/'||req.url==='/index.html'){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end(html);}
  res.statusCode=404;res.end('Not found');
}).listen(8765,'127.0.0.1',()=>console.log('BCL Artwork QC: http://127.0.0.1:8765'));
