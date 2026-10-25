import React from 'react';
import { ScrollView, Text, View, Switch, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, rtl, shadow } from '../theme';

export default function ProfileScreen({ user, demoMode, setDemoMode, sharing, setSharing, liveReady, liveMode, setLiveMode, live, onLogout }) {
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.wrap}>
        <Text style={s.h1}>حسابي</Text>

        <View style={s.card}>
          <View style={s.row}>
            <View style={s.avatar}><Ionicons name="school" size={22} color={colors.brand} /></View>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>طالب</Text>
              <Text style={s.meta}>{user.university.name}</Text>
            </View>
          </View>
        </View>

        <View style={s.card}>
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>المشاركة في حساب الزحمة</Text>
              <Text style={s.meta}>ينحسب وجودك داخل الحرم بدون هوية</Text>
            </View>
            <Switch value={sharing} onValueChange={setSharing} trackColor={{ true: colors.brand }} />
          </View>
          <View style={s.sep} />
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>وضع التجربة</Text>
              <Text style={s.meta}>تتحرك بالضغط على الخريطة بدل GPS — للعرض والتصوير</Text>
            </View>
            <Switch value={demoMode} onValueChange={setDemoMode} trackColor={{ true: colors.mid }} />
          </View>
          <View style={s.sep} />
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>بيانات حقيقية من الأجهزة</Text>
              <Text style={s.meta}>
                {!liveReady ? 'غير مربوط — حطوا رابط Supabase في src/services/api.js'
                  : live.ok ? `متصل · ${live.devices} ${live.devices === 1 ? 'جهاز' : 'أجهزة'} داخل الأماكن الحين`
                  : 'جاري الاتصال…'}
              </Text>
            </View>
            <Switch value={liveReady && liveMode} disabled={!liveReady} onValueChange={setLiveMode} trackColor={{ true: colors.me }} />
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.title}>خصوصيتك</Text>
          {[
            'ما نرسل اسمك ولا رقمك الجامعي.',
            'نستخدم الموقع داخل حدود الحرم فقط.',
            'نحفظ أعداد مجمّعة، مو مسار تحركاتك.',
            'متوافق مع نظام حماية البيانات الشخصية.',
          ].map((t) => (
            <View key={t} style={s.li}>
              <Ionicons name="checkmark-circle" size={18} color={colors.low} />
              <Text style={s.liTxt}>{t}</Text>
            </View>
          ))}
        </View>

        <Pressable onPress={onLogout} style={s.logout}>
          <Text style={s.logoutTxt}>تسجيل الخروج</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  wrap: { padding: 16, paddingBottom: 30 },
  h1: { ...rtl, fontSize: 26, fontWeight: '800', color: colors.ink, marginBottom: 14 },
  card: { backgroundColor: colors.card, borderRadius: 18, padding: 16, marginBottom: 12, ...shadow },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 16, backgroundColor: colors.brandSoft, alignItems: 'center', justifyContent: 'center' },
  title: { ...rtl, fontSize: 15.5, fontWeight: '700', color: colors.ink },
  meta: { ...rtl, fontSize: 13, color: colors.muted, marginTop: 2 },
  sep: { height: 1, backgroundColor: colors.bg, marginVertical: 14 },
  li: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginTop: 10 },
  liTxt: { ...rtl, color: colors.ink, fontSize: 14, flex: 1 },
  logout: { alignItems: 'center', padding: 14 },
  logoutTxt: { color: colors.high, fontWeight: '700' },
});
