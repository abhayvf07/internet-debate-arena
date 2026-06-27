$status = git status --porcelain
foreach ($line in $status) {
    if ($line.Trim() -match "^(M|A|D|\?\?|\sM)\s+(.+)$") {
        $file = $matches[2].Trim()
        if ($file.StartsWith('"') -and $file.EndsWith('"')) {
            $file = $file.Substring(1, $file.Length - 2)
        }
        Write-Host "Committing $file..."
        git add "`"$file`""
        git commit -m "Refactor and fix: Update $file"
    }
}
Write-Host "Pushing to GitHub..."
git push
