// multiclassing: Gnick (Cleric 5, 2014) takes up Wizard (requirements, slots on the shared table, a d6 pool), then
// Wizard 2; Barbarian is out of reach (Str 10) unless the DM allows it; spells keep their class's DC; rests use every
// pool; and a warlock who takes up sorcerer keeps pact slots apart
const G = () => db.chars.find(c => c.id === "ch_gnick");
const q = s => document.querySelector(s);
const click = s => { const e = q(s); expect(e, "there's a " + s); e.click(); };
const sel = (s, v) => { const e = q(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("change", { bubbles: true })); };
const up = () => { db.cur = "ch_gnick"; ui.tab = "play"; render(); click('[data-act="levelup"]'); };
const said = () => q("#ov").textContent.replace(/\s+/g, " ");

step("Barbarian needs Str 13: not met, until the DM allows it", () => {
  up(); click('[data-act="lupick"][data-v="new"]'); sel('[data-lu="newCls"]', "Barbarian");
  const warn = (q("#ov .warn") || {}).textContent || "none"; click('[data-act="luavg"]');
  const blocked = q('[data-act="luapply"]').disabled; q('[data-lu="allow"]').click(); const after = q('[data-act="luapply"]').disabled;
  closeOv(); return `${warn}; blocked ${blocked}, after allowing ${!after}`;
});
step("Cleric 5 takes up Wizard: what it says, then level 6", () => {
  up(); click('[data-act="lupick"][data-v="new"]'); sel('[data-lu="newCls"]', "Wizard");
  const t = said(), need = (t.match(/To multiclass[^.]*\./) || [""])[0], gives = (t.match(/Multiclassing into Wizard[^.]*\./) || [""])[0], auto = (t.match(/By itself:[^.]*\./) || [""])[0];
  click('[data-act="luavg"]'); click('[data-act="luapply"]'); closeOv();
  const c = G(); return `${need} | ${gives} | ${auto} | now ${clsLine(c)}, level ${c.level}, HP ${c.hpMax}, hit dice ${hdText(c)}, slots ${slotLine(Object.fromEntries(Object.entries(c.slots).map(([k, s]) => [k, s.max])))}, features ${c.traits.filter(t => /^Wizard 1$/.test(t.src)).map(t => t.name).join(", ")}`;
});
step("Wizard 1 → 2: the subclass, from the Wizard's own level", () => {
  up(); click('[data-act="lupick"][data-v="1"]');
  const t = said(), sub = !!q('[data-lu="subcls"]'), feats = (t.match(/From the SRD 5\.1:[^.]*\./) || [""])[0];
  sel('[data-lu="subcls"]', "School of Evocation"); click('[data-act="luavg"]'); click('[data-act="luapply"]'); closeOv();
  const c = G(); return `asks for a subclass ${sub}; ${feats} | now ${clsLine(c)}, hit dice ${hdText(c)}, features ${c.traits.filter(t => /^Wizard 2$/.test(t.src)).map(t => t.name).join(", ")}`;
});
step("a Wizard spell keeps the Wizard's DC; the Cleric's keep theirs", () => {
  const c = G(); ui.tab = "spells"; render(); q('[data-act="addspell"]').click(); sel("#pkFor", "Wizard");
  const t = q("#pkQ"); t.value = "magic missile"; t.dispatchEvent(new Event("input", { bubbles: true })); click('#pkOut [data-act="pkspell"]'); closeOv();
  const mm = c.spells.find(s => s.name === "Magic Missile"), cl = c.spells.find(s => !s.cls && s.lvl > 0);
  ui.tab = "play"; render(); const stats = [...document.querySelectorAll(".stats .stat")].map(s => s.textContent.replace(/\s+/g, " ").trim()).filter(s => /DC|attack/.test(s)).join(" | ");
  return `Magic Missile is ${mm && mm.cls}, DC ${dcOf(c, mm)}; ${cl.name} DC ${dcOf(c, cl)}; Play shows ${stats}`;
});
step("rests: a d6 spent, then a long rest brings back the biggest first", () => {
  const c = G(); c.hp = 1; ui.tab = "play"; render(); click('[data-act="short"]');
  const btns = [...document.querySelectorAll('#ov [data-act="spendhd"]')].map(b => b.textContent.trim()).join(", ");
  click('#ov [data-act="spendhd"][data-p="1"]'); closeOv(); const spent = hdPools(c).map(p => `d${p.die} ${p.used}/${p.max}`).join(", ");
  c.hd.used = 3; longRest(c); return `buttons: ${btns}; after spending: ${spent}; after a long rest: ${hdPools(c).map(p => `d${p.die} ${p.used}/${p.max}`).join(", ")}`;
});
step("a Warlock 2 takes up Sorcerer: pact slots apart from the new slots", () => {
  const w = blankChar("Test Warlock"); Object.assign(w, { id: "ch_wl", cls: "Warlock", level: 2, rules: "2014", ab: { str: 8, dex: 14, con: 14, int: 10, wis: 12, cha: 16 }, hd: { die: 8, max: 2, used: 0 }, pact: true, slots: { 1: { max: 2, used: 1 } }, castAb: "cha" });
  db.chars.push(w); db.cur = w.id; ui.tab = "play"; render(); click('[data-act="levelup"]');
  click('[data-act="lupick"][data-v="new"]'); sel('[data-lu="newCls"]', "Sorcerer"); const auto = (said().match(/By itself:[^.]*\./) || [""])[0];
  click('[data-act="luavg"]'); click('[data-act="luapply"]'); closeOv();
  const c = db.chars.find(x => x.id === "ch_wl"); ui.tab = "play"; render();
  const rows = [...document.querySelectorAll('[data-sec="res"] .res .nm')].map(n => n.textContent.replace(/\s+/g, " ").trim()).filter(s => /slot/i.test(s)).join(" | ");
  return `${auto} | now ${clsLine(c)}, pact ${c.pact}, slots ${JSON.stringify(c.slots)}, pactSlots ${JSON.stringify(c.pactSlots)}; Play: ${rows}`;
});
