import React, { useState } from 'react';
import { ScrollView, Text, View, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FORECAST_START_HOUR } from '../data/places';
import { colors, rtl, shadow, levelOfPct, formatHour } from '../theme';

export default function ForecastScreen({ places }) {
  const [selected, setSelected] = useState(places[0].id);
  const place = places.find((p) => p.id === selected);
  const nowHour = new Date().getHours();

  const hours = place.profile.map((v, i) => ({ h: FORECAST_START_HOUR + i, v }));
  const peak = hours.reduce((a, b) => (b.v > a.v ? b : a));
  const calmNext = hours.find((x) => x.h > nowHour && x.v < 55);
  const calmDay = hours.filter((x) => x.h >= 8 && x.h <= 15).reduce((a, b) => (b.v < a.v ? b : a));

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.wrap}>
        <Text style={s.h1}>التوقعات</Text>
        <Text style={s.sub}>مبنية على الجدول الدراسي وبيانات الأسابيع الماضية</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
          {places.map((p) => (
            <Pressable key={p.id} onPress={() => setSelected(p.id)} style={[s.chip, selected === p.id && s.chipOn]}>
              <Text style={[s.chipTxt, selected === p.id && { color: '#fff' }]}>{p.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={s.card}>
          <Text style={s.cardTitle}>الزحمة المتوقعة اليوم</Text>
          <View style={s.chart}>
            {hours.map(({ h, v }) => {
              const lv = levelOfPct(v);
              const now = h === nowHour;
              return (
                <View key={h} style={s.col}>
                  <View style={[s.bar, { height: `${v}%`, backgroundColor: colors[lv], opacity: now ? 1 : 0.4 }]} />
                  <Text style={[s.hr, now && s.hrNow]}>{h > 12 ? h - 12 : h}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={s.stats}>
          <View style={s.stat}>
            <Text style={s.statSmall}>يخف المكان</Text>
            <Text style={s.statBig}>{calmNext ? formatHour(calmNext.h) : 'مو اليوم'}</Text>
          </View>
          <View style={s.stat}>
            <Text style={s.statSmall}>وقت الذروة</Text>
            <Text style={s.statBig}>{formatHour(peak.h)}</Text>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>نصيحة</Text>
          <Text style={s.tipTxt}>أهدأ وقت خلال الدوام في {place.name} الساعة {formatHour(calmDay.h)}. تجنب الساعة {formatHour(peak.h)} إذا تقدر.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  wrap: { padding: 16, paddingBottom: 30 },
  h1: { ...rtl, fontSize: 26, fontWeight: '800', color: colors.ink },
  sub: { ...rtl, color: colors.muted, fontSize: 13.5, marginBottom: 14 },
  chips: { gap: 8, paddingBottom: 12 },
  chip: { backgroundColor: colors.card, borderRadius: 99, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: colors.line },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipTxt: { color: colors.ink, fontWeight: '600', fontSize: 13.5 },
  card: { backgroundColor: colors.card, borderRadius: 18, padding: 16, marginBottom: 12, ...shadow },
  cardTitle: { ...rtl, fontSize: 15, fontWeight: '800', color: colors.ink, marginBottom: 10 },
  chart: { flexDirection: 'row-reverse', alignItems: 'flex-end', height: 170, gap: 4 },
  col: { flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center' },
  bar: { width: '100%', borderTopLeftRadius: 6, borderTopRightRadius: 6, borderRadius: 3, minHeight: 4 },
  hr: { fontSize: 10.5, color: colors.muted, marginTop: 4 },
  hrNow: { color: colors.ink, fontWeight: '800' },
  stats: { flexDirection: 'row-reverse', gap: 10, marginBottom: 12 },
  stat: { flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 14, ...shadow },
  statSmall: { ...rtl, color: colors.muted, fontSize: 12.5 },
  statBig: { ...rtl, color: colors.ink, fontSize: 19, fontWeight: '800', marginTop: 2 },
  tipTxt: { ...rtl, color: colors.ink, fontSize: 14.5, lineHeight: 22 },
});
