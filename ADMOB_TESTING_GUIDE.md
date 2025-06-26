# 🧪 AdMob Testing Guide

## ✅ Fixed Issues
1. **Toast Design**: Modern, beautiful snackbar with proper colors and animations
2. **Global Notifications**: Toast messages now work properly across the app
3. **Ad Testing Panel**: Added a comprehensive testing panel for development

## 🎯 How to Test Your AdMob Integration

### 1. **Development Testing** (Test Ads)
Your app is configured to show **test ads** in development mode. Here's how to test:

#### Start Your App:
```bash
npm start
# or
npx expo start
```

#### Look for the Test Panel:
- In the **Lookup screen**, you'll see a blue **"Test Ads"** button in the top-right corner
- Click it to open the **AdMob Test Panel**

#### Test Each Ad Type:
1. **🎬 Interstitial Ads**: Click "Show Interstitial Ad"
2. **🎁 Rewarded Ads**: Test all three types:
   - "Test Untrack Email Ad"
   - "Test Extra Inbox Ad" 
   - "Test Export Excel Ad"
3. **⏰ Frequency Testing**: Test ad frequency limits

### 2. **Real Feature Testing**
Test the actual monetized features:

#### Untrack Emails:
1. Add 5 email addresses to lookup
2. Try to remove one by clicking the red ❌ button
3. You should see: "Watch Ad to Untrack Email" dialog
4. Click "Watch Ad" → Test ad plays → Email gets removed

#### Add Extra Inboxes:
1. Add 5 email addresses (free limit)
2. Try to add a 6th email
3. You should see: "Watch Ad for Extra Inbox" dialog
4. Click "Watch Ad" → Test ad plays → Can add more emails

#### Export to Excel:
1. Have some tracked emails with messages
2. Click the export button in the header
3. You should see: "Watch Ad to Export Emails" dialog
4. Click "Watch Ad" → Test ad plays → Excel file downloads

### 3. **What You Should See in Development**

#### Test Ads Look Like:
- **Banner**: "Test Ad" with Google logo
- **Interstitial**: Full-screen "Test Ad" 
- **Rewarded**: Video-like "Test Ad" with reward completion

#### Success Messages:
- ✅ "Emails exported successfully!"
- ✅ "Started tracking email@example.com"
- ✅ "Stopped tracking email@example.com"

#### Error Handling:
- 📺 "Watch an ad to export your emails to Excel"
- ⚠️ "Ad not ready. Please try again in a moment."
- ❌ "Unable to load ad. Please try again later."

## 🚀 Production Testing

### Build Production Version:
```bash
# Build for Android
eas build --platform android
# or
npx expo build:android
```

### What Changes in Production:
- **Test ads** → **Real ads** from your AdMob account
- **Revenue generation** starts
- **AdMob reporting** becomes active

## 🔧 Troubleshooting

### "Ad Not Ready" Messages:
- **Normal in development**: Test ads sometimes take time to load
- **Wait 10-30 seconds** and try again
- **Check console logs** for AdMob errors

### Test Ads Not Showing:
- Ensure you're in **development mode** (`__DEV__ = true`)
- **Clear cache**: `npx expo start --clear`
- **Restart Metro**: Close and restart the development server

### Real Ads Not Showing (Production):
- **Wait 24-48 hours** after creating ad units
- **Verify AdMob IDs** are correct in your config files
- **Check AdMob console** for approval status
- **Ensure app is published** on Google Play Store

## 📊 Monitoring & Analytics

### AdMob Console:
- **Revenue tracking**: Real-time earnings
- **Ad performance**: Fill rates, eCPM, impressions
- **User engagement**: Ad completion rates

### App Analytics:
- **Export usage**: How many users export emails
- **Untrack behavior**: Ad completion vs cancellation
- **Inbox limits**: How many users hit the 5-email limit

## 🎉 Success Indicators

### Your AdMob Integration is Working If:
✅ Test ads show in development  
✅ All three rewarded ad types work  
✅ Beautiful toast notifications appear  
✅ Export functionality works with ads  
✅ Inbox limits are enforced properly  
✅ User experience feels smooth  

### Revenue Expectations:
- **Rewarded ads**: $0.10 - $0.50 per completion
- **Interstitial ads**: $0.05 - $0.20 per impression
- **Daily revenue**: Depends on your user base and engagement

## 🛠️ Debug Commands

```bash
# Check AdMob installation
npm list expo-ads-admob

# Clear all caches
npx expo start --clear

# Check for errors
npx expo doctor

# Build clean version
rm -rf node_modules && npm install
```

## 📱 User Experience

Your users will experience:
1. **Free features**: 5 email addresses, basic functionality
2. **Premium prompts**: Clear value proposition for watching ads
3. **Smooth ad experience**: No forced ads, only value-driven
4. **Modern UI**: Beautiful notifications and feedback

The integration is designed to be **user-friendly** while **maximizing revenue** through high-value actions like email export and extended tracking. 