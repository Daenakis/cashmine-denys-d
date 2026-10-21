/// <reference types="node" />

import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import { canClaim, maxClaimAmount, validateClaimAmount } from './claim.ts';
import { formatAssetAmount, formatUsdCents } from './format.ts';
import { normalizeAmountInput, sumUnits } from './helpers.ts';
import { formatUnits, parseAmount, toUnits } from './units.ts';
import { usdCents } from './usd.ts';

describe('parseAmount', () => {
  test('accepts the formats the API allows', () => {
    assert.deepEqual(parseAmount('0.5', 8), { ok: true, data: 50_000_000n });
    assert.deepEqual(parseAmount('12', 6), { ok: true, data: 12_000_000n });
    assert.deepEqual(parseAmount('0', 6), { ok: true, data: 0n });
  });

  test('rejects the formats the API forbids', () => {
    for (const bad of ['.5', '1.', '05', '1e-3', '-1', '1.2.3', 'abc', ' 1']) {
      assert.deepEqual(parseAmount(bad, 8), { ok: false, error: { kind: 'format' } }, bad);
    }
  });

  test('rejects empty input', () => {
    assert.deepEqual(parseAmount('', 8), { ok: false, error: { kind: 'empty' } });
  });

  test('rejects more decimals than the asset allows', () => {
    assert.deepEqual(parseAmount('1.1234567', 6), {
      ok: false,
      error: { kind: 'tooManyDecimals', decimals: 6 },
    });
  });

  test('keeps full precision for 18-decimal assets', () => {
    const units: bigint = toUnits('12.345678901234591676', 18);
    assert.equal(units, 12_345678901234591676n);
    assert.equal(formatUnits(units, 18), '12.345678901234591676');
  });
});

describe('normalizeAmountInput', () => {
  test('trims and accepts a comma separator', () => {
    assert.equal(normalizeAmountInput(' 1,5 '), '1.5');
  });
});

describe('formatUnits', () => {
  test('produces canonical API strings', () => {
    assert.equal(formatUnits(50_000_000n, 8), '0.5');
    assert.equal(formatUnits(12_000_000n, 6), '12');
    assert.equal(formatUnits(1n, 8), '0.00000001');
    assert.equal(formatUnits(0n, 6), '0');
    assert.equal(formatUnits(-9_810_000n, 6), '-9.81');
  });
});

describe('validateClaimAmount', () => {
  const usdt = { decimals: 6, available: '820.413207', minAmount: '10', fee: '1.5' };

  test('quotes fee and receive amount', () => {
    const result = validateClaimAmount('100', usdt);
    assert.ok(result.ok);
    assert.equal(result.data.amountString, '100');
    assert.equal(formatUnits(result.data.fee, 6), '1.5');
    assert.equal(formatUnits(result.data.receive, 6), '98.5');
  });

  test('min and available are inclusive bounds', () => {
    assert.ok(validateClaimAmount('10', usdt).ok);
    assert.ok(validateClaimAmount('820.413207', usdt).ok);
  });

  test('rejects below min', () => {
    assert.deepEqual(validateClaimAmount('9.999999', usdt), {
      ok: false,
      error: { kind: 'belowMin', minAmount: '10' },
    });
  });

  test('rejects above available by one smallest unit', () => {
    assert.deepEqual(validateClaimAmount('820.413208', usdt), {
      ok: false,
      error: { kind: 'aboveAvailable', available: '820.413207' },
    });
  });

  test('rejects amounts the fee would eat entirely', () => {
    const rules = { decimals: 6, available: '100', minAmount: '1', fee: '1.5' };
    assert.deepEqual(validateClaimAmount('1.5', rules), {
      ok: false,
      error: { kind: 'notAboveFee', fee: '1.5' },
    });
  });

  test('passes through parse errors', () => {
    assert.deepEqual(validateClaimAmount('', usdt), { ok: false, error: { kind: 'empty' } });
    assert.deepEqual(validateClaimAmount('05', usdt), { ok: false, error: { kind: 'format' } });
  });

  test('Max sends exactly the available balance', () => {
    const max: string = maxClaimAmount('12.345678901234591676', 18);
    assert.equal(max, '12.345678901234591676');
    const eth = { decimals: 18, available: '12.345678901234591676', minAmount: '0.01', fee: '0.0012' };
    const result = validateClaimAmount(max, eth);
    assert.ok(result.ok);
    assert.equal(formatUnits(result.data.receive, 18), '12.344478901234591676');
  });
});

describe('canClaim', () => {
  test('is false when available is below min or not above fee', () => {
    assert.equal(canClaim({ decimals: 8, available: '0', minAmount: '0.001', fee: '0.0001' }), false);
    assert.equal(canClaim({ decimals: 8, available: '0.0005', minAmount: '0.001', fee: '0.0001' }), false);
    assert.equal(canClaim({ decimals: 8, available: '0.001', minAmount: '0.001', fee: '0.0001' }), true);
  });
});

describe('USD totals', () => {
  test('converts each asset exactly, rounding down to cents', () => {
    assert.equal(usdCents('0.01234567', 8, '67312.45'), 83101n); // 831.0172945915
    assert.equal(usdCents('820.413207', 6, '1.0002'), 82057n); // 820.5772896414
    assert.equal(usdCents('12.345678901234591676', 18, '2461.08'), 3038370n); // 30383.7034302504…
  });

  test('sums assets and formats as USD', () => {
    const total: bigint = sumUnits([
      usdCents('0.01234567', 8, '67312.45'),
      usdCents('820.413207', 6, '1.0002'),
      usdCents('12.345678901234591676', 18, '2461.08'),
    ]);
    assert.equal(total, 3203528n);
    assert.equal(formatUsdCents(total), '$32,035.28');
  });

  test('zero balance is zero dollars', () => {
    assert.equal(formatUsdCents(usdCents('0', 6, '1.0002')), '$0.00');
  });
});

describe('formatAssetAmount', () => {
  test('groups thousands without losing decimals', () => {
    assert.equal(formatAssetAmount('12345.678901234591676', 18), '12,345.678901234591676');
    assert.equal(formatAssetAmount('0', 6), '0');
  });
});
