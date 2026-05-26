import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '../theme';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  primary: { bg: '#E8EFF7', text: Colors.primary },
  success: { bg: '#E8F7EE', text: Colors.success },
  warning: { bg: '#FEF5E7', text: Colors.warning },
  error: { bg: '#FDEDEC', text: Colors.error },
  info: { bg: '#EAF4FB', text: Colors.accent },
  neutral: { bg: '#F0F0F0', text: Colors.textSecondary },
};

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export default function Badge({ label, variant = 'neutral' }: BadgeProps) {
  const colors = variantColors[variant];
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
