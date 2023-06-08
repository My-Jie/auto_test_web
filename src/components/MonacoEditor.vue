<template>
    <div ref="main" style="width: 100%; height: 600px;"></div>
</template>
   
<script>
import * as monaco from "monaco-editor";

export default {
    name: "MyMonaco",
    data() {
        return {
            monacoEditor: null,
        };
    },
    mounted() {
        this.init();
    },
    methods: {
        init() {
            // 使用 - 创建 monacoEditor 对象
            this.monacoEditor = monaco.editor.create(this.$refs.main, {
                theme: "vs-dark", // 主题
                value: "print('hello tester')", // 默认显示的值
                language: "python",
                folding: true, // 是否折叠
                foldingHighlight: true, // 折叠等高线
                foldingStrategy: "indentation", // 折叠方式  auto | indentation
                showFoldingControls: "always", // 是否一直显示折叠 always | mouseover
                disableLayerHinting: true, // 等宽优化
                emptySelectionClipboard: false, // 空选择剪切板
                selectionClipboard: false, // 选择剪切板
                automaticLayout: true, // 自动布局
                codeLens: false, // 代码镜头
                scrollBeyondLastLine: false, // 滚动完最后一行后再滚动一屏幕
                colorDecorators: true, // 颜色装饰器
                accessibilitySupport: "off", // 辅助功能支持  "auto" | "off" | "on"
                lineNumbers: "on", // 行号 取值： "on" | "off" | "relative" | "interval" | function
                lineNumbersMinChars: 5, // 行号最小字符   number
                enableSplitViewResizing: false,
                readOnly: false, //是否只读  取值 true | false
            });
        },
    },
};
</script>
   
<style lang="scss" scoped></style>