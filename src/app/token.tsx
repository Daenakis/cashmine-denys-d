import { type ReactElement, useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { strings } from '@/i18n/strings';
import { goBackOrHome } from '@/navigation/goBackOrHome';
import { maskToken } from '@/token/helpers';
import { useToken } from '@/token/useToken';
import { Button } from '@/ui/Button';
import { colors, fontSize, fontWeight, radius, sizes, spacing } from '@/constants/theme';

export default function TokenScreen(): ReactElement {
  const { token, setToken, clearToken } = useToken();
  const [draft, setDraft] = useState<string>('');
  const [confirmingRemove, setConfirmingRemove] = useState<boolean>(false);
  const trimmed: string = useMemo((): string => draft.trim(), [draft]);

  const save = useCallback((): void => {
    if (!trimmed) return;
    setToken(trimmed);
    setDraft('');
    goBackOrHome();
  }, [trimmed, setToken]);

  const remove = useCallback((): void => {
    if (!confirmingRemove) {
      setConfirmingRemove(true);
      return;
    }
    clearToken();
    setConfirmingRemove(false);
  }, [confirmingRemove, clearToken]);

  return (
    <View style={styles.container}>
      {token ? (
        <View style={styles.card}>
          <Text style={styles.label}>{strings.token.current}</Text>
          <Text testID="current-token" style={styles.value}>
            {maskToken(token)}
          </Text>
          <Button
            testID="remove-token"
            variant="danger"
            title={confirmingRemove ? strings.token.confirmRemove : strings.token.remove}
            onPress={remove}
          />
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.label}>{token ? strings.token.replaceLabel : strings.token.pasteLabel}</Text>
        <TextInput
          testID="token-input"
          value={draft}
          onChangeText={setDraft}
          placeholder={strings.token.placeholder}
          placeholderTextColor={colors.muted}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          spellCheck={false}
          onSubmitEditing={save}
          style={styles.input}
        />
        <Button testID="save-token" title={strings.token.save} onPress={save} disabled={!trimmed} />
        <Text style={styles.hint}>{strings.token.hint}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md, gap: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { fontSize: fontSize.label, color: colors.muted },
  value: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.text, fontFamily: 'monospace' },
  input: {
    minHeight: sizes.control,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
  },
  hint: { fontSize: fontSize.sm, color: colors.muted },
});
