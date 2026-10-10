// ==UserScript==
// @name         Telegram Web K 表情包彻底抹除 (智能无误伤版)
// @namespace    http://tampermonkey.net/
// @version      8.6
// @description  只抹除纯表情包消息。如果消息中包含文字内容，则完整保留。
// @author       User
// @match        https://web.telegram.org/k/*
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // 逻辑升级：
    // 1. 利用 .bubble.sticker / .sticker-animated：Web K 给“纯表情包消息”打的标签（实测确认）。
    // 2. 利用 :not(:has(.message)) / .is-message-empty：确保气泡内没有文字正文区域。
    // 3. 这样可以完美保留 projectXtls 等频道中带有小表情的文字消息。
    GM_addStyle(`
        /* 屏蔽官方标记为纯表情包的气泡。
           实测 Web K 的贴纸气泡类名是 .sticker / .sticker-animated（不是 .is-sticker） */
        .bubble.sticker,
        .bubble.sticker-animated,
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
        /* 实测修复：TGS 动态贴纸渲染为 .media-sticker-wrapper 内的 canvas.lottie */
        .bubble.is-message-empty:has(.media-sticker-wrapper),
        .bubble.is-message-empty:has(canvas.lottie),
        /* 修复漏杀：GIF 动图（用户自建/收藏的动图）使用的是 media-gif 而非 media-sticker */
        .bubble:not(:has(.message)):has(video.media-gif),
        .bubble:not(:has(.message)):has(.media-gif),
        .bubble.is-message-empty:has(video.media-gif),
        .bubble.is-message-empty:has(.media-gif) {
            display: none !important;
        }

        /* 保护补丁：含文字 / 图片 / 视频 / 文件的气泡绝对显示。
           关键：特异性高于隐藏规则，且位于隐藏规则之后 ——
           这样可防“无文字图片消息引用了贴纸”时，引用缩略图中的 media-sticker 误伤图片本体。
           注意必须排除 .sticker：贴纸气泡内的 .attachment 元素会命中本补丁 */
        .bubble:not(.is-sticker):not(.sticker):has(.message),
        .bubble:not(.is-sticker):not(.sticker):has(.media-photo),
        .bubble:not(.is-sticker):not(.sticker):has(video.media-video),
        .bubble:not(.is-sticker):not(.sticker):has(.media-document),
        .bubble:not(.is-sticker):not(.sticker):has(.attachment) {
            display: flex !important;
        }

        /* 屏蔽“纯 emoji 放大”消息：整条消息只有 emoji、无文字，被放大显示。
           Web K 真实类名是 emoji-big（tweb 源码 messageRender.ts 实证，is-emoji 不存在）。
           注意：必须放在保护补丁之后 —— 此类气泡含 .message，保护补丁会命中，
           特异性同为 (0,4,0) 时靠后的规则生效。
           如想保留纯 emoji 消息，删除本规则块即可 */
        .bubble.emoji-big:has(.message):not(.sticker) {
            display: none !important;
        }

        /* 说明：骰子/飞镖/老虎机（data-dice 属性）复用贴纸渲染管线，会被上面规则一并屏蔽。
           这是预期行为 —— 如需保留骰子，在此追加 .bubble.bubble[data-dice] { display: flex !important; } */
    `);
})();
