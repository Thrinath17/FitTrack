# Security Considerations

## ⚠️ Critical: API Key Exposure

### Current Issue
The Gemini API key is currently exposed in client-side code via environment variables. This is a **security risk** because:

1. **Client-side exposure**: Environment variables in Vite are bundled into the client-side JavaScript
2. **Public access**: Anyone can view the source code and extract the API key
3. **Abuse potential**: Exposed keys can be used by unauthorized users, leading to:
   - Unexpected API costs
   - Rate limiting issues
   - Service disruption

### Current Implementation
```typescript
// services/geminiService.ts
const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
```

This key is visible in the browser's developer tools and bundled JavaScript.

### Recommended Solution

#### Option 1: Backend Proxy (Recommended)
Create a backend API endpoint that handles Gemini API calls:

```typescript
// Backend API route (e.g., /api/generate-insight)
export async function POST(request: Request) {
  const { attendance } = await request.json();
  const apiKey = process.env.GEMINI_API_KEY; // Server-side only
  
  // Call Gemini API server-side
  const response = await callGeminiAPI(apiKey, attendance);
  return Response.json({ insight: response });
}
```

Then update the frontend:
```typescript
// services/geminiService.ts
export const generateCoachInsight = async (attendance: AttendanceRecord[]): Promise<string> => {
  try {
    const response = await fetch('/api/generate-insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attendance }),
    });
    
    if (!response.ok) throw new Error('API request failed');
    const data = await response.json();
    return data.insight;
  } catch (error) {
    return "AI Coach is temporarily unavailable. Please try again later.";
  }
};
```

#### Option 2: Serverless Functions
Use serverless functions (Vercel, Netlify, AWS Lambda) to proxy API calls:

```typescript
// api/generate-insight.ts (Vercel/Netlify)
export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY; // Server-side only
  // ... handle Gemini API call
}
```

#### Option 3: API Key Restrictions
If you must use client-side keys temporarily:
1. **Restrict API key** to specific domains/IPs in Google Cloud Console
2. **Set usage quotas** to limit abuse
3. **Monitor usage** regularly for suspicious activity
4. **Rotate keys** frequently

### Implementation Priority
**HIGH** - This should be addressed before production deployment.

---

## Other Security Considerations

### 1. Input Validation ✅ (Fixed)
- All user inputs are now validated
- Email format validation added
- Workout name length limits enforced
- Numeric values (reps, weight) validated

### 2. Error Handling ✅ (Fixed)
- Try-catch blocks added to all storage operations
- User-friendly error messages
- No sensitive data exposed in error messages

### 3. XSS Prevention
- React automatically escapes user input
- No `dangerouslySetInnerHTML` usage
- Input sanitization in place

### 4. LocalStorage Security
- Data stored in localStorage is not encrypted
- Consider encrypting sensitive data if needed
- Be aware of XSS attacks that could access localStorage

### 5. Authentication
- Currently using mock authentication
- For production, implement:
  - Secure session management
  - JWT tokens with proper expiration
  - HTTPS only
  - CSRF protection

---

## Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for sensitive data (server-side only)
3. **Implement rate limiting** on API endpoints
4. **Monitor API usage** for unusual patterns
5. **Rotate credentials** regularly
6. **Use HTTPS** in production
7. **Implement proper authentication** before production

---

## Action Items

- [ ] **CRITICAL**: Move Gemini API calls to backend proxy
- [ ] Implement proper authentication system
- [ ] Add rate limiting to API endpoints
- [ ] Set up API usage monitoring
- [ ] Review and restrict API key permissions
- [ ] Add encryption for sensitive localStorage data (if needed)

---

*Last Updated: 2024*


