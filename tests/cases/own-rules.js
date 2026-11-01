// your own backgrounds and roll tables: a background in the library, built with; a made-up d100 table (in the book's
// "01–02" style, with a heading, a row that runs onto a second line, and a gap); a background applied to Gnick; and
// the Field Book's own, read from this device
const q = s => document.querySelector(s);
const click = s => { const e = q(s); expect(e, "there's a " + s); e.click(); };
const sel = (s, v) => { const e = q(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("change", { bubbles: true })); };
const typ = (s, v) => { const e = q(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); };
const tick = s => { const e = q(s); expect(e, "there's a " + s); e.checked = true; e.dispatchEvent(new Event("change", { bubbles: true })); };

step("a background of your own, in the library", () => {
  ui.tab = "pcs"; render(); click('[data-act="bgadd"]');
  typ('[data-bgf="name"]', "Sailor"); tick('[data-bgm="skills"][data-v="athletics"]'); tick('[data-bgm="skills"][data-v="perception"]');
  for (const k of ["str", "dex", "wis"]) tick(`[data-bgm="abilities"][data-v="${k}"]`);
  typ('[data-bgf="tool"]', "Navigator's tools"); typ('[data-bgf="feat"]', "Alert"); typ('[data-bgf="eqA"]', "Club, Rope, and 10 GP"); typ('[data-bgf="eqB"]', "50 GP");
  click('[data-act="bgdone"]');
  const x = ownBgs()[0]; expect(x && x.name === "Sailor", "Sailor is kept");
  return JSON.stringify(x);
});
step("the builder offers it; a Human Fighter, Sailor", () => {
  click('[data-act="newbuild"]'); const id = "hb:" + ownBgs()[0].id;
  expect([...q('[data-bld="bg"]').options].some(o => o.value === id && /yours/.test(o.textContent)), "Sailor (yours) is in the list");
  sel('[data-bld="cls"]', "Fighter"); sel('[data-bld="bg"]', id); sel('[data-bld="sp"]', "Human");
  sel('[data-bld="plus2"]', "str"); sel('[data-bld="plus1"]', "dex"); [["str", 0], ["dex", 1], ["con", 2], ["wis", 3], ["int", 4], ["cha", 5]].forEach(([k, i]) => sel(`[data-bld="pick.${k}"]`, String(i)));
  click('[data-act="bldset"][data-f="eqB"][data-v="B"]'); typ('[data-bld="name"]', "Test Sailor"); click('[data-act="bldmake"]');
  const c = db.chars.find(x => x.name === "Test Sailor"); expect(c, "made");
  return `${c.bg}; ${ABS.map(([k]) => c.ab[k]).join("/")}; skills ${Object.keys(c.skills).join(", ")}; ${c.purse.gp} gp; traits ${c.traits.filter(t => /feat|Sailor/i.test(t.src)).map(t => t.name).join(", ")}`;
});
step("a made-up d100 table for everyone: what it reads, and a roll", () => {
  ui.tab = "pcs"; render(); click('[data-act="tbladd"][data-w="lib"]');
  typ('[data-tbl="name"]', "Odd luck");
  typ('[data-tbl="text"]', "d100 Effect\n01–02 | A bell rings somewhere.\n03–50 | Nothing happens, but it feels like\nsomething almost did.\n51–98 | You find 2d6 copper pieces.\n00 | A crow follows you for 1d4 days.");
  const note = q("#tblNote").textContent; click('[data-act="tbldone"]');
  rollTable(ownTables()[0]); const shown = q("#ov").textContent.replace(/\s+/g, " ").trim(); closeOv();
  return `${note} | ${shown}`;
});
step("Apply a background to Gnick: the list, then the Sailor's skills and feat", () => {
  db.cur = "ch_gnick"; ui.tab = "play"; ui.open.who = true; render(); click('[data-act="applybg"]');
  sel('[data-abg="key"]', "hb:" + ownBgs()[0].id);
  const offered = [...document.querySelectorAll("#ov [data-abgp]")].map(b => `${b.dataset.abgp}${b.checked ? "+" : "-"}`).join(" ");
  click('[data-act="abgapply"]'); const c = C();
  return `offered ${offered}; now ${c.bg}, athletics ${skillLv(c, "athletics")}, perception ${skillLv(c, "perception")}, Alert ${c.traits.some(t => t.name === "Alert")}`;
});
step("the Field Book's background and table show up here", () => {
  localStorage.setItem("fieldbook", JSON.stringify({ backgrounds: [{ id: "lbg_fb", name: "Dockhand", skills: ["athletics"], featureName: "Harbor Friends", featureText: "Dockworkers help you.", notes: "DM: they're smugglers.", fbEdited: 1 }],
    tables: [{ id: "ltb_fb", name: "Harbor rumors", text: "1 | A ship is late.\n2 | The lighthouse keeper is gone.", fbEdited: 1 }] }));
  ui.tab = "pcs"; render(); const lib = q("#view").textContent;
  ui.tab = "play"; ui.open.tables = true; render(); const play = [...document.querySelectorAll('[data-act="tblroll"]')].length;
  expect(!/smugglers/.test(JSON.stringify(libBackgrounds())), "no DM notes");
  return `library lists Dockhand ${/Dockhand/.test(lib)}, Harbor rumors ${/Harbor rumors/.test(lib)}; Play tab has ${play} tables to roll`;
});
