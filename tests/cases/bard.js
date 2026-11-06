// The Bard (Joseph, 2026-11-06): Bardic Inspiration's uses and the Give button, a held die added to a roll, Jack of All
// Trades, Font of Inspiration, Peerless Skill, and the level-up picks (Expertise, Lore's skills, Magical Secrets).
const dq = s => document.querySelector(s);
const dclick = s => { const e = dq(s); expect(e, "there's a " + s); e.click(); };
const dsel = (s, v) => { const e = dq(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("change", { bubbles: true })); };
const dtyp = (s, v) => { const e = dq(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); };
step("a Bard built at level 1: Bardic Inspiration's uses (Charisma, at least 1), the Give button spends one; a held d8 goes onto a roll", () => {
  closeOv(); ui.tab = "pcs"; render(); BLD = null; dclick('[data-act="newbuild"]'); dsel('[data-bld="cls"]', "Bard"); dsel('[data-bld="sp"]', "Human");
  dtyp('[data-bld="name"]', "Test Bard"); dclick('[data-act="bldmake"]'); const c = C(); ui.tab = "play"; render(); const r = res(c, "Bardic Inspiration");
  const uses = r ? `${resLeft(r)}/${r.max} (${r.rest}), Cha ${c.ab.cha}` : "no uses"; const btn = (dq('[data-act="bigive"]') || {}).textContent || "no button"; dclick('[data-act="bigive"]');
  ui.editMode = true; render(); dsel('[data-f="bi"]', "8"); ui.editMode = false; render(); rollD20({ label: "Test save", ctx: { kind: "save", ab: "dex" }, parts: [] }); R.mode = "normal"; R.d = [4, 4]; showRoll();
  const t0 = d20Total(R), add = !!dq('[data-act="biuse"]'); dclick('[data-act="biuse"]'); const t1 = d20Total(R); closeOv();
  return `uses ${uses} | ${btn} → ${resLeft(r)} left | the roll: ${t0} → ${t1} (button ${add}), die now "${c.bi || ""}"`;
});
step("Jack of All Trades at level 2: half the Proficiency Bonus on a skill they lack, none on one they have", () => {
  const c = C(), set = n => { c.level = n; if (Array.isArray(c.classes) && c.classes[0]) c.classes[0].level = n; };
  c.skills.performance = 1; const had = "performance", lack = Object.keys(SKILL).find(k => !skillLv(c, k)); const a1 = skillOf(c, lack); set(2); const a2 = skillOf(c, lack), h2 = skillOf(c, had); set(1);
  return `${SKILL[lack].name}: ${a1} at level 1, ${a2} at level 2 | ${SKILL[had].name} (proficient): ${h2} at level 2`;
});
