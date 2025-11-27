<template>
  <view v-if="props.content">
    <up-read-more v-if="props.canExpand" :toggle="true" showHeight="600" :shadowStyle="shadowStyle">
      <mp-html :content="props.content" :tag-style="tagStyles" :markdown="true" />
    </up-read-more>
    <mp-html v-else :content="props.content" :tag-style="tagStyles" :markdown="true" />
  </view>
  <view v-else>无数据</view>
</template>
<script setup lang="ts">
//@ts-ignore
import mpHtml from 'mp-html/dist/uni-app/components/mp-html/mp-html'

const props = defineProps<{
  content: string
  canExpand?: boolean
}>()

const shadowStyle = {  
  backgroundImage: "none",  
  paddingTop: "0",  
  marginTop: "0"  
} 
const tagStyles = {
  hr: `
    border: none;
    margin: 10px 0;
    height: 1px;
    background: #ddd;
  `,
  h3: `
    text-indent: 0px;
  `,
  li: `
    margin: 0px;
    padding: 0px;
    text-indent: -4px;
  `,
  
  // 表格容器 - 启用横向滚动
  table: `
    padding: 0; 
    margin: 8px 0; 
    border-collapse: collapse; 
    border-spacing: 0; 
    min-width: 100%; 
    display: block; 
    overflow-x: auto;
    table-layout: auto;
  `,
  
  // 表格行
  tr: `
    padding: 0; 
    margin: 0;
  `,
  
  // 表头单元格 - 基于字符数控制换行
  th: `
    padding: 0; 
    margin: 0; 
    border: 1px solid #ddd;
    background-color: #f5f5f5;
    font-weight: bold;
    white-space: nowrap;
  `,
  
  // 数据单元格 - 基于字符数控制换行
  td: `
    padding: 0; 
    margin: 0; 
    border: 1px solid #ddd;
    white-space: nowrap;
    overflow: hidden;
  `,
  
  // 其他表格相关元素
  caption: 'padding: 0; margin: 0;',
  thead: 'padding: 0; margin: 0;',
  tbody: 'padding: 0; margin: 0;',
  tfoot: 'padding: 0; margin: 0;',
}
</script>
<style scoped lang="scss">
</style>