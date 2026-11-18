#!/bin/bash
# usage: dev/sheet.sh out.jpg t1,t2,...   (renders stills and tiles them 4 wide)
cd "$(dirname "$0")/.."; rm -f build/stills/*.jpg
node tools/render.mjs --stills "$2" 2>&1 | grep -iv "omz\|stills/"
python3 -c "
from PIL import Image,ImageDraw;import glob,sys
fs=sorted(glob.glob('build/stills/*.jpg'));W,H=480,270;n=len(fs);r=(n+3)//4
g=Image.new('RGB',(W*4,H*r));d=ImageDraw.Draw(g)
for i,f in enumerate(fs): g.paste(Image.open(f).resize((W,H)),((i%4)*W,(i//4)*H)); d.text(((i%4)*W+6,(i//4)*H+250),f.split('/')[-1],fill='lime')
g.save('$1',quality=85)"
