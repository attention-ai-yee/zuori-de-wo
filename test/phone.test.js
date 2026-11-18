// Phone checks: every level solved under iPhone emulation (wide boards are shown transposed),
// a level that flips orientation mid-run still finishes, and phone screenshots.
const {chromium,devices}=require('playwright');const path=require('path');
const url='file://'+path.resolve(__dirname,'../index.html');const shots=path.resolve(__dirname,'../screenshots');
(async()=>{const br=await chromium.launch();let ok=true;
  const ctx=await br.newContext({...devices['iPhone 13']});const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto(url);await pg.waitForTimeout(500);await pg.screenshot({path:shots+'/m1-title.png'});
  const res=await pg.evaluate(()=>{const G=window.__game;G.setFast(true);const out=[];
    G.LEVELS.forEach((L,i)=>{G.load(i);const r=G.rotated();L.sol.forEach((s,k)=>{for(const c of s)G.act(c);if(k<L.sol.length-1)G.rewind();});out.push([i+1,L.name,G.state().won,r]);});return out;});
  res.forEach(r=>{console.log('手机',r[0],r[1],r[2]?'通关':'失败',r[3]?'(竖排)':'');if(!r[2])ok=false;});
  // orientation flip mid-run: start level 14 on a landscape viewport, then rotate to portrait
  await pg.setViewportSize({width:844,height:390});
  const flip=await pg.evaluate(async()=>{const G=window.__game;G.setFast(true);G.load(13);const S=G.LEVELS[13].sol;const before=G.rotated();
    S.slice(0,2).forEach(q=>{for(const c of q)G.act(c);G.rewind();});for(const c of S[2].slice(0,12))G.act(c);return before;});
  await pg.setViewportSize({width:390,height:844});await pg.waitForTimeout(400);
  const fr=await pg.evaluate(()=>{const G=window.__game;const S=G.LEVELS[13].sol;const after=G.rotated();for(const c of S[2].slice(12))G.act(c);G.rewind();for(const c of S[3])G.act(c);return [after,G.state().won];});
  console.log('中途转屏：',flip?'竖排':'横排','→',fr[0]?'竖排':'横排',fr[1]?'通关':'失败');if(!fr[1]||flip===fr[0])ok=false;
  // screenshots mid-play
  async function setup(i,loops,steps){await pg.evaluate(([i,loops,steps])=>{const G=window.__game;G.setFast(true);G.load(i);const S=G.LEVELS[i].sol;
    for(let k=0;k<loops;k++){for(const c of S[k])G.act(c);G.rewind();}for(const c of S[loops].slice(0,steps))G.act(c);G.setFast(false);},[i,loops,steps]);await pg.waitForTimeout(2300);}
  await setup(8,3,11);await pg.screenshot({path:shots+'/m2-play.png'});
  await setup(13,3,21);await pg.screenshot({path:shots+'/m3-farewell.png'});
  await pg.evaluate(()=>window.__game.showSel());await pg.waitForTimeout(300);await pg.screenshot({path:shots+'/m4-levels.png'});
  console.log('页面错误:',errs.length?errs:'无');if(errs.length)ok=false;
  console.log(ok?'全部通过':'有失败');await br.close();process.exit(ok?0:1);})();
