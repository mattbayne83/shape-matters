// Cycle 002 computations
function calcFidelity(L, f) {
  const r = f/100;
  return { top: Math.pow(r, L-1)*100, rt: Math.pow(r, 2*(L-1))*100 };
}
function employeesPerLayer(L, E) {
  if (L <= 1) return [E];
  const span = Math.pow(E, 1/L);
  const raw = Array.from({length:L}, (_,k) => E/Math.pow(span,k));
  const s = raw.reduce((a,b)=>a+b,0);
  return raw.map(v => v/s*E);
}
function torqueProfile(L, E, f) {
  const r = f/100, counts = employeesPerLayer(L, E);
  return counts.map((_,origin) => {
    let t = 0;
    for (let k=0; k<L; k++) t += counts[k]*Math.pow(r, Math.abs(origin-k));
    return t/E;
  });
}
function pearson(pairs) {
  const n=pairs.length;
  let sx=0,sy=0,sxx=0,syy=0,sxy=0;
  for (const [x,y] of pairs) { sx+=x; sy+=y; sxx+=x*x; syy+=y*y; sxy+=x*y; }
  const d = Math.sqrt((n*sxx-sx*sx)*(n*syy-sy*sy));
  return d ? (n*sxy-sx*sy)/d : 0;
}

const COS = [
  ['Valve',1,350,82,1.5],['Nucor',4,32700,82,2],['Haier',3,75000,82,1],
  ['Meta',6,74067,82,2.5],['Google',8,183323,82,3.5],['Amazon',9,1556000,82,3]
];

// H1
console.log('=== H1 ===');
for (const [name,L,E,f,d] of COS) {
  const rl = 2*(L-1);
  const {rt} = calcFidelity(L, f);
  const mins = [5,10,15,25,50].map(t => rl===0 ? 0 : Math.pow(t/100, 1/rl)*100);
  const zone = [5,10,15,25,50].filter(t => rt >= t).pop() || 0;
  const cliff = rl===0 ? 0 : Math.pow(zone/100, 1/rl)*100;
  console.log(`${name}: L=${L} RT=${rt.toFixed(2)}% zone=>${zone}% mins=[${mins.map(m=>m.toFixed(1))}] margin=${(f-cliff).toFixed(1)}pp`);
}

// H2
console.log('\n=== H2 ===');
const baseline = [];
for (const [name,L,E,f] of COS) {
  const {top} = calcFidelity(L,f);
  const agil = torqueProfile(L,E,f)[L-1]*100;
  baseline.push([top, agil]);
  const counts = employeesPerLayer(L,E);
  const fl_w = counts[0]*Math.pow(f/100, L-1);
  const total_w = counts.reduce((s,c,k)=>s+c*Math.pow(f/100,Math.abs(L-1-k)),0);
  console.log(`${name}: fid=${top.toFixed(2)}% agil=${agil.toFixed(2)}% fl_dom=${(fl_w/total_w*100).toFixed(1)}%`);
}
console.log(`Baseline r=${pearson(baseline).toFixed(6)}`);
const adj=[],sp=[];
for (const [name,L,E,f] of COS) {
  const {top}=calcFidelity(L,f), span=Math.pow(E,1/L), agil=torqueProfile(L,E,f)[L-1]*100;
  adj.push([top, agil/(1+Math.log10(Math.max(span,1)))]);
  const r=f/100,counts=employeesPerLayer(L,E); let t=0;
  for(let k=0;k<L;k++){const dist=Math.abs(L-1-k);t+=counts[k]*Math.pow(r,dist)*Math.pow(1/span,dist>0?dist:0);}
  sp.push([top,t/E*100]);
}
console.log(`Coord-adj r=${pearson(adj).toFixed(6)}, Span-pen r=${pearson(sp).toFixed(6)}`);

// H3
console.log('\n=== H3 ===');
for(const[sn,fm]of[['Uniform',{Valve:82,Nucor:82,Haier:82,Meta:82,Google:82,Amazon:82}],['Archetype',{Valve:95,Nucor:90,Haier:92,Meta:78,Google:75,Amazon:70}],['Inverted',{Valve:70,Nucor:75,Haier:72,Meta:85,Google:88,Amazon:92}]]){
  const fa=[],fl=[];
  for(const[name,L,E,,d]of COS){const f=fm[name],{top}=calcFidelity(L,f),agil=torqueProfile(L,E,f)[L-1]*100,lag=Math.round(100*Math.exp(-d*(L-1)*(L-1)/100));fa.push([top,agil]);fl.push([top,lag]);console.log(`${sn} ${name}: f=${f} fid=${top.toFixed(2)} agil=${agil.toFixed(2)} lag=${lag}`);}
  const fr=COS.map(([n],i)=>[n,fa[i][0]]).sort((a,b)=>b[1]-a[1]).map(x=>x[0]);
  const ar=COS.map(([n],i)=>[n,fa[i][1]]).sort((a,b)=>b[1]-a[1]).map(x=>x[0]);
  console.log(`${sn}: FA=${pearson(fa).toFixed(4)} FL=${pearson(fl).toFixed(4)} rankMatch=${fr.join(',')==ar.join(',')}`);
  if(fr.join(',')!=ar.join(',')){console.log(`  F:${fr.join('>')}`);console.log(`  A:${ar.join('>')}`);}
}

// H4
console.log('\n=== H4 ===');
for(const[name,L,E,f]of COS){
  if(L<=1){console.log(`${name}: trivial`);continue;}
  const r=f/100,hl=Math.abs(Math.log(0.5)/Math.log(r)),tp=torqueProfile(L,E,f);
  let actual=null;for(let k=L-1;k>=0;k--)if(tp[k]>=0.5){actual=k;break;}
  console.log(`${name}: L=${L} hl=${hl.toFixed(2)} G=${(L-1-hl).toFixed(2)} actual=${actual} above50=${tp.filter(p=>p>=0.5).length}/${L}`);
  tp.forEach((p,k)=>console.log(`  L${k}: ${(p*100).toFixed(2)}%${k===L-1?' CEO':''}${k===0?' FL':''}`));
}
console.log('Half-lives:');
for(const f of[70,75,80,82,85,90,95])console.log(`  f=${f}: ${Math.abs(Math.log(0.5)/Math.log(f/100)).toFixed(2)} layers`);

// Gemba table
console.log('\nGemba table (layers with >50%):');
let hdr='L\\f';for(const f of[70,75,80,82,85,90,95])hdr+=`  ${f}`;console.log(hdr);
for(let L=2;L<=12;L++){let row=`${L}  `;for(const f of[70,75,80,82,85,90,95]){const hl=Math.abs(Math.log(0.5)/Math.log(f/100));row+=`  ${Math.max(0,Math.floor(L-1-hl))+1}`;}console.log(row);}

// H5
console.log('\n=== H5 ===');
for(const[name,L,E,f,d]of COS){
  if(L<=2)continue;
  const r=f/100,dFid=(Math.pow(r,L-2)-Math.pow(r,L-1))*100,dRT=(Math.pow(r,2*(L-2))-Math.pow(r,2*(L-1)))*100;
  const lagB=d*(L-1)*(L-1),lagA=d*(L-2)*(L-2),dLag=lagB-lagA;
  const agilB=torqueProfile(L,E,f)[L-1]*100,agilA=torqueProfile(L-1,E,f)[L-2]*100;
  const hB=Math.round(100*Math.exp(-lagB/100)),hA=Math.round(100*Math.exp(-lagA/100));
  console.log(`${name} ${L}->${L-1}: dFid=+${dFid.toFixed(2)}pp dRT=+${dRT.toFixed(2)}pp dLag=-${dLag}d dAgil=+${(agilA-agilB).toFixed(2)}pp health=${hB}->${hA} rate=${(dFid/dLag).toFixed(4)}pp/d`);
}
