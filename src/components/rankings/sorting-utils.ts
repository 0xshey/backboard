
export const getStatValue = (item: any, key: string) => {
    const statMap: Record<string, string> = {
        'pts': 'points',
        'reb': 'rebounds_total',
        'ast': 'assists',
        'stl': 'steals',
        'blk': 'blocks',
        'tov': 'turnovers',
        'fg': 'field_goals_percentage',
        '3p': 'three_pointers_percentage',
        'ft': 'free_throws_percentage',
    };
    return item[statMap[key] || key];
};

export const getDeltaValue = (item: any, key: string) => {
    const statKey = key.replace('_delta', '');
    const val = getStatValue(item, statKey);
    
    // manual mapping for averages keys
    let avgKeyMap: any = { 'pts': 'points', 'reb': 'rebounds_total', 'ast': 'assists', 'stl': 'steals', 'blk': 'blocks', 'tov': 'turnovers' };
    let avgVal = 0;
    
    if (['pts', 'reb', 'ast', 'stl', 'blk', 'tov'].includes(statKey)) {
        avgVal = item.player.season_averages[0]?.[avgKeyMap[statKey]] || 0;
    } else if (statKey === 'fp') {
        avgVal = item.player.season_averages[0]?.nba_fantasy_points || 0;
    }
    
    return val - avgVal;
};

export function sortPlayers(data: any[], sortField: string, sortDirection: 'asc' | 'desc') {
    return [...data].sort((a, b) => {
        let valA: any = 0;
        let valB: any = 0;

        // Custom comparators
        if (sortField === 'player') {
            valA = a.player.last_name.toLowerCase();
            valB = b.player.last_name.toLowerCase();
        } else if (sortField === 'minutes') {
            valA = a.seconds;
            valB = b.seconds;
        } else if (sortField.endsWith('_delta')) {
            valA = getDeltaValue(a, sortField);
            valB = getDeltaValue(b, sortField);
        } else if (sortField.endsWith('_pct')) {
            // Percentage sort (Efficiency)
            valA = getStatValue(a, sortField.replace('_pct', '')); 
            valB = getStatValue(b, sortField.replace('_pct', ''));
        } else if (sortField.endsWith('_vol')) {
            // Volume sort 
            const volMap: Record<string, string> = {
                'fg': 'field_goals_attempted',
                '3p': 'three_pointers_attempted',
                'ft': 'free_throws_attempted'
            };
            const baseKey = sortField.replace('_vol', '');
            valA = a[volMap[baseKey]];
            valB = b[volMap[baseKey]];
        } else {
            // Default number sort
            valA = getStatValue(a, sortField) || a[sortField]; 
            valB = getStatValue(b, sortField) || b[sortField];
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        
        // Tie-breakers
        // 1. If sorting by Volume, tie-break with Pct
        if (sortField.endsWith('_vol')) {
            const baseKey = sortField.replace('_vol', '');
            const pctA = getStatValue(a, baseKey);
            const pctB = getStatValue(b, baseKey);
             if (pctA !== pctB) return sortDirection === 'asc' ? (pctA < pctB ? -1 : 1) : (pctA > pctB ? -1 : 1);
        }

        if (sortField !== 'fp' && sortField !== 'fp_delta') {
            if (!sortField.endsWith('_delta') && ['pts', 'reb', 'ast', 'stl', 'blk', 'tov'].includes(sortField)) {
                const deltaA = getDeltaValue(a, sortField + '_delta');
                const deltaB = getDeltaValue(b, sortField + '_delta');
                if (deltaA !== deltaB) return sortDirection === 'asc' ? (deltaA < deltaB ? -1 : 1) : (deltaA > deltaB ? -1 : 1);
            }
        }

        return 0;
    });
}
