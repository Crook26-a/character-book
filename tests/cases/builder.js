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
step("level 1 spells, class features, and subclasses can be read before choosing", () => {
  closeOv(); ui.tab = "pcs"; render(); BLD = null; click('[data-act="newbuild"]'); sel('[data-bld="cls"]', "Wizard");
  const feats = [...document.querySelectorAll("#ov details summary")].map(s => s.textContent).filter(t => /1st-level features/.test(t)).join(", ");
  const info = q('[data-act="bldinfo"]'), name = info.previousElementSibling.textContent; info.click();
  const desc = q("#ov .pk-desc").textContent.replace(/\s+/g, " ").trim().slice(0, 70);
  q(`[data-act="bldinfo"][data-id="${info.dataset.id}"]`).click(); const shut = !q("#ov .pk-desc");
  click('[data-act="blded"][data-v="2014"]'); sel('[data-bld="cls"]', "Cleric"); const sub = [...document.querySelectorAll("#ov details summary")].map(s => s.textContent).filter(t => /subclass/.test(t)).join(", ");
  closeOv(); BLD = null;
  return `${feats} | ? on ${name}: ${desc}… | tapped again: ${shut ? "closed" : "open"} | 2014 Cleric: ${sub}`;
});
step("Magic Initiate's spells are chosen (the background's list, and Versatile's must differ); Versatile can't repeat the background's feat", () => {
  closeOv(); ui.tab = "pcs"; render(); BLD = null; click('[data-act="newbuild"]'); sel('[data-bld="cls"]', "Fighter"); sel('[data-bld="bg"]', "Criminal"); sel('[data-bld="sp"]', "Human");
  const crim = [...q('[data-bld="vfeat"]').options].map(o => o.textContent).filter(t => t !== "—").join(", ");
  sel('[data-bld="bg"]', "Acolyte"); const aco = [...q('[data-bld="vfeat"]').options].map(o => o.textContent).filter(t => t !== "—").join(", ");
  const left0 = /Magic Initiate/.test(q("#bldGo").textContent);
  click('[data-act="bldmiset"][data-k="bg"][data-f="ab"][data-v="wis"]');
  const cl = [...document.querySelectorAll('[data-act="bldmi"][data-k="bg"][data-f="c"]')]; cl[0].click(); q(`[data-act="bldmi"][data-k="bg"][data-f="c"][data-id="${cl[1].dataset.id}"]`).click();
  const third = q(`[data-act="bldmi"][data-k="bg"][data-f="c"][data-id="${cl[2].dataset.id}"]`).disabled;
  q('[data-act="bldmi"][data-k="bg"][data-f="s"]').click();
  sel('[data-bld="vfeat"]', "Magic Initiate"); const lists = [...document.querySelectorAll('[data-act="bldmiset"][data-k="v"][data-f="list"]')].map(b => b.textContent).join(", ");
  sel('[data-bld="vfeat"]', "Alert"); const left1 = /Magic Initiate/.test(q("#bldGo").textContent);
  typ('[data-bld="name"]', "Test Initiate"); click('[data-act="bldmake"]'); const c = C(), mi = c.spells.filter(s => s.feat);
  return `Criminal, Versatile offers: ${crim} | Acolyte: ${aco} | asks for the spells: ${left0} | a third cantrip ${third ? "blocked" : "allowed"} | Versatile's lists: ${lists} | after choosing: still asks ${left1} | made: ${mi.map(s => `${s.name} (${s.tag}, ${s.ab})`).join(", ")}; free cast ${c.res.filter(r => /Magic Initiate/.test(r.name)).map(r => r.name).join(", ")}; DC with Wis ${dcOf(c, mi[0])}`;
});
step("level-up feats: only those they qualify for and don't have; the +1s go to two different abilities", () => {
  closeOv(); ui.tab = "pcs"; render(); BLD = null; click('[data-act="newbuild"]'); sel('[data-bld="cls"]', "Fighter"); sel('[data-bld="bg"]', "Soldier"); sel('[data-bld="sp"]', "Human");
  ["con", "wis", "str", "dex", "cha", "int"].forEach((k, i) => sel(`[data-bld="pick.${k}"]`, String(i))); typ('[data-bld="name"]', "Test Feats"); click('[data-act="bldmake"]');
  const c = C(); c.level = 3; c.classes = [{ cls: "Fighter", sub: "", level: 3, die: 10 }]; c.ab.str = 12; c.ab.dex = 12; save(); startLevelUp(c); click('[data-act="luavg"]');
  const bOpts = () => [...q('[data-lu="b"]').options].map(o => o.value).filter(Boolean);
  sel('[data-lu="a"]', "con"); const notCon = !bOpts().includes("con");
  click('[data-act="luasi"][data-k="feat"]'); const list = [...document.querySelectorAll("#rfeats option")].map(o => o.value).join(", ");
  typ('[data-lu="feat"]', "Grappler"); const chk = q("#luFeatChk").textContent.replace(/\s+/g, " ").trim(), go = q("#luGo .note").textContent;
  click('[data-lu="featAllow"]'); const go2 = (q("#luGo .note") || {}).textContent || "(no reason: can go)";
  closeOv(); LV = null;
  return `+1s: the second box leaves out the first ${notCon} | feats offered (Str and Dex 12): ${list} | Grappler typed: ${chk} | ${go} | DM allows: ${go2}`;
});
