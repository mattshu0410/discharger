'use client';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import usePatientStore from '@/stores/patientStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export function PatientForm() {
  const editedPatient = usePatientStore(state => state.editedPatient);
  const updateEditedField = usePatientStore(state => state.updateEditedField);
  const patientName = editedPatient?.name || '';
  // const onContextChange = (context: string) => {
  //   updateEditedField('context', context);
  //   console.warn(editedPatient);
  // };

  const formSchema = z.object({
    name: z.string().min(1),
    context: z.string().min(1),
  });
  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: patientName || '',
      context: editedPatient?.context || '',
    },
  });

  useEffect(() => {
    if (editedPatient) {
      form.reset({
        name: editedPatient.name || '',
        context: editedPatient.context || '',
      });
    }
  }, [editedPatient, form]);

  const generateDischargeText = useMutation({
    mutationFn: async ({ context }: { context: string }) => {
      const res = await fetch('/api/discharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context }),
      });
      if (!res.ok) {
        throw new Error('Failed to generate discharge');
      }
      return res.text();
    },
    onSuccess: (text) => {
      updateEditedField('dischargeText', text);
    },
  });

  return (

    <div className="flex flex-col gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(({ context }: FormValues) => generateDischargeText.mutate({ context }))} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patient Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter patient name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="context"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Clinical Context</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Paste any relevant contextual information e.g. progress notes"
                    className="min-h-[120px]"
                    {...field}
                    // onChange={e => onContextChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={generateDischargeText.isPending}>
            {generateDischargeText.isPending ? 'Generating...' : 'Generate Discharge'}
          </Button>
        </form>
      </Form>
      {/* <div>
        <label className="block text-base font-semibold mb-1" htmlFor="patientName">
          Patient Name
        </label>
        <Input
          id="patientName"
          placeholder="Enter patient name"
          className="mb-2"
          value={patientName}
          onChange={e => updateEditedField('name', e.target.value)}
        />
      </div>
      <div>
        <label className="block text-base font-semibold mb-1" htmlFor="clinicalContext">
          Clinical Context
        </label>
        <textarea
          id="clinicalContext"
          className="w-full min-h-[120px] rounded-md border border-input bg-card px-3 py-2 text-base shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-colors outline-none"
          placeholder="Paste any relevant contextual information e.g. progress notes"
          value={editedPatient?.context}
          onChange={e => onContextChange(e.target.value)}
        />
      </div>
      <div>
        <div className="font-semibold mb-2">Resources</div>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">RCH Clinical Practice Guidelines</span>
          <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">RNSH Guidelines</span>
          <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">NSWHealth Guidelines</span>
          <button className="px-3 py-1 rounded-full border border-muted-foreground text-xs font-medium hover:bg-muted transition-colors">Add Extra +</button>
        </div>

      </div> */}
    </div>
  );
}
