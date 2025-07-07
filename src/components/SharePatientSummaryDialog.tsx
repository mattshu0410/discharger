'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Phone, Send, User, Users } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useSendPatientAccessSMS } from '@/api/patient-access-keys/hooks';
import { AccessKeyRoleSchema, PhoneNumberSchema } from '@/api/patient-access-keys/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ShareFormSchema = z.object({
  phone_number: PhoneNumberSchema,
  role: AccessKeyRoleSchema,
  patient_name: z.string().min(1, 'Patient name is required'),
});

type ShareFormData = z.infer<typeof ShareFormSchema>;

type SharePatientSummaryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summaryId: string;
  patientName: string;
};

export function SharePatientSummaryDialog({
  open,
  onOpenChange,
  summaryId,
  patientName,
}: SharePatientSummaryDialogProps) {
  const [selectedRole, setSelectedRole] = useState<'patient' | 'caregiver'>('patient');
  const sendSMSMutation = useSendPatientAccessSMS();

  const form = useForm<ShareFormData>({
    resolver: zodResolver(ShareFormSchema),
    defaultValues: {
      phone_number: '',
      role: 'patient',
      patient_name: patientName,
    },
  });

  const onSubmit = async (data: ShareFormData) => {
    try {
      const result = await sendSMSMutation.mutateAsync({
        summary_id: summaryId,
        phone_number: data.phone_number,
        role: selectedRole,
        patient_name: data.patient_name,
      });

      if (result.success) {
        // Reset form and close dialog
        form.reset();
        setSelectedRole('patient');
        onOpenChange(false);
      }
    } catch (error) {
      // Error handling is done in the hook
      console.error('SMS sending failed:', error);
    }
  };

  const handleRoleSelect = (role: 'patient' | 'caregiver') => {
    setSelectedRole(role);
    form.setValue('role', role);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Patient Summary</DialogTitle>
          <DialogDescription>
            Send a secure link to the patient or their caregiver via SMS.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Patient Name Field */}
            <FormField
              control={form.control}
              name="patient_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter patient name"
                      disabled={sendSMSMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Number Field */}
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type="tel"
                        placeholder="+61 4XX XXX XXX"
                        className="pl-10"
                        disabled={sendSMSMutation.isPending}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role Selection */}
            <div className="space-y-3">
              <Label>Role</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('patient')}
                  disabled={sendSMSMutation.isPending}
                  className="flex-1"
                >
                  <Badge
                    variant={selectedRole === 'patient' ? 'default' : 'outline'}
                    className="w-full justify-center gap-2 py-2 px-4 cursor-pointer hover:bg-accent"
                  >
                    <User className="w-4 h-4" />
                    Patient
                  </Badge>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect('caregiver')}
                  disabled={sendSMSMutation.isPending}
                  className="flex-1"
                >
                  <Badge
                    variant={selectedRole === 'caregiver' ? 'default' : 'outline'}
                    className="w-full justify-center gap-2 py-2 px-4 cursor-pointer hover:bg-accent"
                  >
                    <Users className="w-4 h-4" />
                    Caregiver
                  </Badge>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={sendSMSMutation.isPending}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={sendSMSMutation.isPending}
                className="flex-1"
              >
                {sendSMSMutation.isPending
                  ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Sending...
                      </>
                    )
                  : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send SMS
                      </>
                    )}
              </Button>
            </div>
          </form>
        </Form>

        {/* Information Text */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
          <p>
            A secure link will be sent to the provided phone number. The recipient can access
            the patient summary without creating an account.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
