# Shift Register（交接班）

You’re the night-shift foreman at a dream factory. Move your entire crew one station at a time and put the right worker in front of every active machine. The game advances one beat per action, so you can take as long as you need to plan.

你是梦境工厂的夜班领班。每次让整队工人移动一格，让亮起的机器与面前工人的技能图标相同。每次操作只推进一拍，可以慢慢规划。

## Controls / 操作

| Action / 动作 | Keys / 按键 |
| --- | --- |
| Shift left / 左移 | Left Shift, ←, A |
| Shift right / 右移 | Right Shift, →, D |
| Wait / 等待 | Space, ↓, S |
| Undo / 悔棋 | Z, Backspace |
| Restart / 重开 | R |
| Hint / 提示 | H |

Tap the matching on-screen controls on touch devices. Hover over a move with a mouse to see the crew’s destination and which machines would match. Hints cap the current run at two stars. Undo keeps that cap, and restart clears it. Language and reduced animation are available in the main menu. Mute is available while playing.

触屏可直接点击对应按钮。鼠标悬停在动作按钮上可查看移动后的位置和机器匹配结果。使用提示后本局最高 2 星，悔棋不清除限制，重开会清除。主菜单可设置语言与减弱动画，关卡内可切换静音。

## Local development / 本地开发

Use Node.js 22.12+ and npm.

```sh
npm ci
npm run dev
npm run test
npm run solve
npm run simulate
npm run simulate -- r w l
npm run build
npm run zip
npm run preview
```

The command-line simulation uses `l`, `r`, and `w` for turns, `z` for undo, `restart` to reset, and `q` to quit. Argument mode exits successfully after a winning run.

命令行模拟支持 `l`、`r`、`w`、`z`、`restart` 和 `q`。Vite 将构建产物输出到 `dist/`，使用相对资源路径。求解器验证全部十关的零故障解与最低移位次数。打包命令生成仓库根目录下的 `shift-register-itch.zip`。

The solver prints a zero-fault route and its par for each level. Validation also rejects an all-WAIT win, a fault-free all-left or all-right run on levels 2–10, or par below two on those levels.

## Rules and level design / 规则与关卡设计

Each action moves the whole crew left or right by one slot, or holds it in place. In the tutorial, the worker who leaves one end comes back at the other. After the movement, every machine with an unmet request counts as one fault. An empty request is idle. The shift ends in failure when faults exceed the limit, or in success after the final beat is cleared within the limit.

每次操作先移动整队或原地等待，再按工位逐一结算。亮起的机器如果缺少匹配技能，记一次故障。空闲机器不产生故障。只有故障数超过上限才失败。

- **Pinned / 固定** — The worker stays in place. Shift only the ordered list of unpinned stations. 固定工人原地不动；只移动未固定工位组成的序列。
- **Overflow / 溢出** — The ejected worker leaves for good. The first reserve fills the opening, or the station stays empty. 被挤出的工人永久离场，候补按顺序入场。没有候补时留下空位。
- **Absences / 缺勤** — Workers stay physically in line on their listed beat but provide no skill. Warning markers in the beat track follow the current or projected worker. 缺勤工人保留位置，在指定拍无法提供技能。预告条上的缺勤提醒根据工人当前或悬停预览的位置显示。
- **Stars and par / 星级与参考步数** — A win earns three stars with zero faults, two with one, or one with more. Par counts shifts in a route with the fewest faults, then the fewest moves. A hint caps the current run at two stars. 零故障通关 3 星，一次故障 2 星，其余通关 1 星。参考步数先最小化故障，再最小化移位。使用提示后最高 2 星。

| Level / 关卡 | Design / 设计 |
| --- | --- |
| 01 · Clock In / 打卡上班 | The first beat makes the crew wrap. The second rewards waiting, and the third brings the crew back. 第一拍练习环绕，第二拍练习等待，第三拍让队伍归位。 |
| 02 · Two Beats Ahead / 提前两拍 | An idle beat gives you time to position for a request two slots away. 借一拍空闲提前站位。 |
| 03 · Pinned Down / 原地钉牢 | Rotate around one fixed station. 绕过一个固定工位。 |
| 04 · The Stubborn Station / 顽固工位 | A duplicate skill makes several moves look plausible. Look past the pinned slot. 重复技能制造干扰，判断哪位工人能赶上后续需求。 |
| 05 · End of the Line / 传送带尽头 | Learn permanent ejection and reserve order. 学习永久离场与候补顺序。 |
| 06 · Who Goes Home? / 谁先下班？ | Choose whom to sacrifice as reserve space runs out. 候补逐渐耗尽，决定要挤走谁。 |
| 07 · Called In Sick / 请病假 | A second worker covers for an absent teammate. 提前调另一位同技能工人来替班。 |
| 08 · Approved Leave / 准假了 | Plan around pinned and absent workers at the same time. 同时绕开固定与缺勤限制。 |
| 09 · Graveyard Shift / 午夜班 | Combine all three modifiers. 综合使用三种修饰规则。 |
| 10 · Last Light / 最后一盏灯 | A 16-beat finale; the foreman finally clocks out. 16 拍终局，领班终于下班。 |

The three-row track shows the current beat and the next two. JSON slot and beat indices are zero-based. All levels are available from the shift list. Level 4 uses a decoy around the fixed slot because a demand that contradicts the pinned worker on that slot would make a clean solution impossible. Reduced animation follows the device until explicitly changed in Settings. Progress and preferences persist locally when browser storage is available.

三拍轨道显示当前待结算的一拍和未来两拍。JSON 工位和节拍从 0 编号。选关列表开放全部关卡。第 4 关用固定工位周围的同技能工人制造干扰，保证存在零故障解。减弱动画默认跟随设备，进度与设置在浏览器允许时保存在本地。

## The three shifts / SHIFT 的三层含义

- **Key / 按键** — The two Shift keys move the crew in different directions. 左右 Shift 键分别控制两个方向。
- **Night shift / 夜班** — The foreman and the crew keep the dream factory running after dark. 工头和工人负责梦境工厂的夜班。
- **Shift register / 移位寄存器** — The ordered crew moves one position per shift, wrapping as a circular register would. 工人沿工位整体移位，如同循环移位寄存器。

GitHub Game Off 2026 uses the theme SHIFT. The jam closes on December 1 at 13:37 PST, December 2 at 05:37 in China and 06:37 in Tokyo. [Official Game Off FAQ](https://itch.io/jam/game-off-2026/topic/7290154/frequently-asked-questions-faq)

## itch.io release / 网页发布

Build and zip the game, then upload `shift-register-itch.zip` as an HTML Game with the browser-play and mobile-friendly settings enabled. The archive includes the root `index.html` and all required assets. Submit the game through the Game Off 2026 jam page with the public GitHub URL and the AI disclosure below. [itch.io HTML5 guide](https://itch.io/docs/creators/html5) · [Game Off 2026](https://itch.io/jam/game-off-2026)

构建并打包后，将 ZIP 上传为 HTML Game，开启网页试玩和移动端支持。通过比赛页面正式提交，并填入公开 GitHub 地址和以下 AI 使用说明。

## AI Disclosure

OpenAI Codex played a major role in implementation and testing. It assisted with level design, bilingual writing, original procedural graphics and animation, synthesized audio, and documentation. All art and sound are generated by the project. No external image, font, or audio files are bundled.

OpenAI Codex 深度参与代码与测试，也协助关卡设计、双语文案、原创程序化图形与动画、合成音频和文档。美术与声音均由项目程序生成，没有打包外部图片、字体或音频文件。

## License and dependencies / 授权与依赖

Project code and original art are under the MIT License. Phaser 3 is the MIT-licensed game engine. TypeScript, Vite, Vitest, tsx, and fflate are development tools and retain their upstream licenses. The dependency lockfile records installed versions. [MIT License](LICENSE)

Phaser's EventEmitter3 dependency also uses MIT. Both upstream license notices ship in the web build.

项目代码与原创图形采用 MIT 协议。发布包包含 Phaser 3 及其 EventEmitter3 依赖的 MIT 授权声明。各开发工具沿用其上游许可证。
