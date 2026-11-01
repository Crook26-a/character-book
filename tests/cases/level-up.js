// the guided level-up on Gnick (2014 cleric): 5 → 6 → 7 → 8, and what it says it doesn't have
const G = () => db.chars.find(c => c.id === "ch_gnick");
const q = s => document.querySelector(s);
const click = s => { const e = q(s); expect(e, "there's a " + s); e.click(); };
const sel = (s, v) => { const e = q(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("change", { bubbles: true })); };
const typ = (s, v) => { const e = q(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); };
const up = () => { ui.tab = "play"; render(); click('[data-act="levelup"]'); };
const notes = () => [...document.querySelectorAll("#ov .lookup")].map(p => p.textContent);

step("5 → 6: what it does by itself, and what it says it doesn't have", () => {
  up(); const t = q("#ov").textContent;
  expect(/1st 4 · 2nd 3 · 3rd 3/.test(t) && /prepare 9 spells/.test(t), "slots 4/3/3 and 9 prepared");
  expect(q('[data-act="luapply"]').disabled, "waits for hit points");
  expect(notes().some(n => /class tables/.test(n) && /2014 Player's Handbook/.test(n)), "says it doesn't have the class tables", notes());
  return notes().length + " lookups";
});
step("take the average, add a feature, reach 6", () => {
  click('[data-act="luavg"]'); click('[data-act="lures"][data-id="rs_cd"][data-d="1"]');
  click('[data-act="lufeat"]'); typ('[data-lu="feats.0.name"]', "Channel Divinity: 2 uses"); click('[data-act="luapply"]');
  const c = G(); expect(c.level === 6 && c.hpMax === 45 && c.slots[3].max === 3 && res(c, "Channel Divinity").max === 2 && res(c, "Cart points").max === 6, "level 6, 45 HP, 3 third-level slots, CD 2, cart 6", [c.level, c.hpMax]);
  expect(ovKind === "pick:spell", "the spell list opens"); closeOv();
  return `HP ${c.hpMax}`;
});
step("6 → 7: 4th-level spells, a typed die", () => {
  up(); expect(/can now cast 4th-level spells/.test(q("#ov").textContent), "says 4th-level spells");
  typ('[data-lu="hp"]', "8"); click('[data-act="luapply"]'); closeOv();
  const c = G(); expect(c.level === 7 && c.slots[4].max === 1 && c.hpMax === 54, "level 7, a 4th slot, +9 HP", [c.hpMax]);
  return `HP ${c.hpMax}`;
});
step("7 → 8: an ability score improvement, not the same score twice", () => {
  up(); click('[data-act="luavg"]'); sel('[data-lu="a"]', "wis"); sel('[data-lu="b"]', "wis");
  expect(q('[data-act="luapply"]').disabled, "the same score twice isn't allowed");
  sel('[data-lu="b"]', "cha"); click('[data-act="luapply"]'); closeOv();
  const c = G(); expect(c.ab.wis === 17 && c.ab.cha === 16, "Wis 17, Cha 16", c.ab);
  return `level ${c.level}, Wis ${c.ab.wis}, Cha ${c.ab.cha}`;
});
step("tables: a 2014 paladin has no slots at 1, a 2024 one has 2", () => {
  const p = { cls: "Paladin", rules: "2014" }; expect(JSON.stringify(slotsAt(p, 1)) === "{}" && slotsAt(p, 2)[1] === 2, "2014");
  p.rules = "2024"; expect(slotsAt(p, 1)[1] === 2, "2024");
  const w = { cls: "Warlock" }; expect(JSON.stringify(slotsAt(w, 11)) === '{"5":3}', "warlock 11: three 5th-level pact slots");
});
