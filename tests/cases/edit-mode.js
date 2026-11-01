// Edit (top right): every tab as fields; another character's fields; effects; attacks between scores and sheet numbers
const G = () => db.chars.find(c => c.id === "ch_gnick");
const q = s => document.querySelector(s), qa = s => document.querySelectorAll(s);
const click = s => { const e = q(s); expect(e, "there's a " + s); e.click(); };
const chg = (s, v) => { const e = q(s); expect(e, "there's a " + s); if (e.type === "checkbox") e.checked = v; else e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); e.dispatchEvent(new Event("change", { bubbles: true })); };

step("Edit turns the Play tab into fields", () => {
  ui.tab = "play"; render(); click("#editBtn");
  expect(EM() && q("#editBtn").textContent === "Done", "edit mode, the button says Done");
  chg('[data-f="hp"]', "20"); chg('[data-f="slots.2.used"]', "2"); chg('[data-f="conc"]', "Bless");
  const c = G(); expect(c.hp === 20 && c.slots[2].used === 2 && c.conc === "Bless", "hit points, slots spent, concentration", [c.hp, c.slots[2].used, c.conc]);
});
step("every spell, item, session and person opens as fields", () => {
  const c = G();
  click('[data-tab="spells"]'); expect(qa('#view [data-f^="spells."][data-f$=".text"]').length === c.spells.length, "every spell");
  click('[data-tab="items"]'); expect(!!q('.panel.artifact [data-f$=".artifact.text"]') && !!q('[data-f="log.0.text"]'), "the cart's form, the log's lines");
  click('[data-tab="journal"]'); expect(qa('#view [data-f^="sessions."][data-f$=".text"]').length === c.sessions.length, "every session");
  click('[data-tab="people"]'); expect(qa('#view [data-f^="people."][data-f$=".text"]').length === c.people.length, "every person");
});
step("a new place to keep things (Other…)", () => {
  click('[data-tab="items"]'); const jx = G().items.findIndex(i => i.id === "it_jade");
  __KIT.answers.push("In the attic"); chg(`select[data-f="items.${jx}.where"]`, "__other");
  click("#editBtn"); click('[data-tab="items"]'); expect(/In the attic/.test(q("#view").textContent), "the attic is a place now");
});
step("an effect changed in place", () => {
  ui.tab = "play"; render(); chg("#effPick", "0"); click('[data-act="effadd"]'); const id = G().effects[0].id;
  click(`[data-act="effedit"][data-id="${id}"]`); q("#ceBonus").value = "1d6"; q("#ceLong").checked = true; click(`[data-act="effcustom"][data-id="${id}"]`);
  const e = G().effects[0]; expect(G().effects.length === 1 && e.bonus === "1d6" && e.until === "long", "Bless: 1d6, ends on a long rest", e);
});
step("an attack to the sheet's numbers, a saving throw, and back", () => {
  ui.editMode = true; ui.tab = "play"; render();
  click('[data-act="atkwritten"][data-i="0"]'); let a = G().attacks[0]; expect(a.hit === 3 && a.dmgx === "1d6", "Quarterstaff as written: +3, 1d6", [a.hit, a.dmgx]);
  chg('[data-act="atkhow"][data-i="0"]', "save"); a = G().attacks[0]; expect(!!a.save && !rollsToHit(a), "the target saves");
  chg('[data-act="atkhow"][data-i="0"]', "hit"); click('[data-act="atkcalc"][data-i="0"]'); a = G().attacks[0];
  expect(!asWritten(a) && atkOf(G(), a) === 3, "worked out from the scores again"); ui.editMode = false; render();
});
step("Sticky Fingers is a feature roll: Stealth and a d100", () => {
  ui.tab = "play"; render(); const b = [...qa("#view .card .btn")].find(x => /Stealth \+ d100/.test(x.textContent)); expect(b, "the button");
  b.click(); expect(/Sticky Fingers: Stealth/.test(R.label) && /^1d100: \d+$/.test(R.hint), "Stealth and a d100", R.hint); const h = R.hint; closeOv(); return h;
});
