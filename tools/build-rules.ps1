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
$feats = foreach ($f in ((Get-All "feats") | Sort-Object name)) { [ordered]@{ name = $f.name; type = [string]$f.type; prereq = [string]$f.prerequisite; desc = [string]$f.desc
  benefits = @($f.benefits | ForEach-Object { [string]$_.desc }) } }

$json = [ordered]@{ classes = @($classes); subclasses = @($subclasses); species = @($species); backgrounds = @($backgrounds); feats = @($feats) } | ConvertTo-Json -Depth 8 -Compress
$out = "/* rules.js: made by tools\build-rules.ps1 from Open5e's copy of the SRD 5.2 ($(Get-Date -Format 'yyyy-MM-dd')). Don't edit by hand. The SRD's credit is in srd.js (SRD_CREDIT). */`nconst RULES = $json;`n"
[IO.File]::WriteAllText((Join-Path $App "rules.js"), $out, (New-Object Text.UTF8Encoding $false))
"rules.js: $(@($classes).Count) classes, $(@($subclasses).Count) subclasses, $(@($species).Count) species, $(@($backgrounds).Count) backgrounds, $(@($feats).Count) feats, $([int]((Get-Item (Join-Path $App 'rules.js')).Length / 1024)) KB"
