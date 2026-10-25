import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, levelOf, pctOf, rtl, shadow } from '../theme';
import { regionFor } from '../utils/geo';

export default function MapScreen({ places, counts, here, position, demoMode, status, onMapPress }) {
  const insets = useSafeAreaInsets();
  const region = useMemo(() => regionFor(places), [places]);

  const herePlace = places.find((p) => p.id === here);
  const parkings = places.filter((p) => p.icon === 'car-outline');
  const bestParking = parkings
    .map((p) => ({ p, free: p.capacity - counts[p.id] }))
    .sort((a, b) => b.free - a.free)[0];

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        showsUserLocation={!demoMode}
        showsPointsOfInterest={false}
        onPress={(e) => demoMode && onMapPress(e.nativeEvent.coordinate)}
      >
        {places.map((p) => {
          const lv = levelOf(counts[p.id], p.capacity);
          const pct = pctOf(counts[p.id], p.capacity);
          const on = here === p.id;
          return (
            <React.Fragment key={p.id}>
              <Circle
                key={`${p.id}-${lv}-${on}`}
                center={{ latitude: p.latitude, longitude: p.longitude }}
                radius={p.radius}
                fillColor={colors[lv] + (on ? '55' : '30')}
                strokeColor={colors[lv]}
                strokeWidth={on ? 3 : 1.5}
              />
              <Marker coordinate={{ latitude: p.latitude, longitude: p.longitude }} anchor={{ x: 0.5, y: 0.5 }}>
                <View style={[s.tag, { borderColor: colors[lv] }]}>
                  <Ionicons name={p.icon} size={13} color={colors[lv]} />
                  <Text style={s.tagName}>{p.name}</Text>
                  <Text style={[s.tagPct, { color: colors[lv] }]}>{pct}٪</Text>
                </View>
              </Marker>
            </React.Fragment>
          );
        })}
        {demoMode && position && (
          <Marker coordinate={position} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={s.meRing}><View style={s.me} /></View>
          </Marker>
        )}
      </MapView>

      <View style={[s.header, { top: insets.top + 10 }]}>
        <Text style={s.logo}>خفّف</Text>
        <View style={s.statusRow}>
          <View style={[s.dot, { backgroundColor: demoMode ? colors.mid : colors.low }]} />
          <Text style={s.status}>{demoMode ? 'وضع التجربة: اضغط على الخريطة عشان تتحرك' : status}</Text>
        </View>
      </View>

      <View style={s.bottom}>
        {herePlace ? (
          <View style={s.card}>
            <Text style={s.cardSmall}>أنت الحين في</Text>
            <Text style={s.cardTitle}>{herePlace.name}</Text>
            <Text style={s.cardMeta}>انحسب وجودك تلقائياً وبدون هوية</Text>
          </View>
        ) : bestParking ? (
          <View style={s.card}>
            <Text style={s.cardSmall}>أفضل موقف الحين</Text>
            <Text style={s.cardTitle}>{bestParking.p.name}</Text>
            <Text style={s.cardMeta}>{bestParking.free} موقف فاضي</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: { position: 'absolute', left: 14, right: 14, backgroundColor: colors.card, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 12, ...shadow },
  logo: { ...rtl, fontSize: 24, fontWeight: '800', color: colors.brand },
  statusRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginTop: 2 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  status: { ...rtl, color: colors.muted, fontSize: 12.5, flexShrink: 1 },
  tag: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, backgroundColor: '#fff', borderWidth: 1.5, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 4 },
  tagName: { fontSize: 11.5, fontWeight: '700', color: colors.ink },
  tagPct: { fontSize: 11.5, fontWeight: '800' },
  meRing: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.me + '30', alignItems: 'center', justifyContent: 'center' },
  me: { width: 16, height: 16, borderRadius: 8, backgroundColor: colors.me, borderWidth: 3, borderColor: '#fff' },
  bottom: { position: 'absolute', left: 14, right: 14, bottom: 14 },
  card: { backgroundColor: colors.card, borderRadius: 18, padding: 16, ...shadow },
  cardSmall: { ...rtl, color: colors.muted, fontSize: 12.5 },
  cardTitle: { ...rtl, color: colors.ink, fontSize: 19, fontWeight: '800', marginTop: 2 },
  cardMeta: { ...rtl, color: colors.brand, fontSize: 13.5, fontWeight: '600', marginTop: 2 },
});
