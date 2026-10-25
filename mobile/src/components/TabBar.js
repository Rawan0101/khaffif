import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';

const TABS = [
  { id: 'map', label: 'الخريطة', icon: 'map-outline', active: 'map' },
  { id: 'places', label: 'الأماكن', icon: 'list-outline', active: 'list' },
  { id: 'forecast', label: 'التوقعات', icon: 'bar-chart-outline', active: 'bar-chart' },
  { id: 'profile', label: 'حسابي', icon: 'person-circle-outline', active: 'person-circle' },
];

export default function TabBar({ tab, onChange }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {TABS.map((t) => {
        const on = tab === t.id;
        return (
          <Pressable key={t.id} style={s.item} onPress={() => onChange(t.id)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
            <Ionicons name={on ? t.active : t.icon} size={23} color={on ? colors.brand : colors.muted} />
            <Text style={[s.label, on && s.on]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: 'row-reverse', backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 8 },
  item: { flex: 1, alignItems: 'center', gap: 2 },
  label: { fontSize: 11.5, color: colors.muted },
  on: { color: colors.brand, fontWeight: '700' },
});
