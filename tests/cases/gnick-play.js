// Gnick at the table: his numbers, rolling, concentration, spells, the cart and the Pious Wager, rests
const G = () => db.chars.find(c => c.id === "ch_gnick");
const q = s => document.querySelector(s);
const click = s => { const e = q(s); expect(e, "there's a " + s); e.click(); };

step("Gnick's numbers at 5th level", () => {
  const c = G();
  expect(c.level === 5 && c.rules === "2014", "level 5, 2014 rules", [c.level, c.rules]);
  expect(acOf(c) === 17 && dcOf(c) === 15 && satkOf(c) === 7, "AC 17, DC 15, spell attack +7 (the cart's +1)", [acOf(c), dcOf(c), satkOf(c)]);
  expect(saveOf(c, "wis") === 6 && skillOf(c, "persuasion") === 5 && passiveOf(c, "perception") === 13, "Wis save +6, Persuasion +5, passive Perception 13");
  return `AC ${acOf(c)}, DC ${dcOf(c)}, +${satkOf(c)}, HP ${c.hp}/${hpMaxOf(c)}`;
});
step("a Stealth check, then a Luck point", () => {
  ui.tab = "play"; render(); click('[data-act="sk"][data-k="stealth"]');
  expect(R && R.type === "d20", "a d20 roll on screen"); click('[data-act="luck"]');
  expect(res(G(), "Lucky").used === 1 && R.luck.length === 1, "a Luck point spent, a third die"); closeOv();
  return "Luck left " + resLeft(res(G(), "Lucky"));
});
step("Bless: concentration and the d4 on an attack", () => {
  ui.tab = "spells"; render(); click('[data-act="cast"][data-id="sp_bless"]');
  const c = G(); expect(c.conc === "Bless" && c.effects.some(e => e.name === "Bless" && e.conc), "concentrating on Bless, with its effect", c.conc);
  ui.tab = "play"; render(); click('[data-act="atk"][data-i="1"]');
  expect(R.dice.length === 1, "the sling's roll has the Bless d4"); expect(G().items.find(i => i.id === "it_rocks").qty === 19, "a rock used");
  click('[data-act="ammoback"]'); closeOv();
  return "slots 1st left " + (c.slots[1].max - c.slots[1].used);
});
step("24 damage while concentrating asks for a Con save (DC 12)", async () => {
  q("#hpN").value = "24"; click('[data-act="dmg"]'); await wait(120);
  expect(G().hp === 15, "hit points 39 - 24", G().hp); expect(R && R.conc && R.dc === 12, "a concentration save, DC 12", R && R.dc);
  closeOv(); return "HP 15";
});
step("Healing Word at 2nd level, Sacred Flame, a cart spell, Aid on himself", () => {
  ui.tab = "spells"; render();
  q('[data-castlvl="sp_hw"]').value = "2"; click('[data-act="cast"][data-id="sp_hw"]');
  expect(R.heal && /^2d4/.test(R.base.text), "Healing Word rolls 2d4+3", R.base.text); click('[data-act="healself"]');
  click('[data-act="castq"][data-id="sp_flame"]'); expect(R.save && R.save.ab === "dex" && /^2d8/.test(R.base.text), "Sacred Flame: a Dex save, 2d8"); closeOv();
  click('[data-act="cartcast"][data-n="Detect Magic"]'); expect(res(G(), "Cart points").used === 1, "a cart point spent");
  const hp = G().hp; click('[data-act="cast"][data-id="sp_aid"]'); expect(hpMaxOf(G()) === 44 && G().hp === hp + 5, "Aid: max 44, +5 now", [hpMaxOf(G()), G().hp]);
  return `HP ${G().hp}/${hpMaxOf(G())}`;
});
step("a Pious Wager jackpot, then a loss into divine debt", () => {
  const c = G(); ui.tab = "items"; render(); const gp = c.purse.gp;
  ui.wager = { roll: "22", dc: "12" }; render(); click('#wagerOut [data-act="wagerapply"]');
  expect(G().purse.gp === gp + 70, "Jackpot: +70 gp", G().purse.gp);
  G().purse = { cp: 0, sp: 0, ep: 0, gp: 5, pp: 0 }; ui.wager = { roll: "13", dc: "10" }; render(); click('#wagerOut [data-act="wagerapply"]');
  expect(G().debtCp === 15000 && exhOf(G()) === 1, "lost 20 with 5: 150 gp of debt, exhaustion 1", G().debtCp);
  return "debt " + gpText(G().debtCp);
});
step("a long rest: everything back, Aid and concentration gone", () => {
  ui.tab = "play"; render(); click('[data-act="long"]'); const c = G();
  expect(c.hp === hpMaxOf(c) && hpMaxOf(c) === 39, "full HP, Aid gone", [c.hp, hpMaxOf(c)]);
  expect(c.slots[1].used === 0 && res(c, "Lucky").used === 0 && !c.conc, "slots, Luck and concentration reset");
  return `HP ${c.hp}/${hpMaxOf(c)}, exhaustion ${exhOf(c)} (debt stays)`;
});
