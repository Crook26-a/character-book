// The Druid (Joseph, 2026-11-12): Wild Shape's uses (SRD 5.2.1: 2, 3 at 6, 4 at 17) and Shift with forms from the survey,
// Druidic's Speak with Animals, Primal Order, the land's Circle Spells, Elemental Fury, the Land buttons; and the spell
// picker's prepared count (spellCap's "spells", lost in v59 and put back).
const zq = s => document.querySelector(s);
const zclick = s => { const e = zq(s); expect(e, "there's a " + s); e.click(); };
const zsel = (s, v) => { const e = zq(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("change", { bubbles: true })); };
const ztyp = (s, v) => { const e = zq(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); };
const zset = (c, n) => { c.level = n; if (Array.isArray(c.classes) && c.classes[0]) c.classes[0].level = n; };
step("a Druid built and taken to 2: Speak with Animals always prepared, the spell picker's prepared count is back, Wild Shape 2 uses with Shift", () => {
  closeOv(); ui.tab = "pcs"; render(); BLD = null; zclick('[data-act="newbuild"]'); zsel('[data-bld="cls"]', "Druid"); zsel('[data-bld="sp"]', "Human");
  ztyp('[data-bld="name"]', "Test Druid"); zclick('[data-act="bldmake"]'); const c = C(); closeOv(); ui.tab = "play"; render(); kup2();
  const swa = c.spells.filter(s => s.name === "Speak with Animals").map(s => s.tag).join(""), cap = spellCap(c, "Druid");
  c.forms = ["Wolf", "Rat"]; ensureOrigins(c); ui.tab = "play"; render(); const r = res(c, "Wild Shape"), before = r ? `${resLeft(r)}/${r.max} (${r.rest})` : "no uses";
  zsel("#wsPick", "Wolf"); zclick('[data-act="wsgo"]'); const shifted = `${c.shape}, temp ${c.temp}, uses ${resLeft(r)}`; zclick('[data-act="wsback"]');
  zset(c, 6); ensureOrigins(c); const six = res(c, "Wild Shape").max; zset(c, 17); ensureOrigins(c); const sev = res(c, "Wild Shape").max; zset(c, 2); ensureOrigins(c);
  return `level ${c.level}: Speak with Animals tag ${swa} | cantrips ${cap.cantrips}, prepared ${cap.spells} | Wild Shape ${before} → ${shifted}; back: ${c.shape || "none"} | max at 6 ${six}, at 17 ${sev}`;
});
function kup2() { closeOv(); ui.tab = "play"; render(); zclick('[data-act="levelup"]'); zclick('[data-act="luavg"]'); zclick('[data-act="luapply"]'); closeOv(); }
step("Primal Order (Magician: a cantrip more, Wisdom on Nature; Warden: the training); Circle of the Land at 7: temperate spells, a switch to polar swaps them", () => {
  const c = C(); ui.tab = "play"; render(); c.ab.wis = 16; const cap0 = spellCap(c, "Druid").cantrips, n0 = skillOf(c, "nature");
  zsel('[data-clpick="porder"]', "magician"); const mag = `cantrips ${cap0} → ${spellCap(c, "Druid").cantrips}, Nature ${n0} → ${skillOf(c, "nature")}`;
  zsel('[data-clpick="porder"]', "warden"); const war = /Martial weapons, Medium armor \(Warden\)/.test(c.story.profs);
  zset(c, 7); if (Array.isArray(c.classes) && c.classes[0]) c.classes[0].sub = "Circle of the Land"; c.subcls = "Circle of the Land"; c.land = "temperate"; ensureOrigins(c);
  const t = c.spells.filter(s => s.landSpell).map(s => s.name).join(", "); c.land = "polar"; ensureOrigins(c); const p = c.spells.filter(s => s.landSpell).map(s => s.name).join(", ");
  return `Magician: ${mag} | Warden training ${war} || temperate: ${t} || polar: ${p} | to the survey: land ${toSurvey(c).land}, forms ${JSON.stringify(toSurvey(c).forms)}`;
});
step("Elemental Fury: Potent puts +3 on Produce Flame; Primal Strike's buttons on a weapon's damage", () => {
  const c = C(); c.fury = "potent"; const sp = spellFromData(SRD_SPELLS.find(s => s.name === "Produce Flame")); const pot = spellExpr(c, sp, 0);
  c.fury = "primal"; const a = c.attacks.find(x => !asWritten(x)) || c.attacks[0]; rollDamage(a.name + " damage", dmgOfAtk(c, a), { dtype: a.dtype, weapon: true }); showRoll();
  const btns = [...document.querySelectorAll('[data-act="dstrike"]')].map(b => b.textContent.trim()).join(", "), t0 = R.total; zclick('[data-act="dstrike"][data-k="fire"]'); const t1 = R.total, ex = R.extra.map(x => x.name).join(", "); closeOv(); delete c.fury;
  return `Produce Flame: ${pot} | ${btns} | ${t0} → ${t1} (${ex})`;
});
