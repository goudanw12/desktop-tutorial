// Render 自动部署脚本
// 使用方法：
// 1. 登录 Render: https://dashboard.render.com
// 2. 按 F12 打开开发者工具
// 3. 切换到 Console (控制台) 标签
// 4. 复制粘贴以下代码，按回车执行

(async function() {
    'use strict';
    
    // 配置
    const CONFIG = {
        repoName: 'goudanw12/desktop-tutorial',
        serviceName: 'social-app-backend',
        buildCommand: 'npm install && npm run build:server',
        startCommand: 'node api/dist/server.js',
        region: 'singapore'
    };
    
    // 环境变量
    const ENV_VARS = {
        'NODE_ENV': 'production',
        'PORT': '10000',
        'DATABASE_PATH': '/data/social.db',
        'UPLOADS_DIR': '/data/uploads',
        'CORS_ORIGIN': 'https://desktop-tutorial.244628270.workers.dev'
    };
    
    console.log('🚀 Render 自动部署脚本启动...');
    console.log('请确保你已经登录 Render 并打开了 dashboard');
    
    // 检查当前页面
    if (!window.location.href.includes('dashboard.render.com')) {
        alert('请先访问 https://dashboard.render.com 并登录！');
        return;
    }
    
    // 步骤1：点击 New + 按钮
    console.log('步骤 1/5: 点击 New + 按钮...');
    const newButton = document.querySelector('button[data-cy="new-button"], button:contains("New"), a[href*="new"]');
    if (newButton) {
        newButton.click();
        console.log('✅ 已点击 New 按钮');
    } else {
        console.log('⚠️ 未找到 New 按钮，请手动点击');
    }
    
    // 等待并点击 Web Service
    setTimeout(() => {
        console.log('步骤 2/5: 选择 Web Service...');
        const webServiceOption = document.querySelector('a[href*="web-service"], div:contains("Web Service")');
        if (webServiceOption) {
            webServiceOption.click();
            console.log('✅ 已选择 Web Service');
        }
    }, 2000);
    
    // 等待页面加载并填写配置
    setTimeout(() => {
        console.log('步骤 3/5: 填写服务配置...');
        
        // 填写名称
        const nameInput = document.querySelector('input[name="name"], input[placeholder*="name"]');
        if (nameInput) {
            nameInput.value = CONFIG.serviceName;
            nameInput.dispatchEvent(new Event('input', { bubbles: true }));
            console.log('✅ 已填写服务名称');
        }
        
        // 选择区域
        const regionSelect = document.querySelector('select[name="region"]');
        if (regionSelect) {
            regionSelect.value = CONFIG.region;
            regionSelect.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('✅ 已选择区域');
        }
        
        // 填写构建命令
        const buildInput = document.querySelector('input[name="buildCommand"], textarea[name="buildCommand"]');
        if (buildInput) {
            buildInput.value = CONFIG.buildCommand;
            buildInput.dispatchEvent(new Event('input', { bubbles: true }));
            console.log('✅ 已填写构建命令');
        }
        
        // 填写启动命令
        const startInput = document.querySelector('input[name="startCommand"], textarea[name="startCommand"]');
        if (startInput) {
            startInput.value = CONFIG.startCommand;
            startInput.dispatchEvent(new Event('input', { bubbles: true }));
            console.log('✅ 已填写启动命令');
        }
        
    }, 4000);
    
    // 添加环境变量
    setTimeout(() => {
        console.log('步骤 4/5: 添加环境变量...');
        
        // 点击 Environment 标签
        const envTab = document.querySelector('a:contains("Environment"), button:contains("Environment")');
        if (envTab) {
            envTab.click();
            console.log('✅ 已切换到 Environment 标签');
        }
        
        // 添加环境变量
        Object.entries(ENV_VARS).forEach(([key, value], index) => {
            setTimeout(() => {
                const addButton = document.querySelector('button:contains("Add"), button[data-cy="add-env-var"]');
                if (addButton) {
                    addButton.click();
                    
                    setTimeout(() => {
                        const keyInputs = document.querySelectorAll('input[placeholder*="KEY"]');
                        const valueInputs = document.querySelectorAll('input[placeholder*="VALUE"]');
                        
                        if (keyInputs.length > 0 && valueInputs.length > 0) {
                            const lastKeyInput = keyInputs[keyInputs.length - 1];
                            const lastValueInput = valueInputs[valueInputs.length - 1];
                            
                            lastKeyInput.value = key;
                            lastKeyInput.dispatchEvent(new Event('input', { bubbles: true }));
                            
                            lastValueInput.value = value;
                            lastValueInput.dispatchEvent(new Event('input', { bubbles: true }));
                            
                            console.log(`✅ 已添加环境变量: ${key}`);
                        }
                    }, 500);
                }
            }, index * 1000);
        });
        
    }, 6000);
    
    // 最后点击创建
    setTimeout(() => {
        console.log('步骤 5/5: 创建服务...');
        const createButton = document.querySelector('button[type="submit"], button:contains("Create"), button:contains("Deploy")');
        if (createButton) {
            console.log('🎉 准备创建服务！请点击创建按钮完成部署。');
            // 不自动点击，让用户确认
            alert('配置已自动填写完成！请检查无误后点击 "Create Web Service" 按钮。');
        }
    }, 15000);
    
    console.log('⏳ 脚本执行中，请等待...');
    
})();
