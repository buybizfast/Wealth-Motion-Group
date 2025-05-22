# Ansh & Riley Full-Stack Template

This is a full-stack template project for Software Composers to create  applications with AI.

## Getting started
To create a new project, you go to `/paths`, choose from our list of Paths, and then use Cursor's Composer feature to quickly scaffold your project!

You can also edit the Path's prompt template to be whatever you like!

## Technologies used
This doesn't really matter, but is useful for the AI to understand more about this project. We are using the following technologies
- React with Next.js 14 App Router
- TailwindCSS
- Firebase Auth, Storage, and Database
- Multiple AI endpoints including OpenAI, Anthropic, and Replicate using Vercel's AI SDK

## Admin Dashboard Security

The admin dashboard is protected by a server-side middleware that ensures only authorized emails can access it. Follow these steps to set up proper admin authentication:

1. Create a Firebase service account:
   - Go to Firebase Console > Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file securely

2. Add the following environment variables to your `.env.local` file:
   ```
   # Firebase Admin SDK (Server-only variables)
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-service-account-email
   FIREBASE_PRIVATE_KEY="your-private-key-with-quotes-intact"
   ```

3. Configure allowed admin emails:
   - Open `src/middleware.ts` and update the `ADMIN_EMAILS` array with the email addresses allowed to access the admin dashboard

4. Deploy your application with these environment variables set in your hosting platform (Vercel, etc.)

These measures ensure that only authenticated users with specific email addresses can access the admin routes on both the client and server sides.