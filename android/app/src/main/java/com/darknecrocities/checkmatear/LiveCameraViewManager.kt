package com.darknecrocities.checkmatear

import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext

class LiveCameraViewManager : SimpleViewManager<LiveCameraView>() {

    override fun getName(): String = REACT_CLASS

    override fun createViewInstance(reactContext: ThemedReactContext): LiveCameraView {
        return LiveCameraView(reactContext)
    }

    companion object {
        const val REACT_CLASS = "LiveCameraView"
    }
}
