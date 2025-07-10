// Progress Pride flag colors for the gradient
export const progressFlagColors = [
  '#E40303', // Red
  '#FF8C00', // Orange
  '#FFED00', // Yellow
  '#008026', // Green
  '#24408E', // Blue
  '#732982', // Purple
  '#5BCEFA', // Light Blue
  '#F5A9B8', // Pink
  '#FFFFFF', // White
  '#613915', // Brown
];

/**
 * Get a consistent color for a story based on its ID
 * Uses a hash function to ensure the same story always gets the same color
 * Avoids white color (#FFFFFF) for better visibility
 */
export function getStoryColor(storyId: string): string {
  // Simple hash function to get a number from the story ID
  let hash = 0;
  for (let i = 0; i < storyId.length; i++) {
    const char = storyId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Make hash positive
  hash = Math.abs(hash);

  // Get color index, but skip white (index 8)
  const availableColors = progressFlagColors.filter((_, index) => index !== 8);
  const colorIndex = hash % availableColors.length;

  return availableColors[colorIndex];
}