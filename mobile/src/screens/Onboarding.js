import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { UNIVERSITIES } from '../data/places';
import { colors, rtl, shadow } from '../theme';

// University sign-in is simulated here; production would use the university's SSO
export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const [uni, setUni] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(1); }, 1100);
  };

  if (step === 0) {
    return (
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.wrap}>
          <Text style={s.logo}>خفّف</Text>
          <Text style={s.lead}>اعرف زحمة المواقف والمكتبة والكافتيريا قبل ما توصل.</Text>

          <Text style={s.label}>اختر جامعتك</Text>
          {UNIVERSITIES.map((u) => (
            <Pressable key={u.id} onPress={() => setUni(u)} style={[s.option, uni?.id === u.id && s.optionOn]}>
              <Ionicons name={uni?.id === u.id ? 'radio-button-on' : 'radio-button-off'} size={20} color={colors.brand} />
              <Text style={s.optionTxt}>{u.name}</Text>
            </Pressable>
          ))}

          <Pressable disabled={!uni || loading} onPress={login} style={[s.btn, (!uni || loading) && { opacity: 0.45 }]}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>الدخول بحساب الجامعة</Text>}
          </Pressable>
          <Text style={s.small}>نستخدم تسجيل الدخول الموحد لجامعتك، وما نشوف كلمة المرور.</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.wrap}>
        <View style={s.bigIcon}><Ionicons name="location" size={34} color={colors.brand} /></View>
        <Text style={s.h1}>كيف نعرف الزحمة؟</Text>
        <Text style={s.lead}>لما تدخل حدود مكان داخل الحرم، ينحسب وجودك تلقائياً. بدون ما تسوي أي شي.</Text>

        {[
          ['eye-off-outline', 'بدون هوية', 'ما نرسل اسمك ولا رقمك الجامعي، بس "دخل جهاز" و"طلع جهاز".'],
          ['school-outline', 'داخل الحرم فقط', 'برا حدود الجامعة ما نستخدم موقعك أبداً.'],
          ['notifications-outline', 'ضغطة وحدة', 'أحياناً نسألك "كيف الزحمة؟" وتجاوب من الإشعار.'],
        ].map(([icon, t, d]) => (
          <View key={t} style={s.point}>
            <Ionicons name={icon} size={22} color={colors.brand} />
            <View style={{ flex: 1 }}>
              <Text style={s.pointT}>{t}</Text>
              <Text style={s.pointD}>{d}</Text>
            </View>
          </View>
        ))}

        <Pressable onPress={() => onDone({ university: uni })} style={s.btn}>
          <Text style={s.btnTxt}>أوافق وأفعّل الموقع</Text>
        </Pressable>
        <Text style={s.small}>تقدر توقف المشاركة متى ما تبي من صفحة حسابي.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  wrap: { padding: 24, paddingTop: 50 },
  logo: { ...rtl, fontSize: 46, fontWeight: '800', color: colors.brand },
  h1: { ...rtl, fontSize: 26, fontWeight: '800', color: colors.ink, marginTop: 14 },
  lead: { ...rtl, fontSize: 16, color: colors.muted, marginTop: 6, marginBottom: 26, lineHeight: 25 },
  label: { ...rtl, fontSize: 14, fontWeight: '700', color: colors.ink, marginBottom: 10 },
  option: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderRadius: 14, padding: 15, marginBottom: 10, borderWidth: 2, borderColor: 'transparent' },
  optionOn: { borderColor: colors.brand },
  optionTxt: { fontSize: 15, color: colors.ink, fontWeight: '600' },
  btn: { backgroundColor: colors.brand, borderRadius: 15, paddingVertical: 16, alignItems: 'center', marginTop: 18, ...shadow },
  btnTxt: { color: '#fff', fontWeight: '800', fontSize: 16 },
  small: { fontSize: 12.5, color: colors.muted, textAlign: 'center', marginTop: 12 },
  bigIcon: { width: 68, height: 68, borderRadius: 22, backgroundColor: colors.brandSoft, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },
  point: { flexDirection: 'row-reverse', gap: 12, backgroundColor: colors.card, borderRadius: 14, padding: 14, marginBottom: 10 },
  pointT: { ...rtl, fontWeight: '700', color: colors.ink, fontSize: 15 },
  pointD: { ...rtl, color: colors.muted, fontSize: 13.5, marginTop: 2, lineHeight: 20 },
});
