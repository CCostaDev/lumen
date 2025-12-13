export function parseHHMM(s: string): number {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(s.trim());
  if (!m) throw new Error("Time must be HH:mm (e.g. 20:00)");
  return Number(m[1]) * 60 + Number(m[2]);
}

export function toHHMM(min: number): string {
  const wrapped = ((min % 1440) + 1440) % 1440; // keep in 0..1439
  const hh = Math.floor(wrapped / 60);
  const mm = wrapped % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export function dayName(day: number): string {
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][day] ?? "???";
}

export function getWeekKeyServer(now = new Date()): string {
  const d = new Date(now);

  // go to local midnight
  d.setHours(0, 0, 0, 0);

  // Mon=0..Sun=6
  const day = (d.getDay() + 6) % 7;

  // back to Monday
  d.setDate(d.getDate() - day);

  // IMPORTANT: format using local date parts (not toISOString)
  return formatLocalYYYYMMDD(d);
}

export function formatLocalYYYYMMDD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatDateDDMMYYYY(isoYYYYMMDD: string): string {
  const [y, m, d] = isoYYYYMMDD.split("-");
  return `${d}-${m}-${y}`;
}
