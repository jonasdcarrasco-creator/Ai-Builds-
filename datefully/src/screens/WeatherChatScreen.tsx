import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, Animated, ActivityIndicator, Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ChatMessage, WeatherData } from '../types';
import { useDateStore } from '../store';
import { streamChatMessage } from '../lib/claude';
import { fetchWeather, getDefaultWeather } from '../lib/weather';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import ScreenContainer from '../components/common/ScreenContainer';
import RomanticTipCard from '../components/common/RomanticTip';
import { getTip } from '../data/romanticTips';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'WeatherChat'> };
const { width } = Dimensions.get('window');

const SUGGESTED_REPLIES = ['Make it cheaper', 'More romantic', 'Make it exciting', 'Surprise me', 'Something indoors', 'Outdoor vibes'];

function TypingDots() {
  const d = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  useEffect(() => {
    d.forEach((dot, i) => {
      Animated.loop(Animated.sequence([
        Animated.delay(i * 200),
        Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.delay(500),
      ])).start();
    });
  }, []);
  return (
    <View style={td.row}>
      {d.map((dot, i) => (
        <Animated.View key={i} style={[td.dot, { opacity: dot, transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }] }]} />
      ))}
    </View>
  );
}
const td = StyleSheet.create({ row: { flexDirection: 'row', gap: 5, padding: 6 }, dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.textSecondary } });

export default function WeatherChatScreen({ navigation }: Props) {
  const { userName, userCity, userCoords, budget, timeOfDay, occasion, planningFor, partnerProfile, chatMessages, weatherData, addChatMessage, updateLastMessage, setWeatherData } = useDateStore();
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [hasResponse, setHasResponse] = useState(chatMessages.some((m) => m.role === 'assistant'));
  const [hasError, setHasError] = useState(false);
  const [loadingWeather, setLoadingWeather] = useState(!weatherData);
  const scrollRef = useRef<ScrollView>(null);
  const tip = getTip('weatherChat', planningFor === 'two_men' ? 'him' : planningFor === 'two_women' ? 'her' : 'both');

  const scrollBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  // Load weather on mount
  useEffect(() => {
    if (!weatherData) {
      (async () => {
        setLoadingWeather(true);
        try {
          const wd = userCoords
            ? await fetchWeather(userCoords.lat, userCoords.lon, userCity)
            : getDefaultWeather(userCity);
          setWeatherData(wd);
        } catch {
          setWeatherData(getDefaultWeather(userCity));
        } finally {
          setLoadingWeather(false);
        }
      })();
    }
  }, []);

  // Auto intro on first mount
  useEffect(() => {
    if (chatMessages.length === 0) {
      const wd = weatherData;
      const weatherNote = wd?.isRainy ? " I see it's raining tonight — I'll keep everything indoors." : wd ? ` ${wd.emoji} ${wd.temperature}°F in ${userCity} tonight.` : '';
      const intro = `Hi${userName ? ` ${userName}` : ''}! I'm your Datefully concierge 💛${weatherNote} Ready to plan the perfect ${occasion || 'date'} with your $${budget} budget. What kind of vibe are you going for?`;
      addChatMessage({ id: 'intro', role: 'assistant', content: intro, timestamp: new Date() });
      setHasResponse(true);
    }
  }, [weatherData]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return;
    setHasError(false);
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: text.trim(), timestamp: new Date() };
    addChatMessage(userMsg);
    setInput('');
    scrollBottom();

    const aiMsg: ChatMessage = { id: `a-${Date.now()}`, role: 'assistant', content: '', timestamp: new Date() };
    addChatMessage(aiMsg);
    setStreaming(true);

    let acc = '';
    await streamChatMessage(
      [...chatMessages, userMsg], userName, userCity, budget, timeOfDay, partnerProfile, weatherData,
      (chunk) => { acc += chunk; updateLastMessage(acc); scrollBottom(); },
      () => { setStreaming(false); setHasResponse(true); scrollBottom(); },
      () => { updateLastMessage("Sorry, I'm having trouble connecting. Please try again."); setStreaming(false); setHasError(true); }
    );
  }, [streaming, chatMessages, userName, userCity, budget, timeOfDay, partnerProfile, weatherData]);

  const currentWeather = weatherData;

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.backText}>← Back</Text></TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>Your Date Concierge</Text>
          <View style={s.aiRow}>
            <View style={s.aiDot} />
            <Text style={s.aiLabel}>AI · claude-sonnet-4-6</Text>
          </View>
        </View>
      </View>

      {/* Weather banner */}
      {currentWeather && (
        <View style={[s.weatherBanner, currentWeather.isRainy && s.weatherBannerRain]}>
          <Text style={s.weatherEmoji}>{currentWeather.emoji}</Text>
          <Text style={s.weatherText}>{currentWeather.description}</Text>
          {currentWeather.isRainy && <Text style={s.rainNote}>🏠 Switching to indoor plans</Text>}
        </View>
      )}
      {loadingWeather && (
        <View style={s.weatherLoading}>
          <ActivityIndicator size="small" color={Colors.gold} />
          <Text style={s.weatherLoadingText}>Getting weather for {userCity}...</Text>
        </View>
      )}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Messages */}
        <ScrollView ref={scrollRef} style={s.messageList} contentContainerStyle={s.messageContent} showsVerticalScrollIndicator={false}>
          {chatMessages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const isLast = idx === chatMessages.length - 1;
            const showTyping = streaming && isLast && !isUser && msg.content === '';
            return (
              <View key={msg.id} style={[s.msgRow, isUser ? s.msgRowUser : s.msgRowAI]}>
                {!isUser && <View style={s.aiIcon}><Text style={s.aiIconText}>✦</Text></View>}
                <View style={[s.bubble, isUser ? s.userBubble : s.aiBubble]}>
                  {showTyping ? <TypingDots /> : <Text style={[s.bubbleText, isUser && s.userBubbleText]}>{msg.content}</Text>}
                </View>
              </View>
            );
          })}
          {hasError && (
            <View style={s.errorRow}>
              <Text style={s.errorText}>AI is taking a break.</Text>
              <TouchableOpacity style={s.retryBtn} onPress={() => sendMessage('Hello, help me plan a date')}>
                <Text style={s.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Suggested replies */}
        {hasResponse && !streaming && (
          <ScrollView horizontal style={s.suggestRow} contentContainerStyle={s.suggestContent} showsHorizontalScrollIndicator={false}>
            {SUGGESTED_REPLIES.map((r) => (
              <TouchableOpacity key={r} style={s.suggestChip} onPress={() => sendMessage(r)} activeOpacity={0.8}>
                <Text style={s.suggestText}>{r}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Input */}
        <View style={s.inputRow}>
          <TextInput
            style={s.input} value={input} onChangeText={setInput}
            placeholder="Ask anything..." placeholderTextColor={Colors.textMuted}
            multiline maxLength={500}
          />
          <TouchableOpacity
            style={[s.sendBtn, (!input.trim() || streaming) && s.sendBtnOff]}
            onPress={() => sendMessage(input)} disabled={!input.trim() || streaming}
          >
            {streaming ? <ActivityIndicator size="small" color={Colors.black} /> : <Text style={s.sendIcon}>↑</Text>}
          </TouchableOpacity>
        </View>

        {/* Plan CTA */}
        {hasResponse && (
          <TouchableOpacity style={s.planBtn} onPress={() => navigation.navigate('DateOptions')} activeOpacity={0.88}>
            <Text style={s.planBtnText}>Plan my date →</Text>
          </TouchableOpacity>
        )}

        <RomanticTipCard tip={tip} />
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.screen, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder, gap: Spacing.md },
  backText: { color: Colors.gold, fontSize: Typography.base },
  headerCenter: { flex: 1 },
  headerTitle: { fontFamily: Typography.heading, fontSize: Typography.lg, color: Colors.textPrimary },
  aiRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  aiDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  aiLabel: { fontSize: Typography.xs, color: Colors.textMuted },
  weatherBanner: {
    flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6,
    backgroundColor: 'rgba(201,168,76,0.08)', borderBottomWidth: 1, borderBottomColor: 'rgba(201,168,76,0.2)',
    paddingHorizontal: Spacing.screen, paddingVertical: Spacing.sm,
  },
  weatherBannerRain: { backgroundColor: 'rgba(52,152,219,0.08)', borderBottomColor: 'rgba(52,152,219,0.2)' },
  weatherEmoji: { fontSize: 18 },
  weatherText: { color: Colors.textSecondary, fontSize: Typography.sm, flex: 1 },
  rainNote: { color: '#3498db', fontSize: Typography.xs, fontWeight: Typography.semibold },
  weatherLoading: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.sm, paddingHorizontal: Spacing.screen },
  weatherLoadingText: { color: Colors.textMuted, fontSize: Typography.xs },
  messageList: { flex: 1 },
  messageContent: { padding: Spacing.screen, gap: Spacing.md },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.xs },
  msgRowUser: { justifyContent: 'flex-end' },
  msgRowAI: { justifyContent: 'flex-start' },
  aiIcon: { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(201,168,76,0.15)', alignItems: 'center', justifyContent: 'center' },
  aiIconText: { color: Colors.gold, fontSize: 11 },
  bubble: { maxWidth: width * 0.72, borderRadius: BorderRadius.xl, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  userBubble: { backgroundColor: '#2a2000', borderWidth: 1, borderColor: 'rgba(201,168,76,0.25)', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder, borderBottomLeftRadius: 4 },
  bubbleText: { color: Colors.textSecondary, fontSize: Typography.base, lineHeight: 22 },
  userBubbleText: { color: Colors.textPrimary },
  errorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.md, paddingVertical: Spacing.md },
  errorText: { color: Colors.error, fontSize: Typography.sm },
  retryBtn: { backgroundColor: Colors.card, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  retryText: { color: Colors.gold, fontSize: Typography.sm, fontWeight: Typography.semibold },
  suggestRow: { maxHeight: 50 },
  suggestContent: { paddingHorizontal: Spacing.screen, gap: Spacing.xs, alignItems: 'center' },
  suggestChip: { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: BorderRadius.pill, paddingHorizontal: Spacing.md, paddingVertical: 7 },
  suggestText: { color: Colors.textSecondary, fontSize: Typography.sm },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: Spacing.screen, paddingVertical: Spacing.sm, gap: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.cardBorder },
  input: { flex: 1, backgroundColor: Colors.inputBackground, borderWidth: 1, borderColor: Colors.inputBorder, borderRadius: BorderRadius.xl, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, color: Colors.textPrimary, fontSize: Typography.base, maxHeight: 120 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.gold, alignItems: 'center', justifyContent: 'center' },
  sendBtnOff: { backgroundColor: Colors.cardAlt },
  sendIcon: { color: Colors.black, fontSize: 18, fontWeight: Typography.bold },
  planBtn: { marginHorizontal: Spacing.screen, marginBottom: Spacing.xs, backgroundColor: Colors.red, borderRadius: BorderRadius.lg, paddingVertical: Spacing.md, alignItems: 'center' },
  planBtnText: { color: Colors.white, fontSize: Typography.base, fontWeight: Typography.bold, letterSpacing: 0.5 },
});
