import React from 'react';
import {
  Modal as RNModal,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { spacing, radius } from '../../utils/theme';
import { Text } from './Text';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  fullScreen?: boolean;
  animationType?: 'none' | 'slide' | 'fade';
}

export function Modal({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  fullScreen = false,
  animationType = 'slide',
}: ModalProps) {
  const { colors } = useTheme();

  return (
    <RNModal
      visible={visible}
      animationType={animationType}
      transparent={!fullScreen}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={fullScreen ? undefined : onClose}>
          <View
            style={[
              styles.backdrop,
              {
                backgroundColor: fullScreen
                  ? colors.background
                  : 'rgba(0, 0, 0, 0.5)',
              },
            ]}
          />
        </TouchableWithoutFeedback>

        <View
          style={[
            styles.content,
            fullScreen && styles.fullScreenContent,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
            },
          ]}
        >
          {(title || showCloseButton) && (
            <View style={styles.header}>
              {title && (
                <Text variant="h5" style={styles.title}>
                  {title}
                </Text>
              )}
              {showCloseButton && !fullScreen && (
                <TouchableOpacity
                  onPress={onClose}
                  style={[styles.closeButton, { backgroundColor: colors.secondary }]}
                >
                  <Text variant="body" weight="medium">
                    ✕
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '90%',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  fullScreenContent: {
    position: 'relative',
    maxHeight: '100%',
    borderRadius: 0,
    borderWidth: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[6],
    paddingTop: spacing[6],
    paddingBottom: spacing[4],
  },
  title: {
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing[4],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[8],
  },
});