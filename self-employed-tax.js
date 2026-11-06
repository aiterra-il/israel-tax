import { parseAmount, parseHundredths } from './vat-calculator.js';
export const TAX_YEAR = 2026;
export const MONTHS_IN_YEAR = 12;
export const CREDIT_POINT_ANNUAL = 2_904;
export const DEFAULT_CREDIT_POINTS = { man: 225, woman: 275 };
export const WOMAN_EXTRA_POINTS = 50;
export const MAX_CREDIT_POINTS = 40;
export const ANNUAL_TAX_BRACKETS = [
    { upTo: 84_120, rateBasisPoints: 1_000 },
    { upTo: 120_720, rateBasisPoints: 1_400 },
    { upTo: 228_000, rateBasisPoints: 2_000 },
    { upTo: 301_200, rateBasisPoints: 3_100 },
    { upTo: 560_280, rateBasisPoints: 3_500 },
    { upTo: null, rateBasisPoints: 4_700 },
];
export const ANNUAL_SURTAX_THRESHOLD = 721_560;
export const SURTAX_RATE_BASIS_POINTS = 300;
export const BTL_REDUCED_LIMIT_MONTHLY = 7_703;
export const BTL_MAX_INCOME_MONTHLY = 51_910;
export const BTL_MIN_INCOME_MONTHLY = 3_442;
export const BTL_RATES = {
    national: { reduced: 447, full: 1_283 },
    health: { reduced: 323, full: 517 },
};
export const BTL_DEDUCTIBLE_BASIS_POINTS = 5_200;
const FULL = 10_000;
const applyRate = (amount, basisPoints) => Math.round((amount * basisPoints) / FULL);
const scaleAnnual = (annual, months) => (annual * months) / MONTHS_IN_YEAR;
export const monthsFor = (period) => (period === 'year' ? MONTHS_IN_YEAR : 1);
function btlBase(profit, reducedLimit) {
    const share = BTL_DEDUCTIBLE_BASIS_POINTS / FULL;
    const t1 = BTL_RATES.national.reduced / FULL;
    const t2 = BTL_RATES.national.full / FULL;
    const belowLimit = profit / (1 + share * t1);
    if (belowLimit <= reducedLimit)
        return belowLimit;
    return (profit + share * reducedLimit * (t2 - t1)) / (1 + share * t2);
}
export function calculateBtl(profit, months) {
    const reducedLimit = BTL_REDUCED_LIMIT_MONTHLY * months;
    const ceiling = BTL_MAX_INCOME_MONTHLY * months;
    const minimum = BTL_MIN_INCOME_MONTHLY * months;
    const empty = {
        base: 0,
        reducedLimit,
        reducedPart: 0,
        fullPart: 0,
        nationalReduced: 0,
        nationalFull: 0,
        healthReduced: 0,
        healthFull: 0,
        national: 0,
        health: 0,
        total: 0,
        deductible: 0,
        minimumApplied: false,
        ceilingApplied: false,
    };
    if (profit <= 0)
        return empty;
    const raw = Math.round(btlBase(profit, reducedLimit));
    const ceilingApplied = raw > ceiling;
    const minimumApplied = raw < minimum;
    const base = Math.min(Math.max(raw, minimum), ceiling);
    const reducedPart = Math.min(base, reducedLimit);
    const fullPart = base - reducedPart;
    const nationalReduced = applyRate(reducedPart, BTL_RATES.national.reduced);
    const nationalFull = applyRate(fullPart, BTL_RATES.national.full);
    const healthReduced = applyRate(reducedPart, BTL_RATES.health.reduced);
    const healthFull = applyRate(fullPart, BTL_RATES.health.full);
    const national = nationalReduced + nationalFull;
    const health = healthReduced + healthFull;
    return {
        base,
        reducedLimit,
        reducedPart,
        fullPart,
        nationalReduced,
        nationalFull,
        healthReduced,
        healthFull,
        national,
        health,
        total: national + health,
        deductible: Math.min(profit, applyRate(national, BTL_DEDUCTIBLE_BASIS_POINTS)),
        minimumApplied,
        ceilingApplied,
    };
}
export function calculateIncomeTax(taxable, creditPointsHundredths, months) {
    let lower = 0;
    const rows = ANNUAL_TAX_BRACKETS.map((bracket) => {
        const upper = bracket.upTo === null ? null : scaleAnnual(bracket.upTo, months);
        const income = Math.max(0, Math.min(taxable, upper ?? Number.POSITIVE_INFINITY) - lower);
        const row = {
            from: lower === 0 ? 0 : lower + 1,
            to: upper,
            rateBasisPoints: bracket.rateBasisPoints,
            income,
            tax: applyRate(income, bracket.rateBasisPoints),
        };
        lower = upper ?? lower;
        return row;
    });
    const surtaxThreshold = scaleAnnual(ANNUAL_SURTAX_THRESHOLD, months);
    const surtaxIncome = Math.max(0, taxable - surtaxThreshold);
    const surtax = applyRate(surtaxIncome, SURTAX_RATE_BASIS_POINTS);
    const gross = rows.reduce((sum, row) => sum + row.tax, 0) + surtax;
    const creditValue = Math.round((creditPointsHundredths * scaleAnnual(CREDIT_POINT_ANNUAL, months)) / 100);
    const creditUsed = Math.min(gross, creditValue);
    return {
        taxable,
        rows,
        surtaxThreshold,
        surtaxIncome,
        surtax,
        gross,
        creditPointsHundredths,
        creditValue,
        creditUsed,
        net: gross - creditUsed,
    };
}
const marginalRate = (taxable, months) => {
    if (taxable <= 0)
        return 0;
    const bracket = ANNUAL_TAX_BRACKETS.find((item) => item.upTo === null || taxable <= scaleAnnual(item.upTo, months));
    const surtax = taxable > scaleAnnual(ANNUAL_SURTAX_THRESHOLD, months) ? SURTAX_RATE_BASIS_POINTS : 0;
    return (bracket?.rateBasisPoints ?? 0) + surtax;
};
export function calculateTax({ revenueAgorot, expensesAgorot, creditPointsHundredths, months }) {
    const revenue = Math.round(revenueAgorot / 100);
    const expenses = Math.round(expensesAgorot / 100);
    const difference = revenue - expenses;
    const profit = Math.max(0, difference);
    const btl = calculateBtl(profit, months);
    const incomeTax = calculateIncomeTax(profit - btl.deductible, creditPointsHundredths, months);
    const total = incomeTax.net + btl.total;
    return {
        months,
        revenue,
        expenses,
        profit,
        loss: difference < 0,
        btl,
        incomeTax,
        total,
        net: profit - total,
        effectiveRate: profit > 0 ? total / profit : 0,
        marginalRateBasisPoints: marginalRate(incomeTax.taxable, months),
        advanceRate: revenue > 0 ? incomeTax.net / revenue : 0,
    };
}
export const toAnnual = (amount, months) => Math.round((amount * MONTHS_IN_YEAR) / months);
export const toMonthly = (amount, months) => Math.round(amount / months);
export function parsePoints(input) {
    const parsed = parseHundredths(input);
    if (parsed.ok && parsed.hundredths > MAX_CREDIT_POINTS * 100)
        return { ok: false, reason: 'too-large' };
    return parsed;
}
export { parseAmount };
const shekelFormat = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 0 });
const plainFormat = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 2 });
const percentFormat = new Intl.NumberFormat('he-IL', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
export const formatShekels = (amount) => `${shekelFormat.format(amount)} ₪`;
export const formatNumber = (amount) => shekelFormat.format(amount);
export const formatPoints = (hundredths) => plainFormat.format(hundredths / 100);
export const formatBasisPoints = (basisPoints) => `${plainFormat.format(basisPoints / 100)}%`;
export const formatRatio = (ratio) => `${percentFormat.format(ratio * 100)}%`;
export function bracketLabel(row) {
    if (row.to === null)
        return `מעל ${formatNumber(row.from - 1)}`;
    if (row.from === 0)
        return `עד ${formatNumber(row.to)}`;
    return `${formatNumber(row.from)} עד ${formatNumber(row.to)}`;
}
export function resultToText(result, period) {
    const { months } = result;
    const unit = period === 'year' ? 'לשנה' : 'לחודש';
    const lines = [
        `מחשבון מס הכנסה לעצמאי ${TAX_YEAR}, הערכה בלבד`,
        `הכנסות ${unit}: ${formatShekels(result.revenue)}`,
        `הוצאות מוכרות ${unit}: ${formatShekels(result.expenses)}`,
        `רווח ${unit}: ${formatShekels(result.profit)}`,
        `מס הכנסה ${unit}: ${formatShekels(result.incomeTax.net)}`,
        `ביטוח לאומי ${unit}: ${formatShekels(result.btl.national)}`,
        `דמי ביטוח בריאות ${unit}: ${formatShekels(result.btl.health)}`,
        `סך הכול מס וביטוח לאומי ${unit}: ${formatShekels(result.total)} (${formatRatio(result.effectiveRate)} מהרווח)`,
        `נטו לחודש: ${formatShekels(toMonthly(result.net, months))}`,
        `נטו לשנה: ${formatShekels(toAnnual(result.net, months))}`,
        `מקדמה משוערת למס הכנסה לחודש: ${formatShekels(toMonthly(result.incomeTax.net, months))}`,
        `מקדמה משוערת לביטוח לאומי ובריאות לחודש: ${formatShekels(toMonthly(result.btl.total, months))}`,
        `נקודות זיכוי: ${formatPoints(result.incomeTax.creditPointsHundredths)}`,
    ];
    return lines.join('\n');
}
