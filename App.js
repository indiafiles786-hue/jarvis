import React, { useState, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { GEMINI_API_KEY, GEMINI_MODEL } from "./config";

const PURPLE_DARK = "#1A0B2E";
const PURPLE_MID = "#3B1E6B";
const PURPLE_ACCENT = "#8B5CF6";
const PURPLE_GLOW = "#A78BFA";
const WHITE = "#FFFFFF";
const OFFWHITE = "#F3EEFB";

const SYSTEM_PROMPT =
  "You are an expert tutor for Indian 11th & 12th grade NCERT students preparing for NEET and JEE Advanced. " +
  "When given a question (as text or a photo of a question), solve it with clear, correct, step-by-step reasoning. " +
  "Show the concept/formula used, the full working, and end with a clearly marked final answer. " +
  "Keep explanations exam-focused and easy to follow.";

export default function App() {
  const [screen, setScreen] = useState("welcome"); // welcome | chat
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [pendingImage, setPendingImage] = useState(null); // { uri, base64 }
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const pickImage = async (fromCamera) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) return;

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ base64: true, quality: 0.6 })
      : await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.6 });

    if (!result.canceled && result.assets && result.assets[0]) {
      setPendingImage({
        uri: result.assets[0].uri,
        base64: result.assets[0].base64,
        mimeType: result.assets[0].mimeType || "image/jpeg",
      });
    }
  };

  const sendMessage = async () => {
    if (!input.trim() && !pendingImage) return;
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "PASTE_YOUR_API_KEY_HERE") {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "⚠️ No API key set. Open config.js and paste your free Gemini API key from aistudio.google.com/apikey",
        },
      ]);
      return;
    }

    const userMsg = {
      role: "user",
      text: input.trim(),
      image: pendingImage ? pendingImage.uri : null,
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    const imageToSend = pendingImage;
    setPendingImage(null);
    setLoading(true);

    try {
      const parts = [];
      if (userMsg.text) parts.push({ text: userMsg.text });
      if (!userMsg.text && imageToSend) {
        parts.push({ text: "Solve this question." });
      }
      if (imageToSend) {
        parts.push({
          inline_data: {
            mime_type: imageToSend.mimeType,
            data: imageToSend.base64,
          },
        });
      }

      const body = {
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts }],
      };

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json();

      let replyText = "Sorry, I couldn't parse a response. Try again.";
      if (data?.candidates?.[0]?.content?.parts) {
        replyText = data.candidates[0].content.parts
          .map((p) => p.text || "")
          .join("\n");
      } else if (data?.error?.message) {
        replyText = `⚠️ API error: ${data.error.message}`;
      }

      setMessages((prev) => [...prev, { role: "assistant", text: replyText }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: `⚠️ Network/error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  if (screen === "welcome") {
    return (
      <LinearGradient colors={[PURPLE_DARK, PURPLE_MID, "#5B2A9E"]} style={styles.flex}>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.welcomeContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="sparkles" size={44} color={WHITE} />
          </View>
          <Text style={styles.appTitle}>SolveGenius</Text>
          <Text style={styles.appSubtitle}>
            NEET · JEE Advanced · NCERT 11th & 12th{"\n"}Snap a question. Get it solved.
          </Text>

          <TouchableOpacity
            style={styles.guestButton}
            activeOpacity={0.85}
            onPress={() => setScreen("chat")}
          >
            <LinearGradient
              colors={[PURPLE_ACCENT, "#6D28D9"]}
              style={styles.guestButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="person-circle-outline" size={20} color={WHITE} />
              <Text style={styles.guestButtonText}>Continue as Guest</Text>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.noLoginNote}>No sign-up. No login. Just start solving.</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[PURPLE_DARK, "#241246"]} style={styles.flex}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.flex}>
        <View style={styles.header}>
          <Ionicons name="sparkles" size={20} color={PURPLE_GLOW} />
          <Text style={styles.headerTitle}>SolveGenius</Text>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={80}
        >
          <ScrollView
            ref={scrollRef}
            style={styles.chatArea}
            contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="chatbubble-ellipses-outline" size={40} color={PURPLE_GLOW} />
                <Text style={styles.emptyStateText}>
                  Type a question or upload a photo to begin.
                </Text>
              </View>
            )}

            {messages.map((msg, idx) => (
              <View
                key={idx}
                style={[
                  styles.bubbleRow,
                  { justifyContent: msg.role === "user" ? "flex-end" : "flex-start" },
                ]}
              >
                <View
                  style={[
                    styles.bubble,
                    msg.role === "user" ? styles.userBubble : styles.assistantBubble,
                  ]}
                >
                  {msg.image && (
                    <Image source={{ uri: msg.image }} style={styles.messageImage} />
                  )}
                  {!!msg.text && (
                    <Text
                      style={msg.role === "user" ? styles.userText : styles.assistantText}
                    >
                      {msg.text}
                    </Text>
                  )}
                </View>
              </View>
            ))}

            {loading && (
              <View style={[styles.bubbleRow, { justifyContent: "flex-start" }]}>
                <View style={[styles.bubble, styles.assistantBubble]}>
                  <ActivityIndicator color={PURPLE_ACCENT} />
                </View>
              </View>
            )}
          </ScrollView>

          {pendingImage && (
            <View style={styles.pendingImageBar}>
              <Image source={{ uri: pendingImage.uri }} style={styles.pendingThumb} />
              <Text style={styles.pendingImageText}>Photo attached</Text>
              <TouchableOpacity onPress={() => setPendingImage(null)}>
                <Ionicons name="close-circle" size={22} color={OFFWHITE} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputBar}>
            <TouchableOpacity style={styles.iconButton} onPress={() => pickImage(false)}>
              <Ionicons name="image-outline" size={22} color={PURPLE_GLOW} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => pickImage(true)}>
              <Ionicons name="camera-outline" size={22} color={PURPLE_GLOW} />
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              placeholder="Ask a question..."
              placeholderTextColor="#9CA3AF"
              value={input}
              onChangeText={setInput}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={loading}>
              <LinearGradient
                colors={[PURPLE_ACCENT, "#6D28D9"]}
                style={styles.sendButtonGradient}
              >
                <Ionicons name="send" size={18} color={WHITE} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  welcomeContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(139,92,246,0.25)",
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.5)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: WHITE,
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 14,
    color: OFFWHITE,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
    opacity: 0.85,
  },
  guestButton: { marginTop: 40, width: "100%", borderRadius: 16, overflow: "hidden" },
  guestButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  guestButtonText: { color: WHITE, fontSize: 16, fontWeight: "700" },
  noLoginNote: { color: "#C4B5FD", fontSize: 12, marginTop: 14, opacity: 0.8 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(167,139,250,0.2)",
  },
  headerTitle: { color: WHITE, fontSize: 18, fontWeight: "700" },

  chatArea: { flex: 1 },
  emptyState: { alignItems: "center", marginTop: 80, gap: 12, opacity: 0.7 },
  emptyStateText: { color: OFFWHITE, fontSize: 13 },

  bubbleRow: { flexDirection: "row", marginBottom: 12 },
  bubble: { maxWidth: "82%", borderRadius: 18, padding: 12 },
  userBubble: { backgroundColor: PURPLE_ACCENT, borderBottomRightRadius: 4 },
  assistantBubble: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(167,139,250,0.25)",
    borderBottomLeftRadius: 4,
  },
  userText: { color: WHITE, fontSize: 14, lineHeight: 20 },
  assistantText: { color: OFFWHITE, fontSize: 14, lineHeight: 20 },
  messageImage: { width: 200, height: 200, borderRadius: 12, marginBottom: 6 },

  pendingImageBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(139,92,246,0.15)",
  },
  pendingThumb: { width: 36, height: 36, borderRadius: 8 },
  pendingImageText: { color: OFFWHITE, fontSize: 12, flex: 1 },

  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(167,139,250,0.2)",
  },
  iconButton: { padding: 6 },
  textInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: WHITE,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: { borderRadius: 20, overflow: "hidden" },
  sendButtonGradient: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
});
