# Loading Screen - Implementation Guide

## Overview
A beautiful, animated loading screen popup styled with the dating app theme (dark navy, pink/red gradients, glassmorphism effects).

## Usage in App.jsx

The loading screen is already integrated into App.jsx. You have two helper functions available:

### Show Loading Screen
```jsx
// Without image
showLoading();

// With image URL
showLoading('https://your-image-url.com/image.png');
```

### Hide Loading Screen
```jsx
hideLoading();
```

## Example: Show on Game Start

In App.jsx, you can add this to the `handleStartGame` function:

```jsx
const handleStartGame = () => {
  showLoading('https://your-image-url.com/game-starting.gif');
  
  // Your existing game start logic...
  socketRef.current.emit('START_GAME', { roomId, playerId });
  
  // Hide after 2 seconds
  setTimeout(() => hideLoading(), 2000);
};
```

## Features

### Display Elements
- **Text**: "Game aada ready'a da punda" (customizable)
- **Image**: Optional image (displays at full width, 200px height, maintains aspect ratio)
- **Animations**:
  - Spinning triple-ring loader (pink/red gradient)
  - Pulsing dots animation
  - Smooth fade-in and scale-in effects
  - Staggered animations for depth

### Styling Highlights
- Dark overlay (95% opacity, blurred background)
- Glassmorphic popup card (backdrop blur 20px)
- Pink/red gradient accents throughout
- Montserrat font for text
- Responsive design (works on mobile too)

### Image Display
The image container:
- Auto-adjusts to 100% width, 200px height
- Maintains aspect ratio with `object-fit: contain`
- Has rounded corners and subtle gradient border
- Perfect for thumbnails, logos, GIFs, or anime images

## Customization

### Change Text
Pass a custom `text` prop to LoadingScreen (currently hardcoded to "Game aada ready'a da punda"):

To make it dynamic, you could:
1. Add a `text` state in App.jsx
2. Update LoadingScreen to accept `text` prop
3. Call `setText()` function when showing loading

Example modification needed in LoadingScreen.jsx if needed:
```jsx
function LoadingScreen({ isVisible = true, imageUrl = null, text = "Game aada ready'a da punda" })
```

### Uploading Images

Once you have an image file, you can:

1. **Local Development**: Place image in `frontend/public/` folder, then reference:
   ```jsx
   showLoading('/image-name.png');
   ```

2. **Deployment**: Upload image to your hosting (AWS S3, Netlify, etc.) and use full URL:
   ```jsx
   showLoading('https://cdn.example.com/game-loading.gif');
   ```

3. **Data URL**: Convert image to base64 data URL (small images only)

## Current CSS Classes

- `.loading-overlay` - Full-screen background
- `.loading-popup` - Main card container
- `.loading-content` - Content wrapper
- `.loading-image-container` - Image display area
- `.loading-image` - Actual image element
- `.loading-spinner` - Triple-ring spinner animation
- `.loading-text` - Title text with gradient
- `.loading-dots` - Pulsing dots underneath

## Mobile Responsive

The loading screen automatically adjusts on smaller screens:
- Reduced padding (2rem → 1.5rem)
- Smaller text (1.5rem → 1.25rem)
- Smaller image (200px → 150px height)
- Thinner spinner borders (3px → 2px)

## Tips for Best Results

1. **Image Format**: Use PNG or GIF for quality (GIF for animated loader)
2. **File Size**: Keep images < 500KB for fast loading
3. **Aspect Ratio**: Use square or slightly wider images (1:1 to 16:9)
4. **Timing**: Show for 1-3 seconds so users see the animation
5. **Color**: Dark or transparent backgrounds work best (contrasts with dark overlay)

## Future Enhancement Ideas

- Add text input field if user wants custom loading messages
- Add progress bar (0-100%) instead of spinner
- Add sound effect when loading completes
- Add loading tips/hints that cycle during wait time
- Support for emoji as custom loader
