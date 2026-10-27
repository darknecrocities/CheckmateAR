# Hardware Compatibility & Environmental Guidelines

CheckmateAR is optimized for mobile hardware across iOS and Android.

## 1. Supported Devices
- **iOS**: iPhone 11 or newer running iOS 15+.
- **Android**: Android 9.0 (API 28)+ with Camera2 support and OpenGL ES 3.0+.
- **Tablets**: iPad and Android tablets supported in portrait mode.

## 2. Recommended Environmental Conditions
- **Lighting**: Diffuse, uniform ambient lighting. Avoid direct single-point glare or heavy specular reflections on high-gloss wooden boards.
- **Board Surface**: Standard tournament vinyl, wooden, or matte mousepad chessboards with alternating light and dark squares.
- **Camera Angle**: Hold camera between $30^\circ$ and $60^\circ$ relative to the table surface. Ensure all 4 board corners are within the camera viewfinder.
- **Piece Alignment**: Pieces should be reasonably centered within their squares for optimal contour segmentation.

## 3. Fallback Modes
- **Low Light / Occlusion**: If visual recognition is uncertain on any square, the square is highlighted with a yellow dashed border. The user can tap the square to open the instant 1-tap correction modal.
- **Camera Recalibration**: Tap the recalibrate button at any time to re-anchor the board corners.
