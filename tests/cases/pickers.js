// picking from the SRD: spells by class and level, weapons, items as you type, the sheet's dropdowns, saying what it doesn't have
const G = () => db.chars.find(c => c.id === "ch_gnick");
const q = s => document.querySelector(s);
const click = s => { const e = typeof s === "string" ? q(s) : s; expect(e, "there's a " + s); e.click(); };
const typ = (s, v) => { const e = q(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); };
const chg = (s, v) => { const e = q(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("change", { bubbles: true })); };

step("the SRD is there", () => { expect(HAS_SRD && SRD_SPELLS.length === 339, "339 spells", SRD_SPELLS.length); return `${SRD_SPELLS.length} spells, ${SRD_WEAPONS.length} weapons`; });
step("Spirit Guardians from the cleric list", () => {
  ui.tab = "spells"; render(); click('[data-act="addspell"]'); typ("#pkQ", "spirit guard"); click('#pkOut [data-act="pkspell"]'); closeOv();
  const s = G().spells.find(x => x.name === "Spirit Guardians"); expect(s && s.roll.kind === "save" && s.roll.save === "wis" && s.roll.half, "a Wis save, half", s && s.roll);
  return `${s.roll.dice} ${s.roll.type}`;
});
step("Fireball isn't a cleric spell; with the box off it is there", () => {
  click('[data-act="addspell"]'); typ("#pkQ", "fireball");
  expect(/No spells match/.test(q("#pkOut").textContent) && [...document.querySelectorAll("#ov .lookup")].some(p => /every spell/.test(p.textContent)), "nothing, and it says what it has");
  click("#pkCls"); expect(/Fireball/.test(q("#pkOut").textContent), "Fireball with the box off"); closeOv();
});
step("weapons: Longbow and a magic greatsword", () => {
  ui.tab = "play"; render(); click('#view [data-act="addatk"]'); typ("#pkQ", "Longbow"); click([...document.querySelectorAll('#pkOut [data-act="pkatk"]')].find(b => /^Longbow/.test(b.textContent)));
  const a = G().attacks.at(-1); expect(a.ab === "dex" && a.dice === "1d8" && /150\/600/.test(a.range), "Longbow: Dex, 1d8, 150/600", a);
  click('#view [data-act="addatk"]'); typ("#pkQ", "Flame Tongue Greatsword"); click('#pkOut [data-act="pkatk"]');
  expect(G().attacks.at(-1).dice === "2d6", "Flame Tongue uses the Greatsword's 2d6");
  return `${G().attacks.length} attacks`;
});
step("items as you type: two potions that heal, a dagger onto the attacks", () => {
  ui.tab = "items"; render(); typ("#newItem", "2 potion of heal"); click([...document.querySelectorAll('#itemSug [data-act="pkitem"]')].find(b => /^2 × Potion of Healing/.test(b.textContent)));
  const p = G().items.at(-1); expect(p.qty === 2 && p.use.heal === "2d4+2", "2 potions, 2d4+2", p);
  const n = G().attacks.length; typ("#newItem", "dagger"); click([...document.querySelectorAll('#itemSug [data-act="pkitem"]')].find(b => /^Dagger/.test(b.textContent)));
  expect(G().attacks.length === n + 1 && G().attacks.at(-1).ab === "best", "the dagger is an attack too, finesse");
  typ("#newItem", "Bag of Beans of Wonder"); expect(/doesn't have/.test(q("#itemSug").textContent), "an item it doesn't know: it says so");
});
step("the sheet's dropdowns keep what's there and take Other…", () => {
  ui.tab = "play"; ui.editMode = true; render();
  expect(q('select[data-f="species"]').value === "Forest gnome", "Forest gnome kept");
  __KIT.answers.push("Rock gnome"); chg('select[data-f="species"]', "__other"); expect(G().species === "Rock gnome", "Other… typed", G().species);
  ui.editMode = false; render(); return G().species;
});
