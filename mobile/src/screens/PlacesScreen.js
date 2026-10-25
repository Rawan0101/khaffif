import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PlaceCard from '../components/PlaceCard';
import { colors, rtl, shadow } from '../theme';

export default function PlacesScreen({ places, counts, here, reports, live }) {
  const calmest = [...places].sort((a, b) => counts[a.id] / a.capacity - counts[b.id] / b.capacity)[0];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.wrap}>
        <Text style={s.h1}>الأماكن</Text>
        <Text style={s.sub}>تتحدث تلقائياً كل ما دخل أو طلع أحد</Text>

        {live && (
          <View style={s.live}>
            <Text style={s.liveTxt}>📱 بيانات حقيقية · {live.devices} {live.devices === 1 ? 'جهاز' : 'أجهزة'} داخل الأماكن الحين</Text>
          </View>
        )}

        <View style={s.tip}>
          <Text style={s.tipSmall}>أهدأ مكان الحين</Text>
          <Text style={s.tipTitle}>{calmest.name}</Text>
        </View>

        {places.map((p) => (
          <PlaceCard key={p.id} place={p} count={counts[p.id]} isHere={here === p.id} report={reports[p.id]} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  wrap: { padding: 16, paddingBottom: 30 },
  h1: { ...rtl, fontSize: 26, fontWeight: '800', color: colors.ink },
  sub: { ...rtl, color: colors.muted, fontSize: 13.5, marginBottom: 14 },
  live: { backgroundColor: '#E8F0FF', borderRadius: 14, padding: 12, marginBottom: 12 },
  liveTxt: { ...rtl, color: colors.me, fontWeight: '700', fontSize: 13.5 },
  tip: { backgroundColor: colors.brand, borderRadius: 18, padding: 16, marginBottom: 14, ...shadow },
  tipSmall: { ...rtl, color: '#CDE9E9', fontSize: 12.5 },
  tipTitle: { ...rtl, color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 2 },
});
