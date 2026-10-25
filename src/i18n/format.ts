import type { TeaOrder } from '@/data/tea';
import type { Dictionary } from '@/i18n/dictionary';

/** Ahwa shorthand, e.g. "شاي كشري ع المية البيضا - تقيل - سكر مظبوط - تحبيشة نعناع" */
export function orderLine(t: Dictionary, order: TeaOrder): string {
  const { type, strength, sugar, addon } = t.options;
  const isMilk = order.addon === 'milk';
  return [
    `${type[order.type].short} ${isMilk ? t.receipt.onMilk : t.receipt.onWater}`,
    strength[order.strength].short,
    sugar[order.sugar].short,
    ...(isMilk ? [] : [addon[order.addon].short])
  ].join(' - ');
}
