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
