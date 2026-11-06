import type { SalaryResult, Severance, Gender } from './net-salary.js'
import type { TaxResult } from './self-employed-tax.js'
import type { PurchaseTaxResult, BuyerKind } from './purchase-tax.js'
import type { Section14 } from './severance-pay.js'
import type { CreditResult, ChildBand, DegreeKind, MonthYear } from './tax-credit-points.js'
import type { AgeGroup, WagePeriodId } from './minimum-wage.js'

export * as salaryModule from './net-salary.js'
export * as selfEmployedModule from './self-employed-tax.js'
export * as vatModule from './vat-calculator.js'
export * as purchaseTaxModule from './purchase-tax.js'
export * as severanceModule from './severance-pay.js'
export * as creditPointsModule from './tax-credit-points.js'
export * as recuperationModule from './recuperation-pay.js'
export * as minimumWageModule from './minimum-wage.js'

export declare const TAX_YEAR: number
export declare const STANDARD_VAT_RATE: number
export declare const POINT_VALUE_MONTHLY: number
export declare const ANNUAL_TAX_BRACKETS: { upTo: number | null; rateBasisPoints: number }[]

export interface SalaryOptions {
  creditPoints?: number
  gender?: Gender
  hishtalmut?: boolean
  severance?: Severance
}

export declare function netSalary(input: SalaryOptions & { gross: number }): SalaryResult
export declare function grossForNet(net: number, options?: SalaryOptions): number | null

export declare function vat(
  amount: number,
  options?: { mode?: 'add' | 'extract'; rate?: number },
): { net: number; vat: number; gross: number; rate: number }

export declare function purchaseTax(value: number, buyer?: BuyerKind): PurchaseTaxResult

export declare function selfEmployedTax(input: {
  revenue: number
  expenses?: number
  creditPoints?: number
  gender?: Gender
  months?: number
}): TaxResult

export interface SeveranceResult {
  kind: 'result'
  tenure: { months: number; extraDays: number; years: number }
  salary: number
  eligibleBySeniority: boolean
  section14: Section14
  severance: number
  exempt: number | null
  taxable: number | null
  endYear: number
  startDay: number
  endDay: number
}

export declare function severancePay(input: {
  start: string
  end: string
  salary: number | string
  section14?: Section14
}): SeveranceResult

export declare function creditPoints(input?: {
  gender?: Gender
  children?: Partial<Record<ChildBand, number>>
  degree?: DegreeKind
  oleh?: MonthYear | null
  soldier?: { discharge: MonthYear; fullService: boolean } | null
}): CreditResult

export declare function recuperationPay(input: {
  seniorityYear: number
  months?: number
  jobPercent?: number
  dayRate?: number
}): {
  kind: 'result'
  year: number
  tableDays: number
  months: number
  percent: number
  rate: number
  days: number
  amount: number
  topUp: number | null
}

export declare function minimumWage(options?: { age?: AgeGroup; period?: WagePeriodId }): {
  period: WagePeriodId
  monthly: number
  hourly: number
  daily: { fiveDayWeek: number; sixDayWeek: number } | null
}
