// Every regular expression used in the app lives here.

// API decimal string: digits, optional dot and more digits, no leading zeros, no exponent.
export const DECIMAL_STRING_REGEX: RegExp = /^(0|[1-9]\d*)(\.\d+)?$/;

// Same, with an optional minus sign (activity amounts are signed).
export const SIGNED_DECIMAL_STRING_REGEX: RegExp = /^-?(0|[1-9]\d*)(\.\d+)?$/;

export const TRAILING_ZEROS_REGEX: RegExp = /0+$/;
