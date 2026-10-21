import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { strings } from '@/i18n/strings';
import { goBackOrHome } from '@/navigation/goBackOrHome';
import { clearToken, maskToken, setToken, useToken } from '@/storage/token';
import { Button } from '@/ui/Button';
import { colors, spacing } from '@/ui/theme';

export default function TokenScreen() {
  const token = useToken();
  const [draft, setDraft] = useState('');
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const trimmed = useMemo(() => draft.trim(), [draft]);

  const save = useCallback(() => {
    if (!trimmed) return;
    setToken(trimmed);
    setDraft('');
    goBackOrHome();
  }, [trimmed]);

  const remove = useCallback(() => {
    if (!confirmingRemove) {
      setConfirmingRemove(true);
      return;
    }
    clearToken();
    setConfirmingRemove(false);
  }, [confirmingRemove]);

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
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { fontSize: 14, color: colors.muted },
  value: { fontSize: 18, fontWeight: '600', color: colors.text, fontFamily: 'monospace' },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    fontSize: 16,
    color: colors.text,
  },
  hint: { fontSize: 13, color: colors.muted },
});
