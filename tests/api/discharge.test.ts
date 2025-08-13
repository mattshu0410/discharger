import { promises as fs } from 'node:fs';
import { vi } from 'vitest';
import { POST } from '@/app/api/discharge/route';

// Mock Clerk's currentUser and auth
vi.mock('@clerk/nextjs/server', () => ({
  currentUser: vi.fn().mockResolvedValue({
    id: 'user_2yfUgbn8m5iCwAAHuVCCEJ8sTlp',
  }),
  auth: vi.fn().mockResolvedValue({
    getToken: vi.fn().mockResolvedValue('fake.jwt.token'),
  }),
}));

describe('/api/discharge', () => {
  it('should generate discharge summaries from emergency medicine notes', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    console.warn('🧪 Testing Discharge Generation API with emergency medicine notes...\n');

    // Test with each note
    for (let i = 1; i <= 3; i++) {
      const noteId = i.toString();
      console.warn(`📝 Testing with Note ${noteId}...`);

      try {
        // Read the note
        const notePath = `tests/discharger/emergency-medicine/notes/${noteId}.txt`;
        const noteContent = await fs.readFile(notePath, 'utf8');

        // Prepare the request
        const requestBody = {
          patientId: `test-patient-${noteId}`,
          context: noteContent,
          documentIds: [], // No documents for this test
          feedback: '', // No feedback for new generation
        };

        console.warn(`   📤 Calling POST function directly`);
        console.warn(`   📊 Context length: ${noteContent.length} characters`);

        // Create a Request object and call the POST function directly
        const req = new Request('http://localhost/api/discharge', {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const response = await POST(req);
        const result = await response.json();

        // Save the result as JSON
        const outputPath = `tests/discharger/emergency-medicine/reports/${String.fromCharCode(64 + i)}.json`; // A.json, B.json, C.json
        await fs.writeFile(outputPath, JSON.stringify(result, null, 2));

        console.warn(`   ✅ Success! Output saved to reports/${String.fromCharCode(64 + i)}.json`);
        console.warn(`   📊 Generated ${result.summary.sections.length} sections`);
        console.warn(`   🔗 Total citations: ${result.summary.sections.reduce((acc: number, section: any) => acc + section.citations.length, 0)}`);

        // Verify the response structure
        expect(response.status).toBe(200);
        expect(result).toHaveProperty('summary');
        expect(result.summary.sections).toBeInstanceOf(Array);
        expect(result.summary.sections.length).toBeGreaterThan(0);

        // Generate and save plain text summary as well
        let plainTextSummary = `# Discharge Summary - Note ${noteId} (Plain Text)\n\n`;
        result.summary.sections.forEach((section: any) => {
          plainTextSummary += `## ${section.title}\n\n`;
          // Strip <CIT> tags
          const cleanContent = section.content.replace(/<CIT id="[^"]+">([^<]+)<\/CIT>/g, '$1');
          plainTextSummary += `${cleanContent}\n\n`;
        });
        const plainTextPath = `tests/discharger/emergency-medicine/reports/${String.fromCharCode(64 + i)}.txt`;
        await fs.writeFile(plainTextPath, plainTextSummary);

        console.warn(`   📄 Plain text summary saved to reports/${String.fromCharCode(64 + i)}.txt`);
      } catch (error) {
        console.error(`   ❌ Error testing note ${noteId}:`, error);
        throw error; // Re-throw to fail the test
      }
      console.warn(''); // Empty line for readability
    }
    console.warn('📊 All tests completed successfully!');
    consoleErrorSpy.mockRestore();
  }, 90000); // 90 second timeout for all 3 tests
});
