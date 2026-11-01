# Character Book

The sheet you play from, beside **Ordinate Survey** (the DM's app) and the **Field Book**. Built for Gnick first; holds any character you play.

- **Play:** hit points (damage, healing, and temporary HP), death saves, concentration (a Con save comes up when you take damage), conditions and exhaustion, effects that add to rolls (Bless, Guidance, Aid, Pass without Trace, or your own), slots, Luck points, Channel Divinity, and rests. Tap any number to roll it: advantage, disadvantage, a Luck point, or the real die you rolled.
- **Spells:** cast at any slot level (spends the slot, starts concentration, and rolls the attack or the healing), and the Auspicious Cart's point-cast spells.
- **Items:** purse with a log of what came and went, attunement (3 at most), pictures, potions you can drink, and the Auspicious Cart with the Pious Wager table and divine debt.
- **Journal** and **People:** session notes, and who and where you've met.

**Edit** (top right) turns every tab into fields: everything you put in can be changed there, and Done turns it back.

Everything stays on the device. Save a backup from the character menu (tap the name at the top); bring it in on another device the same way.

Files: `index.html` (the whole app), `srd.js` (the SRD 5.2 spells and items the pickers offer, built by `tools\build-srd.ps1` from Ordinate Survey's own SRD data), `rules.js` (the SRD 5.2's classes with their tables and features, subclasses, species, backgrounds, and feats, for the builder and the level-up, built by `tools\build-rules.ps1` from Open5e's copy of the SRD 5.2), `sw.js` (offline cache; bump `CACHE` with each release), `manifest.webmanifest`, the icons, and `pictures\` (the cart's pictures from the DM).

## Pinned ideas (Joseph, 2026-10-31)

1. **Pick from lists, not type** (done in v6): the fields become dropdowns of the SRD (spells, items, species, classes…), plus a "homebrew" option that pulls from Ordinate Survey's own library.
2. **Level up** (done in v7): a level-up that tells you what to decide (hit points, spells, features, ability scores) and does the rest itself.
3. **Edit everything** (done in v9): an edit mode where every part of the sheet can be changed: spell slots, names, the kind of each spell, all of it.

## Build a character (v20)

PCs tab, **+ Build a character (the SRD, or your own)**: one page in the 2024 order (class, background, species, ability scores by standard array, point buy, or rolling, skills, equipment, spells, and a name) that makes a level 1 character with its hit points, armor class, saves, skills, kit, gold, slots, and spells worked out. Only what the SRD 5.2 has (12 classes with one subclass each, 9 species, 4 backgrounds, and 17 feats); the Free Rules and the Player's Handbook aren't licensed to copy, so anything else is built from the closest choice and changed with Edit, and the builder says so. Every step is optional (v21): each list has Other to type your own, scores can be typed, and there is a box for any equipment. It always saves; whatever was left out is listed on the Play tab ("Not finished yet") and the PCs card until it is filled in or marked done. A 2024 character's level-up then fills in each level's features, uses, and spell counts from the class table.

## Credit

This work includes material from the System Reference Document 5.2 ("SRD 5.2") by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.

## With Ordinate Survey (both ways)

- **To the survey:** PCs tab → a character's **Send to the survey** (any backup works too). In the survey: Party tab → **Bring in from the Character Book…**. A character already in the party is updated; anyone else joins.
- **From the survey:** Party tab → **Send to the Character Book** (one character) or **Send everyone…**. Here: PCs tab → **Bring in a backup…**. A character already here is updated, not replaced.
- Updating either way: the sheet's numbers are the incoming copy's; attacks, resources, spells, and items go by name (matches updated, new ones added, nothing removed). The survey keeps its secret favor, XP, crew role, notes, and fight stats, and never sends them; this app keeps its journal, people, effects, and the cart's wager.

## Sync

**Sync** (top right) keeps every device the same: all characters (everything on their sheets), added pictures, and the homebrew library, kept in a secret gist in your GitHub. Set up once on the PCs tab with a token that can only touch gists, then scan the QR code on each other device. On Sync, each character's newer copy wins. The token stays on the device, never in a backup or in the gist.
