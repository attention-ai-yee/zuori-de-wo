import re
src=open('game.src.html').read()
eng=open('engine.js').read(); lv=open('levels.js').read()
art=src.replace('/*ENGINE*/',eng).replace('/*LEVELS*/',lv)
open('../artifact.html','w').write(art)
# standalone file with a full document shell
head='<!doctype html>\n<html lang="zh-CN">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">\n<meta name="theme-color" content="#13111d">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<style>body{padding-top:env(safe-area-inset-top,0px)!important;padding-bottom:env(safe-area-inset-bottom,0px)!important}</style>\n'
i=art.index('</style>')+len('</style>')
open('../index.html','w').write(head+art[:i]+'\n</head>\n<body>\n'+art[i:]+'\n</body>\n</html>\n')
