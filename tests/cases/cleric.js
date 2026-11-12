// The Cleric (Joseph, 2026-11-12): Channel Divinity's buttons (Divine Spark, Turn Undead, Preserve Life), Divine Order,
// Blessed Strikes, Divine Intervention, and the Life Domain (spells, Disciple of Life, Supreme Healing).
const kq = s => document.querySelector(s);
const kclick = s => { const e = kq(s); expect(e, "there's a " + s); e.click(); };
const ksel = (s, v) => { const e = kq(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("change", { bubbles: true })); };
const ktyp = (s, v) => { const e = kq(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); };
const kup = () => { closeOv(); ui.tab = "play"; render(); kclick('[data-act="levelup"]'); kclick('[data-act="luavg"]'); };
step("a Cleric built and taken to 2: Channel Divinity's card has Divine Spark and Turn Undead; Spark heals, a use is spent", () => {
  closeOv(); ui.tab = "pcs"; render(); BLD = null; kclick('[data-act="newbuild"]'); ksel('[data-bld="cls"]', "Cleric"); ksel('[data-bld="sp"]', "Human");
  ktyp('[data-bld="name"]', "Test Cleric"); kclick('[data-act="bldmake"]'); const c = C(); kup(); kclick('[data-act="luapply"]'); closeOv(); ui.tab = "play"; render();
  const btns = [...document.querySelectorAll('[data-act="cdspark"],[data-act="cdturn"],[data-act="cdpres"]')].map(b => b.textContent.trim()), r = res(c, "Channel Divinity");
  const before = r ? `${resLeft(r)}/${r.max} (${r.rest})` : "no uses"; kclick('[data-act="cdspark"][data-k="heal"]'); const roll = `${R.label}: ${R.expr} = ${R.total}, heal ${R.heal}`; closeOv();
  return `level ${c.level}: [${btns.join(" | ")}] | uses ${before} → ${resLeft(r)} | ${roll} | to the survey: rules "${toSurvey(c).rules}"`;
});
step("Blessed Strikes at 7 (Wisdom 16): Potent Spellcasting adds +3 to Sacred Flame; Divine Strike's button on a weapon's damage adds 1d8 once", () => {
  const c = C(), lv0 = c.level, set = n => { c.level = n; if (Array.isArray(c.classes) && c.classes[0]) c.classes[0].level = n; }; set(7); c.ab.wis = 16;
  const sf = SRD_SPELLS.find(s => s.name === "Sacred Flame"), sp = spellFromData(sf); c.strikes = "potent"; const pot = sp.roll ? spellExpr(c, sp, 0) : "no roll"; c.strikes = "divine";
  const a = c.attacks.find(x => !asWritten(x)) || c.attacks[0]; rollDamage(a.name + " damage", dmgOfAtk(c, a), { dtype: a.dtype, weapon: true }); showRoll();
  const t0 = R.total, btn = !!kq('[data-act="dstrike"]'); kclick('[data-act="dstrike"][data-k="radiant"]'); const again = !!kq('[data-act="dstrike"]'); const t1 = R.total, ex = R.extra.map(x => x.name).join(", "); closeOv(); delete c.strikes; set(lv0);
  return `Sacred Flame with Potent Spellcasting: ${pot} | ${a.name}: ${t0} → ${t1} (button ${btn}, again ${again}, ${ex})`;
});
step("Divine Intervention at 10: its use and button; at 20 Wish takes it away for 2d4 Long Rests", () => {
  const c = C(), lv0 = c.level, set = n => { c.level = n; if (Array.isArray(c.classes) && c.classes[0]) c.classes[0].level = n; }; set(10);
  if (!c.traits.some(t => t.name === "Divine Intervention")) c.traits.push({ name: "Divine Intervention", text: "", src: "Cleric 10" }); ensureOrigins(c); closeOv(); ui.tab = "play"; render();
  const r = res(c, "Divine Intervention"), b = !!kq('[data-act="diuse"]'); kclick('[data-act="diuse"]'); const used = `${resLeft(r)} left`; longRest(c);
  set(20); render(); kclick('[data-act="diuse"][data-k="wish"]'); const w = c.diWait; longRest(c); const after = `${c.diWait || 0} more, ${resLeft(res(c, "Divine Intervention")) ? "ready" : "still gone"}`; delete c.diWait; set(lv0);
  return `use ${r ? `${r.max} (${r.rest})` : "none"}, button ${b} → ${used} | Wish: ${w} Long Rests | after one: ${after}`;
});
step("Life Domain at 5: its spells always prepared; Cure Wounds at 1st level has +3 (Disciple of Life); at 6 the Blessed Healer button; at 17 every die at its highest", () => {
  const c = C(), lv0 = c.level, set = n => { c.level = n; if (Array.isArray(c.classes) && c.classes[0]) { c.classes[0].level = n; c.classes[0].sub = "Life Domain"; } c.subcls = "Life Domain"; };
  set(5); ensureOrigins(c); const life = c.spells.filter(s => s.tag === "D").map(s => s.name).join(", "); const cw = c.spells.find(s => s.name === "Cure Wounds");
  cast(c, cw, 1); const five = `${R.expr} (life ${R.life})`; closeOv(); set(6); cast(c, cw, 1); showRoll(); const bh = !!kq('[data-act="healself"][data-n="3"]'); closeOv();
  set(17); cast(c, cw, 1); const sup = `${R.expr} = ${R.total}`; closeOv(); set(lv0); c.subcls = ""; if (Array.isArray(c.classes) && c.classes[0]) c.classes[0].sub = "";
  return `always prepared: ${life} | level 5 Cure Wounds: ${five} | level 6 Blessed Healer button ${bh} | level 17: ${sup}`;
});
step("Divine Order on its card: Thaumaturge (a cantrip more, Wisdom on Religion); Protector (Martial weapons, Heavy armor in the proficiencies)", () => {
  const c = C(); ui.tab = "play"; render(); const cap0 = spellCap(c, "Cleric").cantrips, rel0 = skillOf(c, "religion");
  ksel('[data-clpick="order"]', "thaumaturge"); const thaum = `order ${c.order}: cantrips ${cap0} → ${spellCap(c, "Cleric").cantrips}, Religion ${rel0} → ${skillOf(c, "religion")}`;
  ksel('[data-clpick="order"]', "protector"); const prot = `order ${c.order}: cantrips ${spellCap(c, "Cleric").cantrips}, profs has it ${/Martial weapons, Heavy armor \(Protector\)/.test(c.story.profs)}, to the survey ${toSurvey(c).order}`;
  return `${thaum} || ${prot}`;
});
