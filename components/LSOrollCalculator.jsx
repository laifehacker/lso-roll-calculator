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
    label: '#64748b',
    card: 'rgba(255, 255, 255, 0.95)',
    cardSubtle: '#f8fafc',
    border: '#e2e8f0',
    inputBg: '#f8fafc',
    inputBorder: '#e2e8f0',
    inputText: '#0f172a',
    placeholder: '#94a3b8',
    badgeBg: 'rgba(14, 165, 233, 0.14)',
    badgeText: '#0ea5e9',
    shadow: '0 12px 28px rgba(15, 23, 42, 0.12)',
    calendarTile: 'rgba(226, 232, 240, 0.9)',
    footer: '#475569'
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
    footer: '#475569'
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
  const [premiumInput, setPremiumInput] = useState('');
  const [themeMode, setThemeMode] = useState('night');
  const [sunSchedule, setSunSchedule] = useState({ sunrise: null, sunset: null });

  useEffect(() => {
    let timer;

    const updateTheme = (referenceDate = new Date()) => {
      const { sunrise, sunset } = getSunriseSunset(referenceDate);
      setSunSchedule({ sunrise, sunset });

      const now = new Date();
      const isDaytime = sunrise && sunset && now >= sunrise && now < sunset;
      setThemeMode(isDaytime ? 'day' : 'night');

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
  }, []);

  const friday = isFridayCET();
  const palette = themePalette[themeMode];
  const sunriseLabel = formatTimeForZone(sunSchedule.sunrise);
  const sunsetLabel = formatTimeForZone(sunSchedule.sunset);

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

  // Roll tiers change based on day
  const rollTiers = friday
    ? [
        { range: 'OTM', desc: 'Verder OTM', weeks: 0, color: '#22c55e', label: 'Expire', icon: '✓' },
        { range: 'CTM', desc: '≤1% ($0.25 min)', weeks: 1, color: '#F97316', label: 'Roll', icon: '⚠' },
        { range: 'ITM', desc: 'In the money', weeks: 1, color: '#F97316', label: 'Roll', icon: '↻' }
      ]
    : [
        { range: 'OTM', desc: 'Boven strike', weeks: 0, color: '#22c55e', label: 'Hold', icon: '✓' },
        { range: '0-5%', desc: 'ITM', weeks: 0, color: '#22c55e', label: 'Hold', icon: '✓' },
        { range: '5-10%', desc: 'ITM', weeks: 1, color: '#FDE68A', label: '+1 wk', icon: '↻' },
        { range: '10-15%', desc: 'ITM', weeks: 2, color: '#86EFAC', label: '+2 wk', icon: '↻↻' },
        { range: '15-20%', desc: 'ITM', weeks: 3, color: '#93C5FD', label: '+3 wk', icon: '↻↻↻' },
        { range: '20%+', desc: 'Deep ITM', weeks: 4, color: '#DDD6FE', label: 'Max 6wk', icon: '↻↻↻↻' }
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

  const premiumCalculation = useMemo(() => {
    if (!calculation || calculation.weeksToRoll === 0) return null;
    const premium = parseFloat(premiumInput);
    if (!premium || premium <= 0) return null;

    const weeks = calculation.weeksToRoll;
    const perWeek = premium / weeks;
    const isGood = perWeek >= 1;

    return {
      total: premium,
      weeks: weeks,
      perWeek: perWeek,
      isGood: isGood
    };
  }, [premiumInput, calculation]);

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
              <span
                style={{
                  fontSize: '10px',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '9999px',
                  backgroundColor: themeMode === 'day' ? 'rgba(234, 179, 8, 0.18)' : 'rgba(99, 102, 241, 0.2)',
                  color: themeMode === 'day' ? '#ca8a04' : '#c7d2fe',
                  fontWeight: '700',
                  letterSpacing: '0.02em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                {themeMode === 'day' ? '☀ Dag' : '🌙 Nacht'}
              </span>
            </div>
            <div style={{ fontSize: '10px', color: palette.label, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span>🌅 {sunriseLabel} CET</span>
              <span>🌇 {sunsetLabel} CET</span>
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
          <div
            className="lso-card"
            style={{
              borderRadius: '0.75rem',
              border: '1px solid ' + getBgColor(calculation.color, 0.3),
              backgroundColor: getBgColor(calculation.color, 0.1),
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
                  backgroundColor: getBgColor(calculation.color, 0.25),
                  color: calculation.color,
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}
              >
                <span>{calculation.icon}</span>
                {calculation.status.toUpperCase()}
              </span>
              <div style={{ textAlign: 'right' }}>
                <span className="lso-result-percentage" style={{ fontSize: '1.125rem', fontWeight: 'bold', color: calculation.color }}>
                  {calculation.percentage}%
                </span>
                <span style={{ color: palette.label, fontSize: '0.75rem', marginLeft: '0.25rem' }}>(${calculation.absoluteDiff})</span>
              </div>
            </div>

            {/* Roll Advice */}
            {calculation.weeksToRoll > 0 ? (
              <div style={{ borderRadius: '0.5rem', padding: '0.625rem', marginTop: '0.5rem', backgroundColor: getBgColor(calculation.color, 0.15) }}>
                <div style={{ fontSize: '10px', color: palette.label, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                  Roll naar
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <span className="lso-roll-date" style={{ fontSize: '1rem', fontWeight: 'bold', color: calculation.color }}>
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

                {/* Premium Input */}
                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(148, 163, 184, 0.2)' }}>
                  <div style={{ fontSize: '10px', color: palette.label, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>
                    Premium check (optioneel)
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <span
                        style={{
                          position: 'absolute',
                          left: '0.5rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: palette.placeholder,
                          fontSize: '0.75rem'
                        }}
                      >
                        %
                      </span>
                      <input
                        type="number"
                        step="0.1"
                        value={premiumInput}
                        onChange={(e) => setPremiumInput(e.target.value)}
                        placeholder={calculation.weeksToRoll > 1 ? 'totaal' : '1.0'}
                        style={{
                          width: '100%',
                          backgroundColor: palette.inputBg,
                          border: '1px solid ' + palette.inputBorder,
                          borderRadius: '0.375rem',
                          padding: '0.5rem 0.5rem 0.5rem 1.5rem',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: palette.inputText,
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <span style={{ color: palette.label, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                      voor {calculation.weeksToRoll} {calculation.weeksToRoll === 1 ? 'week' : 'weken'}
                    </span>
                  </div>

                  {/* Premium Result */}
                  {premiumCalculation && (
                    <div
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        borderRadius: '0.375rem',
                        backgroundColor: premiumCalculation.isGood ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid ' + (premiumCalculation.isGood ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)')
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.75rem', color: palette.label }}>Per week:</span>
                        <span
                          style={{
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            color: premiumCalculation.isGood ? '#4ade80' : '#f87171'
                          }}
                        >
                          {premiumCalculation.perWeek.toFixed(2)}%
                          <span style={{ fontSize: '0.75rem', marginLeft: '0.25rem' }}>{premiumCalculation.isGood ? '✓' : '✗'}</span>
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '10px',
                          color: premiumCalculation.isGood ? '#86efac' : '#fca5a5',
                          marginTop: '0.25rem'
                        }}
                      >
                        {premiumCalculation.isGood ? 'Target ≥1%/week behaald' : 'Onder target - overweeg korter te rollen'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ borderRadius: '0.5rem', padding: '0.625rem', marginTop: '0.5rem', backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#4ade80' }}>✓</span>
                  <span style={{ fontSize: '0.875rem', color: '#4ade80', fontWeight: '500' }}>{calculation.advice || 'Geen actie nodig'}</span>
                </div>
              </div>
            )}
          </div>
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
                    backgroundColor: getBgColor(tier.color, themeMode === 'day' ? 0.16 : 0.12),
                    opacity: isActive ? 1 : 0.4,
                    boxShadow: isActive ? '0 0 0 1px ' + tier.color : 'none'
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
