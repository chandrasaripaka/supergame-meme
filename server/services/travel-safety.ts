// Travel Safety Service
// Provides information about travel advisories, sanctions, war zones, and safety concerns

import { z } from 'zod';

export enum SafetyLevel {
  SAFE = 'safe',
  CAUTION = 'caution',
  RECONSIDER_TRAVEL = 'reconsider',
  DO_NOT_TRAVEL = 'do_not_travel'
}

export interface SafetyAdvisory {
  country: string;
  level: SafetyLevel;
  lastUpdated: string; // ISO date string
  reason: string[];
  details: string;
  regions?: Array<{
    name: string;
    level: SafetyLevel;
    reason: string[];
  }>;
  sanctions?: boolean;
}

// This is a simplified implementation. In a production environment, 
// you would likely fetch this data from a government API like the US State Department
// or maintain a database of travel advisories that gets updated regularly.
const safetyAdvisories: SafetyAdvisory[] = [
  {
    country: 'Ukraine',
    level: SafetyLevel.DO_NOT_TRAVEL,
    lastUpdated: '2025-05-01',
    reason: ['war', 'armed conflict'],
    details: 'Do not travel to Ukraine due to ongoing Russian invasion and armed conflict.',
    regions: [
      {
        name: 'Eastern Ukraine',
        level: SafetyLevel.DO_NOT_TRAVEL,
        reason: ['active combat', 'shelling']
      }
    ]
  },
  {
    country: 'Russia',
    level: SafetyLevel.DO_NOT_TRAVEL,
    lastUpdated: '2025-04-20',
    reason: ['sanctions', 'detention risk', 'invasion of Ukraine'],
    details: 'Do not travel to Russia due to international sanctions, the risk of wrongful detention, and the invasion of Ukraine.',
    sanctions: true
  },
  {
    country: 'Yemen',
    level: SafetyLevel.DO_NOT_TRAVEL,
    lastUpdated: '2025-04-10',
    reason: ['civil war', 'terrorism', 'kidnapping'],
    details: 'Do not travel to Yemen due to ongoing civil war, terrorism, civil unrest, health risks, kidnapping, and armed conflict.'
  },
  {
    country: 'Syria',
    level: SafetyLevel.DO_NOT_TRAVEL,
    lastUpdated: '2025-03-15',
    reason: ['civil war', 'terrorism', 'kidnapping'],
    details: 'Do not travel to Syria due to terrorism, civil unrest, kidnapping, armed conflict, and risk of unjust detention.'
  },
  {
    country: 'North Korea',
    level: SafetyLevel.DO_NOT_TRAVEL,
    lastUpdated: '2025-03-01',
    reason: ['detention risk', 'sanctions'],
    details: 'Do not travel to North Korea due to the serious risk of arrest and long-term detention of U.S. nationals and international sanctions.',
    sanctions: true
  },
  {
    country: 'Iran',
    level: SafetyLevel.DO_NOT_TRAVEL,
    lastUpdated: '2025-04-05',
    reason: ['detention risk', 'kidnapping risk', 'arbitrary enforcement of laws'],
    details: 'Do not travel to Iran due to the risk of kidnapping, arrest, and detention of U.S. and Western citizens.',
    sanctions: true
  },
  {
    country: 'Afghanistan',
    level: SafetyLevel.DO_NOT_TRAVEL,
    lastUpdated: '2025-04-12',
    reason: ['civil unrest', 'terrorism', 'kidnapping', 'armed conflict'],
    details: 'Do not travel to Afghanistan due to armed conflict, civil unrest, crime, terrorism, kidnapping, and COVID-19.'
  },
  {
    country: 'Belarus',
    level: SafetyLevel.DO_NOT_TRAVEL,
    lastUpdated: '2025-03-22',
    reason: ['sanctions', 'arbitrary enforcement of laws', 'detention risk'],
    details: 'Do not travel to Belarus due to international sanctions, the arbitrary enforcement of laws, and the risk of detention.',
    sanctions: true
  },
  {
    country: 'Venezuela',
    level: SafetyLevel.RECONSIDER_TRAVEL,
    lastUpdated: '2025-04-02',
    reason: ['crime', 'civil unrest', 'kidnapping', 'detention risk'],
    details: 'Reconsider travel to Venezuela due to crime, civil unrest, poor health infrastructure, kidnapping, and arbitrary arrest and detention of U.S. citizens.',
    sanctions: true
  },
  {
    country: 'Haiti',
    level: SafetyLevel.DO_NOT_TRAVEL,
    lastUpdated: '2025-04-18',
    reason: ['kidnapping', 'crime', 'civil unrest'],
    details: 'Do not travel to Haiti due to kidnapping, crime, civil unrest, and poor healthcare infrastructure.'
  },
  {
    country: 'South Sudan',
    level: SafetyLevel.DO_NOT_TRAVEL,
    lastUpdated: '2025-03-30',
    reason: ['crime', 'kidnapping', 'armed conflict'],
    details: 'Do not travel to South Sudan due to crime, kidnapping, and armed conflict.'
  },
  {
    country: 'Mali',
    level: SafetyLevel.DO_NOT_TRAVEL,
    lastUpdated: '2025-04-08',
    reason: ['crime', 'terrorism', 'kidnapping'],
    details: 'Do not travel to Mali due to crime, terrorism, and kidnapping.'
  },
  {
    country: 'Somalia',
    level: SafetyLevel.DO_NOT_TRAVEL,
    lastUpdated: '2025-03-05',
    reason: ['crime', 'terrorism', 'civil unrest', 'kidnapping', 'piracy'],
    details: 'Do not travel to Somalia due to crime, terrorism, civil unrest, health issues, kidnapping, and piracy.'
  },
  {
    country: 'Myanmar',
    level: SafetyLevel.RECONSIDER_TRAVEL,
    lastUpdated: '2025-04-25',
    reason: ['civil unrest', 'armed conflict', 'detention risk'],
    details: 'Reconsider travel to Myanmar (Burma) due to civil unrest, armed conflict, and areas with landmines and unexploded ordnance.',
    regions: [
      {
        name: 'Rakhine State',
        level: SafetyLevel.DO_NOT_TRAVEL,
        reason: ['armed conflict', 'civil unrest']
      }
    ]
  }
];

/**
 * Get safety information for a specific country or region
 * @param location Country or region name to check
 * @returns Safety advisory or null if not found
 */
export function getSafetyInfo(location: string): SafetyAdvisory | null {
  // First, try to find an exact match for the country
  const countryMatch = safetyAdvisories.find(
    advisory => advisory.country.toLowerCase() === location.toLowerCase()
  );
  
  if (countryMatch) {
    return countryMatch;
  }
  
  // If no country match, check if it's a region within any country
  for (const advisory of safetyAdvisories) {
    if (advisory.regions) {
      const regionMatch = advisory.regions.find(
        region => region.name.toLowerCase() === location.toLowerCase()
      );
      
      if (regionMatch) {
        return {
          ...advisory,
          level: regionMatch.level,
          reason: regionMatch.reason,
          details: `${regionMatch.name} in ${advisory.country}: ${regionMatch.reason.join(', ')}`
        };
      }
    }
  }
  
  return null;
}

/**
 * Check if a country has sanctions that may affect travel
 * @param country Country name to check
 * @returns Whether the country has sanctions
 */
export function hasSanctions(country: string): boolean {
  const countryMatch = safetyAdvisories.find(
    advisory => advisory.country.toLowerCase() === country.toLowerCase()
  );
  
  return countryMatch?.sanctions === true;
}

/**
 * Get a list of countries with the specified safety level or worse
 * @param level Minimum safety level to include
 * @returns List of country names
 */
export function getCountriesByLevel(level: SafetyLevel): string[] {
  const levelPriority = {
    [SafetyLevel.SAFE]: 0,
    [SafetyLevel.CAUTION]: 1,
    [SafetyLevel.RECONSIDER_TRAVEL]: 2,
    [SafetyLevel.DO_NOT_TRAVEL]: 3
  };
  
  return safetyAdvisories
    .filter(advisory => levelPriority[advisory.level] >= levelPriority[level])
    .map(advisory => advisory.country);
}

/**
 * Returns a list of countries with active travel warnings
 */
export function getHighRiskDestinations(): string[] {
  return getCountriesByLevel(SafetyLevel.DO_NOT_TRAVEL);
}

/**
 * Check if a destination might be unsafe for travel
 * @param destination Destination to check
 * @returns Safety information if it's a high-risk destination, null otherwise
 */
export function checkDestinationSafety(destination: string): { safe: boolean; advisory?: SafetyAdvisory } {
  const safetyInfo = getSafetyInfo(destination);
  
  if (!safetyInfo) {
    return { safe: true };
  }
  
  const isSafe = safetyInfo.level === SafetyLevel.SAFE || safetyInfo.level === SafetyLevel.CAUTION;
  
  return {
    safe: isSafe,
    advisory: safetyInfo
  };
}