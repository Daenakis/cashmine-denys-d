// All user-facing copy in one place. English only; no i18n runtime needed.
export const strings = {
  appName: 'CashMine',
  home: {
    tokenButton: 'Token',
    addTokenButton: 'Add token',
    emptyTitle: 'Add your API token',
    emptyText: 'The token stays in this browser only.',
    tokenSet: (masked: string) => `Token set ${masked}`,
  },
  token: {
    title: 'API token',
    current: 'Current token',
    remove: 'Remove token',
    confirmRemove: 'Tap again to remove',
    replaceLabel: 'Replace with a new token',
    pasteLabel: 'Paste your API token',
    placeholder: 'Paste token here',
    save: 'Save',
    hint: 'Stored in this browser only. Never sent anywhere except the CashMine API.',
  },
} as const;
