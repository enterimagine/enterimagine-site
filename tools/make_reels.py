import json, re, subprocess, sys, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
# Usage: python3 make_reels.py <date YYYY-MM-DD> <input folder with package, images, _music> <output folder> <post numbers...>
U=os.path.join(sys.argv[2],''); R=os.path.join(sys.argv[3],''); DATE=sys.argv[1]
F=os.path.join(os.path.dirname(os.path.abspath(__file__)),'fonts','')
os.makedirs(R,exist_ok=True)
W,H=1080,1920
NAVY=(6,14,30); WHITE=(242,246,255); MUTED=(176,194,226); CYAN=(102,224,255); AMBER=(255,190,92)
f=lambda n,s: ImageFont.truetype(F+n+'.ttf',s)
TITLE=lambda s:f('nunito-latin-800-normal',s); BODY=lambda s:f('nunito-latin-600-normal',s); BOLD=lambda s:f('nunito-latin-800-normal',s)
def wrap(d,text,font,maxw):
    out=[]
    for para in text.split('\n'):
        line=''
        for w in para.split(' '):
            t=(line+' '+w).strip()
            if d.textlength(t.replace('**',''),font=font)<=maxw: line=t
            else: out.append(line); line=w
        out.append(line)
    return out
def rich(d,x,y,line,fn,fb,col,hi):
    # **bold** segments in highlight color
    parts=re.split(r'(\*\*[^*]+\*\*)',line); bold=False
    # handle bold spanning lines: simple toggle by markers
    for p in re.split(r'(\*\*)',line):
        if p=='**': rich.state=not rich.state; continue
        if not p: continue
        font=fb if rich.state else fn; c=hi if rich.state else col
        d.text((x,y),p,font=font,fill=c); x+=d.textlength(p,font=font)
rich.state=False
def overlay(slide,post,idx,n):
    im=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(im)
    acc=AMBER if slide.get('warm') else CYAN
    # top bar
    top=Image.new('RGBA',(W,330),(0,0,0,0)); g=ImageDraw.Draw(top)
    for i in range(330): g.line([(0,i),(W,i)],fill=(6,14,30,int(170*(1-i/330))))
    im.alpha_composite(top)
    x=64; y=78
    for ch in 'IMAGINE':
        d.text((x,y),ch,font=BOLD(40),fill=WHITE); x+=d.textlength(ch,font=BOLD(40))+5
    tag='['+post['reel']['tag']+']'; tw=d.textlength(tag,font=BOLD(30))
    d.rounded_rectangle((W-64-tw-36,74,W-64,74+56),28,fill=(*acc,235)); d.text((W-64-tw-18,82),tag,font=BOLD(30),fill=NAVY)
    d.text((64,138),post['reel']['domain'].upper(),font=BOLD(28),fill=(*MUTED,255))
    # bottom panel
    y0=1020
    bot=Image.new('RGBA',(W,H-y0+200),(0,0,0,0)); g=ImageDraw.Draw(bot)
    hgt=H-y0+200
    for i in range(hgt): g.line([(0,i),(W,i)],fill=(6,14,30,min(235,int(235*i/260))))
    im.alpha_composite(bot,(0,y0-200))
    d=ImageDraw.Draw(im); x=72; maxw=W-144; y=y0+40
    d.text((x,y),slide['kicker'].upper(),font=BOLD(36),fill=acc); y+=66
    if slide.get('big'):
        bs=150
        while d.textlength(slide['big'],font=TITLE(bs))>maxw and bs>60: bs-=6
        d.text((x,y-6),slide['big'],font=TITLE(bs),fill=acc); y+=int(bs*1.13)
    tf=TITLE(74 if not slide.get('big') else 58)
    for ln in wrap(d,slide['title'],tf,maxw): d.text((x,y),ln,font=tf,fill=WHITE); y+=int(tf.size*1.12)
    y+=24
    if slide.get('body'):
        rich.state=False; bf=BODY(44); bb=BOLD(44)
        for ln in wrap(d,slide['body'],bb,maxw): rich(d,x,y,ln,bf,bb,MUTED,WHITE); y+=58
        y+=14
    for b in slide.get('bullets',[]):
        d.ellipse((x,y+18,x+18,y+36),fill=acc)
        for k,ln in enumerate(wrap(d,b,BODY(46),maxw-44)): d.text((x+40,y),ln,font=BODY(46),fill=WHITE); y+=60
        y+=12
    if slide.get('question'):
        qf=BOLD(50); lines=wrap(d,slide['question'],qf,maxw-60); hh=len(lines)*64+50
        d.rounded_rectangle((x-6,y,W-66,y+hh),26,fill=(*AMBER,240))
        yy=y+25
        for ln in lines: d.text((x+24,yy),ln,font=qf,fill=NAVY); yy+=64
        y+=hh+20
    if slide.get('note'): d.text((x,y+6),slide['note'],font=BODY(34),fill=MUTED)
    # progress dots
    for k in range(n):
        cx=W//2-(n-1)*18+k*36; d.ellipse((cx-7,H-120,cx+7,H-106),fill=(*acc,255) if k==idx else (*MUTED,110))
    return im
def bg(path):
    im=Image.open(path).convert('RGB'); s=max(W*1.12/im.width,H*1.12/im.height)
    im=im.resize((round(im.width*s),round(im.height*s)),Image.LANCZOS)
    x=(im.width-int(W*1.12))//2; y=(im.height-int(H*1.12))//2
    return im.crop((x,y,x+int(W*1.12),y+int(H*1.12)))
def make(n):
    pk=json.load(open(U+DATE+'_package.json')); post=[p for p in pk['posts'] if p['n']==n][0]
    sl=post['reel']['slides']; durs=post['reel']['durs']; T=sum(durs)
    d=R+f'p{n}/'; os.makedirs(d,exist_ok=True)
    bg(U+f'{DATE}_post{n}.png').save(d+'bg.jpg',quality=93)
    for i,s in enumerate(sl): overlay(s,post,i,len(sl)).save(d+f's{i}.png')
    fr=int(T*30)
    inputs=['-loop','1','-t',str(T),'-i',d+'bg.jpg']
    for i in range(len(sl)): inputs+=['-loop','1','-t',str(T),'-i',d+f's{i}.png']
    inputs+=['-i',U+'_music/Discovery_Scott_Buckley_CC-BY4_reel-excerpt.m4a']
    W2,H2=int(W*1.12),int(H*1.12)
    fc=f"[0:v]scale={W2}:{H2},zoompan=z='1+0.10*on/{fr}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={fr}:s={W}x{H}:fps=30,eq=brightness=-0.03[b0];"
    t=0; last='b0'
    for i,du in enumerate(durs):
        st=t; en=t+du
        fc+=f"[{i+1}:v]format=rgba,fade=t=in:st={st}:d=0.35:alpha=1,fade=t=out:st={max(st,en-0.35)}:d=0.35:alpha=1[o{i}];[{last}][o{i}]overlay=0:0:enable='between(t,{st},{en})'[b{i+1}];"
        last=f'b{i+1}'; t=en
    fc+=f"[{last}]format=yuv420p,fade=t=out:st={T-0.6}:d=0.6[v];[{len(sl)+1}:a]atrim=0:{T},volume=0.85,afade=t=in:d=0.5,afade=t=out:st={T-1.5}:d=1.5[a]"
    out=R+f'{DATE}_post{n}_reel.mp4'
    subprocess.run(['ffmpeg','-y','-loglevel','error']+inputs+['-filter_complex',fc,'-map','[v]','-map','[a]','-t',str(T),'-r','30','-c:v','libx264','-preset','veryfast','-crf','20','-c:a','aac','-b:a','160k','-ar','48000','-movflags','+faststart',out],check=True)
    subprocess.run(['ffmpeg','-y','-loglevel','error','-ss','1.2','-i',out,'-frames:v','1','-q:v','3',R+f'{DATE}_post{n}_cover.jpg'],check=True)
    print(n,T,os.path.getsize(out))
# captions: package description plus the music credit
def caption(p): return p['description'].replace('\n\n#IMAGINE','\n\nMusic: “Discovery” by Scott Buckley (CC BY 4.0)\n\n#IMAGINE',1)
nums=list(map(int,sys.argv[4:]))
for n in nums: make(n)
pk=json.load(open(U+DATE+'_package.json'))
json.dump({str(p['n']):caption(p) for p in pk['posts'] if p['n'] in nums},open(R+'captions.json','w'),ensure_ascii=False,indent=1)
