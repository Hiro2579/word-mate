export const speakEnglish = (text: string): void => {
  const message = new SpeechSynthesisUtterance(text);

  message.lang = "en-US";

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(message);
};