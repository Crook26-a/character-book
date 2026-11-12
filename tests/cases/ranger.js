// The Ranger (Joseph, 2026-11-12; his SRD 5.2.1): Favored Enemy's free Hunter's Mark and the spell always prepared,
// Druidic Warrior, Roving, Tireless (and its Short Rest), Nature's Veil, the Hunter's picks, and the Hunter's Mark and
// Colossus Slayer buttons on damage.
const gq = s => document.querySelector(s);
const gclick = s => { const e = gq(s); expect(e, "there's a " + s); e.click(); };
const gsel = (s, v) => { const e = gq(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("change", { bubbles: true })); };
const gtyp = (s, v) => { const e = gq(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); };
const gset = (c, n) => { c.level = n; if (Array.isArray(c.classes) && c.classes[0]) { c.classes[0].level = n; c.classes[0].sub = "Hunter"; } c.subcls = "Hunter"; };
const gtrait = (c, names) => { for (const n of names) if (!c.traits.some(t => t.name === n)) c.traits.push({ name: n, text: "", src: "Ranger" }); };
step("a Ranger 10 (Hunter): Favored Enemy's free Hunter's Mark 4 and the spell prepared, Tireless 3; Roving's +10 Speed; Druidic Warrior adds two Druid cantrips; the Hunter's Prey pick", () => {
  closeOv(); ui.tab = "pcs"; render(); BLD = null; gclick('[data-act="newbuild"]'); gsel('[data-bld="cls"]', "Ranger"); gsel('[data-bld="sp"]', "Human");
  gtyp('[data-bld="name"]', "Test Ranger"); gclick('[data-act="bldmake"]'); const c = C(); c.ab.wis = 16; const sp0 = speedOf(c); gset(c, 10);
  gtrait(c, ["Favored Enemy", "Roving", "Tireless", "Fighting Style", "Hunter's Prey", "Defensive Tactics"]); ensureOrigins(c);
  const uses = ["Hunter's Mark, free (Favored Enemy)", "Tireless"].map(n => `${n} ${(res(c, n) || {}).max}`).join(", "), hm = c.spells.some(s => s.name === "Hunter's Mark" && s.tag === "D");
  ui.tab = "feats"; render(); gsel('[data-clpick="style1"]', "druidic"); const dw = C().spells.filter(s => s.tag === "DW").map(s => s.name).join(", "); const prey = [...document.querySelectorAll('[data-clpick="prey"] option')].map(o => o.value).filter(Boolean).join("/");
  gsel('[data-clpick="prey"]', "colossus"); ui.tab = "play"; render();
  return `${uses} | Hunter's Mark prepared ${hm} | Speed ${sp0} → ${speedOf(c)} | Druidic Warrior: ${dw} | Hunter's Prey ${prey}, picked ${C().prey}`;
});
step("Tireless gives 1d8 + 3 temp HP and a Short Rest takes a level of Exhaustion off; a weapon's damage, concentrating on Hunter's Mark: its button (+1d6 Force) and Colossus Slayer's (+1d8)", () => {
  const c = C(); c.temp = 0; ui.tab = "feats"; render(); gclick('[data-act="rgtire"]'); const ti = `temp ${c.temp >= 4 && c.temp <= 11}, Tireless left ${resLeft(res(c, "Tireless"))}`;
  c.exh = 2; openOv(shortRestHtml(c), "rest"); const sd = gq('[data-act="shortdone"]'); if (sd) sd.click(); const ex = `Exhaustion 2 → ${c.exh}`; closeOv(); ui.tab = "play"; render();
  c.conc = "Hunter's Mark"; rollDamage("Shortsword", "1d6+4", { weapon: true, dtype: "piercing" }); const btns = [...document.querySelectorAll('[data-act="rghm"],[data-act="rgcol"]')].map(b => b.textContent.trim()).join(" / ");
  gclick('[data-act="rghm"]'); gclick('[data-act="rgcol"]'); const ex2 = R.extra.map(x => x.name).join(", "); closeOv(); delete c.conc;
  return `${ti} | ${ex} || ${btns} || added: ${ex2}`;
});
