// Mirror Image (Joseph, 2026-11-02), played by the 2024 rules whatever the character was built from ("the dm is 2024
// rules, character creation is whatever rules"): Gnick (built 2014) casts it; a hit by an attack roll rolls a d6 for
// each duplicate; any 3 or higher, a duplicate takes it; the spell ends with the last
const q = s => document.querySelector(s);
const box = () => { const p = [...document.querySelectorAll("#view .panel")].find(x => /^Mirror Image/.test(x.textContent.trim())); return p ? p.textContent.replace(/\s+/g, " ").trim() : "no box"; };
const withRoll = (v, f) => { const r = Math.random; Math.random = () => v; try { return f(); } finally { Math.random = r; } };
step("Gnick (built from the 2014 rules) casts it: three duplicates, and the 2024 rule", () => {
  const c = C(); ui.tab = "play"; render(); cast(c, c.spells.find(s => s.name === "Mirror Image"), 2, "slot"); render();
  return `built ${c.rules} | ${box()}`;
});
step("a hit: d6s of 4 put it on a duplicate; then d6s of 1 let it through", () => {
  withRoll(0.5, () => q('[data-act="mirror"]').click()); const one = box(); withRoll(0.05, () => q('[data-act="mirror"]').click());
  return `${one} || ${box()}`;
});
step("the last two go, and the spell ends", () => {
  const c = C(); withRoll(0.5, () => q('[data-act="mirror"]').click()); const two = box(); withRoll(0.5, () => q('[data-act="mirror"]').click());
  return `${two} || ${box()} | effects now: ${c.effects.map(e => e.name).join(", ") || "none"} | the toast: ${(document.querySelector("#toast") || {}).textContent || ""}`;
});
