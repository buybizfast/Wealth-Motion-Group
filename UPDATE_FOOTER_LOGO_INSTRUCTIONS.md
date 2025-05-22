# How to Update the Footer Logo URL

Follow these steps to update the "Made by Jacq Bots" footer logo URL to point to your Linktree profile:

## Using the Admin Dashboard (Recommended)

1. Log in to your website's admin dashboard
2. Click on the "Site Settings" tab in the admin navigation
3. Find the "Footer Logo" section
4. In the "Logo Link URL" field, enter: `https://linktr.ee/jackybang1212`
5. If the logo image needs updating, you can also do that in this section
6. Click "Save Changes" to update the settings

## Using Firebase Console (Alternative Method)

If you prefer to update directly in Firebase:

1. Log in to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to Firestore Database
4. Find the "siteSettings" collection
5. Look for the document with ID "footerLogo"
6. Edit the document and update the "linkUrl" field to: `https://linktr.ee/jackybang1212`
7. Save your changes

## Verify the Changes

After updating:

1. Visit your website
2. Scroll to the footer
3. Click on the "Made by Jacq Bots" logo
4. Confirm it redirects to your Linktree profile at https://linktr.ee/jackybang1212 