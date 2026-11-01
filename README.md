# Character Book

The sheet you play from, beside **Ordinate Survey** (the DM's app) and the **Field Book**. Built for Gnick first; holds any character you play.

- **Play:** hit points (damage, healing, temporary HP), death saves, concentration (a Con save comes up when you take damage), conditions and exhaustion, effects that add to rolls (Bless, Guidance, Aid, Pass without Trace, your own), slots, Luck points, Channel Divinity, rests. Tap any number to roll it: advantage, disadvantage, a Luck point, or the real die you rolled.
- **Spells:** cast at any slot level (spends the slot, starts concentration, rolls the attack or the healing), and the Auspicious Cart's point-cast spells.
- **Items:** purse with a log of what came and went, attunement (3 at most), pictures, potions you can drink, the Auspicious Cart with the Pious Wager table and divine debt.
- **Journal** and **People:** session notes, and who and where you've met.

Everything stays on the device. Save a backup from the character menu (tap the name at the top); bring it in on another device the same way.

Files: `index.html` (the whole app), `srd.js` (the SRD 5.2 spells and items the pickers offer, built by `tools\build-srd.ps1` from Ordinate Survey's own SRD data), `sw.js` (offline cache; bump `CACHE` with each release), `manifest.webmanifest`, the icons, and `pictures\` (the cart's pictures from the DM).

## Pinned ideas (Joseph, 2026-10-31)

1. **Pick from lists, not type** (done in v6): the fields become dropdowns of the SRD (spells, items, species, classes…), plus a "homebrew" option that pulls from Ordinate Survey's own library.
2. **Level up** (done in v7): a level-up that tells you what to decide (hit points, spells, features, ability scores) and does the rest itself.
3. **Edit everything:** an edit mode where every part of the sheet can be changed: spell slots, names, the kind of each spell, all of it.

## Credit

This work includes material from the System Reference Document 5.2 ("SRD 5.2") by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.
