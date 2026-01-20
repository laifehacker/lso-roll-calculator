import React, { useState, useMemo } from 'react';

const LSOrollCalculator = () => {
  const [strikePrice, setStrikePrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');

  const getNextFriday = (weeksOut) => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    let daysUntilFriday = 5 - dayOfWeek;
    if (daysUntilFriday <= 0) daysUntilFriday += 7;
    const nextFriday = new Date(today);
    nextFriday.setDate(today.getDate() + daysUntilFriday + (weeksOut * 7));
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

      // CTM: binnen 1% boven strike EN minimaal $0.10 verschil
      if (otmPercentage <= 1 && absoluteDifference >= 0.10) {
        const targetFriday = getNextFriday(1);
        return {
          percentage: otmPercentage.toFixed(2),
          absoluteDiff: absoluteDifference.toFixed(2),
          weeksToRoll: 1,
          status: 'ctm',
          tier: 'CTM',
          targetDate: formatFriday(targetFriday),
          color: '#F97316',
          icon: '⚠'
        };
      }

      // Safe OTM
      return {
        percentage: otmPercentage.toFixed(2),
        absoluteDiff: absoluteDifference.toFixed(2),
        weeksToRoll: 0,
        status: 'otm',
        tier: 'OTM',
        targetDate: null,
        color: '#22c55e',
        icon: '✓'
      };
    }

    // ITM: current <= strike
    const itmPercentage = (difference / strike) * 100;
    let weeksToRoll, tier, color, icon;

    if (itmPercentage <= 5) {
      weeksToRoll = 1;
      tier = '0-5%';
      color = '#FBBF24';
      icon = '↻';
    } else if (itmPercentage <= 10) {
      weeksToRoll = 1;
      tier = '5-10%';
      color = '#FDE68A';
      icon = '↻';
    } else if (itmPercentage <= 15) {
      weeksToRoll = 2;
      tier = '10-15%';
      color = '#86EFAC';
      icon = '↻↻';
    } else if (itmPercentage <= 20) {
      weeksToRoll = 3;
      tier = '15-20%';
      color = '#93C5FD';
      icon = '↻↻↻';
    } else {
      weeksToRoll = 4;
      tier = '20%+';
      color = '#DDD6FE';
      icon = '↻↻↻↻';
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
      icon: icon
    };
  }, [strikePrice, currentPrice]);

  const rollTiers = [
    { range: 'OTM', desc: '> 1% boven strike', weeks: 0, color: '#22c55e', label: 'Hold', icon: '✓' },
    { range: 'CTM', desc: '≤ 1% (min $0.10)', weeks: 1, color: '#F97316', label: '+1 wk', icon: '⚠' },
    { range: '0-10%', desc: 'ITM', weeks: 1, color: '#FDE68A', label: '+1 wk', icon: '↻' },
    { range: '10-15%', desc: 'ITM', weeks: 2, color: '#86EFAC', label: '+2 wk', icon: '↻↻' },
    { range: '15-20%', desc: 'ITM', weeks: 3, color: '#93C5FD', label: '+3 wk', icon: '↻↻↻' },
    { range: '20%+', desc: 'Deep ITM', weeks: 4, color: '#DDD6FE', label: '+4 wk', icon: '↻↻↻↻' },
  ];

  const generateFridays = () => {
    const fridays = [];
    for (let i = 0; i <= 4; i++) {
      const friday = getNextFriday(i);
      fridays.push({
        weekNum: i,
        date: friday,
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

  const getBgColor = (baseColor, opacity) => {
    const hex = baseColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')';
  };

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#020617', color: 'white', fontFamily: 'system-ui, sans-serif'}}>
      <div style={{maxWidth: '28rem', margin: '0 auto', padding: '1rem'}}>

        {/* Header */}
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <div style={{width: '2rem', height: '2rem', borderRadius: '0.5rem', backgroundColor: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <span style={{color: '#FBBF24', fontSize: '0.875rem'}}>↻</span>
            </div>
            <h1 style={{fontSize: '1.125rem', fontWeight: 'bold', margin: 0}}>LSO Roll Calculator</h1>
          </div>
          <span style={{fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em'}}>v1.1</span>
        </div>

        {/* Calculator Inputs */}
        <div style={{backgroundColor: 'rgba(15, 23, 42, 0.8)', borderRadius: '0.75rem', border: '1px solid #1e293b', padding: '0.75rem', marginBottom: '0.75rem'}}>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem'}}>
            <div>
              <label style={{fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Strike</label>
              <div style={{position: 'relative', marginTop: '0.25rem'}}>
                <span style={{position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: '#475569', fontSize: '0.875rem'}}>$</span>
                <input
                  type="number"
                  step="0.01"
                  value={strikePrice}
                  onChange={(e) => setStrikePrice(e.target.value)}
                  placeholder="100"
                  style={{width: '100%', backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.625rem 0.5rem 0.625rem 1.75rem', fontSize: '1rem', fontWeight: '600', color: 'white', outline: 'none', boxSizing: 'border-box'}}
                />
              </div>
            </div>
            <div>
              <label style={{fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Koers</label>
              <div style={{position: 'relative', marginTop: '0.25rem'}}>
                <span style={{position: 'absolute', left: '0.625rem', top: '50%', transform: 'translateY(-50%)', color: '#475569', fontSize: '0.875rem'}}>$</span>
                <input
                  type="number"
                  step="0.01"
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(e.target.value)}
                  placeholder="95"
                  style={{width: '100%', backgroundColor: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '0.5rem', padding: '0.625rem 0.5rem 0.625rem 1.75rem', fontSize: '1rem', fontWeight: '600', color: 'white', outline: 'none', boxSizing: 'border-box'}}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Result */}
        {calculation ? (
          <div style={{borderRadius: '0.75rem', border: '1px solid ' + getBgColor(calculation.color, 0.3), backgroundColor: getBgColor(calculation.color, 0.1), padding: '0.75rem', marginBottom: '0.75rem'}}>
            {/* Status Row */}
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
              <span style={{display: 'inline-flex', alignItems: 'center', gap: '0.375rem', padding: '0.125rem 0.5rem', borderRadius: '9999px', backgroundColor: getBgColor(calculation.color, 0.25), color: calculation.color, fontSize: '0.75rem', fontWeight: '600'}}>
                <span>{calculation.icon}</span>
                {calculation.status.toUpperCase()}
              </span>
              <div style={{textAlign: 'right'}}>
                <span style={{fontSize: '1.125rem', fontWeight: 'bold', color: calculation.color}}>{calculation.percentage}%</span>
                <span style={{color: '#64748b', fontSize: '0.75rem', marginLeft: '0.25rem'}}>(${calculation.absoluteDiff})</span>
              </div>
            </div>

            {/* Roll Advice */}
            {calculation.weeksToRoll > 0 ? (
              <div style={{borderRadius: '0.5rem', padding: '0.625rem', marginTop: '0.5rem', backgroundColor: getBgColor(calculation.color, 0.15)}}>
                <div style={{fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem'}}>Roll naar</div>
                <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between'}}>
                  <span style={{fontSize: '1rem', fontWeight: 'bold', color: calculation.color}}>{calculation.targetDate} (vr)</span>
                  <span style={{fontSize: '0.875rem', fontWeight: '500', color: '#cbd5e1'}}>strike {getStrikeDisplay()}</span>
                </div>
                {calculation.status === 'ctm' && (
                  <p style={{fontSize: '10px', color: 'rgba(251, 146, 60, 0.8)', marginTop: '0.375rem', margin: '0.375rem 0 0 0'}}>Check 1u voor close</p>
                )}
              </div>
            ) : (
              <div style={{borderRadius: '0.5rem', padding: '0.625rem', marginTop: '0.5rem', backgroundColor: 'rgba(34, 197, 94, 0.1)'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <span style={{color: '#4ade80'}}>✓</span>
                  <span style={{fontSize: '0.875rem', color: '#4ade80', fontWeight: '500'}}>Geen actie nodig</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{borderRadius: '0.75rem', border: '1px solid #1e293b', backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: '1rem', marginBottom: '0.75rem', textAlign: 'center'}}>
            <span style={{color: '#475569', fontSize: '0.875rem'}}>Vul strike en koers in</span>
          </div>
        )}

        {/* Roll Rules */}
        <div style={{backgroundColor: 'rgba(15, 23, 42, 0.8)', borderRadius: '0.75rem', border: '1px solid #1e293b', padding: '0.75rem', marginBottom: '0.75rem'}}>
          <div style={{fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem'}}>Roll regels</div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.375rem'}}>
            {rollTiers.map((tier, idx) => {
              const isActive = calculation && (
                (tier.range === 'OTM' && calculation.status === 'otm') ||
                (tier.range === 'CTM' && calculation.status === 'ctm') ||
                (tier.range === '0-10%' && calculation.status === 'itm' && parseFloat(calculation.percentage) <= 10) ||
                (tier.range === '10-15%' && calculation.tier === '10-15%') ||
                (tier.range === '15-20%' && calculation.tier === '15-20%') ||
                (tier.range === '20%+' && calculation.tier === '20%+')
              );

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.375rem 0.5rem',
                    borderRadius: '0.5rem',
                    backgroundColor: getBgColor(tier.color, 0.12),
                    opacity: isActive ? 1 : 0.4,
                    boxShadow: isActive ? '0 0 0 1px ' + tier.color : 'none'
                  }}
                >
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.375rem'}}>
                    <span style={{fontSize: '0.75rem'}}>{tier.icon}</span>
                    <span style={{fontSize: '0.75rem', fontWeight: '500'}}>{tier.range}</span>
                  </div>
                  <span style={{fontSize: '10px', fontWeight: '500', color: tier.color}}>{tier.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Friday Calendar */}
        <div style={{backgroundColor: 'rgba(15, 23, 42, 0.8)', borderRadius: '0.75rem', border: '1px solid #1e293b', padding: '0.75rem'}}>
          <div style={{fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem'}}>Expiry vrijdagen</div>
          <div style={{display: 'flex', gap: '0.375rem'}}>
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
                    backgroundColor: isTarget && calculation ? getBgColor(calculation.color, 0.2) : 'rgba(51, 65, 85, 0.3)',
                    opacity: isTarget ? 1 : 0.4,
                    transform: isTarget ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: isTarget && calculation ? '0 0 0 1px ' + calculation.color : 'none'
                  }}
                >
                  <div style={{fontSize: '10px', color: '#94a3b8'}}>{fri.label}</div>
                  <div style={{fontSize: '0.75rem', fontWeight: '600', marginTop: '0.125rem', color: isTarget && calculation ? calculation.color : '#64748b'}}>
                    {fri.date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}
                  </div>
                  {isTarget && (
                    <div style={{width: '4px', height: '4px', borderRadius: '50%', margin: '0.25rem auto 0', backgroundColor: calculation ? calculation.color : '#fff'}}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{textAlign: 'center', marginTop: '1rem', color: '#475569', fontSize: '10px'}}>
          <p style={{margin: 0}}>CTM check: 1u voor market close</p>
        </div>
      </div>
    </div>
  );
};

export default LSOrollCalculator;
