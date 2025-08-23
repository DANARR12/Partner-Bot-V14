# Discord Kurdish AI Bot - Auto-Restart Script
# PowerShell version for Windows

$ErrorActionPreference = "Continue"
$LogFile = "bot_restarts.log"
$MaxRestarts = 50
$RestartCount = 0
$StartTime = Get-Date

Write-Host "🤖 Discord Kurdish AI Bot - Auto-Restart Manager" -ForegroundColor Green
Write-Host "📅 Started at: $StartTime" -ForegroundColor Cyan
Write-Host "📝 Logs will be written to: $LogFile" -ForegroundColor Yellow
Write-Host "🔄 Maximum restarts: $MaxRestarts" -ForegroundColor Yellow
Write-Host "⏹️  Press Ctrl+C to stop the bot permanently" -ForegroundColor Red
Write-Host ""

# Create log file with header
"=== Discord Kurdish AI Bot Restart Log ===" | Out-File -FilePath $LogFile -Append
"Started at: $StartTime" | Out-File -FilePath $LogFile -Append
"" | Out-File -FilePath $LogFile -Append

while ($RestartCount -lt $MaxRestarts) {
    $RestartCount++
    $CurrentTime = Get-Date
    
    Write-Host "🚀 Starting bot (Attempt #$RestartCount) at $CurrentTime" -ForegroundColor Green
    "[$CurrentTime] Starting bot (Attempt #$RestartCount)" | Out-File -FilePath $LogFile -Append
    
    try {
        # Start the bot process
        $process = Start-Process -FilePath "python" -ArgumentList "main.py" -Wait -PassThru -NoNewWindow
        
        $ExitTime = Get-Date
        $ExitCode = $process.ExitCode
        
        if ($ExitCode -eq 0) {
            Write-Host "✅ Bot exited gracefully (Exit Code: $ExitCode)" -ForegroundColor Green
            "[$ExitTime] Bot exited gracefully (Exit Code: $ExitCode)" | Out-File -FilePath $LogFile -Append
            Write-Host "🛑 Stopping auto-restart due to graceful exit" -ForegroundColor Yellow
            break
        } else {
            Write-Host "❌ Bot crashed with exit code: $ExitCode" -ForegroundColor Red
            "[$ExitTime] Bot crashed with exit code: $ExitCode" | Out-File -FilePath $LogFile -Append
        }
        
    } catch {
        $ErrorTime = Get-Date
        Write-Host "💥 Failed to start bot: $($_.Exception.Message)" -ForegroundColor Red
        "[$ErrorTime] Failed to start bot: $($_.Exception.Message)" | Out-File -FilePath $LogFile -Append
    }
    
    if ($RestartCount -lt $MaxRestarts) {
        Write-Host "⏳ Waiting 5 seconds before restart..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
}

if ($RestartCount -ge $MaxRestarts) {
    $EndTime = Get-Date
    Write-Host "🛑 Maximum restart limit ($MaxRestarts) reached. Stopping." -ForegroundColor Red
    "[$EndTime] Maximum restart limit reached. Stopping." | Out-File -FilePath $LogFile -Append
}

Write-Host "📊 Total runtime: $((Get-Date) - $StartTime)" -ForegroundColor Cyan
Write-Host "📁 Check $LogFile for detailed logs" -ForegroundColor Yellow
Write-Host "👋 Bot manager exiting..." -ForegroundColor Gray