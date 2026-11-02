// a class of your own (made-up): made with the form (a half caster with its own spell list, a column that's a use, and
// features that change the sheet), built with, leveled to 2, and taken up by Gnick as a second class
const q = s => document.querySelector(s);
const click = s => { const e = q(s); expect(e, "there's a " + s); e.click(); };
const sel = (s, v) => { const e = q(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("change", { bubbles: true })); };
const typ = (s, v) => { const e = q(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); };
const tick = s => { const e = q(s); expect(e, "there's a " + s); e.checked = true; e.dispatchEvent(new Event("change", { bubbles: true })); };

step("a class of your own, made with the form", () => {
  ui.tab = "pcs"; render(); click('[data-act="cladd"]');
  typ('[data-clf="name"]', "Test Runecaller"); sel('[data-clf="hd"]', "8"); sel('[data-clp="1"]', "Intelligence");
  tick('[data-clm="saves"][data-v="int"]'); tick('[data-clm="saves"][data-v="wis"]');
  for (const k of ["arcana", "history", "insight"]) tick(`[data-clm="skillsFrom"][data-v="${k}"]`);
  typ('[data-clf="armor"]', "Light armor"); typ('[data-clf="weapons"]', "Simple weapons"); typ('[data-clf="eqA"]', "Dagger, Book, and 15 GP"); typ('[data-clf="mcProfs"]', "Light armor");
  sel('[data-clf="caster"]', "half"); sel('[data-clf="listFrom"]', ""); typ('[data-clf="ownSpells"]', "Fire Bolt, Magic Missile, Shield");
  const col = (i, name, vals) => { click('[data-act="clcoladd"]'); typ(`[data-clc="${i}.name"]`, name); vals.forEach((v, j) => typ(`[data-clc="${i}.vals.${j}"]`, v)); };
  col(0, "Cantrips", ["1", "1", "2"]); col(1, "Prepared Spells", ["2", "3", "4"]); col(2, "Rune Charges", ["2", "3", "3"]); tick('[data-clc="2.use"]');
  click('[data-act="clfadd"]'); typ('[data-clff="0.name"]', "Rune Sight"); typ('[data-clff="0.text"]', "You read runes."); sel('[data-fxadd="cls:' + clsObj().id + ':0"]', "skill");
  click('[data-act="clfadd"]'); typ('[data-clff="1.level"]', "2"); typ('[data-clff="1.name"]', "Rune Ward"); sel('[data-fxadd="cls:' + clsObj().id + ':1"]', "bonus");
  click('[data-act="cldone"]'); const x = ownClasses()[0], R = classShape(x);
  return `${x.name} d${R.hd}, ${R.primary}, saves ${R.saves.join("/")}, ${R.caster} caster (${R.castAb}, list "${R.listFrom}", own ${R.ownSpells}); table ${Object.keys(R.table).join(", ")}; uses ${R.useCols.map(u => u.name).join(", ")}; features ${R.features.map(f => `${f.lv[0]} ${f.name}: ${f.fx.map(fxSummary).join(", ")}`).join(" | ")}`;
});
step("the builder: its spells are its own list; level 1", () => {
  click('[data-act="newbuild"]'); sel('[data-bld="cls"]', "hb:" + ownClasses()[0].id); sel('[data-bld="sp"]', "Human");
  [["int", 0], ["dex", 1], ["con", 2], ["wis", 3], ["str", 4], ["cha", 5]].forEach(([k, i]) => sel(`[data-bld="pick.${k}"]`, String(i)));
  const offered = [...document.querySelectorAll('[data-act="bldspell"]')].map(b => b.textContent.trim()).join(", ");
  for (let i = 0; i < 4; i++) { const b = q('[data-act="bldspell"]:not(.on):not([disabled])'); if (b) b.click(); }
  q('[data-bld="name"]').value = "Test Rune"; q('[data-bld="name"]').dispatchEvent(new Event("input", { bubbles: true })); click('[data-act="bldmake"]');
  const c = db.chars.find(x => x.name === "Test Rune"); expect(c, "made");
  return `offered: ${offered} | ${clsLine(c)}, d${c.hd.die}, HP ${c.hpMax}, saves ${c.saveProf.join("/")}, casts with ${c.castAb}, slots ${JSON.stringify(c.slots)}, uses ${c.res.map(r => `${r.name} ${r.max}`).join(", ")}, perception ${skillLv(c, "perception")}, spells ${c.spells.map(s => s.name).join(", ")}, ${c.purse.gp} gp`;
});
step("to level 2: its feature, its use growing, and an ongoing +1 AC", () => {
  const c = db.chars.find(x => x.name === "Test Rune"), ac0 = acOf(c); ui.tab = "play"; render(); click('[data-act="levelup"]');
  const t = q("#ov").textContent.replace(/\s+/g, " "), spells = (t.match(/Spells[^]*?\./) || [""])[0].slice(0, 120);
  click('[data-act="luavg"]'); click('[data-act="luapply"]'); closeOv();
  return `${spells} | now level ${c.level}, slots ${JSON.stringify(c.slots)}, Rune Charges ${res(c, "Rune Charges").max}, AC ${ac0} → ${acOf(c)}, features ${c.traits.filter(x => /2$/.test(x.src)).map(x => x.name).join(", ")}`;
});
step("Gnick takes it up second: its requirement and what it gives", () => {
  db.cur = "ch_gnick"; ui.tab = "play"; render(); click('[data-act="levelup"]'); click('[data-act="lupick"][data-v="new"]'); sel('[data-lu="newCls"]', "Test Runecaller");
  const t = q("#ov").textContent.replace(/\s+/g, " "), need = (t.match(/To multiclass[^.]*\./) || [""])[0], gives = (t.match(/Multiclassing into Test Runecaller[^.]*\./) || [""])[0];
  click('[data-act="luavg"]'); click('[data-act="luapply"]'); closeOv(); const c = C();
  return `${need} | ${gives} | ${clsLine(c)}, slots ${slotLine(Object.fromEntries(Object.entries(c.slots).map(([k, s]) => [k, s.max])))}, hit dice ${hdText(c)}, profs: ${String(c.story.profs).split("\n").pop()}`;
});
