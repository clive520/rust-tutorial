import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Rust 程式設計入門到實戰",
  description: "專為學生與初學者打造的 Rust 互動式教學網站",
  base: '/rust-tutorial/',
  themeConfig: {
    nav: [
      { text: '首頁', link: '/' },
      { text: '課程指南', link: '/chapters/01-getting-started' },
      { text: 'GitHub 倉庫', link: 'https://github.com/clive520/rust-tutorial' }
    ],
    sidebar: [
      {
        text: '學習導引',
        items: [
          { text: '課程介紹與學習路徑', link: '/' }
        ]
      },
      {
        text: '教學進程',
        items: [
          { text: '01. 一開始準備', link: '/chapters/01-getting-started' },
          { text: '02. 基本觀念、猜數字', link: '/chapters/02-basics-and-guessing-game' },
          { text: '03. 所有權、借用', link: '/chapters/03-ownership-and-borrowing' },
          { text: '04. 結構體、列舉、集合', link: '/chapters/04-structs-enums-collections' },
          { text: '05. 泛型、特徵', link: '/chapters/05-generics-and-traits' },
          { text: '06. 文字搜尋工具', link: '/chapters/06-minigrep' },
          { text: '07. 閉包、迭代器、並行', link: '/chapters/07-closures-iterators-concurrency' },
          { text: '08. 網頁伺服器', link: '/chapters/08-web-server' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/clive520/rust-tutorial' }
    ],
    footer: {
      message: '以 MIT 授權釋出，歡迎學習與分享',
      copyright: 'Copyright © 2026 Rust 教學團隊'
    },
    docFooter: {
      prev: '上一章',
      next: '下一章'
    },
    outline: {
      label: '本頁目錄'
    }
  }
})
