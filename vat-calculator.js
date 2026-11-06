export const STANDARD_VAT_RATE = 18;
export const MAX_AMOUNT_SHEKELS = 100_000_000;
export const MAX_LINES = 20;
const STANDARD_RATE_BASIS_POINTS = STANDARD_VAT_RATE * 100;
const FULL_RATE_BASIS_POINTS = 10_000;
const MAX_AMOUNT_HUNDREDTHS = MAX_AMOUNT_SHEKELS * 100;
const stripDecoration = (input) => input.replace(/[\s\p{Cf}₪]/gu, '').replace(/ש["״']?ח$/, '').replace(/%$/, '');
const toPlainDecimal = (value) => {
    const lastDot = value.lastIndexOf('.');
    const lastComma = value.lastIndexOf(',');
    const commaCount = value.split(',').length - 1;
    const dotCount = value.split('.').length - 1;
    if (lastDot >= 0 && lastComma >= 0) {
        const decimalSeparator = lastDot > lastComma ? '.' : ',';
        const groupSeparator = decimalSeparator === '.' ? ',' : '.';
        const decimalCount = decimalSeparator === '.' ? dotCount : commaCount;
        if (decimalCount > 1)
            return null;
        return value.split(groupSeparator).join('').replace(decimalSeparator, '.');
    }
    const groupedThousands = value.length - lastComma - 1 === 3 && /[1-9]/.test(value.slice(0, lastComma));
    if (commaCount === 1 && !groupedThousands)
        return value.replace(',', '.');
    if (commaCount > 0)
        return value.split(',').join('');
    if (dotCount > 1)
        return value.split('.').join('');
    return value;
};
export function parseHundredths(input) {
    const cleaned = stripDecoration(input.trim());
    if (!cleaned)
        return { ok: false, reason: 'empty' };
    if (!/^[\d.,]+$/.test(cleaned) || !/\d/.test(cleaned))
        return { ok: false, reason: 'invalid' };
    const plain = toPlainDecimal(cleaned);
    const match = plain ? /^(\d*)(?:\.(\d*))?$/.exec(plain) : null;
    if (!match)
        return { ok: false, reason: 'invalid' };
    const whole = (match[1] || '0').replace(/^0+(?=\d)/, '');
    if (whole.length > 12)
        return { ok: false, reason: 'too-large' };
    const fraction = (match[2] ?? '').padEnd(3, '0');
    const roundUp = Number(fraction[2]) >= 5 ? 1 : 0;
    const hundredths = Number(whole) * 100 + Number(fraction.slice(0, 2)) + roundUp;
    return { ok: true, hundredths };
}
export function parseAmount(input) {
    const parsed = parseHundredths(input);
    if (parsed.ok && parsed.hundredths > MAX_AMOUNT_HUNDREDTHS)
        return { ok: false, reason: 'too-large' };
    return parsed;
}
export function parseRate(input) {
    const parsed = parseHundredths(input);
    if (parsed.ok && parsed.hundredths > FULL_RATE_BASIS_POINTS)
        return { ok: false, reason: 'too-large' };
    return parsed;
}
export function rateBasisPoints(choice, customRate) {
    if (choice === 'standard')
        return STANDARD_RATE_BASIS_POINTS;
    if (choice === 'eilat')
        return 0;
    const parsed = parseRate(customRate);
    return parsed.ok ? parsed.hundredths : null;
}
export function breakdown(agorot, mode, basisPoints) {
    if (mode === 'add') {
        const vat = Math.round((agorot * basisPoints) / FULL_RATE_BASIS_POINTS);
        return { net: agorot, vat, gross: agorot + vat };
    }
    const net = Math.round((agorot * FULL_RATE_BASIS_POINTS) / (FULL_RATE_BASIS_POINTS + basisPoints));
    return { net, vat: agorot - net, gross: agorot };
}
export function calculateVat(amounts, mode, basisPoints) {
    const lines = amounts.map((agorot) => breakdown(agorot, mode, basisPoints));
    const total = breakdown(amounts.reduce((sum, agorot) => sum + agorot, 0), mode, basisPoints);
    const linesVat = lines.reduce((sum, line) => sum + line.vat, 0);
    return { lines, total, roundingGap: lines.length > 1 && linesVat !== total.vat };
}
const shekelFormat = new Intl.NumberFormat('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const rateFormat = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 2 });
const multiplierFormat = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 4, useGrouping: false });
export const formatShekels = (agorot) => `${shekelFormat.format(agorot / 100)} ₪`;
export const formatRate = (basisPoints) => `${rateFormat.format(basisPoints / 100)}%`;
export const formatMultiplier = (basisPoints) => multiplierFormat.format((FULL_RATE_BASIS_POINTS + basisPoints) / FULL_RATE_BASIS_POINTS);
export function formulaText(total, mode, basisPoints) {
    const multiplier = formatMultiplier(basisPoints);
    if (mode === 'add')
        return `${formatShekels(total.net)} × ${multiplier} = ${formatShekels(total.gross)}`;
    return `${formatShekels(total.gross)} ÷ ${multiplier} = ${formatShekels(total.net)}`;
}
export function resultToText(result, basisPoints) {
    const rate = formatRate(basisPoints);
    const summary = [
        `סכום לפני מע״מ: ${formatShekels(result.total.net)}`,
        `מע״מ (${rate}): ${formatShekels(result.total.vat)}`,
        `סכום כולל מע״מ: ${formatShekels(result.total.gross)}`,
    ];
    if (result.lines.length < 2)
        return summary.join('\n');
    const lines = result.lines.map((line, index) => `${index + 1}. ${formatShekels(line.net)} + ${formatShekels(line.vat)} מע״מ = ${formatShekels(line.gross)}`);
    return [...lines, '', ...summary].join('\n');
}
