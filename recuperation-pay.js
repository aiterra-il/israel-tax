import { parseHundredths } from './vat-calculator.js';
export const DAY_RATE_AGOROT = 45_150;
export const PREVIOUS_RATE_AGOROT = 41_800;
export const DAY_RATE_TEXT = '451.50';
export const RECUPERATION_YEAR = 2026;
export const MAX_YEAR_OPTION = 20;
const FULL_PERCENT = 10_000;
const MONTHS_IN_YEAR = 12;
const MAX_RATE_AGOROT = 1_000_000;
export const seniorityTable = [
    { from: 1, to: 1, days: 5 },
    { from: 2, to: 3, days: 6 },
    { from: 4, to: 10, days: 7 },
    { from: 11, to: 15, days: 8 },
    { from: 16, to: 19, days: 9 },
    { from: 20, to: null, days: 10 },
];
export const sectorOptions = [
    { value: 'private', label: 'מגזר פרטי', hint: 'צו ההרחבה הכללי' },
    { value: 'public', label: 'שירות ציבורי', hint: 'הסכמים של המגזר הציבורי' },
    { value: 'branch', label: 'ענף עם הסדר משלו', hint: 'שמירה, ניקיון, אירועים ועוד' },
];
export const yearOptions = Array.from({ length: MAX_YEAR_OPTION }, (_, index) => {
    const year = index + 1;
    if (year === 1)
        return { value: '1', label: 'השנה הראשונה' };
    if (year === MAX_YEAR_OPTION)
        return { value: String(year), label: `השנה ה-${year} ואילך` };
    return { value: String(year), label: `השנה ה-${year}` };
});
export const emptyRecuperationInput = {
    year: '',
    months: '12',
    percent: '100',
    sector: 'private',
    rate: DAY_RATE_TEXT,
};
export const daysForYear = (year) => seniorityTable.find((row) => year >= row.from && (row.to === null || year <= row.to))?.days ?? 0;
export function computeYear(year, months, percent, rate) {
    const tableDays = daysForYear(year);
    const scaled = tableDays * percent * months;
    const divisor = FULL_PERCENT * MONTHS_IN_YEAR;
    return {
        tableDays,
        days: scaled / divisor,
        amount: Math.round((scaled * rate) / divisor),
    };
}
const parseMonths = (value) => {
    const trimmed = value.trim();
    if (!trimmed)
        return { ok: false, empty: true };
    if (!/^\d+$/.test(trimmed))
        return { ok: false, empty: false };
    return { ok: true, value: Number(trimmed) };
};
const percentError = (parsed) => {
    if (parsed.ok) {
        return parsed.hundredths === 0 || parsed.hundredths > FULL_PERCENT ? 'הקלידו אחוז בין 1 ל-100.' : '';
    }
    if (parsed.reason === 'empty')
        return '';
    return 'הקלידו אחוז משרה בספרות, למשל 50.';
};
const rateError = (parsed) => {
    if (parsed.ok) {
        return parsed.hundredths === 0 || parsed.hundredths > MAX_RATE_AGOROT ? 'הקלידו סכום ליום, למשל 451.50.' : '';
    }
    if (parsed.reason === 'empty')
        return '';
    return 'הקלידו סכום בספרות, למשל 451.50.';
};
export function recuperationErrors(input) {
    const errors = {};
    const months = parseMonths(input.months);
    if (!months.ok && !months.empty)
        errors.months = 'הקלידו מספר חודשים שלם, בין 1 ל-12.';
    else if (months.ok && (months.value < 1 || months.value > MONTHS_IN_YEAR)) {
        errors.months = 'הקלידו מספר בין 1 ל-12.';
    }
    const percent = percentError(parseHundredths(input.percent));
    if (percent)
        errors.percent = percent;
    const rate = rateError(parseHundredths(input.rate));
    if (rate)
        errors.rate = rate;
    return errors;
}
const sectorMessages = {
    public: 'צו ההרחבה הכללי לא חל על עובדים ששכרם משולם לפי הסכמים קיבוציים בשירות הציבורי או צמוד להסכמי השכר בשירות הציבורי. מספר הימים והתעריף שלהם נקבעים בהסכמים האלה, ולכן המחשבון לא מחשב אותם.',
    branch: 'בענפים שיש בהם הסכם קיבוצי או צו הרחבה ענפי, כמו שמירה ואבטחה, ניקיון ואחזקה, אולמות וגני אירועים, מספר הימים והתעריף שונים. באתר משרד העבודה חלק מהנתונים לענפים האלה הם משנת 2014, ולכן כדאי לבדוק את ההסכם העדכני של הענף.',
};
export function calculateRecuperation(input) {
    if (input.sector !== 'private') {
        return { kind: 'other-sector', sector: input.sector, message: sectorMessages[input.sector] };
    }
    const errors = recuperationErrors(input);
    if (errors.months || errors.percent || errors.rate) {
        return { kind: 'invalid', message: 'כדי לראות את התוצאה, תקנו את השדה שמתחתיו הודעת שגיאה.' };
    }
    const missing = [
        input.year ? '' : 'שנת העבודה',
        input.months.trim() ? '' : 'חודשי עבודה בשנה',
        input.percent.trim() ? '' : 'היקף המשרה',
        input.rate.trim() ? '' : 'מחיר יום הבראה',
    ].filter(Boolean);
    if (missing.length)
        return { kind: 'incomplete', message: `כדי לראות את התוצאה, מלאו: ${missing.join(', ')}.` };
    const year = Number(input.year);
    const months = Number(input.months);
    if (year === 1 && months < MONTHS_IN_YEAR) {
        return {
            kind: 'not-eligible',
            message: 'דמי הבראה מגיעים רק אחרי שמשלימים שנת עבודה ראשונה אצל המעסיק. כשהשנה מסתיימת משלמים 5 ימים בעדה. מי שעוזב לפני שהשלים שנה לא זכאי לדמי הבראה לפי צו ההרחבה הכללי.',
        };
    }
    const percentParsed = parseHundredths(input.percent);
    const rateParsed = parseHundredths(input.rate);
    const percent = percentParsed.ok ? percentParsed.hundredths : FULL_PERCENT;
    const rate = rateParsed.ok ? rateParsed.hundredths : DAY_RATE_AGOROT;
    const { tableDays, days, amount } = computeYear(year, months, percent, rate);
    const topUp = rate === DAY_RATE_AGOROT ? computeYear(year, months, percent, DAY_RATE_AGOROT - PREVIOUS_RATE_AGOROT).amount : null;
    return { kind: 'result', year, tableDays, months, percent, rate, days, amount, topUp };
}
const moneyFormat = new Intl.NumberFormat('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dayFormat = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 3 });
const percentFormat = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 2 });
export const formatShekels = (agorot) => `${moneyFormat.format(agorot / 100)} ₪`;
export const formatRate = (agorot) => moneyFormat.format(agorot / 100);
export const formatDays = (days) => dayFormat.format(days);
export const daysLabel = (days) => (days === 1 ? 'יום אחד' : `${formatDays(days)} ימים`);
export const formatPercent = (hundredths) => `${percentFormat.format(hundredths / 100)}%`;
export const yearLabel = (year) => yearOptions[Math.min(year, MAX_YEAR_OPTION) - 1].label;
export const seniorityLabel = ({ from, to }) => {
    if (to === null)
        return `${from} ואילך`;
    if (from === to)
        return from === 1 ? 'השנה הראשונה' : `${from}`;
    return `${from}–${to}`;
};
const factors = (result) => {
    const parts = [String(result.tableDays)];
    if (result.percent !== FULL_PERCENT)
        parts.push(formatPercent(result.percent));
    if (result.months !== MONTHS_IN_YEAR)
        parts.push(`${result.months}/12`);
    return parts;
};
const isRoundedDays = (days) => Math.abs(days * 1000 - Math.round(days * 1000)) > 1e-9;
export function daysExpression(result) {
    const parts = factors(result);
    if (parts.length === 1)
        return parts[0];
    return `${parts.join(' × ')} ${isRoundedDays(result.days) ? '≈' : '='} ${formatDays(result.days)}`;
}
export const amountExpression = (result) => `${[...factors(result), formatRate(result.rate)].join(' × ')} = ${moneyFormat.format(result.amount / 100)}`;
export function rateTable() {
    return seniorityTable.map((row) => ({
        years: seniorityLabel(row),
        days: row.days,
        full: formatShekels(computeYear(row.from, MONTHS_IN_YEAR, FULL_PERCENT, DAY_RATE_AGOROT).amount),
        half: formatShekels(computeYear(row.from, MONTHS_IN_YEAR, FULL_PERCENT / 2, DAY_RATE_AGOROT).amount),
    }));
}
const exampleOf = (title, years) => {
    const lines = years.map(({ label, year, months, percent }) => {
        const { days, amount } = computeYear(year, months, percent, DAY_RATE_AGOROT);
        return { label, days, amount };
    });
    return {
        title,
        lines,
        totalDays: lines.reduce((sum, line) => sum + line.days, 0),
        totalAmount: lines.reduce((sum, line) => sum + line.amount, 0),
    };
};
export function recuperationExamples() {
    return [
        exampleOf('חצי משרה במשך שנתיים', [
            { label: 'השנה הראשונה: 5 ימים × 50%', year: 1, months: 12, percent: 5_000 },
            { label: 'השנה השנייה: 6 ימים × 50%', year: 2, months: 12, percent: 5_000 },
        ]),
        exampleOf('משרה מלאה במשך שנתיים, עם 3 חודשי חופשה ללא תשלום בשנה השנייה', [
            { label: 'השנה הראשונה: 5 ימים', year: 1, months: 12, percent: FULL_PERCENT },
            { label: 'השנה השנייה: 6 ימים × 9/12', year: 2, months: 9, percent: FULL_PERCENT },
        ]),
        exampleOf('עובדת במשרה של 80% שעזבה אחרי 5 שנים ו-4 חודשים: החלק היחסי על השנה האחרונה', [
            { label: 'השנה השישית, 4 חודשים: 7 ימים × 80% × 4/12', year: 6, months: 4, percent: 8_000 },
        ]),
    ];
}
export function resultToText(result) {
    const lines = [
        `מחשבון דמי הבראה ${RECUPERATION_YEAR}`,
        `שנת העבודה: ${yearLabel(result.year)} (${result.tableDays} ימים לפי הוותק)`,
        `היקף משרה: ${formatPercent(result.percent)}, חודשי עבודה בשנה: ${result.months}`,
        `ימי הבראה: ${daysExpression(result)}`,
        `מחיר יום הבראה: ${formatShekels(result.rate)}`,
        `דמי הבראה: ${formatShekels(result.amount)}`,
    ];
    if (result.topUp !== null)
        lines.push(`השלמה למי שקיבל לפי 418 ₪ ליום: ${formatShekels(result.topUp)}`);
    lines.push('לפי צו ההרחבה בדבר השתתפות המעסיק בהוצאות הבראה ונופש, ילקוט הפרסומים 14863 (18.8.2026). המגזר הפרטי בלבד.');
    lines.push('https://www.aiterra.co.il/tools/recuperation-pay-calculator');
    return lines.join('\n');
}
