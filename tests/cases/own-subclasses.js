// your own subclasses and feats, and what they change: a Wild Magic sorcerer made with the form (a roll after casting
// that rolls a table and brings a use back), built with; a feat that raises a score and gives a skill; a subclass given
// to Gnick from a ticked list; and a third caster whose fighter gets spell slots at 3rd level. Made-up text throughout.
const q = s => document.querySelector(s);
const click = s => { const e = q(s); expect(e, "there's a " + s); e.click(); };
const sel = (s, v) => { const e = q(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("change", { bubbles: true })); };
const typ = (s, v) => { const e = q(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); };

step("a Wild Magic subclass, made with the form", () => {
  libOwn().tables = [{ id: "tb_surge", name: "Test surges", text: "1 | Sparks fly from your fingers.\n2 | You float for a moment." }];
  ui.tab = "pcs"; render(); click('[data-act="subadd"]'); typ('[data-sbf="name"]', "Test Wild Magic"); sel('[data-sbf="of"]', "Sorcerer");
  click('[data-act="sffadd"]'); typ('[data-sff="0.name"]', "Surge"); typ('[data-sff="0.text"]', "After a spell, magic may surge.");
  sel('[data-fxadd^="sub:"]', "aftercast"); sel('[data-fxk="table"]', "Test surges"); typ('[data-fxk="restores"]', "Tides of Chance");
  click('[data-act="sffadd"]'); typ('[data-sff="1.name"]', "Tides of Chance"); typ('[data-sff="1.text"]', "Advantage once.");
  sel('[data-fxadd$=":1"]', "res"); typ('[data-fxo$=":1"][data-fxk="name"]', "Tides of Chance");
  click('[data-act="subdone"]'); const s = ownSubs()[0];
  return JSON.stringify(s.features.map(f => ({ lv: f.level, name: f.name, fx: f.fx.map(fxSummary) })));
});
step("a 2014 sorcerer built with it: the features and the use", () => {
  click('[data-act="newbuild"]'); click('[data-act="blded"][data-v="2014"]');
  sel('[data-bld="cls"]', "Sorcerer"); sel('[data-bld="subcls"]', "hb:" + ownSubs()[0].id); q('[data-bld="name"]').value = "Test Sorc"; q('[data-bld="name"]').dispatchEvent(new Event("input", { bubbles: true }));
  click('[data-act="bldmake"]'); const c = db.chars.find(x => x.name === "Test Sorc"); expect(c, "made");
  return `${clsLine(c)} (${c.subcls}); traits ${c.traits.filter(t => t.fx).map(t => `${t.name}: ${t.fx.map(fxSummary).join(", ")}`).join(" | ")}; uses ${c.res.map(r => `${r.name} ${r.max}`).join(", ")}`;
});
step("casting a 1st-level spell offers the roll; a surge rolls the table and brings the use back", () => {
  const c = C(); const r = res(c, "Tides of Chance"); r.used = 1; c.slots = { 1: { max: 2, used: 0 } };
  const sp = { id: "sp_t", name: "Test Bolt", lvl: 1, text: "A bolt.", time: "1 action", range: "", dur: "" }; c.spells.push(sp);
  cast(c, sp, 1); const offered = (q("#surgeBox") || {}).textContent || "no offer";
  SURGE.hits = Array.from({ length: 20 }, (_, i) => i + 1).join(",");   // every number surges, so the roll can't miss
  click('[data-act="surgeroll"]'); const shown = q("#ov").textContent.replace(/\s+/g, " ").trim().slice(0, 90); closeOv();
  return `${offered.replace(/\s+/g, " ").trim().slice(0, 110)} | ${shown} | Tides used ${res(c, "Tides of Chance").used}; a cantrip offers nothing: ${surgeFor(c, { lvl: 0 }, "") === null}`;
});
step("a feat of your own through Versatile: a score and a skill", () => {
  libOwn().feats = [{ id: "ft_t", name: "Test Knack", type: "Origin", text: "You're handy.", fx: [{ t: "ab", ab: "str", n: 1 }, { t: "skill", k: "athletics", lv: 1 }] }];
  ui.tab = "pcs"; render(); click('[data-act="newbuild"]'); sel('[data-bld="sp"]', "Human"); sel('[data-bld="vfeat"]', "Test Knack");
  [["str", 0], ["dex", 1], ["con", 2], ["int", 3], ["wis", 4], ["cha", 5]].forEach(([k, i]) => sel(`[data-bld="pick.${k}"]`, String(i)));
  q('[data-bld="name"]').value = "Test Human"; q('[data-bld="name"]').dispatchEvent(new Event("input", { bubbles: true })); click('[data-act="bldmake"]');
  const c = db.chars.find(x => x.name === "Test Human"); return `Str ${c.ab.str} (15 + 1), athletics ${skillLv(c, "athletics")}, trait ${c.traits.find(t => t.name === "Test Knack").fx.map(fxSummary).join(", ")}`;
});
step("Gnick's Trickery Domain, entered once: Apply a subclass, from a ticked list", () => {
  libOwn().subclasses.push({ id: "sb_trick", name: "Trickery Domain (Tymora)", of: "Cleric", features: [
    { level: 1, name: "Blessing of the Trickster", text: "Made-up text.", fx: [] }, { level: 1, name: "Test Domain Spells", text: "Always prepared.", fx: [{ t: "spells", names: "Charm Person, Disguise Self" }] },
    { level: 2, name: "Test Duplicity", text: "An illusion.", fx: [{ t: "res", name: "Test Duplicity", n: 1, by: "", rest: "short" }] }, { level: 6, name: "Test Cloak", text: "Later.", fx: [] }] });
  db.cur = "ch_gnick"; ui.tab = "play"; ui.open.feat = true; render(); click('[data-act="applysub"]'); sel('[data-asb="name"]', "Trickery Domain (Tymora)");
  const list = [...document.querySelectorAll("#ov [data-asbp]")].map(b => `${b.parentNode.textContent.replace(/\s+/g, " ").trim()}${b.checked ? " [x]" : " [ ]"}`).join(" | ");
  click('[data-act="asbapply"]'); const c = C();
  return `${list} || now: ${c.subcls}; Test Duplicity ${!!res(c, "Test Duplicity")}; spells ${c.spells.filter(s => s.tag === "D").map(s => s.name).join(", ")}`;
});
step("a third caster: a Fighter 2 picks it at 3rd level and gets slots", () => {
  libOwn().subclasses.push({ id: "sb_knight", name: "Test Knight", of: "Fighter", caster: "third", castAb: "int", list: "Wizard", features: [{ level: 3, name: "Test Bond", text: "Your weapon comes back.", fx: [] }] });
  const f = blankChar("Test Fighter3"); Object.assign(f, { id: "ch_f3", cls: "Fighter", level: 2, rules: "2024", hd: { die: 10, max: 2, used: 0 } }); db.chars.push(f); db.cur = f.id;
  ui.tab = "play"; render(); click('[data-act="levelup"]'); sel('[data-lu="subcls"]', "Test Knight");
  const auto = (q("#ov").textContent.match(/By itself:[^.]*\./) || [""])[0].replace(/\s+/g, " "); click('[data-act="luavg"]'); click('[data-act="luapply"]'); closeOv();
  const c = db.chars.find(x => x.id === "ch_f3"); return `${auto} | ${clsLine(c)} (${c.subcls}), slots ${JSON.stringify(c.slots)}, casts with ${c.castAb}, features ${c.traits.filter(t => t.src === "Fighter 3").map(t => t.name).join(", ")}`;
});
