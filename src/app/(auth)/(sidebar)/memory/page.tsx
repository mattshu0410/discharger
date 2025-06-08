'use client';
import { useDeleteDocument, useDocuments, useSearchDocuments } from '@/api/documents/queries';
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
import { Input } from '@/components/ui/input';
import { useUIStore } from '@/stores/uiStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search } from '@mynaui/icons-react';
import { CloudUpload, X } from 'lucide-react';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { createColumns } from './columns';

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

  const { memorySearchQuery, setMemorySearchQuery } = useUIStore();
  const { data: allDocuments = [], refetch } = useDocuments();
  const { data: searchResults = [] } = useSearchDocuments(memorySearchQuery, memorySearchQuery.length > 0);
  const deleteDocument = useDeleteDocument();

  // Use search results when searching, otherwise show all documents
  const documents = memorySearchQuery.trim()
    ? searchResults.map(result => result.document)
    : allDocuments;

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

    // Add additional metadata
    formData.append('summary', `Uploaded document(s): ${data.files.map(f => f.name).join(', ')}`);
    formData.append('tags', JSON.stringify([])); // Default empty tags
    formData.append('shareStatus', 'private'); // Default to private

    const res = await fetch('/api/documents', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const result = await res.json();
      toast('Files uploaded successfully', {
        description: `${result.documents.length} document(s) uploaded${result.vectorProcessed ? ' and processed' : ''}`,
      });
      // Reset form after successful upload
      form.reset();
      // Refetch documents to show new uploads
      refetch();
    } else {
      const error = await res.json();
      toast('Error uploading files', {
        description: error.error || 'Unknown error occurred',
      });
    }
  }, [form, refetch]);

  return (
    <div className="flex flex-col gap-4 m-16">
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
          <Button variant="default" className="mt-4">
            Submit
          </Button>
        </form>
      </Form>

      {/* Search Input */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search documents by name, summary, or tags..."
          value={memorySearchQuery}
          onChange={e => setMemorySearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <DataTable
        columns={createColumns(deleteDocument)}
        data={documents.map((doc, index) => ({
          id: index + 1, // Simple numeric ID for display
          fileName: doc.filename,
          summary: doc.summary,
          tags: doc.tags || [],
          source: doc.uploadedBy || doc.source,
          documentId: doc.id, // Store the real ID for operations
        }))}
      />
    </div>
  );
}
