export const TAX_YEAR = 2026;
export const REVIEWED_DATE = '2026-10-24';
export const REVIEWED_LABEL = '24.10.2026';
export const POINT_VALUE_MONTHLY = 242;
export const POINT_VALUE_ANNUAL = 2_904;
export const MAX_CHILDREN_PER_BAND = 20;
const TWELFTHS = 12;
export const RESIDENT_TWELFTHS = 24;
export const COMMUTE_TWELFTHS = 3;
export const WOMAN_TWELFTHS = 6;
export const CHILD_BANDS = ['birth', 'toTwo', 'three', 'fourFive', 'sixSeventeen', 'eighteen'];
export const CHILD_POINTS_TWELFTHS = {
    woman: { birth: 30, toTwo: 54, three: 42, fourFive: 30, sixSeventeen: 24, eighteen: 6 },
    man: { birth: 30, toTwo: 54, three: 42, fourFive: 30, sixSeventeen: 12, eighteen: 0 },
};
export const childBandLabel = (band) => {
    const year = (age) => TAX_YEAR - age;
    switch (band) {
        case 'birth':
            return `נולדו ב-${year(0)}`;
        case 'toTwo':
            return `נולדו ב-${year(2)} או ב-${year(1)}`;
        case 'three':
            return `נולדו ב-${year(3)}`;
        case 'fourFive':
            return `נולדו ב-${year(5)} או ב-${year(4)}`;
        case 'sixSeventeen':
            return `נולדו בין ${year(17)} ל-${year(6)}`;
        case 'eighteen':
            return `נולדו ב-${year(18)}`;
    }
};
export const OLEH_SCHEDULE = [
    { months: 12, twelfths: 1 },
    { months: 18, twelfths: 3 },
    { months: 12, twelfths: 2 },
    { months: 12, twelfths: 1 },
];
export const OLEH_FIRST_ALIYAH_YEAR = 2022;
export const SOLDIER_MONTHS = 36;
export const SOLDIER_TWELFTHS_FULL = 2;
export const SOLDIER_TWELFTHS_SHORT = 1;
export const DEGREE_TWELFTHS = { none: 0, first: 12, second: 6 };
const monthIndex = ({ month, year }) => year * 12 + (month - 1);
export function olehTwelfthsInYear(aliyah, taxYear = TAX_YEAR) {
    let total = 0;
    for (let month = 1; month <= 12; month += 1) {
        let position = monthIndex({ month, year: taxYear }) - monthIndex(aliyah);
        if (position < 0)
            continue;
        for (const stage of OLEH_SCHEDULE) {
            if (position < stage.months) {
                total += stage.twelfths;
                break;
            }
            position -= stage.months;
        }
    }
    return total;
}
export function soldierTwelfthsInYear(discharge, fullService, taxYear = TAX_YEAR) {
    const perMonth = fullService ? SOLDIER_TWELFTHS_FULL : SOLDIER_TWELFTHS_SHORT;
    let total = 0;
    for (let month = 1; month <= 12; month += 1) {
        const position = monthIndex({ month, year: taxYear }) - monthIndex(discharge);
        if (position >= 1 && position <= SOLDIER_MONTHS)
            total += perMonth;
    }
    return total;
}
export function childrenTwelfths(gender, children) {
    return CHILD_BANDS.reduce((sum, band) => sum + children[band] * CHILD_POINTS_TWELFTHS[gender][band], 0);
}
export function calculateCredits(input) {
    const lines = [
        { key: 'resident', label: 'תושב ישראל', twelfths: RESIDENT_TWELFTHS },
        { key: 'commute', label: 'זיכוי נסיעה לעבודה', twelfths: COMMUTE_TWELFTHS },
    ];
    if (input.gender === 'woman')
        lines.push({ key: 'woman', label: 'תוספת לאישה', twelfths: WOMAN_TWELFTHS });
    const children = childrenTwelfths(input.gender, input.children);
    if (children > 0)
        lines.push({ key: 'children', label: 'ילדים', twelfths: children });
    if (input.degree !== 'none') {
        lines.push({
            key: 'degree',
            label: input.degree === 'first' ? 'תואר ראשון' : 'תואר שני',
            twelfths: DEGREE_TWELFTHS[input.degree],
        });
    }
    const oleh = input.oleh ? olehTwelfthsInYear(input.oleh) : 0;
    if (oleh > 0)
        lines.push({ key: 'oleh', label: `עולה חדש ב-${TAX_YEAR}`, twelfths: oleh });
    const soldier = input.soldier ? soldierTwelfthsInYear(input.soldier.discharge, input.soldier.fullService) : 0;
    if (soldier > 0)
        lines.push({ key: 'soldier', label: `חייל משוחרר ב-${TAX_YEAR}`, twelfths: soldier });
    const twelfths = lines.reduce((sum, line) => sum + line.twelfths, 0);
    const yearly = twelfths * POINT_VALUE_MONTHLY;
    return { lines, twelfths, points: twelfths / TWELFTHS, yearly, monthly: Math.round(yearly / 12) };
}
export function parseCount(input) {
    const trimmed = input.trim();
    if (!trimmed)
        return { ok: true, hundredths: 0 };
    if (!/^\d{1,2}$/.test(trimmed))
        return { ok: false, reason: 'invalid' };
    const count = Number(trimmed);
    if (count > MAX_CHILDREN_PER_BAND)
        return { ok: false, reason: 'too-large' };
    return { ok: true, hundredths: count * 100 };
}
const shekelFormat = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 0 });
const pointsFormat = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 2 });
export const formatShekels = (amount) => `${shekelFormat.format(amount)} ₪`;
export const formatPoints = (twelfths) => pointsFormat.format(twelfths / TWELFTHS);
export function resultToText(result) {
    return [
        `מחשבון נקודות זיכוי ${TAX_YEAR}, הערכה בלבד`,
        ...result.lines.map((line) => `${line.label}: ${formatPoints(line.twelfths)} נקודות`),
        `סך הכול: ${formatPoints(result.twelfths)} נקודות`,
        `שווי לשנה: ${formatShekels(result.yearly)}`,
        `שווי לחודש: ${formatShekels(result.monthly)}`,
    ].join('\n');
}
