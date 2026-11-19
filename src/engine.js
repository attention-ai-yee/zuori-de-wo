// ===== ENGINE (shared by game & tests) =====
const DIRS={U:[0,-1],D:[0,1],L:[-1,0],R:[1,0],W:[0,0]};
function parseLevel(L){
  const rows=L.map, H=rows.length, W=Math.max(...rows.map(r=>r.length));
  const g={W,H,tiles:[],plates:{},doors:[],doorAt:{},start:null,exit:null,boxes:[],keys:[],keyAt:{},locks:[],lockAt:{},portals:{}};
  for(let y=0;y<H;y++){g.tiles.push([]);for(let x=0;x<W;x++){
    let c=rows[y][x]||'#';
    if(c==='S'){g.start={x,y};c='.';}
    else if(c==='E'){g.exit={x,y};}
    else if(c==='o'){g.boxes.push({x,y});c='.';}
    else if('abcd'.includes(c)){g.plates[x+','+y]=c;}
    else if('ABCD'.includes(c)){g.doors.push({x,y,col:c.toLowerCase(),inv:false});}
    else if('1234'.includes(c)){g.doors.push({x,y,col:'abcd'['1234'.indexOf(c)],inv:true});}
    else if(c==='k'){g.keyAt[x+','+y]=g.keys.length;g.keys.push({x,y});c='.';}
    else if(c==='L'){g.lockAt[x+','+y]=g.locks.length;g.locks.push({x,y});}
    else if('pPqQ'.includes(c)){(g.portals[c.toLowerCase()]=g.portals[c.toLowerCase()]||[]).push({x,y,end:c});}
    g.tiles[y].push(c);
  }}
  g.doors.forEach((d,i)=>g.doorAt[d.x+','+d.y]=i);
  // portal pairs: stepping onto one end puts you on the other (if nobody is standing there)
  g.warp={};for(const k in g.portals){const [a,b]=g.portals[k];if(a&&b){g.warp[a.x+','+a.y]={x:b.x,y:b.y,pair:k};g.warp[b.x+','+b.y]={x:a.x,y:a.y,pair:k};}}
  return g;
}
// agents: [ghost0..ghostN-1, player]; ghosts act first, in order.
// keys: each key can be picked up once, by whoever reaches it first (ghost or you). A locked door (L) opens for good
// when someone carrying a key walks into it, using up that key.
function initState(g,n){return {t:0,a:Array.from({length:n+1},()=>({x:g.start.x,y:g.start.y})),boxes:g.boxes.map(b=>({...b})),won:false,
  keys:g.keys.map(()=>true),locks:g.locks.map(()=>true),held:Array(n+1).fill(0)};}
function cloneState(s){return {t:s.t,a:s.a.map(q=>({x:q.x,y:q.y})),boxes:s.boxes.map(b=>({x:b.x,y:b.y})),won:s.won,keys:s.keys.slice(),locks:s.locks.slice(),held:s.held.slice()};}
function pressedOf(g,st,skip){const s={};const chk=o=>{if(o===skip)return;const c=g.plates[o.x+','+o.y];if(c)s[c]=true;};st.a.forEach(chk);st.boxes.forEach(chk);return s;}
// a door is passable only while its plate says open; someone caught inside just keeps it from shutting on them (jam), it does not let others in.
function doorStates(g,st,skip){const pr=pressedOf(g,st,skip);return g.doors.map(d=>{const on=!!pr[d.col];return d.inv?!on:on;});}
function doorJams(g,st){return g.doors.map(d=>st.a.some(q=>q.x===d.x&&q.y===d.y)||st.boxes.some(b=>b.x===d.x&&b.y===d.y));}
function step(g,st,acts){ // mutates st, returns events per agent
  const occ=(x,y)=>st.a.some(q=>q.x===x&&q.y===y);
  const boxAt=(x,y)=>st.boxes.find(b=>b.x===x&&b.y===y);
  const locked=(x,y)=>{const li=g.lockAt[x+','+y];return li!==undefined&&st.locks[li];};
  const solid=(x,y,skip)=>{if(x<0||y<0||x>=g.W||y>=g.H)return true;if(g.tiles[y][x]==='#')return true;if(locked(x,y))return true;
    const di=g.doorAt[x+','+y];if(di!==undefined&&!doorStates(g,st,skip)[di])return true;return false;};
  const ev=st.a.map((e,i)=>{const a=acts[i];if(!a||a==='W')return 'wait';const [dx,dy]=DIRS[a];const nx=e.x+dx,ny=e.y+dy;
    let unl=false;
    if(locked(nx,ny)&&st.held[i]>0){st.locks[g.lockAt[nx+','+ny]]=false;st.held[i]--;unl=true;}
    if(solid(nx,ny,e))return 'bump'; // the mover lifts off its own plate as it steps
    const b=boxAt(nx,ny);let r='move';
    if(b){const bx=nx+dx,by=ny+dy;if(solid(bx,by,b)||boxAt(bx,by)||occ(bx,by)||g.warp[bx+','+by]||(g.exit&&bx===g.exit.x&&by===g.exit.y))return 'bump';b.x=bx;b.y=by;r='push';}
    e.x=nx;e.y=ny;if(unl)r='unlock';
    const ki=g.keyAt[nx+','+ny];if(ki!==undefined&&st.keys[ki]){st.keys[ki]=false;st.held[i]++;r='key';}
    const w=g.warp[nx+','+ny];if(w&&!occ(w.x,w.y)&&!boxAt(w.x,w.y)){e.x=w.x;e.y=w.y;r='warp';}
    return r;});
  st.t++;const p=st.a[st.a.length-1];
  if(g.exit&&p.x===g.exit.x&&p.y===g.exit.y)st.won=true;
  return ev;
}
function snapOf(g,st,ev){return {t:st.t,a:st.a.map(q=>({...q})),boxes:st.boxes.map(b=>({...b})),doors:doorStates(g,st),jams:doorJams(g,st),pressed:pressedOf(g,st),ev,won:st.won,keys:st.keys.slice(),locks:st.locks.slice(),held:st.held.slice()};}
function simulate(g,recs,cur){
  const st=initState(g,recs.length);const frames=[snapOf(g,st,[])];
  for(let t=0;t<cur.length&&!st.won;t++){const acts=recs.map(r=>r[t]||'W');acts.push(cur[t]);frames.push(snapOf(g,st,step(g,st,acts)));}
  return frames;
}
