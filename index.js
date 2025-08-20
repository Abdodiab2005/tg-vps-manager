require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const { exec } = require("child_process");
const os = require("os");

// إعدادات البوت
const TOKEN = process.env.TOKEN;
const AUTHORIZED_CHAT_ID = process.env.AUTHORIZED_CHAT_ID;

// إنشاء البوت
const bot = new TelegramBot(TOKEN, { polling: true });

// التحقق من الصلاحية
function isAuthorized(chatId) {
  return chatId.toString() === AUTHORIZED_CHAT_ID.toString();
}

// تنسيق الذاكرة بالجيجابايت
function formatMemory(bytes) {
  return (bytes / 1024 / 1024 / 1024).toFixed(2) + " GB";
}

// الحصول على معلومات القرص الصلب
function getDiskUsage() {
  return new Promise((resolve, reject) => {
    exec("df -h /", (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }
      const lines = stdout.split("\n");
      const diskInfo = lines[1].split(/\s+/);
      resolve({
        total: diskInfo[1],
        used: diskInfo[2],
        available: diskInfo[3],
        percentage: diskInfo[4],
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
    diskInfo = { error: "غير متوفر" };
  }

  return {
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    uptime: Math.floor(os.uptime() / 3600) + " ساعة",
    cpuCount: cpus.length,
    cpuModel: cpus[0].model,
    totalMemory: formatMemory(totalMemory),
    usedMemory: formatMemory(usedMemory),
    freeMemory: formatMemory(freeMemory),
    memoryUsage: ((usedMemory / totalMemory) * 100).toFixed(2) + "%",
    loadAverage: {
      "1min": loadAvg[0].toFixed(2),
      "5min": loadAvg[1].toFixed(2),
      "15min": loadAvg[2].toFixed(2),
    },
    disk: diskInfo,
    networkInterfaces: Object.keys(networkInterfaces),
  };
}

// أمر البداية
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  if (!isAuthorized(chatId)) {
    bot.sendMessage(chatId, "❌ غير مسموح لك باستخدام هذا البوت");
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
    bot.sendMessage(chatId, "❌ غير مسموح لك باستخدام هذا البوت");
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
📊 دقيقة واحدة: \`${systemInfo.loadAverage["1min"]}\`
📊 5 دقائق: \`${systemInfo.loadAverage["5min"]}\`
📊 15 دقيقة: \`${systemInfo.loadAverage["15min"]}\`

*التخزين:*
💾 المساحة الكلية: \`${systemInfo.disk.total || "غير متوفر"}\`
📊 المستخدمة: \`${systemInfo.disk.used || "غير متوفر"}\`
🆓 المتاحة: \`${systemInfo.disk.available || "غير متوفر"}\`
📈 نسبة الاستخدام: \`${systemInfo.disk.percentage || "غير متوفر"}\`

*الشبكة:*
🌐 الواجهات المتاحة: \`${systemInfo.networkInterfaces.join(", ")}\`
        `;

    bot.sendMessage(chatId, statusMessage, { parse_mode: "Markdown" });
  } catch (error) {
    bot.sendMessage(chatId, `❌ خطأ في جلب معلومات النظام: ${error.message}`);
  }
});

// تشغيل أوامر Linux
bot.onText(/\/run (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const command = match[1];

  if (!isAuthorized(chatId)) {
    bot.sendMessage(chatId, "❌ غير مسموح لك باستخدام هذا البوت");
    return;
  }

  bot.sendMessage(chatId, `🔄 تنفيذ الأمر: \`${command}\``, {
    parse_mode: "Markdown",
  });

  exec(command, (error, stdout, stderr) => {
    if (error) {
      bot.sendMessage(
        chatId,
        `❌ خطأ في تنفيذ الأمر:\n\`\`\`\n${error.message}\n\`\`\``,
        { parse_mode: "Markdown" }
      );
      return;
    }

    if (stderr) {
      bot.sendMessage(chatId, `⚠️ stderr:\n\`\`\`\n${stderr}\n\`\`\``, {
        parse_mode: "Markdown",
      });
    }

    if (stdout) {
      // تقسيم الرد إذا كان طويلاً
      const maxLength = 4000;
      if (stdout.length > maxLength) {
        const chunks = stdout.match(new RegExp(`.{1,${maxLength}}`, "g"));
        chunks.forEach((chunk, index) => {
          bot.sendMessage(
            chatId,
            `📄 الجزء ${index + 1}:\n\`\`\`\n${chunk}\n\`\`\``,
            { parse_mode: "Markdown" }
          );
        });
      } else {
        bot.sendMessage(chatId, `✅ نتيجة الأمر:\n\`\`\`\n${stdout}\n\`\`\``, {
          parse_mode: "Markdown",
        });
      }
    } else {
      bot.sendMessage(chatId, "✅ تم تنفيذ الأمر بنجاح (بدون مخرجات)");
    }
  });
});

// إعادة تشغيل النظام
bot.onText(/\/restart/, (msg) => {
  const chatId = msg.chat.id;

  if (!isAuthorized(chatId)) {
    bot.sendMessage(chatId, "❌ غير مسموح لك باستخدام هذا البوت");
    return;
  }

  bot.sendMessage(chatId, "🔄 جاري إعادة تشغيل النظام...");

  setTimeout(() => {
    exec("sudo reboot", (error) => {
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
    bot.sendMessage(chatId, "❌ غير مسموح لك باستخدام هذا البوت");
    return;
  }

  exec("ps aux --sort=-%cpu | head -10", (error, stdout, stderr) => {
    if (error) {
      bot.sendMessage(chatId, `❌ خطأ: ${error.message}`);
      return;
    }

    bot.sendMessage(
      chatId,
      `💻 العمليات الأكثر استهلاكاً للمعالج:\n\`\`\`\n${stdout}\n\`\`\``,
      { parse_mode: "Markdown" }
    );
  });
});

// معلومات الشبكة
bot.onText(/\/network/, (msg) => {
  const chatId = msg.chat.id;

  if (!isAuthorized(chatId)) {
    bot.sendMessage(chatId, "❌ غير مسموح لك باستخدام هذا البوت");
    return;
  }

  exec("ifconfig", (error, stdout, stderr) => {
    if (error) {
      exec("ip addr show", (error2, stdout2) => {
        if (error2) {
          bot.sendMessage(chatId, `❌ خطأ: ${error2.message}`);
        } else {
          bot.sendMessage(
            chatId,
            `🌐 معلومات الشبكة:\n\`\`\`\n${stdout2}\n\`\`\``,
            { parse_mode: "Markdown" }
          );
        }
      });
    } else {
      bot.sendMessage(chatId, `🌐 معلومات الشبكة:\n\`\`\`\n${stdout}\n\`\`\``, {
        parse_mode: "Markdown",
      });
    }
  });
});

// معلومات القرص
bot.onText(/\/disk/, (msg) => {
  const chatId = msg.chat.id;

  if (!isAuthorized(chatId)) {
    bot.sendMessage(chatId, "❌ غير مسموح لك باستخدام هذا البوت");
    return;
  }

  exec("df -h", (error, stdout, stderr) => {
    if (error) {
      bot.sendMessage(chatId, `❌ خطأ: ${error.message}`);
      return;
    }

    bot.sendMessage(chatId, `💾 معلومات التخزين:\n\`\`\`\n${stdout}\n\`\`\``, {
      parse_mode: "Markdown",
    });
  });
});

// عرض السجلات
bot.onText(/\/logs/, (msg) => {
  const chatId = msg.chat.id;

  if (!isAuthorized(chatId)) {
    bot.sendMessage(chatId, "❌ غير مسموح لك باستخدام هذا البوت");
    return;
  }

  exec("tail -50 /var/log/syslog", (error, stdout, stderr) => {
    if (error) {
      exec("journalctl -n 50", (error2, stdout2) => {
        if (error2) {
          bot.sendMessage(chatId, `❌ خطأ في قراءة السجلات: ${error2.message}`);
        } else {
          bot.sendMessage(
            chatId,
            `📋 آخر السجلات:\n\`\`\`\n${stdout2}\n\`\`\``,
            { parse_mode: "Markdown" }
          );
        }
      });
    } else {
      bot.sendMessage(chatId, `📋 آخر السجلات:\n\`\`\`\n${stdout}\n\`\`\``, {
        parse_mode: "Markdown",
      });
    }
  });
});

// معالجة الأخطاء
bot.on("polling_error", (error) => {
  console.log(`Polling error: ${error.message}`);
});

bot.on("error", (error) => {
  console.log(`Bot error: ${error.message}`);
});

console.log("🤖 تم تشغيل بوت إدارة VPS بنجاح!");
console.log(`📱 Chat ID المسموح: ${AUTHORIZED_CHAT_ID}`);
