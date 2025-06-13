'use client';
import { useDeleteDocument, useDocuments, useSearchDocuments, useUploadDocument } from '@/api/documents/queries';
import { DataTable } from '@/components/DataTable';
import { DocumentPreviewModal } from '@/components/DocumentPreviewModal';
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
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useUIStore } from '@/stores/uiStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search } from '@mynaui/icons-react';
import { CloudUpload, FileText, Plus, Upload, X } from 'lucide-react';
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

export default function MemoryPage() {
  const {
    memorySearchQuery,
    setMemorySearchQuery,
    isDocumentPreviewOpen,
    previewDocument,
    openDocumentPreview,
    closeDocumentPreview,
  } = useUIStore();
  const { data: allDocuments = [], isLoading } = useDocuments();
  const { data: searchResults = [] } = useSearchDocuments(memorySearchQuery, memorySearchQuery.length > 0);
  const deleteDocument = useDeleteDocument();
  const uploadDocument = useUploadDocument();

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
    try {
      await uploadDocument.mutateAsync({
        files: data.files,
        summary: `Uploaded document(s): ${data.files.map(f => f.name).join(', ')}`,
        tags: [], // Default empty tags
        shareStatus: 'private', // Default to private
      });

      toast.success('Files uploaded successfully', {
        description: `${data.files.length} document(s) uploaded and processed`,
      });

      // Reset form after successful upload
      form.reset();
    } catch (error) {
      toast.error('Error uploading files', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }, [form, uploadDocument]);

  return (
    <div className="flex flex-col m-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Document Memory</h1>
          <p className="text-muted-foreground">
            Upload and manage your medical documents for AI-powered discharge summaries
          </p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileText className="h-5 w-5" />
          <span className="text-sm font-medium">
            {documents.length}
            {' '}
            document
            {documents.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-8 w-full">
        {/* Upload Section */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">Upload Documents</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Add medical guidelines, protocols, and reference documents to enhance AI accuracy.
              </p>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="files"
                    render={({ field }) => (
                      <FormItem>
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
                            <FileUploadDropzone className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
                              <div className="flex flex-col items-center gap-2">
                                <CloudUpload className="h-8 w-8 text-muted-foreground" />
                                <div className="text-sm">
                                  <span className="font-medium">Drag and drop</span>
                                  {' '}
                                  or
                                  {' '}
                                  <FileUploadTrigger asChild>
                                    <Button variant="link" size="sm" className="p-0 h-auto font-medium">
                                      browse files
                                    </Button>
                                  </FileUploadTrigger>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  PDF, DOC, DOCX up to 48MB each
                                </p>
                              </div>
                            </FileUploadDropzone>
                            <FileUploadList className="mt-4">
                              {field.value.map((file, index) => (
                                <FileUploadItem key={`${file.name}-${index}`} value={file} className="border rounded-lg p-3">
                                  <FileUploadItemPreview />
                                  <FileUploadItemMetadata />
                                  <FileUploadItemDelete asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                    >
                                      <X className="h-4 w-4" />
                                      <span className="sr-only">Remove file</span>
                                    </Button>
                                  </FileUploadItemDelete>
                                </FileUploadItem>
                              ))}
                            </FileUploadList>
                          </FileUpload>
                        </FormControl>
                        <FormDescription>
                          Upload your internal hospital or ward-specific guidelines (max 48MB each).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={uploadDocument.isPending || form.watch('files').length === 0}
                  >
                    {uploadDocument.isPending
                      ? (
                          <>
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                            Uploading...
                          </>
                        )
                      : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Upload Documents
                          </>
                        )}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
        <Separator />

        {/* Documents Section */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search documents by name, summary, or tags..."
                  value={memorySearchQuery}
                  onChange={e => setMemorySearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Documents Table */}
            <div className="rounded-lg bg-card">
              {isLoading
                ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span className="ml-2 text-muted-foreground">Loading documents...</span>
                    </div>
                  )
                : documents.length === 0
                  ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                          {memorySearchQuery ? 'No documents found' : 'No documents uploaded yet'}
                        </h3>
                        <p className="text-muted-foreground mb-4 max-w-sm">
                          {memorySearchQuery
                            ? 'Try adjusting your search terms or upload new documents.'
                            : 'Upload your first medical document to get started with AI-powered summaries.'}
                        </p>
                        {memorySearchQuery && (
                          <Button
                            variant="outline"
                            onClick={() => setMemorySearchQuery('')}
                          >
                            Clear search
                          </Button>
                        )}
                      </div>
                    )
                  : (
                      <DataTable
                        columns={createColumns(deleteDocument, openDocumentPreview)}
                        data={documents.map((doc, index) => ({
                          id: index + 1,
                          fileName: doc.filename,
                          summary: doc.summary,
                          tags: doc.tags || [],
                          source: 'user',
                          documentId: doc.id,
                          fileUrl: doc.s3Url,
                          uploadedAt: doc.uploadedAt ? new Date(doc.uploadedAt).toISOString() : new Date().toISOString(),
                        }))}
                      />
                    )}
            </div>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        document={previewDocument}
        isOpen={isDocumentPreviewOpen}
        onClose={closeDocumentPreview}
      />
    </div>
  );
}
