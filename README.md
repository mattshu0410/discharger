# Discharger

Discharger is project created by two medical students for doctors - making it easy for doctors to write hospital-based discharge summaries.

uses LangChain and Google Gemini to generate discharge letters. Serves as a tool for me to learn frontend and build my first app to solve a problem that I face.

## Deployment Requirements

### Local Development Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   npm run dev:test
   npm run dev:auth
   ```
4. Set up development data (after logging in):
   - Navigate to `http://localhost:3000/dev` in your browser
   - Click "Seed Development Data" to create sample patients, documents, and snippets
   - Use "Clear All Data" to reset your development environment

### Testing Environment Setup
1. Run unit tests:
   ```bash
   npm run test
   ```
2. Run E2E tests:
   ```bash
   npm run test:e2e
   ```

### Production Deployment
1. Build the application:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm run start
   ```

### Database Migrations
- Supabase login
  ```bash
  supabase login
  ```
- Link Supabase to remote
  ```bash
  supabase link
  ```
- Push changes from supabase/migrations:
  ```bash
  supabase db push
  ```

### Development Tools
The application includes built-in development tools for easy testing:

#### Data Seeding (/dev route)
- **URL**: `http://localhost:3000/dev` (development only)
- **Purpose**: Seed sample data for testing with Row Level Security (RLS)
- **Features**:
  - Creates 3 sample patients (John Smith, Jane Doe, Alice Johnson)
  - Adds 2 medical documents (Hypertension Guidelines, Diabetes Standards)
  - Inserts 2 text snippets (orthonote, admitorders, dischargenote)
  - All data is associated with your current logged-in user
  - Random UUIDs prevent conflicts between test runs

#### API Endpoint
Alternative to the UI, you can use the API directly:
```bash
# Seed data for current user
curl -X POST http://localhost:3000/api/dev/seed-user-data

# Clear all data for current user
curl -X DELETE http://localhost:3000/api/dev/seed-user-data
```

**Note**: Development tools are only available in development mode and require authentication.

### Additional Features
- Type checking: `npm run check-types`
- Linting: `npm run lint`
- Fix linting issues: `npm run lint:fix`
