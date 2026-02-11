// ============================================
// AI VOICE ASSISTANT SERVICE
// ============================================
// Professional, context-aware voice guidance
// OFF by default, user-controlled, non-intrusive
// ============================================

export class VoiceAssistant {
  private synthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private enabled: boolean = false;
  private volume: number = 0.8;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      // Load preferences from localStorage
      this.loadPreferences();
    }
  }

  /**
   * Load voice preferences from localStorage
   */
  private loadPreferences() {
    try {
      const savedEnabled = localStorage.getItem('voiceAssistant_enabled');
      const savedVolume = localStorage.getItem('voiceAssistant_volume');
      
      this.enabled = savedEnabled === 'true';
      this.volume = savedVolume ? parseFloat(savedVolume) : 0.8;
    } catch (error) {
      console.log('Voice preferences not available');
    }
  }

  /**
   * Save voice preferences to localStorage
   */
  private savePreferences() {
    try {
      localStorage.setItem('voiceAssistant_enabled', String(this.enabled));
      localStorage.setItem('voiceAssistant_volume', String(this.volume));
    } catch (error) {
      console.log('Could not save voice preferences');
    }
  }

  /**
   * Enable or disable voice assistant
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    this.savePreferences();
    
    // Stop any ongoing speech when disabled
    if (!enabled) {
      this.stop();
    }
  }

  /**
   * Check if voice is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.savePreferences();
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Stop any ongoing speech
   */
  stop() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.currentUtterance = null;
    }
  }

  /**
   * Speak a message (only if enabled)
   */
  speak(message: string, priority: 'normal' | 'high' = 'normal') {
    // Don't speak if disabled or browser doesn't support it
    if (!this.enabled || !this.synthesis) {
      return;
    }

    // Stop current speech if high priority
    if (priority === 'high') {
      this.stop();
    }

    // Don't interrupt if already speaking (unless high priority)
    if (priority === 'normal' && this.synthesis.speaking) {
      return;
    }

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.volume = this.volume;
    utterance.rate = 0.95; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    // Use a professional, calm voice if available
    const voices = this.synthesis.getVoices();
    const preferredVoice = voices.find(
      (voice) =>
        voice.lang.includes('en') &&
        (voice.name.includes('Female') || voice.name.includes('Samantha'))
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    this.currentUtterance = utterance;
    this.synthesis.speak(utterance);

    console.log('🔊 Voice Assistant:', message);
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.synthesis?.speaking || false;
  }
}

// ============================================
// VOICE MESSAGES - CONTEXT-AWARE & PROFESSIONAL
// ============================================

export const VoiceMessages = {
  // Welcome & Help
  welcome: "Welcome to the ID Card Generator. I'm here to help guide you through the process.",
  helpFirstTime: "Let me explain how this works. Choose a mode: Single Employee for one card, Bulk Upload for multiple cards, or Employee Database to manage saved records.",
  
  // Bulk Upload
  bulkUploadSuccess: (count: number) => 
    `Success. ${count} employee ${count === 1 ? 'record' : 'records'} loaded and ready for export.`,
  bulkUploadPartialSuccess: (valid: number, invalid: number) => 
    `${valid} records loaded successfully. ${invalid} ${invalid === 1 ? 'row has' : 'rows have'} errors. Check the details below.`,
  bulkUploadError: (reason: string) => 
    `Upload failed. ${reason}. Please check your file and try again.`,
  sampleDownloaded: "Sample CSV file downloaded. Use this as a template for your bulk upload.",

  // Template System
  templateApplied: (templateName: string) => 
    `${templateName} template applied to all cards.`,
  templateReset: "Template reset to default design.",
  backTextUpdated: "Back side text has been updated successfully.",

  // Export
  exportSuccess: (count: number) => 
    `Export complete. ${count} ID ${count === 1 ? 'card' : 'cards'} ready for download.`,
  exportSingleSuccess: "ID card exported successfully. Check your downloads folder.",
  exportError: "Export failed. Please try again or check your browser settings.",

  // Form Validation
  formIncomplete: "Please fill in all required fields before exporting.",
  photoRequired: "Please upload an employee photo to continue.",
  photoProcessing: "Processing photo. Background removal in progress.",
  photoReady: "Photo ready. Your ID card preview has been updated.",

  // Database
  employeeSaved: "Employee record saved to database.",
  employeeDeleted: "Employee record deleted.",
  searchResults: (count: number) => 
    count === 0 
      ? "No matching employees found." 
      : `${count} ${count === 1 ? 'employee' : 'employees'} found.`,

  // Errors
  errorGeneric: "Something went wrong. Please try again.",
  errorNetwork: "Network error. Please check your connection and try again.",
};

// Global instance
export const voiceAssistant = new VoiceAssistant();
