// Mirror Image (Joseph, 2026-11-02): Gnick casts it (2014 rules: a d20 when he's targeted, 6+/8+/11+, then the
// duplicate's AC 10 + Dex); the 2024 rule (a d6 a duplicate when an attack roll hits) for a 2024 character; the spell
// ending with the last duplicate
const q = s => document.querySelector(s);
const box = () => { const p = [...document.querySelectorAll("#view .panel")].find(x => /^Mirror Image/.test(x.textContent.trim())); return p ? p.textContent.replace(/\s+/g, " ").trim() : "no box"; };
const withRoll = (v, f) => { const r = Math.random; Math.random = () => v; try { return f(); } finally { Math.random = r; } };
step("Gnick casts it: three duplicates, and his rule (2014)", () => {
  const c = C(); ui.tab = "play"; render(); cast(c, c.spells.find(s => s.name === "Mirror Image"), 2, "slot"); render();
  return `${box()} | Dex ${sg(mod(c, "dex"))}`;
});
step("an attack targets him: a d20 11 sends it at a duplicate; it hits that, so one is gone", () => {
  withRoll(0.5, () => q('[data-act="mirror"]').click()); const asked = box(); q('[data-act="mirhit"]').click();
  return `${asked} || then: ${box()}`;
});
step("a d20 3 (needs 8 with two left): the attack targets him; then a miss on a duplicate leaves it", () => {
  withRoll(0.1, () => q('[data-act="mirror"]').click()); const him = box();
  withRoll(0.9, () => q('[data-act="mirror"]').click()); q('[data-act="mirmiss"]').click();
  return `${him} || ${box()}`;
});
step("a 2024 character: a d6 for each duplicate when a hit lands; down to none, the spell ends", () => {
  const c = C(); c.rules = "2024"; render(); const L = [];
  for (let k = 0; k < 3 && c.effects.some(e => e.dupes > 0); k++) { withRoll(0.5, () => q('[data-act="mirror"]').click()); L.push(box()); }
  c.rules = "2014"; render();
  return `${L.join(" || ")} || effects now: ${c.effects.map(e => e.name).join(", ") || "none"} | the toast: ${(document.querySelector("#toast") || {}).textContent || ""}`;
});
