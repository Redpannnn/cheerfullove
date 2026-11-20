"""Generate a soft romantic instrumental loop (Canon in D inspired arpeggio)."""
import numpy as np
import wave

SR = 44100

def ks_pluck(freq, dur, decay=0.996, amp=0.5):
    """Karplus-Strong plucked string."""
    n = int(SR * dur)
    if freq <= 0:
        return np.zeros(n)
    p = max(2, int(SR / freq))
    buf = (np.random.rand(p) * 2 - 1) * 0.5
    buf = np.convolve(buf, [0.5, 0.5], mode='same')
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = decay * 0.5 * (buf[i % p] + buf[(i + 1) % p])
    fade = int(SR * 0.01)
    out[:fade] *= np.linspace(0, 1, fade)
    out[-fade:] *= np.linspace(1, 0, fade)
    return out * amp

def sine_tone(freq, dur, amp=0.15):
    n = int(SR * dur)
    t = np.arange(n) / SR
    env = np.minimum(t / 1.2, 1.0) * np.exp(-0.3 * np.maximum(t - 1.5, 0))
    tone = (np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(4 * np.pi * freq * t)) * env * amp
    return tone

NOTE = {
    'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
    'C6': 1046.50,
}

# Canon in D progression: D A Bm F#m G D G A  (played in comfortable register)
prog = [
    ('D3', ['D4', 'A4', 'F#4', 'A4', 'D5', 'A4', 'F#4', 'A4']),
    ('A3', ['C5', 'E4', 'A4', 'E4', 'C5', 'E4', 'A4', 'E4']),
    ('B3', ['D4', 'F#4', 'B4', 'F#4', 'D5', 'F#4', 'B4', 'F#4']),
    ('F3', ['A4', 'C5', 'F4', 'C5', 'A4', 'C5', 'F4', 'C5']),
    ('G3', ['B4', 'D4', 'G4', 'D4', 'B4', 'D4', 'G4', 'D4']),
    ('D3', ['A4', 'F#4', 'D4', 'F#4', 'A4', 'F#4', 'D4', 'F#4']),
    ('G3', ['G4', 'B4', 'D4', 'B4', 'G4', 'B4', 'D4', 'B4']),
    ('A3', ['A4', 'E4', 'C5', 'E4', 'A4', 'E4', 'C5', 'E4']),
]

beat = 0.42
seg = int(SR * beat * 8)
total = seg * len(prog) * 2
mix = np.zeros(total)

pos = 0
for rep in range(2):
    for bass, tones in prog:
        pad = sine_tone(NOTE[bass], beat * 8, amp=0.12 if rep == 0 else 0.10)
        end = min(pos + len(pad), total)
        mix[pos:end] += pad[:end - pos]
        for i, tname in enumerate(tones):
            f = NOTE.get(tname)
            if f is None:
                continue
            pluck = ks_pluck(f, beat * 1.6, decay=0.995, amp=0.30)
            start = pos + int(i * beat * SR)
            end = min(start + len(pluck), total)
            mix[start:end] += pluck[:end - start] * (1.0 if rep == 1 else 0.85)
        pos += seg

mix = mix / np.max(np.abs(mix)) * 0.75
fade = int(SR * 1.5)
mix[:fade] *= np.linspace(0, 1, fade)
mix[-fade:] *= np.linspace(1, 0, fade)

pcm = (mix * 32767).astype(np.int16)
with wave.open('/home/z/my-project/public/invitation/music.wav', 'w') as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())

print('music.wav generated:', total / SR, 'seconds')
