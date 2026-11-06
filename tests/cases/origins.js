// The SRD's origins (Joseph, 2026-11-06): a Goliath gets Giant Ancestry's uses (and Large Form at level 5), its giant
// picked on the Giant Ancestry card; an Orc gets Adrenaline Rush (Short Rest) and Relentless Endurance; Alert adds the
// Proficiency Bonus to Initiative; the survey gets the giant and the features by name.
const oq = s => document.querySelector(s);
const oclick = s => { const e = oq(s); expect(e, "there's a " + s); e.click(); };
const osel = (s, v) => { const e = oq(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("change", { bubbles: true })); };
const otyp = (s, v) => { const e = oq(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); };
const oUses = c => c.res.filter(r => r.note === "species").map(r => `${r.name} ${r.max} (${r.rest})`).join(", ") || "none";
step("a Goliath Fighter built with the Criminal background: Giant Ancestry 2 a Long Rest, no Large Form yet; Alert in Initiative", () => {
  closeOv(); ui.tab = "pcs"; render(); BLD = null; oclick('[data-act="newbuild"]'); osel('[data-bld="cls"]', "Fighter"); osel('[data-bld="sp"]', "Goliath");
  if (oq('[data-bld="bg"]')) osel('[data-bld="bg"]', "Criminal"); otyp('[data-bld="name"]', "Test Goliath"); oclick('[data-act="bldmake"]'); const c = C();
  return `${c.species} | uses: ${oUses(c)} | giant "${c.giant || ""}" | Alert ${c.traits.some(t => t.name === "Alert")}: Initiative ${initOf(c)} (Dex ${mod(c, "dex")} + Alert ${alertInit(c)})`;
});
step("the Giant Ancestry card has the pick; picking Fire's Burn keeps it; level 5 brings Large Form and 3 uses; the survey gets both", () => {
  const c = C(); ui.tab = "play"; render(); const html = playHtml(c); const has = /data-f="giant"/.test(html);
  const s = oq('[data-f="giant"]'); if (s) osel('[data-f="giant"]', "fire"); else c.giant = "fire";
  c.level = 5; ensureOrigins(c); const out = toSurvey(c);
  return `pick on the card ${has} (shown ${!!s}) | giant ${c.giant} | uses: ${oUses(c)} | to the survey: giant ${out.giant}, feats "${out.feats}"`;
});
step("an Orc: Adrenaline Rush and Relentless Endurance; page errors", () => {
  closeOv(); ui.tab = "pcs"; render(); BLD = null; oclick('[data-act="newbuild"]'); osel('[data-bld="cls"]', "Fighter"); osel('[data-bld="sp"]', "Orc");
  otyp('[data-bld="name"]', "Test Orc"); oclick('[data-act="bldmake"]'); const c = C();
  return `${c.species} | uses: ${oUses(c)} | page errors ${(window.__KIT && __KIT.errors ? __KIT.errors.length : "?")}`;
});
