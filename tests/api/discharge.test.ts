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
  it('should generate a discharge summary', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const context = await fs.readFile('tests/api/test_data/simple_context.txt', 'utf-8');

    const requestBody = {
      patientId: 'test-patient',
      context,
      documentIds: [],
    };

    const req = new Request('http://localhost/api/discharge', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(req);
    const data = await response.json();

    // Save the output to a file
    await fs.writeFile('tests/api/output/discharge_summary.json', JSON.stringify(data, null, 2));

    // Generate and save plain text summary
    let plainTextSummary = '# Discharge Summary (Plain Text)\n\n';
    data.summary.sections.forEach((section: any) => {
      plainTextSummary += `## ${section.title}\n\n`;
      // Strip <CIT> tags
      const cleanContent = section.content.replace(/<CIT id="[^"]+">([^<]+)<\/CIT>/g, '$1');
      plainTextSummary += `${cleanContent}\n\n`;
    });
    await fs.writeFile('tests/api/output/discharge_summary_plain.txt', plainTextSummary);

    // Print the legible output to the terminal
    process.stdout.write('\n\n--- DISCHARGE SUMMARY API RESPONSE ---\n\n');
    process.stdout.write(JSON.stringify(data, null, 2));
    process.stdout.write('\n\n--- END OF RESPONSE ---\n\n');

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('summary');
    expect(data.summary.sections).toBeInstanceOf(Array);
    expect(data.summary.sections.length).toBeGreaterThan(0);

    consoleErrorSpy.mockRestore();
  }, 30000); // 30 second timeout
});
