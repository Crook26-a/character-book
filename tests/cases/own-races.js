// a race of your own (made-up): a subrace of the SRD's gnome, made with the form, built with in the 2014 rules, a
// trait that comes at level 2, given to Gnick with Apply, and moved to the Field Book
const q = s => document.querySelector(s);
const click = s => { const e = q(s); expect(e, "there's a " + s); e.click(); };
const sel = (s, v) => { const e = q(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("change", { bubbles: true })); };
const typ = (s, v) => { const e = q(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); };
const tick = s => { const e = q(s); expect(e, "there's a " + s); e.checked = true; e.dispatchEvent(new Event("change", { bubbles: true })); };

step("a subrace of yours, made with the form", () => {
  ui.tab = "pcs"; render(); click('[data-act="racadd"]');
  typ('[data-rcf="name"]', "Test Glade Gnome"); sel('[data-rcf="of"]', "Gnome"); typ('[data-rcb="dex"]', "1");
  tick('[data-rcm="skills"][data-v="nature"]'); typ('[data-rcf="languages"]', "Sylvan");
  click('[data-act="racfadd"]'); typ('[data-rcff="0.name"]', "Test Leafstep"); typ('[data-rcff="0.text"]', "You move quietly through leaves.");
  sel(`[data-fxadd="race:${raceObj().id}:0"]`, "speed"); typ('[data-fxo][data-fxk="n"]', "5");
  click('[data-act="racfadd"]'); typ('[data-rcff="1.level"]', "2"); typ('[data-rcff="1.name"]', "Test Glade Sense"); typ('[data-rcff="1.text"]', "You sense the glade.");
  click('[data-act="racdone"]');
  const card = [...document.querySelectorAll("#view .card")].find(c => /Test Glade Gnome/.test(c.textContent)); expect(card, "in the library");
  return `${card.textContent.replace(/\s+/g, " ").trim()} | ${JSON.stringify(myRaces()[0])}`;
});
step("built in the 2014 rules: under the gnome, with its increase, skill, speed, and trait", () => {
  click('[data-act="newbuild"]'); click('[data-act="blded"][data-v="2014"]'); sel('[data-bld="sp"]', "Gnome");
  const offered = [...q('[data-bld="sub"]').options].map(o => o.textContent).join(", ");
  sel('[data-bld="sub"]', "hb:" + ownRaces()[0].id); sel('[data-bld="cls"]', "Wizard");
  [["int", 0], ["dex", 1], ["con", 2], ["wis", 3], ["str", 4], ["cha", 5]].forEach(([k, i]) => sel(`[data-bld="pick.${k}"]`, String(i)));
  const note = (q("#ov").textContent.replace(/\s+/g, " ").match(/Test Glade Gnome: [^]*?Later: [^.]*\./) || [""])[0];
  typ('[data-bld="name"]', "Test Glade"); click('[data-act="bldmake"]');
  const c = db.chars.find(x => x.name === "Test Glade"); expect(c, "made");
  return `subraces: ${offered} | ${note} | ${c.species}, INT ${c.ab.int} DEX ${c.ab.dex} CON ${c.ab.con}, speed ${c.speed}, nature ${skillLv(c, "nature")}, traits ${c.traits.filter(t => /Gnome/.test(t.src)).map(t => `${t.name} (${t.src})`).join(", ")}`;
});
step("level 2 brings the race's level-2 trait", () => {
  ui.tab = "play"; render(); click('[data-act="levelup"]');
  const offered = LV.feats.map(f => `${f.name} (${f.src || "class"})`).join(", ");
  click('[data-act="luavg"]'); click('[data-act="luapply"]'); closeOv(); const c = C();
  return `offered: ${offered} | now level ${c.level}; ${c.traits.filter(t => t.name === "Test Glade Sense").map(t => `${t.name} from ${t.src}`).join("")}`;
});
step("Apply a species or race: Gnick, with the gnome's traits and the level-2 trait", () => {
  db.cur = "ch_gnick"; ui.tab = "play"; render(); click('[data-act="applyrace"]'); sel('[data-arc="key"]', "hb:" + ownRaces()[0].id); const had = C().traits.length;
  const list = [...document.querySelectorAll("#ov [data-arcp]")].map(b => `${b.checked ? "[x]" : "[ ]"} ${b.parentElement.textContent.trim().replace(/\s+/g, " ")}`).join(" | ");
  click('[data-act="arcapply"]'); const c = C();
  return `${list} → ${c.species}, speed ${c.speed}, nature ${skillLv(c, "nature")}, added ${c.traits.slice(had).map(t => `${t.name} (${t.src})`).join(", ")}`;
});
step("moved to the Field Book: out of the library, in the Field Book's storage, still offered here", () => {
  ui.tab = "pcs"; render(); const kinds = [...new Set([...document.querySelectorAll('[data-act="tofb"]')].map(b => b.dataset.c))].join(", ");
  click('[data-act="tofb"][data-c="races"]');
  const fb = JSON.parse(localStorage.getItem("fieldbook") || "{}"), card = [...document.querySelectorAll("#view .card")].find(c => /Test Glade Gnome/.test(c.textContent));
  return `"→ Field Book" on: ${kinds} | library ${myRaces().length}; the Field Book's races: ${(fb.races || []).map(x => `${x.name} (stamped ${x.fbEdited > 0})`).join(", ")}; offered: ${ownRaces().map(x => `${x.name}${x.fb ? " (Field Book)" : ""}`).join(", ")}; its card: ${card && card.querySelector('[data-act="racedit"]') ? "editable" : "Field Book only"}`;
});
