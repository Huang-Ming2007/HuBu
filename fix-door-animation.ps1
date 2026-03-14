# 修改殿门动画的PowerShell脚本

$content = Get-Content "d:\trae-learing\户部\src\App.vue" -Raw

# 修改动画时间从2000到2500
$content = $content -replace "2000", "2500"

# 修改动画时间从2s到2.5s
$content = $content -replace "2s ease-in-out", "2.5s cubic-bezier(0.4, 0, 0.2, 1)"

# 修改translateX为rotateY
$content = $content -replace "translateX\(-150%\)", "rotateY(-110deg)"
$content = $content -replace "translateX\(150%\)", "rotateY(110deg)"
$content = $content -replace "translateX\(0\)", "rotateY(0deg)"

# 添加perspective
$content = $content -replace "overflow: hidden;", "overflow: hidden;`n  perspective: 2000px;"

# 修改transform-origin
$content = $content -replace "transition: transform 1.5s ease-in-out;", "transform-style: preserve-3d;"

# 修改门框大小
$content = $content -replace "width: 600px;", "width: 500px;"
$content = $content -replace "height: 800px;", "height: 700px;"
$content = $content -replace "border: 10px solid #8b4513;", "border: 8px solid #8b4513;"

# 修改门框装饰
$content = $content -replace "top: -20px;", "top: -15px;"
$content = $content -replace "left: -20px;", "left: -15px;"
$content = $content -replace "right: -20px;", "right: -15px;"
$content = $content -replace "height: 40px;", "height: 30px;"
$content = $content -replace "border-bottom: 2px solid #ffd700;", "border-bottom: 2px solid #ffd700;`n  border-radius: 4px 4px 0 0;"

# 修改门的样式
$content = $content -replace "background: linear-gradient(135deg, #8b0000 0%, #a52a2a 100%);", "background: linear-gradient(135deg, #8b0000 0%, #a52a2a 50%, #8b0000 100%);"
$content = $content -replace "box-shadow: `n    0 0 50px rgba(255, 215, 0, 0.3),`n    inset 0 0 50px rgba(0, 0, 0, 0.5);", "box-shadow: `n    0 0 40px rgba(0, 0, 0, 0.6),`n    0 0 20px rgba(0, 0, 0, 0.4);"

# 修改门把手
$content = $content -replace "width: 20px;", "width: 16px;"
$content = $content -replace "height: 20px;", "height: 16px;"
$content = $content -replace "background: #ffd700;", "background: radial-gradient(circle, #ffd700 0%, #b8860b 100%);"
$content = $content -replace "box-shadow: 0 0 10px rgba(255, 215, 0, 0.8);", "box-shadow: `n    0 0 8px rgba(255, 215, 0, 0.6),`n    inset 0 2px 4px rgba(255, 255, 255, 0.3);"

# 修改门把手位置
$content = $content -replace "right: 20px;", "right: 15px;"
$content = $content -replace "left: 20px;", "left: 15px;"

# 修改动画关键帧
$content = $content -replace "0% {`n    opacity: 1;`n  }`n  50% {`n    opacity: 1;`n  }", "0% {`n    opacity: 1;`n  }`n  70% {`n    opacity: 1;`n  }"

# 添加transform-origin
$content = $content -replace ".left-door {`n  left: 0;`n  border-right: 1px solid #ffd700;`n}", ".left-door {`n  left: 0;`n  border-right: 1px solid #ffd700;`n  transform-origin: left center;`n}"
$content = $content -replace ".right-door {`n  right: 0;`n  border-left: 1px solid #ffd700;`n}", ".right-door {`n  right: 0;`n  border-left: 1px solid #ffd700;`n  transform-origin: right center;`n}"

Set-Content "d:\trae-learing\户部\src\App.vue" -Value $content -NoNewline
