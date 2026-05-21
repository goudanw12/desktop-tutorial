@echo off
chcp 65001 >nul
echo ========================================
echo   剪映自动剪辑软件 - 一键安装运行
echo ========================================
echo.

REM 检查 .NET SDK
dotnet --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 .NET SDK
    echo 请先安装 .NET 8 SDK：https://dotnet.microsoft.com/download/dotnet/8.0
    echo.
    echo 安装完成后，重新运行此脚本
    pause
    exit /b 1
)

echo [✓] 检测到 .NET SDK
echo.

REM 获取脚本所在目录
set "PROJECT_DIR=%~dp0JianyingAutoClipper"

REM 检查项目目录
if not exist "%PROJECT_DIR%" (
    echo [错误] 未找到项目目录
    echo 请确保此脚本放在正确的位置
    echo 期望目录: %PROJECT_DIR%
    pause
    exit /b 1
)

echo [✓] 项目目录已找到
echo.

REM 进入项目目录
cd /d "%PROJECT_DIR%"
echo 当前目录: %CD%
echo.

REM 恢复依赖
echo ========================================
echo 正在恢复依赖包...
echo ========================================
dotnet restore
if %errorlevel% neq 0 (
    echo [错误] 依赖恢复失败
    pause
    exit /b 1
)
echo.

REM 构建项目
echo ========================================
echo 正在构建项目...
echo ========================================
dotnet build
if %errorlevel% neq 0 (
    echo [错误] 项目构建失败
    pause
    exit /b 1
)
echo.

REM 运行应用
echo ========================================
echo 正在启动应用...
echo ========================================
dotnet run --project src\JianyingAutoClipper.App

pause
