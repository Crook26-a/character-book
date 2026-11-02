# Builds rules.js: the SRD 5.2's classes (with their tables and features by level), subclasses, species, backgrounds,
# and feats, from Open5e's copy (document srd-2024), for the character builder and the level-up. The SRD 5.2 is the
# free-to-use part of the 2024 rules (Creative Commons, credited in the app); the Free Rules and the Player's Handbook
# are not, so nothing else goes in.
#
# Run it to refresh:   powershell -NoProfile -ExecutionPolicy Bypass -File tools\build-rules.ps1
param([string]$Api = "https://api.open5e.com/v2")
$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$App = Split-Path $PSScriptRoot -Parent
function Get-All($what) { (Invoke-RestMethod "$Api/$what/?document__key=srd-2024&limit=200").results }

$AB = @{ strength = "str"; dexterity = "dex"; constitution = "con"; intelligence = "int"; wisdom = "wis"; charisma = "cha" }
$SKILL = @{ acrobatics = "acrobatics"; animalhandling = "animal"; arcana = "arcana"; athletics = "athletics"; deception = "deception"; history = "history"
  insight = "insight"; intimidation = "intimidation"; investigation = "investigation"; medicine = "medicine"; nature = "nature"; perception = "perception"
  performance = "performance"; persuasion = "persuasion"; religion = "religion"; sleightofhand = "sleight"; stealth = "stealth"; survival = "survival" }
# the source spells a few words apart ("In sight"): skills are matched with the spaces taken out
function Skill-Keys($text) { @(foreach ($w in ($text -split ',|\bor\b|\band\b')) { $k = ($w -replace '[^A-Za-z]', '').ToLower(); if ($SKILL[$k]) { $SKILL[$k] } }) }
function Ab-Keys($text) { @(foreach ($w in ($text -split ',|\band\b')) { $k = ($w -replace '[^A-Za-z]', '').ToLower(); if ($AB[$k]) { $AB[$k] } }) }
function Choice($text) {  # "Choose A or B: (A) ...; or (B) 55 GP", and the Fighter's "Choose A, B, or C"
  $o = [ordered]@{}
  foreach ($m in [regex]::Matches($text, '\(([A-Z])\)\s*(.*?)(?=;?\s*(?:or\s*)?\([A-Z]\)|$)')) { $o[$m.Groups[1].Value] = $m.Groups[2].Value.Trim().TrimEnd(';').Trim() }
  if (-not $o.Count) { $o["A"] = $text.Trim() }
  $o
}
function Levels($f) { @($f.gained_at | ForEach-Object { [int]$_.level } | Sort-Object) }
function Column($f) { $o = [ordered]@{}; foreach ($d in ($f.data_for_class_table | Sort-Object { [int]$_.level })) { $o["$($d.level)"] = [string]$d.column_value }; $o }

$all = Get-All "classes"
$classes = foreach ($c in ($all | Where-Object { -not $_.subclass_of } | Sort-Object name)) {
  $core = [ordered]@{}
  foreach ($row in (($c.features | Where-Object feature_type -eq "CORE_TRAITS_TABLE").desc -split "`n")) { $m = [regex]::Match($row, '^\|([^|]+)\|([^|]+)\|'); if ($m.Success -and $m.Groups[1].Value -notmatch '^-+$') { $core[$m.Groups[1].Value.Trim()] = $m.Groups[2].Value.Trim() } }
  $sk = [string]$core["Skill Proficiencies"]; $n = [regex]::Match($sk, 'Choose (?:any )?(\d+)')
  $table = [ordered]@{}; foreach ($f in ($c.features | Where-Object feature_type -eq "CLASS_TABLE_DATA")) { $table[$f.name] = Column $f }
  $slots = [ordered]@{}; foreach ($f in ($c.features | Where-Object feature_type -eq "SPELL_SLOTS")) { $slots["$([int]($f.name -replace '\D', ''))"] = Column $f }
  [ordered]@{
    name = $c.name; hd = [int](([regex]::Match([string]$core["Hit Point Die"], '\d+')).Value); primary = [string]$core["Primary Ability"]
    saves = @(Ab-Keys ([string]$core["Saving Throw Proficiencies"]))
    skills = [ordered]@{ n = $(if ($n.Success) { [int]$n.Groups[1].Value } else { 0 }); any = ($sk -match 'Choose any'); from = @(Skill-Keys ($sk -replace '^.*?:', '')) }
    weapons = [string]$core["Weapon Proficiencies"]; armor = [string]$core["Armor Training"]; tools = [string]$core["Tool Proficiencies"]
    equipment = Choice ([string]$core["Starting Equipment"]); caster = [string]$c.caster_type
    features = @($c.features | Where-Object { $_.feature_type -in "CLASS_LEVEL_FEATURE", "CLASS_FEATURE_OPTION_LIST" } | ForEach-Object { [ordered]@{ name = $_.name; lv = @(Levels $_); desc = [string]$_.desc } } | Sort-Object { if ($_.lv.Count) { $_.lv[0] } else { 99 } }, name)
    table = $table; slots = $slots
  }
}
$subclasses = foreach ($s in ($all | Where-Object { $_.subclass_of } | Sort-Object name)) {
  [ordered]@{ name = $s.name; of = $s.subclass_of.name; desc = [string]$s.desc
    features = @($s.features | Where-Object { $_.feature_type -ne "CORE_TRAITS_TABLE" } | ForEach-Object { [ordered]@{ name = $_.name; lv = @(Levels $_); desc = [string]$_.desc } } | Sort-Object { if ($_.lv.Count) { $_.lv[0] } else { 99 } }, name) }
}
$species = foreach ($s in ((Get-All "species") | Sort-Object name)) {
  $tr = @($s.traits | ForEach-Object { [ordered]@{ name = $_.name; desc = [string]$_.desc } })
  $sp = ($tr | Where-Object name -eq "Speed").desc; $sz = ($tr | Where-Object name -eq "Size").desc
  [ordered]@{ name = $s.name; desc = [string]$s.desc; speed = [int](([regex]::Match([string]$sp, '\d+')).Value); size = ([string]$sz -replace '\s*\(.*$', '').Trim()
    traits = @($tr | Where-Object { $_.name -notin "Size", "Speed", "Creature Type" }) }
}
$backgrounds = foreach ($b in ((Get-All "backgrounds") | Sort-Object name)) {
  $g = @{}; foreach ($x in $b.benefits) { $g[$x.type] = [string]$x.desc }
  [ordered]@{ name = $b.name; desc = [string]$b.desc; abilities = @(Ab-Keys $g["ability_score"]); feat = $g["feat"]; skills = @(Skill-Keys $g["skill_proficiency"])
    tool = $g["tool_proficiency"]; equipment = Choice ([string]$g["equipment"] -replace '^\*Choose A or B:\*\s*', '') }
}
# a feat's rules are in its benefits ("You gain the following benefits." is often all its desc says): desc carries
# both, the benefits as a list after a blank line
function Feat-Text($f) { (@([string]$f.desc | Where-Object { $_.Trim() }) + @((@($f.benefits | ForEach-Object { "- " + ([string]$_.desc).Trim() }) -join "`n") | Where-Object { $_ })) -join "`n`n" }
$feats = foreach ($f in ((Get-All "feats") | Sort-Object name)) { [ordered]@{ name = $f.name; type = [string]$f.type; prereq = [string]$f.prerequisite; desc = (Feat-Text $f)
  benefits = @($f.benefits | ForEach-Object { [string]$_.desc }) } }

# ── The 2014 rules: the SRD 5.1 (document srd-2014), shaped like the above where it can be. It writes its
# proficiencies and starting equipment as text ("(a) a mace or (b) a warhammer" on each line), races carry their
# ability bonuses in the trait text, and subraces point at their race.
function Get-Doc($what, $doc) {  # read as UTF-8 bytes: Windows PowerShell guesses wrong on the 2014 text's curly quotes
  $b = (Invoke-WebRequest -UseBasicParsing "$Api/$what/?document__key=$doc&limit=200").RawContentStream.ToArray()
  ([Text.Encoding]::UTF8.GetString($b) | ConvertFrom-Json).results
}
$Q = "[$([char]0x2018)$([char]0x2019)]"
$WORDN = @{ one = 1; two = 2; three = 3; four = 4; five = 5; six = 6 }
function Prof-Lines($t) { $o = @{}; foreach ($l in ([string]$t -split "`n")) { $m = [regex]::Match($l, '\*\*(.+?):\*\*\s*(.*)'); if ($m.Success) { $o[$m.Groups[1].Value.Trim()] = $m.Groups[2].Value.Trim() } }; $o }
function Kit-Lines($t) {  # one entry per line: its lettered choices, or "-" for what's given as it is
  foreach ($l in ([string]$t -split "`n" | Where-Object { $_ -match '^\s*\*\s' })) {
    $l = ($l -replace '^\s*\*\s*', '' -replace '\(\*([a-z])\*\)', '($1)' -replace $Q, "'").Trim()
    $o = [ordered]@{}
    foreach ($m in [regex]::Matches($l, '\(([a-z])\)\s*(.*?)(?=,?\s*(?:or\s*)?\([a-z]\)|$)')) { $o[$m.Groups[1].Value] = $m.Groups[2].Value.Trim().TrimEnd(',').Trim() }
    if (-not $o.Count) { $o["-"] = $l }
    , $o
  }
}
$all14 = Get-Doc "classes" "srd-2014"
$classes14 = foreach ($c in ($all14 | Where-Object { -not $_.subclass_of } | Sort-Object name)) {
  $p = Prof-Lines ($c.features | Where-Object feature_type -eq "PROFICIENCIES").desc
  $sk = [string]$p["Skills"]; $n = [regex]::Match($sk, 'Choose (?:any )?(\w+)')
  $table = [ordered]@{}; foreach ($f in ($c.features | Where-Object { $_.data_for_class_table -and $_.feature_type -notin "PROFICIENCY_BONUS", "SPELL_SLOTS" })) { $table[($f.name -replace '^Cantrips Known$', 'Cantrips')] = Column $f }
  $slots = [ordered]@{}; foreach ($f in ($c.features | Where-Object feature_type -eq "SPELL_SLOTS")) { $slots["$([int]($f.name -replace '\D', ''))"] = Column $f }
  [ordered]@{
    name = $c.name; hd = [int]([string]$c.hit_dice -replace '\D', ''); primary = ""; saves = @(Ab-Keys (($c.saving_throws | ForEach-Object name) -join ", "))
    skills = [ordered]@{ n = $(if ($n.Success) { [int]$WORDN[$n.Groups[1].Value.ToLower()] } else { 0 }); any = ($sk -match 'Choose any'); from = @(Skill-Keys ($sk -replace '^.*?from', '')) }
    weapons = [string]$p["Weapons"]; armor = [string]$p["Armor"]; tools = $(if ($p["Tools"] -match '^None') { "" } else { [string]$p["Tools"] })
    kit = @(Kit-Lines ($c.features | Where-Object feature_type -eq "STARTING_EQUIPMENT").desc); caster = ""
    features = @($c.features | Where-Object { $_.feature_type -eq "CLASS_LEVEL_FEATURE" -and $_.gained_at -and $_.desc } | ForEach-Object { [ordered]@{ name = $_.name; lv = @(Levels $_); desc = ([string]$_.desc -replace $Q, "'") } } | Sort-Object { $_.lv[0] }, name)
    table = $table; slots = $slots
  }
}
$subclasses14 = foreach ($s in ($all14 | Where-Object { $_.subclass_of } | Sort-Object name)) {
  [ordered]@{ name = $s.name; of = $s.subclass_of.name; desc = [string]$s.desc
    features = @($s.features | Where-Object { $_.gained_at } | ForEach-Object { [ordered]@{ name = $_.name; lv = @(Levels $_); desc = ([string]$_.desc -replace $Q, "'") } } | Sort-Object { $_.lv[0] }, name) }
}
$sp14 = Get-Doc "species" "srd-2014"; $keyName = @{}; foreach ($s in $sp14) { $keyName[$s.key] = $s.name }
$races = foreach ($s in ($sp14 | Sort-Object name)) {
  $tr = @($s.traits | ForEach-Object { [ordered]@{ name = $_.name; desc = ([string]$_.desc -replace $Q, "'") } }); $d = { param($n) [string]($tr | Where-Object name -eq $n).desc }
  $asi = & $d "Ability Score Increase"; $bonus = [ordered]@{}
  foreach ($m in [regex]::Matches($asi, '(Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma) score increases by (\d)')) { $bonus[$AB[$m.Groups[1].Value.ToLower()]] = [int]$m.Groups[2].Value }
  if ($asi -match 'ability scores each increase by 1') { foreach ($k in "str", "dex", "con", "int", "wis", "cha") { $bonus[$k] = 1 } }
  $choose = $(if ($asi -match '(\w+) other ability scores of your choice increase by 1') { [int]$WORDN[$Matches[1].ToLower()] } else { 0 })
  $skills = @(foreach ($t in $tr) { $m = [regex]::Match($t.desc, 'proficiency in the (\w+) skill'); if ($m.Success) { Skill-Keys $m.Groups[1].Value } })
  $anyN = 0; foreach ($t in $tr) { $m = [regex]::Match($t.desc, 'proficiency in (\w+) skills of your choice'); if ($m.Success) { $anyN = [int]$WORDN[$m.Groups[1].Value.ToLower()] } }
  [ordered]@{ name = $s.name; of = $(if ($s.subspecies_of) { $keyName[$s.subspecies_of] } else { "" }); desc = [string]$s.desc
    speed = $(if (& $d "Speed") { [int](([regex]::Match((& $d "Speed"), '\d+')).Value) } else { 0 }); size = ([regex]::Match((& $d "Size"), '(?i)your size is (\w+)')).Groups[1].Value
    bonus = $bonus; choose = $choose; skills = $skills; anySkills = $anyN; languages = (& $d "Languages")
    traits = @($tr | Where-Object { $_.name -notin "Ability Score Increase", "Speed", "Size", "Age", "Alignment", "Languages" }) }
}
$backgrounds14 = foreach ($b in (Get-Doc "backgrounds" "srd-2014" | Sort-Object name)) {
  $g = @{}; foreach ($x in $b.benefits) { $g[$x.type] = $x }
  [ordered]@{ name = $b.name; desc = [string]$b.desc; skills = @(Skill-Keys ([string]$g["skill_proficiency"].desc)); tool = [string]$g["tool_proficiency"].desc
    languages = [string]$g["language"].desc; equipment = ([string]$g["equipment"].desc -replace $Q, "'"); feature = [ordered]@{ name = [string]$g["feature"].name; desc = [string]$g["feature"].desc } }
}
$feats14 = foreach ($f in (Get-Doc "feats" "srd-2014" | Sort-Object name)) { [ordered]@{ name = $f.name; type = "General"; prereq = [string]$f.prerequisite
  desc = ((Feat-Text $f) -replace $Q, "'"); benefits = @($f.benefits | ForEach-Object { [string]$_.desc }) } }

$json = [ordered]@{ classes = @($classes); subclasses = @($subclasses); species = @($species); backgrounds = @($backgrounds); feats = @($feats)
  "2014" = [ordered]@{ classes = @($classes14); subclasses = @($subclasses14); species = @($races); backgrounds = @($backgrounds14); feats = @($feats14) } } | ConvertTo-Json -Depth 9 -Compress
$out = "/* rules.js: made by tools\build-rules.ps1 from Open5e's copies of the SRD 5.2 (the 2024 rules) and, under ""2014"", the SRD 5.1 ($(Get-Date -Format 'yyyy-MM-dd')). Don't edit by hand. The credits are in srd.js (SRD_CREDIT) and index.html (SRD51_CREDIT). */`nconst RULES = $json;`n"
[IO.File]::WriteAllText((Join-Path $App "rules.js"), $out, (New-Object Text.UTF8Encoding $false))
# the Field Book's copy of what its background form offers: the feats (the SRD 5.2's, then any only in the SRD 5.1)
# and the SRD's background features, with what each does
$fb = Join-Path (Split-Path $App -Parent) "Field Book"
if (Test-Path $fb) {
  $names = @($feats | ForEach-Object { $_.name })
  $fbFeats = @($feats | Where-Object { $_.type -in "Origin", "General" -and $_.name -ne "Ability Score Improvement" } | ForEach-Object { [ordered]@{ name = $_.name; type = $_.type; desc = $_.desc; srd = "SRD 5.2" } }) +
    @($feats14 | Where-Object { $names -notcontains $_.name } | ForEach-Object { [ordered]@{ name = $_.name; type = "General"; desc = $_.desc; srd = "SRD 5.1" } })
  $fbFeatures = @($backgrounds14 | Where-Object { $_.feature.name } | ForEach-Object { [ordered]@{ name = $_.feature.name; desc = $_.feature.desc; from = "$($_.name) (SRD 5.1)" } })
  $credits = [ordered]@{
    "SRD 5.2" = "This work includes material from the System Reference Document 5.2 (""SRD 5.2"") by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode."
    "SRD 5.1" = "This work includes material taken from the System Reference Document 5.1 (""SRD 5.1"") by Wizards of the Coast LLC and available at https://dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 is licensed under the Creative Commons Attribution 4.0 International License available at https://creativecommons.org/licenses/by/4.0/legalcode." }
  $fj = ([ordered]@{ feats = $fbFeats; features = $fbFeatures; credits = $credits } | ConvertTo-Json -Depth 5 -Compress)
  [IO.File]::WriteAllText((Join-Path $fb "feats.js"), "/* feats.js: made by the Character Book's tools\build-rules.ps1 from Open5e's copies of the SRD 5.2 and SRD 5.1 (Creative Commons Attribution 4.0; credited in the form). Don't edit by hand. */`nconst RULE_PICKS = $fj;`n", (New-Object Text.UTF8Encoding $false))
  "Field Book feats.js: $($fbFeats.Count) feats, $($fbFeatures.Count) background feature(s)"
}
"rules.js: 2024 $(@($classes).Count) classes, $(@($subclasses).Count) subclasses, $(@($species).Count) species, $(@($backgrounds).Count) backgrounds, $(@($feats).Count) feats; 2014 $(@($classes14).Count) classes, $(@($subclasses14).Count) subclasses, $(@($races).Count) races, $(@($backgrounds14).Count) backgrounds, $(@($feats14).Count) feats; $([int]((Get-Item (Join-Path $App 'rules.js')).Length / 1024)) KB"
