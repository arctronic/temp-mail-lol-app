# Temp Mail - React Native App

A modern, feature-rich temporary email application built with React Native, featuring Material Design 3 UI, AdMob monetization, and seamless integration with the temp-mail.lol API.

## Features

### 🎨 Modern UI/UX
- **Material Design 3** compliance with custom branding
- **Dark/Light theme** support with system preference detection
- **Responsive design** optimized for all screen sizes
- **Smooth animations** and intuitive navigation
- **Accessibility support** (WCAG 2.1 AA compliant)

### 📧 Email Management
- **Instant email generation** with custom prefixes
- **Real-time email fetching** with auto-refresh
- **Email search and filtering** capabilities
- **Email history management** with local storage
- **QR code sharing** for easy email distribution
- **Copy-to-clipboard** functionality

### 💰 Monetization
- **AdMob integration** with banner and interstitial ads
- **Strategic ad placement** to maximize revenue without disrupting UX
- **Configurable ad frequency** and cooldown periods
- **Test/Production ad unit** management

### 🔔 Notifications
- **Push notifications** for new emails
- **Email expiry warnings** with scheduled notifications
- **Customizable notification** settings
- **Background email checking** with configurable intervals

### ⚡ Performance & Optimization
- **Efficient API caching** to reduce network calls
- **Memory usage monitoring** and optimization
- **Performance metrics** tracking
- **Error handling** and recovery mechanisms
- **Offline support** with cached data

## Screenshots

[Add your app screenshots here]

## Installation

### Prerequisites

- Node.js (v16 or higher)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TempMailApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install iOS dependencies** (iOS only)
   ```bash
   cd ios && pod install && cd ..
   ```

4. **Configure AdMob**
   - Replace placeholder AdMob IDs in `src/services/AdMobService.ts`
   - Update `android/app/src/main/AndroidManifest.xml` with your AdMob App ID
   - Update `ios/TempMailApp/Info.plist` with your AdMob App ID (iOS)

5. **Configure app signing** (for release builds)
   - Generate a signing key for Android
   - Update `android/gradle.properties` with your keystore details
   - Configure iOS signing in Xcode

## Development

### Running the app

**Android:**
```bash
npm run android
```

**iOS:**
```bash
npm run ios
```

**Start Metro bundler:**
```bash
npm start
```

### Building for production

**Android APK:**
```bash
cd android
./gradlew assembleRelease
```

**Android App Bundle:**
```bash
cd android
./gradlew bundleRelease
```

**iOS:**
```bash
cd ios
xcodebuild -workspace TempMailApp.xcworkspace -scheme TempMailApp -configuration Release archive
```

## Configuration

### AdMob Setup

1. **Create AdMob account** at https://admob.google.com
2. **Create app** in AdMob console
3. **Create ad units** (Banner, Interstitial, Rewarded)
4. **Update ad unit IDs** in `src/services/AdMobService.ts`:
   ```typescript
   private getProductionBannerId(): string {
     return Platform.select({
       ios: 'ca-app-pub-YOUR_PUBLISHER_ID/YOUR_BANNER_ID',
       android: 'ca-app-pub-YOUR_PUBLISHER_ID/YOUR_BANNER_ID',
     }) || TestIds.BANNER;
   }
   ```

### Push Notifications

1. **Firebase setup** (for Android)
   - Create Firebase project
   - Add Android app to Firebase
   - Download `google-services.json` to `android/app/`
   - Enable Cloud Messaging

2. **APNs setup** (for iOS)
   - Configure APNs certificates in Apple Developer Console
   - Update iOS project settings in Xcode

### API Configuration

The app uses the temp-mail.lol API. No additional configuration is required as the API is public and doesn't require authentication.

## Project Structure

```
TempMailApp/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── BannerAdComponent.tsx
│   │   ├── CopyButton.tsx
│   │   ├── EmailCard.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorState.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── QRCodeModal.tsx
│   ├── screens/             # Main app screens
│   │   ├── HomeScreen.tsx
│   │   ├── InboxScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/            # Business logic and API services
│   │   ├── AdMobService.ts
│   │   ├── ApiService.ts
│   │   ├── NotificationService.ts
│   │   └── StorageService.ts
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   └── utils/               # Utility functions
│       └── AppUtils.ts
├── android/                 # Android-specific code
├── ios/                     # iOS-specific code
└── App.tsx                  # Main app component
```

## Key Components

### Services

- **ApiService**: Handles all API communications with temp-mail.lol
- **AdMobService**: Manages AdMob ads with strategic placement
- **NotificationService**: Handles push notifications and scheduling
- **StorageService**: Manages local data persistence

### Screens

- **HomeScreen**: Email generation and management
- **InboxScreen**: Email listing and reading
- **SettingsScreen**: App configuration and preferences

### Components

- **EmailCard**: Displays individual emails in the inbox
- **BannerAdComponent**: Reusable banner ad component
- **QRCodeModal**: QR code generation for email sharing
- **LoadingSpinner**: Consistent loading indicator
- **EmptyState**: User-friendly empty state displays

## Deployment

### Google Play Store

1. **Prepare release build**
   ```bash
   cd android
   ./gradlew bundleRelease
   ```

2. **Upload to Play Console**
   - Create app listing
   - Upload App Bundle
   - Configure store listing
   - Submit for review

### App Store (iOS)

1. **Archive in Xcode**
   - Select "Any iOS Device" as target
   - Product → Archive

2. **Upload to App Store Connect**
   - Use Xcode Organizer
   - Distribute App → App Store Connect

## Monetization Strategy

### Ad Placement Strategy

- **Banner ads**: Bottom of main screens (non-intrusive)
- **Interstitial ads**: Strategic placement after user actions
  - 30% chance after email generation
  - 20% chance after email opening
  - 10% chance on app open
  - 5% chance on settings access

### Revenue Optimization

- **Ad frequency capping**: 1-minute cooldown between interstitials
- **User experience priority**: Ads never interrupt critical workflows
- **A/B testing ready**: Easy configuration for testing different strategies

## Performance Considerations

### Optimization Features

- **API response caching** to reduce network requests
- **Image optimization** for faster loading
- **Memory leak prevention** with proper cleanup
- **Background task management** for notifications
- **Efficient re-rendering** with React optimization patterns

### Monitoring

- **Performance metrics** tracking
- **Error logging** and crash reporting
- **Memory usage** monitoring
- **Network request** optimization

## Security & Privacy

### Data Protection

- **No personal data collection** beyond app usage
- **Local storage encryption** for sensitive data
- **Secure API communications** with HTTPS
- **Privacy-compliant** ad serving

### Permissions

- **Internet**: API communication
- **Notifications**: Email alerts
- **Network State**: Connection monitoring
- **Vibrate**: Notification feedback

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Email: support@temp-mail.lol
- Website: https://temp-mail.lol
- GitHub Issues: [Create an issue]

## Changelog

### Version 1.0.0
- Initial release
- Material Design 3 UI
- AdMob integration
- Push notifications
- QR code sharing
- Dark/light theme support
- Email management features

---

**Built with ❤️ using React Native and Material Design 3**

