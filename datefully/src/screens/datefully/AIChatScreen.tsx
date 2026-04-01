import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { DatefullyStackParamList } from '../../navigation/DatefullyNavigator';
import { useDatefullyStore } from '../../stores/datefullyStore';

type NavProp = NativeStackNavigationProp<DatefullyStackParamList, 'AIChat'>;

const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || '';

const NavDots = ({ total, current }: { total: number; current: number }) => (
  <View style={styles.navDotsContainer}>
    {Array.from({ length: total }).map((_, i) => (
      <View
        key={i}
        style={[
          styles.dot,
          {
            width: i === current ? 16 : 6,
            backgroundColor: i === current ? '#c0392b' : '#333',
          },
        ]}
      />
    ))}
  </View>
);

const SUGGESTION_CHIPS = [
  'Make it cheaper',
  'More romantic',
  'Chill at home',
  'Teen friendly',
];

function buildSystemPrompt(
  budget: number,
  planner: string,
  occasion: string,
  partnerPrefs: {
    food: string[];
    activities: string[];
    outdoors: string[];
    stayHome: string[];
    personality: string[];
    notAFan: string[];
    accessibility: string[];
  }
): string {
  const prefsText = [
    partnerPrefs.food.length ? `Food preferences: ${partnerPrefs.food.join(', ')}` : '',
    partnerPrefs.activities.length ? `Activities they enjoy: ${partnerPrefs.activities.join(', ')}` : '',
    partnerPrefs.outdoors.length ? `Outdoor preferences: ${partnerPrefs.outdoors.join(', ')}` : '',
    partnerPrefs.stayHome.length ? `Stay-home preferences: ${partnerPrefs.stayHome.join(', ')}` : '',
    partnerPrefs.personality.length ? `Their personality: ${partnerPrefs.personality.join(', ')}` : '',
    partnerPrefs.notAFan.length ? `Not a fan of: ${partnerPrefs.notAFan.join(', ')}` : '',
    partnerPrefs.accessibility.length ? `Accessibility needs: ${partnerPrefs.accessibility.join(', ')}` : '',
  ].filter(Boolean).join('\n');

  return `You are Datefully AI, a romantic date planning assistant for Philadelphia, PA.
You help people plan amazing dates in Philadelphia, PA.
City: Philadelphia, PA
Planner: ${planner}
Occasion: ${occasion}
Budget: ${budget === 0 ? 'Free' : `$${budget}`}
${prefsText ? '\nPartner preferences:\n' + prefsText : ''}

Keep responses warm, fun, and concise (3-5 sentences). Always suggest real Philadelphia venues and neighborhoods. Be enthusiastic and helpful!`;
}

function buildInitialMessage(
  budget: number,
  occasion: string,
  partnerPrefs: {
    food: string[];
    activities: string[];
    personality: string[];
  }
): string {
  const budgetText = budget === 0 ? 'free activities' : `a $${budget} budget`;
  const occasionText = occasion ? `for a ${occasion.toLowerCase()}` : '';
  const foodText = partnerPrefs.food.length > 0 ? ` I love that they're into ${partnerPrefs.food.slice(0, 2).join(' and ')}.` : '';
  const personalityText = partnerPrefs.personality.length > 0 ? ` Since they're ${partnerPrefs.personality[0].toLowerCase()}, I have some perfect ideas!` : '';

  return `Hey there! 💛 I'm your Datefully AI, powered by Claude. I'm here to help you plan an unforgettable date in Philadelphia, PA ${occasionText} with ${budgetText}.${foodText}${personalityText}

Ask me anything — I can refine your date ideas, suggest venues, or help you make it extra special. What would you like to know? ✨`;
}

export default function AIChatScreen() {
  const navigation = useNavigation<NavProp>();
  const { chatMessages, addChatMessage, budget, planner, occasion, partnerPrefs } = useDatefullyStore();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current && chatMessages.length === 0) {
      hasInitialized.current = true;
      const welcomeMsg = buildInitialMessage(budget, occasion, partnerPrefs);
      addChatMessage({
        id: `ai-welcome-${Date.now()}`,
        role: 'ai',
        text: welcomeMsg,
      });
    }
  }, []);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setError(null);
    setInputText('');

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      text: trimmed,
    };
    addChatMessage(userMsg);

    setIsLoading(true);

    try {
      if (!ANTHROPIC_API_KEY) {
        throw new Error('No API key');
      }

      const systemPrompt = buildSystemPrompt(budget, planner, occasion, partnerPrefs);

      const allMessages = [...chatMessages, userMsg];
      const apiMessages = allMessages
        .filter((m) => m.role === 'user' || m.role === 'ai')
        .map((m) => ({
          role: m.role === 'ai' ? 'assistant' : 'user',
          content: m.text,
        }));

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 512,
          system: systemPrompt,
          messages: apiMessages,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const aiText = data?.content?.[0]?.text || 'I have some great ideas for your date! Let me know what you\'d like to explore.';

      addChatMessage({
        id: `ai-${Date.now()}`,
        role: 'ai',
        text: aiText,
      });
    } catch (err) {
      addChatMessage({
        id: `ai-error-${Date.now()}`,
        role: 'ai',
        text: 'Our AI is taking a moment. Try again or skip ahead! ✨',
      });
      setError('Our AI is taking a moment. Try again or skip ahead!');
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleSuggestionChip = (chip: string) => {
    sendMessage(chip);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={26} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.heading}>Ask Datefully anything</Text>
            <Text style={styles.subtext}>✦ Powered by Claude AI</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        {/* Chat Area */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatScroll}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {chatMessages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageWrapper,
                msg.role === 'ai' ? styles.aiWrapper : styles.userWrapper,
              ]}
            >
              {msg.role === 'ai' && (
                <Text style={styles.aiLabel}>Datefully AI</Text>
              )}
              <View
                style={[
                  styles.messageBubble,
                  msg.role === 'ai' ? styles.aiBubble : styles.userBubble,
                ]}
              >
                <Text style={styles.messageText}>{msg.text}</Text>
              </View>
            </View>
          ))}
          {isLoading && (
            <View style={[styles.messageWrapper, styles.aiWrapper]}>
              <Text style={styles.aiLabel}>Datefully AI</Text>
              <View style={[styles.messageBubble, styles.aiBubble]}>
                <ActivityIndicator size="small" color="#c9a84c" />
              </View>
            </View>
          )}
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </ScrollView>

        {/* Suggestion Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.suggestionsScroll}
          contentContainerStyle={styles.suggestionsContent}
        >
          {SUGGESTION_CHIPS.map((chip) => (
            <TouchableOpacity
              key={chip}
              onPress={() => handleSuggestionChip(chip)}
              style={styles.suggestionChip}
              activeOpacity={0.75}
            >
              <Text style={styles.suggestionChipText}>{chip}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask anything about your date..."
            placeholderTextColor="#555"
            multiline={false}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage(inputText)}
            color="#ffffff"
          />
          <TouchableOpacity
            onPress={() => sendMessage(inputText)}
            style={[styles.sendButton, { opacity: inputText.trim() ? 1 : 0.5 }]}
            activeOpacity={0.75}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons name="arrow-up" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Bottom CTA */}
        <View style={styles.bottom}>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => navigation.navigate('DateOptions')}
            activeOpacity={0.85}
          >
            <Text style={styles.nextButtonText}>See My 3 Dates →</Text>
          </TouchableOpacity>
          <NavDots total={9} current={4} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
  },
  heading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  subtext: {
    fontSize: 12,
    color: '#c9a84c',
    fontStyle: 'italic',
    marginTop: 2,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  messageWrapper: {
    marginBottom: 12,
    maxWidth: '82%',
  },
  aiWrapper: {
    alignSelf: 'flex-start',
  },
  userWrapper: {
    alignSelf: 'flex-end',
  },
  aiLabel: {
    fontSize: 10,
    color: '#c9a84c',
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  messageBubble: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  aiBubble: {
    backgroundColor: '#3d0a0a',
  },
  userBubble: {
    backgroundColor: '#3d2e0a',
  },
  messageText: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20,
  },
  errorBanner: {
    backgroundColor: '#1a0000',
    borderWidth: 1,
    borderColor: '#c0392b',
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
  },
  errorText: {
    color: '#c9a84c',
    fontSize: 13,
    textAlign: 'center',
  },
  suggestionsScroll: {
    maxHeight: 48,
    borderTopWidth: 1,
    borderTopColor: '#111',
  },
  suggestionsContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#c9a84c',
    backgroundColor: '#111',
    marginRight: 8,
  },
  suggestionChipText: {
    color: '#c9a84c',
    fontSize: 12,
    fontWeight: '500',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#222',
    backgroundColor: '#000',
    gap: 10,
  },
  textInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#c9a84c',
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#ffffff',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#c0392b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: {
    paddingHorizontal: 24,
    paddingTop: 8,
    backgroundColor: '#000000',
  },
  nextButton: {
    backgroundColor: '#c0392b',
    height: 56,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  navDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 20,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
