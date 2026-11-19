// BFS: can the level be won with k ghosts? Ghost inputs are free choices (recorded in earlier loops), so k ghosts = k+1 freely controlled agents.
const {LEVELS,parseLevel,initState,cloneState,step}=require("./lib.js");
function solvable(L,k,limit=4e6){const g=parseLevel(L);const s0=initState(g,k);
  const key=s=>s.a.slice(0,-1).map(q=>q.x+","+q.y).sort().join("|")+"P"+s.a.at(-1).x+","+s.a.at(-1).y+'#'+s.boxes.map(b=>b.x+','+b.y).sort().join('|')+'K'+s.keys.join('')+s.locks.join('')+s.held.join('');
  const seen=new Map([[key(s0),null]]);s0.h=[];let q=[s0];const A='UDLRW';const n=k+1;
  const combos=[];(function rec(p){if(p.length===n){combos.push(p.slice());return;}for(const c of A){p.push(c);rec(p);p.pop();}})([]);
  while(q.length){const nq=[];for(const s of q){for(const acts of combos){const t=cloneState(s);step(g,t,acts);t.h=s.h.concat([acts.join('')]);if(t.won){solvable.last=t.h;return true;}const kk=key(t);if(!seen.has(kk)){seen.set(kk,1);nq.push(t);if(seen.size>limit)return 'limit';}}}q=nq;}
  return false;}
const only=process.argv[2]?+process.argv[2]:null;
LEVELS.forEach((L,i)=>{if(only&&i+1!==only)return;const r=[];for(let k=Math.max(0,L.cap-1);k<L.cap;k++){const v=solvable(L,k);r.push(k+':'+v);if(v===true){if(process.argv[3])console.log(solvable.last.join(' '));break;}}
  console.log(i+1,L.name,'cap',L.cap,r.join(' '));});
