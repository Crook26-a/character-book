// The Oath of the Fallen Crown (Joseph's own paladin oath, 2026-11-12: "build the subclass, and build the mechanics into
// the apps"): offered with the SRD's oath, its features by level, the always-prepared spells and uses, and the cards'
// buttons (Kneel Before the Crown, Wrath of the Fallen on a weapon's damage, Aura of Never Again, Spectral Court).
const fcq = s => document.querySelector(s);
const fcclick = s => { const e = fcq(s); expect(e, "there's a " + s); e.click(); };
const fcsel = (s, v) => { const e = fcq(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("change", { bubbles: true })); };
const fctyp = (s, v) => { const e = fcq(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); };
const fcset = (c, n) => { c.level = n; if (Array.isArray(c.classes) && c.classes[0]) { c.classes[0].level = n; c.classes[0].sub = "Oath of the Fallen Crown"; } c.subcls = "Oath of the Fallen Crown"; };
const fcask = answers => { const q = answers.slice(); window.prompt = () => q.length ? q.shift() : ""; window.confirm = () => q.length ? q.shift() : true; };
step("a Paladin: the oath is offered beside Devotion; its features by level; at 20 with them all, the spells and uses", () => {
  closeOv(); ui.tab = "pcs"; render(); BLD = null; fcclick('[data-act="newbuild"]'); fcsel('[data-bld="cls"]', "Paladin"); fcsel('[data-bld="sp"]', "Human");
  fctyp('[data-bld="name"]', "Test Crown"); fcclick('[data-act="bldmake"]'); const c = C(); c.ab.cha = 18;
  const offers = subOffers(c).join(", "), feats = rSubFor(c, "Oath of the Fallen Crown").features.map(f => `${f.lv[0]} ${f.name}`).join(", ");
  fcset(c, 20); for (const f of rSubFor(c, "Oath of the Fallen Crown").features) c.traits.push({ name: f.name, text: f.desc, src: "Oath of the Fallen Crown" });
  for (const n of ["Lay On Hands", "Paladin's Smite", "Channel Divinity", "Aura of Protection"]) c.traits.push({ name: n, text: "", src: "Paladin" });
  ensureOrigins(c); const uses = ["Aura of Never Again", "Spectral Court"].map(n => `${n} ${(res(c, n) || {}).max}`).join(", ");
  const always = c.spells.filter(s => s.tag === "D").map(s => s.name).join(", ");
  return `offered: ${offers} || ${feats} || ${uses} || always prepared: ${always}`;
});
step("the cards: Kneel spends a Channel Divinity; Wrath on adds +4 Radiant to a Longsword's damage (not before); Never Again spends a use and turns Wrath on; Spectral Court and its slot", () => {
  const c = C(); c.slots = { 1: { max: 4, used: 0 }, 5: { max: 2, used: 0 } }; if (!res(c, "Channel Divinity")) c.res.push({ id: "rcd", name: "Channel Divinity", max: 3, used: 0, rest: "one" }); ui.tab = "feats"; render();
  const btns = [...document.querySelectorAll('[data-act^="pal"]')].map(b => `${b.dataset.act}${b.dataset.k ? ":" + b.dataset.k : ""}`).join(", ");
  fcclick('[data-act="palcd"][data-k="kneel"]'); const kn = `Channel Divinity left ${resLeft(res(c, "Channel Divinity"))}`;
  rollDamage("Longsword", "1d8+4", { weapon: true, dtype: "slashing" }); const before = R.extra.map(x => x.name).join(", ") || "nothing extra"; closeOv(); ui.tab = "feats"; render();
  fcclick('[data-act="palwrath"][data-k="on"]'); rollDamage("Longsword", "1d8+4", { weapon: true, dtype: "slashing" }); const after = R.extra.map(x => `${x.name} ${x.r.total}`).join(", "); closeOv(); ui.tab = "feats"; render();
  fcclick('[data-act="palwrath"][data-k="off"]'); const off = wrathUp(c); render();
  fcclick('[data-act="palna"]'); const na = `Never Again left ${resLeft(res(c, "Aura of Never Again"))}, Wrath ${wrathUp(c)}`; render();
  fcclick('[data-act="palcourt"][data-k="use"]'); render(); const back = !!fcq('[data-act="palcourt"][data-k="slot"]'); fcclick('[data-act="palcourt"][data-k="slot"]');
  const sc = `Court left ${resLeft(res(c, "Spectral Court"))}, slot button ${back}, 5th slots left ${c.slots[5].max - c.slots[5].used}`;
  c.effects = []; ui.tab = "play"; render();
  return `${btns} || ${kn} || before: ${before} | on: ${after} | off: ${off} || ${na} || ${sc}`;
});
