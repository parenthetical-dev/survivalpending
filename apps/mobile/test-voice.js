// Test script to verify voice generation configuration
const VOICE_IDS = [
  'EXAVITQu4vr4xnSDxMaL', // Sarah
  'MF3mGyEYCl7XYWbV9V6O', // Emily
  'TxGEqnHWrfWFTfGW9XjX', // Josh
  'VR6AewLTigWG4xSOukaG', // Arnold
  'pNInz6obpgDQGcFmaJgB', // Adam
  'yoZ06aMxZJJ28mfd3POQ', // Sam
  'AZnzlk1XvdvUeBnXmlld', // Domi
  'ThT5KcBeYPX3keUQqHPh', // Bella
];

console.log('Voice IDs configuration for mobile app:');
VOICE_IDS.forEach((id, index) => {
  console.log(`Voice ${index + 1}: ${id}`);
});

console.log('\nMake sure the mobile app uses these exact IDs when calling the web API.');
console.log('The web API expects these specific ElevenLabs voice IDs.');