import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, rtl, shadow } from '../theme';

// Shown when entering a place with the app open; mirrors the lock-screen notification
export default function CheckInBanner({ place, onReport, onClose }) {
  const insets = useSafeAreaInsets();
  const y = useRef(new Animated.Value(-220)).current;

  useEffect(() => {
    Animated.spring(y, { toValue: place ? 0 : -220, useNativeDriver: true, friction: 8 }).start();
  }, [place]);

  useEffect(() => {
    if (!place) return;
    const t = setTimeout(onClose, 9000);
    return () => clearTimeout(t);
  }, [place]);

  return (
    <Animated.View pointerEvents={place ? 'auto' : 'none'} style={[s.wrap, { top: insets.top + 8, transform: [{ translateY: y }] }]}>
      <View style={s.head}>
        <View style={s.appIcon}><Text style={s.appIconTxt}>خ</Text></View>
        <Text style={s.app}>خفّف · الحين</Text>
      </View>
      <Text style={s.title}>وصلت {place?.name}</Text>
      <Text style={s.body}>كيف الزحمة؟ ضغطة وحدة وكمّل طريقك</Text>
      <View style={s.actions}>
        {[['low', 'خفيف'], ['mid', 'متوسط'], ['high', 'زحمة']].map(([id, label]) => (
          <Pressable key={id} style={({ pressed }) => [s.btn, pressed && { backgroundColor: colors.brandSoft }]} onPress={() => onReport(id)}>
            <View style={[s.dot, { backgroundColor: colors[id] }]} />
            <Text style={s.btnTxt}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: { position: 'absolute', left: 12, right: 12, backgroundColor: 'rgba(255,255,255,0.98)', borderRadius: 20, padding: 14, zIndex: 20, ...shadow, shadowOpacity: 0.18, elevation: 10 },
  head: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  appIcon: { width: 22, height: 22, borderRadius: 6, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' },
  appIconTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  app: { color: colors.muted, fontSize: 12 },
  title: { ...rtl, fontWeight: '700', fontSize: 16, color: colors.ink, marginTop: 6 },
  body: { ...rtl, color: colors.muted, fontSize: 13.5 },
  actions: { flexDirection: 'row-reverse', gap: 8, marginTop: 12 },
  btn: { flex: 1, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.bg, borderRadius: 12, paddingVertical: 10 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  btnTxt: { fontWeight: '700', color: colors.ink },
});
