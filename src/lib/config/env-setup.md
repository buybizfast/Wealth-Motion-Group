# Environment Variables Setup

For production deployment, you need to set up the following environment variables on your hosting platform (Vercel, Firebase, etc.).

## Required Environment Variables

### Firebase Configuration
```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### OpenAI API (if using OpenAI features)
```
OPENAI_API_KEY=your-openai-api-key
```

### Anthropic API (if using Anthropic features)
```
ANTHROPIC_API_KEY=your-anthropic-api-key
```

### Replicate API (if using image generation)
```
REPLICATE_API_TOKEN=your-replicate-api-token
```

### Deepgram API (if using audio transcription)
```
DEEPGRAM_API_KEY=your-deepgram-api-key
```

### Admin Configuration
```
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

## Setting Up on Vercel

1. Go to your project settings in Vercel
2. Navigate to the "Environment Variables" section
3. Add each variable mentioned above with its corresponding value
4. Deploy your application

## Setting Up on Firebase Hosting

When using Firebase Hosting, you can set environment variables using Firebase Functions or by using a build step that generates a .env file before deployment.

## Local Development

For local development, create a `.env.local` file in the root of your project with all the variables listed above. 