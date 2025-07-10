import React, { useState, useMemo } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface Airport {
  code: string;
  city: string;
  country?: string;
  displayName: string;
}

interface AirportSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Comprehensive airport database
const airports: Airport[] = [
  // Major US Cities
  { code: 'JFK', city: 'New York', country: 'USA', displayName: 'New York (JFK)' },
  { code: 'LGA', city: 'New York', country: 'USA', displayName: 'New York - LaGuardia (LGA)' },
  { code: 'EWR', city: 'Newark', country: 'USA', displayName: 'Newark (EWR)' },
  { code: 'LAX', city: 'Los Angeles', country: 'USA', displayName: 'Los Angeles (LAX)' },
  { code: 'ORD', city: 'Chicago', country: 'USA', displayName: 'Chicago (ORD)' },
  { code: 'MIA', city: 'Miami', country: 'USA', displayName: 'Miami (MIA)' },
  { code: 'SFO', city: 'San Francisco', country: 'USA', displayName: 'San Francisco (SFO)' },
  { code: 'BOS', city: 'Boston', country: 'USA', displayName: 'Boston (BOS)' },
  { code: 'SEA', city: 'Seattle', country: 'USA', displayName: 'Seattle (SEA)' },
  { code: 'LAS', city: 'Las Vegas', country: 'USA', displayName: 'Las Vegas (LAS)' },
  { code: 'MCO', city: 'Orlando', country: 'USA', displayName: 'Orlando (MCO)' },
  { code: 'PHX', city: 'Phoenix', country: 'USA', displayName: 'Phoenix (PHX)' },
  { code: 'DEN', city: 'Denver', country: 'USA', displayName: 'Denver (DEN)' },
  { code: 'ATL', city: 'Atlanta', country: 'USA', displayName: 'Atlanta (ATL)' },
  { code: 'DFW', city: 'Dallas', country: 'USA', displayName: 'Dallas (DFW)' },
  { code: 'IAH', city: 'Houston', country: 'USA', displayName: 'Houston (IAH)' },
  { code: 'DTW', city: 'Detroit', country: 'USA', displayName: 'Detroit (DTW)' },
  { code: 'MSP', city: 'Minneapolis', country: 'USA', displayName: 'Minneapolis (MSP)' },
  { code: 'PHL', city: 'Philadelphia', country: 'USA', displayName: 'Philadelphia (PHL)' },
  { code: 'CLT', city: 'Charlotte', country: 'USA', displayName: 'Charlotte (CLT)' },
  { code: 'SLC', city: 'Salt Lake City', country: 'USA', displayName: 'Salt Lake City (SLC)' },
  { code: 'SAN', city: 'San Diego', country: 'USA', displayName: 'San Diego (SAN)' },
  { code: 'TPA', city: 'Tampa', country: 'USA', displayName: 'Tampa (TPA)' },
  { code: 'PDX', city: 'Portland', country: 'USA', displayName: 'Portland (PDX)' },
  { code: 'STL', city: 'St. Louis', country: 'USA', displayName: 'St. Louis (STL)' },
  { code: 'BWI', city: 'Baltimore', country: 'USA', displayName: 'Baltimore (BWI)' },
  { code: 'DCA', city: 'Washington', country: 'USA', displayName: 'Washington DC (DCA)' },
  { code: 'FLL', city: 'Fort Lauderdale', country: 'USA', displayName: 'Fort Lauderdale (FLL)' },

  // Europe
  { code: 'LHR', city: 'London', country: 'UK', displayName: 'London - Heathrow (LHR)' },
  { code: 'LGW', city: 'London', country: 'UK', displayName: 'London - Gatwick (LGW)' },
  { code: 'STN', city: 'London', country: 'UK', displayName: 'London - Stansted (STN)' },
  { code: 'CDG', city: 'Paris', country: 'France', displayName: 'Paris - Charles de Gaulle (CDG)' },
  { code: 'ORY', city: 'Paris', country: 'France', displayName: 'Paris - Orly (ORY)' },
  { code: 'FRA', city: 'Frankfurt', country: 'Germany', displayName: 'Frankfurt (FRA)' },
  { code: 'AMS', city: 'Amsterdam', country: 'Netherlands', displayName: 'Amsterdam (AMS)' },
  { code: 'ZUR', city: 'Zurich', country: 'Switzerland', displayName: 'Zurich (ZUR)' },
  { code: 'IST', city: 'Istanbul', country: 'Turkey', displayName: 'Istanbul (IST)' },
  { code: 'BER', city: 'Berlin', country: 'Germany', displayName: 'Berlin (BER)' },
  { code: 'FCO', city: 'Rome', country: 'Italy', displayName: 'Rome (FCO)' },
  { code: 'MAD', city: 'Madrid', country: 'Spain', displayName: 'Madrid (MAD)' },
  { code: 'BCN', city: 'Barcelona', country: 'Spain', displayName: 'Barcelona (BCN)' },
  { code: 'VIE', city: 'Vienna', country: 'Austria', displayName: 'Vienna (VIE)' },
  { code: 'BRU', city: 'Brussels', country: 'Belgium', displayName: 'Brussels (BRU)' },
  { code: 'MUC', city: 'Munich', country: 'Germany', displayName: 'Munich (MUC)' },
  { code: 'CPH', city: 'Copenhagen', country: 'Denmark', displayName: 'Copenhagen (CPH)' },
  { code: 'ARN', city: 'Stockholm', country: 'Sweden', displayName: 'Stockholm (ARN)' },
  { code: 'OSL', city: 'Oslo', country: 'Norway', displayName: 'Oslo (OSL)' },
  { code: 'HEL', city: 'Helsinki', country: 'Finland', displayName: 'Helsinki (HEL)' },
  { code: 'DUB', city: 'Dublin', country: 'Ireland', displayName: 'Dublin (DUB)' },
  { code: 'LIS', city: 'Lisbon', country: 'Portugal', displayName: 'Lisbon (LIS)' },
  { code: 'WAW', city: 'Warsaw', country: 'Poland', displayName: 'Warsaw (WAW)' },
  { code: 'PRG', city: 'Prague', country: 'Czech Republic', displayName: 'Prague (PRG)' },
  { code: 'BUD', city: 'Budapest', country: 'Hungary', displayName: 'Budapest (BUD)' },
  { code: 'ATH', city: 'Athens', country: 'Greece', displayName: 'Athens (ATH)' },
  { code: 'MXP', city: 'Milan', country: 'Italy', displayName: 'Milan (MXP)' },
  { code: 'VCE', city: 'Venice', country: 'Italy', displayName: 'Venice (VCE)' },
  { code: 'FLR', city: 'Florence', country: 'Italy', displayName: 'Florence (FLR)' },
  { code: 'NCE', city: 'Nice', country: 'France', displayName: 'Nice (NCE)' },
  { code: 'LYS', city: 'Lyon', country: 'France', displayName: 'Lyon (LYS)' },
  { code: 'MRS', city: 'Marseille', country: 'France', displayName: 'Marseille (MRS)' },

  // Asia Pacific
  { code: 'NRT', city: 'Tokyo', country: 'Japan', displayName: 'Tokyo - Narita (NRT)' },
  { code: 'HND', city: 'Tokyo', country: 'Japan', displayName: 'Tokyo - Haneda (HND)' },
  { code: 'KIX', city: 'Osaka', country: 'Japan', displayName: 'Osaka (KIX)' },
  { code: 'SIN', city: 'Singapore', country: 'Singapore', displayName: 'Singapore (SIN)' },
  { code: 'HKG', city: 'Hong Kong', country: 'Hong Kong', displayName: 'Hong Kong (HKG)' },
  { code: 'BKK', city: 'Bangkok', country: 'Thailand', displayName: 'Bangkok (BKK)' },
  { code: 'ICN', city: 'Seoul', country: 'South Korea', displayName: 'Seoul (ICN)' },
  { code: 'SYD', city: 'Sydney', country: 'Australia', displayName: 'Sydney (SYD)' },
  { code: 'MEL', city: 'Melbourne', country: 'Australia', displayName: 'Melbourne (MEL)' },
  { code: 'BOM', city: 'Mumbai', country: 'India', displayName: 'Mumbai (BOM)' },
  { code: 'DEL', city: 'Delhi', country: 'India', displayName: 'Delhi (DEL)' },
  { code: 'BLR', city: 'Bangalore', country: 'India', displayName: 'Bangalore (BLR)' },
  { code: 'MAA', city: 'Chennai', country: 'India', displayName: 'Chennai (MAA)' },
  { code: 'CCU', city: 'Kolkata', country: 'India', displayName: 'Kolkata (CCU)' },
  { code: 'HYD', city: 'Hyderabad', country: 'India', displayName: 'Hyderabad (HYD)' },
  { code: 'PNQ', city: 'Pune', country: 'India', displayName: 'Pune (PNQ)' },
  { code: 'AMD', city: 'Ahmedabad', country: 'India', displayName: 'Ahmedabad (AMD)' },
  { code: 'DXB', city: 'Dubai', country: 'UAE', displayName: 'Dubai (DXB)' },
  { code: 'DOH', city: 'Doha', country: 'Qatar', displayName: 'Doha (DOH)' },
  { code: 'PEK', city: 'Beijing', country: 'China', displayName: 'Beijing (PEK)' },
  { code: 'PVG', city: 'Shanghai', country: 'China', displayName: 'Shanghai (PVG)' },
  { code: 'CAN', city: 'Guangzhou', country: 'China', displayName: 'Guangzhou (CAN)' },
  { code: 'SZX', city: 'Shenzhen', country: 'China', displayName: 'Shenzhen (SZX)' },
  { code: 'TPE', city: 'Taipei', country: 'Taiwan', displayName: 'Taipei (TPE)' },
  { code: 'MNL', city: 'Manila', country: 'Philippines', displayName: 'Manila (MNL)' },
  { code: 'CGK', city: 'Jakarta', country: 'Indonesia', displayName: 'Jakarta (CGK)' },
  { code: 'KUL', city: 'Kuala Lumpur', country: 'Malaysia', displayName: 'Kuala Lumpur (KUL)' },
  { code: 'SGN', city: 'Ho Chi Minh City', country: 'Vietnam', displayName: 'Ho Chi Minh City (SGN)' },
  { code: 'HAN', city: 'Hanoi', country: 'Vietnam', displayName: 'Hanoi (HAN)' },
  { code: 'PNH', city: 'Phnom Penh', country: 'Cambodia', displayName: 'Phnom Penh (PNH)' },
  { code: 'RGN', city: 'Yangon', country: 'Myanmar', displayName: 'Yangon (RGN)' },
  { code: 'CMB', city: 'Colombo', country: 'Sri Lanka', displayName: 'Colombo (CMB)' },
  { code: 'KTM', city: 'Kathmandu', country: 'Nepal', displayName: 'Kathmandu (KTM)' },
  { code: 'DAC', city: 'Dhaka', country: 'Bangladesh', displayName: 'Dhaka (DAC)' },
  { code: 'KHI', city: 'Karachi', country: 'Pakistan', displayName: 'Karachi (KHI)' },
  { code: 'LHE', city: 'Lahore', country: 'Pakistan', displayName: 'Lahore (LHE)' },
  { code: 'ISB', city: 'Islamabad', country: 'Pakistan', displayName: 'Islamabad (ISB)' },
  { code: 'BNE', city: 'Brisbane', country: 'Australia', displayName: 'Brisbane (BNE)' },
  { code: 'PER', city: 'Perth', country: 'Australia', displayName: 'Perth (PER)' },
  { code: 'ADL', city: 'Adelaide', country: 'Australia', displayName: 'Adelaide (ADL)' },
  { code: 'AKL', city: 'Auckland', country: 'New Zealand', displayName: 'Auckland (AKL)' },
  { code: 'WLG', city: 'Wellington', country: 'New Zealand', displayName: 'Wellington (WLG)' },
  { code: 'CHC', city: 'Christchurch', country: 'New Zealand', displayName: 'Christchurch (CHC)' },

  // Middle East & Africa
  { code: 'CAI', city: 'Cairo', country: 'Egypt', displayName: 'Cairo (CAI)' },
  { code: 'JNB', city: 'Johannesburg', country: 'South Africa', displayName: 'Johannesburg (JNB)' },
  { code: 'CPT', city: 'Cape Town', country: 'South Africa', displayName: 'Cape Town (CPT)' },
  { code: 'NBO', city: 'Nairobi', country: 'Kenya', displayName: 'Nairobi (NBO)' },
  { code: 'ADD', city: 'Addis Ababa', country: 'Ethiopia', displayName: 'Addis Ababa (ADD)' },
  { code: 'LOS', city: 'Lagos', country: 'Nigeria', displayName: 'Lagos (LOS)' },
  { code: 'ABV', city: 'Abuja', country: 'Nigeria', displayName: 'Abuja (ABV)' },
  { code: 'ACC', city: 'Accra', country: 'Ghana', displayName: 'Accra (ACC)' },
  { code: 'TLV', city: 'Tel Aviv', country: 'Israel', displayName: 'Tel Aviv (TLV)' },
  { code: 'AMM', city: 'Amman', country: 'Jordan', displayName: 'Amman (AMM)' },
  { code: 'BEY', city: 'Beirut', country: 'Lebanon', displayName: 'Beirut (BEY)' },
  { code: 'KWI', city: 'Kuwait City', country: 'Kuwait', displayName: 'Kuwait City (KWI)' },
  { code: 'BAH', city: 'Manama', country: 'Bahrain', displayName: 'Manama (BAH)' },
  { code: 'MCT', city: 'Muscat', country: 'Oman', displayName: 'Muscat (MCT)' },
  { code: 'AUH', city: 'Abu Dhabi', country: 'UAE', displayName: 'Abu Dhabi (AUH)' },
  { code: 'SHJ', city: 'Sharjah', country: 'UAE', displayName: 'Sharjah (SHJ)' },
  { code: 'RUH', city: 'Riyadh', country: 'Saudi Arabia', displayName: 'Riyadh (RUH)' },
  { code: 'JED', city: 'Jeddah', country: 'Saudi Arabia', displayName: 'Jeddah (JED)' },
  { code: 'DMM', city: 'Dammam', country: 'Saudi Arabia', displayName: 'Dammam (DMM)' },

  // Americas
  { code: 'YYZ', city: 'Toronto', country: 'Canada', displayName: 'Toronto (YYZ)' },
  { code: 'YVR', city: 'Vancouver', country: 'Canada', displayName: 'Vancouver (YVR)' },
  { code: 'YUL', city: 'Montreal', country: 'Canada', displayName: 'Montreal (YUL)' },
  { code: 'YYC', city: 'Calgary', country: 'Canada', displayName: 'Calgary (YYC)' },
  { code: 'YEG', city: 'Edmonton', country: 'Canada', displayName: 'Edmonton (YEG)' },
  { code: 'MEX', city: 'Mexico City', country: 'Mexico', displayName: 'Mexico City (MEX)' },
  { code: 'CUN', city: 'Cancun', country: 'Mexico', displayName: 'Cancun (CUN)' },
  { code: 'GDL', city: 'Guadalajara', country: 'Mexico', displayName: 'Guadalajara (GDL)' },
  { code: 'GRU', city: 'São Paulo', country: 'Brazil', displayName: 'São Paulo (GRU)' },
  { code: 'GIG', city: 'Rio de Janeiro', country: 'Brazil', displayName: 'Rio de Janeiro (GIG)' },
  { code: 'BSB', city: 'Brasília', country: 'Brazil', displayName: 'Brasília (BSB)' },
  { code: 'EZE', city: 'Buenos Aires', country: 'Argentina', displayName: 'Buenos Aires (EZE)' },
  { code: 'SCL', city: 'Santiago', country: 'Chile', displayName: 'Santiago (SCL)' },
  { code: 'LIM', city: 'Lima', country: 'Peru', displayName: 'Lima (LIM)' },
  { code: 'BOG', city: 'Bogotá', country: 'Colombia', displayName: 'Bogotá (BOG)' },
  { code: 'UIO', city: 'Quito', country: 'Ecuador', displayName: 'Quito (UIO)' },
  { code: 'CCS', city: 'Caracas', country: 'Venezuela', displayName: 'Caracas (CCS)' },
  { code: 'PTY', city: 'Panama City', country: 'Panama', displayName: 'Panama City (PTY)' },
  { code: 'SJO', city: 'San José', country: 'Costa Rica', displayName: 'San José (SJO)' },
  { code: 'GUA', city: 'Guatemala City', country: 'Guatemala', displayName: 'Guatemala City (GUA)' },
  { code: 'SAL', city: 'San Salvador', country: 'El Salvador', displayName: 'San Salvador (SAL)' },
  { code: 'TGU', city: 'Tegucigalpa', country: 'Honduras', displayName: 'Tegucigalpa (TGU)' },
  { code: 'MGA', city: 'Managua', country: 'Nicaragua', displayName: 'Managua (MGA)' },
  { code: 'HAV', city: 'Havana', country: 'Cuba', displayName: 'Havana (HAV)' },
  { code: 'KIN', city: 'Kingston', country: 'Jamaica', displayName: 'Kingston (KIN)' },
  { code: 'SXM', city: 'St. Maarten', country: 'St. Maarten', displayName: 'St. Maarten (SXM)' },
  { code: 'BGI', city: 'Bridgetown', country: 'Barbados', displayName: 'Bridgetown (BGI)' },
  { code: 'POS', city: 'Port of Spain', country: 'Trinidad and Tobago', displayName: 'Port of Spain (POS)' },
  { code: 'POM', city: 'Port Moresby', country: 'Papua New Guinea', displayName: 'Port Moresby (POM)' },
];

export function AirportSelector({ value, onChange, placeholder = "Select airport", className }: AirportSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAirports = useMemo(() => {
    if (!searchQuery) return airports;
    
    const query = searchQuery.toLowerCase();
    return airports.filter(airport =>
      airport.city.toLowerCase().includes(query) ||
      airport.code.toLowerCase().includes(query) ||
      airport.displayName.toLowerCase().includes(query) ||
      (airport.country && airport.country.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const selectedAirport = airports.find(airport => airport.code === value || airport.city === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedAirport ? (
            <span className="flex items-center truncate">
              <span className="font-medium">{selectedAirport.code}</span>
              <span className="ml-2 text-gray-500 truncate">{selectedAirport.city}</span>
            </span>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search airports..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No airports found.</CommandEmpty>
            <CommandGroup>
              {filteredAirports.slice(0, 100).map((airport) => (
                <CommandItem
                  key={airport.code}
                  value={airport.code}
                  onSelect={() => {
                    onChange(airport.city);
                    setOpen(false);
                  }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <span className="font-medium mr-2">{airport.code}</span>
                    <span className="text-gray-600">{airport.city}</span>
                    {airport.country && (
                      <span className="text-gray-400 ml-2">({airport.country})</span>
                    )}
                  </div>
                  <Check
                    className={cn(
                      "h-4 w-4",
                      (selectedAirport?.code === airport.code || selectedAirport?.city === airport.city) ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}