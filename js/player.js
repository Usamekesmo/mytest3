// استبدل ملف js/player.js بالكامل بهذا الكود

import { fetchPlayer, savePlayer as savePlayerToApi } from './api.js';

export let playerData = {
    name: '',
    xp: 0,
    diamonds: 0,
    isNew: true,
    // --- إضافة جديدة ---
    dailyQuizzes: {
        count: 0,
        lastPlayedDate: '' // YYYY-MM-DD
    }
};

function getTodayDateString() {
    return new Date().toISOString().split('T')[0];
}

export async function loadPlayer(userName) {
    const fetchedData = await fetchPlayer(userName);

    if (fetchedData === 'error') {
        alert("خطأ في الاتصال بالخادم لجلب بياناتك. يرجى المحاولة مرة أخرى.");
        return false;
    }

    if (fetchedData) {
        playerData = { ...fetchedData, isNew: false };
        // --- إضافة جديدة: إعادة تعيين العداد اليومي إذا كان اليوم جديدًا ---
        const today = getTodayDateString();
        if (!playerData.dailyQuizzes || playerData.dailyQuizzes.lastPlayedDate !== today) {
            playerData.dailyQuizzes = { count: 0, lastPlayedDate: today };
        }
        console.log(`مرحباً بعودتك: ${playerData.name}`);
    } else {
        playerData = {
            name: userName,
            xp: 0,
            diamonds: 0,
            isNew: true,
            dailyQuizzes: { count: 0, lastPlayedDate: getTodayDateString() }
        };
        console.log(`مرحباً بك أيها اللاعب الجديد: ${userName}`);
    }
    return true;
}

export async function savePlayer() {
    const { isNew, ...dataToSave } = playerData;
    await savePlayerToApi(dataToSave);
    console.log("تم إرسال طلب حفظ بيانات اللاعب إلى السحابة.");
}
