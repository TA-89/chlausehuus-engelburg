import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
http.createServer(async(req,res)=>{try{const rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(root,'.'+(rel==='/'?'/index.html':rel));if(!file.startsWith(path.resolve(root)+path.sep))throw Error();const body=await readFile(file);res.writeHead(200,{'Content-Type':({'html':'text/html; charset=utf-8','css':'text/css','js':'application/javascript','png':'image/png','svg':'image/svg+xml','webp':'image/webp'})[file.split('.').pop()]||'application/octet-stream','Cache-Control':'no-store'});res.end(body);}catch{res.writeHead(404);res.end('Nicht gefunden');}}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
