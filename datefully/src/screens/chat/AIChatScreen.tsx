import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Brand colors
const BLACK = '#000000';
const DEEP_RED = '#C0392B';
const GOLD = '#C9A84C';
const WHITE = '#FFFFFF';
const DARK_SURFACE = '#111111';
const DARK_BORDER = '#2A2A2A';
const TEXT_MUTED = '#888888';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_API_KEY = 'DATEFULLY_API_KEY';

const SUGGESTION_CHIPS = [
  'Make it cheaper',
  'Add transportation',
  'More romantic',
  'Chill at home instead',
  'Teen friendly',
  'Add a surprise',
];

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

type Props = {
  navigation: any;
  route: any;
};

function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ]),
      );
    };

    const a1 = animateDot(dot1, 0);
    const a2 = animateDot(dot2, 150);
    const a3 = animateDot(dot3, 300);

    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <View style={typingStyles.container}>
      <Text style={typingStyles.label}>Datefully AI</Text>
      <View style={typingStyles.bubble}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View
            key={i}
            style={[typingStyles.dot, { transform: [{ translateY: dot }] }]}
          />
        ))}
      </View>
    </View>
  );
}

const typingStyles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    maxWidth: '80%',
  },
  label: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
    marginLeft: 2,
  },
  bubble: {
    backgroundColor: DARK_SURFACE,
    borderLeftWidth: 3,
    borderLeftColor: GOLD,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: GOLD,
    marginHorizontal: 2,
  },
});

export default function AIChatScreen({ navigation, route }: Props) {
  const params = route?.params ?? {};
  const city: string = params.city ?? 'your city';
  const budget: string = params.budget ?? 'your budget';
  const likes: string[] = params.likes ?? [];
  const dislikes: string[] = params.dislikes ?? [];
  const topLike = likes[0] ?? 'something they love';

  const welcomeMessage: Message = {
    id: 'welcome',
    role: 'assistant',
    content: `Hi! I'm Datefully AI 💕 I see you're in ${city} with a ${budget} budget. Based on what your date loves, I'm thinking we start with ${topLike} and end the night with something special. Want me to build your full date plan? 🗓️`,
  };

  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const buildSystemPrompt = () =>
    `You are Datefully AI, a friendly date planning assistant. You know the user is in ${city} with a budget of $${budget}. Their partner loves ${likes.join(', ')} and is not a fan of ${dislikes.join(', ')}. Suggest complete dates with real local venue names, estimated costs, and transportation. Keep responses warm, fun, and under 80 words. Always end by asking if they want to book it.`;

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const apiMessages = updatedMessages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: buildSystemPrompt(),
          messages: apiMessages,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const replyContent: string =
        data?.content?.[0]?.text ?? "Hmm, I lost my train of thought. Try again? 💕";

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: replyContent,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (_err) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Hmm, I lost my train of thought. Try again? 💕",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    sendMessage(inputText);
  };

  const handleSuggestionChip = (chip: string) => {
    sendMessage(chip);
  };

  const handleSeeDates = () => {
    navigation.navigate('DateOptions', { ...params });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={BLACK} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={WHITE} />
            </TouchableOpacity>
          </View>

          {/* Progress Dots */}
          <View style={styles.dotsRow}>
            {Array.from({ length: 9 }).map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === 4 ? styles.dotActive : styles.dotInactive]}
              />
            ))}
          </View>

          {/* Heading */}
          <Text style={styles.heading}>Ask Datefully anything</Text>
          <Text style={styles.subtext}>Powered by Claude AI — knows your city and budget</Text>

          {/* Chat Area */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.chatArea}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map(msg => (
              <View
                key={msg.id}
                style={msg.role === 'assistant' ? styles.aiMessageWrapper : styles.userMessageWrapper}
              >
                {msg.role === 'assistant' && (
                  <Text style={styles.aiLabel}>Datefully AI</Text>
                )}
                <View style={msg.role === 'assistant' ? styles.aiBubble : styles.userBubble}>
                  <Text style={styles.messageText}>{msg.content}</Text>
                </View>
              </View>
            ))}
            {isLoading && <TypingIndicator />}
          </ScrollView>

          {/* Suggestion Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.suggestionScroll}
            contentContainerStyle={styles.suggestionContent}
          >
            {SUGGESTION_CHIPS.map(chip => (
              <TouchableOpacity
                key={chip}
                style={styles.suggestionChip}
                onPress={() => handleSuggestionChip(chip)}
                activeOpacity={0.7}
              >
                <Text style={styles.suggestionChipText}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              This is Claude AI. It costs you nothing. Datefully covers it.
            </Text>
          </View>

          {/* Input Row */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask anything..."
              placeholderTextColor="#555555"
              color={WHITE}
              multiline={false}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSend}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <Ionicons name="send" size={20} color={WHITE} />
            </TouchableOpacity>
          </View>

          {/* See My 3 Dates Button */}
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.seeDatesButton} onPress={handleSeeDates} activeOpacity={0.85}>
              <Text style={styles.seeDatesText}>See My 3 Dates →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BLACK,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: BLACK,
    paddingTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: GOLD,
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#444',
  },
  heading: {
    color: WHITE,
    fontSize: 22,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  subtext: {
    color: TEXT_MUTED,
    fontSize: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  chatArea: {
    flex: 1,
    paddingHorizontal: 20,
  },
  chatContent: {
    paddingBottom: 16,
  },
  aiMessageWrapper: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    maxWidth: '80%',
  },
  userMessageWrapper: {
    alignSelf: 'flex-end',
    marginBottom: 12,
    maxWidth: '80%',
  },
  aiLabel: {
    color: GOLD,
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
    marginLeft: 2,
  },
  aiBubble: {
    backgroundColor: DARK_SURFACE,
    borderLeftWidth: 3,
    borderLeftColor: GOLD,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: DEEP_RED,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  messageText: {
    color: WHITE,
    fontSize: 14,
    lineHeight: 20,
  },
  suggestionScroll: {
    maxHeight: 44,
    marginBottom: 8,
  },
  suggestionContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: DARK_SURFACE,
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  suggestionChipText: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '500',
  },
  infoBox: {
    marginHorizontal: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  infoText: {
    color: '#555555',
    fontSize: 10,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: DARK_SURFACE,
    borderWidth: 1,
    borderColor: DARK_BORDER,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: WHITE,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: DEEP_RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  seeDatesButton: {
    backgroundColor: DEEP_RED,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
  },
  seeDatesText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
