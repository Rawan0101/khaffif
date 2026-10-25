// Same ids and coordinates as the web app so both clients share one dataset.
// Boundaries edited in the web app are pulled from Supabase automatically.

export const FORECAST_START_HOUR = 7;

const KINDS = {
  pA:   { name: 'مواقف الطالبات',     icon: 'car-outline',        capacity: 320, start: 290, profile: [40, 82, 95, 98, 97, 93, 82, 64, 46, 30, 18, 10] },
  pB:   { name: 'مواقف الطلاب',       icon: 'car-outline',        capacity: 180, start: 160, profile: [30, 70, 90, 94, 92, 88, 75, 55, 40, 25, 15, 8] },
  pC:   { name: 'المواقف العامة',      icon: 'car-outline',        capacity: 400, start: 230, profile: [10, 30, 52, 64, 66, 62, 52, 40, 30, 20, 12, 6] },
  lib:  { name: 'المكتبة المركزية',    icon: 'library-outline',    capacity: 250, start: 162, profile: [10, 25, 45, 62, 78, 88, 90, 82, 70, 58, 45, 30] },
  hall: { name: 'مبنى القاعات 1',      icon: 'business-outline',   capacity: 24,  start: 15,  profile: [20, 70, 85, 80, 90, 60, 75, 70, 55, 40, 20, 10] },
  caf:  { name: 'الكافتيريا الرئيسية', icon: 'restaurant-outline', capacity: 200, start: 88,  profile: [25, 45, 55, 70, 60, 92, 85, 50, 40, 30, 20, 10] },
  cafe: { name: 'كافيه المبنى 5',      icon: 'cafe-outline',       capacity: 60,  start: 40,  profile: [35, 70, 80, 65, 70, 85, 75, 60, 50, 40, 30, 15] },
};

const GEO = {
  yu:  { lib: [26.38050, 50.21780, 35], hall: [26.38010, 50.21830, 40], caf: [26.37990, 50.21760, 30], cafe: [26.38060, 50.21850, 25], pA: [26.38120, 50.21720, 55], pB: [26.37930, 50.21870, 55], pC: [26.37900, 50.21700, 70] },
  yur: { lib: [24.86390, 46.59330, 40], hall: [24.86330, 46.59440, 45], caf: [24.86300, 46.59340, 35], cafe: [24.86400, 46.59460, 25], pA: [24.86470, 46.59250, 60], pB: [24.86230, 46.59500, 60], pC: [24.86200, 46.59260, 80] },
};

export const UNIVERSITIES = [
  { id: 'yu',  name: 'جامعة اليمامة — الخبر',  center: [26.380235, 50.217959] },
  { id: 'yur', name: 'جامعة اليمامة — الرياض', center: [24.863473, 46.593794] },
];

export function placesFor(uniId) {
  return Object.entries(GEO[uniId]).map(([id, [latitude, longitude, radius]]) => ({
    id, latitude, longitude, radius, ...KINDS[id],
  }));
}
