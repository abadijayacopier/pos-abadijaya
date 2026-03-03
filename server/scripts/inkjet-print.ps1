param(
    [string]$PrinterName,
    [string]$FilePath,
    [string]$PaperSize = "A4"
)

# Baca konten file
$content = Get-Content -Path $FilePath -Raw -Encoding UTF8

# Map paper size string ke System.Drawing.Printing.PaperKind
Add-Type -AssemblyName System.Drawing

$paperKindMap = @{
    "A4"    = [System.Drawing.Printing.PaperKind]::A4
    "A5"    = [System.Drawing.Printing.PaperKind]::A5
    "Folio" = [System.Drawing.Printing.PaperKind]::Folio
    "Letter" = [System.Drawing.Printing.PaperKind]::Letter
}

$selectedPaperKind = if ($paperKindMap.ContainsKey($PaperSize)) { $paperKindMap[$PaperSize] } else { [System.Drawing.Printing.PaperKind]::A4 }

# Setup PrintDocument
$printDoc = New-Object System.Drawing.Printing.PrintDocument
$printDoc.PrinterSettings.PrinterName = $PrinterName

# Cari dan set paper size
foreach ($ps in $printDoc.PrinterSettings.PaperSizes) {
    if ($ps.Kind -eq $selectedPaperKind) {
        $printDoc.DefaultPageSettings.PaperSize = $ps
        break
    }
}

# Margins: 15mm semua sisi (dalam 1/100 inch)
$printDoc.DefaultPageSettings.Margins = New-Object System.Drawing.Printing.Margins(59, 59, 59, 59)

# Split content menjadi lines
$lines = $content -split "`n"
$lineIndex = 0

# Font Courier New 10pt (mirip dot matrix)
$font = New-Object System.Drawing.Font("Courier New", 10, [System.Drawing.FontStyle]::Regular)
$brush = [System.Drawing.Brushes]::Black

# Event handler PrintPage
$printPageHandler = {
    param($sender, $e)

    $g = $e.Graphics
    $bounds = $e.MarginBounds
    $lineHeight = $font.GetHeight($g)
    $yPos = $bounds.Top

    while ($script:lineIndex -lt $script:lines.Count) {
        if ($yPos + $lineHeight -gt $bounds.Bottom) {
            $e.HasMorePages = $true
            return
        }

        $line = $script:lines[$script:lineIndex]
        $g.DrawString($line, $script:font, $script:brush, $bounds.Left, $yPos)
        $yPos += $lineHeight
        $script:lineIndex++
    }

    $e.HasMorePages = $false
}

$printDoc.add_PrintPage($printPageHandler)

try {
    $printDoc.Print()
    Write-Output "OK"
} catch {
    Write-Error "Print failed: $_"
    exit 1
} finally {
    $font.Dispose()
    $printDoc.Dispose()
}
