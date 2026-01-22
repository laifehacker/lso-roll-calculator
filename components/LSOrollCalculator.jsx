'use client'

import React, { useState, useMemo, useEffect } from 'react';

const CET_TIMEZONE = 'Europe/Amsterdam';
const AMSTERDAM_COORDS = { lat: 52.3676, lon: 4.9041 };
const ZENITH = 90.833; // official zenith for sunrise/sunset
const MS_IN_DAY = 24 * 60 * 60 * 1000;

const themePalette = {
  day: {
    pageBg: 'linear-gradient(180deg, #e2f1ff 0%, #f8fafc 35%, #ffffff 100%)',
    text: '#0f172a',
    muted: '#334155',
    label: '#475569',
    card: 'rgba(255, 255, 255, 0.98)',
    cardSubtle: '#f1f5f9',
    border: '#cbd5e1',
    inputBg: '#f1f5f9',
    inputBorder: '#cbd5e1',
    inputText: '#0f172a',
    placeholder: '#64748b',
    badgeBg: 'rgba(14, 165, 233, 0.18)',
    badgeText: '#0369a1',
    shadow: '0 12px 28px rgba(15, 23, 42, 0.15)',
    calendarTile: 'rgba(203, 213, 225, 0.95)',
    footer: '#334155',
    // Accent colors for day mode - darker for contrast
    accentGreen: '#15803d',
    accentGreenBg: 'rgba(21, 128, 61, 0.15)',
    accentYellow: '#a16207',
    accentYellowBg: 'rgba(161, 98, 7, 0.15)',
    accentOrange: '#c2410c',
    accentOrangeBg: 'rgba(194, 65, 12, 0.15)',
    accentBlue: '#1d4ed8',
    accentBlueBg: 'rgba(29, 78, 216, 0.15)',
    accentPurple: '#7c3aed',
    accentPurpleBg: 'rgba(124, 58, 237, 0.15)',
    // Status text colors
    successText: '#15803d',
    warningText: '#a16207',
    dangerText: '#c2410c'
  },
  night: {
    pageBg: 'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.08), transparent 30%), #020617',
    text: '#e2e8f0',
    muted: '#cbd5e1',
    label: '#94a3b8',
    card: 'rgba(15, 23, 42, 0.85)',
    cardSubtle: 'rgba(15, 23, 42, 0.5)',
    border: '#1e293b',
    inputBg: 'rgba(30, 41, 59, 0.5)',
    inputBorder: '#334155',
    inputText: '#e2e8f0',
    placeholder: '#94a3b8',
    badgeBg: 'rgba(99, 102, 241, 0.18)',
    badgeText: '#c7d2fe',
    shadow: '0 12px 28px rgba(2, 6, 23, 0.45)',
    calendarTile: 'rgba(51, 65, 85, 0.3)',
    footer: '#475569',
    // Accent colors for night mode - brighter for visibility
    accentGreen: '#4ade80',
    accentGreenBg: 'rgba(74, 222, 128, 0.2)',
    accentYellow: '#fde047',
    accentYellowBg: 'rgba(253, 224, 71, 0.2)',
    accentOrange: '#fb923c',
    accentOrangeBg: 'rgba(251, 146, 60, 0.2)',
    accentBlue: '#60a5fa',
    accentBlueBg: 'rgba(96, 165, 250, 0.2)',
    accentPurple: '#a78bfa',
    accentPurpleBg: 'rgba(167, 139, 250, 0.2)',
    // Status text colors
    successText: '#4ade80',
    warningText: '#fde047',
    dangerText: '#fb923c'
  }
};

const degToRad = (deg) => deg * (Math.PI / 180);
const radToDeg = (rad) => rad * (180 / Math.PI);
const normalizeDegrees = (deg) => (deg % 360 + 360) % 360;

const getTimePartsForZone = (date, timeZone) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(date);
  const mapped = {};
  parts.forEach((part) => {
    if (['year', 'month', 'day', 'hour', 'minute', 'second'].includes(part.type)) {
      mapped[part.type] = parseInt(part.value, 10);
    }
  });

  return mapped;
};

const getDayOfYear = ({ year, month, day }) => {
  const current = Date.UTC(year, month - 1, day);
  const start = Date.UTC(year, 0, 0);
  return Math.floor((current - start) / MS_IN_DAY);
};

const calcSunEventUTC = (isSunrise, dayOfYear, latitude, longitude) => {
  const lngHour = longitude / 15;
  const t = dayOfYear + ((isSunrise ? 6 : 18) - lngHour) / 24;

  const M = 0.9856 * t - 3.289;
  let L = M + 1.916 * Math.sin(degToRad(M)) + 0.020 * Math.sin(degToRad(2 * M)) + 282.634;
  L = normalizeDegrees(L);

  let RA = radToDeg(Math.atan(0.91764 * Math.tan(degToRad(L))));
  RA = normalizeDegrees(RA);

  const Lquadrant = Math.floor(L / 90) * 90;
  const RAquadrant = Math.floor(RA / 90) * 90;
  RA = RA + (Lquadrant - RAquadrant);
  RA /= 15;

  const sinDec = 0.39782 * Math.sin(degToRad(L));
  const cosDec = Math.cos(Math.asin(sinDec));
  const cosH = (Math.cos(degToRad(ZENITH)) - sinDec * Math.sin(degToRad(latitude))) / (cosDec * Math.cos(degToRad(latitude)));

  if (cosH > 1 || cosH < -1) {
    return null;
  }

  let H = isSunrise ? 360 - radToDeg(Math.acos(cosH)) : radToDeg(Math.acos(cosH));
  H /= 15;

  const T = H + RA - 0.06571 * t - 6.622;
  let UT = T - lngHour;
  UT = (UT + 24) % 24;

  const hour = Math.floor(UT);
  const minute = Math.round((UT - hour) * 60);
  return { hour: (hour + Math.floor(minute / 60)) % 24, minute: minute % 60 };
};

const getSunriseSunset = (date) => {
  const parts = getTimePartsForZone(date, CET_TIMEZONE);
  const dayOfYear = getDayOfYear(parts);

  const sunriseUtc = calcSunEventUTC(true, dayOfYear, AMSTERDAM_COORDS.lat, AMSTERDAM_COORDS.lon);
  const sunsetUtc = calcSunEventUTC(false, dayOfYear, AMSTERDAM_COORDS.lat, AMSTERDAM_COORDS.lon);

  return {
    sunrise: sunriseUtc ? new Date(Date.UTC(parts.year, parts.month - 1, parts.day, sunriseUtc.hour, sunriseUtc.minute)) : null,
    sunset: sunsetUtc ? new Date(Date.UTC(parts.year, parts.month - 1, parts.day, sunsetUtc.hour, sunsetUtc.minute)) : null
  };
};

const formatTimeForZone = (date, timeZone = CET_TIMEZONE) => {
  if (!date) return '--:--';
  return new Intl.DateTimeFormat('nl-NL', { timeZone, hour: '2-digit', minute: '2-digit' }).format(date);
};

const isFridayCET = () => {
  const weekday = new Intl.DateTimeFormat('en-US', { timeZone: CET_TIMEZONE, weekday: 'short' }).format(new Date());
  return weekday.toLowerCase().startsWith('fri');
};

const LSOrollCalculator = () => {
  const [strikePrice, setStrikePrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [premiums, setPremiums] = useState({ week1: '', week2: '', week3: '', weekN: '' });
  const [customWeeks, setCustomWeeks] = useState('4');
  const [themeMode, setThemeMode] = useState('night');
  const [manualTheme, setManualTheme] = useState(null); // null = auto, 'day' | 'night' = manual override
  const [sunSchedule, setSunSchedule] = useState({ sunrise: null, sunset: null });

  useEffect(() => {
    let timer;

    const updateTheme = (referenceDate = new Date()) => {
      const { sunrise, sunset } = getSunriseSunset(referenceDate);
      setSunSchedule({ sunrise, sunset });

      // Only auto-set theme if no manual override
      if (manualTheme === null) {
        const now = new Date();
        const isDaytime = sunrise && sunset && now >= sunrise && now < sunset;
        setThemeMode(isDaytime ? 'day' : 'night');
      }

      const now = new Date();
      let nextCheckTarget;
      if (!sunrise || !sunset) {
        nextCheckTarget = new Date(now.getTime() + MS_IN_DAY);
      } else if (now < sunrise) {
        nextCheckTarget = sunrise;
      } else if (now < sunset) {
        nextCheckTarget = sunset;
      } else {
        const tomorrow = new Date(referenceDate.getTime() + MS_IN_DAY);
        const next = getSunriseSunset(tomorrow);
        nextCheckTarget = next.sunrise || new Date(now.getTime() + MS_IN_DAY);
      }

      const delay = Math.max(5000, Math.min(MS_IN_DAY, nextCheckTarget.getTime() - now.getTime() + 1000));
      timer = setTimeout(() => updateTheme(new Date()), delay);
    };

    updateTheme();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [manualTheme]);

  // Apply manual theme override
  useEffect(() => {
    if (manualTheme !== null) {
      setThemeMode(manualTheme);
    }
  }, [manualTheme]);

  const toggleTheme = () => {
    if (manualTheme === null) {
      // First click: switch to opposite of current
      setManualTheme(themeMode === 'day' ? 'night' : 'day');
    } else {
      // Already manual: toggle between day/night
      setManualTheme(manualTheme === 'day' ? 'night' : 'day');
    }
  };

  const resetToAuto = () => {
    setManualTheme(null);
  };

  const friday = isFridayCET();
  const palette = themePalette[themeMode];
  const sunriseLabel = formatTimeForZone(sunSchedule.sunrise);
  const sunsetLabel = formatTimeForZone(sunSchedule.sunset);

  // Helper to get theme-aware status colors
  const getStatusColors = (status, tier) => {
    if (status === 'otm' || status === 'itm-safe') {
      return { color: palette.accentGreen, bg: palette.accentGreenBg };
    }
    if (status === 'ctm') {
      return { color: palette.accentOrange, bg: palette.accentOrangeBg };
    }
    // ITM tiers
    if (tier === '5-10%') {
      return { color: palette.accentYellow, bg: palette.accentYellowBg };
    }
    if (tier === '10-15%') {
      return { color: palette.accentGreen, bg: palette.accentGreenBg };
    }
    if (tier === '15-20%') {
      return { color: palette.accentBlue, bg: palette.accentBlueBg };
    }
    if (tier === '20%+') {
      return { color: palette.accentPurple, bg: palette.accentPurpleBg };
    }
    // Default for other ITM
    return { color: palette.accentOrange, bg: palette.accentOrangeBg };
  };

  const getNextFriday = (weeksOut) => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    let daysUntilFriday = 5 - dayOfWeek;
    if (daysUntilFriday <= 0) daysUntilFriday += 7;
    const nextFriday = new Date(today);
    nextFriday.setDate(today.getDate() + daysUntilFriday + weeksOut * 7);
    return nextFriday;
  };

  const formatFriday = (date) => {
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
  };

  const calculation = useMemo(() => {
    const strike = parseFloat(strikePrice);
    const current = parseFloat(currentPrice);

    if (!strike || !current || strike <= 0 || current <= 0) {
      return null;
    }

    const difference = strike - current;
    const absoluteDifference = Math.abs(difference);

    // OTM: current > strike
    if (current > strike) {
      const otmPercentage = ((current - strike) / strike) * 100;

      // FRIDAY RULES FOR OTM
      if (friday) {
        // Slightly OTM: 1% met $0.25 minimum - roll for shortest time
        if (otmPercentage <= 1 && absoluteDifference >= 0.25) {
          const targetFriday = getNextFriday(1);
          return {
            percentage: otmPercentage.toFixed(2),
            absoluteDiff: absoluteDifference.toFixed(2),
            weeksToRoll: 1,
            status: 'ctm',
            tier: 'CTM',
            targetDate: formatFriday(targetFriday),
            color: '#F97316',
            icon: '⚠',
            advice: 'Roll naar kortste termijn voor goede premium'
          };
        }
        // Further OTM on Friday: let expire
        return {
          percentage: otmPercentage.toFixed(2),
          absoluteDiff: absoluteDifference.toFixed(2),
          weeksToRoll: 0,
          status: 'otm',
          tier: 'OTM',
          targetDate: null,
          color: '#22c55e',
          icon: '✓',
          advice: 'Laat expireren!'
        };
      }

      // MA-DO RULES FOR OTM: altijd geen actie, ongeacht hoe dichtbij
      return {
        percentage: otmPercentage.toFixed(2),
        absoluteDiff: absoluteDifference.toFixed(2),
        weeksToRoll: 0,
        status: 'otm',
        tier: 'OTM',
        targetDate: null,
        color: '#22c55e',
        icon: '✓',
        advice: 'Geen actie nodig'
      };
    }

    // ITM: current <= strike
    const itmPercentage = (difference / strike) * 100;
    let weeksToRoll, tier, color, icon, advice;

    // FRIDAY RULES FOR ITM
    if (friday) {
      // On Friday, any ITM: roll for shortest possible time for good premium
      weeksToRoll = 1;
      tier = 'ITM';
      color = '#F97316';
      icon = '↻';
      advice = 'Roll naar kortste termijn voor goede premium';

      const targetFriday = getNextFriday(weeksToRoll);
      return {
        percentage: itmPercentage.toFixed(2),
        absoluteDiff: absoluteDifference.toFixed(2),
        weeksToRoll: weeksToRoll,
        tier: tier,
        status: 'itm',
        targetDate: formatFriday(targetFriday),
        color: color,
        icon: icon,
        advice: advice
      };
    }

    // MA-DO RULES FOR ITM
    if (itmPercentage <= 5) {
      // 0-5% ITM: do nothing on ma-do
      return {
        percentage: itmPercentage.toFixed(2),
        absoluteDiff: absoluteDifference.toFixed(2),
        weeksToRoll: 0,
        status: 'itm-safe',
        tier: '0-5%',
        targetDate: null,
        color: '#22c55e',
        icon: '✓',
        advice: 'Geen actie nodig (ma-do)'
      };
    } else if (itmPercentage <= 10) {
      weeksToRoll = 1;
      tier = '5-10%';
      color = '#FDE68A';
      icon = '↻';
      advice = 'Roll 1 week, behoud 1%/week premium';
    } else if (itmPercentage <= 15) {
      weeksToRoll = 2;
      tier = '10-15%';
      color = '#86EFAC';
      icon = '↻↻';
      advice = 'Roll 2 weken, behoud 1%/week premium';
    } else if (itmPercentage <= 20) {
      weeksToRoll = 3;
      tier = '15-20%';
      color = '#93C5FD';
      icon = '↻↻↻';
      advice = 'Roll 3 weken, behoud 1%/week premium';
    } else {
      // 20%+ ITM: keep expiration close, max 6 weeks
      weeksToRoll = 4;
      tier = '20%+';
      color = '#DDD6FE';
      icon = '↻↻↻↻';
      advice = 'Max 6wk, check 21 dagen voor expiry!';
    }

    const targetFriday = getNextFriday(weeksToRoll);

    return {
      percentage: itmPercentage.toFixed(2),
      absoluteDiff: absoluteDifference.toFixed(2),
      weeksToRoll: weeksToRoll,
      tier: tier,
      status: 'itm',
      targetDate: formatFriday(targetFriday),
      color: color,
      icon: icon,
      advice: advice
    };
  }, [strikePrice, currentPrice, friday]);

  // Roll tiers change based on day - use theme-aware colors
  const rollTiers = friday
    ? [
        { range: 'OTM', desc: 'Verder OTM', weeks: 0, color: palette.accentGreen, bg: palette.accentGreenBg, label: 'Expire', icon: '✓' },
        { range: 'CTM', desc: '≤1% ($0.25 min)', weeks: 1, color: palette.accentOrange, bg: palette.accentOrangeBg, label: 'Roll', icon: '⚠' },
        { range: 'ITM', desc: 'In the money', weeks: 1, color: palette.accentOrange, bg: palette.accentOrangeBg, label: 'Roll', icon: '↻' }
      ]
    : [
        { range: 'OTM', desc: 'Boven strike', weeks: 0, color: palette.accentGreen, bg: palette.accentGreenBg, label: 'Hold', icon: '✓' },
        { range: '0-5%', desc: 'ITM', weeks: 0, color: palette.accentGreen, bg: palette.accentGreenBg, label: 'Hold', icon: '✓' },
        { range: '5-10%', desc: 'ITM', weeks: 1, color: palette.accentYellow, bg: palette.accentYellowBg, label: '+1 wk', icon: '↻' },
        { range: '10-15%', desc: 'ITM', weeks: 2, color: palette.accentGreen, bg: palette.accentGreenBg, label: '+2 wk', icon: '↻↻' },
        { range: '15-20%', desc: 'ITM', weeks: 3, color: palette.accentBlue, bg: palette.accentBlueBg, label: '+3 wk', icon: '↻↻↻' },
        { range: '20%+', desc: 'Deep ITM', weeks: 4, color: palette.accentPurple, bg: palette.accentPurpleBg, label: 'Max 6wk', icon: '↻↻↻↻' }
      ];

  const generateFridays = () => {
    const fridays = [];
    for (let i = 0; i <= 4; i++) {
      const fridayDate = getNextFriday(i);
      fridays.push({
        weekNum: i,
        date: fridayDate,
        label: i === 0 ? 'Deze vr' : '+' + i + ' wk',
        isTarget: calculation && calculation.weeksToRoll === i && calculation.weeksToRoll > 0
      });
    }
    return fridays;
  };

  const fridays = generateFridays();

  const getStrikeDisplay = () => {
    const strike = parseFloat(strikePrice);
    if (!strike) return '$--';
    return '$' + strike.toFixed(2);
  };

  const handlePremiumChange = (key, value) => {
    setPremiums(prev => ({ ...prev, [key]: value }));
  };

  const premiumComparison = useMemo(() => {
    const strike = parseFloat(strikePrice);
    if (!strike || strike <= 0) return { entries: [], best: null };

    const weeks = parseInt(customWeeks) || 4;
    const entries = [
      { key: 'week1', weeks: 1, label: '+1 wk', premium: premiums.week1 },
      { key: 'week2', weeks: 2, label: '+2 wk', premium: premiums.week2 },
      { key: 'week3', weeks: 3, label: '+3 wk', premium: premiums.week3 },
      { key: 'weekN', weeks: weeks, label: '+' + weeks + ' wk', premium: premiums.weekN }
    ].map(entry => {
      const premium = parseFloat(entry.premium);
      const percentage = premium > 0 ? (premium / strike) * 100 : null;
      const weeklyYield = percentage ? percentage / entry.weeks : null;
      return {
        ...entry,
        date: getNextFriday(entry.weeks),
        percentage,
        weeklyYield,
        valid: premium > 0
      };
    });

    const validEntries = entries.filter(e => e.valid);
    const best = validEntries.length > 0
      ? validEntries.reduce((b, c) => (!b || c.weeklyYield > b.weeklyYield) ? c : b, null)
      : null;

    return { entries, best };
  }, [strikePrice, premiums, customWeeks]);

  const getBgColor = (baseColor, opacity) => {
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')';
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: palette.pageBg,
        color: palette.text,
        fontFamily: 'Inter, system-ui, sans-serif',
        transition: 'background 0.4s ease, color 0.4s ease'
      }}
    >
      <style>{`
        .lso-container {
          max-width: 28rem;
          margin: 0 auto;
          padding: 1rem;
        }
        @media (min-width: 640px) {
          .lso-container {
            max-width: 32rem;
            padding: 1.5rem;
          }
          .lso-container .lso-title { font-size: 1.375rem; }
          .lso-container .lso-card { padding: 1rem; margin-bottom: 1rem; }
          .lso-container .lso-result-percentage { font-size: 1.375rem; }
          .lso-container .lso-roll-date { font-size: 1.125rem; }
        }
        @media (min-width: 768px) {
          .lso-container {
            max-width: 36rem;
            padding: 2rem;
          }
          .lso-container .lso-title { font-size: 1.5rem; }
          .lso-container .lso-card { padding: 1.25rem; margin-bottom: 1.25rem; }
          .lso-container .lso-result-percentage { font-size: 1.5rem; }
          .lso-container .lso-roll-date { font-size: 1.25rem; }
          .lso-container .lso-label { font-size: 11px; }
          .lso-container .lso-friday-label { font-size: 11px; }
          .lso-container .lso-friday-date { font-size: 0.875rem; }
        }
        @media (min-width: 1024px) {
          .lso-container {
            max-width: 42rem;
            padding: 2.5rem;
          }
          .lso-container .lso-title { font-size: 1.75rem; }
          .lso-container .lso-card { padding: 1.5rem; margin-bottom: 1.5rem; }
          .lso-container .lso-result-percentage { font-size: 1.75rem; }
          .lso-container .lso-roll-date { font-size: 1.375rem; }
          .lso-container .lso-label { font-size: 12px; }
          .lso-container .lso-friday-label { font-size: 12px; }
          .lso-container .lso-friday-date { font-size: 1rem; }
          .lso-container .lso-tier-text { font-size: 0.875rem; }
        }
        .lso-container input {
          font-size: 1rem;
        }
        @media (min-width: 640px) {
          .lso-container input {
            font-size: 1.125rem;
            padding: 0.75rem 0.5rem 0.75rem 2rem;
          }
        }
        @media (min-width: 768px) {
          .lso-container input {
            font-size: 1.25rem;
            padding: 0.875rem 0.75rem 0.875rem 2.25rem;
          }
        }
      `}</style>
      <div className="lso-container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '0.5rem',
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span style={{ color: '#FBBF24', fontSize: '0.875rem' }}>↻</span>
            </div>
            <h1 className="lso-title" style={{ fontSize: '1.125rem', fontWeight: 'bold', margin: 0 }}>
              LSO Roll Calculator
            </h1>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span
                style={{
                  fontSize: '10px',
                  color: palette.label,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                v1.4
              </span>
              <span
                style={{
                  fontSize: '10px',
                  padding: '0.125rem 0.375rem',
                  borderRadius: '9999px',
                  backgroundColor: friday ? 'rgba(249, 115, 22, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                  color: friday ? '#F97316' : '#22c55e',
                  fontWeight: '600'
                }}
              >
                {friday ? 'VRIJDAG' : 'MA-DO'}
              </span>
{/* Theme Toggle Switch */}
              <div
                onClick={toggleTheme}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  cursor: 'pointer',
                  padding: '0.125rem 0.25rem',
                  borderRadius: '9999px',
                  backgroundColor: themeMode === 'day' ? 'rgba(234, 179, 8, 0.12)' : 'rgba(99, 102, 241, 0.15)'
                }}
                title={manualTheme ? 'Schuif om te wisselen (handmatig)' : 'Schuif om handmatig te wisselen'}
              >
                <span style={{ fontSize: '10px', opacity: themeMode === 'day' ? 1 : 0.4 }}>☀</span>
                <div
                  style={{
                    width: '28px',
                    height: '14px',
                    borderRadius: '9999px',
                    backgroundColor: themeMode === 'day' ? '#ca8a04' : '#6366f1',
                    position: 'relative',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      position: 'absolute',
                      top: '2px',
                      left: themeMode === 'day' ? '2px' : '16px',
                      transition: 'left 0.2s ease',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                    }}
                  />
                </div>
                <span style={{ fontSize: '10px', opacity: themeMode === 'night' ? 1 : 0.4 }}>🌙</span>
                {manualTheme && <span style={{ fontSize: '6px', color: palette.label }}>•</span>}
              </div>
            </div>
            <div style={{ fontSize: '10px', color: palette.label, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span>🌅 {sunriseLabel} CET</span>
              <span>🌇 {sunsetLabel} CET</span>
              {manualTheme && (
                <button
                  onClick={resetToAuto}
                  style={{
                    fontSize: '9px',
                    padding: '0.125rem 0.375rem',
                    borderRadius: '0.25rem',
                    backgroundColor: 'transparent',
                    color: palette.label,
                    border: '1px solid ' + palette.border,
                    cursor: 'pointer',
                    opacity: 0.7
                  }}
                  title="Terug naar automatisch"
                >
                  Auto
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Calculator Inputs */}
        <div
          className="lso-card"
          style={{
            backgroundColor: palette.card,
            borderRadius: '0.75rem',
            border: '1px solid ' + palette.border,
            padding: '0.75rem',
            marginBottom: '0.75rem',
            boxShadow: palette.shadow
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div>
              <label
                className="lso-label"
                style={{ fontSize: '10px', color: palette.label, textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                Strike
              </label>
              <div style={{ position: 'relative', marginTop: '0.25rem' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '0.625rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: palette.placeholder,
                    fontSize: '0.875rem'
                  }}
                >
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={strikePrice}
                  onChange={(e) => setStrikePrice(e.target.value)}
                  placeholder="100"
                  style={{
                    width: '100%',
                    backgroundColor: palette.inputBg,
                    border: '1px solid ' + palette.inputBorder,
                    borderRadius: '0.5rem',
                    padding: '0.625rem 0.5rem 0.625rem 1.75rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: palette.inputText,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
            <div>
              <label
                className="lso-label"
                style={{ fontSize: '10px', color: palette.label, textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                Koers
              </label>
              <div style={{ position: 'relative', marginTop: '0.25rem' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '0.625rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: palette.placeholder,
                    fontSize: '0.875rem'
                  }}
                >
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(e.target.value)}
                  placeholder="95"
                  style={{
                    width: '100%',
                    backgroundColor: palette.inputBg,
                    border: '1px solid ' + palette.inputBorder,
                    borderRadius: '0.5rem',
                    padding: '0.625rem 0.5rem 0.625rem 1.75rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: palette.inputText,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Result */}
        {calculation ? (
          (() => {
            const statusColors = getStatusColors(calculation.status, calculation.tier);
            return (
          <div
            className="lso-card"
            style={{
              borderRadius: '0.75rem',
              border: '1px solid ' + statusColors.color + '40',
              backgroundColor: statusColors.bg,
              padding: '0.75rem',
              marginBottom: '0.75rem',
              boxShadow: palette.shadow,
              color: palette.text
            }}
          >
            {/* Status Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '9999px',
                  backgroundColor: statusColors.color + '25',
                  color: statusColors.color,
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}
              >
                <span>{calculation.icon}</span>
                {calculation.status.toUpperCase()}
              </span>
              <div style={{ textAlign: 'right' }}>
                <span className="lso-result-percentage" style={{ fontSize: '1.125rem', fontWeight: 'bold', color: statusColors.color }}>
                  {calculation.percentage}%
                </span>
                <span style={{ color: palette.label, fontSize: '0.75rem', marginLeft: '0.25rem' }}>(${calculation.absoluteDiff})</span>
              </div>
            </div>

            {/* Roll Advice */}
            {calculation.weeksToRoll > 0 ? (
              <div style={{ borderRadius: '0.5rem', padding: '0.625rem', marginTop: '0.5rem', backgroundColor: statusColors.color + '18' }}>
                <div style={{ fontSize: '10px', color: palette.label, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                  Roll naar
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <span className="lso-roll-date" style={{ fontSize: '1rem', fontWeight: 'bold', color: statusColors.color }}>
                    {calculation.targetDate} (vr)
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500', color: palette.muted }}>strike {getStrikeDisplay()}</span>
                </div>
                {calculation.advice && (
                  <p
                    style={{
                      fontSize: '10px',
                      color: themeMode === 'day' ? '#475569' : 'rgba(148, 163, 184, 0.9)',
                      marginTop: '0.375rem',
                      margin: '0.375rem 0 0 0'
                    }}
                  >
                    {calculation.advice}
                  </p>
                )}

                {/* Premium Vergelijker */}
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(148, 163, 184, 0.2)' }}>
                  <div style={{ fontSize: '10px', color: palette.label, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    Premium vergelijker
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {premiumComparison.entries.map((entry) => {
                      const isBest = premiumComparison.best && entry.key === premiumComparison.best.key;
                      return (
                        <div key={entry.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {entry.key === 'weekN' ? (
                            <div style={{ width: '3.5rem', display: 'flex', alignItems: 'center', gap: '0.125rem' }}>
                              <span style={{ fontSize: '0.7rem', color: palette.label }}>+</span>
                              <input
                                type="number"
                                min="1"
                                max="52"
                                value={customWeeks}
                                onChange={(e) => setCustomWeeks(e.target.value)}
                                style={{ width: '1.5rem', backgroundColor: palette.inputBg, border: '1px solid ' + palette.inputBorder, borderRadius: '0.25rem', padding: '0.125rem', fontSize: '0.7rem', color: palette.inputText, outline: 'none', textAlign: 'center' }}
                              />
                              <span style={{ fontSize: '0.7rem', color: palette.label }}>wk</span>
                            </div>
                          ) : (
                            <div style={{ width: '3.5rem', fontSize: '0.7rem', color: palette.label, fontWeight: '500' }}>{entry.label}</div>
                          )}
                          <div style={{ fontSize: '0.6rem', color: palette.muted, width: '3rem' }}>{formatFriday(entry.date)}</div>
                          <div style={{ position: 'relative', width: '4rem' }}>
                            <span style={{ position: 'absolute', left: '0.375rem', top: '50%', transform: 'translateY(-50%)', color: palette.placeholder, fontSize: '0.65rem' }}>$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={entry.premium}
                              onChange={(e) => handlePremiumChange(entry.key, e.target.value)}
                              placeholder="0.00"
                              style={{ width: '100%', backgroundColor: palette.inputBg, border: '1px solid ' + palette.inputBorder, borderRadius: '0.25rem', padding: '0.375rem 0.25rem 0.375rem 1rem', fontSize: '0.75rem', color: palette.inputText, outline: 'none', boxSizing: 'border-box' }}
                            />
                          </div>
                          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.375rem' }}>
                            {entry.valid ? (
                              <>
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ fontSize: '0.75rem', fontWeight: '600', color: isBest ? palette.accentGreen : palette.text }}>{entry.weeklyYield.toFixed(2)}%/wk</div>
                                  <div style={{ fontSize: '0.6rem', color: palette.muted }}>{entry.percentage.toFixed(2)}% tot</div>
                                </div>
                                {isBest && <span style={{ fontSize: '0.6rem', padding: '0.125rem 0.25rem', borderRadius: '0.25rem', backgroundColor: palette.accentGreenBg, color: palette.accentGreen, fontWeight: '600' }}>BEST</span>}
                              </>
                            ) : (
                              <span style={{ fontSize: '0.7rem', color: palette.muted }}>--</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {premiumComparison.best && (
                    <div style={{ marginTop: '0.5rem', padding: '0.375rem 0.5rem', borderRadius: '0.375rem', backgroundColor: palette.accentGreenBg, border: '1px solid ' + palette.accentGreen + '50' }}>
                      <div style={{ fontSize: '0.7rem', color: palette.accentGreen, fontWeight: '600' }}>
                        Beste: {premiumComparison.best.label} ({premiumComparison.best.weeklyYield.toFixed(2)}%/wk)
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ borderRadius: '0.5rem', padding: '0.625rem', marginTop: '0.5rem', backgroundColor: statusColors.bg }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: statusColors.color }}>✓</span>
                  <span style={{ fontSize: '0.875rem', color: statusColors.color, fontWeight: '500' }}>{calculation.advice || 'Geen actie nodig'}</span>
                </div>
              </div>
            )}
          </div>
            );
          })()
        ) : (
          <div
            style={{
              borderRadius: '0.75rem',
              border: '1px solid ' + palette.border,
              backgroundColor: palette.cardSubtle,
              padding: '1rem',
              marginBottom: '0.75rem',
              textAlign: 'center',
              boxShadow: palette.shadow
            }}
          >
            <span style={{ color: palette.muted, fontSize: '0.875rem' }}>Vul strike en koers in</span>
          </div>
        )}

        {/* Roll Rules */}
        <div
          className="lso-card"
          style={{
            backgroundColor: palette.card,
            borderRadius: '0.75rem',
            border: '1px solid ' + palette.border,
            padding: '0.75rem',
            marginBottom: '0.75rem',
            boxShadow: palette.shadow
          }}
        >
          <div style={{ fontSize: '10px', color: palette.label, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Roll regels
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: friday ? '1fr 1fr 1fr' : '1fr 1fr', gap: '0.375rem' }}>
            {rollTiers.map((tier, idx) => {
              let isActive = false;
              if (calculation) {
                if (friday) {
                  // Friday matching
                  isActive = tier.range === 'OTM' && calculation.status === 'otm';
                  isActive = isActive || (tier.range === 'CTM' && calculation.status === 'ctm');
                  isActive = isActive || (tier.range === 'ITM' && calculation.status === 'itm');
                } else {
                  // Ma-Do matching (geen CTM op ma-do)
                  isActive =
                    (tier.range === 'OTM' && calculation.status === 'otm') ||
                    (tier.range === '0-5%' && calculation.status === 'itm-safe') ||
                    (tier.range === '5-10%' && calculation.tier === '5-10%') ||
                    (tier.range === '10-15%' && calculation.tier === '10-15%') ||
                    (tier.range === '15-20%' && calculation.tier === '15-20%') ||
                    (tier.range === '20%+' && calculation.tier === '20%+');
                }
              }

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.375rem 0.5rem',
                    borderRadius: '0.5rem',
                    backgroundColor: tier.bg,
                    opacity: isActive ? 1 : 0.4,
                    boxShadow: isActive ? '0 0 0 2px ' + tier.color : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <span style={{ fontSize: '0.75rem' }}>{tier.icon}</span>
                    <span className="lso-tier-text" style={{ fontSize: '0.75rem', fontWeight: '500' }}>
                      {tier.range}
                    </span>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: '500', color: tier.color }}>{tier.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Friday Calendar */}
        <div
          className="lso-card"
          style={{
            backgroundColor: palette.card,
            borderRadius: '0.75rem',
            border: '1px solid ' + palette.border,
            padding: '0.75rem',
            boxShadow: palette.shadow
          }}
        >
          <div style={{ fontSize: '10px', color: palette.label, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Expiry vrijdagen
          </div>
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            {fridays.map((fri, idx) => {
              const isTarget = fri.isTarget;
              return (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    borderRadius: '0.5rem',
                    padding: '0.5rem',
                    textAlign: 'center',
                    backgroundColor: isTarget && calculation ? getBgColor(calculation.color, 0.2) : palette.calendarTile,
                    opacity: isTarget ? 1 : 0.55,
                    transform: isTarget ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: isTarget && calculation ? '0 0 0 1px ' + calculation.color : 'none'
                  }}
                >
                  <div className="lso-friday-label" style={{ fontSize: '10px', color: palette.label }}>
                    {fri.label}
                  </div>
                  <div
                    className="lso-friday-date"
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      marginTop: '0.125rem',
                      color: isTarget && calculation ? calculation.color : palette.muted
                    }}
                  >
                    {fri.date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                  </div>
                  {isTarget && (
                    <div
                      style={{
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        margin: '0.25rem auto 0',
                        backgroundColor: calculation ? calculation.color : palette.text
                      }}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '1rem', color: palette.footer, fontSize: '10px' }}>
          <p style={{ margin: '0 0 0.25rem 0', color: '#F97316', fontWeight: '500' }}>ALTIJD zelfde strike - nooit up/down</p>
          <p style={{ margin: '0 0 0.25rem 0' }}>4-6wk roll? Check 21 dagen voor expiry!</p>
          <p style={{ margin: '0 0 0.25rem 0' }}>CTM check: 1u voor market close</p>
          <p style={{ margin: 0, color: palette.label }}>Bij twijfel/stress: roll 1 week</p>
        </div>
      </div>
    </div>
  );
};

export default LSOrollCalculator;
