# Store listing — AI Quick Copy

Everything to paste into **Microsoft Edge Add-ons** (Partner Center). The same text works for the **Chrome Web Store** later.
Field names in the store forms may differ slightly from the ones below.

## Files to upload

| What | File |
|---|---|
| Extension package | `dist/ai-quick-copy-<version>.zip` (run `./scripts/package.sh`) |
| Extension logo (1:1, 300×300) | `store/logo-300x300.png` |
| Small promotional tile (440×280) | `store/promo-small-440x280.png` |
| Large promotional tile / marquee (1400×560) | `store/promo-marquee-1400x560.png` |
| Screenshots (1280×800) | `store/screenshot-2-markdown-output-1280x800.png`, `store/screenshot-1-settings-1280x800.png` |

Tip: a third screenshot taken by you on a real ChatGPT / Claude page, right after pressing `Ctrl+C` (with the confirmation toast visible), makes the listing much more convincing. Crop or resize it to exactly 1280×800.

## Basic info

- **Name:** AI Quick Copy
- **Category:** Productivity
- **Language:** English (add Vietnamese as a second listing language if you want, text below)
- **Website / Support URL:** https://github.com/phinspace/AI_WEB_QUICK_COPY
- **Privacy policy URL:** https://github.com/phinspace/AI_WEB_QUICK_COPY/blob/main/PRIVACY.md
- **Search terms:** `ChatGPT copy`, `Markdown`, `copy AI answer`, `Claude`, `Gemini`, `Grok`, `clipboard`

## Short description (max 132 characters)

```
Ctrl+C copies the AI answer you're reading as Markdown; press it twice to copy every AI tab. ChatGPT, Gemini, Grok, Claude.
```

## Description (English)

```
Copy AI answers as clean Markdown with the shortcut you already know.

On ChatGPT, Gemini, Grok or Claude, press Ctrl+C (⌘C on macOS) with nothing selected and AI Quick Copy puts the answer you are reading on your clipboard as real Markdown, ready to paste into VS Code, Obsidian, Notion, GitHub or any Markdown editor.

WHAT YOU GET
• Headings, bold, italic, links, quotes and tables kept as Markdown
• Code blocks fenced with their language, indentation and blank lines kept exactly, so the code runs
• Nested lists keep their levels and numbering
• Math copied as TeX ($x^2$, $$...$$)
• Copy buttons, toolbars and screen-reader labels removed

KNOW WHO WROTE WHAT
Each copy can be labeled with the AI's name and a role you choose (for example "Secretary" or "Critic"), so answers from several AIs stay easy to tell apart in one file. Turn it on or off in the settings.

YOUR NORMAL COPY IS UNTOUCHED
With text highlighted, or while typing in a text box, Ctrl+C copies exactly as it always does. The extension only acts when the browser would copy nothing.

COPY EVERY AI TAB AT ONCE
Asked the same question to ChatGPT, Gemini, Grok and Claude? Press Ctrl+C twice quickly (⌘C ⌘C on macOS) and the latest answer of every AI tab in that window is copied in one go, each labeled with its AI. You can also set a browser shortcut to do it from any tab. Untick the AIs you don't want in the settings.

COPIES THE ANSWER ON SCREEN
At the bottom of a chat it copies the latest answer; scroll up and it copies the older answer you are looking at.

PRIVATE BY DESIGN
• 100% local: no server, no account, no analytics, no network requests
• Reads content only on chatgpt.com, chat.openai.com, gemini.google.com, grok.com, x.com and claude.ai
• "storage" saves your settings; "activeTab" and "scripting" only write the clipboard when you use the optional browser shortcut
• Copied answers are never stored

Open source (MIT): https://github.com/phinspace/AI_WEB_QUICK_COPY

AI Quick Copy is an independent project and is not affiliated with OpenAI, Google, xAI or Anthropic.
```

## Mô tả (Tiếng Việt)

```
Copy câu trả lời AI ra Markdown sạch đẹp bằng phím tắt bạn đã quen.

Trên ChatGPT, Gemini, Grok hoặc Claude, không bôi đen gì và nhấn Ctrl+C (⌘C trên macOS), AI Quick Copy sẽ copy câu trả lời bạn đang xem dưới dạng Markdown, dán thẳng vào VS Code, Obsidian, Notion, GitHub hay bất kỳ trình soạn Markdown nào.

BẠN NHẬN ĐƯỢC
• Giữ nguyên heading, in đậm, in nghiêng, link, trích dẫn và bảng
• Code block kèm tên ngôn ngữ, giữ đúng thụt lề và dòng trống, copy ra là chạy được
• Danh sách lồng nhau giữ đúng cấp và số thứ tự
• Công thức toán copy ra dạng TeX ($x^2$, $$...$$)
• Tự bỏ nút copy, thanh công cụ và nhãn dành cho trình đọc màn hình

BIẾT ĐOẠN NÀO DO AI NÀO VIẾT
Mỗi lần copy có thể kèm tên AI và vai trò bạn đặt (ví dụ "Thư ký", "Phản biện"), để khi dán câu trả lời từ nhiều AI vào cùng một file vẫn phân biệt được. Bật/tắt trong phần cài đặt.

KHÔNG ẢNH HƯỞNG CÁCH COPY BÌNH THƯỜNG
Khi đang bôi đen chữ hoặc đang gõ trong ô nhập, Ctrl+C vẫn copy như thường. Extension chỉ làm việc khi trình duyệt không có gì để copy.

COPY TẤT CẢ TAB AI CÙNG LÚC
Hỏi cùng 1 câu cho ChatGPT, Gemini, Grok và Claude? Nhấn nhanh Ctrl+C 2 lần (⌘C ⌘C trên macOS) là câu trả lời mới nhất của mọi tab AI trong cửa sổ đó được copy cùng lúc, mỗi đoạn có tên AI. Có thể đặt thêm phím tắt trình duyệt để dùng ở bất kỳ tab nào. Bỏ tích AI bạn không muốn gom trong phần cài đặt.

COPY ĐÚNG CÂU TRẢ LỜI ĐANG XEM
Ở cuối cuộc trò chuyện thì copy câu mới nhất; cuộn lên thì copy câu trả lời cũ đang nằm trên màn hình.

RIÊNG TƯ TUYỆT ĐỐI
• Chạy 100% trên máy: không server, không tài khoản, không thống kê, không gửi dữ liệu đi đâu
• Chỉ đọc nội dung trên chatgpt.com, chat.openai.com, gemini.google.com, grok.com, x.com và claude.ai
• "storage" để lưu cài đặt; "activeTab" và "scripting" chỉ dùng để ghi clipboard khi bạn dùng phím tắt trình duyệt (tuỳ chọn)
• Không bao giờ lưu nội dung đã copy

Mã nguồn mở (MIT): https://github.com/phinspace/AI_WEB_QUICK_COPY

AI Quick Copy là dự án độc lập, không liên kết với OpenAI, Google, xAI hay Anthropic.
```

## What's new in 1.5.0 (update notes)

```
• Copy all AI tabs: press Ctrl+C twice quickly on an AI page to copy the latest answer of every ChatGPT, Gemini, Grok and Claude tab in the current window, one labeled block per AI.
• Choose which AIs are gathered in the settings (untick one to leave it out).
• Optional browser shortcut to do it from any tab (set it at edge://extensions/shortcuts).
• A single Ctrl+C still copies only the answer you are reading.
```

```
• Copy tất cả tab AI: nhấn nhanh Ctrl+C 2 lần trên trang AI để copy câu trả lời mới nhất của mọi tab ChatGPT, Gemini, Grok, Claude trong cửa sổ, mỗi AI một block có tên.
• Chọn AI được gom trong phần cài đặt (bỏ tích để loại AI đó ra).
• Có thể đặt phím tắt trình duyệt để dùng ở bất kỳ tab nào (edge://extensions/shortcuts).
• Nhấn Ctrl+C 1 lần vẫn chỉ copy câu đang xem.
```

## Privacy / data questions

| Question | Answer |
|---|---|
| Does the extension collect or transmit personal information? | **No** |
| Single purpose | Copy AI chat responses from supported AI chat sites to the clipboard as Markdown (the response being read, or the latest response of each AI tab in the current window). |
| Remote code | **No**, all code is in the package |
| Data sold or shared with third parties | **No** |

### Permission justifications

- **`storage`**: Saves the user's settings (identity blocks on/off, an optional role name per AI, which AIs copy-all gathers, double Ctrl+C on/off). No browsing data or copied content is stored.
- **Host access (chatgpt.com, chat.openai.com, gemini.google.com, grok.com, x.com, claude.ai)**: The content script reads the AI response on the page when the user presses Ctrl+C / ⌘C with nothing selected, converts it to Markdown locally, and writes it to the clipboard. When the user presses Ctrl+C twice quickly (or the optional browser shortcut), the service worker finds the tabs on these sites in the current window and asks each for its latest response. It runs on no other sites.
- **`activeTab`** and **`scripting`**: Only when the user presses the extension's browser shortcut ("copy-all-latest"; suggested Alt+C, which Edge reserves, so on Edge the user assigns a key), a small function is run in the current tab to write the combined responses to the clipboard and show a confirmation toast (a service worker cannot access the clipboard). It reads nothing from that page.

## Notes for certification (reviewers)

```
How to test:
1. Open https://chatgpt.com (or gemini.google.com / claude.ai / grok.com) and sign in with any account.
2. Ask any question, e.g. "Show a Python hello world with a table of 2 rows".
3. Click on an empty area of the page so nothing is selected, then press Ctrl+C (Cmd+C on macOS).
4. A toast confirms the copy. Paste into any text editor: the answer is Markdown.
Highlighting text and pressing Ctrl+C performs a normal browser copy.
Copy all AI tabs: open two AI sites in separate tabs (e.g. chatgpt.com and gemini.google.com), ask a question in each, click an empty area of one of them and press Ctrl+C twice quickly (Cmd+C twice on macOS). A toast lists the AIs copied; the clipboard holds both answers, one block per AI. A single Ctrl+C still copies only the answer on screen.
Clicking the toolbar icon opens the settings page.
No account, login or network access is required by the extension itself.
```
