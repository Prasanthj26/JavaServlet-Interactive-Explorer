/**
 * JAVA SERVLET INTERACTIVE EXPLORER — CORE JAVASCRIPT
 * Modular, Accessible, Zero-Dependency ES6+ Implementation
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. GLOBAL APPLICATION STATE & PERSISTENCE
     ========================================================================== */
  const STORAGE_KEY = 'servlet_explorer_state_v1';

  const defaultState = {
    completedSteps: [],
    beginnerMode: true,
    reduceMotion: false,
    audioEnabled: false,
    masterVolume: 0.7,
    achievements: [],
    gameScore: 0,
    gameIndex: 0,
    quizScore: 0,
    hasRunSimulation: false,
    hasRunLifecycle: false,
    hasTestedMapping: false,
    hasTestedSession: false
  };

  let state = { ...defaultState };

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        state = { ...defaultState, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not read localStorage:', e);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
    updateUIPreferences();
    updateJourneyProgressUI();
    updateAchievementsUI();
  }

  function announceToScreenReader(message) {
    const sr = document.getElementById('sr-announcements');
    if (sr) {
      sr.textContent = '';
      setTimeout(() => { sr.textContent = message; }, 50);
    }
  }

  /* ==========================================================================
     2. FUTURISTIC SYNTHESIZED WEB AUDIO SYSTEM
     Gentle, professional, synchronized audio using Web Audio API
     ========================================================================== */
  let audioCtx = null;
  let masterGainNode = null;

  function initAudio() {
    try {
      if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
        masterGainNode = audioCtx.createGain();
        const vol = state.masterVolume !== undefined ? state.masterVolume : 0.7;
        masterGainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
        masterGainNode.connect(audioCtx.destination);
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    } catch (e) {
      console.warn('AudioContext init error:', e);
    }
  }

  function setMasterVolume(vol) {
    state.masterVolume = Math.max(0, Math.min(1, vol));
    if (masterGainNode && audioCtx) {
      masterGainNode.gain.setValueAtTime(state.masterVolume, audioCtx.currentTime);
    }
    saveState();
  }

  // --- Sound 1: Micro Click (Clean, crisp UI button press) ---
  function playClickSound() {
    if (!state.audioEnabled) return;
    try {
      initAudio();
      if (!audioCtx || !masterGainNode) return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(1150, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(masterGainNode);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {
      console.warn('Click audio error:', e);
    }
  }

  // --- Sound 2: Futuristic Zip ("Zziip!" — fast flying star/particle motion) ---
  function playZipSound() {
    if (!state.audioEnabled) return;
    try {
      initAudio();
      if (!audioCtx || !masterGainNode) return;
      const now = audioCtx.currentTime;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(1850, now + 0.09);

      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(840, now);
      osc2.frequency.exponentialRampToValueAtTime(3200, now + 0.09);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

      gain2.gain.setValueAtTime(0.04, now);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

      osc.connect(gain);
      osc2.connect(gain2);
      gain.connect(masterGainNode);
      gain2.connect(masterGainNode);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.1);
      osc2.stop(now + 0.1);
    } catch (e) {
      console.warn('Zip audio error:', e);
    }
  }

  // --- Sound 3: Soft Airy Whoosh ("Whoooosh..." — smooth aerodynamic energy) ---
  function playWhooshSound() {
    if (!state.audioEnabled) return;
    try {
      initAudio();
      if (!audioCtx || !masterGainNode) return;
      const now = audioCtx.currentTime;
      const duration = 0.35;

      const bufferSize = Math.floor(audioCtx.sampleRate * duration);
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 1.8;
      filter.frequency.setValueAtTime(260, now);
      filter.frequency.exponentialRampToValueAtTime(950, now + 0.15);
      filter.frequency.exponentialRampToValueAtTime(240, now + duration);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(masterGainNode);

      whiteNoise.start(now);
      whiteNoise.stop(now + duration);
    } catch (e) {
      console.warn('Whoosh audio error:', e);
    }
  }

  // --- Sound 4: Cinematic Navigation ("Whoooosh... zing!" — section transitions) ---
  function playNavigationSound() {
    if (!state.audioEnabled) return;
    try {
      initAudio();
      if (!audioCtx || !masterGainNode) return;
      const now = audioCtx.currentTime;
      const duration = 0.44;

      const bufferSize = Math.floor(audioCtx.sampleRate * duration);
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 2.0;
      filter.frequency.setValueAtTime(300, now);
      filter.frequency.exponentialRampToValueAtTime(1400, now + 0.2);
      filter.frequency.exponentialRampToValueAtTime(320, now + duration);

      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.001, now);
      noiseGain.gain.linearRampToValueAtTime(0.07, now + 0.16);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(masterGainNode);

      whiteNoise.start(now);
      whiteNoise.stop(now + duration);

      const zingOsc = audioCtx.createOscillator();
      const zingGain = audioCtx.createGain();
      zingOsc.type = 'sine';
      zingOsc.frequency.setValueAtTime(987.77, now + 0.15);
      zingOsc.frequency.exponentialRampToValueAtTime(2093.00, now + 0.32);

      zingGain.gain.setValueAtTime(0.0001, now);
      zingGain.gain.setValueAtTime(0.065, now + 0.15);
      zingGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

      zingOsc.connect(zingGain);
      zingGain.connect(masterGainNode);

      zingOsc.start(now + 0.15);
      zingOsc.stop(now + 0.42);
    } catch (e) {
      console.warn('Navigation audio error:', e);
    }
  }

  // --- Sound 5: Success Chime ("Ting!" — correct answers, matches, completion) ---
  function playSuccessSound() {
    if (!state.audioEnabled) return;
    try {
      initAudio();
      if (!audioCtx || !masterGainNode) return;
      const now = audioCtx.currentTime;

      const notes = [
        { freq: 659.25, time: 0.00, dur: 0.22, vol: 0.05 },
        { freq: 783.99, time: 0.06, dur: 0.22, vol: 0.06 },
        { freq: 1046.50, time: 0.12, dur: 0.34, vol: 0.08 }
      ];

      notes.forEach(n => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.freq, now + n.time);

        gain.gain.setValueAtTime(n.vol, now + n.time);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + n.time + n.dur);

        osc.connect(gain);
        gain.connect(masterGainNode);

        osc.start(now + n.time);
        osc.stop(now + n.time + n.dur);
      });
    } catch (e) {
      console.warn('Success audio error:', e);
    }
  }

  // --- Sound 6: Gentle Error Tone (Low soft tone, never harsh or loud) ---
  function playErrorSound() {
    if (!state.audioEnabled) return;
    try {
      initAudio();
      if (!audioCtx || !masterGainNode) return;
      const now = audioCtx.currentTime;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.16);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

      osc.connect(gain);
      gain.connect(masterGainNode);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch (e) {
      console.warn('Error audio error:', e);
    }
  }

  // --- Sound 7: Celebratory Electronic Chime (Achievements & Mastery) ---
  function playAchievementSound() {
    if (!state.audioEnabled) return;
    try {
      initAudio();
      if (!audioCtx || !masterGainNode) return;
      const now = audioCtx.currentTime;

      const chords = [
        { freq: 523.25, time: 0.00, dur: 0.35, vol: 0.06 },
        { freq: 659.25, time: 0.09, dur: 0.35, vol: 0.07 },
        { freq: 783.99, time: 0.18, dur: 0.40, vol: 0.08 },
        { freq: 987.77, time: 0.27, dur: 0.45, vol: 0.09 },
        { freq: 1046.50, time: 0.36, dur: 0.70, vol: 0.11 }
      ];

      chords.forEach(c => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(c.freq, now + c.time);

        gain.gain.setValueAtTime(c.vol, now + c.time);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + c.time + c.dur);

        osc.connect(gain);
        gain.connect(masterGainNode);

        osc.start(now + c.time);
        osc.stop(now + c.time + c.dur);
      });
    } catch (e) {
      console.warn('Achievement audio error:', e);
    }
  }

  // --- Sound 8: Digital Tick (Simulation micro-steps) ---
  function playTickSound() {
    if (!state.audioEnabled) return;
    try {
      initAudio();
      if (!audioCtx || !masterGainNode) return;
      const now = audioCtx.currentTime;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(860, now + 0.05);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain);
      gain.connect(masterGainNode);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      console.warn('Tick audio error:', e);
    }
  }

  // Backward-compatible dispatcher for existing callers
  function playSound(type) {
    switch (type) {
      case 'click':
        playClickSound();
        break;
      case 'zip':
        playZipSound();
        break;
      case 'whoosh':
        playWhooshSound();
        break;
      case 'impact':
      case 'nav':
        playNavigationSound();
        break;
      case 'success':
        playSuccessSound();
        break;
      case 'error':
        playErrorSound();
        break;
      case 'achievement':
        playAchievementSound();
        break;
      case 'step':
      case 'tick':
      default:
        playTickSound();
        break;
    }
  }

  /* ==========================================================================
     3. CINEMATIC CANVAS FX & ENERGY PARTICLE ENGINE
     Seamlessly coordinates energy walls, flying stars, motion trails & tokens
     ========================================================================== */
  const canvas = document.getElementById('fx-canvas');
  let ctx = canvas ? canvas.getContext('2d') : null;
  let activeFXParticles = [];
  let energyWall = null;
  let fxAnimationId = null;

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function startFXLoopIfNeeded() {
    if (!fxAnimationId && (activeFXParticles.length > 0 || energyWall)) {
      fxAnimationId = requestAnimationFrame(renderFXLoop);
    }
  }

  function drawStar(c, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = (Math.PI / 2) * 3;
    let step = Math.PI / spikes;

    c.beginPath();
    c.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      let x = cx + Math.cos(rot) * outerRadius;
      let y = cy + Math.sin(rot) * outerRadius;
      c.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      c.lineTo(x, y);
      rot += step;
    }
    c.lineTo(cx, cy - outerRadius);
    c.closePath();
    c.fill();
  }

  function renderFXLoop(timestamp) {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const now = performance.now();
    const width = canvas.width;
    const height = canvas.height;

    // 1. Render energy wall if active
    if (energyWall) {
      const elapsed = timestamp - energyWall.startTime;
      const progress = Math.min(elapsed / energyWall.duration, 1);

      const wallX = progress * (width * 1.5) - width * 0.2;
      const wallWidth = width * 0.35;

      const gradient = ctx.createLinearGradient(wallX, 0, wallX + wallWidth, 0);
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0)');
      gradient.addColorStop(0.3, 'rgba(239, 68, 68, 0.45)');
      gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.65)');
      gradient.addColorStop(0.7, 'rgba(6, 182, 212, 0.40)');
      gradient.addColorStop(1, 'rgba(6, 182, 212, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(wallX, 0, wallWidth, height);

      if (progress >= 1) {
        const cb = energyWall.onComplete;
        energyWall = null;
        if (cb) cb();
      }
    }

    // 2. Render all active particles (flying stars, trails, sparkles, tokens)
    for (let i = activeFXParticles.length - 1; i >= 0; i--) {
      const p = activeFXParticles[i];
      const age = now - p.born;
      if (age >= p.life) {
        activeFXParticles.splice(i, 1);
        continue;
      }

      const progress = Math.min(age / p.life, 1);

      if (p.isToken) {
        const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
        p.x = p.startX + (p.endX - p.startX) * ease;
        const arcHeight = -50 * Math.sin(progress * Math.PI);
        p.y = p.startY + (p.endY - p.startY) * ease + arcHeight;
      } else {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= (p.drag || 0.96);
        p.vy *= (p.drag || 0.96);
      }

      if (p.trail) {
        p.trailHistory.push({ x: p.x, y: p.y });
        if (p.trailHistory.length > p.maxTrail) {
          p.trailHistory.shift();
        }

        for (let j = 0; j < p.trailHistory.length - 1; j++) {
          const pt = p.trailHistory[j];
          const nextPt = p.trailHistory[j + 1];
          const trailAlpha = (j / p.trailHistory.length) * (1 - progress) * 0.8;
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(nextPt.x, nextPt.y);
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = Math.max(0, trailAlpha);
          ctx.lineWidth = Math.max(1, (p.radius || 2) * (j / p.trailHistory.length));
          ctx.stroke();
        }
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, (1 - progress) * (p.baseAlpha || 1));
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = p.glow || 8;

      if (p.isStar) {
        drawStar(ctx, p.x, p.y, 4, p.radius * (1 - progress * 0.3), p.radius * 0.35);
      } else if (p.isToken) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🍪', p.x, p.y);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.radius * (1 - progress * 0.4)), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    if (energyWall || activeFXParticles.length > 0) {
      fxAnimationId = requestAnimationFrame(renderFXLoop);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      fxAnimationId = null;
    }
  }

  function triggerEnergyTransition(onComplete) {
    if (state.reduceMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (onComplete) onComplete();
      return;
    }

    playNavigationSound();

    if (!ctx || !canvas) {
      if (onComplete) onComplete();
      return;
    }

    const width = canvas.width;
    const height = canvas.height;
    energyWall = {
      startTime: performance.now(),
      duration: 420,
      onComplete: onComplete
    };

    const colors = ['#ef4444', '#a855f7', '#06b6d4', '#ffffff'];
    for (let i = 0; i < 32; i++) {
      activeFXParticles.push({
        x: Math.random() * (width * 0.4),
        y: Math.random() * height,
        vx: 12 + Math.random() * 16,
        vy: (Math.random() - 0.5) * 4,
        radius: Math.random() * 3.5 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        isStar: Math.random() > 0.4,
        trail: true,
        trailHistory: [],
        maxTrail: 10,
        drag: 0.99,
        glow: 12,
        born: performance.now(),
        life: 460
      });
    }

    startFXLoopIfNeeded();
  }

  function spawnButtonStarFX(buttonEl, intensity = 'normal') {
    if (state.reduceMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    if (!buttonEl || !canvas || !ctx) return;

    const rect = buttonEl.getBoundingClientRect();
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
    const now = performance.now();

    if (intensity === 'hero') {
      playZipSound();

      for (let s = 0; s < 2; s++) {
        const angle = -Math.PI / 3 + (Math.random() - 0.5) * 0.6;
        const speed = 7 + Math.random() * 5;
        activeFXParticles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: 5,
          color: s === 0 ? '#06b6d4' : '#a855f7',
          isStar: true,
          trail: true,
          trailHistory: [],
          maxTrail: 12,
          glow: 14,
          drag: 0.96,
          born: now,
          life: 420
        });
      }

      for (let p = 0; p < 10; p++) {
        const pAngle = Math.random() * Math.PI * 2;
        const pSpeed = 2 + Math.random() * 4;
        activeFXParticles.push({
          x: originX,
          y: originY,
          vx: Math.cos(pAngle) * pSpeed,
          vy: Math.sin(pAngle) * pSpeed - 1.5,
          radius: Math.random() * 2 + 1,
          color: Math.random() > 0.5 ? '#ef4444' : '#ffffff',
          isStar: false,
          trail: false,
          glow: 8,
          drag: 0.94,
          born: now,
          life: 340
        });
      }
    } else if (intensity === 'achievement') {
      const colors = ['#fbbf24', '#a855f7', '#06b6d4', '#ef4444', '#ffffff'];
      for (let i = 0; i < 28; i++) {
        const a = (i / 28) * Math.PI * 2 + (Math.random() - 0.5) * 0.2;
        const sp = 4 + Math.random() * 6;
        activeFXParticles.push({
          x: originX,
          y: originY,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 2,
          radius: Math.random() * 4 + 2,
          color: colors[i % colors.length],
          isStar: i % 2 === 0,
          trail: true,
          trailHistory: [],
          maxTrail: 8,
          glow: 16,
          drag: 0.95,
          born: now,
          life: 580
        });
      }
    } else {
      playClickSound();

      activeFXParticles.push({
        x: originX,
        y: originY,
        vx: 3 + Math.random() * 3,
        vy: -3 - Math.random() * 2,
        radius: 3.5,
        color: '#06b6d4',
        isStar: true,
        trail: true,
        trailHistory: [],
        maxTrail: 6,
        glow: 8,
        drag: 0.95,
        born: now,
        life: 280
      });

      for (let j = 0; j < 4; j++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 1.5 + Math.random() * 2;
        activeFXParticles.push({
          x: originX,
          y: originY,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          radius: 1.5,
          color: '#a855f7',
          isStar: false,
          trail: false,
          glow: 6,
          drag: 0.93,
          born: now,
          life: 240
        });
      }
    }

    startFXLoopIfNeeded();
  }

  function spawnTokenFlightFX(fromEl, toEl) {
    if (state.reduceMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    if (!fromEl || !toEl || !canvas || !ctx) return;

    const rFrom = fromEl.getBoundingClientRect();
    const rTo = toEl.getBoundingClientRect();

    activeFXParticles.push({
      startX: rFrom.left + rFrom.width / 2,
      startY: rFrom.top + rFrom.height / 2,
      endX: rTo.left + rTo.width / 2,
      endY: rTo.top + rTo.height / 2,
      x: rFrom.left + rFrom.width / 2,
      y: rFrom.top + rFrom.height / 2,
      isToken: true,
      trail: true,
      trailHistory: [],
      maxTrail: 16,
      radius: 7,
      color: '#fbbf24',
      glow: 18,
      born: performance.now(),
      life: 520
    });

    startFXLoopIfNeeded();
  }

  /* ==========================================================================
     4. JOURNEY PROGRESS & MILESTONES TRACKER
     ========================================================================== */
  const MILESTONES = [
    { id: 'section-basics', num: '01', name: 'Basics' },
    { id: 'section-request-response', num: '02', name: 'Req / Resp' },
    { id: 'section-lifecycle', num: '03', name: 'Lifecycle' },
    { id: 'section-get-post', num: '04', name: 'GET / POST' },
    { id: 'section-mapping', num: '05', name: 'Mapping' },
    { id: 'section-session', num: '06', name: 'Session Lab' },
    { id: 'section-jsp', num: '07', name: 'JSP vs Servlet' },
    { id: 'section-jdbc', num: '08', name: 'JDBC Flow' },
    { id: 'section-code-explorer', num: '09', name: 'Code Explorer' },
    { id: 'section-challenges', num: '10', name: 'Challenges' }
  ];

  function markStepCompleted(sectionId) {
    if (!state.completedSteps.includes(sectionId)) {
      state.completedSteps.push(sectionId);
      saveState();
      playSound('success');

      if (state.completedSteps.length === MILESTONES.length) {
        unlockAchievement('champion');
        showFinalCompletionScreen();
      }
    }
  }

  function updateJourneyProgressUI() {
    const total = MILESTONES.length;
    const completed = state.completedSteps.length;
    const percent = Math.round((completed / total) * 100);

    const percentText = document.getElementById('journey-completion-text');
    if (percentText) percentText.textContent = `${percent}% Complete`;

    const fillBar = document.getElementById('journey-progress-fill');
    if (fillBar) fillBar.style.width = `${percent}%`;

    const stepItems = document.querySelectorAll('.journey-steps .step-item');
    stepItems.forEach(item => {
      const target = item.getAttribute('data-target');
      const statusEl = item.querySelector('.step-status');
      if (state.completedSteps.includes(target)) {
        item.classList.add('completed');
        if (statusEl) statusEl.textContent = '✓';
      } else {
        item.classList.remove('completed');
        if (statusEl && !item.classList.contains('active')) {
          statusEl.textContent = '○';
        }
      }
    });
  }

  function navigateToSection(targetId) {
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;

    triggerEnergyTransition(() => {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      targetEl.focus({ preventScroll: true });

      // Highlight active in stepper
      document.querySelectorAll('.journey-steps .step-item').forEach(item => {
        if (item.getAttribute('data-target') === targetId) {
          item.classList.add('active');
          const stat = item.querySelector('.step-status');
          if (stat && !item.classList.contains('completed')) stat.textContent = '●';
        } else {
          item.classList.remove('active');
        }
      });

      announceToScreenReader(`Navigated to ${targetId.replace('section-', '')}`);
    });
  }

  /* ==========================================================================
     5. SIGNATURE REQUEST / RESPONSE 10-STAGE SIMULATION
     ========================================================================== */
  const NODES = [
    {
      id: 'node-1',
      key: 'browser',
      title: '🌐 Browser (Client)',
      role: 'Client Device',
      explain: 'The user enters a URL or submits a form. The browser constructs a raw text HTTP request packet.',
      analogy: 'Like writing a letter and placing it inside an envelope addressed to the web server.',
      code: '// Browser creates HTTP connection:\nSocket socket = new Socket("localhost", 8080);\nOutputStream out = socket.getOutputStream();',
      whatIs: 'The web browser (Chrome, Firefox, Safari) running on the user\'s computer or mobile phone.',
      why: 'It provides the user interface and translates button clicks into standardized HTTP network requests.',
      whatHappens: 'It opens a TCP socket connection to port 8080 and writes HTTP headers and payload onto the network wire.',
      example: 'User navigates to http://localhost:8080/hello'
    },
    {
      id: 'node-2',
      key: 'http-request',
      title: '📨 HTTP Request Packet',
      role: 'Network Protocol',
      explain: 'The raw text packet travels over TCP/IP containing the HTTP Method (GET/POST), Request URI, Headers, and Parameters.',
      analogy: 'The physical envelope traveling through the postal system to its destination.',
      code: 'GET /hello?name=Prasanth HTTP/1.1\nHost: localhost:8080\nUser-Agent: Mozilla/5.0\nAccept: text/html',
      whatIs: 'A standardized plaintext message format defined by the HTTP protocol specification.',
      why: 'Allows any client anywhere in the world to communicate with any web server regardless of programming language.',
      whatHappens: 'Network switches and routers transmit the packets across the network wire to the server machine.',
      example: 'HTTP GET /hello?name=Prasanth HTTP/1.1'
    },
    {
      id: 'node-3',
      key: 'container',
      title: '⚙️ Servlet Container (Tomcat)',
      role: 'Web Application Server',
      explain: 'Apache Tomcat accepts the socket connection, parses the raw HTTP text, and instantiates HttpServletRequest and HttpServletResponse objects.',
      analogy: 'The postal sorting office. It opens the envelope and prepares standard official forms for the office workers.',
      code: '// Tomcat Container Internals:\nHttpServletRequest request = new RequestFacade(rawStream);\nHttpServletResponse response = new ResponseFacade();',
      whatIs: 'A runtime program (like Apache Tomcat, Eclipse Jetty, or WildFly) that manages the lifecycle of Servlets.',
      why: 'Without a container, you would have to write hundreds of lines of low-level C or Java socket networking code for every project.',
      whatHappens: 'Tomcat allocates a thread from its Thread Pool to process this specific visitor request concurrently.',
      example: 'Apache Tomcat 10.1 listening on TCP port 8080.'
    },
    {
      id: 'node-4',
      key: 'mapping',
      title: '🎯 Servlet Mapping',
      role: 'URL Pattern Matcher',
      explain: 'Tomcat checks its internal routing registry (from @WebServlet or web.xml) to match "/hello" to HelloServlet.class.',
      analogy: 'The office directory receptionist looking up which specific department handles requests for "Hello".',
      code: '// Tomcat route lookup:\nString servletClass = mappingTable.matchRoute("/hello");\n// Found: com.app.HelloServlet.class',
      whatIs: 'The routing table configured via @WebServlet("/hello") or <servlet-mapping> inside web.xml.',
      why: 'It decouples incoming URLs from internal Java package file paths, allowing clean, SEO-friendly URLs.',
      whatHappens: 'If a matching pattern is found, Tomcat gets the Servlet. If none matches, it automatically produces HTTP 404 Not Found!',
      example: '@WebServlet(urlPatterns = {"/hello", "/greet"})'
    },
    {
      id: 'node-5',
      key: 'servlet',
      title: '☕ Servlet Instance',
      role: 'HelloServlet.class',
      explain: 'Tomcat retrieves the single HelloServlet instance from memory (or creates it if this is the very first visitor).',
      analogy: 'The dedicated desk clerk who handles greeting requests.',
      code: '// Tomcat gets loaded instance:\nHelloServlet servlet = servletPool.getInstance("HelloServlet");',
      whatIs: 'The compiled Java class extending HttpServlet residing in the JVM heap memory.',
      why: 'By reusing a single instance across multiple threads, Servlets avoid allocating heavy objects repeatedly.',
      whatHappens: 'The allocated worker thread enters the Servlet instance boundary with request and response references.',
      example: 'public class HelloServlet extends HttpServlet { ... }'
    },
    {
      id: 'node-6',
      key: 'service',
      title: '⚡ service() Method',
      role: 'Protocol Dispatcher',
      explain: 'Tomcat invokes servlet.service(request, response). The service() method reads request.getMethod() to decide what to do.',
      analogy: 'The clerk asks: "Is your request a GET (asking for info) or a POST (submitting a form)?"',
      code: 'protected void service(HttpServletRequest req, HttpServletResponse res) {\n    String method = req.getMethod();\n    if (method.equals("GET")) doGet(req, res);\n    else if (method.equals("POST")) doPost(req, res);\n}',
      whatIs: 'The central dispatcher method inherited from HttpServlet.',
      why: 'It acts as the traffic controller, routing HTTP GET to doGet(), POST to doPost(), PUT to doPut(), and DELETE to doDelete().',
      whatHappens: 'It evaluates the method header and calls the corresponding protected doXXX() method you wrote.',
      example: 'HttpServlet.service(HttpServletRequest, HttpServletResponse)'
    },
    {
      id: 'node-7',
      key: 'doget-dopost',
      title: '🔀 doGet() / doPost() Method',
      role: 'Application Logic Entry',
      explain: 'Your custom code executes! You extract parameters using request.getParameter("name") and prepare data.',
      analogy: 'The clerk opens your specific request form and notes your name is "Prasanth".',
      code: 'protected void doGet(HttpServletRequest req, HttpServletResponse res) {\n    String name = req.getParameter("name");\n    // Proceed to business logic...\n}',
      whatIs: 'The developer-implemented hook method inside your Servlet subclass.',
      why: 'This is where your business requirements live. You have complete control over processing the visitor input.',
      whatHappens: 'The thread executes your custom Java statements, validations, and helper calls.',
      example: 'protected void doGet(HttpServletRequest request, HttpServletResponse response)'
    },
    {
      id: 'node-8',
      key: 'logic',
      title: '💻 Business Logic & Computation',
      role: 'Service / Calculations',
      explain: 'The Servlet performs calculations, calls database services, or formats HTML/JSON payload for the response.',
      analogy: 'The clerk grabs your file from the archive and prepares your personalized answer letter.',
      code: '// Business computation:\nString greeting = "Hello, " + (name != null ? name : "Visitor") + "!";\nres.setContentType("text/html");\nPrintWriter out = res.getWriter();\nout.println("<h1>" + greeting + "</h1>");',
      whatIs: 'The domain logic of your application (user authentication, calculation, data transformation).',
      why: 'Keeps web presentation and domain logic organized and maintainable.',
      whatHappens: 'Output data is written directly to the HttpServletResponse output stream buffer.',
      example: 'Calculating total order price or rendering a personalized HTML welcome.'
    },
    {
      id: 'node-9',
      key: 'http-response',
      title: '📤 HTTP Response Packet',
      role: 'Network Packet',
      explain: 'Tomcat flushes the buffer and transmits the HTTP 200 OK status code, headers (Content-Type: text/html), and body across the wire.',
      analogy: 'The return envelope is sealed and stamped, then dispatched back to the sender.',
      code: 'HTTP/1.1 200 OK\nContent-Type: text/html; charset=UTF-8\nContent-Length: 48\n\n<h1>Hello, Prasanth!</h1>',
      whatIs: 'The HTTP response packet sent back over the network socket to the client.',
      why: 'Tells the browser whether the operation succeeded (200 OK) or failed (404, 500) and supplies the content.',
      whatHappens: 'Tomcat closes or recycles the socket connection and returns the thread back to the thread pool.',
      example: 'HTTP/1.1 200 OK'
    },
    {
      id: 'node-10',
      key: 'browser-render',
      title: '🖥️ Browser View Rendering',
      role: 'UI Display',
      explain: 'The browser receives the response stream, parses the HTML/CSS, and renders the visual web page for the user!',
      analogy: 'You open the return envelope and read your answer.',
      code: '// Browser DOM rendering:\nDocument parsed: <h1>Hello, Prasanth!</h1>\nPaint completed in 2ms.',
      whatIs: 'The client-side rendering engine (Blink, Gecko, WebKit) parsing the HTML response.',
      why: 'Transforms raw character bytes into interactive visual elements, buttons, and text.',
      whatHappens: 'The user sees "Hello, Prasanth!" on their screen with full CSS styling.',
      example: 'Browser DOM reflects the generated HTML.'
    }
  ];

  let simState = {
    isRunning: false,
    currentStep: 0,
    isStepMode: false,
    speedMs: 700,
    timer: null
  };

  function updateWirePreview() {
    const method = document.getElementById('req-method-select')?.value || 'GET';
    const url = document.getElementById('req-url-select')?.value || '/hello';
    const param = document.getElementById('req-param-input')?.value || 'name=Prasanth';

    const reqPreview = document.getElementById('wire-request-preview');
    const respPreview = document.getElementById('wire-response-preview');
    const flyingTag = document.getElementById('flying-packet-tag');
    const node7Title = document.getElementById('node-7-title');

    if (node7Title) {
      node7Title.textContent = method === 'GET' ? 'doGet()' : 'doPost()';
    }

    if (flyingTag) flyingTag.textContent = method;

    if (url === '/missing-page') {
      if (reqPreview) reqPreview.textContent = `${method} ${url} HTTP/1.1 (Host: localhost:8080)`;
      if (respPreview) respPreview.textContent = `HTTP/1.1 404 Not Found (Servlet Mapping Missing)`;
      return;
    }

    if (method === 'GET') {
      if (reqPreview) reqPreview.textContent = `GET ${url}?${param} HTTP/1.1 (Host: localhost:8080)`;
      if (respPreview) respPreview.textContent = `HTTP/1.1 200 OK (Content-Type: text/html)`;
    } else {
      if (reqPreview) reqPreview.textContent = `POST ${url} HTTP/1.1 [Body: ${param}]`;
      if (respPreview) respPreview.textContent = `HTTP/1.1 200 OK (Content-Type: text/html)`;
    }
  }

  function setSimulationStep(stepIndex) {
    simState.currentStep = stepIndex;

    const nodes = document.querySelectorAll('.arch-node');
    const arrows = document.querySelectorAll('.arch-arrow');
    const packet = document.getElementById('flying-packet');
    const stepTitle = document.getElementById('current-step-title');
    const stepCounter = document.getElementById('step-counter-text');
    const explanation = document.getElementById('inspector-explanation');
    const analogy = document.getElementById('inspector-analogy');
    const codeTrace = document.getElementById('inspector-code-trace');

    // Clear previous highlights
    nodes.forEach(n => {
      n.classList.remove('active-req', 'active-resp');
    });
    arrows.forEach(a => {
      a.classList.remove('active-forward', 'active-backward');
    });

    if (stepIndex < 1 || stepIndex > 10) {
      if (packet) packet.style.opacity = '0';
      if (stepTitle) stepTitle.textContent = 'Ready to Dispatch';
      if (stepCounter) stepCounter.textContent = 'Step 0 of 10';
      return;
    }

    const nodeData = NODES[stepIndex - 1];
    const isResponseMode = stepIndex >= 8; // Steps 8, 9, 10 are response/return flow

    // Synchronize sounds
    if (stepIndex === 1) {
      playZipSound();
    } else if (stepIndex === 10) {
      playSuccessSound();
    } else if (isResponseMode) {
      playStepSound();
    } else {
      playTickSound();
    }

    // Light up connecting arrow
    const arrowMap = {
      2: 'arrow-1-2',
      3: 'arrow-2-3',
      4: 'arrow-3-4',
      5: 'arrow-4-5',
      6: 'arrow-5-6',
      7: 'arrow-7-8',
      8: 'arrow-7-8b',
      9: 'arrow-8-9',
      10: 'arrow-9-10'
    };
    if (arrowMap[stepIndex]) {
      const activeArrow = document.getElementById(arrowMap[stepIndex]);
      if (activeArrow) {
        activeArrow.classList.add(isResponseMode ? 'active-backward' : 'active-forward');
      }
    }

    // Update node highlight & position packet
    const targetNode = document.getElementById(`node-${stepIndex}`);
    if (targetNode) {
      targetNode.classList.add(isResponseMode ? 'active-resp' : 'active-req');
      spawnButtonStarFX(targetNode, 'normal');

      // Position packet over target node
      if (packet) {
        packet.style.opacity = '1';
        if (isResponseMode) {
          packet.classList.add('response-mode');
        } else {
          packet.classList.remove('response-mode');
        }

        const rect = targetNode.getBoundingClientRect();
        const containerRect = document.getElementById('pipeline-container').getBoundingClientRect();
        const leftPos = rect.left - containerRect.left + rect.width / 2;
        const topPos = rect.top - containerRect.top + rect.height / 2;

        packet.style.left = `${leftPos}px`;
        packet.style.top = `${topPos}px`;
      }
    }

    // Update Inspector Console
    if (stepTitle) {
      stepTitle.textContent = nodeData.title;
      stepTitle.className = isResponseMode ? 'step-badge status-resp' : 'step-badge';
    }
    if (stepCounter) stepCounter.textContent = `Step ${stepIndex} of 10`;
    if (explanation) explanation.innerHTML = `<strong>${nodeData.role}:</strong> ${nodeData.explain}`;
    if (analogy) analogy.innerHTML = `💡 <strong>Analogy:</strong> ${nodeData.analogy}`;
    if (codeTrace) codeTrace.textContent = nodeData.code;

    announceToScreenReader(`Step ${stepIndex}: ${nodeData.title}`);

    // If step 10 reached, simulation finished
    if (stepIndex === 10) {
      markStepCompleted('section-request-response');
      unlockAchievement('request');
      state.hasRunSimulation = true;
      saveState();

      const nextBtn = document.getElementById('sim-step-next-btn');
      if (nextBtn) nextBtn.disabled = true;
      simState.isRunning = false;
    }
  }

  function runAutoSimulation() {
    if (simState.isRunning) return;
    simState.isRunning = true;
    let current = 1;

    setSimulationStep(current);

    simState.timer = setInterval(() => {
      current++;
      if (current <= 10) {
        setSimulationStep(current);
      } else {
        clearInterval(simState.timer);
        simState.isRunning = false;
      }
    }, simState.speedMs);
  }

  function resetSimulation() {
    if (simState.timer) clearInterval(simState.timer);
    simState.isRunning = false;
    simState.currentStep = 0;
    setSimulationStep(0);
    const nextBtn = document.getElementById('sim-step-next-btn');
    if (nextBtn) nextBtn.disabled = !simState.isStepMode;
  }

  /* ==========================================================================
     6. SERVLET LIFECYCLE 6-STAGE SIMULATOR
     ========================================================================== */
  const LIFECYCLE_STAGES = [
    { stage: 1, name: 'Class Loading', desc: 'Tomcat searches for HelloServlet.class and loads bytecode into JVM memory.' },
    { stage: 2, name: 'Instantiation', desc: 'Tomcat calls default constructor: HelloServlet servlet = new HelloServlet();' },
    { stage: 3, name: 'init() Method', desc: 'Tomcat calls init(ServletConfig). Runs ONCE in Servlet lifetime to setup DB pools.' },
    { stage: 4, name: 'service() Method', desc: 'Visitor arrives! Tomcat spawns thread and calls service(request, response).' },
    { stage: 5, name: 'doGet() / doPost()', desc: 'Worker method handles the HTTP request and writes HTML/JSON response.' },
    { stage: 6, name: 'destroy() Method', desc: 'Server stops. Tomcat calls destroy() once to close DB connections and release RAM.' }
  ];

  let lifeTimer = null;

  function runLifecycleSimulation(mode = 'full') {
    const cards = document.querySelectorAll('.lifecycle-card');
    cards.forEach(c => c.classList.remove('active-stage', 'completed-stage', 'skipped-stage'));

    let current = 1;
    const maxStages = mode === 'second-request' ? 5 : 6;

    if (mode === 'second-request') {
      // Show that Stage 1, 2, 3 are ALREADY DONE and SKIPPED!
      document.getElementById('life-card-1')?.classList.add('completed-stage', 'skipped-stage');
      document.getElementById('life-card-2')?.classList.add('completed-stage', 'skipped-stage');
      document.getElementById('life-card-3')?.classList.add('completed-stage', 'skipped-stage');
      current = 4; // Jump directly to service()!
      playZipSound();
      announceToScreenReader('Second visitor request: Skipping init, jumping directly to service()!');
    }

    function activateStage(idx) {
      playTickSound();
      cards.forEach(c => c.classList.remove('active-stage'));
      const activeCard = document.getElementById(`life-card-${idx}`);
      if (activeCard) {
        activeCard.classList.add('active-stage', 'completed-stage');
        spawnButtonStarFX(activeCard, 'normal');
      }

      const stageInfo = LIFECYCLE_STAGES[idx - 1];
      announceToScreenReader(`Lifecycle Stage ${idx}: ${stageInfo.name}`);
    }

    activateStage(current);

    lifeTimer = setInterval(() => {
      current++;
      if (current <= maxStages) {
        activateStage(current);
      } else {
        clearInterval(lifeTimer);
        playSuccessSound();
        markStepCompleted('section-lifecycle');
        unlockAchievement('lifecycle');
        state.hasRunLifecycle = true;
        saveState();
      }
    }, 900);
  }

  function resetLifecycle() {
    if (lifeTimer) clearInterval(lifeTimer);
    document.querySelectorAll('.lifecycle-card').forEach(c => {
      c.classList.remove('active-stage', 'completed-stage', 'skipped-stage');
    });
  }

  /* ==========================================================================
     7. GET VS POST EDUCATIONAL GAME
     ========================================================================== */
  const GAME_QUESTIONS = [
    {
      q: 'A user enters their secret password on the website login form and clicks Submit.',
      answer: 'POST',
      explain: 'Passwords should ALWAYS be sent using POST. GET places credentials directly in the browser URL bar, browser history, and server access logs.'
    },
    {
      q: 'A shopper searches for "mechanical keyboard" in an e-commerce catalog.',
      answer: 'GET',
      explain: 'Search queries should use GET. GET is idempotent and produces bookmarkable, shareable URLs (e.g. /search?q=mechanical+keyboard).'
    },
    {
      q: 'A user uploads a 5MB profile photo PNG file.',
      answer: 'POST',
      explain: 'File uploads require binary payload inside the HTTP request body with multipart/form-data. URLs in GET have strict length limits and cannot transmit file bytes.'
    },
    {
      q: 'A developer bookmarks a filtered dashboard view: ?status=active&sort=date',
      answer: 'GET',
      explain: 'Filtering data without modifying state is ideal for GET. The query string preserves filter state in bookmarks and browser history.'
    },
    {
      q: 'A customer transfers $100 from Checking to Savings account.',
      answer: 'POST',
      explain: 'Bank transfers change server state. Repeating a GET could accidentally double-transfer money if refreshed or pre-fetched by a browser!'
    },
    {
      q: 'A reader opens a blog post by article slug: /blog/java-servlet-guide',
      answer: 'GET',
      explain: 'Reading articles is safe and read-only. Browsers, CDNs, and proxy caches can safely cache GET responses to speed up the internet.'
    },
    {
      q: 'A visitor submits a feedback contact form with their personal phone number and message.',
      answer: 'POST',
      explain: 'Contact form submissions send new message data to the server to store in a database or trigger emails.'
    },
    {
      q: 'A user clicks "Refresh" on the current weather forecast.',
      answer: 'GET',
      explain: 'Requesting current weather reads existing data without modifying the atmosphere on the server!'
    }
  ];

  let gameIndex = 0;
  let gameScore = 0;

  function loadGameQuestion() {
    const total = GAME_QUESTIONS.length;
    if (gameIndex >= total) {
      showGameComplete();
      return;
    }

    const qData = GAME_QUESTIONS[gameIndex];
    const qIndexEl = document.getElementById('game-q-index');
    const scoreEl = document.getElementById('game-score-display');
    const fillEl = document.getElementById('game-progress-fill');
    const scenarioText = document.getElementById('game-scenario-text');
    const feedbackBox = document.getElementById('game-feedback-box');
    const choiceGet = document.getElementById('choice-get-btn');
    const choicePost = document.getElementById('choice-post-btn');

    if (choiceGet) choiceGet.classList.remove('selected-choice');
    if (choicePost) choicePost.classList.remove('selected-choice');

    if (qIndexEl) qIndexEl.textContent = `${gameIndex + 1} / ${total}`;
    if (scoreEl) scoreEl.textContent = `${gameScore} / ${total}`;
    if (fillEl) fillEl.style.width = `${((gameIndex + 1) / total) * 100}%`;
    if (scenarioText) scenarioText.textContent = `"${qData.q}"`;

    if (feedbackBox) feedbackBox.hidden = true;
    if (choiceGet) choiceGet.disabled = false;
    if (choicePost) choicePost.disabled = false;

    announceToScreenReader(`Scenario ${gameIndex + 1}: ${qData.q}`);
  }

  function handleGameChoice(choice) {
    const qData = GAME_QUESTIONS[gameIndex];
    const isCorrect = choice === qData.answer;
    const feedbackBox = document.getElementById('game-feedback-box');
    const statusEl = document.getElementById('game-feedback-status');
    const explainEl = document.getElementById('game-feedback-explanation');
    const choiceGet = document.getElementById('choice-get-btn');
    const choicePost = document.getElementById('choice-post-btn');

    if (choiceGet) choiceGet.disabled = true;
    if (choicePost) choicePost.disabled = true;

    const chosenBtn = choice === 'GET' ? choiceGet : choicePost;
    if (chosenBtn) chosenBtn.classList.add('selected-choice');

    if (isCorrect) {
      playSuccessSound();
      if (chosenBtn) spawnButtonStarFX(chosenBtn, 'normal');
      gameScore++;
      feedbackBox.className = 'game-feedback feedback-correct';
      statusEl.textContent = '✓ Correct Answer!';
    } else {
      playErrorSound();
      feedbackBox.className = 'game-feedback feedback-incorrect';
      statusEl.textContent = `✕ Incorrect — Best Choice is ${qData.answer}`;
    }

    explainEl.textContent = qData.explain;
    feedbackBox.hidden = false;

    const scoreEl = document.getElementById('game-score-display');
    if (scoreEl) scoreEl.textContent = `${gameScore} / ${GAME_QUESTIONS.length}`;

    announceToScreenReader(`${isCorrect ? 'Correct' : 'Incorrect'}: ${qData.explain}`);
  }

  function showGameComplete() {
    const card = document.getElementById('game-scenario-card');
    const compCard = document.getElementById('game-complete-card');
    const finalScore = document.getElementById('game-final-score-text');

    if (card) card.hidden = true;
    if (compCard) {
      compCard.hidden = false;
      spawnButtonStarFX(compCard, 'achievement');
    }
    if (finalScore) finalScore.textContent = `You scored ${gameScore} out of ${GAME_QUESTIONS.length}!`;

    playSuccessSound();
    markStepCompleted('section-get-post');
  }

  function restartGame() {
    gameIndex = 0;
    gameScore = 0;
    const card = document.getElementById('game-scenario-card');
    const compCard = document.getElementById('game-complete-card');
    if (card) card.hidden = false;
    if (compCard) compCard.hidden = true;
    loadGameQuestion();
  }

  /* ==========================================================================
     8. SERVLET MAPPING SIMULATOR
     ========================================================================== */
  const MAPPINGS = {
    '/login': { class: 'LoginServlet.class', found: true, desc: 'Tomcat dispatches to LoginServlet via @WebServlet("/login")' },
    '/register': { class: 'RegisterServlet.class', found: true, desc: 'Tomcat dispatches to RegisterServlet via @WebServlet("/register")' },
    '/products': { class: 'ProductServlet.class', found: true, desc: 'Tomcat dispatches to ProductServlet via @WebServlet("/products")' },
    '/home': { class: 'HomeServlet.class', found: true, desc: 'Tomcat dispatches to HomeServlet via @WebServlet("/home")' },
    '/unknown-route': { class: 'None', found: false, desc: '404 - Servlet Mapping Not Found. No Servlet matches this pattern in Tomcat!' }
  };

  function simulateMapping(url) {
    const activeUrlEl = document.getElementById('active-mapping-url');
    if (activeUrlEl) activeUrlEl.textContent = url;

    // Reset rows
    document.querySelectorAll('.registry-row').forEach(r => r.classList.remove('active-match'));

    const matchInfo = MAPPINGS[url];
    const resultCard = document.getElementById('mapping-result-card');
    const statusIcon = document.getElementById('mapping-status-icon');
    const statusTitle = document.getElementById('mapping-status-title');
    const statusDesc = document.getElementById('mapping-status-desc');

    if (matchInfo && matchInfo.found) {
      playSuccessSound();
      const targetRow = document.querySelector(`.registry-row[data-route="${url}"]`);
      if (targetRow) {
        targetRow.classList.add('active-match');
        spawnButtonStarFX(targetRow, 'normal');
      }

      resultCard.className = 'result-badge-card status-success';
      statusIcon.textContent = '✓';
      statusTitle.textContent = `200 MATCH: ${matchInfo.class}`;
      statusDesc.textContent = matchInfo.desc;
    } else {
      playErrorSound();
      resultCard.className = 'result-badge-card status-404';
      statusIcon.textContent = '✕';
      statusTitle.textContent = 'HTTP 404 NOT FOUND';
      statusDesc.textContent = 'No matching @WebServlet or web.xml pattern registered in Tomcat.';
    }

    markStepCompleted('section-mapping');
    unlockAchievement('mapping');
    state.hasTestedMapping = true;
    saveState();
  }

  /* ==========================================================================
     9. SESSION & COOKIE LAB
     ========================================================================== */
  let activeSession = null;

  function labCreateSession() {
    const randId = 'JSES_' + Math.random().toString(36).substring(2, 10).toUpperCase();
    activeSession = {
      id: randId,
      created: new Date().toLocaleTimeString(),
      attributes: {}
    };

    const serverSide = document.querySelector('.lab-side.server-side');
    const browserSide = document.querySelector('.lab-side.browser-side');
    if (serverSide && browserSide) {
      spawnTokenFlightFX(serverSide, browserSide);
    }
    playSuccessSound();

    // Update Browser side
    document.getElementById('cookie-status-label').hidden = true;
    document.getElementById('cookie-details').hidden = false;
    document.getElementById('cookie-val-text').textContent = randId;

    // Update Server side
    document.getElementById('session-status-label').hidden = true;
    document.getElementById('session-details').hidden = false;
    document.getElementById('session-id-text').textContent = randId;
    renderSessionAttributes();

    // Enable action buttons
    document.getElementById('lab-set-attr-btn').disabled = false;
    document.getElementById('lab-read-attr-btn').disabled = false;
    document.getElementById('lab-invalidate-btn').disabled = false;
    document.getElementById('lab-create-session-btn').disabled = true;

    announceToScreenReader(`Session created with ID ${randId}. Cookie set.`);
  }

  function labSetAttribute() {
    if (!activeSession) return;
    activeSession.attributes['username'] = 'Prasanth';
    activeSession.attributes['role'] = 'Developer';

    playTickSound();
    renderSessionAttributes();
    const listEl = document.getElementById('session-attr-list');
    if (listEl) {
      listEl.style.transition = 'background 0.3s ease';
      listEl.style.background = 'rgba(6, 182, 212, 0.15)';
      setTimeout(() => { if (listEl) listEl.style.background = ''; }, 400);
    }
    announceToScreenReader('Attributes saved to session: username=Prasanth, role=Developer');
  }

  function labReadAttribute() {
    if (!activeSession) return;
    const browserSide = document.querySelector('.lab-side.browser-side');
    const serverSide = document.querySelector('.lab-side.server-side');
    if (browserSide && serverSide) {
      spawnTokenFlightFX(browserSide, serverSide);
    }
    playZipSound();
    const user = activeSession.attributes['username'] || 'null';
    setTimeout(() => {
      alert(`session.getAttribute("username") returned: "${user}"`);
    }, 180);
  }

  function labInvalidateSession() {
    activeSession = null;
    playErrorSound();

    // Reset UI
    document.getElementById('cookie-status-label').hidden = false;
    document.getElementById('cookie-details').hidden = true;
    document.getElementById('session-status-label').hidden = false;
    document.getElementById('session-details').hidden = true;

    document.getElementById('lab-set-attr-btn').disabled = true;
    document.getElementById('lab-read-attr-btn').disabled = true;
    document.getElementById('lab-invalidate-btn').disabled = true;
    document.getElementById('lab-create-session-btn').disabled = false;

    markStepCompleted('section-session');
    unlockAchievement('session');
    state.hasTestedSession = true;
    saveState();

    announceToScreenReader('Session invalidated. Server RAM cleared and cookie expired.');
  }

  function renderSessionAttributes() {
    const listEl = document.getElementById('session-attr-list');
    if (!listEl || !activeSession) return;

    const keys = Object.keys(activeSession.attributes);
    if (keys.length === 0) {
      listEl.innerHTML = '<span class="empty-attr">No attributes saved yet</span>';
      return;
    }

    listEl.innerHTML = keys.map(k => `<div><code>"${k}"</code> : <strong>"${activeSession.attributes[k]}"</strong></div>`).join('');
  }

  /* ==========================================================================
     10. JDBC SIMULATOR
     ========================================================================== */
  function runJdbcSimulation() {
    const query = document.getElementById('jdbc-query-select')?.value || 'user';
    const term = document.getElementById('jdbc-terminal-output');
    if (!term) return;

    const runBtn = document.getElementById('run-jdbc-sim-btn');
    if (runBtn) spawnButtonStarFX(runBtn, 'hero');

    const tiers = document.querySelectorAll('.jdbc-pipeline .tier-node');
    tiers.forEach(t => t.classList.remove('active-tier'));

    // Animate across 5 tiers sequentially
    tiers.forEach((tier, idx) => {
      setTimeout(() => {
        tier.classList.add('active-tier');
        playTickSound();
      }, idx * 110);
    });

    setTimeout(() => {
      playSuccessSound();
      let output = '';
      if (query === 'user') {
        output = `// 1. Servlet obtains Connection from HikariCP Pool
Connection conn = dataSource.getConnection();

// 2. Prepare Parameterized SQL query
PreparedStatement ps = conn.prepareStatement(
    "SELECT id, name, email FROM users WHERE id = ?"
);
ps.setInt(1, 101);

// 3. Execute query and receive ResultSet
ResultSet rs = ps.executeQuery();
if (rs.next()) {
    User user = new User(rs.getInt("id"), rs.getString("name"));
    request.setAttribute("user", user);
}
// 4. Return connection to pool automatically
conn.close();
// Status: 1 record retrieved into request scope!`;
      } else if (query === 'products') {
        output = `// 1. Querying Product Catalog
PreparedStatement ps = conn.prepareStatement("SELECT * FROM products ORDER BY price");
ResultSet rs = ps.executeQuery();
List<Product> catalog = new ArrayList<>();
while (rs.next()) {
    catalog.add(new Product(rs.getString("title"), rs.getDouble("price")));
}
request.setAttribute("catalog", catalog);
// Status: 24 products loaded into request scope!`;
      } else {
        output = `// 1. Fetching Completed Orders
PreparedStatement ps = conn.prepareStatement("SELECT * FROM orders WHERE status = ?");
ps.setString(1, "COMPLETED");
ResultSet rs = ps.executeQuery();
// Status: 12 orders found and dispatched to JSP!`;
      }

      term.textContent = output;
      markStepCompleted('section-jdbc');
      announceToScreenReader('JDBC flow executed successfully.');
    }, tiers.length * 110 + 60);
  }

  /* ==========================================================================
     11. CODE EXPLORER KEYWORD INSPECTION
     ========================================================================== */
  const CODE_TOKENS = {
    'annotation': {
      title: '@WebServlet("/hello")',
      desc: 'Annotation mapping the URL route "/hello" directly to this Java class without requiring XML configuration in web.xml.',
      tip: 'Introduced in Servlet 3.0. Simplifies web development significantly!'
    },
    'httpservlet': {
      title: 'extends HttpServlet',
      desc: 'The foundational abstract class from Jakarta/Java EE. It provides HTTP-specific methods like doGet, doPost, doPut, and doDelete.',
      tip: 'Always extend HttpServlet for web applications. GenericServlet is protocol-independent.'
    },
    'doget': {
      title: 'protected void doGet(...)',
      desc: 'Overridden callback method executed automatically by Tomcat whenever an HTTP GET request hits this Servlet.',
      tip: 'Never call doGet() directly from your code! Tomcat manages when and how it runs.'
    },
    'request': {
      title: 'HttpServletRequest request',
      desc: 'Encapsulates all incoming visitor data: query parameters, form bodies, headers, IP address, and browser cookies.',
      tip: 'Use request.getParameter("name") to read user inputs safely.'
    },
    'response': {
      title: 'HttpServletResponse response',
      desc: 'Encapsulates the outgoing message back to the client: status code (200, 404), content MIME type, and output stream.',
      tip: 'Always set response.setContentType() before calling response.getWriter()!'
    },
    'contenttype': {
      title: 'response.setContentType("text/html")',
      desc: 'Sets the HTTP "Content-Type" header informing the browser whether to render HTML, JSON (application/json), or plain text.',
      tip: 'Browsers use this MIME type to know whether to display a webpage or show raw JSON.'
    },
    'getparameter': {
      title: 'request.getParameter("name")',
      desc: 'Extracts the value of query string parameters (?name=Prasanth) or HTML form inputs (<input name="name">).',
      tip: 'Always check if the returned string is null before using it to prevent NullPointerException.'
    },
    'getwriter': {
      title: 'response.getWriter()',
      desc: 'Returns a PrintWriter character stream used to print HTML tags or JSON strings directly into the HTTP response body.',
      tip: 'For binary data (like downloading PDF or images), use response.getOutputStream() instead.'
    }
  };

  function inspectCodeToken(tokenKey) {
    const data = CODE_TOKENS[tokenKey];
    if (!data) return;

    playClickSound();

    document.querySelectorAll('.code-token').forEach(t => t.classList.remove('active-token'));
    const activeEl = document.querySelector(`.code-token[data-token="${tokenKey}"]`);
    if (activeEl) {
      activeEl.classList.add('active-token');
      spawnButtonStarFX(activeEl, 'normal');
    }

    const titleEl = document.getElementById('token-title');
    const descEl = document.getElementById('token-desc');
    const extraEl = document.getElementById('token-extra');

    if (titleEl) titleEl.textContent = data.title;
    if (descEl) descEl.textContent = data.desc;
    if (extraEl) extraEl.innerHTML = `<span class="extra-label">💡 Pro Tip:</span><span>${data.tip}</span>`;

    markStepCompleted('section-code-explorer');
    announceToScreenReader(`Code Inspector: ${data.title}. ${data.desc}`);
  }

  /* ==========================================================================
     12. MINI LOGIN SIMULATOR (POST /login)
     ========================================================================== */
  function simulateLoginSubmit() {
    const user = document.getElementById('login-username')?.value || '';
    const pass = document.getElementById('login-password')?.value || '';
    const resBox = document.getElementById('login-sim-result');
    const submitBtn = document.getElementById('btn-submit-login');
    if (submitBtn) spawnButtonStarFX(submitBtn, 'hero');

    if (user === 'admin' && pass === 'secret123') {
      playSuccessSound();
      if (resBox) {
        resBox.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.4)';
        resBox.innerHTML = `
<strong style="color: #6ee7b7;">✓ HTTP/1.1 200 OK — Login Successful</strong>
<br>
--------------------------------------------------
1. request.getParameter("username") ➔ "${user}"
2. Authentication check passed!
3. session.setAttribute("user", "${user}");
4. Cookie issued: JSESSIONID=X7A8109B
5. response.sendRedirect("/dashboard");
--------------------------------------------------
Status: User authenticated and session established in Tomcat RAM!`;
      }
    } else {
      playErrorSound();
      if (resBox) {
        resBox.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.4)';
        resBox.innerHTML = `
<strong style="color: #fca5a5;">✕ HTTP/1.1 401 Unauthorized — Access Denied</strong>
<br>
--------------------------------------------------
1. request.getParameter("username") ➔ "${user}"
2. Credentials check failed against database!
3. response.setStatus(401);
4. response.getWriter().println("Invalid username or password");
--------------------------------------------------
Status: Request rejected. No session created.`;
      }
    }
  }

  /* ==========================================================================
     13. CHALLENGE 1: FLOW BUILDER (Drag & Drop + Accessible Click/Keyboard)
     ========================================================================== */
  const CORRECT_FLOW = [
    'Browser',
    'HTTP Request',
    'Servlet Container',
    'Servlet Mapping',
    'Servlet Instance',
    'service()',
    'doGet() / doPost()',
    'Business Logic',
    'HTTP Response',
    'Browser Render'
  ];

  let currentFlowBlocks = [...CORRECT_FLOW];

  function shuffleFlowBlocks() {
    for (let i = currentFlowBlocks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [currentFlowBlocks[i], currentFlowBlocks[j]] = [currentFlowBlocks[j], currentFlowBlocks[i]];
    }
    renderFlowBlocks();
    const msg = document.getElementById('flow-verification-msg');
    if (msg) {
      msg.textContent = '';
      msg.className = 'verification-msg';
    }
  }

  function renderFlowBlocks() {
    const container = document.getElementById('flow-blocks-container');
    if (!container) return;

    container.innerHTML = '';
    currentFlowBlocks.forEach((title, index) => {
      const item = document.createElement('div');
      item.className = 'flow-block-item';
      item.draggable = true;
      item.setAttribute('role', 'listitem');
      item.setAttribute('data-index', index);

      item.innerHTML = `
        <div class="block-info">
          <span class="block-num">${index + 1}</span>
          <span class="block-title">${title}</span>
        </div>
        <div class="block-actions">
          <button class="btn-move btn-move-up" aria-label="Move ${title} up" ${index === 0 ? 'disabled' : ''}>▲</button>
          <button class="btn-move btn-move-down" aria-label="Move ${title} down" ${index === currentFlowBlocks.length - 1 ? 'disabled' : ''}>▼</button>
        </div>
      `;

      item.querySelector('.btn-move-up')?.addEventListener('click', () => moveBlock(index, -1));
      item.querySelector('.btn-move-down')?.addEventListener('click', () => moveBlock(index, 1));

      item.addEventListener('dragstart', (e) => {
        item.classList.add('dragging');
        e.dataTransfer.setData('text/plain', index);
      });
      item.addEventListener('dragend', () => item.classList.remove('dragging'));

      item.addEventListener('dragover', (e) => e.preventDefault());
      item.addEventListener('drop', (e) => {
        e.preventDefault();
        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
        const toIndex = index;
        if (!isNaN(fromIndex) && fromIndex !== toIndex) {
          const moved = currentFlowBlocks.splice(fromIndex, 1)[0];
          currentFlowBlocks.splice(toIndex, 0, moved);
          renderFlowBlocks();
          playClickSound();
        }
      });

      container.appendChild(item);
    });
  }

  function moveBlock(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= currentFlowBlocks.length) return;
    const temp = currentFlowBlocks[index];
    currentFlowBlocks[index] = currentFlowBlocks[target];
    currentFlowBlocks[target] = temp;
    playClickSound();
    renderFlowBlocks();
  }

  function verifyFlowOrder() {
    const msg = document.getElementById('flow-verification-msg');
    const verifyBtn = document.getElementById('verify-flow-btn');
    let isCorrect = true;

    for (let i = 0; i < CORRECT_FLOW.length; i++) {
      if (currentFlowBlocks[i] !== CORRECT_FLOW[i]) {
        isCorrect = false;
        break;
      }
    }

    if (isCorrect) {
      playSuccessSound();
      if (verifyBtn) spawnButtonStarFX(verifyBtn, 'achievement');
      if (msg) {
        msg.textContent = '🎉 PERFECT! You have mastered the entire Java Servlet request flow!';
        msg.className = 'verification-msg success';
      }
      markStepCompleted('section-challenges');
      unlockAchievement('champion');
      showFinalCompletionScreen();
    } else {
      playErrorSound();
      if (msg) {
        msg.textContent = '✕ Not quite right yet. Hint: Browser ➔ HTTP Request ➔ Tomcat Container... Keep arranging!';
        msg.className = 'verification-msg error';
      }
    }
  }

  /* ==========================================================================
     14. CHALLENGE 2: SCENARIO QUIZ
     ========================================================================== */
  const QUIZ_QUESTIONS = [
    {
      q: 'A visitor clicks on an ordinary hyperlink: <a href="/profile">View Profile</a>. Which Servlet method does Tomcat execute?',
      options: ['doPost()', 'doGet()', 'init()', 'destroy()'],
      answer: 1,
      desc: 'Clicking standard HTML hyperlinks always issues an HTTP GET request.'
    },
    {
      q: 'The server administrator stops Tomcat or redeploys the web app. Which lifecycle method executes right before memory is freed?',
      options: ['finalize()', 'doDelete()', 'destroy()', 'init()'],
      answer: 2,
      desc: 'Tomcat invokes destroy() once to allow closing database connections and releasing resources.'
    },
    {
      q: 'By default, how many instances of a specific Servlet class does Tomcat create to handle 10,000 visitors?',
      options: ['10,000 instances (one per visitor)', 'Exactly 1 single instance (shared across threads)', '10 instances (one per CPU core)', 'A new instance for every GET request'],
      answer: 1,
      desc: 'Servlets use a single-instance, multithreaded architecture. Exactly 1 instance is loaded in RAM.'
    },
    {
      q: 'Where does Tomcat store the visitor\'s session data when using HttpSession?',
      options: ['Inside the visitor\'s browser cookies', 'In the server\'s RAM / memory', 'In the local computer\'s registry', 'In the operating system kernel'],
      answer: 1,
      desc: 'HttpSession attributes live safely in Tomcat server memory; only the JSESSIONID token string is kept in cookies.'
    },
    {
      q: 'What is the modern annotation replacement for configuring servlet mappings in web.xml?',
      options: ['@Controller', '@WebServlet', '@ServletMapping', '@Route'],
      answer: 1,
      desc: '@WebServlet("/path") was introduced in Servlet 3.0 to declare mappings without XML.'
    },
    {
      q: 'Why should you NOT put complex Java database queries inside a JSP file?',
      options: ['JSP cannot execute Java code', 'It violates MVC and causes unmaintainable spaghetti code', 'Tomcat bans databases in JSP', 'Databases reject JSP connections'],
      answer: 1,
      desc: 'JSP is for presentation (View). Java Servlets or DAO classes should handle business and database logic (Controller/Model).'
    }
  ];

  let currentQuizIndex = 0;

  function loadQuizQuestion() {
    const qData = QUIZ_QUESTIONS[currentQuizIndex];
    const indText = document.getElementById('quiz-curr-q-text');
    const qTitle = document.getElementById('quiz-question-title');
    const optionsList = document.getElementById('quiz-options-list');
    const feedbackBox = document.getElementById('quiz-feedback-box');

    if (indText) indText.textContent = `Scenario Question ${currentQuizIndex + 1} of ${QUIZ_QUESTIONS.length}`;
    if (qTitle) qTitle.textContent = qData.q;
    if (feedbackBox) feedbackBox.hidden = true;

    if (optionsList) {
      optionsList.innerHTML = '';
      qData.options.forEach((optText, index) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn';
        btn.textContent = optText;
        btn.addEventListener('click', () => handleQuizAnswer(index, btn));
        optionsList.appendChild(btn);
      });
    }

    announceToScreenReader(`Quiz question ${currentQuizIndex + 1}: ${qData.q}`);
  }

  function handleQuizAnswer(selectedIndex, buttonEl) {
    const qData = QUIZ_QUESTIONS[currentQuizIndex];
    const isCorrect = selectedIndex === qData.answer;
    const feedbackBox = document.getElementById('quiz-feedback-box');
    const statusEl = document.getElementById('quiz-feedback-status');
    const descEl = document.getElementById('quiz-feedback-desc');

    document.querySelectorAll('.quiz-option-btn').forEach(b => b.disabled = true);

    if (isCorrect) {
      playSuccessSound();
      spawnButtonStarFX(buttonEl, 'normal');
      buttonEl.classList.add('opt-correct');
      statusEl.textContent = '✓ Correct!';
      statusEl.style.color = '#6ee7b7';
    } else {
      playErrorSound();
      buttonEl.classList.add('opt-incorrect');
      statusEl.textContent = '✕ Incorrect';
      statusEl.style.color = '#fca5a5';

      const options = document.querySelectorAll('.quiz-option-btn');
      if (options[qData.answer]) options[qData.answer].classList.add('opt-correct');
    }

    descEl.textContent = qData.desc;
    if (feedbackBox) feedbackBox.hidden = false;
  }

  function nextQuizQuestion() {
    currentQuizIndex++;
    if (currentQuizIndex < QUIZ_QUESTIONS.length) {
      loadQuizQuestion();
    } else {
      playSuccessSound();
      const arena = document.getElementById('scenario-quiz-arena');
      if (arena) {
        spawnButtonStarFX(arena, 'achievement');
        arena.innerHTML = `
          <div style="text-align: center; padding: 24px;">
            <div style="font-size: 2.5rem; margin-bottom: 12px;">🏆</div>
            <h4 style="color: #fff; font-size: 1.3rem; margin-bottom: 8px;">All Scenarios Complete!</h4>
            <p style="color: #cbd5e1; font-size: 0.95rem;">You demonstrated solid understanding of real-world Servlet architecture and lifecycle nuances!</p>
          </div>
        `;
      }
      markStepCompleted('section-challenges');
      showFinalCompletionScreen();
    }
  }

  function showFinalCompletionScreen() {
    const finalView = document.getElementById('final-completion-view');
    if (finalView) {
      finalView.hidden = false;
      finalView.scrollIntoView({ behavior: 'smooth' });
    }
    const statConcepts = document.getElementById('final-stat-concepts');
    if (statConcepts) statConcepts.textContent = `${state.completedSteps.length} / 10`;
  }

  /* ==========================================================================
     15. ACHIEVEMENTS SYSTEM
     ========================================================================== */
  const ACHIEVEMENTS_LIST = [
    { id: 'basics', title: 'Servlet Beginner', desc: 'Explored Servlet Basics & Container concepts', icon: '☕' },
    { id: 'request', title: 'Request Master', desc: 'Dispatched an HTTP request through the 10-stage simulation', icon: '📨' },
    { id: 'lifecycle', title: 'Lifecycle Explorer', desc: 'Completed the 6-stage Servlet Lifecycle simulation', icon: '🔄' },
    { id: 'mapping', title: 'Mapping Master', desc: 'Successfully resolved URLs and identified 404 routing', icon: '🎯' },
    { id: 'session', title: 'Session Explorer', desc: 'Created and inspected an HttpSession and cookie state', icon: '🍪' },
    { id: 'champion', title: 'Servlet Champion', desc: 'Completed the Request Flow challenges and quizzes', icon: '👑' }
  ];

  function unlockAchievement(id, silent = false) {
    if (!state.achievements.includes(id)) {
      state.achievements.push(id);
      saveState();

      if (!silent) {
        const ach = ACHIEVEMENTS_LIST.find(a => a.id === id);
        if (ach) {
          showAchievementToast(ach);
          playAchievementSound();
          const toast = document.getElementById('achievement-toast');
          if (toast) spawnButtonStarFX(toast, 'achievement');
        }
      }
    }
  }

  function showAchievementToast(ach) {
    const toast = document.getElementById('achievement-toast');
    const title = document.getElementById('toast-title');
    const desc = document.getElementById('toast-desc');

    if (!toast) return;

    if (title) title.textContent = ach.title;
    if (desc) desc.textContent = ach.desc;

    toast.hidden = false;

    setTimeout(() => {
      toast.hidden = true;
    }, 4500);
  }

  function updateAchievementsUI() {
    const counter = document.getElementById('achievements-counter');
    if (counter) counter.textContent = `${state.achievements.length}/${ACHIEVEMENTS_LIST.length}`;

    const list = document.getElementById('achievements-list');
    if (!list) return;

    list.innerHTML = ACHIEVEMENTS_LIST.map(ach => {
      const isUnlocked = state.achievements.includes(ach.id);
      return `
        <div class="achievement-badge-card ${isUnlocked ? 'unlocked' : ''}">
          <div class="badge-icon-box">${ach.icon}</div>
          <div class="badge-text">
            <h4>${ach.title} ${isUnlocked ? '✓' : '🔒'}</h4>
            <p>${ach.desc}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  /* ==========================================================================
     16. GLOBAL SEARCH (Ctrl+K or /)
     ========================================================================== */
  const SEARCH_ITEMS = [
    { term: 'Servlet', snippet: 'Java class that listens for HTTP requests on a web server', target: 'section-basics' },
    { term: 'Servlet Container / Tomcat', snippet: 'Web server runtime that manages the Servlet lifecycle', target: 'section-basics' },
    { term: 'HTTP Request', snippet: 'Incoming network packet containing method, headers, and params', target: 'section-request-response' },
    { term: 'HTTP Response', snippet: 'Outgoing network packet with status code 200/404 and body', target: 'section-request-response' },
    { term: 'doGet()', snippet: 'Method called by Tomcat when an HTTP GET request arrives', target: 'section-lifecycle' },
    { term: 'doPost()', snippet: 'Method called by Tomcat when an HTTP POST request arrives', target: 'section-get-post' },
    { term: 'init()', snippet: 'Lifecycle method executed once when Servlet is first loaded', target: 'section-lifecycle' },
    { term: 'service()', snippet: 'Central dispatcher method that inspects HTTP method', target: 'section-lifecycle' },
    { term: 'destroy()', snippet: 'Lifecycle method called before server shutdown to clean up memory', target: 'section-lifecycle' },
    { term: 'HttpSession', snippet: 'Server memory bucket storing state across requests for a user', target: 'section-session' },
    { term: 'Cookie / JSESSIONID', snippet: 'Small token stored in browser to identify returning sessions', target: 'section-session' },
    { term: 'Servlet Mapping', snippet: 'Routing rule matching URL paths to target Servlet classes', target: 'section-mapping' },
    { term: '@WebServlet', snippet: 'Java annotation to map a URL route without XML', target: 'section-mapping' },
    { term: 'JSP vs Servlet', snippet: 'View template vs Controller logic in MVC architectures', target: 'section-jsp' },
    { term: 'JDBC Integration', snippet: 'Connecting Servlets to MySQL or PostgreSQL relational databases', target: 'section-jdbc' },
    { term: 'getParameter()', snippet: 'Extracts query string or form data values from request', target: 'section-code-explorer' },
    { term: 'PrintWriter getWriter()', snippet: 'Returns stream used to print HTML or JSON back to the browser', target: 'section-code-explorer' },
    { term: 'Challenges Lab', snippet: 'Flow ordering and scenario quiz challenge games', target: 'section-challenges' }
  ];

  function openSearchDialog() {
    const dialog = document.getElementById('search-dialog');
    const input = document.getElementById('concept-search-input');
    if (dialog) {
      dialog.showModal();
      if (input) {
        input.value = '';
        input.focus();
        renderSearchResults('');
      }
    }
  }

  function renderSearchResults(query) {
    const list = document.getElementById('search-results-list');
    if (!list) return;

    const filtered = SEARCH_ITEMS.filter(item =>
      item.term.toLowerCase().includes(query.toLowerCase()) ||
      item.snippet.toLowerCase().includes(query.toLowerCase())
    );

    if (filtered.length === 0) {
      list.innerHTML = '<div style="padding: 14px; color: #64748b; font-style: italic;">No matching concepts found.</div>';
      return;
    }

    list.innerHTML = filtered.map(item => `
      <div class="search-result-item" tabindex="0" role="option" data-target="${item.target}">
        <div class="res-term">${item.term}</div>
        <div class="res-snippet">${item.snippet}</div>
      </div>
    `).join('');

    list.querySelectorAll('.search-result-item').forEach(el => {
      el.addEventListener('click', () => {
        const target = el.getAttribute('data-target');
        document.getElementById('search-dialog')?.close();
        navigateToSection(target);
      });
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const target = el.getAttribute('data-target');
          document.getElementById('search-dialog')?.close();
          navigateToSection(target);
        }
      });
    });
  }

  /* ==========================================================================
     17. PREFERENCES (Beginner Mode, Reduce Motion, Sound)
     ========================================================================== */
  function updateUIPreferences() {
    // Beginner mode
    if (state.beginnerMode) {
      document.body.classList.add('beginner-mode-active');
      const lbl = document.getElementById('beginner-status-label');
      if (lbl) lbl.textContent = 'ON';
      document.getElementById('toggle-beginner-btn')?.classList.add('active');
    } else {
      document.body.classList.remove('beginner-mode-active');
      const lbl = document.getElementById('beginner-status-label');
      if (lbl) lbl.textContent = 'OFF';
      document.getElementById('toggle-beginner-btn')?.classList.remove('active');
    }

    // Motion
    if (state.reduceMotion) {
      document.body.classList.add('reduce-motion-active');
      const lbl = document.getElementById('motion-status-label');
      if (lbl) lbl.textContent = 'Reduced';
      document.getElementById('toggle-motion-btn')?.classList.add('active');
    } else {
      document.body.classList.remove('reduce-motion-active');
      const lbl = document.getElementById('motion-status-label');
      if (lbl) lbl.textContent = 'Full';
      document.getElementById('toggle-motion-btn')?.classList.remove('active');
    }

    // Audio
    const audioIcon = document.getElementById('audio-icon');
    if (audioIcon) {
      audioIcon.textContent = state.audioEnabled ? '🔊' : '🔇';
    }
  }

  /* ==========================================================================
     18. MODAL DIALOG CONTROLS & EVENT LISTENERS SETUP
     ========================================================================== */
  function setupEventListeners() {
    // Brand Home Button
    document.getElementById('brand-home-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      navigateToSection('landing-section');
    });

    // Start Journey Hero Button
    document.getElementById('start-journey-btn')?.addEventListener('click', (e) => {
      spawnButtonStarFX(e.currentTarget, 'hero');
      navigateToSection('section-basics');
    });

    // "How to Use This Project" Guide Modal
    const guideDialog = document.getElementById('guide-dialog');
    document.getElementById('open-guide-btn')?.addEventListener('click', (e) => {
      spawnButtonStarFX(e.currentTarget, 'hero');
      guideDialog?.showModal();
    });
    document.getElementById('close-guide-dialog')?.addEventListener('click', () => {
      playClickSound();
      guideDialog?.close();
    });
    document.getElementById('guide-dismiss-btn')?.addEventListener('click', () => {
      playClickSound();
      guideDialog?.close();
    });
    document.getElementById('guide-start-btn')?.addEventListener('click', (e) => {
      spawnButtonStarFX(e.currentTarget, 'hero');
      guideDialog?.close();
      navigateToSection('section-basics');
    });

    // Jump-to anchor links (smooth cinematic navigation)
    document.querySelectorAll('a[href^="#section-"]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        if (targetId) navigateToSection(targetId);
      });
    });

    // Advance Buttons (Next Step CTA in each section)
    document.querySelectorAll('.btn-advance').forEach(btn => {
      btn.addEventListener('click', () => {
        spawnButtonStarFX(btn, 'normal');
        const nextId = btn.getAttribute('data-next');
        if (nextId) navigateToSection(nextId);
      });
    });

    // Stepper buttons
    document.querySelectorAll('.journey-steps .step-item').forEach(item => {
      item.querySelector('.step-btn')?.addEventListener('click', (e) => {
        spawnButtonStarFX(e.currentTarget, 'normal');
        const target = item.getAttribute('data-target');
        if (target) navigateToSection(target);
      });
    });

    // Toggles
    document.getElementById('toggle-beginner-btn')?.addEventListener('click', (e) => {
      spawnButtonStarFX(e.currentTarget, 'normal');
      state.beginnerMode = !state.beginnerMode;
      saveState();
      playClickSound();
      announceToScreenReader(`Beginner mode ${state.beginnerMode ? 'enabled' : 'disabled'}`);
    });

    document.getElementById('toggle-motion-btn')?.addEventListener('click', (e) => {
      spawnButtonStarFX(e.currentTarget, 'normal');
      state.reduceMotion = !state.reduceMotion;
      saveState();
      playClickSound();
      announceToScreenReader(`Motion ${state.reduceMotion ? 'reduced' : 'full'}`);
    });

    document.getElementById('toggle-audio-btn')?.addEventListener('click', (e) => {
      state.audioEnabled = !state.audioEnabled;
      initAudio();
      if (state.audioEnabled) {
        spawnButtonStarFX(e.currentTarget, 'hero');
        playClickSound();
      }
      saveState();
      announceToScreenReader(`Audio effects ${state.audioEnabled ? 'enabled' : 'muted'}`);
    });

    // Master Volume Slider
    const volSlider = document.getElementById('volume-slider');
    volSlider?.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value) / 100;
      setMasterVolume(val);
      if (val > 0 && !state.audioEnabled) {
        state.audioEnabled = true;
        initAudio();
        updateUIPreferences();
        saveState();
      }
    });

    // Reset Progress
    document.getElementById('reset-progress-btn')?.addEventListener('click', () => {
      if (confirm('Reset your Servlet Explorer learning progress, scores, and achievements?')) {
        localStorage.removeItem(STORAGE_KEY);
        state = { ...defaultState };
        saveState();
        location.reload();
      }
    });

    // Achievements Dialog
    const achDialog = document.getElementById('achievements-dialog');
    document.getElementById('open-achievements-btn')?.addEventListener('click', (e) => {
      spawnButtonStarFX(e.currentTarget, 'hero');
      updateAchievementsUI();
      achDialog?.showModal();
    });
    document.getElementById('close-achievements-dialog')?.addEventListener('click', () => {
      playClickSound();
      achDialog?.close();
    });
    document.getElementById('dismiss-achievements-btn')?.addEventListener('click', () => {
      playClickSound();
      achDialog?.close();
    });

    // Search Trigger & Shortcut
    document.getElementById('search-trigger-btn')?.addEventListener('click', openSearchDialog);
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearchDialog();
      } else if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'SELECT') {
        e.preventDefault();
        openSearchDialog();
      }
    });
    document.getElementById('concept-search-input')?.addEventListener('input', (e) => {
      renderSearchResults(e.target.value);
    });

    // Accordion Toggle
    document.querySelectorAll('.learn-more-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        playClickSound();
        const isExp = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', !isExp);
        const panel = document.getElementById(btn.getAttribute('aria-controls'));
        if (panel) panel.hidden = isExp;
      });
    });

    // Simulation Form Inputs
    document.getElementById('req-method-select')?.addEventListener('change', () => {
      playClickSound();
      updateWirePreview();
    });
    document.getElementById('req-url-select')?.addEventListener('change', () => {
      playClickSound();
      updateWirePreview();
    });
    document.getElementById('req-param-input')?.addEventListener('input', updateWirePreview);

    // Simulation Trigger
    document.getElementById('send-request-btn')?.addEventListener('click', (e) => {
      spawnButtonStarFX(e.currentTarget, 'hero');
      updateWirePreview();
      if (simState.isStepMode) {
        setSimulationStep(1);
        const nextBtn = document.getElementById('sim-step-next-btn');
        if (nextBtn) nextBtn.disabled = false;
      } else {
        runAutoSimulation();
      }
    });

    // Simulation Mode & Speed
    document.getElementById('sim-mode-auto')?.addEventListener('click', () => {
      playClickSound();
      simState.isStepMode = false;
      document.getElementById('sim-mode-auto')?.classList.add('active');
      document.getElementById('sim-mode-step')?.classList.remove('active');
      const nextBtn = document.getElementById('sim-step-next-btn');
      if (nextBtn) nextBtn.disabled = true;
    });

    document.getElementById('sim-mode-step')?.addEventListener('click', () => {
      playClickSound();
      simState.isStepMode = true;
      document.getElementById('sim-mode-step')?.classList.add('active');
      document.getElementById('sim-mode-auto')?.classList.remove('active');
      const nextBtn = document.getElementById('sim-step-next-btn');
      if (nextBtn) nextBtn.disabled = simState.currentStep === 0;
    });

    document.getElementById('sim-step-next-btn')?.addEventListener('click', () => {
      if (simState.currentStep < 10) {
        setSimulationStep(simState.currentStep + 1);
      }
    });

    document.querySelectorAll('.speed-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        playClickSound();
        document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const sp = btn.getAttribute('data-speed');
        simState.speedMs = sp === 'slow' ? 1200 : (sp === 'fast' ? 350 : 700);
      });
    });

    document.getElementById('sim-reset-flow-btn')?.addEventListener('click', () => {
      playClickSound();
      resetSimulation();
    });

    // Architecture Node Click Details Modal
    const nodeDialog = document.getElementById('node-info-dialog');
    document.querySelectorAll('.arch-node').forEach((node, index) => {
      node.addEventListener('click', () => {
        const data = NODES[index];
        if (!data) return;
        playClickSound();
        spawnButtonStarFX(node, 'normal');

        document.getElementById('dialog-node-icon').textContent = node.querySelector('.node-icon')?.textContent || '⚙️';
        document.getElementById('dialog-node-role').textContent = data.role;
        document.getElementById('dialog-node-title').textContent = data.title;
        document.getElementById('dialog-what-is').textContent = data.whatIs;
        document.getElementById('dialog-why').textContent = data.why;
        document.getElementById('dialog-what-happens').textContent = data.whatHappens;
        document.getElementById('dialog-example').textContent = data.example;

        nodeDialog?.showModal();
      });
      node.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          node.click();
        }
      });
    });

    document.getElementById('close-node-dialog')?.addEventListener('click', () => {
      playClickSound();
      nodeDialog?.close();
    });
    document.getElementById('dialog-dismiss-btn')?.addEventListener('click', () => {
      playClickSound();
      nodeDialog?.close();
    });

    // Lifecycle Simulators
    document.getElementById('run-lifecycle-btn')?.addEventListener('click', (e) => {
      spawnButtonStarFX(e.currentTarget, 'hero');
      runLifecycleSimulation('full');
    });
    document.getElementById('simulate-second-request-btn')?.addEventListener('click', (e) => {
      spawnButtonStarFX(e.currentTarget, 'hero');
      runLifecycleSimulation('second-request');
    });
    document.getElementById('reset-lifecycle-btn')?.addEventListener('click', () => {
      playClickSound();
      resetLifecycle();
    });

    document.querySelectorAll('.code-method-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const stageNum = parseInt(btn.getAttribute('data-target-stage'), 10);
        document.querySelectorAll('.lifecycle-card').forEach(c => c.classList.remove('active-stage'));
        document.querySelectorAll('.code-method-btn').forEach(b => b.classList.remove('active-method'));

        btn.classList.add('active-method');
        const targetCard = document.getElementById(`life-card-${stageNum}`);
        if (targetCard) {
          targetCard.classList.add('active-stage');
          spawnButtonStarFX(targetCard, 'normal');
        }
        playClickSound();
      });
    });

    // GET vs POST Game Buttons
    document.getElementById('choice-get-btn')?.addEventListener('click', () => handleGameChoice('GET'));
    document.getElementById('choice-post-btn')?.addEventListener('click', () => handleGameChoice('POST'));
    document.getElementById('game-next-btn')?.addEventListener('click', (e) => {
      spawnButtonStarFX(e.currentTarget, 'normal');
      gameIndex++;
      loadGameQuestion();
    });
    document.getElementById('game-restart-btn')?.addEventListener('click', (e) => {
      spawnButtonStarFX(e.currentTarget, 'normal');
      restartGame();
    });

    // Mapping Simulator URL Chips
    document.querySelectorAll('.chip-url').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.chip-url').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        spawnButtonStarFX(chip, 'normal');
        const url = chip.getAttribute('data-url');
        simulateMapping(url);
      });
    });

    // Session Lab Actions
    document.getElementById('lab-create-session-btn')?.addEventListener('click', (e) => {
      spawnButtonStarFX(e.currentTarget, 'hero');
      labCreateSession();
    });
    document.getElementById('lab-set-attr-btn')?.addEventListener('click', (e) => {
      spawnButtonStarFX(e.currentTarget, 'normal');
      labSetAttribute();
    });
    document.getElementById('lab-read-attr-btn')?.addEventListener('click', (e) => {
      spawnButtonStarFX(e.currentTarget, 'normal');
      labReadAttribute();
    });
    document.getElementById('lab-invalidate-btn')?.addEventListener('click', (e) => {
      spawnButtonStarFX(e.currentTarget, 'hero');
      labInvalidateSession();
    });

    // JDBC Simulation
    document.getElementById('run-jdbc-sim-btn')?.addEventListener('click', runJdbcSimulation);

    // Code Tokens
    document.querySelectorAll('.code-token').forEach(tok => {
      tok.addEventListener('click', () => {
        const tokenKey = tok.getAttribute('data-token');
        inspectCodeToken(tokenKey);
      });
      tok.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          tok.click();
        }
      });
    });

    // Mini Login Simulation
    document.getElementById('btn-submit-login')?.addEventListener('click', simulateLoginSubmit);
    document.getElementById('btn-preset-valid')?.addEventListener('click', (e) => {
      playClickSound();
      spawnButtonStarFX(e.currentTarget, 'normal');
      document.getElementById('login-username').value = 'admin';
      document.getElementById('login-password').value = 'secret123';
    });
    document.getElementById('btn-preset-invalid')?.addEventListener('click', (e) => {
      playClickSound();
      spawnButtonStarFX(e.currentTarget, 'normal');
      document.getElementById('login-username').value = 'hacker';
      document.getElementById('login-password').value = 'wrongpassword';
    });

    // Flow Builder Challenge Actions
    document.getElementById('verify-flow-btn')?.addEventListener('click', verifyFlowOrder);
    document.getElementById('shuffle-flow-btn')?.addEventListener('click', (e) => {
      playClickSound();
      spawnButtonStarFX(e.currentTarget, 'normal');
      shuffleFlowBlocks();
    });

    // Quiz Challenge Action
    document.getElementById('quiz-next-q-btn')?.addEventListener('click', (e) => {
      playClickSound();
      spawnButtonStarFX(e.currentTarget, 'normal');
      nextQuizQuestion();
    });

    // Final Completion Replay
    document.getElementById('btn-replay-journey')?.addEventListener('click', (e) => {
      spawnButtonStarFX(e.currentTarget, 'hero');
      navigateToSection('landing-section');
    });

    // Escape Key Handler for Dialogs
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('dialog[open]').forEach(d => d.close());
      }
    });
  }

  /* ==========================================================================
     19. INITIALIZATION
     ========================================================================== */
  function init() {
    loadState();
    updateUIPreferences();
    updateJourneyProgressUI();
    updateAchievementsUI();
    updateWirePreview();
    loadGameQuestion();
    renderFlowBlocks();
    loadQuizQuestion();
    setupEventListeners();

    // Unlock beginner badge silently on first load without playing audio
    unlockAchievement('basics', true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
