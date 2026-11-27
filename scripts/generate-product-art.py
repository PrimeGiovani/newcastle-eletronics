"""Product illustrations on #F5F5F7 (light) / #1D1D1F (dark) → public/products/.
Replace with product photography via Admin → Products."""
import os, math
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "products")
os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT):
    if f.endswith(".svg"): os.remove(os.path.join(OUT, f))

DEFS = '''<defs>
 <linearGradient id="white" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e6e8ee"/></linearGradient>
 <linearGradient id="steel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1f3f6"/><stop offset=".5" stop-color="#c9cfd8"/><stop offset="1" stop-color="#a9b1bd"/></linearGradient>
 <linearGradient id="black" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b3e46"/><stop offset="1" stop-color="#141519"/></linearGradient>
 <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3dea6"/><stop offset=".5" stop-color="#c9a45a"/><stop offset="1" stop-color="#9c7a36"/></linearGradient>
 <linearGradient id="rosegold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7d9cf"/><stop offset=".5" stop-color="#d9a08e"/><stop offset="1" stop-color="#b07563"/></linearGradient>
 <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2c2f36"/><stop offset=".6" stop-color="#121317"/><stop offset="1" stop-color="#1f2228"/></linearGradient>
 <linearGradient id="lid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b6170" stop-opacity=".55"/><stop offset="1" stop-color="#1b1d22" stop-opacity=".85"/></linearGradient>
 <linearGradient id="pv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1d3b8f"/><stop offset="1" stop-color="#0b1c4a"/></linearGradient>
 <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0071E3"/><stop offset="1" stop-color="#7c3aed"/></linearGradient>
 <filter id="sh" x="-20%" y="-20%" width="140%" height="160%"><feGaussianBlur stdDeviation="14"/></filter>
</defs>'''
def svg(body, dark): return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">{DEFS}<rect width="800" height="800" fill="{"#1D1D1F" if dark else "#F5F5F7"}"/>{body}</svg>'
def shadow(cx, cy, rx, ry=18): return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="#000" opacity=".16" filter="url(#sh)"/>'
FILL = {"white": "url(#white)", "black": "url(#black)", "gold": "url(#gold)", "rosegold": "url(#rosegold)", "silver": "url(#steel)"}
STROKE = {"white": "#d5dbe5", "black": "#0b0b0d", "gold": "#8a6a2c", "rosegold": "#9a6152", "silver": "#9aa3b1"}
ART = {}

# ── Air conditioners ──
def ac_split(c):
    vent = "#d9dfe8" if c == "white" else "#2a2c31"
    return shadow(400, 520, 300) + f'''<rect x="90" y="300" width="620" height="190" rx="46" fill="{FILL[c]}" stroke="{STROKE[c]}" stroke-width="2"/>
<rect x="110" y="312" width="580" height="40" rx="20" fill="#fff" opacity="{.6 if c=='white' else .06}"/>
<rect x="130" y="448" width="540" height="24" rx="12" fill="{vent}"/>
<g stroke="{'#b9c1ce' if c=='white' else '#4a4d55'}" stroke-width="2">''' + "".join(f'<path d="M{150+i*26} 452 v16"/>' for i in range(20)) + f'''</g>
<rect x="560" y="385" width="96" height="30" rx="8" fill="#0f172a"/><text x="608" y="407" font-family="Arial" font-size="20" font-weight="700" fill="#38bdf8" text-anchor="middle">24°C</text>
<circle cx="140" cy="400" r="6" fill="#22c55e"/>'''
ART["ac-split-white"] = ac_split("white"); ART["ac-split-black"] = ac_split("black")
def ac_round(c):
    return shadow(400, 735, 150) + f'''<rect x="285" y="70" width="230" height="650" rx="115" fill="{FILL[c]}" stroke="{STROKE[c]}" stroke-width="2"/>
<rect x="312" y="140" width="176" height="320" rx="88" fill="#000" opacity=".28"/>
<g stroke="{'#e9d39a' if c=='gold' else '#f3cfc4' if c=='rosegold' else '#5a5e68'}" stroke-width="5" stroke-linecap="round">''' + "".join(f'<path d="M335 {180+i*26} H465"/>' for i in range(10)) + '''</g>
<rect x="345" y="500" width="110" height="46" rx="12" fill="#0f172a"/><text x="400" y="531" font-family="Arial" font-size="22" font-weight="700" fill="#38bdf8" text-anchor="middle">18°C</text>
<rect x="320" y="590" width="160" height="90" rx="40" fill="#000" opacity=".18"/>'''
ART["ac-round-black"] = ac_round("black"); ART["ac-round-rosegold"] = ac_round("rosegold")
ART["ac-block-white"] = shadow(400, 720, 150) + '''<rect x="280" y="90" width="240" height="620" rx="26" fill="url(#white)" stroke="#d5dbe5" stroke-width="2"/>
<rect x="305" y="130" width="190" height="300" rx="14" fill="#e9eef5"/>
<g stroke="#c4ccd8" stroke-width="5" stroke-linecap="round">''' + "".join(f'<path d="M325 {160+i*26} H475"/>' for i in range(10)) + '''</g>
<rect x="330" y="470" width="140" height="56" rx="12" fill="#0f172a"/><text x="400" y="507" font-family="Arial" font-size="26" font-weight="700" fill="#38bdf8" text-anchor="middle">18°C</text>
<rect x="305" y="560" width="190" height="120" rx="12" fill="#eef2f7"/>'''

# ── Gas hobs ──
def burner(cx, cy, r, electric=False):
    if electric: return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#0b0c0f" stroke="#3a3d45" stroke-width="3"/><circle cx="{cx}" cy="{cy}" r="{r*.62}" fill="none" stroke="#7f1d1d" stroke-width="3" opacity=".8"/>'
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#1a1b1f" stroke="#55585f" stroke-width="3"/>'
            f'<circle cx="{cx}" cy="{cy}" r="{r*.55}" fill="#2e3036" stroke="#6b6f78" stroke-width="2"/><circle cx="{cx}" cy="{cy}" r="{r*.25}" fill="#8a8f99"/>'
            + "".join(f'<path d="M{cx+math.cos(a)*r*.6:.0f} {cy+math.sin(a)*r*.6:.0f} L{cx+math.cos(a)*r*1.05:.0f} {cy+math.sin(a)*r*1.05:.0f}" stroke="#2b2d33" stroke-width="7" stroke-linecap="round"/>' for a in [i*math.pi/2+math.pi/4 for i in range(4)]))
def hob(n, finish, electric=0, flip=True):
    """Hob seen from the front at ~35°: squashed top plate (burners become ellipses), flip-up lid behind, knob strip in front."""
    top = {"glass": "url(#glass)", "black": "url(#black)", "silver": "url(#steel)", "steel": "url(#steel)"}[finish]
    w = 600 if n >= 4 else 500 if n == 3 else 420
    x0 = 400 - w // 2; h = 420; k = 0.5; top_y = 390; ty = top_y - k * 0          # plate drawn at y=0..h then scaled by k
    layouts = {2: [(.28, .5, 70), (.72, .5, 70)], 3: [(.2, .5, 60), (.5, .5, 76), (.8, .5, 60)],
               4: [(.25, .28, 58), (.75, .28, 58), (.25, .72, 58), (.75, .72, 58)], 5: [(.18, .27, 54), (.82, .27, 54), (.5, .5, 74), (.18, .73, 54), (.82, .73, 54)]}[n]
    front_y = top_y + h * k
    b = shadow(400, front_y + 60, w // 2 + 20)
    if flip and finish != "steel":
        b += f'<path d="M{x0+18} {top_y} L{x0+50} {top_y-230} L{x0+w-50} {top_y-230} L{x0+w-18} {top_y} Z" fill="url(#lid)" stroke="#9aa3b1" stroke-opacity=".5" stroke-width="2"/><path d="M{x0+80} {top_y-215} L{x0+140} {top_y-215} L{x0+70} {top_y-20}" stroke="#fff" stroke-opacity=".12" stroke-width="12"/>'
    edge = "#0b0b0d" if finish in ("glass", "black") else "#9aa3b1"
    b += f'<g transform="translate(0 {ty}) scale(1 {k})"><rect x="{x0}" y="0" width="{w}" height="{h}" rx="22" fill="{top}" stroke="{edge}" stroke-width="4"/>'
    for i, (fx, fy, r) in enumerate(layouts):
        b += burner(x0 + fx * w, fy * h, r, electric=(i >= len(layouts) - electric))
    b += '</g>'
    strip = "#2a2c31" if finish in ("glass", "black") else "#b8c0cb"
    b += f'<rect x="{x0}" y="{front_y-6}" width="{w}" height="46" rx="10" fill="{strip}" stroke="{edge}" stroke-width="2"/>'
    b += "".join(f'<circle cx="{x0+46+i*(w-92)/(max(n,2)-1):.0f}" cy="{front_y+17}" r="13" fill="#d9dde3" stroke="#6b6f78" stroke-width="2"/>' for i in range(n))
    return b
for n in (2, 3, 4, 5):
    for f in ("glass", "black", "silver"):
        ART[f"hob-{n}-{f}"] = hob(n, f)
ART["hob-2-steel"] = hob(2, "steel", flip=False)
for n in (3, 4, 5): ART[f"hob-{n}-glass-e1"] = hob(n, "glass", electric=1)

# ── Range hoods ──
def hood(width, c):
    w = 520 if width == 90 else 380; x0 = 400 - w // 2
    return shadow(400, 600, w // 2) + f'''<rect x="350" y="70" width="100" height="300" fill="{FILL[c]}" stroke="{STROKE[c]}" stroke-width="2"/>
<path d="M{x0+10} 470 L{x0+130} 360 H{x0+w-130} L{x0+w-10} 470 Z" fill="{FILL[c]}" stroke="{STROKE[c]}" stroke-width="2"/>
<rect x="{x0}" y="470" width="{w}" height="48" rx="8" fill="{'#2a2c31' if c=='black' else '#c3cad6'}" stroke="{STROKE[c]}" stroke-width="2"/>
<rect x="{x0+w-150}" y="482" width="120" height="24" rx="6" fill="#0f172a"/>''' + "".join(f'<circle cx="{x0+w-130+i*25}" cy="494" r="4" fill="#38bdf8"/>' for i in range(4))
for wd in (60, 90):
    for c in ("black", "silver"): ART[f"hood-{wd}-{c}"] = hood(wd, c)

# ── Microwaves, ovens, small appliances ──
ART["microwave-surface"] = shadow(400, 600, 260) + '''<rect x="140" y="250" width="520" height="330" rx="26" fill="url(#black)"/>
<rect x="170" y="280" width="340" height="270" rx="14" fill="#0d0e11" stroke="#3a3d45" stroke-width="3"/><rect x="190" y="300" width="300" height="230" rx="8" fill="#22252b" opacity=".9"/>
<rect x="535" y="290" width="100" height="40" rx="8" fill="#0f172a"/><text x="585" y="318" font-family="Arial" font-size="20" font-weight="700" fill="#38bdf8" text-anchor="middle">12:00</text>
<g fill="#3a3d45">''' + "".join(f'<rect x="{545+(i%3)*28}" y="{350+(i//3)*28}" width="22" height="18" rx="4"/>' for i in range(9)) + '''</g><circle cx="585" cy="500" r="26" fill="#2a2c31" stroke="#55585f" stroke-width="3"/>'''
ART["microwave-builtin"] = shadow(400, 640, 260) + '''<rect x="150" y="190" width="500" height="430" rx="16" fill="url(#black)" stroke="#0b0b0d" stroke-width="3"/>
<rect x="175" y="215" width="450" height="270" rx="10" fill="#0d0e11" stroke="#3a3d45" stroke-width="3"/><rect x="200" y="240" width="300" height="220" rx="6" fill="#22252b"/>
<rect x="520" y="250" width="90" height="34" rx="6" fill="#0f172a"/><text x="565" y="274" font-family="Arial" font-size="18" font-weight="700" fill="#38bdf8" text-anchor="middle">21L</text>
<rect x="175" y="510" width="450" height="80" rx="10" fill="#2a2c31"/><rect x="230" y="540" width="340" height="12" rx="6" fill="#8a8f99"/>'''
ART["oven-builtin"] = shadow(400, 690, 260) + '''<rect x="150" y="130" width="500" height="540" rx="16" fill="url(#black)" stroke="#0b0b0d" stroke-width="3"/>
<rect x="175" y="155" width="450" height="80" rx="10" fill="#1a1b1f"/><rect x="345" y="175" width="110" height="40" rx="8" fill="#0f172a"/><text x="400" y="203" font-family="Arial" font-size="20" font-weight="700" fill="#f97316" text-anchor="middle">200°C</text>
<circle cx="230" cy="195" r="20" fill="#d9dde3"/><circle cx="570" cy="195" r="20" fill="#d9dde3"/>
<rect x="200" y="265" width="400" height="16" rx="8" fill="#8a8f99"/><rect x="190" y="300" width="420" height="330" rx="12" fill="#0d0e11" stroke="#3a3d45" stroke-width="3"/><rect x="220" y="330" width="360" height="270" rx="8" fill="#2b1a10" opacity=".85"/>
<path d="M240 560 H560" stroke="#f97316" stroke-opacity=".35" stroke-width="6"/>'''
ART["blender"] = shadow(400, 720, 150) + '''<path d="M300 150 H500 L470 520 H330 Z" fill="#dbe7f5" fill-opacity=".55" stroke="#9aa3b1" stroke-width="3"/>
<rect x="290" y="120" width="220" height="40" rx="12" fill="url(#black)"/><path d="M500 220 q70 10 60 120 q-5 70 -70 80" fill="none" stroke="#9aa3b1" stroke-width="16"/>
<path d="M360 470 l40 -30 l40 30" stroke="#6b6f78" stroke-width="8" fill="none"/>
<path d="M310 520 H490 L520 700 H280 Z" fill="url(#black)"/><circle cx="400" cy="620" r="34" fill="#d9dde3" stroke="#6b6f78" stroke-width="4"/>'''
ART["air-fryer"] = shadow(400, 700, 200) + '''<rect x="230" y="150" width="340" height="540" rx="90" fill="url(#black)"/>
<rect x="290" y="200" width="220" height="110" rx="20" fill="#0f172a"/><text x="400" y="268" font-family="Arial" font-size="38" font-weight="700" fill="#38bdf8" text-anchor="middle">180°</text>
<rect x="260" y="360" width="280" height="250" rx="40" fill="#22252b" stroke="#3a3d45" stroke-width="3"/><rect x="340" y="470" width="120" height="26" rx="13" fill="#8a8f99"/>'''
ART["charcoal-stove"] = shadow(400, 690, 220) + '''<path d="M230 330 H570 L540 600 H260 Z" fill="url(#black)"/>
<ellipse cx="400" cy="330" rx="170" ry="40" fill="#2a2c31" stroke="#55585f" stroke-width="4"/><ellipse cx="400" cy="330" rx="130" ry="28" fill="#7c2d12"/>
<g fill="#f97316" opacity=".85"><circle cx="360" cy="325" r="12"/><circle cx="410" cy="335" r="14"/><circle cx="450" cy="322" r="10"/></g>
<rect x="340" y="480" width="120" height="70" rx="10" fill="#141519" stroke="#55585f" stroke-width="3"/>
<path d="M260 600 L240 680 M540 600 L560 680" stroke="#2a2c31" stroke-width="16" stroke-linecap="round"/>'''

# ── Sound ──
ART["soundbar"] = shadow(400, 560, 320) + '''<rect x="70" y="330" width="560" height="90" rx="40" fill="url(#black)"/>
<rect x="90" y="345" width="520" height="60" rx="28" fill="#2a2f3a"/>
<g fill="#3d4452">''' + "".join(f'<circle cx="{110+i*16}" cy="{360+(j*14)}" r="3"/>' for i in range(32) for j in range(3)) + '''</g>
<rect x="560" y="250" width="170" height="290" rx="26" fill="url(#black)"/><circle cx="645" cy="420" r="62" fill="#20242c" stroke="#4b5260" stroke-width="6"/><circle cx="645" cy="420" r="20" fill="#3d4452"/>
<circle cx="350" cy="375" r="4" fill="#0071E3"/>'''
ART["home-theatre"] = shadow(400, 640, 320) + ''.join(f'<rect x="{x}" y="210" width="120" height="420" rx="20" fill="url(#black)"/>' + "".join(f'<circle cx="{x+60}" cy="{y}" r="34" fill="#20242c" stroke="#4b5260" stroke-width="5"/>' for y in (300, 420, 540)) for x in (110, 570)) + '''
<rect x="280" y="400" width="240" height="230" rx="24" fill="url(#black)"/><circle cx="400" cy="515" r="78" fill="#20242c" stroke="#4b5260" stroke-width="7"/><circle cx="400" cy="515" r="24" fill="#3d4452"/>'''
ART["boombox"] = shadow(400, 640, 300) + '''<rect x="110" y="280" width="580" height="330" rx="40" fill="url(#black)"/>
<path d="M260 280 V220 a20 20 0 0 1 20 -20 H520 a20 20 0 0 1 20 20 V280" fill="none" stroke="#2a2c31" stroke-width="22"/>
<circle cx="250" cy="450" r="100" fill="#16181d" stroke="url(#screen)" stroke-width="10"/><circle cx="250" cy="450" r="36" fill="#2a2f3a"/>
<circle cx="550" cy="450" r="100" fill="#16181d" stroke="url(#screen)" stroke-width="10"/><circle cx="550" cy="450" r="36" fill="#2a2f3a"/>
<rect x="360" y="320" width="80" height="36" rx="6" fill="#0f172a"/><text x="400" y="345" font-family="Arial" font-size="16" font-weight="700" fill="#38bdf8" text-anchor="middle">MP3</text>'''

# ── Solar ──
ART["solar-panel"] = shadow(400, 690, 300) + '''<g transform="translate(400 400) skewX(-12)"><rect x="-280" y="-250" width="560" height="500" rx="10" fill="#cfd6e2"/><rect x="-268" y="-238" width="536" height="476" fill="url(#pv)"/>
<g stroke="#9db6f0" stroke-width="2" opacity=".55">''' + "".join(f'<path d="M{-268+i*67} -238 V238"/>' for i in range(1, 8)) + "".join(f'<path d="M-268 {-238+j*59.5:.1f} H268"/>' for j in range(1, 8)) + '''</g><path d="M-268 -238 L60 -238 L-268 120 Z" fill="#fff" opacity=".08"/></g>'''
ART["battery"] = shadow(400, 700, 200) + '''<rect x="230" y="120" width="340" height="560" rx="30" fill="url(#white)" stroke="#d5dbe5" stroke-width="2"/>
<rect x="230" y="120" width="340" height="80" rx="30" fill="#1D1D1F"/><text x="400" y="172" font-family="Arial" font-size="28" font-weight="700" fill="#fff" text-anchor="middle">LITHIUM</text>
''' + "".join(f'<rect x="{290+i*58}" y="260" width="40" height="14" rx="7" fill="{"#22c55e" if i<4 else "#d1d5db"}"/>' for i in range(4)) + '''<rect x="280" y="330" width="240" height="250" rx="16" fill="#eef2f7"/><path d="M410 380 l-50 90 h40 l-20 80 l70 -110 h-45 l25 -60 z" fill="#0071E3"/>'''
ART["inverter"] = shadow(400, 680, 200) + '''<rect x="230" y="140" width="340" height="520" rx="26" fill="url(#white)" stroke="#d5dbe5" stroke-width="2"/>
<rect x="270" y="190" width="260" height="150" rx="12" fill="#0f172a"/><path d="M290 300 l40 -50 l40 30 l40 -60 l40 40 l40 -20" stroke="#22c55e" stroke-width="5" fill="none"/>
''' + "".join(f'<circle cx="{300+i*50}" cy="390" r="12" fill="#e5e9ef" stroke="#b9c1ce" stroke-width="3"/>' for i in range(5)) + '<g stroke="#d5dbe5" stroke-width="4">' + "".join(f'<path d="M280 {450+i*24} H520"/>' for i in range(7)) + '</g><rect x="335" y="140" width="130" height="10" fill="#0071E3"/>'
ART["ess"] = shadow(400, 735, 210) + '''<rect x="230" y="70" width="340" height="650" rx="34" fill="url(#white)" stroke="#d5dbe5" stroke-width="2"/>
<rect x="275" y="120" width="250" height="130" rx="14" fill="#0f172a"/><text x="400" y="178" font-family="Arial" font-size="24" font-weight="700" fill="#38bdf8" text-anchor="middle">SOC 96%</text><rect x="300" y="200" width="200" height="16" rx="8" fill="#1e293b"/><rect x="300" y="200" width="190" height="16" rx="8" fill="#22c55e"/>
<path d="M230 300 H570 M230 440 H570 M230 580 H570" stroke="#d5dbe5" stroke-width="3"/><rect x="355" y="360" width="90" height="10" rx="5" fill="#0071E3"/>
<text x="400" y="660" font-family="Arial" font-size="22" font-weight="700" fill="#1D1D1F" text-anchor="middle">ALL-IN-ONE ESS</text>'''
ART["portable-ess"] = shadow(400, 650, 240) + '''<rect x="180" y="250" width="440" height="380" rx="36" fill="url(#white)" stroke="#d5dbe5" stroke-width="2"/>
<path d="M260 250 V200 a24 24 0 0 1 24 -24 H516 a24 24 0 0 1 24 24 V250" fill="none" stroke="#1D1D1F" stroke-width="24"/>
<rect x="220" y="300" width="200" height="120" rx="12" fill="#0f172a"/><text x="320" y="372" font-family="Arial" font-size="34" font-weight="700" fill="#22c55e" text-anchor="middle">98%</text>
''' + "".join(f'<rect x="{450+(i%2)*70}" y="{300+(i//2)*60}" width="50" height="40" rx="8" fill="#1D1D1F"/>' for i in range(4)) + "".join(f'<circle cx="{250+i*60}" cy="500" r="16" fill="#e5e9ef" stroke="#1D1D1F" stroke-width="4"/>' for i in range(6)) + '<rect x="220" y="560" width="360" height="30" rx="10" fill="#eef2f7"/>'
ART["street-light"] = shadow(400, 740, 140) + '''<rect x="388" y="300" width="24" height="440" fill="url(#steel)"/>
<path d="M400 310 Q400 220 520 200" fill="none" stroke="#9aa3b1" stroke-width="20"/>
<g transform="rotate(-8 560 190)"><rect x="440" y="160" width="300" height="70" rx="14" fill="url(#black)"/><rect x="455" y="214" width="270" height="12" rx="6" fill="#fde68a"/></g>
<g transform="translate(250 120) skewX(-12)"><rect x="0" y="0" width="200" height="110" rx="6" fill="url(#pv)" stroke="#cfd6e2" stroke-width="5"/></g>
<path d="M470 260 L380 520 H640 L590 260 Z" fill="#fde68a" opacity=".18"/>'''

for name, body in ART.items():
    for suffix, dark in (("", False), ("-dark", True)):
        open(os.path.join(OUT, f"{name}{suffix}.svg"), "w").write(svg(body, dark))
print(f"wrote {len(ART)*2} files ({len(ART)} renders)")
