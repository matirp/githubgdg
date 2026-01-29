
import { GoogleGenAI } from "@google/genai";

export const getCoachingFeedback = async (drill: string, metrics: any) => {
  try {
    // Always use process.env.API_KEY directly for initialization
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let prompt = "";
    if (drill === 'Push-ups') {
      prompt = `Athlete is performing push-ups. Current Session Stats: Total Reps: ${metrics.count}. Recent form: Elbow angle reached ${metrics.minElbowAngle.toFixed(0)}°, Hip alignment ${metrics.hipAngle.toFixed(0)}°. 
      Guidelines: Good depth is <90°. Back alignment 160-190°. 
      Provide 1 short coaching tip or encouragement (max 12 words).`;
    } else if (drill === 'Squats') {
      prompt = `Athlete is performing squats. Current Session Stats: Total Reps: ${metrics.count}. Recent form: Knee angle reached ${metrics.minKneeAngle.toFixed(0)}°, Back alignment ${metrics.backAngle.toFixed(0)}°.
      Guidelines: Good depth <100°. Back alignment >160°.
      Provide 1 short coaching tip or encouragement (max 12 words).`;
    } else if (drill === 'Bicep Curls') {
      prompt = `Athlete is performing bicep curls. Total Reps: ${metrics.count}. Form: Elbow angle reached ${metrics.minElbowAngle.toFixed(0)}°.
      Guidelines: Full range of motion, keep elbows tucked. 
      Provide 1 short coaching tip (max 12 words).`;
    } else if (drill === 'Reverse Lunges') {
      prompt = `Athlete is performing lunges. Total Reps: ${metrics.count}. Form: Knee angle reached ${metrics.minKneeAngle.toFixed(0)}°.
      Guidelines: 90 degrees at the bottom. 
      Provide 1 short coaching tip (max 12 words).`;
    } else if (drill === 'Single Leg Balance') {
      prompt = `Athlete is balancing. Current duration ${metrics.count}s.
      Provide 1 short tip on focus and stability (max 12 words).`;
    } else if (drill === 'Plank Hold') {
      prompt = `Athlete is in a plank. Current duration ${metrics.count}s.
      Provide 1 short tip on core engagement or back position (max 12 words).`;
    }

    if (!prompt) return "Keep moving, you're doing great!";

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are an elite athletic coach providing real-time audio cues. Be concise, technical, and motivating.",
      }
    });

    // Access text property directly without calling it as a method
    return response.text || "Solid work, keep it up!";
  } catch (error) {
    console.error("Gemini Coaching Error:", error);
    return "Stay focused on your form!";
  }
};

export const speakText = (text: string) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => (v.name.includes('Google') || v.name.includes('Premium')) && v.lang.startsWith('en'));
    if (preferredVoice) utterance.voice = preferredVoice;
    window.speechSynthesis.speak(utterance);
  }
};
