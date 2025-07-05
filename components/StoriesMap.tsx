'use client';

import React, { useState, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from 'react-simple-maps';

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

interface StateData {
  state: string;
  count: number;
  density: number; // 0-1 scale for color intensity
}

interface StoriesMapProps {
  onStateSelect: (state: string | null) => void;
  selectedState: string | null;
}

// Map of state FIPS codes to abbreviations (for the TopoJSON data)
const STATE_FIPS_TO_ABBR: { [key: string]: string } = {
  '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA', '08': 'CO', '09': 'CT', '10': 'DE',
  '11': 'DC', '12': 'FL', '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL', '18': 'IN', '19': 'IA',
  '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME', '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN',
  '28': 'MS', '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH', '34': 'NJ', '35': 'NM',
  '36': 'NY', '37': 'NC', '38': 'ND', '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI',
  '45': 'SC', '46': 'SD', '47': 'TN', '48': 'TX', '49': 'UT', '50': 'VT', '51': 'VA', '53': 'WA',
  '54': 'WV', '55': 'WI', '56': 'WY'
};

const STATE_NAMES: { [key: string]: string } = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
  'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
  'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
  'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
  'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
  'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
  'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
  'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
  'DC': 'District of Columbia'
};

export default function StoriesMap({ onStateSelect, selectedState }: StoriesMapProps) {
  const [stateData, setStateData] = useState<StateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchStateData();
  }, []);

  async function fetchStateData() {
    try {
      const response = await fetch('/api/stories/map-data-synced');
      if (response.ok) {
        const data = await response.json();
        setStateData(data.states);
      }
    } catch (error) {
      console.error('Error fetching map data:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStateColor = (geo: any) => {
    const stateId = geo.id;
    const stateAbbr = STATE_FIPS_TO_ABBR[stateId];
    if (!stateAbbr) return '#e5e7eb'; // Gray for unknown
    
    const state = stateData.find(s => s.state === stateAbbr);
    if (!state || state.count === 0) return '#e5e7eb'; // Gray for no data
    
    const isSelected = selectedState === stateAbbr;
    const isHovered = hoveredState === stateAbbr;
    
    if (isSelected) {
      return '#dc2626'; // Red for selected
    }
    
    // Create a continuous gradient from light blue to dark blue
    // Using HSL for better color interpolation
    const minHue = 210; // Light blue
    const maxHue = 220; // Darker blue
    const minSat = 70;
    const maxSat = 90;
    const minLight = 80;
    const maxLight = 40;
    
    // Use density (0-1) to interpolate
    const hue = minHue + (maxHue - minHue) * state.density;
    const saturation = minSat + (maxSat - minSat) * state.density;
    const lightness = minLight - (minLight - maxLight) * state.density;
    
    // Add hover effect
    const adjustedLightness = isHovered ? lightness - 10 : lightness;
    
    return `hsl(${hue}, ${saturation}%, ${adjustedLightness}%)`;
  };

  const getStateInfo = (stateAbbr: string) => {
    const state = stateData.find(s => s.state === stateAbbr);
    return {
      name: STATE_NAMES[stateAbbr] || stateAbbr,
      count: state?.count || 0
    };
  };

  const handleGeographyClick = (geo: any) => {
    const stateId = geo.id;
    const stateAbbr = STATE_FIPS_TO_ABBR[stateId];
    if (!stateAbbr) return;
    
    const state = stateData.find(s => s.state === stateAbbr);
    if (state && state.count > 0) {
      console.log(`Clicked ${stateAbbr} with ${state.count} stories`);
      onStateSelect(selectedState === stateAbbr ? null : stateAbbr);
    } else {
      console.log(`Clicked ${stateAbbr} but it has no stories`);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
        <span className="text-gray-500">Loading map...</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Stories Across America</h3>
        {selectedState && (
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Filtering by: {STATE_NAMES[selectedState]}
            </p>
            <button 
              onClick={() => onStateSelect(null)}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Clear filter
            </button>
          </div>
        )}
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border relative">
        <ComposableMap projection="geoAlbersUsa" className="w-full">
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const stateAbbr = STATE_FIPS_TO_ABBR[geo.id];
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getStateColor(geo)}
                    stroke="#ffffff"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none', cursor: stateAbbr && stateData.find(s => s.state === stateAbbr)?.count > 0 ? 'pointer' : 'default' },
                      pressed: { outline: 'none' }
                    }}
                    onMouseEnter={() => {
                      if (stateAbbr) setHoveredState(stateAbbr);
                    }}
                    onMouseLeave={() => {
                      setHoveredState(null);
                    }}
                    onClick={() => handleGeographyClick(geo)}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
        
        {hoveredState && (
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm pointer-events-none">
            {(() => {
              const info = getStateInfo(hoveredState);
              return `${info.name}: ${info.count} ${info.count === 1 ? 'story' : 'stories'}`;
            })()}
          </div>
        )}
      </div>
      
      <div className="mt-4 space-y-3">
        {/* Gradient Legend */}
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <span>Story Density</span>
          <span>Click a state to filter stories</span>
        </div>
        
        <div className="relative">
          {/* Gradient bar */}
          <div 
            className="h-3 w-full rounded-full" 
            style={{
              background: stateData.length > 0 
                ? 'linear-gradient(to right, #e5e7eb, hsl(210, 70%, 80%), hsl(215, 80%, 60%), hsl(220, 90%, 40%))'
                : 'linear-gradient(to right, #e5e7eb, #e5e7eb)'
            }}
          />
          
          {/* Labels */}
          <div className="flex justify-between mt-1 text-xs text-gray-600 dark:text-gray-400">
            <span>0</span>
            <span>{Math.ceil(Math.max(...stateData.map(s => s.count), 1) / 2)}</span>
            <span>{Math.max(...stateData.map(s => s.count), 1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}