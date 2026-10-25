import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LevelPill from './LevelPill';
import { colors, levelOf, pctOf, rtl, shadow, LEVEL_LABEL } from '../theme';

export default function PlaceCard({ place, count, isHere, report }) {
  const level = levelOf(count, place.capacity);
  const pct = pctOf(count, place.capacity);
  const free = Math.max(0, place.capacity - count);
  const unit = place.icon === 'car-outline' ? 'موقف فاضي' : place.icon === 'library-outline' ? 'مقعد فاضي' : 'مكان فاضي';

  return (
    <View style={[s.card, isHere && s.here]}>
      <View style={s.row}>
        <View style={s.titleRow}>
          <View style={s.icon}><Ionicons name={place.icon} size={18} color={colors.brand} /></View>
          <Text style={s.name}>{place.name}</Text>
        </View>
        <LevelPill level={level} pct={pct} />
      </View>

      <View style={s.track}>
        <View style={[s.fill, { width: `${pct}%`, backgroundColor: colors[level] }]} />
      </View>

      <Text style={s.meta}>
        <Text style={s.free}>{free}</Text> {unit}  ·  {count} من {place.capacity}
        {report ? `  ·  تقييمك: ${LEVEL_LABEL[report]}` : ''}
      </Text>
      {isHere && <Text style={s.hereTxt}>أنت هنا الحين</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 18, padding: 15, marginBottom: 12, borderWidth: 2, borderColor: 'transparent', ...shadow },
  here: { borderColor: colors.brand },
  row: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  titleRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  icon: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.brandSoft, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '700', color: colors.ink },
  track: { height: 9, backgroundColor: colors.bg, borderRadius: 6, marginTop: 13, overflow: 'hidden', flexDirection: 'row-reverse' },
  fill: { height: '100%', borderRadius: 6 },
  meta: { ...rtl, color: colors.muted, fontSize: 13, marginTop: 9 },
  free: { color: colors.ink, fontWeight: '700' },
  hereTxt: { ...rtl, color: colors.brand, fontWeight: '700', fontSize: 12.5, marginTop: 4 },
});
