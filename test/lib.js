const fs=require('fs');
module.exports=new Function(fs.readFileSync(__dirname+'/../src/engine.js','utf8')+fs.readFileSync(__dirname+'/../src/levels.js','utf8')+';return {LEVELS,parseLevel,initState,cloneState,step,simulate};')();
