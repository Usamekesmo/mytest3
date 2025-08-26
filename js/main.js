// js/main.js

import * as ui from './ui.js';
import { fetchPageData } from './api.js';
import * as quiz from './quiz.js';
import * as player from './player.js';
import * as progression from './progression.js';

/**
 * =================================================================
 * الملف الرئيسي للتطبيق (Main Entry Point)
 * =================================================================
 */

// --- 1. دالة التهيئة الرئيسية ---

async function initialize() {
    console.log("التطبيق قيد التشغيل...");
    
    // انتظار جلب كل الإعدادات من لوحة التحكم قبل المتابعة
    await Promise.all([
        quiz.initializeQuiz(),
        progression.initializeProgression()
    ]);

    // --- إضافة جديدة: تطبيق قواعد اللعبة على الواجهة ---
    // بعد جلب الإعدادات، نطبق القيود على الواجهة مباشرة
    const rules = progression.getGameRules();
    if (rules) {
        ui.applyGameRules(rules);
    }

    console.log("تم جلب جميع الإعدادات وتطبيق القواعد. التطبيق جاهز.");
    
    // ربط أحداث المستخدم بالدوال المناسبة
    setupEventListeners();
    
    // إظهار الشاشة الرئيسية
    ui.showScreen(ui.startScreen);
}

// --- 2. ربط الأحداث (Event Listeners) ---

function setupEventListeners() {
    // ربط حدث النقر على زر "ابدأ الاختبار"
    ui.startButton.addEventListener('click', onStartButtonClick);
    
    // ربط زر "العودة إلى القائمة الرئيسية" في شاشة النتائج
    ui.reloadButton.addEventListener('click', () => location.reload());
}

/**
 * يتم تشغيل هذه الدالة عند النقر على زر "ابدأ الاختبار".
 * تم دمج منطق تسجيل الدخول وبدء الاختبار هنا.
 */
async function onStartButtonClick() {
    // --- الخطوة 1: التحقق من الاسم وتحميل بيانات اللاعب ---
    const userName = ui.userNameInput.value.trim();
    if (!userName) {
        alert('الرجاء إدخال اسمك أولاً.');
        return;
    }

    // إذا لم يتم تحميل بيانات اللاعب بعد (أي أن حقل الاسم لا يزال مفعّلاً)
    if (ui.userNameInput.disabled === false) {
        ui.toggleLoader(true);
        const playerLoaded = await player.loadPlayer(userName);
        ui.toggleLoader(false);

        if (!playerLoaded) {
            // فشل تحميل اللاعب (بسبب مشكلة في الشبكة على الأرجح)
            return; 
        }

        // عرض معلومات اللاعب وتعطيل حقل الاسم
        const levelInfo = progression.getLevelInfo(player.playerData.xp);
        ui.updatePlayerDisplay(player.playerData, levelInfo);
        ui.userNameInput.disabled = true;
        
        alert(`مرحباً بك ${userName}! تم تحميل تقدمك. الآن اختر صفحة وابدأ الاختبار.`);
        return; // نعود هنا لنعطي المستخدم فرصة لاختيار الصفحة
    }

    // --- الخطوة 2: التحقق من إعدادات الاختبار وبدءه ---
    const pageNumber = ui.pageNumberInput.value;
    const rules = progression.getGameRules();
    const allowedPages = String(rules.allowedPages || '').split(',').map(p => p.trim());

    // **التحقق الجديد من الصفحة المدخلة بناءً على القواعد**
    if (!pageNumber || !allowedPages.includes(pageNumber)) {
        alert(`الرجاء إدخال رقم صفحة مسموح به فقط: ${allowedPages.join(', ')}`);
        return;
    }

    // **الحصول على عدد الأسئلة من القواعد بدلاً من الواجهة**
    const questionsCount = rules.questionsCount || 5; // استخدام 5 كقيمة افتراضية

    ui.toggleLoader(true);
    const ayahs = await fetchPageData(pageNumber);
    ui.toggleLoader(false);

    if (ayahs) {
        // بدء الاختبار بالإعدادات التي تم التحقق منها
        quiz.start({
            pageAyahs: ayahs,
            totalQuestions: questionsCount,
            selectedQari: ui.qariSelect.value,
            userName: player.playerData.name,
            pageNumber: pageNumber
        });
    }
}

// --- 3. تشغيل التطبيق ---
initialize();
