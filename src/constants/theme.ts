export const colors = {
  background: '#F5F6F8',
  surface: '#FFFFFF',
  text: '#111418',
  muted: '#6B7280',
  border: '#E5E7EB',
  primary: '#1F6FEB',
  primaryText: '#FFFFFF',
  danger: '#C62828',
  success: '#2E7D32',
  warning: '#B26A00',
  infoBackground: '#EAF2FE',
  warningBackground: '#FFF4E0',
  dangerBackground: '#FDECEC',
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24 } as const;

export const fontSize = { sm: 13, label: 14, body: 15, md: 16, lg: 18, xl: 20, xxl: 32 } as const;

export const fontWeight = { semibold: '600' } as const;

export const radius = { md: 10, lg: 12 } as const;

export const sizes = { control: 48, hitSlop: 8 } as const;

export const activeOpacity: number = 0.8;

export const disabledOpacity: number = 0.5;
