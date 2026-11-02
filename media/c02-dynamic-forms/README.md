# c02 · Item WMS 动态表单演示播放器

D1.2.2（ITEM WMS Dynamic Form）第一页视频区嵌入的播放器。`assets/site-config.js` 的 `media.c02.player` 指向本目录的 `index.html`，`assets/workshop.js` 把它以 iframe 挂进 `.video-slot[data-case-id=c02]`。

## 这是什么

- 不是录屏：HTML 场景动画（画面状态是时间 t 的纯函数，可任意拖动）＋ TTS 中文旁白＋烧录字幕，约 13:12，22 个场景（Part 1：仓库背景 → 破损用例 → 与传统交付的工时/周期/效果对比 → 三个应用的构建与使用；Part 2：技术实现；结尾回扣对比）。
- 界面按真实 wms-web、wms-mobile 和 Agent Shell 的样式重画。每个场景右上角标注性质：**架构示意 / 真实机制**，或 **示意画面 · 基于本地 WMS 真实定义**（Move Damage = `TDEF-151` v1，工作台 = `PDEF-101`）。
- 人物和单据号是示意数据（巡检员 John Smith、主管 Emily Carter、搬运员 Maria Garcia；ISSUE-106/107、TASK-18651/18652、ADJ-512）；客户、物料和库位使用本地环境主数据（Northbridge Service Parts、NB-BAT57-3C、A12-05-1、DMG-01）。

## 操作

空格播放/暂停；←/→ 前后 2 秒（Shift 为 0.2 秒）；`[` / `]` 切换场景；`<` / `>` 调速。底部场景菜单可直接跳转。

## 来源与更新

源工程是 fdnwms 仓库的 `dynamic-forms-demo/`（分镜 `script/storyboard.md`，旁白 `script/narration.json`）。本目录是 `scenes/` 的发布副本，与源相比只有四处不同：

1. `js/engine.js` 的音频路径改为 `audio/narration.m4a`（源为 `../output/audio/full.wav`）。
2. `js/engine.js` 在服务器不支持 Range（如 `python3 -m http.server`）导致音频不可拖动时，整段取回为 blob 再播放。
3. `index.html` 增加窄宽度下的控制栏样式（iframe 内隐藏场景名；更窄时再隐藏上一/下一场景按钮）。
4. `audio/narration.m4a` 由源工程的 `output/audio/full.wav` 转码：`ffmpeg -i full.wav -ac 1 -c:a aac -b:a 64k -movflags +faststart narration.m4a`（33 MB → 5.9 MB）。未使用的 `vendor/gsap.min.js` 未复制。

源工程旁白或画面更新后，重新复制 `scenes/css`、`scenes/js`，重做上述修改，并重新转码音频。`js/timing.js` 必须与音频同批生成，否则字幕和画面会与旁白错位。

推荐通过 http(s) 打开（GitHub Pages 或根目录 `python3 -m http.server`）。
