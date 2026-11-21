// جسر الأبلكيشن: دخول جوجل من الموبايل نفسه، وزرار الرجوع.
// الصفحة نفسها (index.html) بتشوف window.MizanNative موجود ولا لأ وتتصرف على أساسه.
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

window.MizanNative = {
  isNative: () => Capacitor.isNativePlatform(),

  // شاشة اختيار الحساب بتاعة أندرويد نفسها، مش نافذة منبثقة في متصفح.
  // skipNativeAuth مفعّل، يعني البلجن بيرجّع التوكن بس والـ JS SDK هو اللي بيسجّل الدخول،
  // فحالة الدخول بتفضل في نفس المكان اللي الموقع بيقراه منه.
  googleIdToken: async () => {
    const r = await FirebaseAuthentication.signInWithGoogle();
    return r && r.credential ? r.credential.idToken : null;
  },

  signOut: () => FirebaseAuthentication.signOut().catch(() => {}),
  exitApp: () => App.exitApp(),
};

// زرار الرجوع: لو الصفحة قافلة نافذة أو رجعت تبويب، سيبها؛ غير كده اخرج.
App.addListener('backButton', () => {
  if (!window.MizanBack || !window.MizanBack()) App.exitApp();
});
