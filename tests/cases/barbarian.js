// The Barbarian (Joseph, 2026-11-06): Rage from its card (a use spent; Advantage on Strength checks and saves, the Rage
// Damage on a Strength attack), Danger Sense and Feral Instinct, and the level-ups (Primal Knowledge, Fast Movement,
// Primal Champion).
const bq = s => document.querySelector(s);
const bclick = s => { const e = bq(s); expect(e, "there's a " + s); e.click(); };
const bsel = (s, v) => { const e = bq(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("change", { bubbles: true })); };
const btyp = (s, v) => { const e = bq(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); };
step("a Barbarian built at level 1: the Rage card's button spends a use and puts Rage on: Strength checks and saves with Advantage, +2 on a Strength attack", () => {
  closeOv(); ui.tab = "pcs"; render(); BLD = null; bclick('[data-act="newbuild"]'); bsel('[data-bld="cls"]', "Barbarian"); bsel('[data-bld="sp"]', "Human");
  btyp('[data-bld="name"]', "Test Barbarian"); bclick('[data-act="bldmake"]'); const c = C(); ui.tab = "play"; render();
  const btn = bq('[data-act="rageon"]'); const before = btn ? btn.textContent : "no button"; bclick('[data-act="rageon"]');
  const str = autoMode(c, { kind: "save", ab: "str" }), chk = autoMode(c, { kind: "check", ab: "str" }), dex = autoMode(c, { kind: "save", ab: "dex" });
  const a = c.attacks.find(x => !asWritten(x) && atkAb(c, x) === "str"); if (a) { rollDamage(a.name + " damage", dmgOfAtk(c, a), { dtype: a.dtype, str: true }); }
  const dmg = a ? `${a.name}: +${R.flat} flat (${R.extra.map(e => e.name).join(", ") || "no dice"})` : "no Strength attack";
  closeOv(); render(); const after = bq('[data-act="rageoff"]') ? "End the Rage shown" : "no End button";
  bclick('[data-act="rageoff"]'); const off = raging(c);
  return `${before} | Rage left ${resLeft(res(c, "Rage"))} | Str save ${str.mode}, Str check ${chk.mode}, Dex save ${dex.mode} | ${dmg} | ${after}; raging after End: ${off}`;
});
