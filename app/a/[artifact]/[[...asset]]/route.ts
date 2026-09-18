import type { NextRequest } from 'next/server';
export const dynamic='force-dynamic';
const CSP="sandbox allow-scripts; default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; media-src data: blob:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'";
export async function GET(_request:NextRequest,{params}:{params:Promise<{artifact:string;asset?:string[]}>}) {
 const {artifact,asset}=await params;
 const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
 if(!/^[-a-z0-9]{3,80}$/.test(artifact)||(asset?.length&&!(asset.length===1&&asset[0]==='preview.png')))return new Response('Not found',{status:404,headers});
 if(!process.env.UC_DELIVERY_SECRET)return new Response('Publisher temporarily unavailable',{status:503,headers});
 try{
  const upstream=await fetch(`https://unconstrained-publisher.vercel.app/api/delivery/${artifact}`,{headers:{Authorization:`Bearer ${process.env.UC_DELIVERY_SECRET}`},cache:'no-store',signal:AbortSignal.timeout(12000)});
  if(!upstream.ok)return new Response(upstream.status===404?'Not found':'Publisher temporarily unavailable',{status:upstream.status===404?404:503,headers});
  const {published}=await upstream.json();
  if(asset?.[0]==='preview.png')return new Response(Buffer.from(published.image,'base64'),{headers:{...headers,'Content-Type':'image/png'}});
  return new Response(published.html,{headers:{...headers,'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':CSP,'Permissions-Policy':'camera=(), microphone=(), geolocation=()'}});
 }catch{return new Response('Publisher temporarily unavailable',{status:503,headers});}
}
