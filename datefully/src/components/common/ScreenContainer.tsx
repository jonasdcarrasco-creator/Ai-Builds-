import React from 'react';
import { View, StyleSheet, ViewStyle, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

/**
 * Full-screen container that eliminates the half-screen bug.
 * Uses useSafeAreaInsets() for precise, device-aware padding on all sides.
 */
export default function ScreenContainer({ children, style, edges = ['top', 'bottom', 'left', 'right'] }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <View
        style={[
          styles.container,
          {
            paddingTop: edges.includes('top') ? insets.top : 0,
            paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
            paddingLeft: edges.includes('left') ? insets.left : 0,
            paddingRight: edges.includes('right') ? insets.right : 0,
          },
          style,
        ]}
      >
        {children}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
