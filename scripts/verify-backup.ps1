param(
  [Parameter(Mandatory = $true)][string]$BackupDirectory
)

if (-not (Test-Path -LiteralPath $BackupDirectory)) {
  Write-Error "Backup directory not found: $BackupDirectory"
  exit 1
}

$requiredGridFsCollections = @(
  "resumes.files",
  "resumes.chunks",
  "profileImages.files",
  "profileImages.chunks",
  "contentImages.files",
  "contentImages.chunks",
  "projectImages.files",
  "projectImages.chunks",
  "documents.files",
  "documents.chunks",
  "certificates.files",
  "certificates.chunks",
  "logos.files",
  "logos.chunks"
)

$found = Get-ChildItem -Path $BackupDirectory -Recurse -File | Select-Object -ExpandProperty BaseName
foreach ($collection in $requiredGridFsCollections) {
  if ($found -notcontains $collection) {
    Write-Warning "GridFS collection not found in backup: $collection"
  }
}

Write-Output "Backup verification scan completed."
