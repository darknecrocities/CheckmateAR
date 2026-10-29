import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Platform,
  requireNativeComponent,
  DeviceEventEmitter,
  ViewProps,
} from 'react-native';
import { CameraView } from 'expo-camera';
import { QuadPoints } from '../../types/vision';

export interface BoardStreamData {
  corners: QuadPoints;
  isBoardFound: boolean;
  confidence: number;
}

interface LiveStreamCameraProps {
  onBoardStream?: (data: BoardStreamData) => void;
  style?: ViewProps['style'];
}

const NativeLiveCameraView =
  Platform.OS === 'android'
    ? requireNativeComponent<ViewProps>('LiveCameraView')
    : null;

/**
 * High-performance live video streaming camera with guaranteed live preview visibility.
 * Renders back-facing CameraView and attaches CameraX frame analysis.
 */
export const LiveStreamCamera: React.FC<LiveStreamCameraProps> = ({
  onBoardStream,
  style,
}) => {
  const onBoardStreamRef = useRef(onBoardStream);
  onBoardStreamRef.current = onBoardStream;

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      'onBoardStream',
      (event: any) => {
        if (!event || !event.corners) return;

        const streamData: BoardStreamData = {
          corners: {
            topLeft: event.corners.topLeft,
            topRight: event.corners.topRight,
            bottomRight: event.corners.bottomRight,
            bottomLeft: event.corners.bottomLeft,
          },
          isBoardFound: Boolean(event.isBoardFound),
          confidence: typeof event.confidence === 'number' ? event.confidence : 0.8,
        };

        onBoardStreamRef.current?.(streamData);
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View style={[StyleSheet.absoluteFill, style]}>
      {/* Guaranteed visible live camera preview */}
      <CameraView style={StyleSheet.absoluteFill} facing="back" />
      {/* Native analyzer attachment */}
      {NativeLiveCameraView && (
        <NativeLiveCameraView
          style={[StyleSheet.absoluteFill, { opacity: 0.01 }]}
          pointerEvents="none"
        />
      )}
    </View>
  );
};
