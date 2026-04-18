# Genius - App Store Submission Guide

## 1. Open Project
Run: `npx cap open ios`

## 2. Xcode Settings
- **Target:** App
- **Signing:** Add your Apple Developer Team.
- **Bundle ID:** `com.genius.mathforkids`
- **Version:** 1.0.0
- **Build:** 1

## 3. The Push to App Store
1. Select **Any iOS Device (arm64)** as the build target in the top bar.
2. Go to **Product > Archive**.
3. Wait for the build to finish.
4. Click **Distribute App** in the Organizer window.
5. Select **App Store Connect** and follow the prompts to Upload.

## 4. App Store Connect (Web)
1. Go to [icloud.developer.apple.com](https://appstoreconnect.apple.com).
2. Create a 'New App' with name 'Genius - Math for Kids'.
3. Select your uploaded build.
4. Submit for Review!
