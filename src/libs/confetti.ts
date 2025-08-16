import confetti from 'canvas-confetti';

export function triggerDoctorConfetti() {
  const end = Date.now() + (3 * 1000);

  // Doctor-themed emojis
  const doctorEmojis = ['🩺', '💊', '🏥', '🧑‍⚕️', '👩‍⚕️', '📋', '💉', '🔬', '⚕️', '🏩', '🩹', '💺'];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      shapes: doctorEmojis.map(emoji => confetti.shapeFromText({ text: emoji, scalar: 5 })),
      scalar: 2,
      startVelocity: 30,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      shapes: doctorEmojis.map(emoji => confetti.shapeFromText({ text: emoji, scalar: 5 })),
      scalar: 1.2,
      startVelocity: 30,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
}
