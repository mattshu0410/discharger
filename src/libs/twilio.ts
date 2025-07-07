import type { CountryCode } from 'libphonenumber-js';
import { isValidPhoneNumber, parsePhoneNumberWithError } from 'libphonenumber-js';
import twilio from 'twilio';
import { logger } from '@/libs/Logger';

type SendSMSParams = {
  to: string;
  message: string;
};

type SendSMSResult = {
  success: boolean;
  messageId?: string;
  error?: string;
};

class TwilioService {
  private client: twilio.Twilio | null = null;
  private fromNumber: string;

  constructor() {
    const accountSid = process.env.NEXT_TWILIO_ACCOUNT_SID;
    const authToken = process.env.NEXT_TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.NEXT_TWILIO_PHONE_NUMBER || '';

    if (!accountSid || !authToken || !this.fromNumber) {
      logger.warn('Twilio credentials not configured. SMS functionality will be disabled.');
      return;
    }

    try {
      this.client = twilio(accountSid, authToken);
      logger.info('Twilio client initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Twilio client:', error);
    }
  }

  /**
   * Validates and formats a phone number to E.164 format
   */
  validateAndFormatPhoneNumber(phoneNumber: string, defaultCountry: CountryCode = 'AU'): string | null {
    try {
      if (!isValidPhoneNumber(phoneNumber, defaultCountry)) {
        return null;
      }

      const parsed = parsePhoneNumberWithError(phoneNumber, defaultCountry);
      return parsed?.format('E.164') || null;
    } catch (error) {
      logger.error('Phone number validation error:', error);
      return null;
    }
  }

  /**
   * Sends an SMS message
   */
  async sendSMS({ to, message }: SendSMSParams): Promise<SendSMSResult> {
    if (!this.client) {
      return {
        success: false,
        error: 'Twilio client not initialized. Check your credentials.',
      };
    }

    // Validate and format phone number
    const formattedNumber = this.validateAndFormatPhoneNumber(to);
    if (!formattedNumber) {
      return {
        success: false,
        error: 'Invalid phone number format.',
      };
    }

    try {
      logger.info('Sending SMS', { to: formattedNumber, messageLength: message.length });

      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: formattedNumber,
      });

      logger.info('SMS sent successfully', {
        messageId: result.sid,
        status: result.status,
        to: formattedNumber,
      });

      return {
        success: true,
        messageId: result.sid,
      };
    } catch (error: any) {
      logger.error('Failed to send SMS:', {
        error: error.message,
        code: error.code,
        to: formattedNumber,
      });

      return {
        success: false,
        error: error.message || 'Failed to send SMS',
      };
    }
  }

  /**
   * Creates a patient access SMS message
   */
  createPatientAccessMessage(patientName: string, accessUrl: string, role: string): string {
    const roleText = role === 'patient' ? 'patient' : 'caregiver';

    return `Hi! You've been given access to ${patientName}'s discharge summary as their ${roleText}. View it here: ${accessUrl}

This link is secure and private. If you didn't expect this message, please ignore it.`;
  }

  /**
   * Sends a patient access SMS
   */
  async sendPatientAccessSMS(
    phoneNumber: string,
    patientName: string,
    accessUrl: string,
    role: 'patient' | 'caregiver',
  ): Promise<SendSMSResult> {
    const message = this.createPatientAccessMessage(patientName, accessUrl, role);

    return this.sendSMS({
      to: phoneNumber,
      message,
    });
  }
}

// Export singleton instance
export const twilioService = new TwilioService();
export default twilioService;
