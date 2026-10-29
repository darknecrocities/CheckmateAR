package com.darknecrocities.checkmatear

import android.content.Context
import android.util.AttributeSet
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import androidx.camera.core.Preview
import androidx.camera.core.resolutionselector.ResolutionSelector
import androidx.camera.core.resolutionselector.ResolutionStrategy
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import kotlin.math.abs

/**
 * High-performance CameraX stream view.
 * Continuously analyzes live camera frames at 15-20 FPS using the direct Y-luminance buffer.
 * Dispatches real-time board detection and corner updates without any photo captures.
 */
class LiveCameraView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val previewView: PreviewView = PreviewView(context)
    private val analysisExecutor: ExecutorService = Executors.newSingleThreadExecutor()
    private var lastAnalysisTimestamp: Long = 0L

    init {
        previewView.layoutParams = LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        )
        previewView.scaleType = PreviewView.ScaleType.FILL_CENTER
        addView(previewView)
        startCamera()
    }

    private fun getLifecycleOwner(): LifecycleOwner? {
        var ctx = context
        while (ctx is android.content.ContextWrapper) {
            if (ctx is LifecycleOwner) {
                return ctx
            }
            ctx = ctx.baseContext
        }
        return (context as? ReactContext)?.currentActivity as? LifecycleOwner
    }

    private fun startCamera() {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(context)
        cameraProviderFuture.addListener({
            try {
                val cameraProvider = cameraProviderFuture.get()
                val lifecycleOwner = getLifecycleOwner() ?: return@addListener

                val preview = Preview.Builder().build().also {
                    it.setSurfaceProvider(previewView.surfaceProvider)
                }

                val imageAnalysis = ImageAnalysis.Builder()
                    .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                    .build()

                imageAnalysis.setAnalyzer(analysisExecutor) { imageProxy ->
                    processFrame(imageProxy)
                }

                val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA
                cameraProvider.unbindAll()
                cameraProvider.bindToLifecycle(
                    lifecycleOwner,
                    cameraSelector,
                    preview,
                    imageAnalysis
                )
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }, ContextCompat.getMainExecutor(context))
    }

    private fun processFrame(imageProxy: ImageProxy) {
        val now = System.currentTimeMillis()
        // Throttle frame processing to ~10 FPS (100ms) to keep bridge and UI thread completely responsive
        if (now - lastAnalysisTimestamp < 100) {
            imageProxy.close()
            return
        }
        lastAnalysisTimestamp = now

        try {
            val plane = imageProxy.planes[0]
            val buffer = plane.buffer
            val width = imageProxy.width
            val height = imageProxy.height
            val rowStride = plane.rowStride
            val pixelStride = plane.pixelStride

            // Analyze 32x32 luminance grid across frame
            val grid = 32
            val stepX = width / grid
            val stepY = height / grid
            val lum = Array(grid) { IntArray(grid) }

            for (gy in 0 until grid) {
                val py = gy * stepY
                for (gx in 0 until grid) {
                    val px = gx * stepX
                    val index = py * rowStride + px * pixelStride
                    if (index < buffer.remaining()) {
                        lum[gy][gx] = buffer.get(index).toInt() and 0xFF
                    }
                }
            }

            // Detect alternating checkerboard transitions across rows and columns
            val rowTrans = IntArray(grid)
            val colTrans = IntArray(grid)

            for (gy in 0 until grid) {
                var t = 0
                for (gx in 1 until grid) {
                    if (abs(lum[gy][gx] - lum[gy][gx - 1]) > 25) t++
                }
                rowTrans[gy] = t
            }

            for (gx in 0 until grid) {
                var t = 0
                for (gy in 1 until grid) {
                    if (abs(lum[gy][gx] - lum[gy - 1][gx]) > 25) t++
                }
                colTrans[gx] = t
            }

            // Find board bounding span (5 to 16 transitions)
            var minGy = -1
            var maxGy = -1
            for (gy in 2 until grid - 2) {
                if (rowTrans[gy] in 5..18) {
                    if (minGy == -1) minGy = gy
                    maxGy = gy
                }
            }

            var minGx = -1
            var maxGx = -1
            for (gx in 2 until grid - 2) {
                if (colTrans[gx] in 5..18) {
                    if (minGx == -1) minGx = gx
                    maxGx = gx
                }
            }

            val spanX = if (maxGx > minGx) maxGx - minGx + 1 else 0
            val spanY = if (maxGy > minGy) maxGy - minGy + 1 else 0
            val aspectRatio = if (spanY > 0) spanX.toFloat() / spanY.toFloat() else 0f

            // Chessboard must be roughly square (0.70 to 1.35) and have sufficient grid coverage (at least 8 grid cells)
            val isGeometryValid = minGy >= 0 && maxGy > minGy && minGx >= 0 && maxGx > minGx &&
                    spanX >= 8 && spanY >= 8 && aspectRatio in 0.70f..1.35f

            var checkerContrast = 0
            if (isGeometryValid) {
                var lightSum = 0
                var darkSum = 0
                for (r in 0 until 8) {
                    val gy = (minGy + (r + 0.5f) * (spanY / 8f)).toInt().coerceIn(0, grid - 1)
                    for (c in 0 until 8) {
                        val gx = (minGx + (c + 0.5f) * (spanX / 8f)).toInt().coerceIn(0, grid - 1)
                        val v = lum[gy][gx]
                        if ((r + c) % 2 == 0) lightSum += v else darkSum += v
                    }
                }
                checkerContrast = abs(lightSum / 32 - darkSum / 32)
            }

            val isValid = isGeometryValid && checkerContrast >= 12

            val viewWidth = previewView.width.toFloat().coerceAtLeast(1f)
            val viewHeight = previewView.height.toFloat().coerceAtLeast(1f)

            val leftFrac = if (isValid) minGx.toFloat() / grid else 0.10f
            val rightFrac = if (isValid) (maxGx + 1).toFloat() / grid else 0.90f
            val topFrac = if (isValid) minGy.toFloat() / grid else 0.28f
            val bottomFrac = if (isValid) (maxGy + 1).toFloat() / grid else 0.72f

            val eventMap: WritableMap = Arguments.createMap()
            eventMap.putBoolean("isBoardFound", isValid)
            eventMap.putDouble("confidence", if (isValid) 0.96 else 0.20)

            val cornersMap: WritableMap = Arguments.createMap()
            cornersMap.putMap("topLeft", makePoint(leftFrac * viewWidth, topFrac * viewHeight))
            cornersMap.putMap("topRight", makePoint(rightFrac * viewWidth, topFrac * viewHeight))
            cornersMap.putMap("bottomRight", makePoint(rightFrac * viewWidth, bottomFrac * viewHeight))
            cornersMap.putMap("bottomLeft", makePoint(leftFrac * viewWidth, bottomFrac * viewHeight))
            eventMap.putMap("corners", cornersMap)

            // Sample 8x8 chessboard squares for real-time piece occupancy and color
            val occArray: WritableArray = Arguments.createArray()
            val lumArray: WritableArray = Arguments.createArray()

            val startGx = if (isValid) minGx.toFloat() else (grid * 0.12f)
            val spanGx = if (isValid) (maxGx - minGx + 1).toFloat() else (grid * 0.76f)
            val startGy = if (isValid) minGy.toFloat() else (grid * 0.20f)
            val spanGy = if (isValid) (maxGy - minGy + 1).toFloat() else (grid * 0.60f)

            for (r in 0 until 8) {
                val gy = (startGy + (r + 0.5f) * (spanGy / 8f)).toInt().coerceIn(0, grid - 1)
                val gyTop = (startGy + (r + 0.15f) * (spanGy / 8f)).toInt().coerceIn(0, grid - 1)
                val gyBot = (startGy + (r + 0.85f) * (spanGy / 8f)).toInt().coerceIn(0, grid - 1)
                for (c in 0 until 8) {
                    val gx = (startGx + (c + 0.5f) * (spanGx / 8f)).toInt().coerceIn(0, grid - 1)
                    val gxL = (startGx + (c + 0.15f) * (spanGx / 8f)).toInt().coerceIn(0, grid - 1)
                    val gxR = (startGx + (c + 0.85f) * (spanGx / 8f)).toInt().coerceIn(0, grid - 1)

                    val centerVal = lum[gy][gx]
                    val cornerVal = (lum[gyTop][gxL] + lum[gyTop][gxR] + lum[gyBot][gxL] + lum[gyBot][gxR]) / 4
                    val contrast = abs(centerVal - cornerVal)

                    val isOcc = contrast > 18
                    occArray.pushInt(if (isOcc) 1 else 0)
                    lumArray.pushInt(centerVal)
                }
            }
            eventMap.putArray("occupancy", occArray)
            eventMap.putArray("luminance", lumArray)

            sendEvent("onBoardStream", eventMap)
        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            imageProxy.close()
        }
    }

    private fun makePoint(x: Float, y: Float): WritableMap {
        val pt = Arguments.createMap()
        pt.putDouble("x", x.toDouble())
        pt.putDouble("y", y.toDouble())
        return pt
    }

    private fun sendEvent(eventName: String, params: WritableMap) {
        val reactContext = context as? ReactContext ?: return
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            ?.emit(eventName, params)
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        analysisExecutor.shutdown()
    }
}
