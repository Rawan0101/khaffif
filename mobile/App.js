import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

import { placesFor } from './src/data/places';
import { distanceMeters } from './src/utils/geo';
import { LIVE_READY, DEMO_CAPACITY, enterPlace, exitPlace, sendReport, fetchLive, fetchPlaces } from './src/services/api';
import { colors } from './src/theme';
import TabBar from './src/components/TabBar';
import CheckInBanner from './src/components/CheckInBanner';
import Onboarding from './src/screens/Onboarding';
import MapScreen from './src/screens/MapScreen';
import PlacesScreen from './src/screens/PlacesScreen';
import ForecastScreen from './src/screens/ForecastScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const EXIT_BUFFER = 15;   // extra metres before counting an exit (prevents flicker)
const POLL_MS = 3000;     // how often to poll counts from the server
const HEARTBEAT_MS = 30000;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, shouldShowBanner: true, shouldShowList: true,
    shouldPlaySound: false, shouldSetBadge: false,
  }),
});

export default function App() {
  const [user, setUser] = useState(null);
  const [places, setPlaces] = useState([]);
  const [tab, setTab] = useState('map');
  const [simCounts, setSimCounts] = useState({});
  const [live, setLive] = useState({ counts: {}, reports: {}, devices: 0, ok: false });
  const [liveMode, setLiveMode] = useState(LIVE_READY);
  const [reports, setReports] = useState({});
  const [here, setHere] = useState(null);
  const [position, setPosition] = useState(null);
  const [demoMode, setDemoMode] = useState(true);
  const [sharing, setSharing] = useState(true);
  const [status, setStatus] = useState('نتابع موقعك داخل الحرم فقط');
  const [banner, setBanner] = useState(null);
  const hereRef = useRef(null);
  const sharingRef = useRef(true);
  const placesRef = useRef([]);
  const uni = user?.university?.id;

  useEffect(() => { sharingRef.current = sharing; }, [sharing]);
  useEffect(() => { placesRef.current = places; }, [places]);

  // ---------- Load campus places (prefer boundaries saved on the server) ----------
  useEffect(() => {
    if (!uni) return;
    const base = placesFor(uni);
    setPlaces(base);
    setSimCounts(Object.fromEntries(base.map((p) => [p.id, p.start])));
    fetchPlaces(uni).then((rows) => {
      if (!rows || !rows.length) return;
      setPlaces((ps) => ps.map((p) => {
        const r = rows.find((x) => x.id === p.id);
        return r ? { ...p, latitude: r.lat, longitude: r.lng, radius: r.radius } : p;
      }));
    });
  }, [uni]);

  const isLive = liveMode && LIVE_READY;

  // Places as displayed: in live mode capacity = demo capacity
  const viewPlaces = useMemo(
    () => (isLive ? places.map((p) => ({ ...p, capacity: DEMO_CAPACITY })) : places),
    [places, isLive]
  );
  const counts = useMemo(() => {
    if (!isLive) return simCounts;
    return Object.fromEntries(places.map((p) => [p.id, live.counts[p.id] || 0]));
  }, [isLive, simCounts, live, places]);

  // ---------- Enter / exit ----------
  const enter = useCallback(async (place) => {
    hereRef.current = place.id;
    setHere(place.id);
    if (!sharingRef.current) return;
    setSimCounts((c) => ({ ...c, [place.id]: Math.min(place.capacity, (c[place.id] || 0) + 1) }));
    enterPlace(uni, place.id);
    setBanner(place);
    try {
      await Notifications.scheduleNotificationAsync({
        content: { title: `وصلت ${place.name}`, body: 'كيف الزحمة؟ اضغط مطولاً واختر', categoryIdentifier: 'crowd', data: { placeId: place.id } },
        trigger: null,
      });
    } catch (e) {}
  }, [uni]);

  const exit = useCallback((place) => {
    hereRef.current = null;
    setHere(null);
    setBanner(null);
    if (!sharingRef.current) return;
    setSimCounts((c) => ({ ...c, [place.id]: Math.max(0, (c[place.id] || 0) - 1) }));
    exitPlace();
  }, []);

  const handlePosition = useCallback((latitude, longitude) => {
    setPosition({ latitude, longitude });
    const list = placesRef.current;
    let found = null;
    for (const p of list) {
      const d = distanceMeters(latitude, longitude, p.latitude, p.longitude);
      const limit = hereRef.current === p.id ? p.radius + EXIT_BUFFER : p.radius;
      if (d <= limit) { found = p; break; }
    }
    const prevId = hereRef.current;
    if ((found?.id ?? null) === prevId) return;
    if (prevId) exit(list.find((p) => p.id === prevId));
    if (found) enter(found);
  }, [enter, exit]);

  const report = useCallback((placeId, level) => {
    setReports((r) => ({ ...r, [placeId]: level }));
    sendReport(uni, placeId, level);
    setBanner(null);
  }, [uni]);

  // ---------- Sharing: remove this device from the server when sharing is turned off ----------
  useEffect(() => {
    if (!uni) return;
    if (!sharing) exitPlace();
    else if (hereRef.current) enterPlace(uni, hereRef.current);
  }, [sharing, uni]);

  // ---------- Server: poll counts + heartbeat ----------
  useEffect(() => {
    if (!uni || !LIVE_READY) return;
    let alive = true;
    const poll = async () => {
      try { const d = await fetchLive(uni); if (alive) setLive({ ...d, ok: true }); }
      catch (e) { if (alive) setLive((l) => ({ ...l, ok: false })); }
    };
    poll();
    const p = setInterval(poll, POLL_MS);
    const h = setInterval(() => { if (hereRef.current && sharingRef.current) enterPlace(uni, hereRef.current); }, HEARTBEAT_MS);
    return () => { alive = false; clearInterval(p); clearInterval(h); };
  }, [uni]);

  // ---------- Notifications ----------
  useEffect(() => {
    if (!user) return;
    let sub;
    (async () => {
      try {
        await Notifications.requestPermissionsAsync();
        await Notifications.setNotificationCategoryAsync('crowd', [
          { identifier: 'low', buttonTitle: 'خفيف', options: { opensAppToForeground: false } },
          { identifier: 'mid', buttonTitle: 'متوسط', options: { opensAppToForeground: false } },
          { identifier: 'high', buttonTitle: 'زحمة', options: { opensAppToForeground: false } },
        ]);
      } catch (e) {}
      sub = Notifications.addNotificationResponseReceivedListener((r) => {
        const level = r.actionIdentifier;
        const placeId = r.notification.request.content.data?.placeId;
        if (placeId && ['low', 'mid', 'high'].includes(level)) report(placeId, level);
      });
    })();
    return () => sub?.remove();
  }, [user, report]);

  // ---------- Real location ----------
  useEffect(() => {
    if (!user || demoMode) return;
    let sub;
    (async () => {
      const { status: perm } = await Location.requestForegroundPermissionsAsync();
      if (perm !== 'granted') { setStatus('فعّل إذن الموقع من الإعدادات عشان ينحسب وجودك'); return; }
      setStatus('نتابع موقعك داخل الحرم فقط');
      sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 5, timeInterval: 3000 },
        ({ coords }) => handlePosition(coords.latitude, coords.longitude)
      );
    })();
    return () => sub?.remove();
  }, [user, demoMode, handlePosition]);

  // ---------- Simulate other students (simulation mode only) ----------
  useEffect(() => {
    if (!user || isLive) return;
    const t = setInterval(() => {
      const list = placesRef.current;
      if (!list.length) return;
      const p = list[Math.floor(Math.random() * list.length)];
      const delta = (Math.random() < 0.5 ? -1 : 1) * Math.ceil(Math.random() * 3);
      setSimCounts((c) => ({ ...c, [p.id]: Math.max(0, Math.min(p.capacity, (c[p.id] || 0) + delta)) }));
    }, 3000);
    return () => clearInterval(t);
  }, [user, isLive]);

  const logout = () => {
    exitPlace();
    setUser(null); setHere(null); hereRef.current = null; setTab('map'); setPlaces([]);
  };

  if (!user || !places.length) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Onboarding onDone={setUser} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <View style={s.root}>
        <View style={{ flex: 1 }}>
          {tab === 'map' && (
            <MapScreen
              places={viewPlaces}
              counts={counts}
              here={here}
              position={position}
              demoMode={demoMode}
              status={isLive ? `${status} · بيانات حقيقية` : status}
              onMapPress={(c) => handlePosition(c.latitude, c.longitude)}
            />
          )}
          {tab === 'places' && (
            <PlacesScreen places={viewPlaces} counts={counts} here={here} reports={reports} live={isLive ? live : null} />
          )}
          {tab === 'forecast' && <ForecastScreen places={places} />}
          {tab === 'profile' && (
            <ProfileScreen
              user={user}
              demoMode={demoMode}
              setDemoMode={setDemoMode}
              sharing={sharing}
              setSharing={setSharing}
              liveReady={LIVE_READY}
              liveMode={liveMode}
              setLiveMode={setLiveMode}
              live={live}
              onLogout={logout}
            />
          )}
        </View>
        <TabBar tab={tab} onChange={setTab} />
        <CheckInBanner place={banner} onReport={(lv) => banner && report(banner.id, lv)} onClose={() => setBanner(null)} />
      </View>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
