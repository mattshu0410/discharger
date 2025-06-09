'use client';
import { Button } from '@/components/ui/button';
import { Settings, Sprout, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function DevToolsPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const seedData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/dev/seed-user-data', { method: 'POST' });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const clearData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/dev/seed-user-data', { method: 'DELETE' });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return <div>Development tools are only available in development mode.</div>;
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Settings className="h-6 w-6" />
        Development Tools
      </h1>

      <div className="space-y-4">
        <div className="flex gap-4">
          <Button
            onClick={seedData}
            disabled={loading}
            className="flex-1"
          >
            {loading
              ? (
                  'Loading...'
                )
              : (
                  <>
                    <Sprout className="h-4 w-4 mr-2" />
                    Seed Development Data
                  </>
                )}
          </Button>

          <Button
            onClick={clearData}
            disabled={loading}
            variant="destructive"
            className="flex-1"
          >
            {loading
              ? (
                  'Loading...'
                )
              : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Data
                  </>
                )}
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>
            <strong>Seed Data:</strong>
            {' '}
            Creates 3 patients, 2 documents, and 2 snippets for your user account.
          </p>
          <p>
            <strong>Clear Data:</strong>
            {' '}
            Removes all your development data (patients, documents, snippets).
          </p>
        </div>

        {result && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Result:</h3>
            <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
