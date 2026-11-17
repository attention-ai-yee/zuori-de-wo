// ===== ENGINE (shared by game & tests) =====
const DIRS={U:[0,-1],D:[0,1],L:[-1,0],R:[1,0],W:[0,0]};
function parseLevel(L){
  const rows=L.map, H=rows.length, W=Math.max(...rows.map(r=>r.length));
  const g={W,H,tiles:[],plates:{},doors:[],doorAt:{},start:null,exit:null,boxes:[]};
  for(let y=0;y<H;y++){g.tiles.push([]);for(let x=0;x<W;x++){
    let c=rows[y][x]||'#';
    if(c==='S'){g.start={x,y};c='.';}
    else if(c==='E'){g.exit={x,y};}
    else if(c==='o'){g.boxes.push({x,y});c='.';}
    else if('abcd'.includes(c)){g.plates[x+','+y]=c;}
    else if('ABCD'.includes(c)){g.doors.push({x,y,col:c.toLowerCase(),inv:false});}
    else if('1234'.includes(c)){g.doors.push({x,y,col:'abcd'['1234'.indexOf(c)],inv:true});}
    g.tiles[y].push(c);
  }}
  g.doors.forEach((d,i)=>g.doorAt[d.x+','+d.y]=i);
  return g;
}
// agents: [ghost0..ghostN-1, player]; ghosts act first, in order.
function initState(g,n){return {t:0,a:Array.from({length:n+1},()=>({x:g.start.x,y:g.start.y})),boxes:g.boxes.map(b=>({...b})),won:false};}
function cloneState(s){return {t:s.t,a:s.a.map(q=>({x:q.x,y:q.y})),boxes:s.boxes.map(b=>({x:b.x,y:b.y})),won:s.won};}
function pressedOf(g,st,skip){const s={};const chk=o=>{if(o===skip)return;const c=g.plates[o.x+','+o.y];if(c)s[c]=true;};st.a.forEach(chk);st.boxes.forEach(chk);return s;}
// a door is passable only while its plate says open; someone caught inside just keeps it from shutting on them (jam), it does not let others in.
function doorStates(g,st,skip){const pr=pressedOf(g,st,skip);return g.doors.map(d=>{const on=!!pr[d.col];return d.inv?!on:on;});}
function doorJams(g,st){return g.doors.map(d=>st.a.some(q=>q.x===d.x&&q.y===d.y)||st.boxes.some(b=>b.x===d.x&&b.y===d.y));}
function step(g,st,acts){ // mutates st, returns events per agent
  const occ=(x,y)=>st.a.some(q=>q.x===x&&q.y===y);
  const boxAt=(x,y)=>st.boxes.find(b=>b.x===x&&b.y===y);
  const solid=(x,y,skip)=>{if(x<0||y<0||x>=g.W||y>=g.H)return true;if(g.tiles[y][x]==='#')return true;
    const di=g.doorAt[x+','+y];if(di!==undefined&&!doorStates(g,st,skip)[di])return true;return false;};
  const ev=st.a.map((e,i)=>{const a=acts[i];if(!a||a==='W')return 'wait';const [dx,dy]=DIRS[a];const nx=e.x+dx,ny=e.y+dy;
    if(solid(nx,ny,e))return 'bump'; // the mover lifts off its own plate as it steps
    const b=boxAt(nx,ny);
    if(b){const bx=nx+dx,by=ny+dy;if(solid(bx,by,b)||boxAt(bx,by)||occ(bx,by)||(g.exit&&bx===g.exit.x&&by===g.exit.y))return 'bump';b.x=bx;b.y=by;e.x=nx;e.y=ny;return 'push';}
    e.x=nx;e.y=ny;return 'move';});
  st.t++;const p=st.a[st.a.length-1];
  if(g.exit&&p.x===g.exit.x&&p.y===g.exit.y)st.won=true;
  return ev;
}
function snapOf(g,st,ev){return {t:st.t,a:st.a.map(q=>({...q})),boxes:st.boxes.map(b=>({...b})),doors:doorStates(g,st),jams:doorJams(g,st),pressed:pressedOf(g,st),ev,won:st.won};}
function simulate(g,recs,cur){
  const st=initState(g,recs.length);const frames=[snapOf(g,st,[])];
  for(let t=0;t<cur.length&&!st.won;t++){const acts=recs.map(r=>r[t]||'W');acts.push(cur[t]);frames.push(snapOf(g,st,step(g,st,acts)));}
  return frames;
}
