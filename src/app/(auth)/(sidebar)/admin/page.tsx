'use client';
import { Database, FileText, Settings, Sprout, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [devResult, setDevResult] = useState<any>(null);
  const [devLoading, setDevLoading] = useState(false);

  const handleSeedHospitals = async () => {
    try {
      setIsSeeding(true);
      toast.info('Starting hospital seeding...');

      const response = await fetch('/api/dev/seed-hospitals', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Successfully seeded ${data.totalInserted} hospitals!`);
      } else {
        toast.error(`Failed to seed hospitals: ${data.error}`);
      }
    } catch (error) {
      console.error('Error seeding hospitals:', error);
      toast.error('Failed to seed hospitals');
    } finally {
      setIsSeeding(false);
    }
  };

  const seedDevData = async () => {
    setDevLoading(true);
    try {
      const response = await fetch('/api/dev/seed-user-data', { method: 'POST' });
      const data = await response.json();
      setDevResult(data);
      toast.success('Development data seeded successfully!');
    } catch (error) {
      const errorResult = { error: error instanceof Error ? error.message : 'Unknown error' };
      setDevResult(errorResult);
      toast.error('Failed to seed development data');
    } finally {
      setDevLoading(false);
    }
  };

  const clearDevData = async () => {
    setDevLoading(true);
    try {
      const response = await fetch('/api/dev/seed-user-data', { method: 'DELETE' });
      const data = await response.json();
      setDevResult(data);
      toast.success('Development data cleared successfully!');
    } catch (error) {
      const errorResult = { error: error instanceof Error ? error.message : 'Unknown error' };
      setDevResult(errorResult);
      toast.error('Failed to clear development data');
    } finally {
      setDevLoading(false);
    }
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Admin tools are only available in development mode.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Admin Panel
        </h1>
        <p className="text-muted-foreground">Manage system data and development tools.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Database Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Management
            </CardTitle>
            <CardDescription>
              Manage database seeding and maintenance tasks.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Hospital Data</h4>
              <p className="text-sm text-muted-foreground">
                Seed the hospitals table with Australian hospital data from CSV.
              </p>
              <Button
                onClick={handleSeedHospitals}
                disabled={isSeeding}
                variant="outline"
                className="w-full"
              >
                {isSeeding ? 'Seeding...' : 'Seed Hospitals'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Development Tools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sprout className="h-5 w-5" />
              Development Tools
            </CardTitle>
            <CardDescription>
              Seed and manage development data for testing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={seedDevData}
                disabled={devLoading}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                {devLoading
                  ? 'Loading...'
                  : (
                      <>
                        <Sprout className="h-4 w-4 mr-2" />
                        Seed Dev Data
                      </>
                    )}
              </Button>
              <Button
                onClick={clearDevData}
                disabled={devLoading}
                variant="destructive"
                size="sm"
                className="flex-1"
              >
                {devLoading
                  ? 'Loading...'
                  : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear Data
                      </>
                    )}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              <p>
                <strong>Seed:</strong>
                {' '}
                Creates 3 patients, 2 documents, and 2 snippets.
              </p>
              <p>
                <strong>Clear:</strong>
                {' '}
                Removes all your development data.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              Manage user profiles and permissions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Profile Management</h4>
              <p className="text-sm text-muted-foreground">
                Coming soon: Bulk user profile management tools.
              </p>
              <Button variant="outline" disabled className="w-full">
                Manage Users
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Document Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Management
            </CardTitle>
            <CardDescription>
              Manage system documents and templates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Template Management</h4>
              <p className="text-sm text-muted-foreground">
                Coming soon: Discharge template and document management.
              </p>
              <Button variant="outline" disabled className="w-full">
                Manage Templates
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Development Result */}
      {devResult && (
        <Card>
          <CardHeader>
            <CardTitle>Development Operation Result</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(devResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
