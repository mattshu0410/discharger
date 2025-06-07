'use client';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from '@/components/ui/file-upload';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Protect } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { CloudUpload, X } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { columns } from './columns';

const formSchema = z.object({
  files: z
    .array(z.custom<File>())
    .min(1, 'Please select at least one file')
    .max(2, 'Please select up to 2 files')
    .refine(files => files.every(file => file.size <= 20 * 1024 * 1024), {
      message: 'File size must be less than 20MB',
      path: ['files'],
    }),
});

type FormValues = z.infer<typeof formSchema>;

const mockData = [
  {
    id: 1,
    fileName: '2023-aha-acc-guideline.pdf',
    summary: 'Comprehensive update on chronic coronary disease management, including new risk stratification tools.',
    tags: ['coronary', 'cardiology', 'risk', 'chronic'],
    source: 'AHA/ACC 2023',
  },
  {
    id: 2,
    fileName: '2022-esc-heart-failure.pdf',
    summary: 'Latest recommendations for diagnosis and treatment of heart failure in adults.',
    tags: ['heart failure', 'ESC', 'treatment'],
    source: 'ESC 2022',
  },
  {
    id: 3,
    fileName: '2021-who-diabetes.pdf',
    summary: 'WHO guidelines for diabetes care, focusing on prevention and integrated management.',
    tags: ['diabetes', 'WHO', 'prevention'],
    source: 'WHO 2021',
  },
  {
    id: 4,
    fileName: '2020-nice-hypertension.pdf',
    summary: 'NICE guidance on hypertension diagnosis and stepwise management.',
    tags: ['hypertension', 'NICE', 'blood pressure'],
    source: 'NICE 2020',
  },
  {
    id: 5,
    fileName: '2019-esc-afib.pdf',
    summary: 'ESC consensus on atrial fibrillation screening, anticoagulation, and rhythm control strategies.',
    tags: ['atrial fibrillation', 'ESC', 'stroke prevention'],
    source: 'ESC 2019',
  },
  {
    id: 6,
    fileName: '2022-idf-obesity.pdf',
    summary: 'Framework for clinical and public health interventions for obesity management worldwide.',
    tags: ['obesity', 'IDF', 'public health'],
    source: 'IDF 2022',
  },
  {
    id: 7,
    fileName: '2021-endocrine-thyroid.pdf',
    summary: 'Clinical guidelines on hypothyroidism and hyperthyroidism diagnosis and treatment.',
    tags: ['thyroid', 'endocrine', 'hormones'],
    source: 'Endocrine Society 2021',
  },
  {
    id: 8,
    fileName: '2020-cdc-immunization.pdf',
    summary: 'Annual CDC immunization schedule and updates for adult and pediatric vaccines.',
    tags: ['vaccination', 'CDC', 'prevention'],
    source: 'CDC 2020',
  },
];

export default function FileUploadFormDemo() {
  // const { user } = useUser();
  // const { session } = useSession();

  // Create a custom supabase client that injects the Clerk Supabase token into the request headers
  // function createClerkSupabaseClient() {
  //   return createClient(
  //     process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //     process.env.NEXT_PUBLIC_SUPABASE_KEY!,
  //     {
  //       async accessToken() {
  //         return session?.getToken() ?? null;
  //       },
  //     },
  //   );
  // }

  // Create a `client` object for accessing Supabase data using the Clerk token
  // const client = createClerkSupabaseClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      files: [],
    },
  });

  const onSubmit = React.useCallback(async (data: FormValues) => {
    toast('Submitted values:', {
      description: (
        <pre className="mt-2 w-80 rounded-md bg-accent/30 p-4 text-accent-foreground">
          <code>
            {JSON.stringify(
              data.files.map(file =>
                file.name.length > 25
                  ? `${file.name.slice(0, 25)}...`
                  : file.name,
              ),
              null,
              2,
            )}
          </code>
        </pre>
      ),
    });
    // You need FormData because you can't stringify binary files so basically it creates this form-data request body that lets you send both text and binary data.
    const formData = new FormData();
    data.files.forEach((file) => {
      formData.append('files', file);
    });
    const res = await fetch('/api/pdfloader', {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      toast('Files uploaded successfully');
    } else {
      toast('Error uploading files');
    }
  }, []);

  return (
    <Protect
      fallback={<div>You are not authorized to upload files</div>}
    >
      <>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-md">
            <FormField
              control={form.control}
              name="files"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attachments</FormLabel>
                  <FormControl>
                    <FileUpload
                      value={field.value}
                      onValueChange={field.onChange}
                      accept=".pdf,.doc,.docx"
                      maxFiles={2}
                      maxSize={20 * 1024 * 1024}
                      onFileReject={(_, message) => {
                        form.setError('files', {
                          message,
                        });
                      }}
                      multiple
                    >
                      <FileUploadDropzone className="flex-row flex-wrap border-dotted text-center">
                        <CloudUpload className="size-4" />
                        Drag and drop or
                        <FileUploadTrigger asChild>
                          <Button variant="link" size="sm" className="p-0">
                            choose files
                          </Button>
                        </FileUploadTrigger>
                        to upload
                      </FileUploadDropzone>
                      <FileUploadList>
                        {field.value.map((file, index) => (
                          <FileUploadItem key={index} value={file}>
                            <FileUploadItemPreview />
                            <FileUploadItemMetadata />
                            <FileUploadItemDelete asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-7"
                              >
                                <X />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </FileUploadItemDelete>
                          </FileUploadItem>
                        ))}
                      </FileUploadList>
                    </FileUpload>
                  </FormControl>
                  <FormDescription>
                    Upload up to 2 documents up to 20MB each.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="mt-4">
              Submit
            </Button>
          </form>
        </Form>
        <DataTable columns={columns} data={mockData} />
      </>
    </Protect>
  );
}
