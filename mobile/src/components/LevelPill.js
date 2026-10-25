import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors, LEVEL_LABEL } from '../theme';

export default function LevelPill({ level, pct }) {
  return (
    <Text style={[s.pill, { backgroundColor: colors[level] }]}>
      {LEVEL_LABEL[level]}{pct != null ? ` ${pct}٪` : ''}
    </Text>
  );
}

const s = StyleSheet.create({
  pill: { color: '#fff', fontWeight: '700', fontSize: 12.5, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99, overflow: 'hidden' },
});
