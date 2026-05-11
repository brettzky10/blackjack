// lib/audio-utils.ts

/**
 * Plays a sound effect.
 * In a real application, this function would use the Web Audio API or HTMLAudioElement
 * to play actual sound files. For this v0 environment, it will log to the console.
 *
 * @param soundName - A descriptive name of the sound to play (e.g., "card_deal.mp3").
 */
export function playSound(soundName: string): void {
  if (typeof window !== "undefined") {
    console.log(`🔊 Playing sound: ${soundName}`)
    // Example with actual audio (requires sound files in /public/sounds/):
    // const audio = new Audio(`/sounds/${soundName}`);
    // audio.play().catch(error => console.error(`Error playing sound ${soundName}:`, error));
  }
}
