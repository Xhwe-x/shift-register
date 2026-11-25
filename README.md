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

Tap the matching on-screen controls on touch devices. Hover over a move with a mouse to see the crew’s destination and which machines would match.

触屏可直接点击对应按钮。鼠标悬停在动作按钮上可查看移动后的位置和机器匹配结果。

## Local development / 本地开发

Use Node.js 22.12+ and npm.

```sh
npm ci
npm run dev
npm run test
npm run simulate
npm run simulate -- r w l
npm run build
npm run preview
```

The command-line simulation uses `l`, `r`, and `w` for turns, `z` for undo, `restart` to reset, and `q` to quit. Argument mode exits successfully after a winning run.

命令行模拟支持 `l`、`r`、`w`、`z`、`restart` 和 `q`。构建产物输出到 `dist/`，使用相对资源路径。

## Rules and level design / 规则与关卡设计

Each action moves the whole crew left or right by one slot, or holds it in place. In the tutorial, the worker who leaves one end comes back at the other. After the movement, every machine with an unmet request counts as one fault. An empty request is idle. The shift ends in failure when faults exceed the limit, or in success after the final beat is cleared within the limit.

每次操作先移动整队或原地等待，再按工位逐一结算。亮起的机器如果缺少匹配技能，记一次故障。空闲机器不产生故障。只有故障数超过上限才失败。

| Level / 关卡 | Design / 设计 |
| --- | --- |
| 01 · Clock In / 打卡上班 | The first beat makes the crew wrap. The second rewards waiting, and the third brings the crew back. 第一拍练习环绕，第二拍练习等待，第三拍让队伍归位。 |

The prototype opens directly into Level 1. The three visible beats include the beat about to resolve and the two after it. The English-only game UI is temporary.

原型直接进入第 1 关。三拍轨道显示当前待结算的一拍和未来两拍。当前游戏界面暂为英文。

## The three shifts / SHIFT 的三层含义

- **Key / 按键** — The two Shift keys move the crew in different directions. 左右 Shift 键分别控制两个方向。
- **Night shift / 夜班** — The foreman and the crew keep the dream factory running after dark. 工头和工人负责梦境工厂的夜班。
- **Shift register / 移位寄存器** — The ordered crew moves one position per shift, wrapping as a circular register would. 工人沿工位整体移位，如同循环移位寄存器。

GitHub Game Off 2026 uses the theme SHIFT. The jam closes on December 1 at 13:37 PST, December 2 at 05:37 in China and 06:37 in Tokyo. [Official Game Off FAQ](https://itch.io/jam/game-off-2026/topic/7290154/frequently-asked-questions-faq)

## AI Disclosure

OpenAI Codex assisted with the implementation, tests, tutorial level design, in-game text, documentation, and code that draws the original geometric art. The prototype uses no external art or audio files.

本项目使用 OpenAI Codex 辅助编写代码、测试和文档，设计教程关与游戏文案，并编写生成原创几何图形的代码。原型未使用外部图片或音频文件。

## License and dependencies / 授权与依赖

Project code and original art are under the [MIT License](LICENSE). Phaser 3 is the game engine. TypeScript, Vite, Vitest, and tsx are development tools and retain their upstream licenses. The dependency lockfile records the installed versions.

项目代码与原创图形采用 MIT 协议。Phaser 3 及各开发工具沿用各自的上游许可证。
