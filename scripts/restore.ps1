param(
  [Parameter(Mandatory = $true)][string]$BackupDirectory,
  [string]$MongoUri = $env:MONGODB_URI
)

if ([string]::IsNullOrWhiteSpace($MongoUri)) {
  Write-Error "MONGODB_URI is required."
  exit 1
}

if (-not (Test-Path -LiteralPath $BackupDirectory)) {
  Write-Error "Backup directory not found: $BackupDirectory"
  exit 1
}

mongorestore --uri $MongoUri --drop $BackupDirectory
if ($LASTEXITCODE -ne 0) {
  Write-Error "mongorestore failed."
  exit $LASTEXITCODE
}

Write-Output "Restore completed from $BackupDirectory"
