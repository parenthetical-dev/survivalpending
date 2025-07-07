/**
 * Privacy-preserving utility functions for handling sensitive data
 */

/**
 * Formats story count to preserve privacy by avoiding exact numbers
 * @param count - The actual story count
 * @returns A privacy-preserving string representation
 */
export function formatStoryCount(count: number): string {
  if (count < 5) {
    return "< 5";
  } else if (count < 10) {
    return "< 10";
  } else {
    // Round to nearest 5 for privacy
    return `~${Math.round(count / 5) * 5}`;
  }
}

/**
 * Determines if a state has enough stories to be considered "active"
 * @param count - The number of stories from a state
 * @returns True if the state has 5 or more stories
 */
export function isStateActive(count: number): boolean {
  return count >= 5;
}

/**
 * Generates an appropriate privacy message based on state participation
 * @param totalStates - Total number of states in the dataset
 * @param activeStates - Number of states with 5+ stories
 * @returns A descriptive message about geographic diversity
 */
export function getPrivacyMessage(totalStates: number, activeStates: number): string {
  if (activeStates === 0) {
    return "Building our community presence across states";
  } else if (activeStates < 5) {
    return `Stories from ${activeStates} ${activeStates === 1 ? 'state' : 'states'} so far`;
  } else if (activeStates < 10) {
    return `Growing presence in ${activeStates} states`;
  } else if (activeStates < 20) {
    return `Active community in ${activeStates} states`;
  } else if (activeStates < 30) {
    return `Strong presence across ${activeStates} states`;
  } else {
    return `Nationwide presence in ${activeStates} states`;
  }
}

/**
 * TypeScript types for privacy-related data structures
 */

/** Story count data for a single state */
export interface StateStoryCount {
  state: string;
  count: number;
  displayCount: string; // Privacy-preserved count
  isActive: boolean;
}

/** Summary statistics for geographic distribution */
export interface GeographicSummary {
  totalStates: number;
  activeStates: number;
  totalStories: number;
  displayTotalStories: string; // Privacy-preserved total
  privacyMessage: string;
}

/** Privacy settings for data display */
export interface PrivacySettings {
  minStoriesForDisplay: number; // Default: 5
  roundToNearest: number; // Default: 5
  showExactCounts: boolean; // Default: false
}

/** Aggregated demographic data with privacy protection */
export interface PrivacyDemographics {
  ageRanges: {
    range: string;
    count: number;
    displayCount: string;
    percentage?: number; // Only show if enough data
  }[];
  genderIdentities: {
    identity: string;
    count: number;
    displayCount: string;
    percentage?: number;
  }[];
  totalResponses: number;
  displayTotalResponses: string;
}

/**
 * Helper function to create a privacy-protected state count object
 */
export function createStateStoryCount(state: string, count: number): StateStoryCount {
  return {
    state,
    count,
    displayCount: formatStoryCount(count),
    isActive: isStateActive(count),
  };
}

/**
 * Helper function to create a geographic summary with privacy protection
 */
export function createGeographicSummary(
  stateCounts: StateStoryCount[]
): GeographicSummary {
  const activeStates = stateCounts.filter(s => s.isActive).length;
  const totalStories = stateCounts.reduce((sum, s) => sum + s.count, 0);
  
  return {
    totalStates: stateCounts.length,
    activeStates,
    totalStories,
    displayTotalStories: formatStoryCount(totalStories),
    privacyMessage: getPrivacyMessage(stateCounts.length, activeStates),
  };
}