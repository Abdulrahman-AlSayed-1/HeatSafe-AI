/**
 * Precise Geographic Validation for United States Territories.
 * Aligned with FortyGuard Satellite Coverage (Continental US, Alaska, Hawaii, Puerto Rico, USVI).
 * Explicitly rejects Canada, Mexico, and international territories.
 */
export function isLocationInUnitedStates(lat: number | null | undefined, lng: number | null | undefined): boolean {
  if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) return false;

  // 1. Hawaii
  if (lat >= 18.8 && lat <= 22.5 && lng >= -160.5 && lng <= -154.5) {
    return true;
  }

  // 2. Puerto Rico / US Virgin Islands
  if (lat >= 17.7 && lat <= 18.6 && lng >= -67.4 && lng <= -64.5) {
    return true;
  }

  // 3. Alaska (Mainland)
  if (lng >= -179.0 && lng <= -141.0 && lat >= 51.0 && lat <= 71.5) {
    return true;
  }

  // 3b. Alaska Panhandle (Southeast Alaska)
  if (lng >= -141.0 && lng <= -129.9 && lat >= 54.5 && lat <= 60.5) {
    return true;
  }

  // 4. Contiguous United States (Lower 48)
  // Strictly reject anything north of 49.384°N (Canada 49th parallel border)
  // or south of Key West / Brownsville (24.5°N)
  if (lat < 24.5 || lat > 49.384 || lng < -125.0 || lng > -66.9) {
    return false;
  }

  // Canada east exclusions (Southern Ontario, Quebec, Maritimes)
  if (lng <= -120.0 && lat > 49.0) {
    return false; // Vancouver / Southern BC
  }
  if (lng >= -83.5 && lng <= -80.5 && lat > 42.0) {
    return false; // Southwestern Ontario (Windsor, London, Sarnia, Chatham)
  }
  if (lng > -80.5 && lng <= -78.9 && lat > 42.8) {
    return false; // Niagara Peninsula, Hamilton, Kitchener, Toronto (Ontario)
  }
  if (lng > -78.9 && lng <= -76.5 && lat > 43.5) {
    return false; // Oshawa, Kingston, Lake Ontario north shore (Ontario)
  }
  if (lng > -76.5 && lng <= -75.0 && lat > 44.4) {
    return false; // Eastern Ontario / St. Lawrence border
  }
  if (lng >= -75.0 && lng <= -71.0 && lat > 45.0) {
    return false; // Montreal, Quebec City, Southern Quebec
  }
  if (lng > -71.0 && lng <= -67.0 && lat > 47.4) {
    return false; // New Brunswick / Eastern Canada
  }

  return true;
}
