'use client';

import type { PatientAccessKey } from '@/api/patient-access-keys/types';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Phone, Trash2, User, Users } from 'lucide-react';
import { useState } from 'react';
import { useDeactivateAccessKey, usePatientAccessKeys } from '@/api/patient-access-keys/hooks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type AccessManagementPanelProps = {
  summaryId: string;
};

export function AccessManagementPanel({ summaryId }: AccessManagementPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: accessKeysResponse, isLoading, error } = usePatientAccessKeys(summaryId);
  const deactivateAccessKeyMutation = useDeactivateAccessKey();

  const accessKeys = accessKeysResponse?.success ? accessKeysResponse.access_keys || [] : [];

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

  const formatPhoneNumber = (phone: string) => {
    // Simple formatting for display - assumes E.164 format
    if (phone.startsWith('+61')) {
      const number = phone.slice(3);
      if (number.length === 9) {
        return `+61 ${number.slice(0, 1)} ${number.slice(1, 5)} ${number.slice(5)}`;
      }
    }
    return phone;
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
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between"
            disabled={isLoading}
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
            {isOpen
              ? (
                  <ChevronUp className="w-4 h-4" />
                )
              : (
                  <ChevronDown className="w-4 h-4" />
                )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-3">
          {isLoading
            ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                  <span className="ml-3 text-muted-foreground">Loading access keys...</span>
                </div>
              )
            : error
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
                      <p className="text-xs">Use "Share with Patient" to send SMS links</p>
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
    </TooltipProvider>
  );
}
