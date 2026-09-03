/**
 * ElevenLabs Voiceover & Text-to-Speech Service
 */

const DEFAULT_VOICE_ID = "pNInz6obpgDQGcFmaJgB"; // Adam - Deep Narrator

export const CURATED_VOICES = [
  { id: "pNInz6obpgDQGcFmaJgB", name: "Adam", category: "Deep Movie Narrator", gender: "Male" },
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", category: "Calm Documentary", gender: "Female" },
  { id: "ErXwobaYiN019PkySvjV", name: "Antoni", category: "Cinematic Trailer", gender: "Male" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella", category: "Warm Storyteller", gender: "Female" },
  { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh", category: "Commercial Host", gender: "Male" },
];

export const ElevenLabsService = {
  /**
   * Test an ElevenLabs API key by requesting account user info
   */
  async testApiKey(apiKey) {
    if (!apiKey) throw new Error("Missing ElevenLabs API key");
    const res = await fetch("https://api.elevenlabs.io/v1/user", {
      headers: { "xi-api-key": apiKey.trim() },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail?.message || err.detail || `Invalid ElevenLabs key (HTTP ${res.status})`);
    }
    const data = await res.json();
    return {
      isValid: true,
      characterCount: data.subscription?.character_count || 0,
      characterLimit: data.subscription?.character_limit || 0,
      tier: data.subscription?.tier || "free",
    };
  },

  /**
   * Generate speech MP3 buffer and return as base64 data URL
   */
  async generateSpeech({ text, voiceId = DEFAULT_VOICE_ID, apiKey }) {
    if (!text || !text.trim()) {
      throw new Error("Text content is required for voiceover generation");
    }
    if (!apiKey) {
      throw new Error("ElevenLabs API key is required");
    }

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey.trim(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text.trim(),
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.35,
          use_speaker_boost: true,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail?.message || err.detail || `ElevenLabs synthesis failed (${res.status})`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Audio = buffer.toString("base64");
    const dataUrl = `data:audio/mp3;base64,${base64Audio}`;

    return {
      audioUrl: dataUrl,
      sizeBytes: buffer.length,
      voiceId,
    };
  },
};

export default ElevenLabsService;
