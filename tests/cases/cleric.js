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
