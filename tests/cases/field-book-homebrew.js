// the Field Book on the same device: its items and spells show up as homebrew by themselves, without their DM notes
const q = s => document.querySelector(s);
const typ = (s, v) => { const e = q(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); };

step("the Field Book has a bell and a spell", () => {
  localStorage.setItem("fieldbook", JSON.stringify({ loot: [{ id: "ll_fb_bell", name: "Whispering bell", kind: "magic item", rarity: "Uncommon", effect: "Rings when a lie is told nearby.", notes: "DM: the bell lies too.", fbEdited: 1 }],
    spells: [{ id: "lsp_fb_hush", name: "Hush of the Glade", lv: 1, school: "Illusion", time: "Action", range: "30 feet", dur: "1 minute", conc: true, cls: "Cleric, Druid", desc: "Silence falls in a 10-foot sphere.", notes: "DM: from the dryads.", fbEdited: 1 }] }));
  ui.tab = "pcs"; render(); return document.querySelector("#view").textContent.match(/From the Field Book[^.]*\./)[0];
});
step("the spell is in the picker, marked Field Book", () => {
  ui.tab = "spells"; render(); q('[data-act="addspell"]').click(); typ("#pkQ", "hush");
  const t = q("#pkOut").textContent; expect(/Hush of the Glade/.test(t) && /Field Book/.test(t), "Hush of the Glade, marked Field Book"); closeOv(); return t.replace(/\s+/g, " ").trim();
});
step("the bell as an item, without the DM's note", () => {
  ui.tab = "items"; render(); typ("#newItem", "whispering"); q('#itemSug [data-act="pkitem"]').click();
  const b = C().items.at(-1); expect(b.name === "Whispering bell" && !/DM:/.test(JSON.stringify(b)), "the bell, no DM note"); return b.note;
});
