// Browse items: the whole list from the SRD and from the library, narrowed by kind, and picking one
const q = s => document.querySelector(s);
step("the SRD's whole list, then just the potions", () => {
  ui.tab = "items"; ui.src = "srd"; render(); q('[data-act="itemlist"]').click();
  const all = q("#pkOut .note").textContent; const k = q("#pkKind"); k.value = "potion"; k.dispatchEvent(new Event("change", { bubbles: true }));
  return `${all}; potions: ${q("#pkOut .note").textContent}`;
});
step("pick a Potion of Healing from the list", () => {
  ui.tab = "items"; ui.src = "srd"; ui_pk.kind = "potion"; render(); q('[data-act="itemlist"]').click();
  const list = [...document.querySelectorAll('#pkOut [data-act="pkitem"] .nm')];
  const b = list.find(x => /^Potion of Healing/.test(x.textContent.trim())); expect(b, "it's in the list", list.map(x => x.textContent.trim())); b.closest("button").click();
  expect(C().items.at(-1).name === "Potion of Healing", "added"); return C().items.at(-1).use.heal;
});
step("the library side lists the Field Book's items", () => {
  localStorage.setItem("fieldbook", JSON.stringify({ loot: [{ id: "ll_a", name: "Bone flute", kind: "curio" }, { id: "ll_b", name: "Salt lamp", kind: "gear" }] }));
  ui.tab = "items"; ui.src = "srd"; render(); q('[data-act="itemlist"]').click(); q('[data-act="pksrc"][data-src="lib"]').click(); const t = q("#pkOut").textContent;
  expect(/Bone flute/.test(t) && /Salt lamp/.test(t), "both Field Book items listed"); closeOv(); return q("#view").textContent.match(/From the library \(\d+\)/)[0];
});
