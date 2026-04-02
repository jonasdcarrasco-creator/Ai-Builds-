import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ChatMessage } from '../types';
import { useDateStore } from '../store';
import { streamChatMessage } from '../lib/claude';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AIChat'>;
};

const { width } = Dimensions.get('window');

const SUGGESTED_REPLIES = [
  'Make it cheaper',
  'More romantic',
  'Make it exciting',
  'Surprise me',
];

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ])
      );
    const a1 = anim(dot1, 0);
    const a2 = anim(dot2, 200);
    const a3 = anim(dot3, 400);
    a1.start();
    a2.start();
    a3.start();
    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, []);

  return (
    <View style={typingStyles.container}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View
          key={i}
          style={[
            typingStyles.dot,
            { opacity: dot, transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }] },
          ]}
        />
      ))}
    </View>
  );
}

const typingStyles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 4, alignItems: 'center', paddingVertical: 4 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.textSecondary },
});

export default function AIChatScreen({ navigation }: Props) {
  const { userName, budget, partnerProfile, chatMessages, addChatMessage, updateLastMessage } =
    useDateStore();

  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasAIResponded, setHasAIResponded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;
      setHasError(false);

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: text.trim(),
        timestamp: new Date(),
      };
      addChatMessage(userMsg);
      setInputText('');
      scrollToBottom();

      // Placeholder AI message for streaming
      const aiMsgId = `a-${Date.now()}`;
      const aiMsg: ChatMessage = {
        id: aiMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };
      addChatMessage(aiMsg);
      setIsStreaming(true);

      const allMessages = [...chatMessages, userMsg];

      await streamChatMessage(
        allMessages,
        userName || 'there',
        budget,
        partnerProfile,
        (_chunk) => {
          // content is accumulated in onComplete via updateLastMessage
        },
        (fullText) => {
          updateLastMessage(fullText);
          setIsStreaming(false);
          setHasAIResponded(true);
          scrollToBottom();
        },
        (_err) => {
          updateLastMessage('Sorry, I had trouble connecting. Please try again.');
          setIsStreaming(false);
          setHasError(true);
          scrollToBottom();
        }
      );
    },
    [isStreaming, chatMessages, userName, budget, partnerProfile, addChatMessage, updateLastMessage, scrollToBottom]
  );

  // Streaming chunk handler — update message in real time
  const sendMessageWithStreaming = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;
      setHasError(false);

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: text.trim(),
        timestamp: new Date(),
      };
      addChatMessage(userMsg);
      setInputText('');
      scrollToBottom();

      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };
      addChatMessage(aiMsg);
      setIsStreaming(true);

      let accumulated = '';
      const allMessages = [...chatMessages, userMsg];

      await streamChatMessage(
        allMessages,
        userName || 'there',
        budget,
        partnerProfile,
        (chunk) => {
          accumulated += chunk;
          updateLastMessage(accumulated);
          scrollToBottom();
        },
        (_fullText) => {
          setIsStreaming(false);
          setHasAIResponded(true);
          scrollToBottom();
        },
        (_err) => {
          updateLastMessage('Sorry, I had trouble connecting. Please try again.');
          setIsStreaming(false);
          setHasError(true);
          scrollToBottom();
        }
      );
    },
    [isStreaming, chatMessages, userName, budget, partnerProfile, addChatMessage, updateLastMessage, scrollToBottom]
  );

  // Auto-send intro message on first mount
  useEffect(() => {
    if (chatMessages.length === 0) {
      const intro = `Hi${userName ? ` ${userName}` : ''}! I'm your Datefully concierge 💛 I'm here to plan the perfect date for you in Philadelphia with your $${budget} budget. What kind of vibe are you going for tonight?`;
      const introMsg: ChatMessage = {
        id: `a-intro`,
        role: 'assistant',
        content: intro,
        timestamp: new Date(),
      };
      addChatMessage(introMsg);
      setHasAIResponded(true);
    }
  }, []);

  const handleSend = () => sendMessageWithStreaming(inputText);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Your Date Concierge</Text>
          <View style={styles.aiIndicator}>
            <View style={styles.aiDot} />
            <Text style={styles.aiLabel}>AI · claude-sonnet-4-6</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        >
          {chatMessages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const isLast = idx === chatMessages.length - 1;
            const showTyping = isStreaming && isLast && !isUser && msg.content === '';

            return (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  isUser ? styles.messageRowUser : styles.messageRowAI,
                ]}
              >
                {!isUser && (
                  <View style={styles.aiBubbleIcon}>
                    <Text style={styles.aiBubbleIconText}>✦</Text>
                  </View>
                )}
                <View
                  style={[
                    styles.bubble,
                    isUser ? styles.userBubble : styles.aiBubble,
                  ]}
                >
                  {showTyping ? (
                    <TypingIndicator />
                  ) : (
                    <Text style={[styles.bubbleText, isUser && styles.userBubbleText]}>
                      {msg.content}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}

          {/* Error state */}
          {hasError && (
            <View style={styles.errorRow}>
              <Text style={styles.errorText}>AI is taking a break. Try again.</Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => sendMessageWithStreaming('Hello, can you help me plan a date?')}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Suggested replies */}
        {hasAIResponded && !isStreaming && (
          <ScrollView
            horizontal
            style={styles.suggestionsRow}
            contentContainerStyle={styles.suggestionsContent}
            showsHorizontalScrollIndicator={false}
          >
            {SUGGESTED_REPLIES.map((reply) => (
              <TouchableOpacity
                key={reply}
                style={styles.suggestionChip}
                onPress={() => sendMessageWithStreaming(reply)}
                activeOpacity={0.8}
              >
                <Text style={styles.suggestionText}>{reply}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Input row */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask anything..."
            placeholderTextColor={Colors.textMuted}
            multiline
            maxLength={500}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!inputText.trim() || isStreaming) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || isStreaming}
            activeOpacity={0.8}
          >
            {isStreaming ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.sendIcon}>↑</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Plan my date CTA */}
        {hasAIResponded && (
          <TouchableOpacity
            style={styles.planButton}
            onPress={() => navigation.navigate('DateOptions')}
            activeOpacity={0.85}
          >
            <Text style={styles.planButtonText}>Plan my date →</Text>
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    gap: Spacing.md,
  },
  backBtn: {},
  backText: { color: Colors.gold, fontSize: Typography.base },
  headerCenter: { flex: 1 },
  headerTitle: {
    fontFamily: Typography.heading,
    fontSize: Typography.lg,
    color: Colors.textPrimary,
  },
  aiIndicator: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  aiDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  aiLabel: { fontSize: Typography.xs, color: Colors.textMuted },
  messageList: { flex: 1 },
  messageListContent: { padding: Spacing.screen, gap: Spacing.md },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.xs },
  messageRowUser: { justifyContent: 'flex-end' },
  messageRowAI: { justifyContent: 'flex-start' },
  aiBubbleIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(201,168,76,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  aiBubbleIconText: { color: Colors.gold, fontSize: 12 },
  bubble: {
    maxWidth: width * 0.72,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  userBubble: {
    backgroundColor: Colors.userBubble,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.25)',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: Colors.aiBubble,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderBottomLeftRadius: 4,
  },
  bubbleText: { color: Colors.textSecondary, fontSize: Typography.base, lineHeight: 22 },
  userBubbleText: { color: Colors.textPrimary },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  errorText: { color: Colors.error, fontSize: Typography.sm },
  retryBtn: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  retryText: { color: Colors.gold, fontSize: Typography.sm, fontWeight: Typography.semibold },
  suggestionsRow: { maxHeight: 52 },
  suggestionsContent: {
    paddingHorizontal: Spacing.screen,
    gap: Spacing.xs,
    alignItems: 'center',
  },
  suggestionChip: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  suggestionText: { color: Colors.textSecondary, fontSize: Typography.sm },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.inputBackground,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.textPrimary,
    fontSize: Typography.base,
    maxHeight: 120,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.cardAlt },
  sendIcon: { color: Colors.black, fontSize: 18, fontWeight: Typography.bold },
  planButton: {
    marginHorizontal: Spacing.screen,
    marginBottom: Spacing.md,
    backgroundColor: Colors.red,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  planButtonText: {
    color: Colors.white,
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    letterSpacing: 0.5,
  },
});
