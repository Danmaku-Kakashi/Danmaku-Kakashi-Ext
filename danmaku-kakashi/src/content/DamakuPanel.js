function createDanmakuPanel() {
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
      </style>
  
      <h3>弹幕设置</h3>
  
      <!-- display area 25, 50, 75, 100 -->
      <div class="slider-group">
        <span class="slider-label">显示区域</span>
        <input 
          type="range" 
          min="10" 
          max="100" 
          step="25"
          value="25" 
          list="displayAreaList"
          class="danmu-slider" 
        />
        <datalist id="displayAreaList">
          <option value="25"  label="25%"></option>
          <option value="50"  label="50%"></option>
          <option value="75"  label="75%"></option>
          <option value="100" label="全屏"></option>
        </datalist>
        <span class="slider-value">25%</span>
      </div>
  
      <!-- clearness (0~100%) -->
      <div class="slider-group">
        <span class="slider-label">不透明度</span>
        <input type="range" min="0" max="100" value="67" class="danmu-slider" />
        <span class="slider-value">67%</span>
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
  