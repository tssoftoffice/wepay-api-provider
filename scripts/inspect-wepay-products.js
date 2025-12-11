
const axios = require('axios');

async function main() {
    try {
        console.log('Fetching WePay Product Data...');
        const response = await axios.get('https://www.wepay.in.th/comp_export.php?json');
        const payload = response.data.data;

        if (!payload) {
            console.log('No payload found');
            return;
        }

        const keywords = [
            'free fire', 'rov', 'bang bang', 'sword of justice', 'winds meet', 'valorant',
            'delta force', 'pubg', 'seven knights', 'bigo', 'racing master', 'honor of kings',
            'dunk city', 'call of duty', 'blood strike', 'identity v', 'league of legends',
            'transform', 'haikyu', 'ragnarok', 'love and deepspace', 'afk', 'metal slug',
            'arena breakout', 'genshin', 'zenless', 'honkai', 'dragon nest', 'maplestory',
            'undawn', 'fc mobile', 'zepto', 'diablo', 'teamfight', 'seal m', 'harry potter',
            'ace racer', 'mu origin', 'sausage man', 'super sus', 'marvel snap', 'x-hero',
            'nikke', 'overwatch', 'mu archangel', 'onmyoji', 'runeterra', 'wild rift',
            'dragon raja', 'counter:side', 'eos red',
            'ais', 'dtac', 'true', 'my by nt', 'my by cat', 'truemoney', 'garena',
            'geforce', 'riot', 'razer', 'roblox', 'steam', 'cash', 'starbuck',
            'playstation', 'nintendo', 'gameindy', 'line', 'battle.net', '@cash'
        ];

        const allItems = [
            ...(payload.mtopup || []).map(i => ({ ...i, type: 'mtopup' })),
            ...(payload.gtopup || []).map(i => ({ ...i, type: 'gtopup' })),
            ...(payload.cashcard || []).map(i => ({ ...i, type: 'cashcard' })),
            ...(payload.billpay || []).map(i => ({ ...i, type: 'billpay' }))
        ];

        const matches = {};

        allItems.forEach(item => {
            const name = String(item.company_name || '').toLowerCase();
            const id = String(item.company_id || '').toLowerCase();

            keywords.forEach(k => {
                if (name.includes(k) || id.includes(k)) {
                    if (!matches[k]) matches[k] = new Set();
                    matches[k].add(`[${item.type}] ${item.company_name} (ID: ${item.company_id})`);
                }
            });
        });

        console.log('--- Matched Keys ---');
        Object.keys(matches).forEach(k => {
            console.log(`Keyword "${k}":`);
            matches[k].forEach(m => console.log(`  - ${m}`));
        });

    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
