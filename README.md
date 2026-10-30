# ISS AI Native Workshop · R5 关联HTML安装包

解压后从根目录的 `index.html` 进入。两套演示、完整MD、表单、资料和讨论记录的链接已经连好。主持人为Tom；会前版16页，会中版143页。八例展开，其中D1.2.5 Record & Reply按理念、实现、合规、复用和现场演示共六页；iCEO按数字分身、跨平台访问、案例分析和能力验收共4页展开；其余按七段展开，其中D1.2.9.2根据Knowledge Fabric源材料拆为两页，D1.2.9另加一页WMS真实样例，并保留完整原细节。Day2按目标蓝图、差距、路线图、IP/商业化和最终收敛组织，原六业务域、能力资产、组织、风险与七阶段材料仍可取用。

## 1. 本机打开

双击 `Item_ISS_PreRead_R5.html` 或 `Item_ISS_Meeting_R5.html` 可直接查看，无需构建。为使跨页本机存储、链接和视频行为更一致，建议在解压根目录运行：

```bash
python3 -m http.server 8080
```

打开 `http://localhost:8080/`。这是本机静态服务，不是公网或集中收集服务。离线表单可以保存草稿并导出；未配置API时不会冒充在线提交。不同浏览器对file://存储的处理可能不同，请导出备份。

## 2. 推到GitHub并发布Pages

先确定本仓库和Pages内容有权公开。不要把客户个人数据、实际提交记录、生产凭证、未授权录屏或管理员密钥推入Git。Pages可能公开可访问，即使对应仓库是私有；需要企业访问控制时请使用受控托管，不把“私有仓库”当作站点认证。

将解压根目录文件放进目标仓库，而不是再包一层目录。保留 `.nojekyll`、`.github/workflows/pages.yml`。在仓库 **Settings → Pages → Source** 选择 **GitHub Actions**。包内工作流只上传静态页面、assets、docs、forms、media及两套入口，不上传backend、reference或source。推到 `main` 后查看 **Actions**；发布成功后以Pages给出的URL为准。

例如沿用 `tommyyula/item-ISS-demo`，项目入口通常是 `https://tommyyula.github.io/item-ISS-demo/`，两套HTML和表单都是项目子路径下的相对链接。本次没有替你创建仓库或上线。

不使用Actions时也可选择 **Deploy from a branch → main → /(root)**，根目录已有 `.nojekyll`，无需Jekyll构建。选择一种发布方式，不同时配置两个重复发布流程。

## 3. 放置八组预录视频

在 `media/` 放入已授权可分享的视频，编辑 `assets/site-config.js` 对应 `c01`–`c09` 的 `src`，例如：

```javascript
c01: { src: 'media/c01.mp4', poster: '', title: 'UNIS 港口拖柜', captions: '' }
```

路径相对**站点根目录**，不是相对assets目录。也可填有授权的HTTPS视频地址；需要跨域字幕时检查服务端授权。默认src为空，不会请求不存在的视频。页面上的“选择本机预录视频”只建立当前窗口的本机预览，不上传、不复制到Git，也不会在刷新后保留文件。

每个案例首个页面有视频区；标注真实/脱敏/模拟、授权、时长和录制日期。视频建议包含正常任务、异常/信息缺失、人工接管、状态回写和结果；不能仅用答复或调用日志证明业务完成。较大视频可用授权对象存储，避免将未脱敏原始录屏放到公共仓库。

iCEO 两个视频位保留在第 45 页（功能介绍）和第 49 页（成功案例开场）的右侧。后续在 `assets/site-config.js` 分别填写 `media.c08.youtube` 与 `media.c08_cases.youtube`，支持 `https://www.youtube.com/watch?v=视频ID`、`https://youtu.be/视频ID` 和 embed 链接。页面自动转换为 YouTube 隐私增强嵌入播放器，保留在 YouTube 打开的入口。地址为空时显示占位，不请求虚构的视频；两段原始 MOV 不复制到站点。

## 4. 问题采集：本机与集中提交

`forms/prework.html` 和会前演示末页采集部门、人名、主题、痛点、现状、input材料/数据、期望实践、基线、断点、Owner。会末 `forms/convergence.html` 及会中末页采集优先场景、核心能力/护城河、共建方式及发起人/参与者/决策人、风险，附验收、执行边界、Owner、日期、推进状态和下一门。

**GitHub Pages不会存这些提交。** 先按 `backend/README.md` 部署包内的Cloudflare Worker＋D1，设置后端 `ADMIN_TOKEN` 和精确 `ALLOWED_ORIGINS`，执行schema，然后编辑：

```javascript
formsEndpoint: 'https://你的收集服务/api/submissions'
```

修改后刷新页面。API没有配置时在线提交禁用，草稿可本机保存并导出JSON/CSV；失败不会假报成功。真实成功必须收到服务器回执。修改已经提交的内容会生成新编号，避免旧回执被误认为新内容成功。

`backend/server.py` 是标准库SQLite本机参考API，可用于安装测试，不是无条件可公开的生产服务。集中记录查询/导出需要管理员Bearer凭证，凭证只放后端环境变量，不放site-config或公网HTML。公网生产还需按企业要求增加身份认证、反垃圾/节流、HTTPS、保留期限和正式安全审查。

`forms/records.html` 管理当前浏览器保存的回执/导入记录，不是组织集中数据库。草稿仍在对应表单页。当前表单可导出；后台集中汇总请按backend说明使用授权管理员导出。

## 5. 会中记录与页面取舍

第二天各页下方有可编辑讨论区：领导意见、结论/待补证据、Owner/下一步/日期，自动保存到本机。八案例页也可展开讨论区。记录不会自动上送，也不等同于正式审批。使用“资料/下载 → 导出讨论笔记”保存JSON，或每节导出Markdown；可重新导入JSON。

目录可以搜索、隐藏和恢复页面；隐藏不会删除正文或改原MD。配置可导出供另一个浏览器导入。中英/日夜、Day1/Day2/全部、滚动、固定翻页、键盘、全屏与本节MD定位保留。填写表单和笔记时方向键不会当作翻页。

## 6. 修改正文和页面

完整中文正文在 `Item_ISS_AI_Native_Workshop_R5.md` 和 `docs/`；在线阅读为 `docs/reader.html`。原生可编辑页在 `slides-source/brief/`、`slides-source/detailed/`；页序与对应在 `source/*_manifest.json`。正文和页面是两个阅读层：改MD不会凭空重写幻灯内容，需同步修改对应原生页。

修改完成后在根目录执行：

```bash
python3 -m pip install -r requirements.txt
python3 source/build_site.py --kind all
```

该命令重新组装，更新根目录静态页面和MD阅读文件，不依赖本次sandbox路径。不会调用LLM，也不会创作/改写原生页面。新增页需在manifest中登记id、day、chapter、refs并提供原生HTML。构建会检查全部MD对应锚点，缺页面或缺锚点时失败，而不是发布不完整版本。

背景R4材料保存在 `reference/` 与 `source/R4_Approved.md`，便于追溯；不是当前另一套议程。实际收益、组织调整、人员、真实接口与录屏由你补充，当前明确区分已有内容、建议设计和待补证据。

## 官方发布参考

- [GitHub Pages发布源设置](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [GitHub Pages自定义Actions工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)

发布工作流采用官方示例当前列出的checkout v6、configure-pages v5、upload-pages-artifact v4、deploy-pages v4。版本验证于2026-10-26。
