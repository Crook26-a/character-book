// uses: survey-out
// A file from Ordinate Survey (what the survey's steps test "exchange" downloaded), with the DM's changes to Gnick (hurt
// to 20, a new item): Gnick is updated in place and keeps everything only this app has; Ilsa and Wren are added.
const G = () => db.chars.find(c => c.id === "ch_gnick");

step("Gnick before: an effect on him, his journal and people", () => {
  addEffect(G(), PRESETS[0]); save(true);
  const c = G(); __KIT.keep.before = { sessions: c.sessions.length, people: c.people.length, traits: c.traits.length, spells: c.spells.length, attacks: c.attacks.length, items: c.items.length };
  return JSON.stringify(__KIT.keep.before);
});
step("the survey's file, with the DM's changes, comes in", async () => {
  const pack = JSON.parse(JSON.stringify(FIX["survey-out"])), g = pack.db.chars.find(c => c.id === "ch_gnick");
  g.hp = 20; g.items.push({ id: "it_gift", name: "Letter of passage", qty: 1, where: "On me", note: "From the DM" });
  await importFile(new File([JSON.stringify(pack)], "survey.json"));
  expect(db.chars.filter(c => /Gnick/.test(c.name)).length === 1 && G().hp === 20, "Gnick updated, not doubled", G().hp);
  expect(db.chars.some(c => c.name === "Ilsa Brightwater") && db.chars.some(c => c.name === "Wren"), "Ilsa and Wren added");
  return db.chars.map(c => c.short || c.name).join(", ");
});
step("everything only this app has is still there", () => {
  const c = G(), b = __KIT.keep.before;
  expect(c.sessions.length === b.sessions && c.people.length === b.people && c.effects.length === 1, "journal, people, the effect");
  expect(c.spells.length === b.spells && /Flavor: takes the form/.test(c.spells.find(s => s.id === "sp_sw").text), "no spells doubled, his 2014 text kept");
  expect(c.attacks.length === b.attacks && !asWritten(c.attacks[0]), "no Sacred Flame attack added; attacks still worked out from the scores");
  expect(c.traits.length === b.traits && c.traits.find(t => t.name === "Sticky Fingers").rollSkill === "stealth", "features kept, Sticky Fingers' roll too");
  const cart = c.items.find(i => i.id === "it_cart");
  expect(cart.artifact && cart.pics.length === 3 && cart.mods.length === 1 && cart.cartSpells.length === 6 && cart.attuned, "the cart: artifact, pictures, +1, spells, attuned");
  expect(c.items.length === b.items + 1 && c.items.some(i => i.name === "Letter of passage"), "the DM's new item");
  expect(c.rules === "2014" && dcOf(c) === 15 && satkOf(c) === 7, "2014 rules, DC 15, +7", [c.rules, dcOf(c), satkOf(c)]);
  expect(/Updated from Ordinate Survey/.test(c.log[0].text), "logged");
  return `HP ${c.hp}/${hpMaxOf(c)}, ${c.items.length} items`;
});
