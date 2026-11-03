// starting above level 1 (made-up characters): the builder makes level 1, then each level comes in turn with the
// level-up's choices; a caster adds spells between levels; "Finish later" stops partway; a level can go to a new class
const q = s => document.querySelector(s);
const click = s => { const e = q(s); expect(e, "there's a " + s); e.click(); };
const sel = (s, v) => { const e = q(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("change", { bubbles: true })); };
const typ = (s, v) => { const e = q(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); };
const build = (ed, cls, name, to, order) => {
  ui.tab = "pcs"; render(); click('[data-act="newbuild"]'); if (ed !== "2024") click(`[data-act="blded"][data-v="${ed}"]`);
  sel('[data-bld="toLevel"]', String(to)); sel('[data-bld="cls"]', cls); sel('[data-bld="sp"]', "Human");
  order.forEach((k, i) => sel(`[data-bld="pick.${k}"]`, String(i)));
  const note = (q("#ov").textContent.replace(/\s+/g, " ").match(/This page makes level 1[^“]*/) || [""])[0];
  typ('[data-bld="name"]', name); click('[data-act="bldmake"]'); return note;
};
const banner = () => (q("#ov .verdict") || {}).textContent || "(none)";

step("a 2014 fighter to level 4: each level in turn", () => {
  const note = build("2014", "Fighter", "Test Four", 4, ["str", "con", "dex", "wis", "cha", "int"]);
  const seen = [banner()]; click('[data-act="luavg"]'); click('[data-act="luapply"]');
  seen.push(banner()); sel('[data-lu="subcls"]', "Champion"); click('[data-act="luavg"]'); click('[data-act="luapply"]');
  seen.push(banner()); LV.asi = "one"; LV.a = "str"; showLevelUp(C()); click('[data-act="luavg"]'); click('[data-act="luapply"]');
  const c = C();
  return `${note}| ${seen.join(" / ")} | then ${q("#ov").hidden ? "closed" : "still open"}: ${clsLine(c)}, level ${c.level}, HP ${c.hpMax}, STR ${c.ab.str}, building ${c.buildTo ?? "done"}, journal ${c.sessions.length}, features ${c.traits.filter(t => /Fighter|Champion/.test(t.src)).map(t => t.name).join(", ")}`;
});
step("a wizard to level 3: spells between levels, then Finish later", () => {
  build("2024", "Wizard", "Test Three", 3, ["int", "dex", "con", "wis", "cha", "str"]);
  click('[data-act="luavg"]'); click('[data-act="luapply"]');
  const picker = `${ovKind}: ${(q('#ov [data-act="bldnext"]') || {}).textContent}`; click('#ov [data-act="bldnext"]');
  const next = `${ovKind}, ${banner()}`; click('#ov [data-act="bldlater"]');
  const c = C(), t = q("#view").textContent.replace(/\s+/g, " "), todo = (t.match(/Not finished yet\.[^.]*\./) || ["(none)"])[0];
  return `after level 2: ${picker} | then ${next} | stopped: level ${c.level}, building ${c.buildTo ?? "no"}, ${todo}`;
});
step("leveling up later clears it", () => {
  const c = C(); click('[data-act="levelup"]'); click('[data-act="luavg"]'); click('[data-act="luapply"]'); closeOv();
  return `level ${c.level}; not finished: ${todoOf(c).join(", ") || "nothing"}`;
});
step("a level can go to a new class: fighter 1, rogue 1", () => {
  build("2014", "Fighter", "Test Two", 2, ["str", "dex", "con", "wis", "cha", "int"]);
  click('[data-act="lupick"][data-v="new"]'); sel('[data-lu="newCls"]', "Rogue"); click('[data-act="luavg"]'); click('[data-act="luapply"]');
  const c = C(); return `${clsLine(c)}, level ${c.level}, hit dice ${hdText(c)}, building ${c.buildTo ?? "done"}`;
});
step("starting at level 5 brings gold and magic items by the table (Joseph's photo, 2026-11-03)", () => {
  ui.tab = "pcs"; render(); click('[data-act="newbuild"]'); sel('[data-bld="toLevel"]', "5"); sel('[data-bld="cls"]', "Fighter");
  const left = (q("#bldGo").textContent.match(/Not chosen yet: ([^.]*)\./) || [, "(none)"])[1].match(/\d+ \w+ magic items?/g).join(", ");
  typ('[data-bld="hiRoll"]', "4"); const gp = q("#bldHiGp").textContent;
  const unc = q('[data-bld="magic.Uncommon.0"]'), pick = unc.options[1].value, pickName = unc.options[1].textContent; sel('[data-bld="magic.Uncommon.0"]', pick);
  sel('[data-bld="magic.Common.0"]', OTHER); typ('[data-bld="magicT.Common.0"]', "Test Trinket");
  typ('[data-bld="name"]', "Test Five"); click('[data-act="bldmake"]'); closeOv();
  const c = C(), got = c.items.filter(it => it.name === pickName || it.name === "Test Trinket").map(it => `${it.name} (${it.value})`);
  expect(got.length === 2, "both magic items", got);
  return `left before: ${left} | ${gp} | made: ${got.join(", ")}; gp ${c.purse.gp}; level ${c.level}, building to ${c.buildTo}`;
});
step("the spell list after a level-up: only what they can cast, only as many as they have room for, an X to take one off, and tap for what it does", () => {
  BLD = null; build("2024", "Paladin", "Test Paladin", 3, ["str", "cha", "con", "wis", "dex", "int"]);
  click('[data-act="luavg"]'); click('[data-act="luapply"]'); const c = C(), cap = spellCap(c, c.cls);
  const capText = `cantrips ${cap.cantrips}, spells ${cap.hasS} of ${cap.spells}, up to ${ord(cap.top)} level`;
  const hidden = (q("#pkOut .note") || {}).textContent, high = !!q('#pkOut [data-id="spell:aura-of-life"]');
  let added = 0; for (let i = 0; i < 12; i++) { const b = q('#pkOut [data-act="pkspell"]'); if (!b) break; b.click(); added++; }
  const full = `${spellCap(c, c.cls).hasS} of ${cap.spells}, Add buttons left ${document.querySelectorAll('#pkOut [data-act="pkspell"]').length}, says: ${(q("#pkOut p.note b") || {}).textContent}`;
  const off = q('#pkMine [data-act="pkunspell"]'); const offName = c.spells.find(s => s.id === off.dataset.id).name; off.click();
  const after = `${spellCap(c, c.cls).hasS} of ${cap.spells}, Add buttons back ${document.querySelectorAll('#pkOut [data-act="pkspell"]').length > 0}`;
  click('#pkOut [data-act="pkinfo"][data-id="spell:bless"]'); const desc = q(".pk-desc").textContent.replace(/\s+/g, " ").trim().slice(0, 110);
  click('#ov [data-act="bldnext"]'); click('#ov [data-act="bldlater"]');
  return `${capText} | ${hidden}; Aura of Life listed ${high} | added ${added}: ${full} | took off ${offName}: ${after} | Bless: ${desc}…`;
});
step("a 2014 wizard's spell room after a level-up is the spellbook (six, and two a level), not what's prepared", () => {
  BLD = null; ui.tab = "pcs"; render(); click('[data-act="newbuild"]'); click('[data-act="blded"][data-v="2014"]'); sel('[data-bld="toLevel"]', "2"); sel('[data-bld="cls"]', "Wizard"); sel('[data-bld="sp"]', "Human");
  ["int", "dex", "con", "wis", "cha", "str"].forEach((k, i) => sel(`[data-bld="pick.${k}"]`, String(i)));
  const six = [...document.querySelectorAll('[data-act="bldspell"][data-k="spells"]')].slice(0, 6); six.forEach(b => q(`[data-act="bldspell"][data-k="spells"][data-id="${b.dataset.id}"]`).click());
  typ('[data-bld="name"]', "Test Book"); click('[data-act="bldmake"]'); click('[data-act="luavg"]'); click('[data-act="luapply"]');
  const c = C(), cap = spellCap(c, c.cls), adds = document.querySelectorAll('#pkOut [data-act="pkspell"]').length; closeOv();
  return `level ${c.level}: spells ${cap.hasS} of ${cap.spells}, cantrips ${cap.hasC} of ${cap.cantrips}, Add buttons ${adds > 0 ? "there" : "none"}`;
});
