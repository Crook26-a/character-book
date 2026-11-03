// Blink (Joseph, 2026-11-03), by the 2024 rules like Mirror Image: Gnick casts it (no "are you a target?"); a d6 at the
// end of each turn, 4-6 to the Ethereal Plane until the start of the next; ten turns, then it ends
const q = s => document.querySelector(s);
const box = () => { const p = [...document.querySelectorAll("#view .panel")].find(x => /^Blink/.test(x.textContent.trim())); return p ? p.textContent.replace(/\s+/g, " ").trim() : "no box"; };
const withRoll = (v, f) => { const r = Math.random; Math.random = () => v; try { return f(); } finally { Math.random = r; } };
step("Gnick casts Blink: no question, and it's on", () => {
  const c = C(); ui.tab = "play"; render(); const asked = []; const was = window.confirm; window.confirm = m => { asked.push(m); return true; };
  const slots = c.slots[3].used; cast(c, c.spells.find(s => s.name === "Blink"), 3, "slot"); window.confirm = was; render();
  return `asked: ${asked.length ? asked.join(" / ") : "nothing"} | 3rd-level slots used ${slots} → ${c.slots[3].used} | ${box()} | the toast: ${(document.querySelector("#toast") || {}).textContent || ""}`;
});
step("end of turn: a 5 sends him away; the start of his turn brings him back; a 2 keeps him here", () => {
  withRoll(0.7, () => q('[data-act="blinkroll"]').click()); const away = box(); q('[data-act="blinkback"]').click(); const back = box();
  withRoll(0.2, () => q('[data-act="blinkroll"]').click());
  return `${away} || ${back} || ${box()}`;
});
step("after ten turns it ends", () => {
  const c = C(); for (let i = 0; i < 7; i++) { withRoll(0.2, () => q('[data-act="blinkroll"]').click()); } const last = box();
  withRoll(0.9, () => q('[data-act="blinkroll"]').click());
  return `${last} || then: ${box()} | effects: ${c.effects.map(e => e.name).join(", ") || "none"} | log: ${c.rolls[0].label}`;
});
step("the Blink box shows on the Spells tab too, where it's cast", () => {
  const c = C(); ui.tab = "spells"; render(); cast(c, c.spells.find(s => s.name === "Blink"), 3, "slot"); render();
  const on = [...document.querySelectorAll("#view .panel")].some(p => /^Blink/.test(p.textContent.trim())); c.effects = c.effects.filter(e => !e.blink); ui.tab = "play"; render();
  return `on the Spells tab: ${on}`;
});
