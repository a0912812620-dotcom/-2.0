/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface OnboardingProfile {
  gender: 'male' | 'female' | 'private' | '';
  age: string;
  bloodType: 'A' | 'B' | 'O' | 'AB' | '';
  hasChronic: boolean;
  chronicType: string;
}

export interface EmergencyContact {
  contactName: string;
  relationship: string;
  contactPhone: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export interface MedicationReminder {
  id: string;
  title: string;
  time: string; // "HH:MM" format
  isActive: boolean;
  isTriggered: boolean;
  triggerTimeSec?: number; // Optional quick test timer remaining seconds
}
