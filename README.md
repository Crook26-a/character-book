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

**2014 rules (v22):** a switch at the top builds from the SRD 5.1 instead, in the 2014 order (race and subrace with their ability increases, class, background, scores, skills, a choice on each line of the class's starting equipment, spells, and a name). The SRD 5.1 has 12 classes with one subclass each, 9 races with 4 subraces, one background (Acolyte), and one feat (Grappler); everything else is Other, from the 2014 Player's Handbook. `rules.js` carries it under `RULES["2014"]`. A 2014 character's level-up (Gnick's too) now fills in the class's features and uses from the SRD 5.1; a subclass that isn't in it (Gnick's Trickery Domain) is still looked up.

**Mixing the rules (v23):** the builder's third choice, "Mix both", lists both SRDs' classes, species and races, backgrounds, and 1st-level subclasses, each marked (2014) or (2024); each pick follows its own edition (a 2014 class's kit, a 2024 background's feat), and the class's edition runs the class tables. When a 2014 race and a 2024 background both give ability increases you pick which (the background by default, as the 2024 book says); when neither does, it's +2 and +1 anywhere. A mixed character (`c.mixed`, also a "Mix in" checkbox next to Rules while editing, for anyone, Gnick included) is offered both editions' subclasses and feats at level-up.

## Credit

This work includes material from the System Reference Document 5.2 ("SRD 5.2") by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.

This work includes material taken from the System Reference Document 5.1 ("SRD 5.1") by Wizards of the Coast LLC and available at https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is licensed under the Creative Commons Attribution 4.0 International License available at https://creativecommons.org/licenses/by/4.0/legalcode.

## With Ordinate Survey (both ways)

- **To the survey:** PCs tab → a character's **Send to the survey** (any backup works too). In the survey: Party tab → **Bring in from the Character Book…**. A character already in the party is updated; anyone else joins.
- **From the survey:** Party tab → **Send to the Character Book** (one character) or **Send everyone…**. Here: PCs tab → **Bring in a backup…**. A character already here is updated, not replaced.
- Updating either way: the sheet's numbers are the incoming copy's; attacks, resources, spells, and items go by name (matches updated, new ones added, nothing removed). The survey keeps its secret favor, XP, crew role, notes, and fight stats, and never sends them; this app keeps its journal, people, effects, and the cart's wager.

## Sync

**Sync** (top right) keeps every device the same: all characters (everything on their sheets), added pictures, and the homebrew library, kept in a secret gist in your GitHub. Set up once on the PCs tab with a token that can only touch gists, then scan the QR code on each other device. On Sync, each character's newer copy wins. The token stays on the device, never in a backup or in the gist.

## Your own backgrounds and roll tables (v24)

PCs tab → Homebrew: **+ A background** (skills, tool, languages, ability scores it raises for 2024 style, an origin feat, a feature for 2014 style, and its equipment as one list or an A/B choice) and **+ A table** for everyone. The Field Book's Rules tab makes the same two, and Sync brings them here (its notes stay behind). The builder lists your backgrounds, marked "yours" or "Field Book"; **Apply a background…** (Play tab → Who they are) gives one to a character already made, from a ticked list of what it would add (what the sheet already has, ability scores, and equipment start unticked). Roll tables are rows like "01–02 | what happens" (00 is 100; a line without a number joins the row above; the note says if a number has no row); a character can have their own too, and all of them roll from the Play tab's Roll tables, with any dice in a result tappable.

## Still to do (Joseph, 2026-11-01)

In this order: multiclassing (a character's classes as a list); then custom subclasses whose features change the sheet (ability scores, spell slots, proficiencies, uses, always-prepared spells, and ongoing bonuses) with the Wild Magic pieces (a roll offered after casting); and custom feats (name, type, prerequisite, what it does, and the same sheet changes), offered in the background feat dropdown, the level-up's feat choice, and Versatile.
