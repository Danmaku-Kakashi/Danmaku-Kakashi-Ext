// import { useTranslation } from 'react-i18next';

function createDanmakuPanel() {

    // const { t } = useTranslation();

    const DanmuPanel = document.createElement("div");
    DanmuPanel.className = "danmu-panel";
    DanmuPanel.id = "DanmuControlPanel";
  
    DanmuPanel.innerHTML = `
      <style>
        .danmu-panel {
          /* hide by default */
          display: none;
  
          position: absolute;
  
          width: 240px;
          padding: 0px 8px; 
          line-height: 35px !important;
          
          background-color: rgba(0, 0, 0, 0.8);
          color: #fff;
          border-radius: 4px;
          z-index: 9999;  /* make sure it's on top of everything */
          font-family: "Microsoft YaHei", sans-serif;
        }
  
        .danmu-panel h3 {
          margin: 2px 0 !important;
          font-size: 14px;
        }
  
        .slider-group {
          margin: 2px 0 !important;
          display: flex;
          align-items: center;
        }
        .slider-label {
          flex: 0 0 60px;
          font-size: 13px;
          text-align: center;
        }
        .danmu-slider {
          flex: 1;
        }
        .slider-value {
          width: 40px;
          text-align: center;
          margin-left: 6px;
          font-size: 13px;
        }
        .danmu-slider[type=range] {
          -webkit-appearance: none; /* remove default style */
          height: 4px;
          background: #555;
          border-radius: 2px;
          outline: none;
        }

        
        .danmu-slider[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          background: rgba(255, 65, 49);
          border-radius: 50%;
          cursor: pointer;
          margin-top: -3px; 
        }


        /* time adjust section */
        .time-adjust-section {
            margin-top: 10px;
            border-top: 1px solid #555;
            padding-top: 8px;
        }
        /* Title area, left is the title, right is the current offset */
        .time-adjust-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
        }
        .time-adjust-header h4 {
            margin: 0;
            font-size: 13px;
        }
        .time-current-offset {
            font-size: 13px;
        }

        /* 输入+按钮 行 */
        .time-adjust-row {
            display: flex;
            align-items: center;
            margin-bottom: 4px; 
            width: 100%;
        }
        .time-adjust-input {
            flex: 0 0 auto; 
            width: 120px; 
            padding: 4px 6px;
            margin-right: 4px; 
            border-radius: 3px;
            border: 1px solid #666;
            background: #222;
            color: #fff;
        }
        .time-apply-button,
        .time-clear-button {
            padding: 2px 6px; 
            margin-right: 4px; 
            background: #444;
            color: #fff;
            border: 1px solid #666;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px; 
            min-width: 50px; 
        }
        /* leave space for the clear button */
        .time-clear-button {
            margin-right: 0;
        }

        /* invalid input warning */
        .time-adjust-warning {
            font-size: 12px;
            color: #ff4f4f;
            display: none; 
        }
      </style>
  
      <h3>弹幕设置</h3>
  
      <!-- display area 25, 50, 75, 100 -->
      <div class="slider-group">
        <span class="slider-label">显示区域</span>
        <input 
          type="range" 
          min="0" 
          max="100" 
          step="25"
          value="100" 
          list="displayAreaList"
          class="danmu-slider" 
        />
        <datalist id="displayAreaList">
          <option value="25"  label="25%"></option>
          <option value="50"  label="50%"></option>
          <option value="75"  label="75%"></option>
          <option value="100" label="全屏"></option>
        </datalist>
        <span class="slider-value">全屏</span>
      </div>
  
      <!-- clearness (0~100%) -->
      <div class="slider-group">
        <span class="slider-label">透明度</span>
        <input type="range" min="0" max="100" value="100" class="danmu-slider" />
        <span class="slider-value">100%</span>
      </div>
  
      <!-- front size (50~200%) -->
      <div class="slider-group">
        <span class="slider-label">字号</span>
        <input type="range" min="50" max="200" value="100" class="danmu-slider" />
        <span class="slider-value">100%</span>
      </div>
  
      <!-- speed (1~100) -->
      <div class="slider-group">
        <span class="slider-label">速度</span>
        <input type="range" min="1" max="100" value="50" class="danmu-slider" />
        <span class="slider-value">50</span>
      </div>

      <div class="time-adjust-section">
        <div class="time-adjust-header">
            <h4>插入时间调整</h4>
            <div class="time-current-offset">当前偏移: +0.0s</div>
        </div>

        <div class="time-adjust-row">
            <input 
            type="text" 
            class="time-adjust-input" 
            placeholder='i.e. "-1" -> 往前1秒' 
            />
            <button class="time-apply-button">apply</button>
            <button class="time-clear-button">clear</button>
        </div>
        <div class="time-adjust-warning">**无效输入**</div>
      </div>
    `;

  
    // add event listener to sliders to update the value span
    const sliders = DanmuPanel.querySelectorAll(".danmu-slider");
    sliders.forEach((slider) => {
      const valueSpan = slider.parentElement.querySelector(".slider-value");
      slider.addEventListener("input", (e) => {
        const val = e.target.value;
        const labelText = slider.previousElementSibling.innerText; 
        
        if (labelText.includes("速度")) {
          // speed: 1~100, no need to add "%"
          valueSpan.textContent = val;
        } else if (labelText.includes("显示区域")) {
          // display area: 25, 50, 75, full screen
          if (val === "100") {
            valueSpan.textContent = "全屏";
          } else {
            valueSpan.textContent = val + "%";
          }
        } else {
          // clearness, front size: 0~100%, 50~200%
          valueSpan.textContent = val + "%";
        }
      });
    });

    const timeAdjustInput = DanmuPanel.querySelector(".time-adjust-input");
    const timeApplyButton = DanmuPanel.querySelector(".time-apply-button");
    const timeClearButton = DanmuPanel.querySelector(".time-clear-button");
    const offsetDisplay = DanmuPanel.querySelector(".time-current-offset");
    const warningText = DanmuPanel.querySelector(".time-adjust-warning");

    let currentOffset = 0.0;
    // update the offset display
    function updateOffsetDisplay() {
        offsetDisplay.textContent = 
        "当前偏移: " + (currentOffset >= 0 ? "+" : "") + currentOffset.toFixed(1) + "s";
    }

    timeApplyButton.addEventListener("click", () => {
        const val = parseFloat(timeAdjustInput.value.trim());
        if (isNaN(val)) {
            warningText.style.display = "block";
            // clear input
            timeAdjustInput.value = "";

        } else {
            warningText.style.display = "none";
            currentOffset += val;
            updateOffsetDisplay();
            timeAdjustInput.value = "";
        }
    });

    timeClearButton.addEventListener("click", () => {
        warningText.style.display = "none";
        currentOffset = 0.0;   // default
        updateOffsetDisplay();
    });

    // prevent some keys from affecting the video
    timeAdjustInput.addEventListener("keydown", (e) => {
        const blockedKeys = [
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "PageUp",
        "PageDown",
        "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", 
        ];
        if (blockedKeys.includes(e.key)) {
        e.stopPropagation(); 
        }
    });

    return DanmuPanel;
}

function appendDanmakuControl(youtubeRightControls, DanmuBtn) {
    // create a wrapper to hold both button and panel
    const parentWrapper = document.createElement("div");
    parentWrapper.style.position = "relative";
    parentWrapper.style.display = "inline-block";
  
    // create a panel to control danmaku
    const DanmuPanel = createDanmakuPanel(); 
  
    // add event listener to DanmuBtn to toggle the panel
    parentWrapper.appendChild(DanmuBtn);
    parentWrapper.appendChild(DanmuPanel);
  
    // append the wrapper to the right controls
    youtubeRightControls.prepend(parentWrapper);

    return DanmuPanel;
}
  
export default appendDanmakuControl;
  