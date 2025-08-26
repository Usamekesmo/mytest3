// =============================================================
// ==      النسخة الكاملة والنهائية من ملف player.js         ==
// =============================================================

import { fetchPlayer, savePlayer as savePlayerToApi } from './api.js';

// هذا هو "مصدر الحقيقة" لبيانات اللاعب داخل التطبيق
export let playerData = {
    name: '',
    xp: 0,
    diamonds: 0,
    isNew: true,
    // هذا الكائن تتم إدارته محلياً فقط ولا يتم جلبه من الخادم
    dailyQuizzes: {
        count: 0,
        lastPlayedDate: '' // سيتم تحديثه عند تحميل اللاعب
    }
};

// دالة مساعدة للحصول على تاريخ اليوم بصيغة موحدة
function getTodayDateString() {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * يقوم بتحميل بيانات اللاعب من السحابة.
 */
export async function loadPlayer(userName) {
    const fetchedData = await fetchPlayer(userName);

    if (fetchedData === 'error') {
        alert("خطأ في الاتصال بالخادم لجلب بياناتك. يرجى المحاولة مرة أخرى.");
        return false;
    }

    if (fetchedData) {
        // تم العثور على اللاعب
        // دمج البيانات المحملة (name, xp, diamonds) مع البيانات الافتراضية
        playerData = { ...playerData, ...fetchedData, isNew: false };
        console.log(`مرحباً بعودتك: ${playerData.name}`);
    } else {
        // لاعب جديد
        playerData = {
            name: userName,
            xp: 0,
            diamonds: 0,
            isNew: true,
            dailyQuizzes: { count: 0, lastPlayedDate: '' }
        };
        console.log(`مرحباً بك أيها اللاعب الجديد: ${userName}`);
    }

    // في كلتا الحالتين (لاعب جديد أو قديم)، نتحقق من العداد اليومي
    const today = getTodayDateString();
    if (playerData.dailyQuizzes.lastPlayedDate !== today) {
        // إذا كان اليوم مختلفًا، أعد تعيين العداد
        playerData.dailyQuizzes = { count: 0, lastPlayedDate: today };
        console.log("يوم جديد! تم إعادة تعيين عداد الاختبارات اليومية.");
    }
    
    return true;
}

/**
 * يحفظ بيانات اللاعب الحالية في السحابة.
 */
export async function savePlayer() {
    // لا نرسل كل بيانات اللاعب، فقط ما هو موجود في قاعدة البيانات
    const dataToSave = {
        name: playerData.name,
        xp: playerData.xp,
        diamonds: playerData.diamonds
    };
    
    await savePlayerToApi(dataToSave);
    console.log("تم إرسال طلب حفظ بيانات اللاعب إلى السحابة.");
}
