/**
 * Geolocation utility helper for Brain IT Academy Face ID & Location check
 */
export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export interface GeoLocationCheckResult {
  allowed: boolean;
  userLat?: number;
  userLng?: number;
  distanceMeters?: number;
  error?: string;
}

/**
 * Gets user's browser geolocation and checks against geofence coordinates
 */
export async function verifyUserLocation(
  adminLat: number,
  adminLng: number,
  radiusMeters: number,
  simulateLocation: boolean
): Promise<GeoLocationCheckResult> {
  if (simulateLocation) {
    return {
      allowed: true,
      userLat: adminLat,
      userLng: adminLng,
      distanceMeters: 0,
    };
  }

  if (!navigator.geolocation) {
    return {
      allowed: false,
      error: 'Brauzeringiz lokatsiyani (GPS) qo\'llab-quvvatlamaydi.',
    };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        const dist = calculateDistanceMeters(userLat, userLng, adminLat, adminLng);
        if (dist <= radiusMeters) {
          resolve({
            allowed: true,
            userLat,
            userLng,
            distanceMeters: dist,
          });
        } else {
          resolve({
            allowed: false,
            userLat,
            userLng,
            distanceMeters: dist,
            error: `📍 Siz akademiyadan ${dist}m masofadasiz. Ruxsat etilgan hudud: ${radiusMeters}m radius.`,
          });
        }
      },
      (err) => {
        resolve({
          allowed: false,
          error: `Lokatsiyani aniqlashda xatolik: ${err.message || 'GPS yoqilmagan yoki ruxsat berilmagan'}`,
        });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  });
}
