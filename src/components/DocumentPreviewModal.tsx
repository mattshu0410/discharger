'use client';

import type { memoryFile } from '@/types/files';
import { Building2, Calendar, Download, ExternalLink, File, FileText as FileIcon, FileText, Tag, User, ZoomIn, ZoomOut } from 'lucide-react';
import * as React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { toast } from 'sonner';
import { useSignedUrl } from '@/api/documents/queries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type DocumentPreviewModalProps = {
  document: memoryFile | null;
  isOpen: boolean;
  onClose: () => void;
};

export function DocumentPreviewModal({ document, isOpen, onClose }: DocumentPreviewModalProps) {
  const [numPages, setNumPages] = React.useState<number>(0);
  const [scale, setScale] = React.useState<number>(1.0);
  const [_loading, setLoading] = React.useState<boolean>(true);

  // Use React Query hook for signed URL
  const {
    data: signedUrl,
    isLoading: urlLoading,
    error: urlError,
  } = useSignedUrl(
    document?.documentId || '',
    isOpen && !!document?.documentId,
  );

  // Show error toast if URL fetch fails
  React.useEffect(() => {
    if (urlError) {
      toast.error('Failed to load document access URL');
    }
  }, [urlError]);

  if (!document) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (large = false) => {
    const fileExtension = document.fileName.split('.').pop()?.toLowerCase();
    const sizeClass = large ? 'h-16 w-16' : 'h-6 w-6';

    switch (fileExtension) {
      case 'pdf':
        return <File className={`${sizeClass} text-red-600`} />;
      case 'doc':
      case 'docx':
        return <FileIcon className={`${sizeClass} text-blue-600`} />;
      default:
        return <File className={`${sizeClass} text-gray-600`} />;
    }
  };

  const handleOpenFile = () => {
    if (signedUrl) {
      window.open(signedUrl, '_blank');
    } else {
      toast.error('File access URL not available. Please refresh the page and try again.');
    }
  };

  const handleDownload = () => {
    if (signedUrl) {
      const link = window.document.createElement('a');
      link.href = signedUrl;
      link.download = document.fileName;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } else {
      toast.error('File access URL not available. Please refresh the page and try again.');
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setLoading(false);
    toast.error('Failed to load PDF document');
  };

  const zoomIn = () => setScale(scale => Math.min(2.0, scale + 0.2));
  const zoomOut = () => setScale(scale => Math.max(0.5, scale - 0.2));

  const isPDF = document.fileName.toLowerCase().endsWith('.pdf');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-3">
            {getFileIcon()}
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate" title={document.fileName}>
                {document.fileName}
              </div>
              <div className="text-sm text-muted-foreground font-normal">
                {document.fileName.split('.').pop()?.toUpperCase()}
                {' '}
                Document
                {isPDF && numPages > 0 && (
                  <span className="ml-2">
                    •
                    {numPages}
                    {' '}
                    pages
                  </span>
                )}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Document preview and details
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 gap-4 min-h-0 overflow-hidden">
          {/* Left Panel - PDF Viewer */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {urlLoading
              ? (
                  <div className="flex-1 flex items-center justify-center bg-muted/20 rounded-lg">
                    <div className="text-center p-8">
                      <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">Loading document...</p>
                    </div>
                  </div>
                )
              : isPDF && signedUrl
                ? (
                    <>
                      {/* PDF Controls */}
                      <div className="flex items-center justify-between p-2 border-b flex-shrink-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            {numPages > 0 && `${numPages} pages`}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={zoomOut}
                            disabled={scale <= 0.5}
                          >
                            <ZoomOut className="h-4 w-4" />
                          </Button>
                          <span className="text-sm font-medium min-w-[60px] text-center">
                            {Math.round(scale * 100)}
                            %
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={zoomIn}
                            disabled={scale >= 2.0}
                          >
                            <ZoomIn className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* PDF Viewer */}
                      <div className="flex-1 overflow-hidden">
                        <ScrollArea className="h-full">
                          <div className="flex flex-col items-center p-4 gap-4">
                            <Document
                              file={signedUrl}
                              onLoadSuccess={onDocumentLoadSuccess}
                              onLoadError={onDocumentLoadError}
                              loading={<div className="text-center p-8 text-muted-foreground">Loading PDF...</div>}
                            >
                              {Array.from({ length: numPages }, (_, index) => (
                                <div key={`page_${index + 1}`} className="border rounded-lg shadow-sm bg-white">
                                  <Page
                                    pageNumber={index + 1}
                                    scale={scale}
                                    loading={(
                                      <div className="text-center p-4 text-muted-foreground">
                                        Loading page
                                        {' '}
                                        {index + 1}
                                        ...
                                      </div>
                                    )}
                                  />
                                </div>
                              ))}
                            </Document>
                          </div>
                        </ScrollArea>
                      </div>
                    </>
                  )
                : (
                    <div className="flex-1 flex items-center justify-center bg-muted/20 rounded-lg">
                      <div className="text-center p-8">
                        <div className="mb-4 flex justify-center">{getFileIcon(true)}</div>
                        <h3 className="font-medium mb-2">
                          {document.fileName.toLowerCase().match(/\.(doc|docx)$/) ? 'Word Document Preview' : 'Preview Not Available'}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {document.fileName.toLowerCase().match(/\.(doc|docx)$/)
                            ? 'Word documents can be opened in your default application'
                            : !isPDF
                                ? 'Preview is only available for PDF documents'
                                : 'File access URL not available. Please try refreshing the page.'}
                        </p>
                        <div className="flex gap-2 justify-center">
                          <Button onClick={handleOpenFile} size="sm" disabled={!signedUrl}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open File
                          </Button>
                          {document.fileName.toLowerCase().match(/\.(doc|docx)$/) && (
                            <Button onClick={handleDownload} variant="outline" size="sm" disabled={!signedUrl}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
          </div>

          {/* Right Panel - Document Details */}
          <div className="flex-shrink-0 flex flex-col min-h-0">
            <ScrollArea className="flex-1">
              <div className="space-y-6 p-4">
                {/* Quick Actions */}
                <div className="flex flex-col gap-2">
                  <Button onClick={handleOpenFile} size="sm" className="w-full" disabled={urlLoading || !signedUrl}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open File
                  </Button>
                  <Button onClick={handleDownload} variant="outline" size="sm" className="w-full" disabled={urlLoading || !signedUrl}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      navigator.clipboard.writeText(document.summary);
                      toast.success('Summary copied to clipboard');
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Copy Summary
                  </Button>
                </div>

                <Separator />

                {/* Document Metadata */}
                <div className="grid gap-4">
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Uploaded by</div>
                      <div className="text-sm text-muted-foreground">
                        {typeof document.source === 'string'
                          ? document.source === 'user' ? 'You' : document.source
                          : 'Unknown'}
                      </div>
                    </div>
                  </div>

                  {document.uploadedAt && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Upload Date</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(document.uploadedAt)}
                        </div>
                      </div>
                    </div>
                  )}

                  {document.tags && document.tags.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Tag className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Tags</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {document.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Document Summary */}
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Summary
                  </h3>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {document.summary}
                    </p>
                  </div>
                </div>

                {/* File Information */}
                <div>
                  <h3 className="font-medium mb-3">File Information</h3>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">File Type:</span>
                      <span className="font-medium">
                        {document.fileName.split('.').pop()?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Source:</span>
                      <Badge variant={document.source === 'user' ? 'default' : 'secondary'} className="text-xs flex items-center gap-1">
                        {document.source === 'user'
                          ? (
                              <>
                                <User className="h-3 w-3" />
                                {' '}
                                You
                              </>
                            )
                          : (
                              <>
                                <Building2 className="h-3 w-3" />
                                {' '}
                                Community
                              </>
                            )}
                      </Badge>
                    </div>
                    {document.documentId && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Document ID:</span>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">
                          {document.documentId.slice(0, 8)}
                          ...
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
