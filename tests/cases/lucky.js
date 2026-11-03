// Lucky (Joseph, 2026-11-03): the 2024 feat with a flat 3 Luck points: Advantage on your own d20 test (cancels
// Disadvantage; nothing on Advantage), Disadvantage on an attack roll against you; the builder gives the use; a
// halfling's Luck rerolls a 1
const q = s => document.querySelector(s);
const click = s => { const e = q(s); expect(e, "there's a " + s); e.click(); };
const sel = (s, v) => { const e = q(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("change", { bubbles: true })); };
const typ = (s, v) => { const e = q(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); };
const withRoll = (v, f) => { const r = Math.random; Math.random = () => v; try { return f(); } finally { Math.random = r; } };
const luckBtn = () => { const b = q('#ov [data-act="luck"]'); return b ? `${b.textContent}${b.disabled ? " (off)" : ""}` : "no Luck button"; };
step("Gnick: a Luck point on an attack gives Advantage; on a Disadvantage roll it cancels; on Advantage it's off", () => {
  const c = C(), L = res(c, "Lucky"); L.used = 0; ui.tab = "play"; render();
  rollD20({ label: "Test attack", ctx: { kind: "atk" }, parts: [] }); R.mode = "normal"; showRoll(); const before = luckBtn(); click('#ov [data-act="luck"]');
  const one = `${R.mode}, ${(q("#ov .rr-h + .dice") || q("#ov .dice")).querySelectorAll(".die").length} dice shown, ${q("#ov").textContent.match(/A Luck point:[^.]*/)[0]}, ${resLeft(L)} left`;
  closeOv(); rollD20({ label: "Test save", ctx: { kind: "save", ab: "dex" }, parts: [] }); R.mode = "dis"; showRoll(); click('#ov [data-act="luck"]'); const two = `${R.mode}, ${q("#ov").textContent.match(/A Luck point:[^.]*/)[0]}`;
  closeOv(); rollD20({ label: "Test check", ctx: { kind: "check", ab: "wis" }, parts: [] }); R.mode = "adv"; showRoll(); const three = luckBtn(); closeOv();
  click('[data-act="luckvs"]'); const vs = `${(q("#toast") || {}).textContent}; ${resLeft(L)} left`; L.used = 0; save(); render();
  return `before: ${before} | ${one} || ${two} || on Advantage: ${three} || against an attack: ${vs}`;
});
step("a character built with Lucky (yours) gets 3 Luck points; a halfling's Luck rerolls a 1", () => {
  ownFeats; const lib = libOwn(); lib.feats = lib.feats || []; if (!lib.feats.some(f => f.name === "Lucky")) lib.feats.push({ id: "ft_testlucky", name: "Lucky", type: "Origin", prereq: "", text: "You have Luck points. Spend one for Advantage on a D20 Test, or to give an attack roll against you Disadvantage.", fx: [] });
  closeOv(); ui.tab = "pcs"; render(); BLD = null; click('[data-act="newbuild"]'); sel('[data-bld="cls"]', "Rogue"); sel('[data-bld="sp"]', "Human"); sel('[data-bld="vfeat"]', "Lucky");
  typ('[data-bld="name"]', "Test Lucky"); click('[data-act="bldmake"]'); const c = C(), L = res(c, "Lucky");
  const made = L ? `Lucky use: ${L.max}, back on a ${L.rest} rest` : "no Lucky use";
  closeOv(); ui.tab = "pcs"; render(); BLD = null; click('[data-act="newbuild"]'); sel('[data-bld="cls"]', "Fighter"); sel('[data-bld="sp"]', "Halfling"); typ('[data-bld="name"]', "Test Halfling"); click('[data-act="bldmake"]');
  const h = C(); rollD20({ label: "Test swing", ctx: { kind: "atk" }, parts: [] }); R.mode = "normal"; R.d = [1, 9]; showRoll(); const btn = !!q('#ov [data-act="hluck"]');
  withRoll(0.6, () => click('#ov [data-act="hluck"]')); const after = `${R.d[0]}: ${q("#ov").textContent.match(/Halfling Luck: the 1 rerolled[^.]*/)[0]}, button again ${!!q('#ov [data-act="hluck"]')}, Luck points ${res(h, "Lucky") ? "given (wrong)" : "none"}`;
  closeOv(); lib.feats = lib.feats.filter(f => f.id !== "ft_testlucky"); save();
  return `${made} || halfling rolls a 1: reroll button ${btn}; rerolled ${after}`;
});
