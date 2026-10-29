import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=new URL('./',import.meta.url);
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript'};
http.createServer(async(req,res)=>{try{const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=new URL('.'+(path==='/'?'/index.html':path),root);if(!fileURLToPath(file).startsWith(fileURLToPath(root))){res.writeHead(403).end();return;}const data=await readFile(file);res.writeHead(200,{'Content-Type':types[path.slice(path.lastIndexOf('.'))]|| (path==='/'?'text/html':'application/octet-stream')});res.end(data);}catch{res.writeHead(404).end('Not found');}}).listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('StickJump listening on port '+(process.env.PORT||3000)));
