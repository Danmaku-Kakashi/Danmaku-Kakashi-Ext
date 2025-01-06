import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './DanmakuPanel.css';
import ReactDOM from "react-dom/client";

// Initialize default settings
const init_settings = {
    maxDanmakuAmount: 100,
    opacity: 100,
    fontSize: 100,
    speed: 50,
  };
  
  // Helper function to translate maxDanmakuAmount slider value
  const translateMaxDanmakuAmount = (value) => {
    const mapping = {
      1: 5,
      2: 10,
      3: 50,
      4: 100,
      5: -1, // Unlimited
    };
    return mapping[value] !== undefined ? mapping[value] : 100;
  };
  
  const DanmuPanel = () => {
    const { t } = useTranslation(); // Uncomment and use if localization is needed
  
    // State for settings
    const [settings, setSettings] = useState(init_settings);
    const [currentOffset, setCurrentOffset] = useState(0.0);
    const [timeAdjustInput, setTimeAdjustInput] = useState('');
    const [warningVisible, setWarningVisible] = useState(false);
  
    const debounceTimer = useRef(null);
  
    // Fetch settings from chrome.storage on mount
    useEffect(() => {
      chrome.storage.sync.get(['danmakuSettings'], (result) => {
        const storedSettings = result.danmakuSettings || init_settings;
        setSettings(storedSettings);
      });
    }, []);
  
    // Update chrome.storage whenever settings change
    useEffect(() => {
      chrome.storage.sync.set({ danmakuSettings: settings }, () => {
        console.log('Settings saved:', settings);
      });
    }, [settings]);
  
    // Handle slider changes with debouncing
    const handleSliderChange = (e) => {
      const { id, value } = e.target;
      let displayValue = value;
  
      // Update display value based on slider
      if (id === 'maxDanmakuAmount') {
        displayValue = translateMaxDanmakuAmount(value);
        // If unlimited, display as such
        if (displayValue === -1) {
          displayValue = '无限制';
        } else {
          displayValue = displayValue;
        }
      } else {
        displayValue = `${value}${id === 'opacity' || id === 'fontSize' ? '%' : ''}`;
      }
  
      // Update settings state
      setSettings((prev) => ({
        ...prev,
        [id]: parseInt(value, 10),
      }));
  
      // Debounce saving settings
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
  
      debounceTimer.current = setTimeout(() => {
        // Settings are already updated in state, so no action needed here
        // If you need to perform additional actions after saving, do it here
        console.log('Debounced settings:', settings);
      }, 250);
    };
  
    // Handle apply time adjustment
    const handleApplyTime = () => {
      const val = parseFloat(timeAdjustInput.trim());
      if (isNaN(val)) {
        setWarningVisible(true);
        setTimeAdjustInput('');
      } else {
        setWarningVisible(false);
        setCurrentOffset((prev) => prev + val);
        setTimeAdjustInput('');
  
        // Update the offset in the app if needed
        const danmakuOffsetElement = document.getElementById('danmaku-offset');
        if (danmakuOffsetElement) {
          danmakuOffsetElement.textContent = currentOffset + val;
        }
      }
    };
  
    // Handle clear time adjustment
    const handleClearTime = () => {
      setWarningVisible(false);
      setCurrentOffset(0.0);
      // Update the offset in the app if needed
      const danmakuOffsetElement = document.getElementById('danmaku-offset');
      if (danmakuOffsetElement) {
        danmakuOffsetElement.textContent = '0.0';
      }
    };
  
    // Handle keydown in time adjust input
    const handleTimeAdjustKeyDown = (e) => {
      const blockedKeys = [
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'PageUp',
        'PageDown',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '0',
      ];
      if (blockedKeys.includes(e.key)) {
        e.stopPropagation();
      }
    };
  
    return (
      <div className="danmu-panel" id="DanmuControlPanel">
  
        <h3>弹幕设置</h3>
  
        {/* Max Danmaku Amount */}
        <div className="slider-group">
          <span className="slider-label">最大数量</span>
          <input
            id="maxDanmakuAmount"
            type="range"
            min="1"
            max="5"
            step="1"
            value={settings.maxDanmakuAmount}
            list="maxDanmakuAmountOptions"
            className="danmu-slider"
            onChange={handleSliderChange}
          />
          <datalist id="maxDanmakuAmountOptions">
            <option value="1" label="5"></option>
            <option value="2" label="10"></option>
            <option value="3" label="50"></option>
            <option value="4" label="100"></option>
            <option value="5" label="10000"></option>
          </datalist>
          <span className="slider-value">
            {translateMaxDanmakuAmount(settings.maxDanmakuAmount) === -1
              ? '无限制'
              : translateMaxDanmakuAmount(settings.maxDanmakuAmount)}
          </span>
        </div>
  
        {/* Opacity */}
        <div className="slider-group">
          <span className="slider-label">透明度</span>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.opacity}
            className="danmu-slider"
            id="opacity"
            onChange={handleSliderChange}
          />
          <span className="slider-value">{`${settings.opacity}%`}</span>
        </div>
  
        {/* Font Size */}
        <div className="slider-group">
          <span className="slider-label">字号</span>
          <input
            type="range"
            min="50"
            max="200"
            value={settings.fontSize}
            className="danmu-slider"
            id="fontSize"
            onChange={handleSliderChange}
          />
          <span className="slider-value">{`${settings.fontSize}%`}</span>
        </div>
  
        {/* Speed */}
        <div className="slider-group">
          <span className="slider-label">速度</span>
          <input
            type="range"
            min="1"
            max="100"
            value={settings.speed}
            className="danmu-slider"
            id="speed"
            onChange={handleSliderChange}
          />
          <span className="slider-value">{settings.speed}</span>
        </div>
  
        {/* Time Adjust Section */}
        <div className="time-adjust-section">
          <div className="time-adjust-header">
            <h4>插入时间调整</h4>
            <div className="time-current-offset">
              当前偏移: {currentOffset >= 0 ? '+' : ''}
              {currentOffset.toFixed(1)}s
            </div>
          </div>
  
          <div className="time-adjust-row">
            <input
              type="text"
              className="time-adjust-input"
              placeholder='i.e. "-1" -> 往前1秒'
              value={timeAdjustInput}
              onChange={(e) => setTimeAdjustInput(e.target.value)}
              onKeyDown={handleTimeAdjustKeyDown}
            />
            <button className="time-apply-button" onClick={handleApplyTime}>
              apply
            </button>
            <button className="time-clear-button" onClick={handleClearTime}>
              clear
            </button>
          </div>
          <div className="time-adjust-warning">**无效输入**</div>
        </div>
      </div>
    );
  };

function appendDanmakuControl(youtubeRightControls, DanmuBtn) {
    // create a wrapper to hold both button and panel
    const parentWrapper = document.createElement("div");
    parentWrapper.style.position = "relative";
    parentWrapper.style.display = "inline-block";

    const DanmuPan = document.createElement("div");
    DanmuPan.id = "DanmuPanel";

    const DanmuPanelRoot = ReactDOM.createRoot(DanmuPan);
    DanmuPanelRoot.render(
        <>
            <DanmuPanel />
        </>
    );
  
    // add event listener to DanmuBtn to toggle the panel
    parentWrapper.appendChild(DanmuBtn);
    parentWrapper.appendChild(DanmuPan);
  
    // append the wrapper to the right controls
    youtubeRightControls.prepend(parentWrapper);

    return DanmuPan;
}

export default appendDanmakuControl;
