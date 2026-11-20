"""Generate two additional soft instrumental tracks for the wedding music player."""
import numpy as np
import wave
import subprocess

SR = 44100

def ks_pluck(freq, dur, decay=0.996, amp=0.5):
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

def bell(freq, dur, amp=0.2):
    """Soft bell/glockenspiel-like tone."""
    n = int(SR * dur)
    t = np.arange(n) / SR
    env = np.exp(-2.2 * t)
    tone = (np.sin(2 * np.pi * freq * t) + 0.4 * np.sin(2 * np.pi * freq * 2.76 * t)) * env * amp
    fade = int(SR * 0.01)
    tone[:fade] *= np.linspace(0, 1, fade)
    return tone

def sine_pad(freq, dur, amp=0.12):
    n = int(SR * dur)
    t = np.arange(n) / SR
    env = np.minimum(t / 1.2, 1.0) * np.exp(-0.3 * np.maximum(t - 1.5, 0))
    return (np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(4 * np.pi * freq * t)) * env * amp

NOTE = {
    'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
    'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51,
}


def render_track(prog, beat, melody=None, pluck_amp=0.28, pad_amp=0.11, reps=2, out_name='track.mp3'):
    seg = int(SR * beat * 8)
    total = seg * len(prog) * reps
    mix = np.zeros(total)
    pos = 0
    for rep in range(reps):
        for bi, (bass, tones) in enumerate(prog):
            pad = sine_pad(NOTE[bass], beat * 8, amp=pad_amp)
            end = min(pos + len(pad), total)
            mix[pos:end] += pad[:end - pos]
            for i, tname in enumerate(tones):
                f = NOTE.get(tname)
                if f is None:
                    continue
                pluck = ks_pluck(f, beat * 1.6, decay=0.995, amp=pluck_amp)
                start = pos + int(i * beat * SR)
                end = min(start + len(pluck), total)
                mix[start:end] += pluck[:end - start]
            # melody notes (one per chord, on beat 2 and 5)
            if melody:
                for mi, mname in enumerate(melody[(rep * len(prog) + bi) % len(melody)]):
                    f = NOTE.get(mname)
                    if f is None:
                        continue
                    bellnote = bell(f, beat * 3, amp=0.16)
                    start = pos + int((2 + mi * 3) * beat * SR)
                    end = min(start + len(bellnote), total)
                    if start < total:
                        mix[start:end] += bellnote[:end - start]
            pos += seg
    mix = mix / np.max(np.abs(mix)) * 0.72
    fade = int(SR * 1.5)
    mix[:fade] *= np.linspace(0, 1, fade)
    mix[-fade:] *= np.linspace(1, 0, fade)
    pcm = (mix * 32767).astype(np.int16)
    wav_path = f'/tmp/{out_name}.wav'
    with wave.open(wav_path, 'w') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', wav_path,
                    '-codec:a', 'libmp3lame', '-qscale:a', '4',
                    f'/home/z/my-project/public/invitation/{out_name}'], check=True)
    print(out_name, 'generated', round(total / SR, 1), 'seconds')


# Track 2: "Kisah Kita" - slower, warm (C G Am F)
prog2 = [
    ('C3', ['E4', 'G4', 'C5', 'G4', 'E4', 'G4', 'C5', 'G4']),
    ('G3', ['D4', 'G4', 'B4', 'G4', 'D4', 'G4', 'B4', 'G4']),
    ('A3', ['C4', 'E4', 'A4', 'E4', 'C5', 'E4', 'A4', 'E4']),
    ('F3', ['A4', 'C5', 'F4', 'C5', 'A4', 'F5', 'C5', 'A4']),
]
render_track(prog2, beat=0.52, pluck_amp=0.30, pad_amp=0.12, reps=2, out_name='track2.mp3')

# Track 3: "Selamanya" - brighter with bell melody (F C G Am)
prog3 = [
    ('F3', ['A4', 'C5', 'F4', 'C5', 'F4', 'A4', 'C5', 'A4']),
    ('C3', ['G4', 'C5', 'E4', 'C5', 'E4', 'G4', 'C5', 'G4']),
    ('G3', ['B4', 'D4', 'G4', 'B4', 'G4', 'B4', 'D5', 'B4']),
    ('A3', ['E4', 'A4', 'C5', 'A4', 'E4', 'A4', 'C5', 'E4']),
]
melody3 = [
    ['A5', 'G5', 'F5'],      # over F
    ['E5', 'G5', 'C6'],      # over C
    ['D5', 'B5', 'G5'],      # over G
    ['C5', 'E5', 'A5'],      # over Am
]
render_track(prog3, beat=0.40, melody=melody3, pluck_amp=0.24, pad_amp=0.09, reps=2, out_name='track3.mp3')
