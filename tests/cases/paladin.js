// The Paladin (Joseph, 2026-11-12; his SRD 5.2.1): Lay on Hands' pool and Restoring Touch, the free casts, the
// always-prepared spells, Blessed Warrior, Aura of Protection on a save, Radiant Strikes and Divine Smite on a weapon's
// damage, the Channel Divinity buttons, Holy Nimbus.
const pq = s => document.querySelector(s);
const pclick = s => { const e = pq(s); expect(e, "there's a " + s); e.click(); };
const psel = (s, v) => { const e = pq(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("change", { bubbles: true })); };
const ptyp = (s, v) => { const e = pq(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); };
const pset = (c, n) => { c.level = n; if (Array.isArray(c.classes) && c.classes[0]) { c.classes[0].level = n; c.classes[0].sub = "Oath of Devotion"; } c.subcls = "Oath of Devotion"; };
const ptrait = (c, names) => { for (const n of names) if (!c.traits.some(t => t.name === n)) c.traits.push({ name: n, text: "", src: "Paladin" }); };
const pask = answers => { const q = answers.slice(); window.prompt = () => q.length ? q.shift() : ""; window.confirm = () => q.length ? q.shift() : true; };
step("a Paladin 11 (Devotion): Lay on Hands' pool, the free Divine Smite and Find Steed, the always-prepared spells; Blessed Warrior adds two Cleric cantrips", () => {
  closeOv(); ui.tab = "pcs"; render(); BLD = null; pclick('[data-act="newbuild"]'); psel('[data-bld="cls"]', "Paladin"); psel('[data-bld="sp"]', "Human");
  ptyp('[data-bld="name"]', "Test Paladin"); pclick('[data-act="bldmake"]'); const c = C(); c.ab.cha = 16; pset(c, 11);
  ptrait(c, ["Lay On Hands", "Paladin's Smite", "Faithful Steed", "Channel Divinity", "Aura of Protection", "Radiant Strikes", "Sacred Weapon", "Abjure Foes", "Fighting Style"]); ensureOrigins(c);
  const uses = ["Lay on Hands", "Divine Smite, free (Paladin's Smite)", "Find Steed, free (Faithful Steed)"].map(n => `${n} ${(res(c, n) || {}).max}`).join(", ");
  const always = c.spells.filter(s => s.tag === "D").map(s => s.name).join(", ");
  ui.tab = "feats"; render(); const opt = [...document.querySelectorAll('[data-clpick="style1"] option')].map(o => o.value).filter(Boolean).join("/"); psel('[data-clpick="style1"]', "blessed");
  const bw = C().spells.filter(s => s.tag === "BW").map(s => s.name).join(", "); ui.tab = "play"; render();
  return `${uses} || always prepared: ${always} || styles ${opt} | Blessed Warrior: ${bw}`;
});
step("Aura of Protection on a Wisdom save; a Longsword's damage gets Radiant Strikes, then Divine Smite with a 2nd-level slot on an Undead (4d8)", () => {
  const c = C(); c.slots = { 1: { max: 4, used: 0 }, 2: { max: 3, used: 0 }, 3: { max: 3, used: 0 } }; rollSave("wis"); const aura = R.parts.map(p => `${p.name} ${p.v}`).join(", "); closeOv();
  rollDamage("Longsword", "1d8+3", { weapon: true, dtype: "slashing" }); const rs = R.extra.map(x => x.name).join(", "); pask(["2", true]); pclick('[data-act="palsmite"]');
  const sm = `${R.extra.map(x => x.name).join(", ")}, 2nd-level slots left ${c.slots[2].max - c.slots[2].used}, button again ${!!pq('[data-act="palsmite"]')}`; closeOv();
  rollDamage("Longbow", "1d8+1", { weapon: true, dtype: "piercing" }); const bow = R.extra.map(x => x.name).join(", ") || "nothing extra"; closeOv();
  return `save: ${aura} || ${rs} | ${sm} || a Longbow: ${bow}`;
});
step("the cards' buttons: Lay on Hands heals 10 from the pool, Restoring Touch (14) ends 2 for 10; Channel Divinity's Sacred Weapon puts +3 on a weapon attack; Holy Nimbus (20)", () => {
  const c = C(); pset(c, 14); ptrait(c, ["Restoring Touch", "Holy Nimbus"]); ensureOrigins(c); const r = res(c, "Lay on Hands"); r.used = 0; ui.tab = "feats"; render();
  pask(["10"]); pclick('[data-act="palloh"][data-k="heal"]'); pask(["2"]); pclick('[data-act="palloh"][data-k="restore"]'); const loh = `pool ${resLeft(r)} of ${r.max}`;
  const a = { id: "atls", name: "Longsword", ab: "str", prof: true, dice: "1d8", dtype: "slashing", bonus: 0 }; c.attacks.push(a); const h0 = atkOf(c, a);
  if (!res(c, "Channel Divinity")) c.res.push({ id: "rcd", name: "Channel Divinity", max: 3, used: 0, rest: "one" }); render(); pclick('[data-act="palcd"][data-k="sacred"]'); const sw = `to hit ${h0} → ${atkOf(c, a)}, Channel Divinity left ${resLeft(res(c, "Channel Divinity"))}`;
  pset(c, 20); ensureOrigins(c); render(); const hn = !!pq('[data-act="palnim"][data-k="use"]'); c.attacks = c.attacks.filter(x => x !== a); c.effects = c.effects.filter(e => e.name !== "Sacred Weapon"); pset(c, 1); ui.tab = "play"; render();
  return `${loh} || Sacred Weapon: ${sw} || Holy Nimbus button ${hn}, use ${(res(c, "Holy Nimbus") || {}).max}`;
});
