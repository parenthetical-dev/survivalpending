'use client';

import React, { useState, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  GeographyProps
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

// Privacy threshold - states need at least this many stories to be clickable
const PRIVACY_THRESHOLD = 5;

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
  const [totalStates, setTotalStates] = useState(0);
  const [showInsufficientDataMessage, setShowInsufficientDataMessage] = useState(false);
  const [clickedInactiveState, setClickedInactiveState] = useState<string | null>(null);

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
        setTotalStates(data.statesWithData || 0);
      }
    } catch (error) {
      console.error('Error fetching map data:', error);
    } finally {
      setLoading(false);
    }
  }

  const isStateActive = (stateAbbr: string) => {
    const state = stateData.find(s => s.state === stateAbbr);
    return state ? state.count >= PRIVACY_THRESHOLD : false;
  };

  const getStateColor = (geo: any) => {
    const stateId = geo.id;
    const stateAbbr = STATE_FIPS_TO_ABBR[stateId];
    if (!stateAbbr) return '#e5e7eb'; // Lighter gray for unknown
    
    const state = stateData.find(s => s.state === stateAbbr);
    if (!state || state.count === 0) return '#e5e7eb'; // Lighter gray for no data
    
    const isActive = isStateActive(stateAbbr);
    const isSelected = selectedState === stateAbbr;
    const isHovered = hoveredState === stateAbbr;
    
    if (isSelected && isActive) {
      return '#7c3aed'; // Purple for selected
    }
    
    // States below threshold get a special treatment
    if (!isActive) {
      return isHovered ? '#d1d5db' : '#e5e7eb'; // Lighter gray, slightly darker on hover
    }
    
    // Create a gradient from powdery purple to saturated purple
    // Using HSL for better color interpolation
    const minHue = 280; // Purple hue
    const maxHue = 280; // Keep same hue
    const minSat = 30; // Low saturation (powdery)
    const maxSat = 80; // High saturation (vibrant)
    const minLight = 75; // Light (powdery)
    const maxLight = 50; // Darker (saturated)
    
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
    const count = state?.count || 0;
    const isActive = count >= PRIVACY_THRESHOLD;
    return {
      name: STATE_NAMES[stateAbbr] || stateAbbr,
      count,
      isActive
    };
  };

  const handleGeographyClick = (geo: any) => {
    const stateId = geo.id;
    const stateAbbr = STATE_FIPS_TO_ABBR[stateId];
    if (!stateAbbr) return;
    
    const isActive = isStateActive(stateAbbr);
    if (isActive) {
      const state = stateData.find(s => s.state === stateAbbr);
      console.log(`Clicked ${stateAbbr} with ${state?.count || 0} stories`);
      onStateSelect(selectedState === stateAbbr ? null : stateAbbr);
      setShowInsufficientDataMessage(false);
      setClickedInactiveState(null);
    } else {
      console.log(`Clicked ${stateAbbr} but it has insufficient stories`);
      setShowInsufficientDataMessage(true);
      setClickedInactiveState(stateAbbr);
      setTimeout(() => {
        setShowInsufficientDataMessage(false);
        setClickedInactiveState(null);
      }, 3000);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
        <span className="text-gray-500">Loading map...</span>
      </div>
    );
  }

  // Count active states (those with enough stories)
  const activeStatesCount = stateData.filter(s => s.count >= PRIVACY_THRESHOLD).length;

  return (
    <div className="w-full">
      {/* Privacy info banner */}
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-purple-900 dark:text-purple-100 mb-1">Privacy First</h3>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              To protect storyteller anonymity, states are only clickable once they have at least {PRIVACY_THRESHOLD} stories. 
              This prevents individual stories from being identifiable by location.
            </p>
            <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
              Stories from <strong>{activeStatesCount} states</strong> so far.
            </p>
          </div>
        </div>
      </div>

      {selectedState && (
        <div className="flex items-center gap-2 mb-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Filtering by: {STATE_NAMES[selectedState]}
          </p>
          <button 
            onClick={() => onStateSelect(null)}
            className="text-xs text-purple-600 hover:text-purple-800 underline"
          >
            Clear filter
          </button>
        </div>
      )}
      
      <div className="relative">
        <ComposableMap projection="geoAlbersUsa" className="w-full">
          <Geographies geography={geoUrl}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => {
                const stateAbbr = STATE_FIPS_TO_ABBR[geo.id];
                const isActive = stateAbbr ? isStateActive(stateAbbr) : false;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getStateColor(geo)}
                    stroke="#d1d5db"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none', cursor: isActive ? 'pointer' : 'not-allowed' },
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
        
        {/* Hover tooltip */}
        {hoveredState && (
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-90 text-white px-3 py-2 rounded-lg text-sm pointer-events-none">
            {(() => {
              const info = getStateInfo(hoveredState);
              if (!info.isActive) {
                return `${info.name}: Insufficient data`;
              }
              return `${info.name}: ${info.count} ${info.count === 1 ? 'story' : 'stories'}`;
            })()}
          </div>
        )}
        
        {/* Insufficient data message */}
        {showInsufficientDataMessage && clickedInactiveState && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg px-4 py-2 shadow-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              {STATE_NAMES[clickedInactiveState]} doesn't have enough stories yet to protect individual privacy.
            </p>
          </div>
        )}
      </div>
      
      <div className="mt-4 max-w-xs">
        {/* Gradient Legend */}
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
          <span>Story Density</span>
        </div>
        
        <div className="relative">
          {/* Gradient bar */}
          <div 
            className="h-2 w-full rounded-full" 
            style={{
              background: stateData.length > 0 
                ? 'linear-gradient(to right, #e5e7eb, hsl(280, 30%, 75%), hsl(280, 55%, 62%), hsl(280, 80%, 50%))'
                : 'linear-gradient(to right, #e5e7eb, #e5e7eb)'
            }}
          />
          
          {/* Labels */}
          <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-500">
            <span>0</span>
            <span>{Math.max(...stateData.map(s => s.count), 1)}</span>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
          Click active states to filter stories
        </div>
      </div>
    </div>
  );
}