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
step("level-ups: 2 asks for Expertise (Performance, Persuasion); 3 with the College of Lore asks for three skills; 6 opens the Cleric list (Magical Discoveries, not counted)", () => {
  const c = C(), up = () => { closeOv(); ui.tab = "play"; render(); dclick('[data-act="levelup"]'); dclick('[data-act="luavg"]'); };
  c.skills.performance = 1; c.skills.persuasion = 1; up(); const ex = !!dq('[data-lu="exp0"]'); dsel('[data-lu="exp0"]', "performance"); dsel('[data-lu="exp1"]', "persuasion"); dclick('[data-act="luapply"]');
  const two = `level ${c.level}: pickers ${ex}, Performance ${skillLv(c, "performance")}, Persuasion ${skillLv(c, "persuasion")}`;
  up(); if (dq('[data-lu="subcls"]')) dsel('[data-lu="subcls"]', "College of Lore"); const bp = !!dq('[data-lu="bp0"]');
  if (bp) { dsel('[data-lu="bp0"]', "arcana"); dsel('[data-lu="bp1"]', "history"); dsel('[data-lu="bp2"]', "religion"); } dclick('[data-act="luapply"]');
  const three = `level ${c.level} (${classesOf(c)[0].sub || c.subcls}): pickers ${bp}, Arcana ${skillLv(c, "arcana")}, History ${skillLv(c, "history")}, Religion ${skillLv(c, "religion")}`;
  closeOv(); c.level = 6; if (Array.isArray(c.classes) && c.classes[0]) c.classes[0].level = 6; const sec = bardSecrets(c, "Bard"), cure = SRD_SPELLS.find(s => /\bCleric\b/.test(s.cls || "") && !/\bBard\b/.test(s.cls || "") && +s.lv === 1);
  ui.tab = "spells"; render(); ui_pk.lim = false; openOv(pickerHtml("spell"), "pick:spell"); const n0 = c.spells.length; const add = dq(`[data-act="pkspell"][data-id="${cure.id}"]`); if (add) add.click(); closeOv();
  const got = c.spells.find(s => s.name === cure.name); c.level = 3; if (Array.isArray(c.classes) && c.classes[0]) c.classes[0].level = 3;
  return `${two} || ${three} || level 6 Lore: other lists ${sec}; ${cure.name} offered ${!!add}, added ${!!got} (${got ? got.feat : "-"})`;
});
step("Jack of All Trades at level 2: half the Proficiency Bonus on a skill they lack, none on one they have", () => {
  const c = C(), set = n => { c.level = n; if (Array.isArray(c.classes) && c.classes[0]) c.classes[0].level = n; };
  c.skills.performance = 1; const had = "performance", lack = Object.keys(SKILL).find(k => !skillLv(c, k)); set(1); const a1 = skillOf(c, lack); set(2); const a2 = skillOf(c, lack), h2 = skillOf(c, had); set(1);
  return `${SKILL[lack].name}: ${a1} at level 1, ${a2} at level 2 | ${SKILL[had].name} (proficient): ${h2} at level 2`;
});
