// ==UserScript==
// @name         Telegram Web K 表情包彻底抹除 (智能无误伤版)
// @namespace    http://tampermonkey.net/
// @version      8.3
// @description  只抹除纯表情包消息。如果消息中包含文字内容，则完整保留。
// @author       User
// @match        https://web.telegram.org/k/*
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // 逻辑升级：
    // 1. 利用 .bubble.is-sticker：这是 Web K 专门给“纯表情包消息”打的标签。
    // 2. 利用 :not(:has(.message))：确保气泡内没有文字正文区域。
    // 3. 这样可以完美保留 projectXtls 等频道中带有小表情的文字消息。
    GM_addStyle(`
        /* 屏蔽那些被官方标记为纯表情包的消息 */
        .bubble.is-sticker {
            display: none !important;
        }

        /* 兜底规则：气泡内含有表情包/动图元素，且【不含有】文字时才屏蔽 */
        /* 双重判定：.message 不存在，或被官方标记为 is-message-empty（防止空 .message 容器导致漏判） */
        .bubble:not(:has(.message)):has(.sticker-fixed-size),
        .bubble:not(:has(.message)):has(.animated-sticker),
        .bubble:not(:has(.message)):has(video.media-sticker),
        .bubble:not(:has(.message)):has(img.media-sticker),
        .bubble.is-message-empty:has(.sticker-fixed-size),
        .bubble.is-message-empty:has(.animated-sticker),
        .bubble.is-message-empty:has(video.media-sticker),
        .bubble.is-message-empty:has(img.media-sticker),
        /* 修复漏杀：GIF 动图（用户自建/收藏的动图）使用的是 media-gif 而非 media-sticker */
        .bubble:not(:has(.message)):has(video.media-gif),
        .bubble:not(:has(.message)):has(.media-gif),
        .bubble.is-message-empty:has(video.media-gif),
        .bubble.is-message-empty:has(.media-gif) {
            display: none !important;
        }

        /* 保护补丁：含文字 / 图片 / 视频 / 文件的气泡绝对显示。
           关键：特异性提升到 (0,3,0) 与隐藏规则持平，且位于隐藏规则之后 ——
           同为 !important 且特异性相同时，靠后的规则生效。
           这样可防“无文字图片消息引用了贴纸”时，引用缩略图中的 media-sticker 误伤图片本体 */
        .bubble:not(.is-sticker):has(.message),
        .bubble:not(.is-sticker):has(.media-photo),
        .bubble:not(.is-sticker):has(video.media-video),
        .bubble:not(.is-sticker):has(.media-document),
        .bubble:not(.is-sticker):has(.attachment) {
            display: flex !important;
        }

        /* 屏蔽“纯 emoji 放大”消息：整条消息只有 emoji、无文字，被放大显示
           Web K 会给这类气泡打 is-emoji 类，含文字的 emoji 消息不受影响。
           注意：必须放在保护补丁之后 —— 此类气泡含 .message，保护补丁会命中，
           特异性同为 (0,3,0) 时靠后的规则生效。
           如想保留纯 emoji 消息，删除本规则块即可 */
        .bubble.is-emoji:has(.message) {
            display: none !important;
        }
    `);
})();
