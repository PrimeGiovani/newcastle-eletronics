/** Pure solar sizing logic – shared by the calculator UI and unit tests. */
export type Appliance = { name: string; watts: number; qty: number; hours: number; nightHours?: number };

export const APPLIANCE_PRESETS: Appliance[] = [
  { name: "LED bulb", watts: 10, qty: 10, hours: 8, nightHours: 6 },
  { name: "Ceiling / standing fan", watts: 75, qty: 3, hours: 10, nightHours: 8 },
  { name: "TV (LED 55\")", watts: 120, qty: 1, hours: 6, nightHours: 4 },
  { name: "Refrigerator", watts: 150, qty: 1, hours: 24, nightHours: 12 },
  { name: "1HP inverter AC", watts: 800, qty: 1, hours: 6, nightHours: 4 },
  { name: "1.5HP inverter AC", watts: 1100, qty: 0, hours: 6, nightHours: 4 },
  { name: "Laptop", watts: 65, qty: 2, hours: 8, nightHours: 2 },
  { name: "Wi-Fi router", watts: 15, qty: 1, hours: 24, nightHours: 12 },
  { name: "Washing machine", watts: 500, qty: 0, hours: 1, nightHours: 0 },
  { name: "Microwave", watts: 1000, qty: 0, hours: 0.5, nightHours: 0 },
];

const INVERTER_SIZES = [1.5, 2.5, 3.5, 5, 6, 8, 10, 12, 15, 20];
const BATTERY_MODULE_KWH = 5.12; // 51.2V 100Ah LiFePO4
const PANEL_W = 550;

export type SolarOptions = { sunHours?: number; autonomyNightOnly?: boolean; dod?: number; systemLoss?: number };

export function sizeSolarSystem(items: Appliance[], opts: SolarOptions = {}) {
  const { sunHours = 4.5, dod = 0.9, systemLoss = 0.8 } = opts;
  const active = items.filter((i) => i.qty > 0 && i.watts > 0);
  const peakW = active.reduce((s, i) => s + i.watts * i.qty, 0);
  const dailyWh = active.reduce((s, i) => s + i.watts * i.qty * i.hours, 0);
  const nightWh = active.reduce((s, i) => s + i.watts * i.qty * (i.nightHours ?? i.hours / 2), 0);

  const needKva = (peakW * 1.25) / 1000; // 25% surge headroom
  const inverterKva = INVERTER_SIZES.find((s) => s >= needKva) ?? Math.ceil(needKva);
  const batteryKwh = nightWh / 1000 / dod;
  const batteryModules = Math.max(1, Math.ceil(batteryKwh / BATTERY_MODULE_KWH));
  const panelW = dailyWh / sunHours / systemLoss;
  const panels = Math.max(1, Math.ceil(panelW / PANEL_W));

  return {
    peakW: Math.round(peakW),
    dailyKwh: +(dailyWh / 1000).toFixed(2),
    nightKwh: +(nightWh / 1000).toFixed(2),
    inverterKva,
    batteryKwh: +(batteryModules * BATTERY_MODULE_KWH).toFixed(2),
    batteryModules,
    panels,
    arrayKw: +((panels * PANEL_W) / 1000).toFixed(2),
  };
}
