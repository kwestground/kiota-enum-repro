Get-ChildItem -Path ./src/client -Recurse -Filter *.ts | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace '// @ts-ignore[\r\n]+', ''
    Set-Content $_.FullName $content -NoNewline
}
