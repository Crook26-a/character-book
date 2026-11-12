// The Fighter (Joseph, 2026-11-12; his SRD 5.2.1): Action Surge and Indomitable's uses, Tactical Mind and Indomitable on a
// failed roll, a Champion's crit range, Remarkable Athlete, Defy Death, and the Fighting Style feats.
const yq = s => document.querySelector(s);
const yclick = s => { const e = yq(s); expect(e, "there's a " + s); e.click(); };
const ysel = (s, v) => { const e = yq(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("change", { bubbles: true })); };
const ytyp = (s, v) => { const e = yq(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); };
const yset = (c, n) => { c.level = n; if (Array.isArray(c.classes) && c.classes[0]) { c.classes[0].level = n; c.classes[0].sub = "Champion"; } c.subcls = "Champion"; };
step("a Fighter built at 1: the Fighting Style pick; Archery +2 on a bow, Defense +1 AC, Two-Weapon Fighting's modifier on an off-hand line", () => {
  closeOv(); ui.tab = "pcs"; render(); BLD = null; yclick('[data-act="newbuild"]'); ysel('[data-bld="cls"]', "Fighter"); ysel('[data-bld="sp"]', "Human");
  ytyp('[data-bld="name"]', "Test Fighter"); yclick('[data-act="bldmake"]'); const c = C(); ui.tab = "play"; render(); const pick = !!yq('[data-clpick="style1"]');
  const bow = { id: "atbow", name: "Longbow", ab: "dex", dice: "1d8", dtype: "piercing" }, off = { id: "atoff", name: "Shortsword (off-hand)", hit: 5, dmgx: "1d6", dtype: "piercing" }; c.attacks.push(bow, off);
  c.ab.str = 16; const b0 = atkOf(c, bow), ac0 = acOf(c), o0 = dmgOfAtk(c, off); ysel('[data-clpick="style1"]', "archery"); const b1 = atkOf(c, bow);
  c.style1 = "defense"; const ac1 = acOf(c); c.style1 = "twf"; const o1 = dmgOfAtk(c, off); c.style1 = ""; c.attacks = c.attacks.filter(a => a !== bow && a !== off);
  return `pick ${pick} | Longbow to hit ${b0} → ${b1} | AC ${ac0} → ${ac1} (${c.acNote || "no note"}) | off-hand ${o0} → ${o1}`;
});
step("level 9 Champion: Action Surge 1 and Indomitable 1 (2 and 3 at 17); a 19 is a crit; Tactical Mind on a failed check, Indomitable on a failed save; Advantage on Athletics and Initiative", () => {
  const c = C(); yset(c, 9); for (const n of ["Action Surge", "Indomitable", "Tactical Mind"]) if (!c.traits.some(t => t.name === n)) c.traits.push({ name: n, text: "", src: "Fighter" }); ensureOrigins(c);
  const u = () => ["Action Surge", "Indomitable"].map(n => `${n} ${(res(c, n) || {}).max}`).join(", "), at9 = u(); yset(c, 17); ensureOrigins(c); const at17 = u(); yset(c, 9); ensureOrigins(c);
  if (!res(c, "Second Wind")) c.res.push({ id: "rsw", name: "Second Wind", max: 2, used: 0, rest: "one" });
  rollD20({ label: "Swing", ctx: { kind: "atk", spell: false }, parts: [] }); R.mode = "normal"; R.d = [19, 19]; showRoll(); const crit = (yq("#ov .verdict") || {}).textContent; closeOv();
  rollD20({ label: "Check", ctx: { kind: "check", ab: "int", skill: "history" }, parts: [], dc: 30 }); R.mode = "normal"; R.d = [5, 5]; showRoll(); const tm = !!yq('[data-act="tactmind"]'); yclick('[data-act="tactmind"]'); const tmT = `${d20Total(R)}, Second Wind left ${resLeft(res(c, "Second Wind"))}`; closeOv();
  rollD20({ label: "Save", ctx: { kind: "save", ab: "con" }, parts: [] }); R.mode = "normal"; R.d = [2, 2]; showRoll(); yclick('[data-act="indom"]'); const ind = `${R.parts.map(p => p.name).join(",")}, Indomitable left ${resLeft(res(c, "Indomitable"))}`; closeOv();
  const ath = autoMode(c, { kind: "check", ab: "str", skill: "athletics" }), ini = autoMode(c, { kind: "init", ab: "dex" });
  return `9: ${at9} | 17: ${at17} | ${crit} | Tactical Mind button ${tm}: ${tmT} | Indomitable: ${ind} | Athletics ${ath.mode}, Initiative ${ini.mode} (${ini.adv.join(", ")})`;
});
step("level 18 Champion: Defy Death: death saves with Advantage, an 18 brings them back", () => {
  const c = C(); yset(c, 18); rollD20({ label: "Death save", ctx: { kind: "death" }, parts: [] }); const mode = R.mode; R.mode = "normal"; R.d = [18, 18]; showRoll(); const v = (yq("#ov .verdict") || {}).textContent; closeOv(); yset(c, 1);
  return `mode ${mode} | ${v}`;
});
