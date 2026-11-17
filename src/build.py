import re
src=open('game.src.html').read()
eng=open('engine.js').read(); lv=open('levels.js').read()
art=src.replace('/*ENGINE*/',eng).replace('/*LEVELS*/',lv)
open('../artifact.html','w').write(art)
# standalone file with a full document shell
head='<!doctype html>\n<html lang="zh-CN">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
i=art.index('</style>')+len('</style>')
open('../index.html','w').write(head+art[:i]+'\n</head>\n<body>\n'+art[i:]+'\n</body>\n</html>\n')
