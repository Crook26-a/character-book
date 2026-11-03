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
  ui.tab = "pcs"; render(); BLD = null; click('[data-act="newbuild"]'); sel('[data-bld="cls"]', "Fighter");
  const opt = [...document.querySelectorAll('[name="bldeqc"]')].map(r => r.parentElement.textContent.trim()).find(t => /gold instead/.test(t));
  click('[name="bldeqc"][data-v="C"]'); const sum = q("#bldShop .note").textContent;
  click('[data-act="shopopen"]'); expect(ovKind === "shop", "the shop is open", ovKind); expect(sayIn("hello"), "a greeting", said());
  return `option: ${opt} | builder: ${sum} | shop: ${gold()}, ${document.querySelectorAll("#shopList .px-row").length} things for sale, the picture: ${/vorsk-stall.jpg/.test(getComputedStyle(q(".px-shop")).backgroundImage) ? "Vorsk at the stall" : "missing"}`;
});
step("buying takes the gold; what's too dear is refused", () => {
  click('[data-act="shopbuy"][data-id="srd:longsword"]'); expect(sayIn("buy"), "a sale line", said()); const after = gold();
  click('[data-act="shopbuy"][data-id="srd:airship"]'); expect(sayIn("broke"), "a refusal", said()); expect(q(".px-shop.mad"), "the dragon is cross");
  return `after a longsword: ${after}; after an airship: ${gold()}, bought ${JSON.stringify(BLD.bought)}`;
});
step("only what I can afford, search, and kinds", () => {
  click('[data-act="shopafford"]'); const rows = document.querySelectorAll("#shopList .px-row"), dear = document.querySelectorAll("#shopList .px-row.dim").length;
  typ("#shopQ", "rope"); const rope = [...document.querySelectorAll("#shopList .px-nm")].map(e => e.firstChild.textContent.trim()).join(", ");
  typ("#shopQ", ""); sel("#shopKind", "armor"); const kinds = [...document.querySelectorAll("#shopList .px-kind")].map(e => e.textContent).join(", ");
  click('[data-act="shopafford"]'); sel("#shopKind", "");
  return `affordable rows ${rows.length}, too dear among them ${dear} | rope: ${rope} | armor filter shows: ${kinds}`;
});
step("selling the kit back at full price, and buying it back", () => {
  click('[data-act="shopback"]'); click('[data-act="newbuild"]'); click('[name="bldeqc"][data-v="A"]'); click('[data-act="shopopen"]'); const before = gold();
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
  click('[data-act="shopback"]'); click('[data-act="newbuild"]'); const sum = q("#bldShop .note").textContent;
  typ('[data-bld="name"]', "Test Shopper"); click('[data-act="bldmake"]'); const c = C();
  return `basket: ${lines} | builder: ${sum} | made: ${c.items.map(it => `${it.qty > 1 ? it.qty + " " : ""}${it.name}`).join(", ")}; purse ${JSON.stringify(c.purse)}; AC ${c.ac}; log: ${(c.log || []).map(l => l.text).find(t => /Shopped/.test(t))}`;
});
step("a 2014 build can take gold instead of the class's equipment", () => {
  closeOv(); ui.tab = "pcs"; render(); BLD = null; click('[data-act="newbuild"]'); click('[data-act="blded"][data-v="2014"]'); sel('[data-bld="cls"]', "Fighter");
  click('[data-act="bldkitgold"]'); const left1 = q("#bldGo").textContent.match(/the Fighter's starting gold/) ? "asks for the gold" : "doesn't ask";
  typ('[data-bld="kitGoldT"]', "120"); const sum = q("#bldShop .note").textContent, left2 = /starting gold/.test(q("#bldGo").textContent) ? "still asks" : "satisfied";
  return `${left1}; typed 120: ${sum}; ${left2}; a lookup note: ${!!q(".lookup")}`;
});
step("magic items at estimated value, only when switched on (SRD 5.2 values by rarity)", () => {
  closeOv(); ui.tab = "pcs"; render(); BLD = null; click('[data-act="newbuild"]'); sel('[data-bld="cls"]', "Fighter"); click('[name="bldeqc"][data-v="C"]');
  typ('[data-bld="eqT"]', "1000 GP"); click('[data-act="shopopen"]');
  const off = shopPool().filter(x => x.est).length, shown0 = document.querySelectorAll('#shopList [data-id^="srd:bag-of-holding"]').length;
  click('[data-act="shopmagic"]'); expect(sayIn("magic"), "a magic line", said()); expect(q(".px-dm"), "the DM note");
  const price = id => { const r = q(`#shopList [data-id="${id}"]`); return r ? r.closest(".px-row").textContent.replace(/\s+/g, " ").trim() : "(not listed)"; };
  const rows = ["srd:bag-of-holding", "srd:potion-of-healing", "srd:longsword-plus-1#+2", "srd:feather-token-anchor#Uncommon", "srd:oil-of-slipperiness"].map(price).join(" / ");
  click('[data-act="shopbuy"][data-id="srd:longsword-plus-1#+1"]'); const g = gold(); click('[data-act="shopback"]'); click('[data-act="newbuild"]');
  typ('[data-bld="name"]', "Test Magic"); click('[data-act="bldmake"]'); const c = C(), it = c.items.find(i => /Longsword, \+1/.test(i.name));
  return `estimated items ${off}, shown before switching on ${shown0} | ${rows} | after a Longsword, +1: ${g} | on the sheet: ${it ? `${it.name}, ${worthText(it)}, from ${it.from}` : "(missing)"}`;
});
step("magic items owed for the starting level are taken free, with the magic switch off", () => {
  closeOv(); ui.tab = "pcs"; render(); BLD = null; click('[data-act="newbuild"]'); sel('[data-bld="toLevel"]', "5"); sel('[data-bld="cls"]', "Fighter"); click('[name="bldeqc"][data-v="C"]');
  BLD.hiRoll = "2"; showBuilder(); click('[data-act="shopopen"]'); const g0 = gold(), owed = q(".px-owed").textContent.replace(/\s+/g, " ");
  const freeHead = (q("#shopList .px-kind") || {}).textContent, takes = document.querySelectorAll('#shopList [data-act="shoptake"]').length;
  click('[data-act="shoptake"][data-id="srd:longsword-plus-1#+1"]'); expect(sayIn("free"), "a free line", said());
  const after = `${gold()}, Uncommon still free: ${!!q('#shopList [data-act="shoptake"][data-id="srd:bag-of-holding"]')}, Bag of Holding listed: ${!!q('#shopList [data-id="srd:bag-of-holding"]')}`;
  const common = q('#shopList [data-act="shoptake"]'); const commonName = common && common.closest(".px-row").querySelector(".px-nm").firstChild.textContent.trim(); common.click();
  const banner = q(".px-owed") ? "still owed" : "nothing owed";
  click('[data-act="shoptab"][data-v="basket"]'); const basket = [...document.querySelectorAll(".px-body .px-row")].map(r => r.textContent.replace(/\s+/g, " ").trim()).join(" / ");
  click('[data-act="shopback"]'); click('[data-act="newbuild"]'); const step6 = q('[data-bld="magic.Uncommon.0"]').selectedOptions[0].textContent;
  typ('[data-bld="name"]', "Test Owed"); click('[data-act="bldmake"]'); const c = C(), it = c.items.find(i => /Longsword, \+1/.test(i.name));
  return `gold ${g0} | ${owed} | first group: ${freeHead}, ${takes} to take | took a Longsword, +1: ${after} | took ${commonName}: ${banner} | basket: ${basket} | step 6 shows: ${step6} | made: ${it ? `${it.name}, ${worthText(it)}, from ${it.from}` : "(missing)"}, purse ${c.purse.gp} gp, not finished: ${todoOf(c).filter(t => /magic/.test(t)).join(", ") || "no magic items"}`;
});
step("price and rarity filters: up to a price, and a rarity (which turns the magic on)", () => {
  closeOv(); ui.tab = "pcs"; render(); BLD = null; SHOP = null; click('[data-act="newbuild"]'); sel('[data-bld="cls"]', "Fighter"); click('[name="bldeqc"][data-v="C"]'); click('[data-act="shopopen"]');
  const cps = () => [...document.querySelectorAll('#shopList [data-act="shopbuy"]')].map(b => shopPool().find(x => x.id === b.dataset.id).cp);
  const all = cps().length; sel("#shopMax", "10"); const ten = cps(); sel("#shopMax", "10000"); const big = cps();
  sel("#shopMax", ""); sel("#shopRar", "uncommon"); const unc = [...document.querySelectorAll('#shopList [data-act="shopbuy"]')].map(b => shopPool().find(x => x.id === b.dataset.id));
  const magicOn = SHOP.magic; sel("#shopMax", "500"); const both = cps(); sel("#shopRar", "none"); const plain = shopPool().filter(x => [...document.querySelectorAll('#shopList [data-act="shopbuy"]')].some(b => b.dataset.id === x.id) && x.rarity).length;
  sel("#shopMax", ""); sel("#shopRar", ""); closeOv(); BLD = null; SHOP = null;
  return `all ${all} | up to 10 GP: ${ten.length}, dearest ${Math.max(...ten) / 100} GP | up to 10,000 GP: ${big.length}, dearest ${Math.max(...big) / 100} GP | Uncommon: ${unc.length}, all uncommon ${unc.every(x => rarities(x).includes("uncommon"))}, magic switched on ${magicOn} | Uncommon up to 500 GP: ${both.length}, dearest ${Math.max(...both) / 100} GP | Not magic, with a rarity: ${plain}`;
});
step("Done shopping closes it all; the build is kept, and Start over begins afresh", () => {
  closeOv(); ui.tab = "pcs"; render(); BLD = null; click('[data-act="newbuild"]'); sel('[data-bld="cls"]', "Fighter"); click('[name="bldeqc"][data-v="C"]');
  click('[data-act="shopopen"]'); const full = (() => { const r = q("#ov .box").getBoundingClientRect(); return r.width >= innerWidth - 1 && r.height >= innerHeight - 1; })();
  const doneAtTop = !!q(".px-boxhead .px-done"); click('[data-act="shopbuy"][data-id="srd:longsword"]'); click(".px-done");
  const closed = q("#ov").hidden, btn = q('[data-act="newbuild"]').textContent.trim();
  click('[data-act="newbuild"]'); const kept = `${ovKind}, class ${BLD.cls}, bought ${JSON.stringify(BLD.bought)}`;
  click('[data-act="bldover"]'); const fresh = `class "${BLD.cls}", bought ${JSON.stringify(BLD.bought || null)}`; closeOv(); BLD = null;
  return `full screen ${full}, Done at the top ${doneAtTop} | after Done: overlay ${closed ? "closed" : "still open"}, the button says "${btn}" | carried on: ${kept} | Start over: ${fresh}`;
});
step("A blank sheet opens a fresh builder, asking before it throws away an unfinished one", () => {
  closeOv(); ui.tab = "pcs"; render(); BLD = null; click('[data-act="newchar"]'); const opened = `${ovKind}, class "${BLD.cls}", the name box ${document.activeElement.dataset.bld === "name" ? "first and focused" : "not focused"}, ${q("#ov .fld input").dataset.bld === "name" ? "at the top" : "not at the top"}`;
  sel('[data-bld="cls"]', "Fighter"); closeOv(); render(); let asked = ""; const was = window.confirm;
  window.confirm = m => { asked = m; return false; }; click('[data-act="newchar"]'); const kept = `${ovKind || "nothing open"}, class ${BLD.cls}`;
  window.confirm = () => true; click('[data-act="newchar"]'); window.confirm = was; const fresh = `${ovKind}, class "${BLD.cls}"`; closeOv(); BLD = null;
  return `opens: ${opened} | with a Fighter started it asks "${asked}"; said no: ${kept} | said yes: ${fresh}`;
});
step("tapping an item's name shows its description; tapping again hides it", () => {
  closeOv(); ui.tab = "pcs"; render(); BLD = null; SHOP = null; click('[data-act="newbuild"]'); sel('[data-bld="cls"]', "Fighter"); click('[name="bldeqc"][data-v="A"]'); click('[data-act="shopopen"]');
  click('#shopList .px-nm[data-id="srd:longsword"]'); const d1 = q(".px-desc").textContent.replace(/\s+/g, " ").trim();
  click('#shopList .px-nm[data-id="srd:longsword"]'); const gone = !q(".px-desc");
  click('[data-act="shopmagic"]'); click('#shopList .px-nm[data-id="srd:bag-of-holding"]'); const d2 = q(".px-desc").textContent.replace(/\s+/g, " ").trim().slice(0, 90);
  click('[data-act="shoptab"][data-v="sell"]'); const own = q('.px-nm[data-id^="own:"]'); own.click(); const d3 = `${own.dataset.id.slice(4)}: ${q(".px-desc").textContent.replace(/\s+/g, " ").trim().slice(0, 80)}`;
  closeOv(); BLD = null; SHOP = null;
  return `Longsword: ${d1} | tapped again: ${gone ? "hidden" : "still shown"} | Bag of Holding: ${d2}… | selling ${d3}`;
});
