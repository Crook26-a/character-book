// Shop for Gear (Joseph, 2026-11-03): from the builder, a pixel market stall kept by Vorsk; buys from the priced
// items, sells the build's own equipment back at full price, keeps track of the gold, and the character is made with it
const q = s => document.querySelector(s);
const click = s => { const e = q(s); expect(e, "there's a " + s); e.click(); };
const sel = (s, v) => { const e = q(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("change", { bubbles: true })); };
const typ = (s, v) => { const e = q(s); expect(e, "there's a " + s); e.value = v; e.dispatchEvent(new Event("input", { bubbles: true })); };
const gold = () => q(".px-gold").textContent;
const said = () => q(".px-say").textContent.replace(SHOPKEEP, "").trim();
const sayIn = k => SHOP_SAY[k].includes(said());

step("a 2024 fighter takes the gold instead and goes shopping", () => {
  ui.tab = "pcs"; render(); click('[data-act="newbuild"]'); sel('[data-bld="cls"]', "Fighter");
  const opt = [...document.querySelectorAll('[name="bldeqc"]')].map(r => r.parentElement.textContent.trim()).find(t => /gold instead/.test(t));
  click('[name="bldeqc"][data-v="C"]'); const sum = q("#bldShop .note").textContent;
  click('[data-act="shopopen"]'); expect(ovKind === "shop", "the shop is open", ovKind); expect(sayIn("hello"), "a greeting", said());
  return `option: ${opt} | builder: ${sum} | shop: ${gold()}, ${document.querySelectorAll("#shopList .px-row").length} things for sale, the dragon's ${q(".px-keep svg") ? "drawn" : "missing"}`;
});
step("buying takes the gold; what's too dear is refused", () => {
  click('[data-act="shopbuy"][data-id="srd:longsword"]'); expect(sayIn("buy"), "a sale line", said()); const after = gold();
  click('[data-act="shopbuy"][data-id="srd:airship"]'); expect(sayIn("broke"), "a refusal", said()); expect(q(".px-keep.mad"), "the dragon is cross");
  return `after a longsword: ${after}; after an airship: ${gold()}, bought ${JSON.stringify(BLD.bought)}`;
});
step("only what I can afford, search, and kinds", () => {
  click('[data-act="shopafford"]'); const rows = document.querySelectorAll("#shopList .px-row"), dear = document.querySelectorAll("#shopList .px-row.dim").length;
  typ("#shopQ", "rope"); const rope = [...document.querySelectorAll("#shopList .px-nm")].map(e => e.textContent).join(", ");
  typ("#shopQ", ""); sel("#shopKind", "armor"); const kinds = [...document.querySelectorAll("#shopList .px-kind")].map(e => e.textContent).join(", ");
  click('[data-act="shopafford"]'); sel("#shopKind", "");
  return `affordable rows ${rows.length}, too dear among them ${dear} | rope: ${rope} | armor filter shows: ${kinds}`;
});
step("selling the kit back at full price, and buying it back", () => {
  click('[data-act="shopback"]'); click('[name="bldeqc"][data-v="A"]'); click('[data-act="shopopen"]'); const before = gold();
  click('[data-act="shoptab"][data-v="sell"]'); const first = [...document.querySelectorAll('[data-act="shopsell"]')].map(b => b.dataset.name);
  const cm = first.find(n => /chain/i.test(n)); expect(cm, "chain mail to sell", first.join(", ")); click(`[data-act="shopsell"][data-name="${cm}"]`); expect(sayIn("sell"), "a buying line", said()); const sold = gold();
  click(`[data-act="shopunsell"][data-name="${cm}"]`); const spent = `${sayIn("broke") ? "refused" : "allowed"}, ${gold()}`;
  click('[data-act="shoptab"][data-v="basket"]'); click('[data-act="shopless"][data-id="srd:longsword"]'); const putBack = gold();
  click(`[data-act="shopunsell"][data-name="${cm}"]`); const back = gold();
  click('[data-act="shoptab"][data-v="sell"]'); click(`[data-act="shopsell"][data-name="${cm}"]`);
  return `kit A: ${before} | to sell: ${first.join(", ")} | sold the chain mail: ${sold} | buying it back with the longsword bought: ${spent} | longsword put back: ${putBack} | bought it back: ${back} | sold again: ${gold()}`;
});
step("the basket, then the character is made with it", () => {
  click('[data-act="shoptab"][data-v="basket"]'); const lines = [...document.querySelectorAll(".px-body .px-row")].map(r => r.textContent.replace(/\s+/g, " ").trim()).join(" / ");
  click('[data-act="shopback"]'); const sum = q("#bldShop .note").textContent;
  typ('[data-bld="name"]', "Test Shopper"); click('[data-act="bldmake"]'); const c = C();
  return `basket: ${lines} | builder: ${sum} | made: ${c.items.map(it => `${it.qty > 1 ? it.qty + " " : ""}${it.name}`).join(", ")}; purse ${JSON.stringify(c.purse)}; AC ${c.ac}; log: ${(c.log || []).map(l => l.text).find(t => /Shopped/.test(t))}`;
});
step("a 2014 build can take gold instead of the class's equipment", () => {
  closeOv(); ui.tab = "pcs"; render(); click('[data-act="newbuild"]'); click('[data-act="blded"][data-v="2014"]'); sel('[data-bld="cls"]', "Fighter");
  click('[data-act="bldkitgold"]'); const left1 = q("#bldGo").textContent.match(/the Fighter's starting gold/) ? "asks for the gold" : "doesn't ask";
  typ('[data-bld="kitGoldT"]', "120"); const sum = q("#bldShop .note").textContent, left2 = /starting gold/.test(q("#bldGo").textContent) ? "still asks" : "satisfied";
  return `${left1}; typed 120: ${sum}; ${left2}; a lookup note: ${!!q(".lookup")}`;
});
