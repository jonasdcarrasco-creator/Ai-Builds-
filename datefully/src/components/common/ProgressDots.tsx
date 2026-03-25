import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  total: number;
  current: number; // 1-indexed
}

export const ProgressDots: React.FC<Props> = ({ total, current }) => {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i + 1 === current ? styles.dotActive : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: '#C9A84C',
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#333',
  },
});
