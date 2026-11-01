// Sync, against a pretend GitHub in the page (the gist lives in __KIT.keep, so a restart at a step has it): the first
// sync sends everything up; "the other device" (an edit to the gist) comes down; this device's change goes up; a
// deletion travels.
const G = () => db.chars.find(c => c.id === "ch_gnick");
const fakeGitHub = () => {
  window.fetch = async (url, o = {}) => {
    const k = __KIT.keep, u = String(url), ok = b => ({ ok: true, status: 200, json: async () => JSON.parse(JSON.stringify(b)), text: async () => JSON.stringify(b) });
    if (/\/gists\?/.test(u)) return ok(k.gist ? [{ id: k.gist.id, description: k.gist.description }] : []);
    if (/\/gists$/.test(u) && o.method === "POST") { const b = JSON.parse(o.body); k.gist = { id: "g1", description: b.description, files: b.files }; return ok(k.gist); }
    if (/\/gists\/g1$/.test(u) && o.method === "PATCH") { const b = JSON.parse(o.body); Object.assign(k.gist.files, b.files); return ok(k.gist); }
    if (/\/gists\/g1$/.test(u)) return ok(k.gist);
    return { ok: false, status: 404, json: async () => ({}) };
  };
};
const cloud = () => JSON.parse(__KIT.keep.gist.files["character-book-sync.json"].content);
const otherDevice = fn => { const c = cloud(); fn(c); __KIT.keep.gist.files["character-book-sync.json"].content = JSON.stringify(c); };

step("set up, and the first Sync sends everything up", async () => {
  fakeGitHub(); setSyncCfg({ token: "test" }); await doSync(); await wait(50);
  expect(!!__KIT.keep.gist && !!cloud().chars.ch_gnick, "a gist with Gnick in it");
  return `cloud has: ${Object.values(cloud().chars).map(x => x.data.short || x.data.name).join(", ")}`;
});
step("the other device hurt Gnick and made Wren: Sync brings both", async () => {
  fakeGitHub();
  otherDevice(c => { const g = c.chars.ch_gnick; g.data.hp = 10; g.at = Date.now() + 1000; const w = blankChar("Wren"); w.id = "ch_wren"; c.chars.ch_wren = { at: Date.now() + 1000, data: w }; });
  await doSync(); await wait(50);
  expect(G().hp === 10 && db.chars.some(c => c.id === "ch_wren"), "Gnick at 10 and Wren here", [G().hp, db.chars.map(c => c.id)]);
  return `here: Gnick ${G().hp} HP, ${db.chars.map(c => c.name).join(", ")}`;
});
step("this device heals Gnick and deletes Wren: Sync sends both", async () => {
  fakeGitHub(); await wait(5);
  G().hp = 25; db.chars = db.chars.filter(c => c.id !== "ch_wren"); save(true); await doSync(); await wait(50);
  const c = cloud(); expect(c.chars.ch_gnick.data.hp === 25 && !c.chars.ch_wren && !!c.deleted.ch_wren, "cloud: Gnick at 25, Wren gone and marked deleted");
  return `cloud: Gnick ${c.chars.ch_gnick.data.hp} HP; deleted: ${Object.keys(c.deleted).join(", ")}`;
});
step("the panel and the QR code for another device", () => {
  ui.tab = "pcs"; ui.qr = true; render();
  expect(!!document.querySelector("#view svg") && /#sync=/.test(syncLink()), "a QR code with a #sync= link"); ui.qr = false; render();
  return document.querySelector("#syncBtn").textContent;
});
