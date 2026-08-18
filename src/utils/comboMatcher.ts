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

export interface ComboDiscountDetails {
  originalPrice: number;
  comboPrice: number;
  savingsAmount: number;
  discountPercentage: number;
  hasDiscount: boolean;
  includedServices: ServiceItem[];
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
 * Calculates discount details, percentage, and savings for any combo item.
 */
export function getComboDiscountDetails(
  combo: ServiceItem,
  allServices: ServiceItem[]
): ComboDiscountDetails {
  const comboPrice = combo.price;
  const individualServices = allServices.filter((s) => s.category === 'individual');

  let includedServices: ServiceItem[] = [];

  // 1. Direct includedServiceIds if set
  if (combo.includedServiceIds && combo.includedServiceIds.length > 0) {
    includedServices = individualServices.filter((s) =>
      combo.includedServiceIds!.includes(s.id)
    );
  }

  // 2. Fallback to COMBO_INCLUDED_SERVICES_MAP
  if (includedServices.length === 0 && COMBO_INCLUDED_SERVICES_MAP[combo.id]) {
    const ids = COMBO_INCLUDED_SERVICES_MAP[combo.id];
    includedServices = individualServices.filter((s) => ids.includes(s.id));
  }

  // 3. Fallback name/keyword detection against catalog
  if (includedServices.length === 0 && individualServices.length > 0) {
    const textToSearch = `${combo.name} ${combo.description}`.toLowerCase();
    const matched: ServiceItem[] = [];

    // Helper map of keyword groups
    const keywordGroups: { [group: string]: string[] } = {
      hair: ['corte', 'cabelo', 'degrade', 'navalhad', 'tesoura', 'social', 'disfarce'],
      beard: ['barba', 'barboterapia', 'barbeado', 'terapia'],
      eyebrow: ['sobrancelha', 'sobrancelhas', 'design'],
      pigmentation: ['pigmenta', 'pigmentacao', 'tintura', 'coloracao'],
      hydration: ['hidrata', 'hidratacao', 'nutricao', 'reconstrucao', 'lavagem'],
      straightening: ['selagem', 'alisamento', 'progressiva', 'botox'],
      skin: ['limpeza', 'facial', 'esfoliacao', 'pele', 'argila'],
      lights: ['luzes', 'platinado', 'reflexo', 'mechas'],
    };

    for (const [_, keywords] of Object.entries(keywordGroups)) {
      const isGroupInCombo = keywords.some((k) => textToSearch.includes(k));
      if (isGroupInCombo) {
        // Find best individual service matching this keyword group
        const matchingInd = individualServices.find((ind) => {
          const indLower = `${ind.name} ${ind.description}`.toLowerCase();
          return keywords.some((k) => indLower.includes(k));
        });
        if (matchingInd && !matched.some((m) => m.id === matchingInd.id)) {
          matched.push(matchingInd);
        }
      }
    }

    if (matched.length >= 1) {
      includedServices = matched;
    }
  }

  // Calculate original sum from included services
  const includedSum = includedServices.reduce((sum, s) => sum + s.price, 0);

  // Determine original reference price
  let originalPrice = 0;

  if (combo.originalPrice && combo.originalPrice > comboPrice) {
    originalPrice = combo.originalPrice;
  } else if (includedSum > comboPrice) {
    originalPrice = includedSum;
  } else if (combo.originalPrice && combo.originalPrice > 0) {
    originalPrice = combo.originalPrice;
  } else if (comboPrice > 0) {
    // If no individual services exist or sum is equal/lower, calculate smart default promotion percentage (e.g. 15-20% standard bundle benefit)
    // to give clear visual feedback to client
    const fallbackOriginal = Math.round((comboPrice / 0.8) / 5) * 5; // ~20% discount rounded to multiple of 5
    if (fallbackOriginal > comboPrice) {
      originalPrice = fallbackOriginal;
    }
  }

  const savingsAmount = originalPrice > comboPrice ? originalPrice - comboPrice : 0;
  const discountPercentage =
    originalPrice > comboPrice ? Math.round((savingsAmount / originalPrice) * 100) : 0;

  return {
    originalPrice,
    comboPrice,
    savingsAmount,
    discountPercentage,
    hasDiscount: discountPercentage > 0 && savingsAmount > 0,
    includedServices,
  };
}

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

