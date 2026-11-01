# Builds srd.js: the SRD 5.2 spells and items the pickers offer, lifted from Ordinate Survey's own SRD data
# (Documents\DnD\My campaign\Tools\srd\srd-data.js) so both apps say the same things. Creatures are left out.
#
# Run it after the survey's SRD data changes:   powershell -NoProfile -ExecutionPolicy Bypass -File tools\build-srd.ps1
param([string]$From)
$ErrorActionPreference = "Stop"
$App = Split-Path $PSScriptRoot -Parent
if (-not $From) { $From = Join-Path (Split-Path $App -Parent) "DnD\My campaign\Tools\srd\srd-data.js" }
$lines = Get-Content $From -Encoding UTF8
$srd = ($lines | Where-Object { $_ -like 'const SRD = *' }).Substring(12).TrimEnd(';') | ConvertFrom-Json
$credit = $lines | Where-Object { $_ -like 'const SRD_CREDIT = *' }
if (-not $credit) { throw "no SRD_CREDIT in $From" }
$keepSpell = "id","name","lv","school","time","range","comp","dur","conc","rit","cls","save","atk","dmg","dtype","desc","hi"
$keepItem = "id","name","kind","cat","rarity","att","value","wt","desc"
$spells = @($srd.spells | Select-Object $keepSpell)
$loot = @($srd.loot | Select-Object $keepItem)
$json = [ordered]@{ spells = $spells; loot = $loot } | ConvertTo-Json -Depth 4 -Compress
$out = "/* srd.js: made by tools\build-srd.ps1 from Ordinate Survey's SRD data ($(Get-Date -Format 'yyyy-MM-dd')). Don't edit by hand. */`nconst SRD = $json;`n$credit`n"
[IO.File]::WriteAllText((Join-Path $App "srd.js"), $out, (New-Object Text.UTF8Encoding $false))
"srd.js: $($spells.Count) spells, $($loot.Count) items, $([int]((Get-Item (Join-Path $App 'srd.js')).Length / 1024)) KB"
