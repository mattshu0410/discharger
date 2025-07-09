'use client';

import type { PatientAccessKey } from '@/api/patient-access-keys/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, FileDown, MessageSquare, Phone, Printer, QrCode, Send, Trash2, User, Users } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { usePDF } from 'react-to-pdf';
import { toast } from 'sonner';
import { z } from 'zod';
import { useDeactivateAccessKey, useGenerateQRCode, usePatientAccessKeys, useSendPatientAccessSMS } from '@/api/patient-access-keys/hooks';
import { AccessKeyRoleSchema, PhoneNumberSchema } from '@/api/patient-access-keys/types';
import { usePatientSummary } from '@/api/patient-summaries/hooks';
import { PatientSummaryPDF } from '@/components/PatientSimplified';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
  const [accessPanelOpen, setAccessPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('text-patient');
  const [qrCodeData, setQRCodeData] = useState<{ accessUrl: string; role: 'patient' | 'caregiver' } | null>(null);
  const sendSMSMutation = useSendPatientAccessSMS();
  const generateQRCodeMutation = useGenerateQRCode();
  const { data: accessKeysResponse, isLoading: accessKeysLoading, error: accessKeysError } = usePatientAccessKeys(summaryId);
  const deactivateAccessKeyMutation = useDeactivateAccessKey();

  // Fetch patient summary for PDF generation
  const { data: summaryData } = usePatientSummary(summaryId);

  // PDF generation hook
  const { toPDF, targetRef } = usePDF({
    filename: `${patientName.replace(/\s+/g, '-').toLowerCase()}-discharge-summary-${format(new Date(), 'yyyy-MM-dd')}.pdf`,
    page: {
      format: 'A4',
      margin: { top: 20, right: 20, bottom: 20, left: 20 },
    },
  });

  const accessKeys = accessKeysResponse?.success ? accessKeysResponse.access_keys || [] : [];

  const form = useForm<ShareFormData>({
    resolver: zodResolver(ShareFormSchema),
    defaultValues: {
      phone_number: '',
      role: 'patient',
      patient_name: patientName,
    },
  });

  // Update patient name when prop changes
  useEffect(() => {
    form.setValue('patient_name', patientName);
  }, [patientName, form]);

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

  const handleGenerateQRCode = async (role: 'patient' | 'caregiver') => {
    try {
      const result = await generateQRCodeMutation.mutateAsync({
        summary_id: summaryId,
        role,
      });

      if (result.success && result.access_url) {
        setQRCodeData({
          accessUrl: result.access_url,
          role,
        });
      }
    } catch (error) {
      console.error('QR code generation failed:', error);
    }
  };

  const handleRemoveAccess = async (_accessKey: PatientAccessKey) => {
    // if (confirm(`Remove access for ${accessKey.phone_number}?`)) {
    //   try {
    //     await deactivateAccessKeyMutation.mutateAsync({
    //       access_key_id: accessKey.id,
    //     });
    //   } catch (error) {
    //     // Error handling is done in the hook
    //     console.error('Failed to remove access:', error);
    //   }
    // }
  };

  const handleGeneratePDF = async () => {
    try {
      await toPDF();
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Simple formatting for display - assumes E.164 format
    if (phone && phone.startsWith('+61')) {
      const number = phone.slice(3);
      if (number.length === 9) {
        return `+61 ${number.slice(0, 1)} ${number.slice(1, 5)} ${number.slice(5)}`;
      }
    }
    return phone || '';
  };

  const getRoleIcon = (role: 'patient' | 'caregiver') => {
    return role === 'patient'
      ? (
          <User className="w-3 h-3" />
        )
      : (
          <Users className="w-3 h-3" />
        );
  };

  const getRoleBadgeVariant = (role: 'patient' | 'caregiver') => {
    return role === 'patient' ? 'default' : 'secondary';
  };

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Share Patient Summary</DialogTitle>
            <DialogDescription>
              Share the patient summary via SMS, QR code, or print.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="text-patient" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Text Patient
              </TabsTrigger>
              <TabsTrigger value="qr-code" className="flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                QR Code
              </TabsTrigger>
              <TabsTrigger value="pdf-print" className="flex items-center gap-2">
                <Printer className="w-4 h-4" />
                PDF Print
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text-patient" className="mt-6">
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
            </TabsContent>

            <TabsContent value="qr-code" className="mt-6">
              <div className="space-y-6">
                {/* Role Selection for QR Code */}
                <div className="space-y-3">
                  <Label>Select Role</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedRole === 'patient' ? 'default' : 'outline'}
                      onClick={() => setSelectedRole('patient')}
                      className="flex-1"
                      disabled={generateQRCodeMutation.isPending}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Patient
                    </Button>
                    <Button
                      variant={selectedRole === 'caregiver' ? 'default' : 'outline'}
                      onClick={() => setSelectedRole('caregiver')}
                      className="flex-1"
                      disabled={generateQRCodeMutation.isPending}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Caregiver
                    </Button>
                  </div>
                </div>

                {/* QR Code Display */}
                {qrCodeData && qrCodeData.role === selectedRole
                  ? (
                      <div className="text-center space-y-4">
                        <div className="bg-white p-6 rounded-lg border inline-block">
                          <QRCodeSVG
                            value={qrCodeData.accessUrl}
                            size={200}
                            level="M"
                            marginSize={4}
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            QR Code for
                            {' '}
                            {qrCodeData.role === 'patient' ? 'Patient' : 'Caregiver'}
                            {' '}
                            Access
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Scan this QR code to access the patient summary
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => handleGenerateQRCode(selectedRole)}
                          disabled={generateQRCodeMutation.isPending}
                        >
                          <QrCode className="w-4 h-4 mr-2" />
                          Generate New QR Code
                        </Button>
                      </div>
                    )
                  : (
                      <div className="text-center py-12">
                        <QrCode className="w-24 h-24 mx-auto mb-6 text-muted-foreground/50" />
                        <h3 className="text-lg font-semibold mb-2">QR Code Sharing</h3>
                        <p className="text-muted-foreground mb-6">
                          Generate a QR code that
                          {' '}
                          {selectedRole === 'patient' ? 'patients' : 'caregivers'}
                          {' '}
                          can scan to access the summary.
                        </p>
                        <Button
                          onClick={() => handleGenerateQRCode(selectedRole)}
                          disabled={generateQRCodeMutation.isPending}
                          variant="outline"
                        >
                          {generateQRCodeMutation.isPending
                            ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                  Generating...
                                </>
                              )
                            : (
                                <>
                                  <QrCode className="w-4 h-4 mr-2" />
                                  Generate QR Code
                                </>
                              )}
                        </Button>
                      </div>
                    )}

                {/* Information Text */}
                <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
                  <p>
                    The QR code provides secure access to the patient summary. Each QR code is unique and
                    can be scanned with any QR code reader app.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pdf-print" className="mt-6">
              <div className="text-center py-12">
                <Printer className="w-24 h-24 mx-auto mb-6 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">PDF Print</h3>
                <p className="text-muted-foreground mb-6">
                  Generate a printable PDF version of the patient summary.
                </p>
                <Button
                  variant="outline"
                  onClick={handleGeneratePDF}
                  disabled={!summaryData}
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                {!summaryData && (
                  <div className="text-xs text-muted-foreground mt-4">
                    Loading patient summary data...
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-4">
                  The PDF will include all medications, tasks, appointments, and important instructions.
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Access Management Section - Only show on Text Patient tab */}
          {activeTab === 'text-patient' && (
            <div className="border-t pt-4">
              <Collapsible open={accessPanelOpen} onOpenChange={setAccessPanelOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-between"
                    disabled={accessKeysLoading}
                  >
                    <span className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Access Management
                      {accessKeys.length > 0 && (
                        <Badge variant="outline" className="ml-1">
                          {accessKeys.length}
                        </Badge>
                      )}
                    </span>
                    {accessPanelOpen
                      ? (
                          <ChevronUp className="w-4 h-4" />
                        )
                      : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-3">
                  {accessKeysLoading
                    ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="w-6 h-6 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                          <span className="ml-3 text-muted-foreground">Loading access keys...</span>
                        </div>
                      )
                    : accessKeysError
                      ? (
                          <div className="text-center py-8 text-destructive">
                            Failed to load access keys
                          </div>
                        )
                      : accessKeys.length === 0
                        ? (
                            <div className="text-center py-8 text-muted-foreground">
                              <Phone className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                              <p className="text-sm">No shared access yet</p>
                              <p className="text-xs">Use the form above to send SMS links</p>
                            </div>
                          )
                        : (
                            <div className="border rounded-md">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Phone Number</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Shared</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {accessKeys.map(accessKey => (
                                    <TableRow key={accessKey.id}>
                                      <TableCell className="font-mono text-sm">
                                        {formatPhoneNumber(accessKey.phone_number)}
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          variant={getRoleBadgeVariant(accessKey.role)}
                                          className="gap-1"
                                        >
                                          {getRoleIcon(accessKey.role)}
                                          {accessKey.role === 'patient' ? 'Patient' : 'Caregiver'}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-sm text-muted-foreground">
                                        {format(new Date(accessKey.created_at), 'MMM d, yyyy')}
                                      </TableCell>
                                      <TableCell>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleRemoveAccess(accessKey)}
                                              disabled={deactivateAccessKeyMutation.isPending}
                                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Remove access</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )}
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Hidden PDF Content for generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div ref={targetRef}>
          {summaryData && (
            <PatientSummaryPDF
              patientName={patientName}
              dischargeDate={summaryData.created_at ? format(new Date(summaryData.created_at), 'MMM d, yyyy') : undefined}
              blocks={summaryData.blocks}
            />
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
