import { calculateSalary, grossForNet as grossForNetRaw, DEFAULT_CREDIT_POINTS, TAX_YEAR } from './net-salary.js'
import { calculateTax, ANNUAL_TAX_BRACKETS } from './self-employed-tax.js'
import { breakdown, STANDARD_VAT_RATE } from './vat-calculator.js'
import { calculatePurchaseTax } from './purchase-tax.js'
import { calculateSeverance } from './severance-pay.js'
import { calculateCredits, CHILD_BANDS, POINT_VALUE_MONTHLY } from './tax-credit-points.js'
import { calculateRecuperation, DAY_RATE_AGOROT } from './recuperation-pay.js'
import { CURRENT_PERIOD, dailyRate, fullMonthly, hourlyRate } from './minimum-wage.js'

export * as salaryModule from './net-salary.js'
export * as selfEmployedModule from './self-employed-tax.js'
export * as vatModule from './vat-calculator.js'
export * as purchaseTaxModule from './purchase-tax.js'
export * as severanceModule from './severance-pay.js'
export * as creditPointsModule from './tax-credit-points.js'
export * as recuperationModule from './recuperation-pay.js'
export * as minimumWageModule from './minimum-wage.js'

export { TAX_YEAR, STANDARD_VAT_RATE, POINT_VALUE_MONTHLY, ANNUAL_TAX_BRACKETS }

const toAgorot = (shekels) => Math.round(Number(shekels) * 100)
const fromAgorot = (agorot) => agorot / 100

const requireAmount = (value, name) => {
  const number = Number(value)
  if (!Number.isFinite(number) || number < 0) throw new RangeError(`${name} must be a non-negative number of shekels`)
  return number
}

const creditPointsHundredths = (creditPoints, gender = 'man') =>
  creditPoints === undefined ? DEFAULT_CREDIT_POINTS[gender] : Math.round(Number(creditPoints) * 100)

const outcomeOrThrow = (outcome) => {
  if (outcome.kind !== 'result') throw new RangeError(outcome.message)
  return outcome
}

export function netSalary({ gross, creditPoints, gender = 'man', hishtalmut = false, severance = 'partial' }) {
  return calculateSalary({
    gross: Math.round(requireAmount(gross, 'gross')),
    creditPointsHundredths: creditPointsHundredths(creditPoints, gender),
    hishtalmut,
    severance,
  })
}

export function grossForNet(net, { creditPoints, gender = 'man', hishtalmut = false, severance = 'partial' } = {}) {
  return grossForNetRaw(Math.round(requireAmount(net, 'net')), {
    creditPointsHundredths: creditPointsHundredths(creditPoints, gender),
    hishtalmut,
    severance,
  })
}

export function vat(amount, { mode = 'add', rate = STANDARD_VAT_RATE } = {}) {
  const result = breakdown(toAgorot(requireAmount(amount, 'amount')), mode, Math.round(Number(rate) * 100))
  return { net: fromAgorot(result.net), vat: fromAgorot(result.vat), gross: fromAgorot(result.gross), rate: Number(rate) }
}

export function purchaseTax(value, buyer = 'single') {
  return calculatePurchaseTax(toAgorot(requireAmount(value, 'value')), buyer)
}

export function selfEmployedTax({ revenue, expenses = 0, creditPoints, gender = 'man', months = 12 }) {
  return calculateTax({
    revenueAgorot: toAgorot(requireAmount(revenue, 'revenue')),
    expensesAgorot: toAgorot(requireAmount(expenses, 'expenses')),
    creditPointsHundredths: creditPointsHundredths(creditPoints, gender),
    months,
  })
}

export function severancePay({ start, end, salary, section14 = 'none' }) {
  return outcomeOrThrow(calculateSeverance({ start, end, salary: String(salary), section14 }))
}

export function creditPoints({ gender = 'man', children = {}, degree = 'none', oleh = null, soldier = null } = {}) {
  const counts = Object.fromEntries(CHILD_BANDS.map((band) => [band, Number(children[band] ?? 0)]))
  return calculateCredits({ gender, children: counts, degree, oleh, soldier })
}

export function recuperationPay({ seniorityYear, months = 12, jobPercent = 100, dayRate = fromAgorot(DAY_RATE_AGOROT) }) {
  const result = outcomeOrThrow(
    calculateRecuperation({
      year: String(seniorityYear),
      months: String(months),
      percent: String(jobPercent),
      sector: 'private',
      rate: String(dayRate),
    }),
  )
  return {
    ...result,
    amount: fromAgorot(result.amount),
    rate: fromAgorot(result.rate),
    percent: result.percent / 100,
    topUp: result.topUp === null ? null : fromAgorot(result.topUp),
  }
}

export function minimumWage({ age = 'adult', period = CURRENT_PERIOD } = {}) {
  return {
    period,
    monthly: fromAgorot(fullMonthly(period, age)),
    hourly: fromAgorot(hourlyRate(period, age)),
    daily: age === 'adult' ? { fiveDayWeek: fromAgorot(dailyRate(period, '5')), sixDayWeek: fromAgorot(dailyRate(period, '6')) } : null,
  }
}
