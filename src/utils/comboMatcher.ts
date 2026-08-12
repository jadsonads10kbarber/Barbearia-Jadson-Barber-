import { ServiceItem } from '../types';

export interface SmartComboMatch {
  combo: ServiceItem;
  matchedIndividualServices: ServiceItem[];
  remainingIndividualServices: ServiceItem[];
  originalTotalPrice: number;
  smartTotalPrice: number;
  savings: number;
  smartTotalDuration: number;
}

/**
 * Fallback mapping of combo service IDs to component individual service IDs
 */
const COMBO_INCLUDED_SERVICES_MAP: Record<string, string[]> = {
  'combo-corte-barba': ['serv-corte', 'serv-barba'],
  'combo-vip': ['serv-corte', 'serv-barba', 'serv-sobrancelha'],
  'combo-master': ['serv-corte', 'serv-barba', 'serv-pigmentacao', 'serv-sobrancelha'],
};

/**
 * Evaluates selected individual services and detects if they qualify for any promotional combo discount.
 */
export function findSmartComboMatch(
  selectedIndividualServices: ServiceItem[],
  allServices: ServiceItem[]
): SmartComboMatch | null {
  if (!selectedIndividualServices || selectedIndividualServices.length === 0) {
    return null;
  }

  const selectedIds = new Set(selectedIndividualServices.map((s) => s.id));
  const combos = allServices.filter((s) => s.category === 'combo');

  const originalTotalPrice = selectedIndividualServices.reduce((sum, s) => sum + s.price, 0);

  let bestMatch: SmartComboMatch | null = null;

  for (const combo of combos) {
    let includedIds = combo.includedServiceIds || COMBO_INCLUDED_SERVICES_MAP[combo.id] || [];

    // Fallback keyword detection if includedServiceIds is missing
    if (includedIds.length === 0) {
      const comboLower = combo.name.toLowerCase();
      if (comboLower.includes('corte') && comboLower.includes('barba')) {
        includedIds = ['serv-corte', 'serv-barba'];
        if (comboLower.includes('vip') || comboLower.includes('sobrancelha')) {
          includedIds.push('serv-sobrancelha');
        }
      }
    }

    if (includedIds.length === 0) continue;

    // Check if ALL services required by this combo are present in selectedIndividualServices
    const hasAllIncluded = includedIds.every((id) => selectedIds.has(id));

    if (hasAllIncluded) {
      const matchedIndividualServices = selectedIndividualServices.filter((s) =>
        includedIds.includes(s.id)
      );
      const remainingIndividualServices = selectedIndividualServices.filter(
        (s) => !includedIds.includes(s.id)
      );

      const remainingPrice = remainingIndividualServices.reduce((sum, s) => sum + s.price, 0);
      const remainingDuration = remainingIndividualServices.reduce(
        (sum, s) => sum + s.durationMinutes,
        0
      );

      const smartTotalPrice = combo.price + remainingPrice;
      const smartTotalDuration = combo.durationMinutes + remainingDuration;
      const savings = originalTotalPrice - smartTotalPrice;

      // Only consider if there is actual savings or better combo value
      if (savings > 0) {
        if (
          !bestMatch ||
          savings > bestMatch.savings ||
          matchedIndividualServices.length > bestMatch.matchedIndividualServices.length
        ) {
          bestMatch = {
            combo,
            matchedIndividualServices,
            remainingIndividualServices,
            originalTotalPrice,
            smartTotalPrice,
            savings,
            smartTotalDuration,
          };
        }
      }
    }
  }

  return bestMatch;
}
