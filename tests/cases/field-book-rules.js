// a class, a subclass, and a feat written in the Field Book (made-up) show up here, without their notes, offered where
// yours are, and changed only there
const q = s => document.querySelector(s);
step("the Field Book's class, subclass, and feat, in the library and the lists", () => {
  localStorage.setItem("fieldbook", JSON.stringify({
    classes: [{ id: "lcl_fb", name: "Test Warden", hd: "10", primary: "Wisdom", saves: ["wis", "con"], skillsN: "2", skillsFrom: ["survival", "nature"], caster: "half", castAb: "wis", listFrom: "Ranger", subAt: "3", asi: "4, 8, 12, 16, 19",
      cols: [{ name: "Wards", vals: ["2", "2", "3"], use: true, rest: "short" }], features: [{ level: 1, name: "Warding Step", text: "You step aside.", fx: [{ t: "speed", n: 5 }] }], notes: "DM: secretly cursed.", fbEdited: 1 }],
    subclasses: [{ id: "lsb_fb", name: "Test Path", of: "Fighter", features: [{ level: 3, name: "Test Surge", text: "A burst.", fx: [] }], fbEdited: 1 }],
    feats: [{ id: "lft_fb", name: "Test Knack", type: "Origin", text: "Handy.", fx: [{ t: "skill", k: "athletics", lv: 1 }], fbEdited: 1 }] }));
  ui.tab = "pcs"; render(); const lib = q("#view").textContent.replace(/\s+/g, " ");
  const tags = [...document.querySelectorAll("#view .card")].filter(c => /Test (Warden|Path|Knack)/.test(c.textContent)).map(c => `${c.querySelector(".nm").firstChild.textContent.trim()}: ${c.querySelector('[data-act$="edit"]') ? "editable" : "Field Book only"}`).join(", ");
  expect(!/cursed/.test(JSON.stringify(ownClasses())), "no DM notes");
  return `${tags} | offered: classes ${allClassNames().includes("Test Warden")}, Fighter subclasses ${subOffers({ ...C(), cls: "Fighter", mixed: false }, "Fighter").join(", ")}, origin feats ${bgFeatOpts().filter(o => o.type === "Origin").map(o => o.name).join(", ")}`;
});
step("built with the Field Book's class: its feature's change and its use", () => {
  q('[data-act="newbuild"]').click(); const s = q('[data-bld="cls"]'); s.value = "hb:lcl_fb"; s.dispatchEvent(new Event("change", { bubbles: true }));
  const n = q('[data-bld="name"]'); n.value = "Test Ward"; n.dispatchEvent(new Event("input", { bubbles: true })); q('[data-act="bldmake"]').click();
  const c = db.chars.find(x => x.name === "Test Ward"); return `${clsLine(c)}, d${c.hd.die}, speed ${c.speed}, uses ${c.res.map(r => `${r.name} ${r.max} (${r.rest})`).join(", ")}, casts with ${c.castAb}`;
});
