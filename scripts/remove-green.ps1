param (
    [string]$inputObj,
    [string]$outputObj
)

Add-Type -AssemblyName System.Drawing

function Remove-GreenBackground {
    param (
        [string]$inputFile,
        [string]$outputFile
    )

    $bitmap = [System.Drawing.Bitmap]::FromFile($inputFile)
    # Use a specific color if the green varies, but usually generated solid is close. 
    # Use MakeTransparent. We might need to sample the top-left pixel.
    $color = $bitmap.GetPixel(0, 0)
    
    # Check if top-left is actually green-ish (G > R and G > B) to be safe, otherwise default to Green
    # $color = [System.Drawing.Color]::FromArgb(0, 255, 0) # Hardcoded green if generation is perfect
    
    $bitmap.MakeTransparent($color)
    $bitmap.Save($outputFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $bitmap.Dispose()
    Write-Host "Processed $inputFile -> $outputFile"
}

Remove-GreenBackground -inputFile $inputObj -outputFile $outputObj
