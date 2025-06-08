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

### Additional Features
- Type checking: `npm run check-types`
- Linting: `npm run lint`
- Fix linting issues: `npm run lint:fix`
