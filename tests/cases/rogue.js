// The Rogue (Joseph, 2026-11-13; his SRD 5.2.1): the Sneak Attack button with Cunning Strike, Reliable Talent on a proficient
// skill, Slippery Mind, Stroke of Luck, and Use Magic Device's four attunements.
const oq = s => document.querySelector(s);
const oclick = s => { const e = oq(s); expect(e, "there's a " + s); e.click(); };
const osel = (s, v) => { const e = oq(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("change", { bubbles: true })); };
const otyp = (s, v) => { const e = oq(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); };
const oset = (c, n) => { c.level = n; if (Array.isArray(c.classes) && c.classes[0]) { c.classes[0].level = n; c.classes[0].sub = "Thief"; } c.subcls = "Thief"; };
const otrait = (c, names) => { for (const n of names) if (!c.traits.some(t => t.name === n)) c.traits.push({ name: n, text: "", src: "Rogue" }); };
const oask = answers => { const q = answers.slice(); window.prompt = () => q.length ? q.shift() : ""; window.confirm = () => q.length ? q.shift() : true; };
step("a Rogue 11 (Thief): a Shortsword's damage has the Sneak Attack button (6d6); Trip and Poison trade 2d6 for their effects; a Longsword's damage has no button", () => {
  closeOv(); ui.tab = "pcs"; render(); BLD = null; oclick('[data-act="newbuild"]'); osel('[data-bld="cls"]', "Rogue"); osel('[data-bld="sp"]', "Human");
  otyp('[data-bld="name"]', "Test Rogue"); oclick('[data-act="bldmake"]'); const c = C(); oset(c, 11); otrait(c, ["Sneak Attack", "Cunning Strike", "Reliable Talent"]); ensureOrigins(c);
  rollDamage("Shortsword", "1d6+4", { weapon: true, dtype: "piercing" }); const btn = (oq('[data-act="rosneak"]') || {}).textContent; oask(["trip, poison"]); oclick('[data-act="rosneak"]');
  const got = `${R.extra.map(x => x.name).join(", ")}, again ${!!oq('[data-act="rosneak"]')}`; closeOv();
  rollDamage("Longsword", "1d8+2", { weapon: true, dtype: "slashing" }); const ls = !!oq('[data-act="rosneak"]'); closeOv();
  return `${btn} → ${got} | on a Longsword: ${ls}`;
});
step("Reliable Talent: a Stealth check (proficient) with a 3 counts as 10, Athletics (not proficient) doesn't; 15: Slippery Mind's saves; 20: Stroke of Luck on a roll; 13: four attunements", () => {
  const c = C(); c.skills.stealth = 1; delete c.skills.athletics; rollCheck("dex", "stealth"); R.mode = "normal"; R.d = [3, 3]; showRoll(); const st = `Stealth ${d20Total(R)} (${(oq("#ov .note") || {}).textContent || ""})`; closeOv();
  rollCheck("str", "athletics"); R.mode = "normal"; R.d = [3, 3]; showRoll(); const at = `Athletics ${d20Total(R)}`; closeOv();
  oset(c, 15); otrait(c, ["Slippery Mind", "Stroke of Luck", "Use Magic Device"]); ensureOrigins(c); const sv = c.saveProf.slice().sort().join(",");
  oset(c, 20); ensureOrigins(c); rollSave("wis"); R.mode = "normal"; R.d = [4, 4]; showRoll(); oclick('[data-act="roluck"]'); const sl = `d20 ${usedD(R)}, Stroke of Luck left ${resLeft(res(c, "Stroke of Luck"))}`; closeOv();
  const am = attuneMax(c); oset(c, 1);
  return `${st} | ${at} || saves ${sv} || ${sl} || attunements ${am}`;
});
