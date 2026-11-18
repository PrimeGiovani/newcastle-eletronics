"""Generates studio-style SVG product renders into public/products/ (placeholders until real photography is uploaded)."""
import os
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "products")
os.makedirs(OUT, exist_ok=True)

def wrap(body, bg=("#F5F5F7", "#F5F5F7"), dark=False):
    if dark: bg = ("#1D1D1F", "#1D1D1F")
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
<defs>
 <radialGradient id="bg" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="{bg[0]}"/><stop offset="1" stop-color="{bg[1]}"/></radialGradient>
 <linearGradient id="white" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e6ebf2"/></linearGradient>
 <linearGradient id="steel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eef1f5"/><stop offset=".5" stop-color="#c9d0da"/><stop offset="1" stop-color="#aab3c0"/></linearGradient>
 <linearGradient id="black" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3f4a"/><stop offset="1" stop-color="#16181d"/></linearGradient>
 <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1E6BFF"/><stop offset=".55" stop-color="#7c3aed"/><stop offset="1" stop-color="#FF6B1A"/></linearGradient>
 <linearGradient id="pv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1d3b8f"/><stop offset="1" stop-color="#0b1c4a"/></linearGradient>
 <filter id="sh" x="-20%" y="-20%" width="140%" height="160%"><feGaussianBlur stdDeviation="14"/></filter>
</defs>
<rect width="800" height="800" fill="url(#bg)"/>
{body}
</svg>'''

def shadow(cx, cy, rx, ry=18, o=.16): return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="#1D1D1F" opacity="{o}" filter="url(#sh)"/>'

ART = {}
ART["ac-split"] = shadow(400, 520, 300) + '''
<rect x="90" y="300" width="620" height="190" rx="46" fill="url(#white)" stroke="#d5dbe5" stroke-width="2"/>
<rect x="90" y="300" width="620" height="60" rx="30" fill="#ffffff" opacity=".7"/>
<path d="M120 440 H680" stroke="#c3cad6" stroke-width="3"/>
<rect x="130" y="448" width="540" height="24" rx="12" fill="#d9dfe8"/>
<g stroke="#b9c1ce" stroke-width="2">''' + "".join(f'<path d="M{150+i*26} 452 v16"/>' for i in range(20)) + '''</g>
<rect x="560" y="385" width="96" height="30" rx="8" fill="#0f172a"/><text x="608" y="407" font-family="Arial" font-size="20" font-weight="700" fill="#38bdf8" text-anchor="middle">24°C</text>
<circle cx="140" cy="400" r="6" fill="#22c55e"/>'''
ART["ac-standing"] = shadow(400, 720, 150) + '''
<rect x="280" y="90" width="240" height="620" rx="40" fill="url(#white)" stroke="#d5dbe5" stroke-width="2"/>
<rect x="305" y="130" width="190" height="300" rx="22" fill="#e9eef5"/>
<g stroke="#c4ccd8" stroke-width="5" stroke-linecap="round">''' + "".join(f'<path d="M325 {160+i*26} H475"/>' for i in range(10)) + '''</g>
<rect x="330" y="470" width="140" height="56" rx="12" fill="#0f172a"/><text x="400" y="507" font-family="Arial" font-size="26" font-weight="700" fill="#38bdf8" text-anchor="middle">18°C</text>
<rect x="305" y="560" width="190" height="120" rx="16" fill="#eef2f7"/>'''
ART["soundbar"] = shadow(400, 560, 320) + '''
<rect x="70" y="330" width="560" height="90" rx="40" fill="url(#black)"/>
<rect x="90" y="345" width="520" height="60" rx="28" fill="#2a2f3a"/>
<g fill="#3d4452">''' + "".join(f'<circle cx="{110+i*16}" cy="{360+(j*14)}" r="3"/>' for i in range(32) for j in range(3)) + '''</g>
<rect x="560" y="250" width="170" height="290" rx="26" fill="url(#black)"/><circle cx="645" cy="420" r="62" fill="#20242c" stroke="#4b5260" stroke-width="6"/><circle cx="645" cy="420" r="20" fill="#3d4452"/>
<circle cx="350" cy="375" r="4" fill="#1E6BFF"/>'''
ART["home-theatre"] = shadow(400, 640, 320) + '''
<rect x="110" y="210" width="120" height="420" rx="20" fill="url(#black)"/><circle cx="170" cy="300" r="34" fill="#20242c" stroke="#4b5260" stroke-width="5"/><circle cx="170" cy="420" r="34" fill="#20242c" stroke="#4b5260" stroke-width="5"/><circle cx="170" cy="540" r="34" fill="#20242c" stroke="#4b5260" stroke-width="5"/>
<rect x="570" y="210" width="120" height="420" rx="20" fill="url(#black)"/><circle cx="630" cy="300" r="34" fill="#20242c" stroke="#4b5260" stroke-width="5"/><circle cx="630" cy="420" r="34" fill="#20242c" stroke="#4b5260" stroke-width="5"/><circle cx="630" cy="540" r="34" fill="#20242c" stroke="#4b5260" stroke-width="5"/>
<rect x="280" y="400" width="240" height="230" rx="24" fill="url(#black)"/><circle cx="400" cy="515" r="78" fill="#20242c" stroke="#4b5260" stroke-width="7"/><circle cx="400" cy="515" r="24" fill="#3d4452"/>'''
ART["speaker"] = shadow(400, 720, 220) + '''
<rect x="210" y="90" width="380" height="610" rx="48" fill="url(#black)"/>
<circle cx="400" cy="270" r="120" fill="#16181d" stroke="url(#screen)" stroke-width="12"/><circle cx="400" cy="270" r="40" fill="#2a2f3a"/>
<circle cx="400" cy="530" r="120" fill="#16181d" stroke="url(#screen)" stroke-width="12"/><circle cx="400" cy="530" r="40" fill="#2a2f3a"/>
<rect x="330" y="112" width="140" height="10" rx="5" fill="#FF6B1A"/>'''
ART["cooker"] = shadow(400, 735, 230) + '''
<rect x="190" y="150" width="420" height="570" rx="20" fill="url(#steel)" stroke="#9aa3b1" stroke-width="2"/>
<rect x="175" y="110" width="450" height="60" rx="12" fill="#1f2430"/>
<g fill="#30364a">''' + "".join(f'<ellipse cx="{260+i*93}" cy="128" rx="34" ry="10"/>' for i in range(4)) + '''</g>
<rect x="210" y="185" width="380" height="60" rx="10" fill="#e5e9ef"/>
<g fill="#1f2430">''' + "".join(f'<circle cx="{245+i*62}" cy="215" r="17"/>' for i in range(6)) + '''</g>
<rect x="225" y="280" width="350" height="300" rx="16" fill="#1a1d24"/><rect x="250" y="305" width="300" height="250" rx="10" fill="#2b3240" opacity=".9"/>
<rect x="250" y="262" width="300" height="12" rx="6" fill="#8a94a3"/>
<rect x="225" y="605" width="350" height="90" rx="10" fill="#d6dbe3"/>'''
ART["hood"] = shadow(400, 600, 260) + '''
<rect x="345" y="70" width="110" height="300" fill="url(#steel)" stroke="#9aa3b1" stroke-width="2"/>
<path d="M150 470 L300 360 H500 L650 470 Z" fill="url(#steel)" stroke="#9aa3b1" stroke-width="2"/>
<rect x="140" y="470" width="520" height="50" rx="8" fill="#c3cad6" stroke="#9aa3b1" stroke-width="2"/>
<rect x="500" y="482" width="120" height="24" rx="6" fill="#0f172a"/><circle cx="520" cy="494" r="4" fill="#38bdf8"/><circle cx="545" cy="494" r="4" fill="#38bdf8"/><circle cx="570" cy="494" r="4" fill="#38bdf8"/>'''
ART["fridge"] = shadow(400, 745, 190) + '''
<rect x="230" y="60" width="340" height="670" rx="26" fill="url(#steel)" stroke="#9aa3b1" stroke-width="2"/>
<path d="M230 290 H570" stroke="#8d96a5" stroke-width="4"/>
<rect x="520" y="110" width="14" height="140" rx="7" fill="#7b8494"/><rect x="520" y="330" width="14" height="220" rx="7" fill="#7b8494"/>
<rect x="270" y="110" width="90" height="46" rx="8" fill="#0f172a"/><text x="315" y="141" font-family="Arial" font-size="20" font-weight="700" fill="#38bdf8" text-anchor="middle">3°C</text>'''
ART["washer"] = shadow(400, 720, 220) + '''
<rect x="200" y="120" width="400" height="580" rx="30" fill="url(#white)" stroke="#d5dbe5" stroke-width="2"/>
<rect x="200" y="120" width="400" height="110" rx="30" fill="#eef2f7"/>
<rect x="420" y="155" width="140" height="42" rx="8" fill="#0f172a"/><text x="490" y="184" font-family="Arial" font-size="20" font-weight="700" fill="#38bdf8" text-anchor="middle">1:15</text>
<circle cx="270" cy="176" r="26" fill="#d9dfe8" stroke="#b9c1ce" stroke-width="3"/>
<circle cx="400" cy="450" r="160" fill="#c9d0da"/><circle cx="400" cy="450" r="130" fill="#1a2a44"/><circle cx="400" cy="450" r="110" fill="#264272" opacity=".9"/>
<path d="M330 420 q70 -50 140 0" stroke="#7fb0ff" stroke-width="10" fill="none" opacity=".5"/>'''



ART["solar-panel"] = shadow(400, 690, 300) + '''
<g transform="translate(400 400) skewX(-12)">
<rect x="-280" y="-250" width="560" height="500" rx="10" fill="#cfd6e2"/>
<rect x="-268" y="-238" width="536" height="476" fill="url(#pv)"/>
<g stroke="#9db6f0" stroke-width="2" opacity=".55">''' + "".join(f'<path d="M{-268+i*67} -238 V238"/>' for i in range(1, 8)) + "".join(f'<path d="M-268 {-238+j*59.5} H268"/>' for j in range(1, 8)) + '''</g>
<path d="M-268 -238 L60 -238 L-268 120 Z" fill="#fff" opacity=".08"/></g>'''
ART["battery"] = shadow(400, 700, 200) + '''
<rect x="230" y="120" width="340" height="560" rx="30" fill="url(#white)" stroke="#d5dbe5" stroke-width="2"/>
<rect x="230" y="120" width="340" height="80" rx="30" fill="#0A1F44"/><text x="400" y="172" font-family="Arial" font-size="28" font-weight="700" fill="#fff" text-anchor="middle">LiFePO4</text>
<g>''' + "".join(f'<rect x="{290+i*58}" y="260" width="40" height="14" rx="7" fill="{"#22c55e" if i<4 else "#d1d5db"}"/>' for i in range(4)) + '''</g>
<text x="400" y="420" font-family="Arial" font-size="64" font-weight="800" fill="#0A1F44" text-anchor="middle">5kWh</text><text x="400" y="470" font-family="Arial" font-size="24" fill="#64748b" text-anchor="middle">51.2V · 100Ah</text>
<rect x="280" y="560" width="240" height="70" rx="12" fill="#eef2f7"/>'''
ART["inverter"] = shadow(400, 680, 200) + '''
<rect x="230" y="140" width="340" height="520" rx="26" fill="url(#white)" stroke="#d5dbe5" stroke-width="2"/>
<rect x="270" y="190" width="260" height="150" rx="12" fill="#0f172a"/>
<path d="M290 300 l40 -50 l40 30 l40 -60 l40 40 l40 -20" stroke="#22c55e" stroke-width="5" fill="none"/>
<text x="400" y="225" font-family="Arial" font-size="20" font-weight="700" fill="#38bdf8" text-anchor="middle">5.0 kW</text>
<g>''' + "".join(f'<circle cx="{300+i*50}" cy="390" r="12" fill="#e5e9ef" stroke="#b9c1ce" stroke-width="3"/>' for i in range(5)) + '''</g>
<g stroke="#d5dbe5" stroke-width="4">''' + "".join(f'<path d="M280 {450+i*24} H520"/>' for i in range(7)) + '''</g>
<rect x="335" y="140" width="130" height="10" fill="#FF6B1A"/>'''
ART["ess"] = shadow(400, 735, 210) + '''
<rect x="230" y="70" width="340" height="650" rx="34" fill="url(#white)" stroke="#d5dbe5" stroke-width="2"/>
<rect x="275" y="120" width="250" height="130" rx="14" fill="#0f172a"/><text x="400" y="178" font-family="Arial" font-size="24" font-weight="700" fill="#38bdf8" text-anchor="middle">SOC 96%</text><rect x="300" y="200" width="200" height="16" rx="8" fill="#1e293b"/><rect x="300" y="200" width="190" height="16" rx="8" fill="#22c55e"/>
<path d="M230 300 H570 M230 440 H570 M230 580 H570" stroke="#d5dbe5" stroke-width="3"/>
<rect x="355" y="360" width="90" height="10" rx="5" fill="#FF6B1A"/>
<text x="400" y="660" font-family="Arial" font-size="22" font-weight="700" fill="#0A1F44" text-anchor="middle">ALL-IN-ONE ESS</text>'''

for name, body in ART.items():
    for variant, dark in (("", False), ("-dark", True)):
        with open(os.path.join(OUT, f"{name}{variant}.svg"), "w") as f: f.write(wrap(body, dark=dark))
print(f"wrote {len(ART)*2} files to public/products")
