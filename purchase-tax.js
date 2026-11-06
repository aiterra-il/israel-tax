import { parseAmount } from './vat-calculator.js';
export const BRACKETS_VALID_FROM = '16.1.2024';
export const BRACKETS_VALID_UNTIL = '15.1.2028';
export const REVIEWED_DATE = '2026-10-24';
export const REVIEWED_LABEL = '24.10.2026';
export const MAX_VALUE_SHEKELS = 1_000_000_000;
export const SINGLE_BRACKETS = [
    { upTo: 1_978_745, rateBasisPoints: 0 },
    { upTo: 2_347_040, rateBasisPoints: 350 },
    { upTo: 6_055_070, rateBasisPoints: 500 },
    { upTo: 20_183_565, rateBasisPoints: 800 },
    { upTo: null, rateBasisPoints: 1_000 },
];
export const ADDITIONAL_BRACKETS = [
    { upTo: 6_055_070, rateBasisPoints: 800 },
    { upTo: null, rateBasisPoints: 1_000 },
];
export const OLEH_BRACKETS = [
    { upTo: 1_978_745, rateBasisPoints: 0 },
    { upTo: 6_055_070, rateBasisPoints: 50 },
    { upTo: 20_183_565, rateBasisPoints: 800 },
    { upTo: null, rateBasisPoints: 1_000 },
];
export const OLEH_VALUE_CEILING = 20_183_565;
const FULL = 10_000;
const applyRate = (amount, basisPoints) => Math.round((amount * basisPoints) / FULL);
function applyBrackets(value, brackets) {
    let lower = 0;
    const rows = brackets.map((bracket) => {
        const amount = Math.max(0, Math.min(value, bracket.upTo ?? Number.POSITIVE_INFINITY) - lower);
        const row = {
            from: lower === 0 ? 0 : lower + 1,
            to: bracket.upTo,
            rateBasisPoints: bracket.rateBasisPoints,
            amount,
            tax: applyRate(amount, bracket.rateBasisPoints),
        };
        lower = bracket.upTo ?? lower;
        return row;
    });
    return { rows, tax: rows.reduce((sum, row) => sum + row.tax, 0) };
}
export function bracketsFor(kind) {
    if (kind === 'additional')
        return ADDITIONAL_BRACKETS;
    if (kind === 'oleh')
        return OLEH_BRACKETS;
    return SINGLE_BRACKETS;
}
export function calculatePurchaseTax(valueAgorot, kind) {
    const value = Math.round(valueAgorot / 100);
    const olehBenefitDenied = kind === 'oleh' && value > OLEH_VALUE_CEILING;
    const effectiveKind = olehBenefitDenied ? 'single' : kind;
    const { rows, tax } = applyBrackets(value, bracketsFor(effectiveKind));
    const singleTax = kind === 'oleh' ? applyBrackets(value, SINGLE_BRACKETS).tax : tax;
    return {
        kind,
        value,
        rows,
        tax,
        effectiveRate: value > 0 ? tax / value : 0,
        olehBenefitDenied,
        savingVersusSingle: Math.max(0, singleTax - tax),
    };
}
export function parseValue(input) {
    const parsed = parseAmount(input);
    if (parsed.ok && parsed.hundredths > MAX_VALUE_SHEKELS * 100)
        return { ok: false, reason: 'too-large' };
    return parsed;
}
const shekelFormat = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 0 });
const plainFormat = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 2 });
const percentFormat = new Intl.NumberFormat('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const formatShekels = (amount) => `${shekelFormat.format(amount)} ₪`;
export const formatNumber = (amount) => shekelFormat.format(amount);
export const formatBasisPoints = (basisPoints) => `${plainFormat.format(basisPoints / 100)}%`;
export const formatRatio = (ratio) => `${percentFormat.format(ratio * 100)}%`;
export function bracketLabel(row) {
    if (row.to === null)
        return `מעל ${formatNumber(row.from - 1)}`;
    if (row.from === 0)
        return `עד ${formatNumber(row.to)}`;
    return `${formatNumber(row.from)} עד ${formatNumber(row.to)}`;
}
export const KIND_LABELS = {
    single: 'דירה יחידה',
    additional: 'דירה נוספת',
    oleh: 'עולה חדש, דירה יחידה',
};
export function resultToText(result) {
    const lines = [
        `מחשבון מס רכישה, הערכה בלבד (מדרגות בתוקף עד ${BRACKETS_VALID_UNTIL})`,
        `סוג הרכישה: ${KIND_LABELS[result.kind]}`,
        `שווי הדירה: ${formatShekels(result.value)}`,
        ...result.rows
            .filter((row) => row.amount > 0)
            .map((row) => `${bracketLabel(row)} ב-${formatBasisPoints(row.rateBasisPoints)}: ${formatShekels(row.amount)}, מס ${formatShekels(row.tax)}`),
        `מס רכישה: ${formatShekels(result.tax)} (${formatRatio(result.effectiveRate)} משווי הדירה)`,
    ];
    return lines.join('\n');
}
