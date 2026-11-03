// the SRD 5.2 builder: a Fighter and a Wizard made from the PCs tab, then the Wizard to level 2 (recorded, not predicted)
const q = s => document.querySelector(s);
const click = s => { const e = q(s); expect(e, "there's a " + s); e.click(); };
const sel = (s, v) => { const e = q(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("change", { bubbles: true })); };
const typ = (s, v) => { const e = q(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); };
const array = order => order.forEach((k, i) => sel(`[data-bld="pick.${k}"]`, String(i)));
const sheet = c => `${c.name}: ${c.species} ${c.cls} ${c.level}, ${c.bg}; AC ${c.ac} (${c.acNote}), HP ${c.hpMax}; ${ABS.map(([k]) => c.ab[k]).join("/")}; `
  + `skills ${Object.keys(c.skills).join(", ")}; ${c.gp ?? c.purse.gp} gp; ${c.items.map(i => (i.qty > 1 ? i.qty + " " : "") + i.name).join(", ")}`;

step("the rules load, and the PCs tab offers the builder", () => {
  expect(HAS_RULES, "rules.js loaded");
  ui.tab = "pcs"; render(); click('[data-act="newbuild"]');
  expect(ovKind === "builder", "the builder opens");
  return `${RULES.classes.length} classes, ${RULES.species.length} species, ${RULES.backgrounds.length} backgrounds, ${RULES.feats.length} feats`;
});
step("a Human Fighter, Soldier, standard array", () => {
  sel('[data-bld="cls"]', "Fighter"); sel('[data-bld="bg"]', "Soldier"); sel('[data-bld="sp"]', "Human");
  sel('[data-bld="plus2"]', "str"); sel('[data-bld="plus1"]', "con");
  array(["str", "con", "dex", "wis", "int", "cha"]);
  for (let i = 0; i < 2; i++) click('[data-act="bldskill"]:not(.on):not([disabled])');
  sel('[data-bld="extra"]', "perception"); sel('[data-bld="vfeat"]', "Alert");
  typ('[data-bld="name"]', "Test Fighter");
  click('[data-act="bldmake"]');
  const c = db.chars.find(x => x.name === "Test Fighter"); expect(c, "the Fighter is made");
  return sheet(c);
});
step("an Elf Wizard, Sage, with spells", () => {
  closeOv(); ui.tab = "pcs"; render(); click('[data-act="newbuild"]');
  sel('[data-bld="cls"]', "Wizard"); sel('[data-bld="bg"]', "Sage"); sel('[data-bld="sp"]', "Elf");
  sel('[data-bld="plus2"]', "int"); sel('[data-bld="plus1"]', "con");
  array(["int", "con", "dex", "wis", "str", "cha"]);
  for (let i = 0; i < 2; i++) click('[data-act="bldskill"]:not(.on):not([disabled])');
  for (const key of ["cantrips", "spells"]) for (let i = 0; i < 6; i++) { const b = q(`[data-act="bldspell"][data-k="${key}"]:not(.on):not([disabled])`); if (b) b.click(); }
  typ('[data-bld="name"]', "Test Wizard");
  click('[data-act="bldmake"]');
  const c = db.chars.find(x => x.name === "Test Wizard"); expect(c, "the Wizard is made");
  return sheet(c) + `; slots ${JSON.stringify(c.slots)}; spells ${c.spells.map(s => s.name).join(", ")}`;
});
step("freestyle: a typed class and species, typed scores, and own kit; not finished", () => {
  closeOv(); ui.tab = "pcs"; render(); click('[data-act="newbuild"]');
  sel('[data-bld="cls"]', OTHER); typ('[data-bld="clsT"]', "Blood Hunter"); sel('[data-bld="hd"]', "10");
  sel('[data-bld="sp"]', OTHER); typ('[data-bld="spT"]', "Tabaxi"); typ('[data-bld="speed"]', "35");
  click('[data-act="bldset"][data-v="type"]'); ["str", "dex", "con"].forEach((k, i) => typ(`[data-bld="typed.${k}"]`, String(16 - i)));
  typ('[data-bld="eqT"]', "Longsword, Shield, 2 Daggers, and 10 GP"); typ('[data-bld="name"]', "Test Freestyle");
  const note = q("#bldGo").textContent.replace(/\s+/g, " ").trim();
  click('[data-act="bldmake"]');
  const c = db.chars.find(x => x.name === "Test Freestyle"); expect(c, "made anyway");
  return sheet(c) + `; speed ${c.speed}; todo ${todoOf(c).join(" | ")}; the button said: ${note}`;
});
step("nothing chosen at all still saves, marked; It's done clears it", () => {
  closeOv(); ui.tab = "pcs"; render(); click('[data-act="newbuild"]'); click('[data-act="bldmake"]');
  const c = C(); const marked = !!q('[data-act="tododone"]'), tag = /not finished/.test((ui.tab = "pcs", render(), document.body.textContent));
  ui.tab = "play"; render(); click('[data-act="tododone"]');
  expect(!todoOf(C()).length, "cleared");
  return `${c.name}: ${c.cls || "no class"}, HP ${c.hpMax}, AC ${c.ac}; marked on Play ${marked}, tagged on PCs ${tag}`;
});
step("the Wizard to level 2: features from the class table", () => {
  closeOv(); const c = db.chars.find(x => x.name === "Test Wizard"); db.cur = c.id; ui.tab = "play"; render();
  click('[data-act="levelup"]');
  const lookups = [...document.querySelectorAll("#ov .lookup")].length;
  click('[data-act="luavg"]'); click('[data-act="luapply"]'); closeOv();
  const d = db.chars.find(x => x.name === "Test Wizard");
  return `level ${d.level}, HP ${d.hpMax}, ${lookups} lookups; slots ${JSON.stringify(d.slots)}; features ${d.traits.filter(t => t.src === "Wizard 2").map(t => t.name).join(", ")}`;
});
step("2014: a Hill Dwarf Life Domain Cleric, Acolyte, with spells", () => {
  ui.tab = "pcs"; render(); click('[data-act="newbuild"]'); click('[data-act="blded"][data-v="2014"]');
  sel('[data-bld="sp"]', "Dwarf"); sel('[data-bld="sub"]', "Hill Dwarf"); sel('[data-bld="cls"]', "Cleric"); sel('[data-bld="subcls"]', "Life Domain"); sel('[data-bld="bg"]', "Acolyte");
  array(["wis", "con", "str", "dex", "int", "cha"]);
  for (let i = 0; i < 2; i++) click('[data-act="bldskill"]:not(.on):not([disabled])');
  click('[data-act="bldkit"][data-i="1"][data-v="c"]');
  for (const key of ["cantrips", "spells"]) for (let i = 0; i < 6; i++) { const b = q(`[data-act="bldspell"][data-k="${key}"]:not(.on):not([disabled])`); if (b) b.click(); }
  typ('[data-bld="name"]', "Test Dwarf");
  const left = q("#bldGo").textContent.replace(/\s+/g, " ").trim().slice(0, 140);
  click('[data-act="bldmake"]');
  const c = db.chars.find(x => x.name === "Test Dwarf"); expect(c, "the Dwarf is made");
  return sheet(c) + `; rules ${c.rules}, ${c.subcls}, speed ${c.speed}; slots ${JSON.stringify(c.slots)}; ${c.spells.length} spells; traits ${c.traits.map(t => t.name).join(", ")}; left: ${left}`;
});
step("2014: the Dwarf to level 2, from the SRD 5.1", () => {
  closeOv(); ui.tab = "play"; render(); click('[data-act="levelup"]');
  const note = [...document.querySelectorAll("#ov .note")].map(p => p.textContent).find(t => /From the SRD/.test(t)) || "";
  click('[data-act="luavg"]'); click('[data-act="luapply"]'); closeOv();
  const d = db.chars.find(x => x.name === "Test Dwarf");
  return `level ${d.level}, HP ${d.hpMax}; features ${d.traits.filter(t => t.src === "Cleric 2").map(t => t.name).join(", ")}; ${note.replace(/\s+/g, " ").slice(0, 160)}`;
});
step("mix: a 2014 Tiefling Fighter with the 2024 Soldier background, increases from the race", () => {
  ui.tab = "pcs"; render(); click('[data-act="newbuild"]'); click('[data-act="blded"][data-v="mix"]');
  sel('[data-bld="cls"]', "Fighter@2014"); sel('[data-bld="bg"]', "Soldier@2024"); sel('[data-bld="sp"]', "Tiefling@2014");
  const offered = q("#ov").textContent.includes("Increases from");
  click('[data-act="bldset"][data-f="asiFrom"][data-v="race"]');
  array(["str", "con", "cha", "dex", "wis", "int"]);
  typ('[data-bld="name"]', "Test Mix Fighter");
  const left = q("#bldGo").textContent.replace(/\s+/g, " ").trim().slice(0, 120);
  click('[data-act="bldmake"]');
  const c = db.chars.find(x => x.name === "Test Mix Fighter"); expect(c, "made");
  return sheet(c) + `; rules ${c.rules}, mixed ${!!c.mixed}; asked where increases come from ${offered}; left: ${left}`;
});
step("mix: a 2024 Wizard, 2014 High Elf, 2014 Acolyte; offered both editions' subclasses and feats", () => {
  closeOv(); ui.tab = "pcs"; render(); click('[data-act="newbuild"]'); click('[data-act="blded"][data-v="mix"]');
  sel('[data-bld="cls"]', "Wizard@2024"); sel('[data-bld="bg"]', "Acolyte@2014"); sel('[data-bld="sp"]', "Elf@2014"); sel('[data-bld="sub"]', "High Elf@2014");
  array(["int", "dex", "con", "wis", "cha", "str"]);
  typ('[data-bld="name"]', "Test Mix Wizard"); click('[data-act="bldmake"]');
  const c = db.chars.find(x => x.name === "Test Mix Wizard"); expect(c, "made");
  return sheet(c) + `; rules ${c.rules}; subclasses ${subOffers(c).join(" / ")}; feats incl. Grappler ${featsFor(c).some(f => f.name === "Grappler")}; who: ${whoHtml(c).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").match(/Rules [^A-Z]*\d{4}[^A-Z]*/)}`;
});
step("step 4 says the class's most important ability", () => {
  closeOv(); ui.tab = "pcs"; render(); BLD = null; click('[data-act="newbuild"]'); const none = q("#bldKey") ? "shown" : "not shown";
  const say = () => q("#bldKey").textContent;
  const out = ["Fighter", "Monk", "Wizard"].map(n => { sel('[data-bld="cls"]', n); return say(); });
  click('[data-act="blded"][data-v="2014"]'); sel('[data-bld="cls"]', "Paladin"); out.push("2014: " + say());
  closeOv(); BLD = null;
  return `no class yet: ${none} | ${out.join(" | ")}`;
});
