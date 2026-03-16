param(
    [Parameter(ValueFromRemainingArguments)]
    [string[]]$Words
)

$GROQ_API_KEY = "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"   # <-- eintragen
$GROQ_MODEL   = "llama-3.3-70b-versatile"

function Translate($text) {
    $body = @{
        model    = $GROQ_MODEL
        messages = @(
            @{ role = "system"; content = "Du bist ein Latein-Übersetzer. Übersetze den lateinischen Text ins Deutsche. Antworte NUR mit der Übersetzung, ohne Erklärungen." }
            @{ role = "user";   content = $text.Trim() }
        )
        temperature = 0
    } | ConvertTo-Json -Depth 5

    try {
        $resp = Invoke-RestMethod `
            -Uri "https://api.groq.com/openai/v1/chat/completions" `
            -Method Post `
            -Headers @{ Authorization = "Bearer $GROQ_API_KEY"; "Content-Type" = "application/json" } `
            -Body $body
        return $resp.choices[0].message.content.Trim()
    } catch {
        Write-Host "Fehler: $_" -ForegroundColor Red
        return $null
    }
}

# --- Einmaliger Aufruf: lat "text" ---
if ($Words.Count -gt 0) {
    $input_text = $Words -join " "
    $result = Translate $input_text
    if ($result) { Write-Host $result -ForegroundColor Cyan }
    return
}

# --- Interaktiver Modus ---
Write-Host "Latein-Übersetzer (Groq) — 'exit' zum Beenden" -ForegroundColor Yellow
while ($true) {
    $line = Read-Host "lat"
    if ($line -in "exit","quit","q") { break }
    if ($line.Trim() -eq "") { continue }
    $result = Translate $line
    if ($result) { Write-Host $result -ForegroundColor Cyan }
}
