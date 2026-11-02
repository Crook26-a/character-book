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

Multiclassing (v26), custom subclasses and feats with their sheet changes, and the Wild Magic pieces (v27) are done. Your own classes are done too (v28), and the Field Book makes classes, subclasses, and feats as well (v29: read from it like its backgrounds, and changed there). Your own species and races, and moving your own things to the Field Book, came in v30. Still open: AC formulas, bonuses that only apply sometimes, and choices beyond an ability score at a level.

## Multiclassing (v26)

The level-up starts with **Which class**: one the character has, or **A new class…**, which shows the requirements (2014: the SRD 5.1's table; 2024: 13 in each class's primary ability) and blocks the level until they're met or "My DM allows it" is ticked, then what the new class gives a multiclass character (2014: the SRD 5.1's table, with a skill to pick where it says so; 2024: looked up and typed in). Everything after follows that class's own level: hit points from its die, its features, subclass, ability score improvements, and spell counts, while the proficiency bonus follows the total. Spell slots: one spellcasting class uses its own table; more add up on the shared table (paladin and ranger levels halved, rounded down in 2014 and up in 2024), and a warlock's pact slots stay apart (`c.pactSlots`, cast from the Spells tab's level list, back on a short rest). Hit dice of each size are their own pool (`c.hdx`), each spent on a short rest, with a long rest bringing back half of all of them, biggest first. A spell can belong to a class (`sp.cls`, set by the picker's class choice or in Edit), which gives it that class's DC and attack; the Play and Spells tabs show each class's. Classes are `c.classes` ({ cls, sub, level, die }); `c.cls`, `c.subcls`, and `c.hd` stay the first class's and `c.level` the total, so a one-class sheet is unchanged. The survey still gets the first class and the total level.

## Your own subclasses and feats, and Wild Magic (v27)

PCs tab → Homebrew: **+ A subclass** (its class, features by level, and optionally a third caster's spellcasting, like the Eldritch Knight: slots from 3rd level, an ability, and a spell list) and **+ A feat** (kind, prerequisite, and text). A feature or a feat can carry **changes to the sheet**: an ability score (or one the player chooses), a skill or expertise, a saving throw, an armor, weapon, tool, or language, a use to track (a number, or the proficiency bonus, a modifier, or the class level, kept up to date), always-prepared spells, hit points per level, speed, an ongoing bonus (counted like an item's), and **a roll after casting**: after a spell of a class cast with a slot, roll a die (d20), and on the numbers given roll a table and bring a use back (Wild Magic Surge and Tides of Chaos). The level-up offers your subclasses with the SRD's and fills in their features, reading them as they are at that level; **Apply a subclass…** (Play tab → Features and traits) gives one to a character already playing, with a ticked list of the features up to their level (what the sheet already has starts unticked). Your feats are offered in a background's feat, the level-up's feat, and Versatile. Not yet: subclasses and feats made in the Field Book; AC formulas (a feature's "13 + Dex" stays its text).

## Your own classes (v28)

PCs tab → Homebrew: **+ A class**. Hit die, primary ability (multiclassing needs 13 in it), saving throws, skills (how many, from which or any), armor, weapons, tools, starting equipment (one list or A/B), what a multiclass character gets; spellcasting (none, full, half, a third, or pact magic, with an ability, and its spells from a class's list, its own named spells, or both); the subclass level and the ability score improvement levels; a class table (columns by level, like Cantrips, Prepared Spells, or Rages; a column marked as a use is tracked and grows at each level-up); and features by level with their changes to the sheet. It's in the builder (marked "yours"), the level-up (and its "A new class…"), multiclassing (requirements, proficiencies, and slots on the shared table), the subclass form, and Edit. The quick "Other (type your own)" class is still there for a one-off.

## Your own species and races, and moving things to the Field Book (v30)

PCs tab → Homebrew: **+ A species or race**. Size, speed, ability score increases (2014 style; leave them empty for 2024 style, where the background gives them, or +1 to two others like the half-elf), skills (named, and any of their choice), languages, and traits by character level with their changes to the sheet. One can be a subrace of another race (the SRD's or yours): the builder lists it under that race, it takes the race's traits and speed unless it sets its own, and its increases add to the race's. A trait above 1st level comes with the level-up that reaches that character level. **Apply a species or race…** (Play → Who they are) gives one to a character already made, from a ticked list (what the sheet has, and ability scores, start unticked). The Field Book's Rules tab makes them too.

Each thing of yours in the library (backgrounds, tables, species and races, classes, subclasses, and feats) has **→ Field Book**: it moves into the Field Book's storage on this device (both apps live on the same site), and from then on it's changed there and still offered here. The Field Book takes it in even while it's open, and its Sync takes it to the DM's other devices.

## Starting above level 1 (v31)

The builder has **Starting level** (1 to 20). It makes level 1, then each level comes in turn as a level-up ("Building Test: level 3 of 7"), with its usual choices: hit points, which class takes the level (so a character can start multiclassed, requirements checked), a subclass, ability scores or a feat, and spells (a caster's spell list opens between levels, with a button on to the next). **Finish later** stops at any level: the Play tab shows how far it got, and "reaching level N" stays on the not-finished list until the character gets there. Starting equipment and gold above level 1 aren't in the SRD, so the app says to ask the DM. A build doesn't add a journal entry for each level.
