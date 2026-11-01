// a file for Ordinate Survey: Gnick and Ilsa (a made-up paladin, so no player's data goes anywhere). The survey's
// steps test "exchange" brings in what this downloads (out\to-survey\downloads\download-1.json).
const q = s => document.querySelector(s);

step("Ilsa Brightwater, a 5th-level paladin", () => {
  const ch = blankChar("Ilsa Brightwater");
  Object.assign(ch, { id: "ch_test_ilsa", player: "Test", species: "Human", cls: "Paladin", level: 5, rules: "2024", ab: { str: 16, dex: 10, con: 14, int: 8, wis: 12, cha: 16 },
    saveProf: ["wis", "cha"], skills: { athletics: 1, persuasion: 1 }, ac: 18, hpMax: 44, hp: 30, hd: { die: 10, max: 5, used: 1 }, castAb: "cha",
    slots: { 1: { max: 4, used: 1 }, 2: { max: 2, used: 0 } }, res: [{ id: "rs_loh", name: "Lay on Hands", max: 25, used: 5, rest: "long" }],
    purse: { cp: 0, sp: 4, ep: 0, gp: 31, pp: 0 } });
  ch.attacks.push(attackFromData(SRD_WEAPONS.find(w => w.name === "Longsword")));
  ch.spells.push(spellFromData(SRD_SPELLS.find(s => s.name === "Bless")), spellFromData(SRD_SPELLS.find(s => s.name === "Cure Wounds")));
  ch.items.push(itemFromData(SRD_LOOT.find(x => x.name === "Potion of Healing"), 2), { id: "it_ilsa_ring", name: "Ring of the Test Order", qty: 1, where: "On me", note: "", attune: true, attuned: true });
  db.chars.push(ch); save(true);
  return `${ch.name}: AC ${acOf(ch)}, DC ${dcOf(ch)}, +${atkOf(ch, ch.attacks[0])} longsword`;
});
step("Save a backup: the file carries both, shaped for the survey", async () => {
  ui.tab = "pcs"; render(); q('[data-act="export"]').click(); await wait(200);
  const f = __KIT.downloads.at(-1); expect(f && f.blob, "a file was saved"); const o = JSON.parse(await f.blob.text());
  expect(o.survey && o.survey.length === 2, "a survey copy of each", o.survey && o.survey.length);
  const g = o.survey.find(x => x.cbId === "ch_gnick"), i = o.survey.find(x => x.cbId === "ch_test_ilsa");
  expect(g.ac === "17" && g.dc === "15" && g.satk === "+7" && /^Wis \+6, Cha \+5 \(proficient\)/.test(g.saves), "Gnick's numbers", [g.ac, g.dc, g.satk, g.saves]);
  expect(g.attacks.some(a => a.name === "Sacred Flame" && a.hit === "DEX 15"), "Sacred Flame as a save line");
  expect(i.hp === 30 && i.hpMax === "44" && i.attacks[0].hit === "+6" && i.attacks[0].dmg === "1d8+3", "Ilsa's numbers", [i.hp, i.attacks[0]]);
  return `${o.survey.map(x => x.name).join(" and ")}: ${f.name.replace(/\d{4}-\d\d-\d\d/, "<date>")}`;
});
