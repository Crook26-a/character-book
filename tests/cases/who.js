// what's written on the sheet shows without editing: the "Who they are" section, an item's worth and bonuses
step("Who they are, on the Play tab", () => {
  ui.tab = "play"; ui.open.who = true; render(); const t = document.querySelector('[data-sec="who"]').textContent;
  expect(/Folk Hero/.test(t) && /Chaotic Good/.test(t), "background and alignment show");
  return t.replace(/\s+/g, " ").slice(0, 160);
});
step("the cart's +1 and an item's worth", () => {
  ui.tab = "items"; render(); return [...document.querySelectorAll(".panel.artifact .note, #view .card .sub")].map(e => e.textContent.trim()).filter(s => /gp|Gives/.test(s)).slice(0, 3).join(" | ");
});
