import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  creditPoints,
  grossForNet,
  minimumWage,
  netSalary,
  purchaseTax,
  recuperationPay,
  selfEmployedTax,
  severancePay,
  vat,
} from './index.js'

test('net salary adds up', () => {
  const salary = netSalary({ gross: 15000 })
  assert.equal(salary.net, salary.gross - salary.deductions)
  assert.equal(salary.deductions, salary.tax + salary.btl.total + salary.pension + salary.hishtalmut)
  assert.ok(salary.net > 11000 && salary.net < 12000)
})

test('a woman pays less tax on the same salary', () => {
  assert.ok(netSalary({ gross: 15000, gender: 'woman' }).net > netSalary({ gross: 15000 }).net)
})

test('gross for net inverts net salary', () => {
  const gross = grossForNet(10000)
  assert.ok(netSalary({ gross }).net >= 10000)
  assert.ok(netSalary({ gross: gross - 1 }).net < 10000)
})

test('vat adds and extracts 18 percent', () => {
  assert.deepEqual(vat(100), { net: 100, vat: 18, gross: 118, rate: 18 })
  assert.deepEqual(vat(118, { mode: 'extract' }), { net: 100, vat: 18, gross: 118, rate: 18 })
  assert.equal(vat(100, { rate: 0 }).gross, 100)
})

test('purchase tax follows the brackets', () => {
  assert.equal(purchaseTax(1_900_000).tax, 0)
  assert.equal(purchaseTax(2_500_000).tax, 20538)
  assert.equal(purchaseTax(2_500_000, 'additional').tax, 200000)
})

test('self-employed tax is never more than the profit', () => {
  const result = selfEmployedTax({ revenue: 300000, expenses: 60000 })
  assert.equal(result.profit, 240000)
  assert.ok(result.total > 0 && result.total < result.profit)
  assert.equal(selfEmployedTax({ revenue: 10000, expenses: 20000 }).loss, true)
})

test('severance pay is a month per year', () => {
  const result = severancePay({ start: '2020-01-01', end: '2025-12-31', salary: 12000 })
  assert.ok(Math.abs(result.severance - 72000) < 100)
  assert.throws(() => severancePay({ start: 'nope', end: '2026-01-01', salary: 1 }), RangeError)
})

test('credit points', () => {
  assert.equal(creditPoints().points, 2.25)
  assert.equal(creditPoints({ gender: 'woman' }).points, 2.75)
  assert.equal(creditPoints({ gender: 'woman', children: { sixSeventeen: 2 } }).points, 6.75)
})

test('recuperation pay', () => {
  const result = recuperationPay({ seniorityYear: 3 })
  assert.equal(result.days, 6)
  assert.equal(result.amount, 2709)
})

test('minimum wage', () => {
  const adult = minimumWage()
  assert.equal(adult.monthly, 6443.85)
  assert.ok(minimumWage({ age: 'age17' }).monthly < adult.monthly)
})
