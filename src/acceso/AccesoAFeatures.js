import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function FeatureActionButton({
  label,
  onPress,
  color = '#38bdf8',
  icon: Icon,
  iconName,
  style,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: color, opacity: pressed ? 0.85 : 1 },
        style,
      ]}
    >
      <View style={styles.content}>
        {Icon && iconName ? <Icon name={iconName} size={18} color="#0f172a" style={styles.icon} /> : null}
        <Text style={[styles.label, Icon && iconName && styles.labelWithIcon]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    color: '#0b1120',
    fontWeight: '700',
    fontSize: 16,
  },
  labelWithIcon: {
    marginLeft: 8,
  },
  icon: {
    marginRight: 2,
  },
});
