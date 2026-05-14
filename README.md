# 🛡️ 2FA Tools - Secure & Private Multi-Tool Platform

![2FA Tools Banner](public/logo.png)

A comprehensive, self-hosted web utility platform built with **Next.js 16 (App Router)** and **Tailwind CSS**. Designed for digital marketers, developers, and privacy-conscious users, this platform offers a suite of tools without ads, tracking, or unnecessary server-side processing.

> **Status:** Active Development  
> **Languages:** English 🇬🇧 | Thai 🇹🇭 (Full i18n support)

## ✨ Features

### 🔐 Security & Identity Tools
*   **2FA Authenticator:** Generate Time-based One-Time Passwords (TOTP) securely right in your browser. Fully offline-capable.
*   **Check UID (Live/Die):** Bulk verify if Facebook User IDs are currently active or disabled.
*   **Get UID:** Extract hidden numeric UIDs from Facebook profile URLs, page URLs, or usernames.
*   **UID to Year:** Estimate the creation year of a Facebook account based on its numeric UID.

### 📝 Text & Data Manipulation
*   **Text Editor & Cleaner:** Sort (A-Z/Z-A), trim whitespace, remove duplicates, and remove empty lines.
*   **String Splitter & Merger:** Split long texts into manageable chunks or merge multiple lists line-by-line.
*   **Format & Case Conversion:** Convert to UPPERCASE, lowercase, Title Case, or add line numbers.
*   **Filter & Reverse:** Filter lines by keyword (include/exclude) or reverse characters/lines.

### 🍪 Developer & Network Tools
*   **Cookie Manager:** Extract UIDs and Tokens from raw Facebook cookies, clean dead cookies, and format them perfectly for automation tools.
*   **IP Geolocation:** Detect your real public IP address and display detailed location data, ISP, Timezone, and map coordinates.
*   **HTML Extractor:** Instantly extract image sources (`<img src>`) and hyperlinks (`<a href>`) from raw HTML code.
*   **JSON Formatter:** Beautify and minify JSON payloads instantly.

### ⏱️ Productivity
*   **Pomodoro Timer:** Stay focused with built-in work/break intervals and browser notifications.
*   **Secure Notepad:** Save temporary notes locally using a lightweight SQLite database (`better-sqlite3`).

## 🚀 Tech Stack

*   **Framework:** [Next.js 16.2](https://nextjs.org/) (App Router)
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **Internationalization:** `next-intl` (en/th)
*   **Database:** `better-sqlite3` (for Notepad)
*   **Theme:** `next-themes` (Dark/Light mode)
*   **Authentication/OTP:** `otplib`

## 📦 Getting Started

### Prerequisites
*   Node.js 18.x or higher
*   npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/pakawatdmc-art/tool.maketing.git
    cd tool.maketing
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Setup Environment Variables**
    Copy the example file and configure it if needed.
    ```bash
    cp .env.example .env.local
    ```

4.  **Run the Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🛠️ Project Structure

```text
├── src/
│   ├── app/
│   │   ├── [locale]/        # i18n routing (en, th)
│   │   ├── api/             # Server-side API routes (IP, UID check, DB)
│   │   └── globals.css      # Global Tailwind styles & Theme variables
│   ├── components/
│   │   ├── Navbar.tsx       # Main navigation & Theme toggle
│   │   └── tools/           # Individual tool components (Authenticator, etc.)
│   ├── i18n/                # next-intl configuration
│   └── lib/                 # Database helpers
├── messages/                # Translation files (en.json, th.json)
└── data/                    # SQLite database storage (gitignored)
```

## 🔒 Privacy First

We built this tool to be as private as possible:
*   The **2FA Authenticator** generates tokens strictly on the client-side. Your secret keys are never sent to a server.
*   Text manipulation and formatting happen completely within your browser's memory.
*   Notes are saved to your local self-hosted SQLite instance, not a public cloud.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/pakawatdmc-art/tool.maketing/issues).

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
