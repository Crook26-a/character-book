// The Monk (Joseph, 2026-11-12; his SRD 5.2.1): Martial Arts on the Unarmed Strike and Monk weapons, Unarmored Movement,
// the Monk's uses, the feature-card buttons, Disciplined Survivor on a failed save, Body and Mind.
const mq = s => document.querySelector(s);
const mclick = s => { const e = mq(s); expect(e, "there's a " + s); e.click(); };
const msel = (s, v) => { const e = mq(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("change", { bubbles: true })); };
const mtyp = (s, v) => { const e = mq(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); };
const mset = (c, n) => { c.level = n; if (Array.isArray(c.classes) && c.classes[0]) { c.classes[0].level = n; c.classes[0].sub = "Warrior of the Open Hand"; } c.subcls = "Warrior of the Open Hand"; };
const mtrait = (c, names) => { for (const n of names) if (!c.traits.some(t => t.name === n)) c.traits.push({ name: n, text: "", src: "Monk" }); };
step("a Monk built at 1: an Unarmed Strike line with Martial Arts (d6, Dex); a Quarterstaff (d6) uses Dex; at 2 Speed +10; at 11 both d10", () => {
  closeOv(); ui.tab = "pcs"; render(); BLD = null; mclick('[data-act="newbuild"]'); msel('[data-bld="cls"]', "Monk"); msel('[data-bld="sp"]', "Human");
  mtyp('[data-bld="name"]', "Test Monk"); mclick('[data-act="bldmake"]'); const c = C(); c.ab.str = 10; c.ab.dex = 16; c.ab.wis = 14; ensureOrigins(c);
  const us = c.attacks.find(a => /unarmed strike/i.test(a.name)), qs = { id: "atqs", name: "Quarterstaff", ab: "str", prof: true, dice: "1d6", dtype: "bludgeoning", bonus: 0 }; c.attacks.push(qs);
  const line = a => `${a.name} ${atkOf(c, a) >= 0 ? "+" : ""}${atkOf(c, a)}, ${dmgOfAtk(c, a)}`, at1 = `${line(us)}; ${line(qs)}; Speed ${speedOf(c)} (${c.acNote || "no AC note"})`;
  mset(c, 2); const sp2 = speedOf(c); mset(c, 11); const at11 = `${line(us)}; ${line(qs)}; Speed ${speedOf(c)}`; mset(c, 1); c.attacks = c.attacks.filter(a => a !== qs);
  return `1: ${at1} | 2: Speed ${sp2} | 11: ${at11}`;
});
step("Monk 10, Open Hand: Uncanny Metabolism and Wholeness of Body uses; Patient Defense with a point gives 2d8 temp HP; Uncanny Metabolism refills and heals; the cards' buttons", () => {
  const c = C(); mset(c, 10); mtrait(c, ["Monk's Focus", "Uncanny Metabolism", "Wholeness of Body", "Stunning Strike", "Deflect Attacks"]); ensureOrigins(c);
  if (!res(c, "Focus Points")) c.res.push({ id: "rfp", name: "Focus Points", max: 10, used: 0, rest: "short" }); const fp = res(c, "Focus Points"); fp.max = 10; fp.used = 0;
  const uses = ["Focus Points", "Uncanny Metabolism", "Wholeness of Body"].map(n => `${n} ${(res(c, n) || {}).max}`).join(", ");
  const btns = n => { const h = document.createElement("div"); h.innerHTML = monkButtonsHtml(c, n); return [...h.querySelectorAll("button")].map(b => b.textContent.trim()).join(" / ") || h.textContent.trim().slice(0, 90); };
  const cards = ["Monk's Focus", "Deflect Attacks", "Wholeness of Body"].map(n => `${n}: ${btns(n)}`).join(" || ");
  c.temp = 0; ui.tab = "feats"; render(); const b = mq('[data-act="mkfoc"][data-k="pd1"]'); if (b) b.click(); const pd = `temp ${c.temp > 1 && c.temp <= 16}, Focus left ${resLeft(fp)}`;
  const hm = c.hpMax; c.hpMax = 80; c.hp = 20; fp.used = 5; const u = mq('[data-act="mkum"]'); if (u) u.click(); const um = `hp 20 → 31-38 ${c.hp >= 31 && c.hp <= 38}, Focus left ${resLeft(fp)}, Uncanny Metabolism left ${resLeft(res(c, "Uncanny Metabolism"))}`; c.hpMax = hm; c.hp = hm; ui.tab = "play"; render();
  return `${uses} | ${cards} | Patient Defense: ${pd} | Uncanny Metabolism: ${um}`;
});
step("Monk 14: every save proficient; a failed save offers Disciplined Survivor for a point; Monk 20: Body and Mind's +4 once", () => {
  const c = C(); mset(c, 14); mtrait(c, ["Disciplined Survivor", "Body and Mind"]); ensureOrigins(c); const profs = c.saveProf.slice().sort().join(",");
  rollD20({ label: "Save", ctx: { kind: "save", ab: "int" }, parts: [] }); R.mode = "normal"; R.d = [2, 2]; showRoll(); const has = !!mq('[data-act="dsurv"]'); mclick('[data-act="dsurv"]'); const ds = `Focus left ${resLeft(res(c, "Focus Points"))}, button again ${!!mq('[data-act="dsurv"]')}`; closeOv();
  const dx0 = c.ab.dex, w0 = c.ab.wis; mset(c, 20); ensureOrigins(c); ensureOrigins(c); const bm = `Dex ${dx0} → ${c.ab.dex}, Wis ${w0} → ${c.ab.wis}`; mset(c, 1);
  return `saves ${profs} | button ${has}; ${ds} | ${bm}`;
});
