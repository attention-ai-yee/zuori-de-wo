const {LEVELS,parseLevel,initState,cloneState,step,simulate}=require("./lib.js");
let ok=true;
LEVELS.forEach((L,i)=>{const g=parseLevel(L);const n=L.sol.length;
  const recs=L.sol.slice(0,n-1);const fr=simulate(g,recs,L.sol[n-1]);const last=fr[fr.length-1];
  // also 0-ghost: player alone with each loop's input should not win
  const cheap=L.sol.some(s=>simulate(g,[],s).at(-1).won);
  console.log(i+1,L.name,'ghosts',n-1,'cap',L.cap,last.won?'WIN':'FAIL@'+JSON.stringify(last.a.at(-1)),'t',last.t, cheap?'!!solo-win':'');
  if(!last.won||n-1>L.cap)ok=false;});
console.log(ok?'ALL OK':'SOME FAIL');
